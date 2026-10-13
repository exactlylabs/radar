package clickhousestorages

import (
	"context"
	"fmt"
	"log"
	"net"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/google/uuid"
)

// measurementStorage writes tests (one row per test, see migrations/004_tests.sql) straight
// into the live table. Summaries are plain tables updated after ingest, so nothing fires on
// insert (the old measurements/measurements_tmp swap is gone: a crash between its two
// exchanges lost the data to the next run's DROP TABLE measurements_tmp).
type measurementStorage struct {
	conn     driver.Conn
	jobCh    chan storages.MeasurementIterator
	wg       *sync.WaitGroup
	nWorkers int
	// insertSlots bounds the batch inserts running at once over all the days.
	insertSlots chan struct{}
	started     bool
	inserted    uint64
	errMu       sync.Mutex
	err         error
	// table inserts go to: tests, or the month copy of a replace.
	table   string
	replace *monthReplace
}

type monthReplace struct {
	month   int // YYYYMM
	days    []string
	staging string
	copied  uint64
}

const testsTable = "tests"

const batchSize = 100_000

const maxInserters = 8

// maxConcurrentInserts bounds the batch inserts of all days together: nWorkers days with
// maxInserters each would be 80 on a 10-core host, which hit the server's limit of
// simultaneous queries (code 202) once the pool allowed it.
const maxConcurrentInserts = 16

// IngestorConnections is the ClickHouse connections an ingestor with nWorkers store workers
// can hold at once: the concurrent batch inserts, and a lookup of geospaces or ASN orgs per
// worker's reader while they run. A pool of nWorkers + 5 timed out acquiring connections
// ("acquire conn timeout") on 2026-10-12 as soon as several days were inserting.
func IngestorConnections(nWorkers int) int {
	inserters := nWorkers
	if inserters > maxInserters {
		inserters = maxInserters
	}
	if nWorkers*inserters > maxConcurrentInserts {
		return maxConcurrentInserts + nWorkers
	}
	return nWorkers * (inserters + 1)
}

func (ms *measurementStorage) ctx() context.Context {
	// ClickHouse 26.3 turned async_insert on by default; batches must be synchronous so that
	// Close means the rows are in the table.
	return clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
		"async_insert": 0,
	}))
}

// Close implements storages.MeasurementStorage
func (ms *measurementStorage) Close() error {
	if !ms.started {
		return nil
	}
	close(ms.jobCh)
	ms.wg.Wait()
	ms.started = false
	ms.errMu.Lock()
	defer ms.errMu.Unlock()
	err := ms.err
	ms.err = nil
	return err
}

func (ms *measurementStorage) Connected() error {
	return wrap(ms.conn.Ping(context.Background()), "measurementStorage#Connected")
}

func (ms *measurementStorage) Inserted() uint64 {
	return atomic.LoadUint64(&ms.inserted)
}

func nullableUUID(id string) (*uuid.UUID, error) {
	if id == "" {
		return nil, nil
	}
	u, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func float32Or0(f *float32) float64 {
	if f == nil {
		return 0
	}
	return float64(*f)
}

// testIP is the address as stored in the IPv6 column (IPv4 mapped to ::ffff:a.b.c.d), :: when
// it doesn't parse (the conversion of the old table does the same).
func testIP(s string) net.IP {
	if ip := net.ParseIP(s); ip != nil {
		return ip.To16()
	}
	return net.IPv6zero
}

func (ms *measurementStorage) append(batch driver.Batch, m *storages.Measurement) error {
	asn, err := uuid.Parse(m.ASNId)
	if err != nil {
		return errors.Wrap(err, "asn id %q", m.ASNId)
	}
	geos := make([]*uuid.UUID, 3)
	for i, id := range []string{m.StateId, m.CountyId, m.TribalId} {
		if geos[i], err = nullableUUID(id); err != nil {
			return errors.Wrap(err, "geospace id %q", id)
		}
	}
	extra := make([]uuid.UUID, 0, len(m.ExtraGeospaceIds))
	for _, id := range m.ExtraGeospaceIds {
		u, err := uuid.Parse(id)
		if err != nil {
			return errors.Wrap(err, "geospace id %q", id)
		}
		extra = append(extra, u)
	}
	sig := ""
	if m.AccessTokenSig != nil {
		sig = *m.AccessTokenSig
	}
	return batch.Append(
		time.Unix(m.StartedAt, 0).UTC(), m.Id, m.TestStyle, testIP(m.IP), m.Upload, float64(m.MBPS),
		float32Or0(m.MinRTT), float32Or0(m.LossRate), m.Latitude, m.Longitude, m.LocationAccuracyKM,
		m.HasAccessToken, sig, asn, geos[0], geos[1], geos[2], extra,
	)
}

// batchIterator is implemented by iterators whose tests can be taken in batches by
// several goroutines at once (the ingestor's reader): the inserts of one file then run
// on nWorkers connections in parallel.
type batchIterator interface {
	NextBatch() ([]*storages.Measurement, error)
}

func (ms *measurementStorage) insertAll(it storages.MeasurementIterator) error {
	bi, ok := it.(batchIterator)
	if !ok {
		return ms.insertFrom(func() ([]*storages.Measurement, error) {
			m, err := it.Next()
			if m == nil {
				return nil, err
			}
			return []*storages.Measurement{m}, nil
		}, nil)
	}
	// Each inserter holds a batch of batchSize rows: cap them to bound the memory.
	inserters := ms.nWorkers
	if inserters > maxInserters {
		inserters = maxInserters
	}
	var failed atomic.Bool
	errs := make(chan error, inserters)
	for i := 0; i < inserters; i++ {
		go func() {
			ms.insertSlots <- struct{}{}
			defer func() { <-ms.insertSlots }()
			errs <- ms.insertFrom(bi.NextBatch, &failed)
		}()
	}
	var first error
	for i := 0; i < inserters; i++ {
		if err := <-errs; err != nil && first == nil {
			first = err
		}
	}
	return first
}

// insertFrom inserts the tests next returns in batches of batchSize rows until it
// returns none. Once failed is set (by this or another inserter), it only drains next.
func (ms *measurementStorage) insertFrom(next func() ([]*storages.Measurement, error), failed *atomic.Bool) (err error) {
	defer func() {
		if err != nil && failed != nil {
			failed.Store(true)
		}
	}()
	var batch driver.Batch
	n := 0
	for {
		rows, nErr := next()
		if nErr != nil {
			return errors.Wrap(nErr, "measurementStorage#insertAll Next")
		}
		if rows == nil {
			break
		}
		if failed != nil && failed.Load() {
			continue
		}
		for _, m := range rows {
			if batch == nil {
				if batch, err = ms.prepareBatch(); err != nil {
					return err
				}
			}
			if err := ms.append(batch, m); err != nil {
				return errors.Wrap(err, "measurementStorage#insertAll Append")
			}
			n++
			if n == batchSize {
				if err := batch.Send(); err != nil {
					return errors.Wrap(err, "measurementStorage#insertAll Send")
				}
				atomic.AddUint64(&ms.inserted, uint64(n))
				batch, n = nil, 0
			}
		}
	}
	if batch != nil && n > 0 {
		if err := batch.Send(); err != nil {
			return errors.Wrap(err, "measurementStorage#insertAll Send")
		}
		atomic.AddUint64(&ms.inserted, uint64(n))
	}
	return nil
}

// Insert implements storages.MeasurementStorage
func (ms *measurementStorage) Insert(it storages.MeasurementIterator) error {
	if !ms.started {
		return errors.New("measurementStorage#Insert storage is not open")
	}
	ms.jobCh <- it
	return nil
}

// LastDate is the newest test time, from the parts' minmax index of time (exact, no scan).
func (ms *measurementStorage) LastDate() (*time.Time, error) {
	var rows uint64
	var t time.Time
	// count() and max(time) on the time-partitioned table are answered from part metadata
	// (minmax_count projection): no scan, and no access to system tables needed, which the
	// pipeline's database user doesn't have.
	if err := ms.conn.QueryRow(ms.ctx(), fmt.Sprintf(`SELECT count(), max(time) FROM %s`, testsTable)).Scan(&rows, &t); err != nil {
		return nil, errors.Wrap(err, "measurementStorage#LastDate")
	}
	if rows == 0 {
		return nil, nil
	}
	return &t, nil
}

func dayString(d time.Time) string { return d.UTC().Format("2006-01-02") }

func (ms *measurementStorage) IDsOn(day time.Time) (map[string]struct{}, error) {
	rows, err := ms.conn.Query(ms.ctx(), fmt.Sprintf(`
		SELECT id FROM %s WHERE time >= toDateTime('%s', 'UTC') AND time < toDateTime('%[2]s', 'UTC') + INTERVAL 1 DAY`,
		testsTable, dayString(day)))
	if err != nil {
		return nil, errors.Wrap(err, "measurementStorage#IDsOn")
	}
	defer rows.Close()
	ids := map[string]struct{}{}
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, errors.Wrap(err, "measurementStorage#IDsOn Scan")
		}
		ids[id] = struct{}{}
	}
	return ids, wrap(rows.Err(), "measurementStorage#IDsOn rows")
}

func (r *monthReplace) othersFilter() string {
	return fmt.Sprintf("toYYYYMM(time) = %d AND toDate(time) NOT IN ('%s')", r.month, strings.Join(r.days, "', '"))
}

func (ms *measurementStorage) StartReplace(days []time.Time) error {
	if ms.started {
		return errors.New("measurementStorage#StartReplace storage must be closed")
	}
	if ms.replace != nil {
		return errors.New("measurementStorage#StartReplace a replace is already started")
	}
	if len(days) == 0 {
		return errors.New("measurementStorage#StartReplace no days")
	}
	r := &monthReplace{month: days[0].UTC().Year()*100 + int(days[0].UTC().Month())}
	for _, d := range days {
		if m := d.UTC().Year()*100 + int(d.UTC().Month()); m != r.month {
			return fmt.Errorf("measurementStorage#StartReplace days span months %d and %d", r.month, m)
		}
		r.days = append(r.days, dayString(d))
	}
	sort.Strings(r.days)
	r.staging = fmt.Sprintf("%s_repair_%d", testsTable, r.month)
	for _, q := range []string{
		fmt.Sprintf("DROP TABLE IF EXISTS `%s`", r.staging),
		fmt.Sprintf("CREATE TABLE `%s` AS %s", r.staging, testsTable),
		fmt.Sprintf("INSERT INTO `%s` SELECT * FROM %s WHERE %s", r.staging, testsTable, r.othersFilter()),
	} {
		if err := ms.conn.Exec(ms.ctx(), q); err != nil {
			return errors.Wrap(err, "measurementStorage#StartReplace")
		}
	}
	if err := ms.conn.QueryRow(ms.ctx(), fmt.Sprintf("SELECT count() FROM `%s`", r.staging)).Scan(&r.copied); err != nil {
		return errors.Wrap(err, "measurementStorage#StartReplace count")
	}
	ms.replace = r
	ms.table = r.staging
	return nil
}

func (ms *measurementStorage) CommitReplace() error {
	r := ms.replace
	if r == nil {
		return errors.New("measurementStorage#CommitReplace no replace started")
	}
	if ms.started {
		return errors.New("measurementStorage#CommitReplace storage must be closed")
	}
	ms.replace, ms.table = nil, testsTable
	defer ms.conn.Exec(ms.ctx(), fmt.Sprintf("DROP TABLE IF EXISTS `%s`", r.staging))
	// The copy has the month as it was at StartReplace. If another ingest wrote to the month
	// since, replacing would lose its rows.
	var now uint64
	if err := ms.conn.QueryRow(ms.ctx(), fmt.Sprintf("SELECT count() FROM %s WHERE %s", testsTable, r.othersFilter())).Scan(&now); err != nil {
		return errors.Wrap(err, "measurementStorage#CommitReplace count")
	}
	if now != r.copied {
		return fmt.Errorf("measurementStorage#CommitReplace %d changed during the repair (%d other tests, %d copied): run it again", r.month, now, r.copied)
	}
	return replacePartition(ms.ctx(), ms.conn, testsTable, fmt.Sprint(r.month), r.staging)
}

func (ms *measurementStorage) Open() error {
	if ms.started {
		return nil
	}
	ms.jobCh = make(chan storages.MeasurementIterator)
	for i := 0; i < ms.nWorkers; i++ {
		ms.wg.Add(1)
		go func() {
			defer ms.wg.Done()
			ms.storeWorker()
		}()
	}
	ms.started = true
	return nil
}

func (ms *measurementStorage) storeWorker() {
	for it := range ms.jobCh {
		if err := ms.insertAll(it); err != nil {
			log.Printf("measurementStorage: insert failed, draining the rest of the day: %v\n", err)
			ms.errMu.Lock()
			if ms.err == nil {
				ms.err = err
			}
			ms.errMu.Unlock()
			// Drain the iterator so its producer doesn't block forever. A nil item is the end
			// whatever the error: an iterator that failed returns its error for good, and
			// looping while err != nil spun every worker at 100 % CPU for an hour on
			// 2026-10-12, with the error never reported.
			for m, _ := it.Next(); m != nil; m, _ = it.Next() {
			}
		}
	}
}

func (ms *measurementStorage) prepareBatch() (driver.Batch, error) {
	batch, err := ms.conn.PrepareBatch(ms.ctx(), fmt.Sprintf("INSERT INTO `%s` (%s)", ms.table, testsColumns))
	if err != nil {
		return nil, errors.Wrap(err, "measurementStorage#prepareBatch PrepareBatch")
	}
	return batch, nil
}

type MeasurementStorageOpts struct {
	NWorkers int
}

func NewMeasurementStorage(conn driver.Conn, opts *MeasurementStorageOpts) storages.MeasurementStorage {
	return &measurementStorage{
		conn:        conn,
		wg:          &sync.WaitGroup{},
		nWorkers:    opts.NWorkers,
		insertSlots: make(chan struct{}, maxConcurrentInserts),
		table:       testsTable,
	}
}
