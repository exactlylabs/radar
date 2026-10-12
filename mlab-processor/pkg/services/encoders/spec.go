package encoders

import "io"

type FileEncoder interface {
	EncodeItem(item any) error
	Extension() string
	Flush() error
}

type FileDecoder interface {
	DecodeItem(obj any) error
	MoveNext() bool
	// Err returns the error that stopped MoveNext early (e.g. a truncated file), if any
	Err() error
}

type ItemEncoderFactory func(w io.Writer) (FileEncoder, error)
type ItemDecoderFactory func(r io.Reader) (FileDecoder, error)
