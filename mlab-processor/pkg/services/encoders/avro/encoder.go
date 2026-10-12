package avro

import (
	"fmt"
	"io"
	"sync/atomic"

	"github.com/exactlylabs/mlab-processor/pkg/services/encoders"
	"github.com/hamba/avro/v2"
	"github.com/hamba/avro/v2/ocf"
)

// defaultCodec compresses every file the processor writes (row-at-a-time encoders and
// Transform alike); see SetDefaultCodec.
var defaultCodec atomic.Value

func init() { defaultCodec.Store(ZStandard) }

// DefaultCodec is the codec new files are written with: zstandard unless SetDefaultCodec
// changed it. On a day's ipgeocode output (6.2M rows) zstandard is 21% smaller than
// snappy (392 vs 496 MB) and decompresses faster; deflate sits in between and is 8x
// slower to decompress. The ingestor (broadband_mapping, hamba/avro v2) reads all of them;
// ingestors on hamba/avro v1 read only snappy and deflate.
func DefaultCodec() CodecName { return defaultCodec.Load().(CodecName) }

// SetDefaultCodec changes the codec of the files written from now on (AVRO_CODEC).
func SetDefaultCodec(name CodecName) error {
	if _, err := NewCodec(name); err != nil {
		return err
	}
	defaultCodec.Store(name)
	return nil
}

// DefaultBlockRows is the number of rows per block of the row-at-a-time encoder. Blocks
// are compressed independently, so bigger blocks compress better (the hamba default of
// 100 rows is ~10 KB per block); Transform uses TransformOptions.ChunkRows instead.
const DefaultBlockRows = 8192

type avroEncoder struct {
	encoder *ocf.Encoder
}

func NewAvroEncoder(w io.Writer, schema string) (encoders.FileEncoder, error) {
	// Validate the schema
	schemaObj := avro.MustParse(schema)
	encoder, err := ocf.NewEncoderWithSchema(
		schemaObj, w,
		ocf.WithCodec(ocf.CodecName(DefaultCodec())),
		ocf.WithBlockLength(DefaultBlockRows),
	)
	if err != nil {
		return nil, fmt.Errorf("avro.NewAvroEncoder NewEncoder err: %w", err)
	}
	return &avroEncoder{encoder}, nil
}

// Encode implements encoders.FileEncoder
func (ae *avroEncoder) EncodeItem(item any) error {
	return ae.encoder.Encode(item)
}

// Flush implements encoders.FileEncoder
func (ae *avroEncoder) Flush() error {
	return ae.encoder.Close()
}

func (ae *avroEncoder) Extension() string {
	return "avro"
}
