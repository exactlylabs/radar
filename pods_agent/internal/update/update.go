package update

import (
	_ "embed"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

func SelfUpdate(binaryUrl string, expectedVersion string) error {
	binPath, err := os.Executable()
	if err != nil {
		return errors.Wrap(err, "os.Executable failed")
	}
	if runtime.GOOS != "windows" {
		binPath, err = filepath.EvalSymlinks(binPath)
		if err != nil {
			return errors.Wrap(err, "filepath.EvalSymlinks failed").WithMetadata(errors.Metadata{"binPath": binPath})
		}
	}

	err = InstallFromUrl(binPath, binaryUrl, expectedVersion)
	if err != nil {
		return errors.W(err)
	}
	return nil
}

func InstallFromUrl(binPath, url, expectedVersion string) error {
	res, err := http.Get(url)
	if err != nil {
		return errors.Wrap(err, "request failed").WithMetadata(errors.Metadata{"url": url})
	}
	if res.StatusCode != 200 {
		return errors.New("update.InstallFromUrl unexpected status code: %d", res.StatusCode)
	}
	defer res.Body.Close()
	binary, err := ParseUpdateFile(res.Body)
	if err != nil {
		return errors.W(err)
	}
	if err := Install(binPath, binary, expectedVersion); err != nil {
		return errors.W(err)
	}
	return nil
}

// Install adds or replaces the binary into the OS
func Install(binPath string, binary []byte, expectedVersion string) (err error) {
	tmpBinPath := fmt.Sprintf("%s_tmp", binPath)
	if _, err = os.Stat(tmpBinPath); errors.Is(err, os.ErrNotExist) {
		err = addBinary(tmpBinPath, binary)
	} else {
		err = replaceBinary(tmpBinPath, binary)
	}
	if err != nil {
		return errors.W(err)
	}
	if err := validateBinaryVersion(tmpBinPath, expectedVersion); err != nil {
		return errors.W(err)
	}
	if err := os.Rename(tmpBinPath, binPath); err != nil {
		return errors.Wrap(err, "failed to rename file").WithMetadata(errors.Metadata{
			"from": tmpBinPath, "to": binPath,
		})
	}
	return nil
}

func addBinary(binPath string, binary []byte) error {
	f, err := os.OpenFile(binPath, os.O_CREATE|os.O_RDWR, 0755)
	if err != nil {
		return errors.Wrap(err, "failed to open file").WithMetadata(errors.Metadata{"path": binPath})
	}
	defer f.Close()
	_, err = f.Write(binary)
	if err != nil {
		return errors.Wrap(err, "failed to write file").WithMetadata(errors.Metadata{"path": binPath})
	}
	return nil
}

func replaceBinary(binPath string, binary []byte) error {
	tmpFile := fmt.Sprintf("%s_tmp", binPath)
	oldFile := fmt.Sprintf("%s_old", binPath)
	movedToOld := false
	defer func() {
		if r := recover(); r != nil {
			if movedToOld {
				os.Rename(oldFile, binPath)
			}
			panic(r)
		}
	}()
	f, err := os.OpenFile(tmpFile, os.O_CREATE|os.O_RDWR, 0755)
	if err != nil {
		return errors.Wrap(err, "failed to open temp. file").WithMetadata(errors.Metadata{"path": tmpFile})
	}
	defer f.Close()
	n, err := f.Write(binary)
	if err != nil {
		return errors.Wrap(err, "failed to write to temp. file").WithMetadata(errors.Metadata{"path": tmpFile})
	}
	log.Printf("Copied %d Bytes\n", n)
	f.Close()
	if err = os.Rename(binPath, oldFile); err != nil {
		return errors.Wrap(err, "failed to rename file").WithMetadata(errors.Metadata{
			"from": binPath, "to": oldFile,
		})
	}
	movedToOld = true
	// // Replace existing binary with new one
	if err = os.Rename(tmpFile, binPath); err != nil {
		os.Rename(oldFile, binPath)
		return errors.Wrap(err, "failed to rename file").WithMetadata(errors.Metadata{
			"from": tmpFile, "to": binPath,
		})
	}
	os.Remove(oldFile)
	os.Chmod(binPath, 0755)
	return nil
}
