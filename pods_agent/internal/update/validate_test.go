package update

import (
	"bytes"
	"testing"
)

func TestReadFileEmpty(t *testing.T) {
	_, err := readFile(bytes.NewReader([]byte{}))
	if err != ErrEmptyFile {
		t.Fatal("expected ErrEmptyFile")
	}
}
