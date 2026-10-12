package routes

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/paulmach/orb"
	"github.com/paulmach/orb/encoding/mvt"
	"github.com/paulmach/orb/geojson"
	"github.com/paulmach/orb/maptile"
)

// fakeFeature/fakeTile mirror geoprovider's vectorTile: every Get decodes the stored tile.
type fakeFeature struct{ *geojson.Feature }

func (f *fakeFeature) GetProperties() map[string]any { return f.Properties }
func (f *fakeFeature) SetProperty(k string, v any) error {
	f.Properties[k] = v
	return nil
}

type fakeTile struct{ layers mvt.Layers }

func (t *fakeTile) Layers() []namespaces.Namespace { return nil }
func (t *fakeTile) Marshal(gz bool, _ ...namespaces.Namespace) ([]byte, error) {
	if gz {
		return mvt.MarshalGzipped(t.layers)
	}
	return mvt.Marshal(t.layers)
}
func (t *fakeTile) GetFeatures(namespaces.Namespace) ([]geo.Feature, error) {
	out := []geo.Feature{}
	for _, l := range t.layers {
		for _, f := range l.Features {
			out = append(out, &fakeFeature{f})
		}
	}
	return out, nil
}
func (t *fakeTile) Range(func(namespaces.Namespace, geo.Feature) (bool, error)) error { return nil }

type fakeTileset struct {
	data []byte
	gets int64
}

func (ts *fakeTileset) Load() error { return nil }
func (ts *fakeTileset) Get(x, y, z uint64) (geo.VectorTile, error) {
	atomic.AddInt64(&ts.gets, 1)
	if x == emptyTileX {
		return nil, geo.ErrEmptyTile
	}
	layers, err := mvt.UnmarshalGzipped(ts.data)
	if err != nil {
		return nil, err
	}
	return &fakeTile{layers}, nil
}

type fakeSummaries struct {
	storages.SummariesStorage
	results []storages.GeospaceSummaryResult
	calls   int64
	delay   time.Duration
}

func (fs *fakeSummaries) SummaryForNamespace(namespaces.Namespace, storages.SummaryFilter) ([]storages.GeospaceSummaryResult, error) {
	atomic.AddInt64(&fs.calls, 1)
	time.Sleep(fs.delay)
	return fs.results, nil
}

func (fs *fakeSummaries) SummaryForNamespaceAndASN(ns namespaces.Namespace, asn string, f storages.SummaryFilter) ([]storages.GeospaceSummaryResult, error) {
	return fs.SummaryForNamespace(ns, f)
}

const tileFeatures = 300 // counties in a mid-zoom tile
const emptyTileX = 1 << 40
const namespaceSize = 3300 // counties in the namespace summary

func geospaceID(i int) string { return fmt.Sprintf("00000000-0000-0000-0000-%012d", i) }

func newFixtures(tb testing.TB) (*geo.TilesetServers, *fakeTileset, *fakeSummaries) {
	fc := geojson.NewFeatureCollection()
	for i := 0; i < tileFeatures; i++ {
		x, y := -100+float64(i%20)*0.1, 40+float64(i/20)*0.1
		poly := orb.Polygon{{{x, y}, {x + 0.09, y}, {x + 0.09, y + 0.09}, {x, y + 0.09}, {x, y}}}
		f := geojson.NewFeature(poly)
		f.Properties["ID"] = geospaceID(i)
		f.Properties["NAME"] = fmt.Sprintf("County %d", i)
		fc.Append(f)
	}
	layers := mvt.NewLayers(map[string]*geojson.FeatureCollection{"counties": fc})
	layers.ProjectToTile(maptile.At(orb.Point{-99, 40.5}, 7))
	data, err := mvt.MarshalGzipped(layers)
	if err != nil {
		tb.Fatal(err)
	}
	ts := &fakeTileset{data: data}
	results := make([]storages.GeospaceSummaryResult, namespaceSize)
	for i := range results {
		name := fmt.Sprintf("County %d", i)
		parent := "00000000-0000-0000-0000-999999999999"
		results[i] = storages.GeospaceSummaryResult{
			Geospace: storages.DetailedGeospace{
				Id: geospaceID(i), GeoId: fmt.Sprintf("%05d", i), Namespace: namespaces.US_COUNTY, Name: &name,
				Parent:   &storages.Geospace{Id: parent, Name: &name, Namespace: namespaces.US_STATE, GeoId: "01"},
				Centroid: [2]float64{40.1, -99.2},
			},
			DownloadMedian: 101.5 + float64(i), UploadMedian: 20.25, LatencyMedian: 31.5,
			DownloadScores: storages.MeasurementScore{Bad: 0.1, Medium: 0.2, Good: 0.7, TotalSamples: 1000},
			UploadScores:   storages.MeasurementScore{Bad: 0.3, Medium: 0.3, Good: 0.4, TotalSamples: 900},
		}
	}
	servers := &geo.TilesetServers{States: ts, Counties: ts, TribalTracts: ts}
	return servers, ts, &fakeSummaries{results: results}
}

func serveTile(conf *config.Config, servers *geo.TilesetServers, summaries storages.SummariesStorage, x, y, z int, query string) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/namespaces/counties/tiles/%d/%d/%d?%s", z, x, y, query), nil)
	req.Header.Set("Accept-Encoding", "gzip")
	ctx := webcontext.NewTestContext(rec, req)
	ctx.URLParams = map[string]string{"namespace": "counties", "x": fmt.Sprint(x), "y": fmt.Sprint(y), "z": fmt.Sprint(z)}
	ServeVectorTiles(ctx, conf, servers, summaries)
	ctx.Commit()
	return rec
}

var benchRuns int64

func cacheConf(on bool) *config.Config {
	return &config.Config{UseCacheStr: fmt.Sprint(on)}
}

// BenchmarkServeVectorTiles requests distinct tiles of the same namespace/filter, which is what
// a map pan does: the namespace summary is cached but every tile is new.
func BenchmarkServeVectorTiles(b *testing.B) {
	servers, _, summaries := newFixtures(b)
	conf := cacheConf(true)
	// A filter of its own per run, so earlier runs' cached tiles don't count.
	filter := fmt.Sprintf("year=%d", 3000+atomic.AddInt64(&benchRuns, 1))
	serveTile(conf, servers, summaries, 0, 0, 7, filter)
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		rec := serveTile(conf, servers, summaries, 1+i, 1, 7, filter)
		if rec.Code != 200 || rec.Body.Len() == 0 {
			b.Fatalf("bad response %d", rec.Code)
		}
	}
}

// BenchmarkServeVectorTilesRepeat requests the same tile again (another visitor, or a re-render).
func BenchmarkServeVectorTilesRepeat(b *testing.B) {
	servers, _, summaries := newFixtures(b)
	conf := cacheConf(true)
	serveTile(conf, servers, summaries, 5, 5, 7, "year=2023")
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		rec := serveTile(conf, servers, summaries, 5, 5, 7, "year=2023")
		if rec.Code != 200 || rec.Body.Len() == 0 {
			b.Fatalf("bad response %d", rec.Code)
		}
	}
}

func TestServeVectorTilesCachedResponseIsIdentical(t *testing.T) {
	servers, ts, summaries := newFixtures(t)
	for _, gz := range []bool{true, false} {
		// uncached reference
		ref := serveTileEnc(cacheConf(false), servers, summaries, 3, 4, 7, "year=2021&month=5", gz)
		first := serveTileEnc(cacheConf(true), servers, summaries, 3, 4, 7, "year=2021&month=5", gz)
		gets, calls := atomic.LoadInt64(&ts.gets), atomic.LoadInt64(&summaries.calls)
		second := serveTileEnc(cacheConf(true), servers, summaries, 3, 4, 7, "year=2021&month=5", gz)
		if atomic.LoadInt64(&ts.gets) != gets || atomic.LoadInt64(&summaries.calls) != calls {
			t.Fatalf("gzip=%v: cached tile still decoded the tile or queried summaries", gz)
		}
		for _, rec := range []*httptest.ResponseRecorder{first, second} {
			if rec.Code != 200 || !bytes.Equal(rec.Body.Bytes(), ref.Body.Bytes()) {
				t.Fatalf("gzip=%v: cached response differs from the uncached one", gz)
			}
			if got := rec.Header().Get("Cache-Control"); got != publicCacheControl {
				t.Fatalf("Cache-Control = %q", got)
			}
			if got := rec.Header().Get("Content-Encoding") == "gzip"; got != gz {
				t.Fatalf("gzip=%v but Content-Encoding %q", gz, rec.Header().Get("Content-Encoding"))
			}
			if rec.Header().Get("Content-Type") != "application/vnd.mapbox-vector-tile" || rec.Header().Get("Vary") != "Accept-Encoding" {
				t.Fatalf("headers %v", rec.Header())
			}
		}
	}
	// The tile carries the summary of its geospaces.
	rec := serveTileEnc(cacheConf(true), servers, summaries, 3, 4, 7, "year=2021&month=5", false)
	layers, err := mvt.Unmarshal(rec.Body.Bytes())
	if err != nil {
		t.Fatal(err)
	}
	props := layers[0].Features[7].Properties
	var s map[string]any
	if err := json.Unmarshal([]byte(props["summary"].(string)), &s); err != nil {
		t.Fatal(err)
	}
	if props["ID"] != geospaceID(7) || s["download_median"] != 108.5 {
		t.Fatalf("unexpected feature properties %v", props)
	}
}

func TestServeVectorTilesFiltersAreCachedSeparately(t *testing.T) {
	servers, _, summaries := newFixtures(t)
	conf := cacheConf(true)
	a := serveTile(conf, servers, summaries, 8, 8, 7, "year=2020")
	summaries.results = summaries.results[:1] // a different filter returns different data
	b := serveTile(conf, servers, summaries, 8, 8, 7, "year=2020&semester=2")
	c := serveTile(conf, servers, summaries, 8, 8, 7, "year=2020&semester=2&asn_id=x")
	if bytes.Equal(a.Body.Bytes(), b.Body.Bytes()) || !bytes.Equal(b.Body.Bytes(), c.Body.Bytes()) {
		t.Fatal("tile cache key must include the filter (and the asn, which here returns the same data)")
	}
	if summaries.calls != 3 {
		t.Fatalf("want one summary query per (filter, asn), got %d", summaries.calls)
	}
}

func TestServeVectorTilesEmptyAndErrors(t *testing.T) {
	servers, _, summaries := newFixtures(t)
	rec := serveTile(cacheConf(true), servers, summaries, emptyTileX, 1, 7, "")
	if rec.Code != 200 || rec.Body.Len() != 0 || rec.Header().Get("Cache-Control") != publicCacheControl {
		t.Fatalf("empty tile: %d %d %v", rec.Code, rec.Body.Len(), rec.Header())
	}
	rec = serveTile(cacheConf(true), servers, summaries, 1, 1, 7, "month=3")
	if rec.Code != 400 || rec.Header().Get("Cache-Control") != "" {
		t.Fatalf("bad filter: %d %v", rec.Code, rec.Header())
	}
}

func TestSummaryMemoCollapsesConcurrentLoads(t *testing.T) {
	m := newSummaryMemo(time.Minute, 2)
	var loads int64
	release := make(chan struct{})
	load := func() (summaryMap, error) {
		atomic.AddInt64(&loads, 1)
		<-release
		return summaryMap{"a": {}}, nil
	}
	var wg sync.WaitGroup
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if v, err := m.get("k", true, load); err != nil || len(v) != 1 {
				t.Errorf("get: %v %v", v, err)
			}
		}()
	}
	time.Sleep(50 * time.Millisecond)
	close(release)
	wg.Wait()
	if loads != 1 {
		t.Fatalf("want 1 load, got %d", loads)
	}
}

func TestSummaryMemoTTLAndBounds(t *testing.T) {
	now := time.Unix(0, 0)
	m := newSummaryMemo(time.Minute, 2)
	m.now = func() time.Time { return now }
	loads := 0
	load := func() (summaryMap, error) {
		loads++
		return summaryMap{}, nil
	}
	m.get("a", true, load)
	m.get("a", true, load)
	if loads != 1 {
		t.Fatalf("cached value not reused: %d loads", loads)
	}
	m.get("a", false, load)
	if loads != 2 {
		t.Fatal("useCache=false must load")
	}
	now = now.Add(61 * time.Second)
	m.get("a", true, load)
	if loads != 3 {
		t.Fatal("expired value reused")
	}
	m.get("b", true, load)
	m.get("c", true, load)
	if len(m.entries) != 2 {
		t.Fatalf("cache exceeds its bound: %d entries", len(m.entries))
	}
	if _, err := m.get("err", true, func() (summaryMap, error) { return nil, errors.New("boom") }); err == nil {
		t.Fatal("load error not returned")
	}
	if _, ok := m.entries["err"]; ok {
		t.Fatal("errors must not be cached")
	}
}

func TestGzipAllowed(t *testing.T) {
	cases := map[string]bool{
		"":                        false,
		"gzip":                    true,
		"gzip, deflate, br, zstd": true,
		"deflate, gzip;q=0.5":     true,
		"br, GZIP":                true,
		"gzip;q=0":                false,
		"gzip; q=0.0, deflate":    false,
		"identity":                false,
		"x-gzip-not-really, br":   false,
	}
	for header, want := range cases {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		if header != "" {
			req.Header.Set("Accept-Encoding", header)
		}
		if got := gzipAllowed(webcontext.NewTestContext(httptest.NewRecorder(), req)); got != want {
			t.Errorf("%q: got %v, want %v", header, got, want)
		}
	}
}

func serveTileEnc(conf *config.Config, servers *geo.TilesetServers, summaries storages.SummariesStorage, x, y, z int, query string, gz bool) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/namespaces/counties/tiles/%d/%d/%d?%s", z, x, y, query), nil)
	if gz {
		req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	}
	ctx := webcontext.NewTestContext(rec, req)
	ctx.URLParams = map[string]string{"namespace": "counties", "x": fmt.Sprint(x), "y": fmt.Sprint(y), "z": fmt.Sprint(z)}
	ServeVectorTiles(ctx, conf, servers, summaries)
	ctx.Commit()
	return rec
}
