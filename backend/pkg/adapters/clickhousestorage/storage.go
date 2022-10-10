package clickhousestorage

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"math"
	"sync"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorage/views"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/ports"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
	"github.com/google/uuid"
)

type clickhouseStorage struct {
	conn              driver.Conn
	opts              *clickhouse.Options
	geospaces         map[string]*ports.Geospace
	asns              map[string]string
	jobCh             chan ports.MeasurementIterator
	wg                *sync.WaitGroup
	lock              *sync.Mutex
	nWorkers          int
	shouldUpdateViews bool
	useTempTable      bool
}

func New(opts *clickhouse.Options, nWorkers int, updateViews bool, useTempTable bool) ports.MeasurementsStorage {
	return &clickhouseStorage{
		opts:              opts,
		geospaces:         make(map[string]*ports.Geospace),
		asns:              make(map[string]string),
		wg:                &sync.WaitGroup{},
		lock:              &sync.Mutex{},
		nWorkers:          nWorkers,
		shouldUpdateViews: updateViews,
		// Instead of inserting into the main table, we insert into a temporary table and then swap back
		useTempTable: useTempTable,
	}
}

// Begin implements ports.MeasurementsStorage
func (cs *clickhouseStorage) Begin() error {
	cs.jobCh = make(chan ports.MeasurementIterator)
	conn, err := clickhouse.Open(cs.opts)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#Begin Open")
	}
	cs.conn = conn
	if err := cs.loadCache(); err != nil {
		return errors.Wrap(err, "clickhouseStorage#Begin loadCache")
	}
	if cs.useTempTable {
		err := cs.createTempTable()
		if err != nil {
			return errors.Wrap(err, "clickhouseStorage#Begin createTempTable")
		}
	}
	for i := 0; i < cs.nWorkers; i++ {
		cs.wg.Add(1)
		go func() {
			defer cs.wg.Done()
			cs.storeWorker()
		}()
	}
	return nil
}

func (cs *clickhouseStorage) storeWorker() {
	for it := range cs.jobCh {
		batch, err := cs.prepareBatch(cs.useTempTable)
		if err != nil {
			panic(errors.Wrap(err, "clickhouseStorage#storeWorker prepareBatch"))
		}
		err = cs.insertInBatch(batch, it)
		if err != nil {
			panic(errors.Wrap(err, "clickhouseStorage#storeWorker insertInBatch"))
		}
	}
}

// Close implements ports.MeasurementsStorage
func (cs *clickhouseStorage) Close() error {
	close(cs.jobCh)
	cs.wg.Wait()
	if cs.useTempTable {
		if err := cs.swapTempTable(); err != nil {
			return errors.Wrap(err, "clickhouseStorage#Close swapTempTable")
		}
	}
	if cs.shouldUpdateViews {
		cs.updateViews()
	}
	if err := cs.conn.Close(); err != nil {
		return errors.Wrap(err, "clickhouseStorage#Close Close")
	}
	return nil
}

func (cs *clickhouseStorage) createTempTable() error {
	err := cs.conn.Exec(context.Background(), `DROP TABLE measurements_tmp`)
	if err != nil {
		log.Println(errors.Wrap(err, "clickhouseStorage#createTempTable Exec"))
	}
	err = cs.conn.Exec(context.Background(), `CREATE TABLE measurements_tmp AS measurements`)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#createTempTable Exec")
	}
	err = cs.conn.Exec(context.Background(), `EXCHANGE TABLES measurements AND measurements_tmp`)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#createTempTable Exec")
	}
	return nil
}

func (cs *clickhouseStorage) swapTempTable() error {
	err := cs.conn.Exec(context.Background(), `EXCHANGE TABLES measurements_tmp AND measurements`)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#swapTempTable Exec")
	}
	return nil
}

func (cs *clickhouseStorage) updateViews() {
	log.Println("clickhouseStorage#updateViews Starting Updating Views")
	for name, query := range views.MaterializedViews {
		tmpName := name + "_tmp"
		if err := cs.conn.Exec(context.Background(), fmt.Sprintf("DROP VIEW %s", tmpName)); err != nil {
			log.Println(errors.Wrap(err, "clickhouseStorage#updateViews Exec Drop"))
		}
		if err := cs.conn.Exec(context.Background(), query); err != nil {
			log.Println(errors.Wrap(err, "clickhouseStorage#updateViews Exec View"))
		}
		log.Println("Created View", tmpName)
		// Exchange the names
		if err := cs.conn.Exec(context.Background(), fmt.Sprintf("EXCHANGE TABLES %s AND %s", tmpName, name)); err != nil {
			log.Println(errors.Wrap(err, "clickhouseStorage#updateViews Exec Exchange"))
			log.Println("Trying to rename instead")
			if err := cs.conn.Exec(context.Background(), fmt.Sprintf("RENAME TABLE %s TO %s", tmpName, name)); err != nil {
				log.Println(errors.Wrap(err, "clickhouseStorage#updateViews Exec Rename"))
			}
		}
		log.Println("Renamed to View", name)
	}
	log.Println("Finished updating views")
}

func (cs *clickhouseStorage) loadCache() error {
	query := `SELECT id, name, namespace, geo_id, parent_id FROM geospaces;`
	rows, err := cs.conn.Query(context.Background(), query)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#loadCache Query")
	}
	defer rows.Close()

	for rows.Next() {
		g := &ports.Geospace{}
		if err := rows.Scan(&g.Id, &g.Name, &g.Namespace, &g.GeoId, &g.ParentId); err != nil {
			return errors.Wrap(err, "clickhouseStorage#loadCache Scan")
		}
		cs.geospaces[g.Namespace+g.GeoId] = g
	}
	query = `SELECT id, asn, organization FROM asns;`
	rows, err = cs.conn.Query(context.Background(), query)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#loadCache Query")
	}
	defer rows.Close()
	for rows.Next() {
		var id, organization string
		var asn int32
		if err := rows.Scan(&id, &asn, &organization); err != nil {
			return errors.Wrap(err, "clickhouseStorage#loadCache Scan")
		}
		cs.asns[fmt.Sprintf("%d%s", asn, organization)] = id
	}
	return nil
}

// GetGeospaceByGeoId implements ports.MeasurementsStorage
func (cs *clickhouseStorage) GetGeospaceByGeoId(namespace string, geoId string) (*ports.Geospace, error) {
	if g, exists := cs.geospaces[namespace+geoId]; exists {
		return g, nil
	}
	query := `SELECT 
		id, namespace, geo_id, name, parent_id
		FROM geospaces
		WHERE namespace=$1 AND geo_id=$2
	`
	row := cs.conn.QueryRow(context.Background(), query, namespace, geoId)
	if row.Err() != nil {
		return nil, errors.Wrap(row.Err(), "clickhouseStorage#GetGeospaceByGeoId QueryRow")
	}
	g := &ports.Geospace{}
	if err := row.Scan(&g.Id, &g.Namespace, &g.GeoId, &g.Name, &g.ParentId); err != nil && err != sql.ErrNoRows {
		return nil, errors.Wrap(err, "clickhouseStorage#GetGeospaceByGeoId Scan")
	} else if err == sql.ErrNoRows {
		return nil, err
	}
	cs.geospaces[g.Namespace+g.GeoId] = g
	return g, nil
}

func (cs *clickhouseStorage) getOrCreateGeospace(g *ports.Geospace) (*ports.Geospace, error) {
	cs.lock.Lock()
	defer cs.lock.Unlock()
	existing, err := cs.GetGeospaceByGeoId(g.Namespace, g.GeoId)
	if err != nil && err != sql.ErrNoRows {
		return nil, errors.Wrap(err, "clickhouseStorage#getOrCreateGeospace")
	}
	if existing != nil {
		return existing, nil
	}

	if err := cs.createGeospace(g); err != nil {
		return nil, errors.Wrap(err, "clickhouseStorage#getOrCreateGeospace createGeospace")
	}
	cs.geospaces[g.Namespace+g.GeoId] = g
	return g, nil
}

func (cs *clickhouseStorage) createGeospace(g *ports.Geospace) error {
	id := uuid.New()
	var parent *string = g.ParentId
	var name *string = g.Name
	if parent == nil {
		p := ""
		parent = &p
	}
	if name == nil {
		n := ""
		name = &n
	}

	err := cs.conn.Exec(
		context.Background(),
		`INSERT INTO geospaces (id, name, namespace, geo_id, parent_id) VALUES ($1, $2, $3, $4, $5)`,
		id, *name, g.Namespace, g.GeoId, *parent,
	)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#createGeospace Exec")
	}
	g.Id = id.String()
	return nil
}

func (cs *clickhouseStorage) getOrCreateASN(asn int, orgName string) (string, error) {
	cs.lock.Lock()
	defer cs.lock.Unlock()
	key := fmt.Sprintf("%d%s", asn, orgName)
	if a, exists := cs.asns[key]; exists {
		return a, nil
	}
	query := `SELECT id from asns WHERE asn=$1 AND organization=$2`
	row := cs.conn.QueryRow(context.Background(), query, asn, orgName)
	if row.Err() != nil {
		return "", errors.Wrap(row.Err(), "clickhouseStorage#getOrCreateASN QueryRow")
	}
	var id uuid.UUID
	if err := row.Scan(&id); err != nil && err != sql.ErrNoRows {
		return "", errors.Wrap(err, "clickhouseStorage#getOrCreateASN Scan")
	} else if err == sql.ErrNoRows {
		id = uuid.New()
		query = `INSERT INTO asns(id, asn, organization)
			VALUES ($1, $2, $3)
		`
		err := cs.conn.Exec(context.Background(), query, id, asn, orgName)
		if err != nil {
			return "", errors.Wrap(err, "clickhouseStorage#getOrCreateASN Exec")
		}
	}
	cs.asns[key] = id.String()
	return id.String(), nil
}

func (cs *clickhouseStorage) insertInBatch(batch driver.Batch, it ports.MeasurementIterator) error {
	i := 0
	for m, err := it.Next(); m != nil || err != nil; m, err = it.Next() {
		// Get GeospaceId and ASN Id
		geospace, err := cs.getOrCreateGeospace(
			&ports.Geospace{Namespace: m.GeoNamespace, GeoId: m.GeoId},
		)
		if err != nil {
			return errors.Wrap(err, "clickhouseStorage#InsertMeasurements getOrCreateGeospace")
		}
		asnId, err := cs.getOrCreateASN(
			m.ASN, m.ASNOrg,
		)
		if err != nil {
			return errors.Wrap(err, "clickhouseStorage#InsertMeasurements getOrCreateASN")
		}
		t := time.Unix(m.StartedAt, 0)
		var lossRate *float64
		if m.LossRate != nil {
			l := float64(*m.LossRate)
			lossRate = &l
		}
		var minRTT *float64
		if m.MinRTT != nil {
			m := float64(*m.MinRTT)
			minRTT = &m
		}
		err = batch.Append(
			m.Id, m.TestStyle, m.IP, t.UTC(), m.Upload, float64(m.MBPS),
			lossRate, minRTT, m.Latitude, m.Longitude, m.LocationAccuracyKM,
			m.HasAccessToken, m.AccessTokenSig, asnId, geospace.Id,
		)
		if err != nil {
			return errors.Wrap(err, "clickhouseStorage#InsertMeasurements Append")
		}
		if math.Mod(float64(i), 100_000) == 0 {
			if err := batch.Send(); err != nil {
				return errors.Wrap(err, "clickhouseStorage#InsertMeasurements Send")
			}
			batch, err = cs.prepareBatch(cs.useTempTable)
			if err != nil {
				return errors.Wrap(err, "clickhouseStorage#InsertMeasurements prepareBatch")
			}
		}
		i++
	}
	if math.Mod(float64(i), 100_000) != 0 {
		if err := batch.Send(); err != nil {
			return errors.Wrap(err, "clickhouseStorage#InsertMeasurements Send")
		}
	}
	return nil
}

func (cs *clickhouseStorage) prepareBatch(useTempTable bool) (driver.Batch, error) {
	tableName := "measurements"
	if useTempTable {
		tableName = "measurements_tmp"
	}
	query := fmt.Sprintf(`INSERT INTO %s (
		id, test_style, ip, time, upload, mbps, loss_rate, min_rtt, latitude,
		longitude, location_accuracy_km, has_access_token, access_token_sig, asn_id, geospace_id
	)`, tableName)
	batch, err := cs.conn.PrepareBatch(context.Background(), query)
	if err != nil {
		return nil, errors.Wrap(err, "clickhouseStorage#InsertMeasurements PrepareBatch")
	}
	return batch, nil
}

// InsertMeasurements implements ports.MeasurementsStorage
func (cs *clickhouseStorage) InsertMeasurements(it ports.MeasurementIterator) error {
	cs.jobCh <- it
	return nil
}

// LastMeasurementDate implements ports.MeasurementsStorage
func (cs *clickhouseStorage) LastMeasurementDate() (*time.Time, error) {
	row := cs.conn.QueryRow(
		context.Background(),
		`SELECT time FROM measurements ORDER BY time DESC LIMIT 1`,
	)
	if row.Err() == sql.ErrNoRows {
		return nil, nil
	} else if row.Err() != nil {
		return nil, errors.Wrap(row.Err(), "clickhouseStorage#LastMeasurementDate QueryRow")
	}
	var t time.Time
	if err := row.Scan(&t); err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, errors.Wrap(err, "clickhouseStorage#LastMeasurementDate Scan")
	}
	return &t, nil
}

// SaveGeospace implements ports.MeasurementsStorage
func (cs *clickhouseStorage) SaveGeospace(g *ports.Geospace) error {
	if _, err := cs.getOrCreateGeospace(g); err != nil {
		return errors.Wrap(err, "clickhouseStorage#SaveGeospace getOrCreateGeospace")
	}
	return nil
}
