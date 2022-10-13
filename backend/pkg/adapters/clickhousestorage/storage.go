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

type ChStorageOptions struct {
	Username string
	Password string
	Host     string
	Port     int
	DBName   string
	NWorkers int
	// UpdateViews, when true is going to recreate all materialized views when Close is called
	// Defaults to false
	UpdateViews bool
	// SwapTempTable makes the ingestor first swap current measurements table
	// into a temporary one and when Closed is called, it swaps it back.
	// This options is useful due to a problem with clickhouse where when we insert more data,
	// the views get messed up because it tries to auto update them, but ends up failing because of our double aggregation.
	// Defaults to false
	SwapTempTable bool
	// TruncateFirst will drop the whole data before ingesting.
	// If UseTempTable is also set, the truncate will be executed in the temporary table, not the original.
	TruncateFirst bool
}

type clickhouseStorage struct {
	conn              driver.Conn
	opts              *clickhouse.Options
	geospaces         map[string]*ports.Geospace
	asnOrgs           map[string]string
	jobCh             chan ports.MeasurementIterator
	wg                *sync.WaitGroup
	lock              *sync.Mutex
	nWorkers          int
	shouldUpdateViews bool
	swap              bool
	truncate          bool
	started           bool
}

func New(options *ChStorageOptions) ports.MeasurementsStorage {
	return &clickhouseStorage{
		opts: &clickhouse.Options{
			Auth: clickhouse.Auth{
				Database: options.DBName,
				Username: options.Username,
				Password: options.Password,
			},
			Addr:         []string{fmt.Sprintf("%s:%d", options.Host, options.Port)},
			MaxOpenConns: options.NWorkers + 5,
			ReadTimeout:  time.Hour,
		},
		geospaces:         make(map[string]*ports.Geospace),
		asnOrgs:           make(map[string]string),
		wg:                &sync.WaitGroup{},
		lock:              &sync.Mutex{},
		nWorkers:          options.NWorkers,
		shouldUpdateViews: options.UpdateViews,
		swap:              options.SwapTempTable,
		truncate:          options.TruncateFirst,
	}
}

// Begin implements ports.MeasurementsStorage
func (cs *clickhouseStorage) Begin() error {
	if cs.started {
		return nil
	}
	cs.jobCh = make(chan ports.MeasurementIterator)
	conn, err := clickhouse.Open(cs.opts)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#Begin Open")
	}
	cs.conn = conn
	if err := cs.loadCache(); err != nil {
		return errors.Wrap(err, "clickhouseStorage#Begin loadCache")
	}
	if cs.swap {
		err := cs.swapToTempTable()
		if err != nil {
			return errors.Wrap(err, "clickhouseStorage#Begin swapToTempTable")
		}
	}
	if cs.truncate {
		err := cs.truncateMeasurements()
		if err != nil {
			return errors.Wrap(err, "clickhouseStorage#Begin truncateMeasurements")
		}
	}
	for i := 0; i < cs.nWorkers; i++ {
		cs.wg.Add(1)
		go func() {
			defer cs.wg.Done()
			cs.storeWorker()
		}()
	}
	cs.started = true
	return nil
}

func (cs *clickhouseStorage) storeWorker() {
	for it := range cs.jobCh {
		batch, err := cs.prepareBatch()
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
	if cs.swap {
		if err := cs.swapTempTableBack(); err != nil {
			return errors.Wrap(err, "clickhouseStorage#Close swapTempTableBack")
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

func (cs *clickhouseStorage) measurementsTableName() string {
	if cs.swap {
		return "measurements_tmp"
	}
	return "measurements"
}

func (cs *clickhouseStorage) truncateMeasurements() error {
	err := cs.conn.Exec(context.Background(), fmt.Sprintf(`TRUNCATE %s`, cs.measurementsTableName()))
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#truncateMeasurements Exec")
	}
	return nil
}

func (cs *clickhouseStorage) swapToTempTable() error {
	err := cs.conn.Exec(context.Background(), `DROP TABLE measurements_tmp`)
	if err != nil {
		log.Println(errors.Wrap(err, "clickhouseStorage#swapToTempTable Exec"))
	}
	err = cs.conn.Exec(context.Background(), `CREATE TABLE measurements_tmp AS measurements`)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#swapToTempTable Exec")
	}
	err = cs.conn.Exec(context.Background(), `EXCHANGE TABLES measurements AND measurements_tmp`)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#swapToTempTable Exec")
	}
	return nil
}

func (cs *clickhouseStorage) swapTempTableBack() error {
	err := cs.conn.Exec(context.Background(), `EXCHANGE TABLES measurements_tmp AND measurements`)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#swapTempTableBack Exec")
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
	// Load Geospaces
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
	// Load ASN Organizations
	query = `SELECT id, name FROM asn_orgs`
	rows, err = cs.conn.Query(context.Background(), query)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#loadCache Query")
	}
	defer rows.Close()
	for rows.Next() {
		var id, name string
		if err := rows.Scan(&id, &name); err != nil {
			return errors.Wrap(err, "clickhouseStorage#loadCache Scan")
		}
		cs.asnOrgs[name] = id
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

func (cs *clickhouseStorage) updateOrCreateGeospace(g *ports.Geospace) (*ports.Geospace, error) {
	cs.lock.Lock()
	defer cs.lock.Unlock()
	existing, err := cs.GetGeospaceByGeoId(g.Namespace, g.GeoId)
	if err != nil && err != sql.ErrNoRows {
		return nil, errors.Wrap(err, "clickhouseStorage#updateOrCreateGeospace GetGeospaceByGeoId")
	}
	if existing == nil {
		if err := cs.createGeospace(g); err != nil {
			return nil, errors.Wrap(err, "clickhouseStorage#updateOrCreateGeospace createGeospace")
		}
	} else {
		g.Id = existing.Id
		if err := cs.updateGeospace(g); err != nil {
			return nil, errors.Wrap(err, "clickhouseStorage#updateOrCreateGeospace updateGeospace")
		}
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
		`INSERT INTO geospaces (id, name, namespace, geo_id, parent_id, centroid_lat, centroid_long) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		id, *name, g.Namespace, g.GeoId, *parent, g.Centroid[0], g.Centroid[1],
	)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#createGeospace Exec")
	}
	g.Id = id.String()
	return nil
}

func (cs *clickhouseStorage) updateGeospace(g *ports.Geospace) error {
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
		`ALTER TABLE geospaces UPDATE name=$1, parent_id=$2, centroid_lat=$3, centroid_long=$4 WHERE id=$5`, *name, *parent, g.Centroid[0], g.Centroid[1], g.Id,
	)
	if err != nil {
		return errors.Wrap(err, "clickhouseStorage#updateGeospace Exec")
	}
	return nil
}

func (cs *clickhouseStorage) getOrCreateASNOrg(orgName string) (string, error) {
	cs.lock.Lock()
	defer cs.lock.Unlock()
	key := orgName
	if a, exists := cs.asnOrgs[key]; exists {
		return a, nil
	}
	query := `SELECT id from asn_orgs WHERE name=$1`
	args := []any{orgName}
	row := cs.conn.QueryRow(context.Background(), query, args...)
	if row.Err() != nil {
		return "", errors.Wrap(row.Err(), "clickhouseStorage#getOrCreateASNOrg QueryRow")
	}
	var id uuid.UUID
	if err := row.Scan(&id); err != nil && err != sql.ErrNoRows {
		return "", errors.Wrap(err, "clickhouseStorage#getOrCreateASNOrg Scan")
	} else if err == sql.ErrNoRows {
		id = uuid.New()
		query = `INSERT INTO asn_orgs(id, name) VALUES ($1, $2)`
		err = cs.conn.Exec(context.Background(), query, id, orgName)
		if err != nil {
			return "", errors.Wrap(err, "clickhouseStorage#getOrCreateASN Exec")
		}
	}
	cs.asnOrgs[key] = id.String()
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
		asnOrgId, err := cs.getOrCreateASNOrg(m.ASNOrg)
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
			m.HasAccessToken, m.AccessTokenSig, asnOrgId, geospace.Id,
		)
		if err != nil {
			return errors.Wrap(err, "clickhouseStorage#InsertMeasurements Append")
		}
		if math.Mod(float64(i), 100_000) == 0 {
			if err := batch.Send(); err != nil {
				return errors.Wrap(err, "clickhouseStorage#InsertMeasurements Send")
			}
			batch, err = cs.prepareBatch()
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

func (cs *clickhouseStorage) prepareBatch() (driver.Batch, error) {
	tableName := cs.measurementsTableName()
	query := fmt.Sprintf(`INSERT INTO %s (
		id, test_style, ip, time, upload, mbps, loss_rate, min_rtt, latitude,
		longitude, location_accuracy_km, has_access_token, access_token_sig, asn_org_id, geospace_id
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
		fmt.Sprintf(`SELECT time FROM %s ORDER BY time DESC LIMIT 1`, cs.measurementsTableName()),
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
	if _, err := cs.updateOrCreateGeospace(g); err != nil {
		return errors.Wrap(err, "clickhouseStorage#SaveGeospace updateOrCreateGeospace")
	}
	return nil
}
