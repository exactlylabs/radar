package blob

import (
	"io"
	"os"
)

type Storer interface {
	Upload(name string, contentType string, file io.ReadSeeker) (string, error)
	Fetch(name string) (io.ReadCloser, string, error)
}

func EnvStorer() Storer {
	switch os.Getenv("STORER_MODE") {
	case "gcp":
		return &GCPStorer{}
	default:
		return &LocalStorer{}
	}
}
