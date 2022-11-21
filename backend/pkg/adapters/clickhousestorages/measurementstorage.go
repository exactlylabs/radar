package clickhousestorages

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"math"
	"sync"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
)

type measurementStorage struct {
	conn     driver.Conn
	jobCh    chan storages.MeasurementIterator
	wg       *sync.WaitGroup
	nWorkers int
	swap     bool
	truncate bool
	started  bool
}

// Close implements storages.MeasurementStorage
func (ms *measurementStorage) Close() error {
	if !ms.started {
		return nil
	}
	close(ms.jobCh)
	ms.wg.Wait()
	if ms.swap {
		if err := ms.swapTempTableBack(); err != nil {
			return errors.Wrap(err, "measurementStorage#Close swapTempTableBack")
		}
	}
	ms.started = false
	return nil
}

func (ms *measurementStorage) insertInBatch(batch driver.Batch, it storages.MeasurementIterator) error {
	i := 0
	for m, err := it.Next(); m != nil || err != nil; m, err = it.Next() {
		if err != nil {
			return errors.Wrap(err, "measurementStorage#insertInBatch Next")
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
			m.HasAccessToken, m.AccessTokenSig, m.ASNId, m.GeospaceId,
		)
		if err != nil {
			return errors.Wrap(err, "measurementStorage#insertInBatch Append")
		}
		if math.Mod(float64(i), 100_000) == 0 {
			if err := batch.Send(); err != nil {
				return errors.Wrap(err, "measurementStorage#insertInBatch Send")
			}
			batch, err = ms.prepareBatch()
			if err != nil {
				return errors.Wrap(err, "measurementStorage#insertInBatch prepareBatch")
			}
		}
		i++
	}
	if math.Mod(float64(i), 100_000) != 0 {
		if err := batch.Send(); err != nil {
			return errors.Wrap(err, "measurementStorage#insertInBatch Send")
		}
	}
	return nil
}

// Insert implements storages.MeasurementStorage
func (ms *measurementStorage) Insert(it storages.MeasurementIterator) error {
	ms.jobCh <- it
	return nil
}

// LastDate implements storages.MeasurementStorage
func (ms *measurementStorage) LastDate() (*time.Time, error) {
	row := ms.conn.QueryRow(
		context.Background(),
		fmt.Sprintf(`SELECT time FROM %s ORDER BY time DESC LIMIT 1`, ms.measurementsTableName()),
	)
	if row.Err() == sql.ErrNoRows {
		return nil, nil
	} else if row.Err() != nil {
		return nil, errors.Wrap(row.Err(), "measurementStorage#LastMeasurementDate QueryRow")
	}
	var t time.Time
	if err := row.Scan(&t); err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, errors.Wrap(err, "measurementStorage#LastMeasurementDate Scan")
	}
	return &t, nil
}

func (ms *measurementStorage) Open() error {
	if ms.started {
		return nil
	}
	ms.jobCh = make(chan storages.MeasurementIterator)
	if ms.swap {
		err := ms.swapToTempTable()
		if err != nil {
			return errors.Wrap(err, "clickhouseStorage#Open swapToTempTable")
		}
	}
	if ms.truncate {
		err := ms.truncateMeasurements()
		if err != nil {
			return errors.Wrap(err, "clickhouseStorage#Open truncateMeasurements")
		}
	}
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

func (ms *measurementStorage) measurementsTableName() string {
	if ms.swap {
		return "measurements_tmp"
	}
	return "measurements"
}

func (cs *measurementStorage) truncateMeasurements() error {
	err := cs.conn.Exec(context.Background(), fmt.Sprintf(`TRUNCATE %s`, cs.measurementsTableName()))
	if err != nil {
		return errors.Wrap(err, "measurementStorage#truncateMeasurements Exec")
	}
	return nil
}

func (cs *measurementStorage) swapToTempTable() error {
	err := cs.conn.Exec(context.Background(), `DROP TABLE measurements_tmp`)
	if err != nil {
		log.Println(errors.Wrap(err, "measurementStorage#swapToTempTable Exec"))
	}
	err = cs.conn.Exec(context.Background(), `CREATE TABLE measurements_tmp AS measurements`)
	if err != nil {
		return errors.Wrap(err, "measurementStorage#swapToTempTable Exec")
	}
	err = cs.conn.Exec(context.Background(), `EXCHANGE TABLES measurements AND measurements_tmp`)
	if err != nil {
		return errors.Wrap(err, "measurementStorage#swapToTempTable Exec")
	}
	return nil
}

func (cs *measurementStorage) swapTempTableBack() error {
	err := cs.conn.Exec(context.Background(), `EXCHANGE TABLES measurements_tmp AND measurements`)
	if err != nil {
		return errors.Wrap(err, "measurementStorage#swapTempTableBack Exec")
	}
	return nil
}

func (ms *measurementStorage) storeWorker() {
	for it := range ms.jobCh {
		batch, err := ms.prepareBatch()
		if err != nil {
			panic(errors.Wrap(err, "measurementStorage#storeWorker prepareBatch"))
		}
		err = ms.insertInBatch(batch, it)
		if err != nil {
			panic(errors.Wrap(err, "measurementStorage#storeWorker insertInBatch"))
		}
	}
}

func (ms *measurementStorage) prepareBatch() (driver.Batch, error) {
	tableName := ms.measurementsTableName()
	query := fmt.Sprintf(`INSERT INTO %s (
		id, test_style, ip, time, upload, mbps, loss_rate, min_rtt, latitude,
		longitude, location_accuracy_km, has_access_token, access_token_sig, asn_org_id, geospace_id
	)`, tableName)
	batch, err := ms.conn.PrepareBatch(context.Background(), query)
	if err != nil {
		return nil, errors.Wrap(err, "measurementStorage#prepareBatch PrepareBatch")
	}
	return batch, nil
}

type MeasurementStorageOpts struct {
	NWorkers  int
	SwapTable bool
	Truncate  bool
}

func NewMeasurementStorage(conn driver.Conn, opts *MeasurementStorageOpts) storages.MeasurementStorage {
	return &measurementStorage{
		conn:     conn,
		wg:       &sync.WaitGroup{},
		nWorkers: opts.NWorkers,
		swap:     opts.SwapTable,
		truncate: opts.Truncate,
	}
}
