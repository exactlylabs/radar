// Package pipeline runs the processor steps (fetch → ipgeocode → reversegeocode) per date,
// keeps the per-date accounting and decides which dates need (re)processing.
package pipeline

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"runtime"
	"runtime/debug"
	"strings"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/config"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher"
	"github.com/exactlylabs/mlab-processor/pkg/app/ipgeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/app/reversegeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
)

// DataStoreProvider returns the datastore of a step's output for a date.
type DataStoreProvider func(step string, date time.Time, obj interface{}) (datastore.DataStore, error)

// AllSteps in execution order.
var AllSteps = []string{fetcher.StepName, ipgeocoder.StepName, reversegeocoder.StepName}

// ManifestDir is the storage prefix of the per-date completeness records.
const ManifestDir = "completeness"

// Manifest is the completeness record of a date, stored as completeness/<date>.json once
// all three steps finished for it. Its presence means "done"; Fetch.Listed is compared
// with a fresh archive listing by the re-check.
type Manifest struct {
	Date           string                 `json:"date"`
	FinishedAt     time.Time              `json:"finished_at"`
	Fetch          *fetcher.Stats         `json:"fetch,omitempty"`
	IPGeocode      *ipgeocoder.Stats      `json:"ipgeocode,omitempty"`
	ReverseGeocode *reversegeocoder.Stats `json:"reversegeocode,omitempty"`
}

func manifestPath(date time.Time) string {
	return fmt.Sprintf("%s/%s.json", ManifestDir, date.Format("2006-01-02"))
}

// Runner holds what the steps need. Geo data is loaded on first use and dropped by Release.
type Runner struct {
	Provider  DataStoreProvider
	Storage   datastore.Storage
	Conf      *config.ProcessorConfig
	FetchOpts fetcher.Options
	// Source is the M-Lab archive; created on first use when nil.
	Source fetcher.ObjectSource
	// LowMemory drops the IP geocoder before loading the shapes (and vice versa), so only
	// one of them is resident at a time, at the cost of reloading per date.
	LowMemory bool

	sourceCloser io.Closer
	geocoder     *ipgeocoder.Geocoder
	revGeocoder  *reversegeocoder.ReverseGeocoder
}

func (r *Runner) source(ctx context.Context) (fetcher.ObjectSource, error) {
	if r.Source == nil {
		src, closer, err := fetcher.NewMLabSource(ctx)
		if err != nil {
			return nil, err
		}
		r.Source, r.sourceCloser = src, closer
	}
	return r.Source, nil
}

func (r *Runner) getGeocoder() (*ipgeocoder.Geocoder, error) {
	if r.LowMemory && r.revGeocoder != nil {
		r.revGeocoder = nil
		freeMemory()
	}
	if r.geocoder == nil {
		g, err := ipgeocoder.Load(r.Conf)
		if err != nil {
			return nil, err
		}
		r.geocoder = g
	}
	return r.geocoder, nil
}

func (r *Runner) getRevGeocoder() (*reversegeocoder.ReverseGeocoder, error) {
	if r.LowMemory && r.geocoder != nil {
		r.geocoder = nil
		freeMemory()
	}
	if r.revGeocoder == nil {
		g, err := reversegeocoder.Load(r.Conf)
		if err != nil {
			return nil, err
		}
		r.revGeocoder = g
	}
	return r.revGeocoder, nil
}

func freeMemory() {
	runtime.GC()
	debug.FreeOSMemory()
}

// Release drops the geo data (network maps, ASN map, shapes) and returns the memory to
// the OS. Call it after a run when the process stays alive (loop mode).
func (r *Runner) Release() {
	r.geocoder = nil
	r.revGeocoder = nil
	if r.sourceCloser != nil {
		r.sourceCloser.Close()
		r.Source, r.sourceCloser = nil, nil
	}
	freeMemory()
}

func summary(date time.Time, step, status string, kv ...any) {
	var b strings.Builder
	fmt.Fprintf(&b, "SUMMARY date=%s step=%s status=%s", date.Format("2006-01-02"), step, status)
	for i := 0; i+1 < len(kv); i += 2 {
		v := kv[i+1]
		if s, ok := v.(string); ok && strings.ContainsAny(s, " \"=") {
			v = fmt.Sprintf("%q", s)
		}
		fmt.Fprintf(&b, " %v=%v", kv[i], v)
	}
	log.Print(b.String())
}

func secs(start time.Time) string {
	return fmt.Sprintf("%.0f", time.Since(start).Seconds())
}

func contains(steps []string, s string) bool {
	for _, x := range steps {
		if x == s {
			return true
		}
	}
	return false
}

// LoadManifest returns the date's completeness record, or nil if there is none.
func (r *Runner) LoadManifest(ctx context.Context, date time.Time) (*Manifest, error) {
	exists, err := r.Storage.Exists(ctx, manifestPath(date))
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, nil
	}
	rc, err := r.Storage.Get(ctx, manifestPath(date))
	if err != nil {
		return nil, err
	}
	defer rc.Close()
	m := &Manifest{}
	if err := json.NewDecoder(rc).Decode(m); err != nil {
		return nil, fmt.Errorf("manifest %s: %w", manifestPath(date), err)
	}
	return m, nil
}

func (r *Runner) storeManifest(ctx context.Context, m *Manifest) error {
	b, err := json.MarshalIndent(m, "", "  ")
	if err != nil {
		return err
	}
	date, _ := time.Parse("2006-01-02", m.Date)
	return r.Storage.Store(ctx, bytes.NewReader(b), manifestPath(date))
}

func (r *Runner) deleteManifest(ctx context.Context, date time.Time) error {
	exists, err := r.Storage.Exists(ctx, manifestPath(date))
	if err != nil || !exists {
		return err
	}
	return r.Storage.Delete(ctx, manifestPath(date))
}

type stepDS struct {
	step string
	ds   datastore.DataStore
}

// RunDate runs the requested steps for one date. A step whose output already exists is
// skipped unless rerun is set or an earlier step ran in this call (its input changed).
// Nothing of a failed step is uploaded. fetch is uploaded as soon as it succeeds (raw
// retention; a later run resumes from it); ipgeocode and reversegeocode are uploaded
// together after both succeeded (reversegeocode first, since the ingestor takes a day
// once both exist), then the completeness manifest.
func (r *Runner) RunDate(ctx context.Context, date time.Time, steps []string, rerun bool) (err error) {
	dateStart := time.Now()
	ds := map[string]datastore.DataStore{}
	objs := map[string]any{
		fetcher.StepName:         models.FetchedResult{},
		ipgeocoder.StepName:      models.GeocodedResult{},
		reversegeocoder.StepName: models.RevGeoResult{},
	}
	for _, s := range AllSteps {
		d, pErr := r.Provider(s, date, objs[s])
		if pErr != nil {
			return pErr
		}
		ds[s] = d
		// Local files are only trusted when produced in this call.
		d.Clear()
	}
	defer func() {
		for _, d := range ds {
			d.Clear()
		}
		status := "ok"
		if err != nil {
			status = "failed"
		}
		summary(date, "date", status, "seconds", secs(dateStart))
	}()

	m := &Manifest{Date: date.Format("2006-01-02")}
	ran := map[string]bool{}
	var pending []stepDS // produced but not uploaded yet
	dirty := rerun
	for _, step := range AllSteps {
		if !contains(steps, step) {
			continue
		}
		if err := ctx.Err(); err != nil {
			return err
		}
		if !dirty {
			exists, eErr := ds[step].Exists()
			if eErr != nil {
				summary(date, step, "failed", "error", "exists check: "+eErr.Error())
				return fmt.Errorf("%s %s: exists check: %w", step, date.Format("2006-01-02"), eErr)
			}
			if exists {
				summary(date, step, "skipped", "reason", "exists")
				continue
			}
		}
		start := time.Now()
		switch step {
		case fetcher.StepName:
			src, sErr := r.source(ctx)
			if sErr != nil {
				return sErr
			}
			stats, fErr := fetcher.FetchDate(ctx, src, ds[step], date, r.FetchOpts)
			kv := []any{"listed", stats.TotalListed(), "processed", stats.TotalProcessed(), "tests", stats.Tests,
				"bad_files", stats.BadFiles, "retries", stats.Retries, "seconds", secs(start)}
			if fErr != nil {
				summary(date, step, "failed", append(kv, "error", fErr.Error())...)
				return fErr
			}
			m.Fetch = stats
			if uErr := ds[step].Flush(); uErr != nil {
				summary(date, step, "failed", append(kv, "error", "upload: "+uErr.Error())...)
				return fmt.Errorf("fetch %s: upload: %w", date.Format("2006-01-02"), uErr)
			}
			summary(date, step, "ok", kv...)
		case ipgeocoder.StepName:
			g, lErr := r.getGeocoder()
			if lErr != nil {
				return lErr
			}
			stats, gErr := g.Geocode(ds[step], ds[fetcher.StepName], date)
			kv := []any{"read", stats.Read, "written", stats.Written, "located", stats.Located, "with_asn", stats.WithASN, "seconds", secs(start)}
			if gErr != nil {
				summary(date, step, "failed", append(kv, "error", gErr.Error())...)
				return fmt.Errorf("ipgeocode %s: %w", date.Format("2006-01-02"), gErr)
			}
			m.IPGeocode = stats
			pending = append(pending, stepDS{step, ds[step]})
			summary(date, step, "ok", kv...)
		case reversegeocoder.StepName:
			g, lErr := r.getRevGeocoder()
			if lErr != nil {
				return lErr
			}
			stats, gErr := g.ReverseGeocode(ds[step], ds[ipgeocoder.StepName], date)
			kv := []any{"read", stats.Read, "matched", stats.Matched, "written", stats.Written, "seconds", secs(start)}
			if gErr != nil {
				summary(date, step, "failed", append(kv, "error", gErr.Error())...)
				return fmt.Errorf("reversegeocode %s: %w", date.Format("2006-01-02"), gErr)
			}
			m.ReverseGeocode = stats
			pending = append(pending, stepDS{step, ds[step]})
			summary(date, step, "ok", kv...)
		}
		ran[step] = true
		dirty = true
	}

	// Upload in reverse step order: reversegeocode before ipgeocode.
	for i := len(pending) - 1; i >= 0; i-- {
		if uErr := pending[i].ds.Flush(); uErr != nil {
			summary(date, pending[i].step, "failed", "error", "upload: "+uErr.Error())
			return fmt.Errorf("%s %s: upload: %w", pending[i].step, date.Format("2006-01-02"), uErr)
		}
	}

	switch {
	case ran[fetcher.StepName] && ran[ipgeocoder.StepName] && ran[reversegeocoder.StepName]:
		m.FinishedAt = time.Now().UTC()
		if err := r.storeManifest(ctx, m); err != nil {
			return fmt.Errorf("manifest %s: %w", date.Format("2006-01-02"), err)
		}
	case ran[fetcher.StepName]:
		// New fetch output without the downstream steps: an older manifest is stale.
		if err := r.deleteManifest(ctx, date); err != nil {
			return fmt.Errorf("manifest %s: %w", date.Format("2006-01-02"), err)
		}
	case ran[ipgeocoder.StepName] || ran[reversegeocoder.StepName]:
		old, err := r.LoadManifest(ctx, date)
		if err != nil {
			return fmt.Errorf("manifest %s: %w", date.Format("2006-01-02"), err)
		}
		if old != nil {
			if m.IPGeocode != nil {
				old.IPGeocode = m.IPGeocode
			}
			if m.ReverseGeocode != nil {
				old.ReverseGeocode = m.ReverseGeocode
			}
			old.FinishedAt = time.Now().UTC()
			if err := r.storeManifest(ctx, old); err != nil {
				return fmt.Errorf("manifest %s: %w", date.Format("2006-01-02"), err)
			}
		}
	}
	return nil
}

// Decision is what Check decided for a date.
type Decision struct {
	Process bool
	Reason  string
}

// Check decides whether a date must be (re)processed: when it has no completeness
// manifest, or when the archive now lists more tarballs than were processed (late
// uploads at M-Lab).
func (r *Runner) Check(ctx context.Context, date time.Time) (Decision, error) {
	m, err := r.LoadManifest(ctx, date)
	if err != nil {
		return Decision{}, err
	}
	if m == nil {
		return Decision{true, "no completeness record"}, nil
	}
	if m.Fetch == nil {
		return Decision{true, "completeness record without fetch accounting"}, nil
	}
	src, err := r.source(ctx)
	if err != nil {
		return Decision{}, err
	}
	n, err := fetcher.CountTarballs(ctx, src, date, r.FetchOpts)
	if err != nil {
		return Decision{}, err
	}
	if n > m.Fetch.TotalProcessed() {
		return Decision{true, fmt.Sprintf("archive lists %d tarballs, %d were processed", n, m.Fetch.TotalProcessed())}, nil
	}
	if n < m.Fetch.TotalProcessed() {
		log.Printf("Check %s: archive lists %d tarballs, fewer than the %d processed; leaving it", date.Format("2006-01-02"), n, m.Fetch.TotalProcessed())
	}
	return Decision{false, fmt.Sprintf("complete (%d tarballs, %d tests)", n, m.Fetch.Tests)}, nil
}

// RunWindow checks every date from start to end (inclusive, newest first) and processes
// the ones Check flags, with rerun (all three steps from scratch). It returns the dates
// that failed; one failed date does not stop the others.
func (r *Runner) RunWindow(ctx context.Context, start, end time.Time) (failed []time.Time) {
	for d := end; !d.Before(start); d = d.AddDate(0, 0, -1) {
		if ctx.Err() != nil {
			failed = append(failed, d)
			continue
		}
		dec, err := r.Check(ctx, d)
		if err != nil {
			summary(d, "check", "failed", "error", err.Error())
			failed = append(failed, d)
			continue
		}
		if !dec.Process {
			summary(d, "check", "complete", "reason", dec.Reason)
			continue
		}
		summary(d, "check", "process", "reason", dec.Reason)
		if err := r.RunDate(ctx, d, AllSteps, true); err != nil {
			log.Printf("Date %s failed: %v", d.Format("2006-01-02"), err)
			failed = append(failed, d)
		}
	}
	return failed
}

// RunRange runs steps for every date of the range in order (the classic behaviour: skip
// steps whose output exists unless rerun). It returns the dates that failed.
func (r *Runner) RunRange(ctx context.Context, dates []time.Time, steps []string, rerun bool) (failed []time.Time) {
	for _, d := range dates {
		if ctx.Err() != nil {
			failed = append(failed, d)
			continue
		}
		if err := r.RunDate(ctx, d, steps, rerun); err != nil {
			log.Printf("Date %s failed: %v", d.Format("2006-01-02"), err)
			failed = append(failed, d)
		}
	}
	return failed
}
