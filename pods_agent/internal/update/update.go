package update

import (
	_ "embed"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
)

func SelfUpdate(binaryUrl string, expectedVersion string) error {
	binPath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("update.SelfUpdate error obtaining binary path: %w", err)
	}
	if runtime.GOOS != "windows" {
		binPath, err = filepath.EvalSymlinks(binPath)
		if err != nil {
			return fmt.Errorf("update.SelfUpdate error evaluating symlink: %w", err)
		}
	}

	return InstallFromUrl(binPath, binaryUrl, expectedVersion)
}

func InstallFromUrl(binPath, url, expectedVersion string) error {
	res, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("update.InstallFromUrl Get: %w", err)
	}
	if res.StatusCode != 200 {
		return fmt.Errorf("update.InstallFromUrl unexpected status code: %w", err)
	}
	defer res.Body.Close()
	binary, err := ParseUpdateFile(res.Body)
	if err != nil {
		return err
	}
	if err := Install(binPath, binary, expectedVersion); err != nil {
		return fmt.Errorf("update.InstallFromUrl Install: %w", err)
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
		return fmt.Errorf("update.Install temp binary: %w", err)
	}
	if err := validateBinaryVersion(tmpBinPath, expectedVersion); err != nil {
		return fmt.Errorf("update.Install validateBinaryVersion: %w", err)
	}
	if err := os.Rename(tmpBinPath, binPath); err != nil {
		return fmt.Errorf("update.Install Rename: %w", err)
	}
	return nil
}

func addBinary(binPath string, binary []byte) error {
	f, err := os.OpenFile(binPath, os.O_CREATE|os.O_RDWR, 0755)
	if err != nil {
		return fmt.Errorf("update.addBinary OpenFile: %w", err)
	}
	defer f.Close()
	_, err = f.Write(binary)
	if err != nil {
		return fmt.Errorf("update.addBinary Write: %w", err)
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
		return fmt.Errorf("update.replaceBinary OpenFile: %w", err)
	}
	defer f.Close()
	n, err := f.Write(binary)
	if err != nil {
		return fmt.Errorf("update.replaceBinary Write: %w", err)
	}
	log.Printf("Copied %d Bytes\n", n)
	f.Close()
	if err = os.Rename(binPath, oldFile); err != nil {
		return fmt.Errorf("update.replaceBinary Rename: %w", err)
	}
	movedToOld = true
	// // Replace existing binary with new one
	if err = os.Rename(tmpFile, binPath); err != nil {
		os.Rename(oldFile, binPath)
		return fmt.Errorf("update.replaceBinary Rename: %w", err)
	}
	os.Remove(oldFile)
	os.Chmod(binPath, 0755)
	return nil
}
