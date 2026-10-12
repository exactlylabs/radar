package ingestor

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"hash/crc32"
	"io"
	"runtime"
	"sync"

	"github.com/hamba/avro/v2"
	"github.com/hamba/avro/v2/ocf"
	"github.com/klauspost/compress/flate"
	"github.com/klauspost/compress/snappy"
	"github.com/klauspost/compress/zstd"
)

// The processor's files have 6-7M rows a day; decoding them on one goroutine takes
// longer than inserting them. An object container file is a sequence of independently
// compressed blocks, so blockReader splits the file and decodeBlocks decodes the blocks
// on every CPU (the same scheme as mlab-processor's encoders/avro.Transform).

type block struct {
	count int64
	data  []byte // compressed
}

type blockReader struct {
	r      *avro.Reader
	schema avro.Schema
	codec  string
	sync   [16]byte
}

func newBlockReader(r io.Reader) (*blockReader, error) {
	br := &blockReader{r: avro.NewReader(r, 1<<16)}
	var h ocf.Header
	br.r.ReadVal(ocf.HeaderSchema, &h)
	if br.r.Error != nil {
		return nil, fmt.Errorf("avro: reading header: %w", br.r.Error)
	}
	if h.Magic != [4]byte{'O', 'b', 'j', 1} {
		return nil, errors.New("avro: not an object container file")
	}
	schema, err := avro.Parse(string(h.Meta["avro.schema"]))
	if err != nil {
		return nil, fmt.Errorf("avro: file schema: %w", err)
	}
	br.schema = schema
	br.codec = string(h.Meta["avro.codec"])
	if _, err := newDecompressor(br.codec); err != nil {
		return nil, err
	}
	br.sync = h.Sync
	return br, nil
}

// next returns the next block or io.EOF. A truncated file is an error.
func (br *blockReader) next() (block, error) {
	_ = br.r.Peek()
	if errors.Is(br.r.Error, io.EOF) {
		return block{}, io.EOF
	}
	count := br.r.ReadLong()
	size := br.r.ReadLong()
	if br.r.Error != nil {
		return block{}, fmt.Errorf("avro: block header: %w", br.r.Error)
	}
	if count < 0 || size < 0 {
		return block{}, errors.New("avro: invalid block header")
	}
	data := make([]byte, size)
	br.r.Read(data)
	var sync [16]byte
	br.r.Read(sync[:])
	if br.r.Error != nil {
		return block{}, fmt.Errorf("avro: truncated block: %w", br.r.Error)
	}
	if sync != br.sync {
		return block{}, errors.New("avro: invalid block sync marker")
	}
	return block{count: count, data: data}, nil
}

// decompressor decodes one codec; not safe for concurrent use.
type decompressor interface {
	decode(dst, src []byte) ([]byte, error)
}

func newDecompressor(codec string) (decompressor, error) {
	switch codec {
	case "", "null":
		return nullCodec{}, nil
	case "snappy":
		return snappyCodec{}, nil
	case "deflate":
		return deflateCodec{}, nil
	case "zstandard":
		dec, err := zstd.NewReader(nil, zstd.WithDecoderConcurrency(1))
		if err != nil {
			return nil, err
		}
		return zstdCodec{dec}, nil
	}
	return nil, fmt.Errorf("avro: unknown codec %q", codec)
}

type nullCodec struct{}

func (nullCodec) decode(dst, src []byte) ([]byte, error) { return append(dst, src...), nil }

// snappyCodec: snappy data followed by the big-endian CRC32 of the uncompressed data.
type snappyCodec struct{}

func (snappyCodec) decode(dst, src []byte) ([]byte, error) {
	if len(src) < 4 {
		return dst, errors.New("avro: snappy block too short")
	}
	data, crc := src[:len(src)-4], binary.BigEndian.Uint32(src[len(src)-4:])
	l, err := snappy.DecodedLen(data)
	if err != nil {
		return dst, err
	}
	n := len(dst)
	dst = append(dst, make([]byte, l)...)
	out, err := snappy.Decode(dst[n:], data)
	if err != nil {
		return dst, err
	}
	if crc32.ChecksumIEEE(out) != crc {
		return dst, errors.New("avro: snappy block crc mismatch")
	}
	return dst[:n+len(out)], nil
}

type deflateCodec struct{}

func (deflateCodec) decode(dst, src []byte) ([]byte, error) {
	r := flate.NewReader(bytes.NewReader(src))
	defer r.Close()
	w := bytes.NewBuffer(dst)
	if _, err := io.Copy(w, r); err != nil {
		return dst, err
	}
	return w.Bytes(), nil
}

type zstdCodec struct{ dec *zstd.Decoder }

func (c zstdCodec) decode(dst, src []byte) ([]byte, error) { return c.dec.DecodeAll(src, dst) }

// decodeBlocks reads the file r and calls fn with the rows of each block, decoded as T,
// on up to runtime.NumCPU goroutines (fn must be safe for that); the rows slice is reused
// after fn returns. It stops at the first error.
func decodeBlocks[T any](r io.Reader, fn func(rows []T) error) error {
	br, err := newBlockReader(r)
	if err != nil {
		return err
	}
	workers := runtime.NumCPU()
	blocks := make(chan block, workers)
	errs := make(chan error, workers)
	var failed sync.Once
	var firstErr error
	fail := func(err error) {
		failed.Do(func() { firstErr = err })
	}
	var wg sync.WaitGroup
	for w := 0; w < workers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			dec, err := newDecompressor(br.codec)
			if err != nil {
				fail(err)
				for range blocks {
				}
				return
			}
			rd := avro.NewReader(nil, 0)
			var raw []byte
			var rows []T
			for b := range blocks {
				if firstErr != nil {
					continue
				}
				raw, err = dec.decode(raw[:0], b.data)
				if err != nil {
					fail(err)
					continue
				}
				rd.Reset(raw)
				rd.Error = nil
				rows = rows[:0]
				for i := int64(0); i < b.count; i++ {
					var t T
					rows = append(rows, t)
					rd.ReadVal(br.schema, &rows[len(rows)-1])
					if rd.Error != nil {
						fail(fmt.Errorf("avro: decoding row: %w", rd.Error))
						break
					}
				}
				if firstErr != nil {
					continue
				}
				if err := fn(rows); err != nil {
					fail(err)
				}
			}
		}()
	}
	for {
		b, err := br.next()
		if err == io.EOF {
			break
		}
		if err != nil {
			fail(err)
			break
		}
		if firstErr != nil {
			break
		}
		blocks <- b
	}
	close(blocks)
	wg.Wait()
	close(errs)
	return firstErr
}
