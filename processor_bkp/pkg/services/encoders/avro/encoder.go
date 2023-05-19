package avro

import (
	"fmt"
	"io"

	"github.com/exactlylabs/mlab-processor/pkg/services/encoders"
	"github.com/hamba/avro"
	"github.com/hamba/avro/ocf"
)

type avroEncoder struct {
	encoder *ocf.Encoder
}

func NewAvroEncoder(w io.Writer, schema string) (encoders.FileEncoder, error) {
	// Validate the schema
	schemaObj := avro.MustParse(schema)
	encoder, err := ocf.NewEncoder(
		schemaObj.String(), w,
		ocf.WithCodec(ocf.Snappy),
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
	return ae.encoder.Flush()
}

func (ae *avroEncoder) Extension() string {
	return "avro"
}
