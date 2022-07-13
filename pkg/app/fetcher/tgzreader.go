package fetcher

import (
	"archive/tar"
	"compress/gzip"
	"fmt"
	"io"
	"path/filepath"
)

type itemIterator struct {
	r          *tar.Reader
	extensions []string
}

func (it *itemIterator) Next() (name string, r io.Reader, err error) {
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
				for _, ext := range it.extensions {
					if ext == ".gz" {
						// Then first decompress it and get the decompressed file extension
						r, err = gzip.NewReader(r)
						if err != nil {
							return "", nil, fmt.Errorf("fetcher.itemIterator#Next NewReader: %w", err)
						}
						name = name[:len(name)-3]
						extension = filepath.Ext(name)
					}
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

func readTgz(r io.Reader, extensions ...string) (*itemIterator, error) {
	gzf, err := gzip.NewReader(r)
	if err != nil {
		return nil, fmt.Errorf("fetcher.readTgz NewReader: %v", err)
	}

	tarReader := tar.NewReader(gzf)
	return &itemIterator{
		r: tarReader, extensions: extensions,
	}, nil

}
