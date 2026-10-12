package avro

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"hash/crc32"
	"io"

	"github.com/klauspost/compress/flate"
	"github.com/klauspost/compress/snappy"
	"github.com/klauspost/compress/zstd"
)

// CodecName is an Avro object container file compression codec.
type CodecName string

const (
	Null      CodecName = "null"
	Deflate   CodecName = "deflate"
	Snappy    CodecName = "snappy"
	ZStandard CodecName = "zstandard"
)

// Codec compresses and decompresses OCF blocks. A Codec is not safe for concurrent use;
// NewCodec returns a fresh one for each goroutine.
type Codec interface {
	// Encode appends the compressed form of src to dst.
	Encode(dst, src []byte) ([]byte, error)
	// Decode appends the decompressed form of src to dst.
	Decode(dst, src []byte) ([]byte, error)
}

// NewCodec returns a codec by its OCF name ("" is null).
func NewCodec(name CodecName) (Codec, error) {
	switch name {
	case Null, "":
		return nullCodec{}, nil
	case Deflate:
		return &deflateCodec{}, nil
	case Snappy:
		return snappyCodec{}, nil
	case ZStandard:
		return newZstdCodec()
	}
	return nil, fmt.Errorf("avro: unknown codec %q", name)
}

type nullCodec struct{}

func (nullCodec) Encode(dst, src []byte) ([]byte, error) { return append(dst, src...), nil }
func (nullCodec) Decode(dst, src []byte) ([]byte, error) { return append(dst, src...), nil }

// snappyCodec is the Avro snappy block format: snappy data followed by the big-endian
// CRC32 of the uncompressed data.
type snappyCodec struct{}

func (snappyCodec) Encode(dst, src []byte) ([]byte, error) {
	n := len(dst)
	dst = append(dst, make([]byte, snappy.MaxEncodedLen(len(src)))...)
	out := snappy.Encode(dst[n:], src)
	dst = dst[:n+len(out)]
	return binary.BigEndian.AppendUint32(dst, crc32.ChecksumIEEE(src)), nil
}

func (snappyCodec) Decode(dst, src []byte) ([]byte, error) {
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
	dst = dst[:n+len(out)]
	if crc32.ChecksumIEEE(out) != crc {
		return dst, errors.New("avro: snappy block crc mismatch")
	}
	return dst, nil
}

// deflateCodec is a raw deflate stream (compress/flate framing, no zlib header).
type deflateCodec struct {
	w   *flate.Writer
	buf bytes.Buffer
}

const deflateLevel = flate.DefaultCompression

func (c *deflateCodec) Encode(dst, src []byte) ([]byte, error) {
	c.buf.Reset()
	if c.w == nil {
		w, err := flate.NewWriter(&c.buf, deflateLevel)
		if err != nil {
			return dst, err
		}
		c.w = w
	} else {
		c.w.Reset(&c.buf)
	}
	if _, err := c.w.Write(src); err != nil {
		return dst, err
	}
	if err := c.w.Close(); err != nil {
		return dst, err
	}
	return append(dst, c.buf.Bytes()...), nil
}

func (c *deflateCodec) Decode(dst, src []byte) ([]byte, error) {
	r := flate.NewReader(bytes.NewReader(src))
	defer r.Close()
	w := bytes.NewBuffer(dst)
	if _, err := io.Copy(w, r); err != nil {
		return dst, err
	}
	return w.Bytes(), nil
}

type zstdCodec struct {
	enc *zstd.Encoder
	dec *zstd.Decoder
}

func newZstdCodec() (*zstdCodec, error) {
	enc, err := zstd.NewWriter(nil, zstd.WithEncoderConcurrency(1), zstd.WithEncoderLevel(zstd.SpeedDefault))
	if err != nil {
		return nil, err
	}
	dec, err := zstd.NewReader(nil, zstd.WithDecoderConcurrency(1))
	if err != nil {
		return nil, err
	}
	return &zstdCodec{enc: enc, dec: dec}, nil
}

func (c *zstdCodec) Encode(dst, src []byte) ([]byte, error) { return c.enc.EncodeAll(src, dst), nil }
func (c *zstdCodec) Decode(dst, src []byte) ([]byte, error) { return c.dec.DecodeAll(src, dst) }
