package ingestor

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/hamba/avro/v2/ocf"
)

type fixtureRow struct {
	Id     string   `avro:"id"`
	N      int64    `avro:"n"`
	F      *float32 `avro:"f"`
	Double int64    `avro:"double"`
}

func checkFixtureRows(t *testing.T, name string, rows []fixtureRow) {
	t.Helper()
	if len(rows) == 0 {
		t.Fatalf("%s: no rows", name)
	}
	for i, r := range rows {
		if r.Id != fmt.Sprintf("row-%d", i) || r.N != int64(i) || r.Double != 2*int64(i) || (r.F == nil) != (i%3 == 0) {
			t.Fatalf("%s: row %d is %+v", name, i, r)
		}
	}
}

// The files mlab-processor writes (encoders/avro.Transform, every codec incl. zstandard,
// 8192-row blocks; written by its TestWriteFixtures) are read by both the block-parallel
// decoder and hamba's sequential one.
func TestReadsProcessorFiles(t *testing.T) {
	files, _ := filepath.Glob("testdata/transform-*.avro")
	if len(files) != 4 {
		t.Fatalf("fixtures: %v", files)
	}
	for _, path := range files {
		name := strings.TrimSuffix(filepath.Base(path), ".avro")
		f, err := os.Open(path)
		if err != nil {
			t.Fatal(err)
		}
		var sequential []fixtureRow
		dec, err := ocf.NewDecoder(f)
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		for dec.HasNext() {
			var r fixtureRow
			if err := dec.Decode(&r); err != nil {
				t.Fatalf("%s: %v", name, err)
			}
			sequential = append(sequential, r)
		}
		if err := dec.Error(); err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		f.Close()
		checkFixtureRows(t, name, sequential)

		f, _ = os.Open(path)
		parallel := make([]fixtureRow, len(sequential))
		if err := decodeBlocks(f, func(rows []fixtureRow) error {
			for _, r := range rows {
				parallel[r.N] = r
			}
			return nil
		}); err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		f.Close()
		checkFixtureRows(t, name, parallel)
	}
	// a truncated file is an error, not a short read
	b, _ := os.ReadFile("testdata/transform-zstandard.avro")
	os.WriteFile(filepath.Join(t.TempDir(), "x"), b, 0644)
	if err := decodeBlocks(strings.NewReader(string(b[:len(b)-10])), func(rows []fixtureRow) error { return nil }); err == nil {
		t.Fatal("truncated file must fail")
	}
}
