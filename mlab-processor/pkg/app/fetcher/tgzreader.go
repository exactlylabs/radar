package fetcher

import (
	"archive/tar"
	"fmt"
	"io"
	"log"
	"path/filepath"

	"github.com/klauspost/compress/gzip"
)

type tgzReader struct {
	r          *tar.Reader
	extensions []string
	gzreader   *gzip.Reader // minor improvement to avoid allocations
	// bad counts the .gz entries whose gzip header could not be read (empty or corrupt
	// files); they are skipped like any other unreadable test file.
	bad int64
}

func (it *tgzReader) Next() (name string, r io.Reader, err error) {
	for {
		header, tErr := it.r.Next()

		if tErr == io.EOF {
			break
		}

		if tErr != nil {
			return "", nil, fmt.Errorf("fetcher.itemIterator#Next tErr: %v", tErr)
		}

		name = header.Name
		r = it.r

		switch header.Typeflag {
		case tar.TypeDir:
			continue
		case tar.TypeReg:
			// In case extensions slice is not empty
			// only return the current file reader if the extension match
			if len(it.extensions) > 0 {
				extension := filepath.Ext(name)
				if extension == ".gz" {
					if it.gzreader == nil {
						// This avoids creating a new Reader for each item inside the existing gzip.
						// Instead, we use a single Reader and reset it for each new item.
						it.gzreader = new(gzip.Reader)
					}
					if err := it.gzreader.Reset(r); err != nil {
						it.bad++
						log.Printf("fetcher: skipping %s: gzip: %v", name, err)
						continue
					}
					r = it.gzreader
					name = name[:len(name)-3]
					extension = filepath.Ext(name)
				}
				for _, ext := range it.extensions {
					if ext == extension {
						return name, r, nil
					}
				}
				continue
			}
			return name, r, nil

		default:
			return "", nil, fmt.Errorf("fetcher.itemIterator#Next unknown type: %v in file %v", header.Typeflag, name)
		}
	}
	return "", nil, nil
}

func readTgz(r io.Reader, extensions ...string) (*tgzReader, error) {
	gzf, err := gzip.NewReader(r)
	if err != nil {
		return nil, fmt.Errorf("fetcher.readTgz NewReader: %v", err)
	}

	tarReader := tar.NewReader(gzf)
	return &tgzReader{
		r: tarReader, extensions: extensions,
	}, nil

}
