package avro

import (
	"fmt"
	"io"

	"github.com/exactlylabs/mlab-processor/pkg/services/encoders"
	"github.com/hamba/avro/v2/ocf"
)

type avroDecoder struct {
	decoder *ocf.Decoder
}

func NewAvroDecoder(r io.Reader) (encoders.FileDecoder, error) {
	decoder, err := ocf.NewDecoder(r, ocf.WithZStandardDecoderOptions(ZstdDecoderOptions...))
	if err != nil {
		return nil, fmt.Errorf("avro.NewAvroDecoder NewDecoder err: %w", err)
	}
	return &avroDecoder{decoder}, nil
}

// DecodeItem implements encoders.FileDecoder
func (ae *avroDecoder) DecodeItem(obj any) error {
	return ae.decoder.Decode(obj)
}

func (ae *avroDecoder) MoveNext() bool {
	return ae.decoder.HasNext()
}

func (ae *avroDecoder) Err() error {
	return ae.decoder.Error()
}
