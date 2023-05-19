package avro

import (
	"fmt"
	"io"

	"github.com/exactlylabs/mlab-processor/pkg/services/encoders"
	"github.com/hamba/avro/ocf"
)

type avroDecoder struct {
	decoder *ocf.Decoder
}

func NewAvroDecoder(r io.Reader) (encoders.FileDecoder, error) {
	decoder, err := ocf.NewDecoder(r)
	if err != nil {
		return nil, fmt.Errorf("avro.NewAvroEncoder NewEncoder err: %w", err)
	}
	return &avroDecoder{decoder}, nil
}

// Encode implements encoders.FileEncoder
func (ae *avroDecoder) DecodeItem(obj any) error {
	return ae.decoder.Decode(obj)
}

func (ae *avroDecoder) MoveNext() bool {
	return ae.decoder.HasNext()
}
