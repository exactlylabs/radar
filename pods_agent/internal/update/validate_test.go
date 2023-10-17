package update

import (
	"bytes"
	"testing"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

func TestReadFileEmpty(t *testing.T) {
	_, err := readFile(bytes.NewReader([]byte{}))
	if !errors.Is(err, ErrEmptyFile) {
		t.Fatal("expected ErrEmptyFile")
	}
}
