package avro

import (
	"bytes"
	"crypto/rand"
	"errors"
	"fmt"
	"io"

	"github.com/hamba/avro/v2"
	"github.com/hamba/avro/v2/ocf"
)

// Block is one data block of an object container file, still compressed.
type Block struct {
	Count int64
	Data  []byte
}

// BlockReader splits an object container file into its blocks without decoding them,
// so that blocks can be decompressed and decoded by several goroutines.
type BlockReader struct {
	r      *avro.Reader
	schema avro.Schema
	codec  CodecName
	sync   [16]byte
	err    error
}

// NewBlockReader reads the file header of r.
func NewBlockReader(r io.Reader) (*BlockReader, error) {
	br := &BlockReader{r: avro.NewReader(r, 1<<16)}
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
	br.codec = CodecName(h.Meta["avro.codec"])
	if _, err := NewCodec(br.codec); err != nil {
		return nil, err
	}
	br.sync = h.Sync
	return br, nil
}

// Schema is the writer schema of the file.
func (br *BlockReader) Schema() avro.Schema { return br.schema }

// Codec is the compression codec of the file's blocks.
func (br *BlockReader) Codec() CodecName { return br.codec }

// Next returns the next block, with its data appended to buf, or io.EOF after the
// last one. A truncated or corrupt file is an error, never a short read.
func (br *BlockReader) Next(buf []byte) (Block, error) {
	if br.err != nil {
		return Block{}, br.err
	}
	_ = br.r.Peek()
	if errors.Is(br.r.Error, io.EOF) {
		br.err = io.EOF
		return Block{}, io.EOF
	}
	count := br.r.ReadLong()
	size := br.r.ReadLong()
	if br.r.Error != nil {
		return Block{}, br.fail(fmt.Errorf("avro: block header: %w", br.r.Error))
	}
	if count < 0 || size < 0 {
		return Block{}, br.fail(errors.New("avro: invalid block header"))
	}
	n := len(buf)
	buf = append(buf, make([]byte, size)...)
	br.r.Read(buf[n:])
	var sync [16]byte
	br.r.Read(sync[:])
	if br.r.Error != nil {
		return Block{}, br.fail(fmt.Errorf("avro: truncated block: %w", br.r.Error))
	}
	if sync != br.sync {
		return Block{}, br.fail(errors.New("avro: invalid block sync marker"))
	}
	return Block{Count: count, Data: buf[n:]}, nil
}

func (br *BlockReader) fail(err error) error {
	br.err = err
	return err
}

// BlockWriter writes an object container file from blocks compressed by the caller.
type BlockWriter struct {
	w     io.Writer
	codec CodecName
	sync  [16]byte
	hdr   []byte
}

// NewBlockWriter writes the file header for schema to w.
func NewBlockWriter(w io.Writer, schema avro.Schema, codec CodecName) (*BlockWriter, error) {
	if _, err := NewCodec(codec); err != nil {
		return nil, err
	}
	bw := &BlockWriter{w: w, codec: codec}
	if _, err := rand.Read(bw.sync[:]); err != nil {
		return nil, err
	}
	h := ocf.Header{
		Magic: [4]byte{'O', 'b', 'j', 1},
		Meta: map[string][]byte{
			"avro.schema": []byte(schema.String()),
			"avro.codec":  []byte(codec),
		},
		Sync: bw.sync,
	}
	var buf bytes.Buffer
	if err := avro.NewEncoderForSchema(ocf.HeaderSchema, &buf).Encode(h); err != nil {
		return nil, err
	}
	if _, err := w.Write(buf.Bytes()); err != nil {
		return nil, err
	}
	return bw, nil
}

// Codec is the codec blocks must be compressed with.
func (bw *BlockWriter) Codec() CodecName { return bw.codec }

// WriteBlock appends a block of count rows whose compressed encoding is data.
func (bw *BlockWriter) WriteBlock(count int64, data []byte) error {
	if count == 0 {
		return nil
	}
	bw.hdr = bw.hdr[:0]
	bw.hdr = appendLong(bw.hdr, count)
	bw.hdr = appendLong(bw.hdr, int64(len(data)))
	if _, err := bw.w.Write(bw.hdr); err != nil {
		return err
	}
	if _, err := bw.w.Write(data); err != nil {
		return err
	}
	_, err := bw.w.Write(bw.sync[:])
	return err
}

// appendLong is the Avro zig-zag varint encoding.
func appendLong(b []byte, v int64) []byte {
	u := uint64(v<<1) ^ uint64(v>>63)
	for u >= 0x80 {
		b = append(b, byte(u)|0x80)
		u >>= 7
	}
	return append(b, byte(u))
}
