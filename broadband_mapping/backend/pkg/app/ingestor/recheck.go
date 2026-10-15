package ingestor

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
)

// manifest is the processor's completeness record of a date (ManifestDir/<date>.json), the
// fields the ingestor uses. finished_at changes every time the date is processed again.
type manifest struct {
	Date       string    `json:"date"`
	FinishedAt time.Time `json:"finished_at"`
}

// readManifest returns the manifest of a UTC day, or nil when there is none.
func readManifest(ctx context.Context, storage Storage, dir string, day time.Time) (*manifest, error) {
	path := fmt.Sprintf("%s/%s.json", dir, day.UTC().Format("2006-01-02"))
	names, err := storage.List(ctx, path)
	if err != nil {
		return nil, errors.W(err)
	}
	if len(names) == 0 {
		return nil, nil
	}
	r, err := storage.Read(ctx, path)
	if err != nil {
		return nil, errors.W(err)
	}
	defer r.Close()
	data, err := io.ReadAll(r)
	if err != nil {
		return nil, errors.Wrap(err, "ingestor.readManifest %s", path)
	}
	m := &manifest{}
	if err := json.Unmarshal(data, m); err != nil {
		return nil, errors.Wrap(err, "ingestor.readManifest %s", path)
	}
	return m, nil
}

// RecheckReprocessed repairs the days of the window ending at the cursor's day whose
// completeness manifest is newer than the one recorded when they were ingested: the
// processor's daily run processes a day again when the M-Lab archive has grown since (a
// server pushing a tarball late), and the forward ingest only moves on from its cursor, so
// without this the re-uploaded tests never reached the map. A day without a record (ingested
// before this check existed, or by the forward ingest of this run) is recorded as it is.
// Repairs are additive (ndt5/ndt7 days keep their ids) and update the summaries when
// summarize is set. Returns the repaired days.
func RecheckReprocessed(ctx context.Context, s storages.IngestorAppStorages, storage Storage, opts FetchOptions, cursor time.Time, windowDays int, summarize bool) ([]time.Time, error) {
	if opts.ManifestDir == "" {
		return nil, nil
	}
	last := cursor.UTC().Truncate(24 * time.Hour)
	stale := []time.Time{}
	finished := map[time.Time]time.Time{}
	for i := windowDays - 1; i >= 0; i-- {
		d := last.AddDate(0, 0, -i)
		if !opts.ManifestFrom.IsZero() && d.Before(opts.ManifestFrom) {
			continue
		}
		m, err := readManifest(ctx, storage, opts.ManifestDir, d)
		if err != nil {
			return nil, err
		}
		if m == nil {
			continue
		}
		recorded, ok, err := s.MeasurementStorage.IngestedManifest(d)
		if err != nil {
			return nil, err
		}
		if !ok {
			if err := s.MeasurementStorage.RecordManifest(d, m.FinishedAt); err != nil {
				return nil, err
			}
			continue
		}
		if m.FinishedAt.After(recorded) {
			stale = append(stale, d)
			finished[d] = m.FinishedAt
		}
	}
	if len(stale) == 0 {
		return nil, nil
	}
	days := []string{}
	for _, d := range stale {
		days = append(days, d.Format("2006-01-02"))
	}
	log.Printf("ingestor.RecheckReprocessed: %d day(s) processed again since their ingest: %v\n", len(stale), days)
	if err := Repair(ctx, s, storage, stale, false, summarize); err != nil {
		return nil, err
	}
	for _, d := range stale {
		if err := s.MeasurementStorage.RecordManifest(d, finished[d]); err != nil {
			return nil, err
		}
	}
	return stale, nil
}
