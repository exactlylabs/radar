package tsdbstorage

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/ports"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
	"github.com/jackc/pgx/v4"
	_ "github.com/lib/pq"
)

var materializedViews = []string{
	"summary",
	"summary_year",
	"summary_half_year",
	"summary_month",
	"summary_week",
}

type TimescaleDBStorage struct {
	dsn               string
	db                *pgx.Conn
	wg                *sync.WaitGroup
	geospaces         sync.Map
	asns              sync.Map
	started           bool
	lock              *sync.Mutex
	nWorkers          int
	copyCh            chan ports.MeasurementIterator
	shouldUpdateViews bool
}

func New(dsn string, nWorkers int, updateViews bool) ports.MeasurementsStorage {
	wg := &sync.WaitGroup{}
	s := &TimescaleDBStorage{
		dsn:               dsn,
		wg:                wg,
		geospaces:         sync.Map{},
		asns:              sync.Map{},
		lock:              &sync.Mutex{},
		nWorkers:          nWorkers,
		copyCh:            make(chan ports.MeasurementIterator),
		shouldUpdateViews: updateViews,
	}

	return s
}

func (ts *TimescaleDBStorage) Begin() error {
	db, err := pgx.Connect(context.Background(), ts.dsn)
	// db, err := sql.Open("postgres", dsn)
	if err != nil {
		panic(errors.Wrap(err, "unable to connect to db"))
	}
	ts.db = db
	ts.started = true
	if err := ts.loadGeospaces(); err != nil {
		return err
	}
	if err := ts.loadASNs(); err != nil {
		return err
	}
	for i := 0; i < ts.nWorkers; i++ {
		ts.wg.Add(1)
		go func() {
			defer ts.wg.Done()
			ts.copyWorker()
		}()
	}
	return nil
}

func (ts *TimescaleDBStorage) copyWorker() {
	columns := []string{
		"id", "test_style", "ip", "time", "upload", "mbps", "loss_rate", "min_rtt",
		"latitude", "longitude", "location_accuracy_km", "asn_id",
		"has_access_token", "access_token_sig", "geospace_id",
	}
	for it := range ts.copyCh {
		err := ts.copyInsert2("measurements", columns, it)
		if err != nil {
			panic(err)
		}
	}
}

func (ts *TimescaleDBStorage) loadASNs() error {
	rows, err := ts.db.Query(context.Background(), `SELECT id, asn, organization FROM asns;`)
	if err != nil {
		return errors.Wrap(err, "TimescaleDBStorage#loadASNs Query")
	}

	for rows.Next() {
		var organization string
		var asn, id int64
		if err := rows.Scan(&id, &asn, &organization); err != nil {
			return errors.Wrap(err, "TimescaleDBStorage#loadASNs Scan")
		}
		ts.asns.Store(fmt.Sprintf("%d%s", asn, organization), id)
	}
	return nil
}

func (ts *TimescaleDBStorage) loadGeospaces() error {
	rows, err := ts.db.Query(context.Background(), `SELECT id, geo_namespace, geo_id, name, parent_id FROM geospaces;`)
	if err != nil {
		return errors.Wrap(err, "TimescaleDBStorage#loadGeospaces Query")
	}

	for rows.Next() {
		g := &ports.Geospace{}
		var id int64
		var parentId *int64
		if err := rows.Scan(&id, &g.Namespace, &g.GeoId, &g.Name, &parentId); err != nil {
			return errors.Wrap(err, "TimescaleDBStorage#loadGeospaces Scan")
		}
		g.Id = fmt.Sprintf("%d", id)
		if parentId != nil {
			p := fmt.Sprintf("%d", parentId)
			g.ParentId = &p
		}

		ts.geospaces.Store(g.Namespace+g.GeoId, g)
	}
	return nil
}

// mountParametrizedArgs mounts the parametrized query arguments
// based on the number of columns and rows to be inserted.
// The expected output is ($1, $2, ... $nColumns), ... ($n-nColumns, $n - nColumns+1, ... $n),
// where n is nRows * nColumns
func (ts *TimescaleDBStorage) mountParametrizedArgs(nColumns, nRows int) string {
	argsStr := make([]string, nRows)
	for i := 0; i < nRows; i++ {
		params := make([]string, nColumns)
		for j := 0; j < nColumns; j++ {
			params[j] = fmt.Sprintf("$%d", i*nColumns+(j+1))
		}
		argsStr[i] = fmt.Sprintf("(%s)", strings.Join(params, ","))
	}
	return strings.Join(argsStr, ",")
}

func (ts *TimescaleDBStorage) getOrCreateGeospace(g *ports.Geospace) (int64, error) {
	ts.lock.Lock()
	defer ts.lock.Unlock()
	var id int64
	if gRaw, exists := ts.geospaces.Load(g.Namespace + g.GeoId); exists {
		g := gRaw.(*ports.Geospace)
		id, _ = strconv.ParseInt(g.Id, 10, 64)
		return id, nil
	}
	query := `
	WITH e AS (
		INSERT INTO geospaces(geo_namespace, geo_id, name, parent_id)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (geo_namespace, geo_id)
			DO UPDATE SET name=$3, parent_id=$4
		RETURNING id
	) SELECT * FROM E
	UNION SELECT id FROM geospaces WHERE geo_namespace=$1 AND geo_id=$2 AND name=$3 AND parent_id=$4;
	`

	row := ts.db.QueryRow(context.Background(), query, g.Namespace, g.GeoId, g.Name, g.ParentId)
	if err := row.Scan(&id); err != nil {
		return 0, errors.Wrap(err, "TimescaleDBStorage#getOrCreateGeospace Scan")
	}
	g.Id = fmt.Sprintf("%d", id)
	ts.geospaces.Store(g.Namespace+g.GeoId, g)
	return id, nil
}

func (ts *TimescaleDBStorage) getOrCreateASN(asn int, orgName string) (int64, error) {
	ts.lock.Lock()
	defer ts.lock.Unlock()
	var id int64
	key := fmt.Sprintf("%d%s", asn, orgName)
	if id, exists := ts.asns.Load(key); exists {
		return id.(int64), nil
	}
	query := `
	WITH e AS (
		INSERT INTO asns(asn, organization)
		VALUES ($1, $2)
		ON CONFLICT (asn, organization) DO NOTHING
		RETURNING id
	) SELECT * FROM E
	UNION SELECT id FROM asns WHERE asn=$1 AND organization=$2;
	`

	row := ts.db.QueryRow(context.Background(), query, asn, orgName)
	if err := row.Scan(&id); err != nil {
		return 0, errors.Wrap(err, "TimescaleDBStorage#getOrCreateGeospace Scan")
	}
	ts.asns.Store(key, id)
	return id, nil
}

// bulkInsert splits the values argument into nRows, based on the size of the columns for each row,
// and insert those rows in a single insert.
func (ts *TimescaleDBStorage) bulkInsert(table string, columns []string, values []interface{}) error {
	nRows := len(values) / len(columns)
	// Generate the parametrized arguments for the query, to avoid sql injections
	paramArgs := ts.mountParametrizedArgs(len(columns), nRows)

	// Mount SQL and execute it
	chunkSql := fmt.Sprintf(
		"INSERT INTO %s (%s) VALUES %s",
		table, strings.Join(columns, ","), paramArgs,
	)
	_, err := ts.db.Exec(context.Background(), chunkSql, values...)
	if err != nil {
		return err
	}
	return nil
}

func (ts *TimescaleDBStorage) copyInsert2(table string, columns []string, it ports.MeasurementIterator) error {
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, ts.dsn)
	if err != nil {
		return err
	}
	_, err = conn.Exec(ctx, "SET session_replication_role=replica")
	if err != nil {
		return errors.Wrap(err, "TimescaleDBStorage#copyInsert2 Exec")
	}
	c := &copyStruct{it: it, ts: ts}
	_, err = conn.CopyFrom(ctx, pgx.Identifier{table}, columns, c)
	if err != nil {
		return errors.Wrap(err, "TimescaleDBStorage#copyInsert2 CopyFrom")
	}
	return nil
}

func (ts *TimescaleDBStorage) copyInsert(table string, columns []string, it ports.MeasurementIterator) error {
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, ts.dsn)
	if err != nil {
		return err
	}
	rows := [][]interface{}{}
	for m, err := it.Next(); m != nil || err != nil; m, err = it.Next() {
		geoId, err := ts.getOrCreateGeospace(&ports.Geospace{Namespace: m.GeoNamespace, GeoId: m.GeoId})
		if err != nil {
			return errors.Wrap(err, "TimescaleDBStorage#InsertMeasurements getOrCreateGeospace")
		}
		asnId, err := ts.getOrCreateASN(m.ASN, m.ASNOrg)
		if err != nil {
			return errors.Wrap(err, "TimescaleDBStorage#InsertMeasurements getOrCreateASN")
		}
		values := []interface{}{
			m.Id, m.TestStyle, m.IP, time.Unix(m.StartedAt, 0), m.Upload, m.MBPS,
			m.LossRate, m.MinRTT, m.Latitude, m.Longitude,
			m.LocationAccuracyKM, asnId, m.HasAccessToken,
			m.AccessTokenSig, geoId,
		}
		rows = append(rows, values)
		if len(rows) > 65536 { // pgxpool does internally a buffer of this size
			log.Println("Starting Copy")
			n, err := conn.CopyFrom(context.Background(), pgx.Identifier{table}, columns, pgx.CopyFromRows(rows))
			if err != nil {
				return err
			}
			log.Printf("Copy inserted %v values\n", n)
			rows = rows[:0]
		}
	}

	return nil
}

// Insert measurements data into the DB from an io.Reader
func (ts *TimescaleDBStorage) InsertMeasurements(it ports.MeasurementIterator) error {
	ts.copyCh <- it
	return nil
}

func (ts *TimescaleDBStorage) LastMeasurementDate() (*time.Time, error) {
	query := `SELECT time FROM measurements ORDER BY time DESC LIMIT 1`
	row := ts.db.QueryRow(context.Background(), query)
	var t *time.Time
	err := row.Scan(&t)
	if err != nil && err == pgx.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, errors.Wrap(err, "TimescaleDBStorage#LastMeasurementDate Scan")
	}
	return t, nil
}

func (ts *TimescaleDBStorage) SaveGeospace(g *ports.Geospace) error {
	id, err := ts.getOrCreateGeospace(g)
	if err != nil {
		return errors.Wrap(err, "TimescaleDBStorage#SaveGeospace")
	}
	g.Id = fmt.Sprintf("%d", id)
	return nil
}

func (ts *TimescaleDBStorage) GetGeospaceByGeoId(namespace, geoId string) (*ports.Geospace, error) {
	if g, exists := ts.geospaces.Load(namespace + geoId); exists {
		return g.(*ports.Geospace), nil
	}
	query := `SELECT 
		id, geo_namespace, geo_id, name, parent_id 
	FROM geospaces
	WHERE geo_namespace=$1 AND geo_id=$2`
	row := ts.db.QueryRow(context.Background(), query, namespace, geoId)
	g := &ports.Geospace{}
	if err := row.Scan(&g.Id, &g.Namespace, &g.GeoId, &g.Name, &g.ParentId); err == pgx.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, errors.Wrap(err, "TimescaleDBStorage#GetGeospaceByGeoId Scan")
	}
	return g, nil
}

func (ts *TimescaleDBStorage) updateViews() error {

	for _, name := range materializedViews {
		log.Println("updating materialized view", name)
		_, err := ts.db.Exec(context.Background(), fmt.Sprintf("CALL refresh_continuous_aggregate(%s, NULL, NULL)", name))
		if err != nil {
			return errors.Wrap(err, "TimescaleDBStorage#updateViews Exec")
		}
	}
	return nil
}

func (ts *TimescaleDBStorage) Close() error {
	close(ts.copyCh)
	ts.wg.Wait()
	if ts.shouldUpdateViews {
		ts.updateViews()
	}
	ts.started = false
	return nil
}
