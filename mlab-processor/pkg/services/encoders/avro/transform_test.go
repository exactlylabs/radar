package avro

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"strings"
	"testing"

	"github.com/hamba/avro/v2"
	"github.com/hamba/avro/v2/ocf"
)

const inSchema = `{"type":"record","name":"in","fields":[
	{"name":"id","type":"string"},{"name":"n","type":"long"},{"name":"f","type":["null","float"],"default":null}]}`
const outSchema = `{"type":"record","name":"out","fields":[
	{"name":"id","type":"string"},{"name":"n","type":"long"},{"name":"f","type":["null","float"],"default":null},{"name":"double","type":"long"}]}`

type inRow struct {
	Id string   `avro:"id"`
	N  int64    `avro:"n"`
	F  *float32 `avro:"f"`
}

type outRow struct {
	Id     string   `avro:"id"`
	N      int64    `avro:"n"`
	F      *float32 `avro:"f"`
	Double int64    `avro:"double"`
}

func rowsIn(n int) []inRow {
	rows := make([]inRow, n)
	for i := range rows {
		rows[i] = inRow{Id: fmt.Sprintf("row-%d", i), N: int64(i)}
		if i%3 != 0 {
			f := float32(i) / 7
			rows[i].F = &f
		}
	}
	return rows
}

// writeOCF writes rows with the hamba encoder (what the fetcher and the old code produce).
func writeOCF(t *testing.T, rows []inRow, codec ocf.CodecName, blockLen int) []byte {
	t.Helper()
	var buf bytes.Buffer
	enc, err := ocf.NewEncoder(inSchema, &buf, ocf.WithCodec(codec), ocf.WithBlockLength(blockLen))
	if err != nil {
		t.Fatal(err)
	}
	for i := range rows {
		if err := enc.Encode(&rows[i]); err != nil {
			t.Fatal(err)
		}
	}
	if err := enc.Close(); err != nil {
		t.Fatal(err)
	}
	return buf.Bytes()
}

func readOCF[T any](t *testing.T, data []byte) []T {
	t.Helper()
	dec, err := ocf.NewDecoder(bytes.NewReader(data))
	if err != nil {
		t.Fatal(err)
	}
	var out []T
	for dec.HasNext() {
		var r T
		if err := dec.Decode(&r); err != nil {
			t.Fatal(err)
		}
		out = append(out, r)
	}
	if err := dec.Error(); err != nil {
		t.Fatal(err)
	}
	return out
}

func double(worker int, rows []inRow, emit func(*outRow)) error {
	for i := range rows {
		r := &rows[i]
		emit(&outRow{Id: r.Id, N: r.N, F: r.F, Double: 2 * r.N})
	}
	return nil
}

func TestTransformRoundTrip(t *testing.T) {
	rows := rowsIn(25_000)
	for _, inCodec := range []ocf.CodecName{ocf.Null, ocf.Snappy, ocf.Deflate, ocf.ZStandard} {
		for _, outCodec := range []CodecName{Null, Snappy, Deflate, ZStandard} {
			for _, opts := range []TransformOptions{{Workers: 1, ChunkRows: 1000}, {Workers: 7, ChunkRows: 333}, {Workers: 16, ChunkRows: 100_000}} {
				name := fmt.Sprintf("%s-%s-w%d-c%d", inCodec, outCodec, opts.Workers, opts.ChunkRows)
				t.Run(name, func(t *testing.T) {
					in := writeOCF(t, rows, inCodec, 100)
					br, err := NewBlockReader(bytes.NewReader(in))
					if err != nil {
						t.Fatal(err)
					}
					var out bytes.Buffer
					bw, err := NewBlockWriter(&out, avro.MustParse(outSchema), outCodec)
					if err != nil {
						t.Fatal(err)
					}
					stats, err := Transform(br, bw, avro.MustParse(outSchema), opts, double)
					if err != nil {
						t.Fatal(err)
					}
					if stats.Read != int64(len(rows)) || stats.Written != int64(len(rows)) {
						t.Fatalf("stats %+v", stats)
					}
					got := readOCF[outRow](t, out.Bytes())
					if len(got) != len(rows) {
						t.Fatalf("%d rows out, want %d", len(got), len(rows))
					}
					for i, g := range got {
						w := outRow{Id: rows[i].Id, N: rows[i].N, F: rows[i].F, Double: 2 * rows[i].N}
						if g.Id != w.Id || g.N != w.N || g.Double != w.Double || (g.F == nil) != (w.F == nil) || (g.F != nil && *g.F != *w.F) {
							t.Fatalf("row %d: %+v, want %+v", i, g, w)
						}
					}
				})
			}
		}
	}
}

// The rows Transform writes are byte-for-byte what the hamba encoder writes for them.
func TestTransformRowBytesIdentical(t *testing.T) {
	rows := rowsIn(5000)
	in := writeOCF(t, rows, ocf.Snappy, 100)
	br, _ := NewBlockReader(bytes.NewReader(in))
	var out bytes.Buffer
	bw, _ := NewBlockWriter(&out, avro.MustParse(outSchema), Null)
	if _, err := Transform(br, bw, avro.MustParse(outSchema), TransformOptions{Workers: 3, ChunkRows: 5000}, double); err != nil {
		t.Fatal(err)
	}
	var want bytes.Buffer
	enc := avro.NewEncoderForSchema(avro.MustParse(outSchema), &want)
	for i := range rows {
		enc.Encode(&outRow{Id: rows[i].Id, N: rows[i].N, F: rows[i].F, Double: 2 * rows[i].N})
	}
	// one null block: header, then count, size, data, sync
	got := out.Bytes()
	if !bytes.Contains(got, want.Bytes()) {
		t.Fatal("output does not contain the rows' canonical encoding")
	}
}

func TestTransformEmptyInput(t *testing.T) {
	in := writeOCF(t, nil, ocf.Snappy, 100)
	br, _ := NewBlockReader(bytes.NewReader(in))
	var out bytes.Buffer
	bw, _ := NewBlockWriter(&out, avro.MustParse(outSchema), Snappy)
	stats, err := Transform(br, bw, avro.MustParse(outSchema), TransformOptions{}, double)
	if err != nil || stats.Read != 0 || stats.Written != 0 {
		t.Fatalf("%+v %v", stats, err)
	}
	if got := readOCF[outRow](t, out.Bytes()); len(got) != 0 {
		t.Fatal("rows out of nothing")
	}
}

func TestTransformErrors(t *testing.T) {
	rows := rowsIn(3000)
	in := writeOCF(t, rows, ocf.Snappy, 100)
	run := func(data []byte, fn func(int, []inRow, func(*outRow)) error) error {
		br, err := NewBlockReader(bytes.NewReader(data))
		if err != nil {
			return err
		}
		var out bytes.Buffer
		bw, _ := NewBlockWriter(&out, avro.MustParse(outSchema), Snappy)
		_, err = Transform(br, bw, avro.MustParse(outSchema), TransformOptions{Workers: 4, ChunkRows: 200}, fn)
		return err
	}
	if err := run(in[:len(in)-30], double); err == nil || !strings.Contains(err.Error(), "truncated") {
		t.Fatalf("truncated file: %v", err)
	}
	corrupt := append([]byte{}, in...)
	corrupt[len(corrupt)-100] ^= 0xff
	if err := run(corrupt, double); err == nil {
		t.Fatal("corrupt block must fail")
	}
	boom := errors.New("boom")
	if err := run(in, func(w int, r []inRow, e func(*outRow)) error { return boom }); !errors.Is(err, boom) {
		t.Fatalf("fn error: %v", err)
	}
	if _, err := NewBlockReader(bytes.NewReader([]byte("not avro at all"))); err == nil {
		t.Fatal("garbage must fail")
	}
	if _, err := NewBlockReader(bytes.NewReader(nil)); err == nil {
		t.Fatal("empty must fail")
	}
}

// Files written by the row-at-a-time encoder are read by BlockReader, and files written
// by BlockWriter are read by the row-at-a-time decoder.
func TestRowEncoderAndBlockReaderAgree(t *testing.T) {
	rows := rowsIn(20_000)
	var buf bytes.Buffer
	enc, err := NewAvroEncoder(&buf, inSchema)
	if err != nil {
		t.Fatal(err)
	}
	for i := range rows {
		if err := enc.EncodeItem(&rows[i]); err != nil {
			t.Fatal(err)
		}
	}
	if err := enc.Flush(); err != nil {
		t.Fatal(err)
	}
	br, err := NewBlockReader(bytes.NewReader(buf.Bytes()))
	if err != nil {
		t.Fatal(err)
	}
	if br.Codec() != DefaultCodec() {
		t.Fatalf("codec %s", br.Codec())
	}
	blocks, n := 0, int64(0)
	for {
		b, err := br.Next(nil)
		if err == io.EOF {
			break
		}
		if err != nil {
			t.Fatal(err)
		}
		blocks++
		n += b.Count
	}
	if n != int64(len(rows)) || blocks != (len(rows)+DefaultBlockRows-1)/DefaultBlockRows {
		t.Fatalf("%d rows in %d blocks", n, blocks)
	}
	dec, err := NewAvroDecoder(bytes.NewReader(buf.Bytes()))
	if err != nil {
		t.Fatal(err)
	}
	i := 0
	for dec.MoveNext() {
		var r inRow
		if err := dec.DecodeItem(&r); err != nil {
			t.Fatal(err)
		}
		if r.Id != rows[i].Id {
			t.Fatalf("row %d: %q", i, r.Id)
		}
		i++
	}
	if err := dec.Err(); err != nil || i != len(rows) {
		t.Fatalf("%d rows, %v", i, err)
	}
}
