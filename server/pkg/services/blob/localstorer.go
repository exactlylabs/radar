package blob

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path"

	"github.com/google/uuid"
)

type LocalStorer struct{}

var LocalDirectory = "./tmp/localstorer"

func (ls *LocalStorer) Upload(name string, contentType string, srcFile io.ReadSeeker) (string, error) {
	mkdirErr := os.MkdirAll(LocalDirectory, 0755)
	if mkdirErr != nil {
		return "", fmt.Errorf("LocalStorer#Upload failed to make temporary dir: %w", mkdirErr)
	}

	entityId := uuid.New()
	entityExt := path.Ext(name)
	entityName := entityId.String() + entityExt
	entityLocalPath := path.Join(LocalDirectory, entityName)

	destFile, fErr := os.Create(entityLocalPath)
	if fErr != nil {
		return "", fmt.Errorf("LocalStorer#Upload failed to create file locally: %w", fErr)
	}
	defer destFile.Close()

	_, cpErr := io.Copy(destFile, srcFile)
	if cpErr != nil {
		return "", fmt.Errorf("LocalStorer#Upload failed to save file locally: %w", cpErr)
	}

	return entityName, nil
}

func (ls *LocalStorer) Fetch(name string) (io.ReadCloser, string, error) {
	filePath := path.Join(LocalDirectory, name)
	f, err := os.Open(filePath)
	if err != nil {
		return nil, "", fmt.Errorf("LocalStorer#Fetch failed to open file: %w", err)
	}

	b, rErr := ioutil.ReadAll(f)
	if rErr != nil {
		return nil, "", fmt.Errorf("LocalStorer#Fetch failed to read file: %w", rErr)
	}
	_, sErr := f.Seek(0, io.SeekStart)
	if sErr != nil {
		return nil, "", fmt.Errorf("LocalStorer#Fetch failed to rewind file after content detection: %w", rErr)
	}

	contentType := http.DetectContentType(b)

	return f, contentType, nil
}
