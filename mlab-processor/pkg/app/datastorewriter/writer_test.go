package datastorewriter

import (
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore/localstorage"
	"github.com/exactlylabs/mlab-processor/pkg/services/encoders/avro"
)

func fetchDS(t testing.TB) datastore.DataStore {
	dir := t.TempDir()
	wd, _ := os.Getwd()
	os.Chdir(dir) // the datastore writes to ./output
	t.Cleanup(func() { os.Chdir(wd) })
	st, err := localstorage.New("storage")
	if err != nil {
		t.Fatal(err)
	}
	ds, err := datastore.New(st, "fetch/2026-07-31.avro", avro.NewAvroEncoderFactory(models.FetchedResultSchema), avro.NewAvroDecoder, models.FetchedResult{})
	if err != nil {
		t.Fatal(err)
	}
	return ds
}

func row(i int) *models.FetchedResult {
	lr, rtt := float32(0.01), float32(23.5)
	return &models.FetchedResult{
		Id: fmt.Sprintf("ndt-abcde_1783004604_%016X", i), TestStyle: "ndt7", IP: "203.0.113.42",
		StartedAt: 1783004604 + int64(i), Upload: i%2 == 0, MBPS: float32(i % 900), LossRate: &lr, MinRTT: &rtt,
	}
}

// TestWriterThroughput checks the writer absorbs the rows the fetcher produces at link
// speed (~45k rows/s) with a wide margin; run with -v for the rate.
func TestWriterThroughput(t *testing.T) {
	ds := fetchDS(t)
	const n = 2_000_000
	w := NewWriter(ds)
	start := time.Now()
	for i := 0; i < n; i++ {
		w.WriteItem(row(i))
	}
	if err := w.Close(); err != nil {
		t.Fatal(err)
	}
	el := time.Since(start)
	rate := float64(n) / el.Seconds()
	t.Logf("%d rows in %.2fs: %.0f rows/s", n, el.Seconds(), rate)
	if w.Written() != n {
		t.Fatalf("written %d", w.Written())
	}
	if rate < 100_000 {
		t.Fatalf("%.0f rows/s is too slow for the fetcher", rate)
	}
}
