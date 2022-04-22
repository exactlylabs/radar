package update

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func SelfUpdate(binaryUrl string) error {
	res, err := http.Get(binaryUrl)
	if err != nil {
		return fmt.Errorf("update.SelfUpdate error retrieving binary: %w", err)
	}
	if res.StatusCode != 200 {
		return fmt.Errorf("update.SelfUpdate unexpected status code: %w", err)
	}
	defer res.Body.Close()
	binary, err := ParseUpdateFile(res.Body)
	if err != nil {
		return err
	}
	// Binary Validated, replace existing one with this
	binPath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("update.SelfUpdate error obtaining binary path: %w", err)
	}
	binPath, err = filepath.EvalSymlinks(binPath)
	if err != nil {
		return fmt.Errorf("update.SelfUpdate error evaluating symlink: %w", err)
	}
	tmpFile := fmt.Sprintf("%s_tmp", binPath)
	f, _ := os.Create(tmpFile)
	defer f.Close()
	r := bytes.NewReader(binary)
	n, err := io.Copy(f, r)
	if err != nil {
		return fmt.Errorf("update.SelfUpdate failed to create tmp binary: %w", err)
	}
	log.Printf("Copied %d Bytes\n", n)

	// // Replace existing binary with new one
	err = os.Rename(tmpFile, binPath)
	if err != nil {
		return fmt.Errorf("update.SelfUpdate failed replacing binary: %w", err)
	}
	os.Chmod(binPath, 0776)
	return nil
}
