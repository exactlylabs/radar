package avro

import (
	"io"

	"github.com/exactlylabs/mlab-processor/pkg/services/encoders"
)

// NewAvroEncoder returns an AvroEncoder instanciator with a configured schema
func NewAvroEncoderFactory(schema string) encoders.ItemEncoderFactory {
	return func(w io.Writer) (encoders.FileEncoder, error) {
		return NewAvroEncoder(w, schema)
	}
}
