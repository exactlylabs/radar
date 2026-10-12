package ingestor

import (
	"context"
	"fmt"
	"io"
	"log"
	"sort"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ingestor/models"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/hamba/avro/ocf"
)

type geodata struct {
	namespace string
	geoId     string
}

var fileDirectories = []string{"ipgeocode", "reversegeocode"}

// Ingest inserts the tests of the files of the dates in [start, end), skipping tests at or
// before after (nil: none), then, if summarize, updates the summaries of the new tests' dates.
// Summaries are only updated when something was inserted: the hourly run finds the last
// ingested date's files again until the next date's appear, and skips all their tests.
func Ingest(ctx context.Context, s storages.IngestorAppStorages, storage Storage, start, end time.Time, after *time.Time, summarize bool, opts FetchOptions) error {
	it, err := Fetch(storage, fileDirectories, start, end, opts)
	if err != nil {
		return err
	}
	if it == nil {
		return nil
	}
	if err := s.OpenAll(); err != nil {
		return errors.W(err)
	}
	defer s.CloseAll()
	defer clearCache()
	if err := loadCache(s.GeospaceStorage, s.ASNOrgStorage); err != nil {
		return errors.W(err)
	}
	before := s.MeasurementStorage.Inserted()
	if err := ingestFetchedData(ctx, after, nil, s, it); err != nil {
		return errors.W(err)
	}
	// Wait for the inserts.
	if err := s.MeasurementStorage.Close(); err != nil {
		return errors.W(err)
	}
	inserted := s.MeasurementStorage.Inserted() - before
	log.Printf("ingestor.Ingest: inserted %d tests\n", inserted)
	if !summarize {
		return nil
	}
	if inserted == 0 {
		log.Println("ingestor.Ingest: no new tests, skipping summaries")
		return nil
	}
	last, err := s.MeasurementStorage.LastDate()
	if err != nil {
		return errors.W(err)
	}
	from := start
	if after != nil && after.After(from) {
		from = *after
	}
	if last == nil || last.Before(from) {
		// Inserted tests older than the cursor: summarize the dates fetched.
		last = &end
	}
	return wrapNil(s.Summarize(from, *last))
}

// Repair re-ingests the files of the given days (re-uploaded by the processor). With replace,
// each day's tests are replaced by the file's: needed for web100-era days (2009-2019), whose
// tests got new random ids when they were processed again. Without, only the file's tests
// missing from the day (by id) are added, which is enough for ndt5/ndt7 days. Then the
// summaries of the days are updated. The hourly ingestor must not write to the same months at
// the same time; a replace notices and fails rather than lose its rows.
func Repair(ctx context.Context, s storages.IngestorAppStorages, storage Storage, days []time.Time, replace, summarize bool) error {
	if len(days) == 0 {
		return nil
	}
	sorted := append([]time.Time{}, days...)
	sort.Slice(sorted, func(i, j int) bool { return sorted[i].Before(sorted[j]) })
	months := [][]time.Time{}
	for _, d := range sorted {
		d = d.UTC().Truncate(24 * time.Hour)
		if n := len(months); n > 0 && months[n-1][0].Year() == d.Year() && months[n-1][0].Month() == d.Month() {
			months[n-1] = append(months[n-1], d)
		} else {
			months = append(months, []time.Time{d})
		}
	}
	if err := s.OpenAll(); err != nil {
		return errors.W(err)
	}
	defer s.CloseAll()
	defer clearCache()
	if err := loadCache(s.GeospaceStorage, s.ASNOrgStorage); err != nil {
		return errors.W(err)
	}
	for _, monthDays := range months {
		if err := repairMonth(ctx, s, storage, monthDays, replace); err != nil {
			return err
		}
	}
	if !summarize {
		return nil
	}
	return wrapNil(s.Summarize(sorted[0], sorted[len(sorted)-1]))
}

func repairMonth(ctx context.Context, s storages.IngestorAppStorages, storage Storage, days []time.Time, replace bool) error {
	ms := s.MeasurementStorage
	// Every day's files must exist before anything is replaced.
	its := make([]*itemIterator, len(days))
	for i, d := range days {
		it, err := Fetch(storage, fileDirectories, d, d.AddDate(0, 0, 1), FetchOptions{})
		if err != nil {
			return err
		}
		if it == nil {
			return fmt.Errorf("ingestor.Repair: no files for %s", d.Format("2006-01-02"))
		}
		its[i] = it
	}
	if err := ms.Close(); err != nil {
		return errors.W(err)
	}
	if replace {
		if err := ms.StartReplace(days); err != nil {
			return errors.W(err)
		}
	}
	if err := ms.Open(); err != nil {
		return errors.W(err)
	}
	before := ms.Inserted()
	for i, d := range days {
		var skip map[string]struct{}
		if !replace {
			var err error
			if skip, err = ms.IDsOn(d); err != nil {
				return errors.W(err)
			}
		}
		log.Printf("ingestor.Repair: %s (%d tests already there to keep)\n", d.Format("2006-01-02"), len(skip))
		if err := ingestFetchedData(ctx, nil, skip, s, its[i]); err != nil {
			return errors.W(err)
		}
	}
	if err := ms.Close(); err != nil {
		return errors.W(err)
	}
	if ctx.Err() != nil {
		return ctx.Err()
	}
	log.Printf("ingestor.Repair: inserted %d tests for %s..%s\n", ms.Inserted()-before, days[0].Format("2006-01-02"), days[len(days)-1].Format("2006-01-02"))
	if replace {
		return wrapNil(ms.CommitReplace())
	}
	return nil
}

func ingestFetchedData(ctx context.Context, after *time.Time, skip map[string]struct{}, s storages.IngestorAppStorages, it *itemIterator) error {
	for {
		select {
		case <-ctx.Done():
			return nil
		default:
			readers, err := it.Next()
			if err != nil {
				return errors.Wrap(err, "ingestor.Ingest Next")
			}
			if readers == nil {
				return nil
			}
			if err := processDate(readers, after, skip, s); err != nil {
				return errors.Wrap(err, "ingestor.Ingest processDate")
			}
		}
	}
}

func processDate(readers []io.ReadCloser, after *time.Time, skip map[string]struct{}, s storages.IngestorAppStorages) error {
	measReader, revReader := readers[0], readers[1]
	measDecoder, err := ocf.NewDecoder(measReader)
	if err != nil {
		return err
	}
	// Load the whole file
	revDecoder, err := ocf.NewDecoder(revReader)
	if err != nil {
		return err
	}
	index, err := indexGeospaces(revDecoder)
	if err != nil {
		return err
	}
	revReader.Close()
	return s.MeasurementStorage.Insert(
		newMeasurementReader(measDecoder, index, after, skip, s.GeospaceStorage, s.ASNOrgStorage),
	)
}

func indexGeospaces(dec *ocf.Decoder) (map[string][]geodata, error) {
	index := make(map[string][]geodata)
	for dec.HasNext() {
		m := &models.RevGeoResult{}
		if err := dec.Decode(m); err != nil {
			return nil, fmt.Errorf("ingestor.indexGeospaces HasNext: %w", err)
		}
		index[m.Id] = append(index[m.Id], geodata{m.GeoNamespace, m.GeoId})
	}
	return index, nil
}

// wrapNil is errors.W that keeps nil as nil (errors.W(nil) is a non-nil error).
func wrapNil(err error) error {
	if err == nil {
		return nil
	}
	return errors.W(err)
}
