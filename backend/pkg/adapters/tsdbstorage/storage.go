package tsdbstorage

import (
	"context"
	"database/sql"
	"fmt"
	"log"
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
	dsn       string
	db        *sql.DB
	wg        *sync.WaitGroup
	geospaces map[string]*ports.Geospace
	asns      map[string]int64
	started   bool
	l         *sync.Mutex
}

func New(dsn string) ports.MeasurementsStorage {
	wg := &sync.WaitGroup{}
	s := &TimescaleDBStorage{
		dsn:       dsn,
		wg:        wg,
		geospaces: make(map[string]*ports.Geospace),
		asns:      make(map[string]int64),
		l:         &sync.Mutex{},
	}
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		panic(errors.Wrap(err, "unable to connect to db"))
	}
	s.db = db
	return s
}

func (ts *TimescaleDBStorage) Begin() error {
	ts.started = true

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
	var id int64
	if g, exists := ts.geospaces[g.Namespace+g.GeoId]; exists {
		return g.Id, nil
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
	ts.l.Lock()
	row := ts.db.QueryRow(query, g.Namespace, g.GeoId, g.Name, g.ParentId)
	if err := row.Scan(&id); err != nil {
		return 0, errors.Wrap(err, "TimescaleDBStorage#getOrCreateGeospace Scan")
	}
	g.Id = id
	ts.geospaces[g.Namespace+g.GeoId] = g
	ts.l.Unlock()
	return id, nil
}

func (ts *TimescaleDBStorage) getOrCreateASN(asn int, orgName string) (int64, error) {
	var id int64
	key := fmt.Sprintf("%d%s", asn, orgName)
	if id, exists := ts.asns[key]; exists {
		return id, nil
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
	ts.l.Lock()
	row := ts.db.QueryRow(query, asn, orgName)
	if err := row.Scan(&id); err != nil {
		return 0, errors.Wrap(err, "TimescaleDBStorage#getOrCreateGeospace Scan")
	}
	ts.asns[key] = id
	ts.l.Unlock()
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
	_, err := ts.db.Exec(chunkSql, values...)
	if err != nil {
		return err
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
	columns := []string{
		"id", "test_style", "ip", "time", "upload", "mbps", "loss_rate", "min_rtt",
		"latitude", "longitude", "location_accuracy_km", "asn_id",
		"has_access_token", "access_token_sig", "geospace_id",
	}

	if err := ts.copyInsert("measurements", columns, it); err != nil {
		panic(err)
	}
	return nil
}

func (ts *TimescaleDBStorage) LastMeasurementDate() (*time.Time, error) {
	query := `SELECT time FROM measurements ORDER BY time DESC LIMIT 1`
	row := ts.db.QueryRow(query)
	var t *time.Time
	err := row.Scan(&t)
	if err != nil && err == sql.ErrNoRows {
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
	g.Id = id
	return nil
}

func (ts *TimescaleDBStorage) GetGeospaceByGeoId(namespace, geoId string) (*ports.Geospace, error) {
	if g, exists := ts.geospaces[namespace+geoId]; exists {
		return g, nil
	}
	query := `SELECT 
		id, geo_namespace, geo_id, name, parent_id 
	FROM geospaces
	WHERE geo_namespace=$1 AND geo_id=$2`
	row := ts.db.QueryRow(query, namespace, geoId)
	if row.Err() != nil {
		return nil, errors.Wrap(row.Err(), "TimescaleDBStorage#GetGeospaceByGeoId QueryRow")
	}
	g := &ports.Geospace{}
	if err := row.Scan(&g.Id, &g.Namespace, &g.GeoId, &g.Name, &g.ParentId); err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, errors.Wrap(err, "TimescaleDBStorage#GetGeospaceByGeoId Scan")
	}
	return g, nil
}

func (ts *TimescaleDBStorage) updateViews() error {

	for _, name := range materializedViews {
		log.Println("updating materialized view", name)
		_, err := ts.db.Exec(fmt.Sprintf("CALL refresh_continuous_aggregate(%s, NULL, NULL)", name))
		if err != nil {
			return errors.Wrap(err, "TimescaleDBStorage#updateViews Exec")
		}
	}
	return nil
}

func (ts *TimescaleDBStorage) Close() error {
	ts.wg.Wait()
	ts.updateViews()
	ts.started = false
	return nil
}
