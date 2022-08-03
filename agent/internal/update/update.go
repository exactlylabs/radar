package update

import (
	_ "embed"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func SelfUpdate(binaryUrl string) error {
	binPath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("update.SelfUpdate error obtaining binary path: %w", err)
	}

	binPath, err = filepath.EvalSymlinks(binPath)
	if err != nil {
		return fmt.Errorf("update.SelfUpdate error evaluating symlink: %w", err)
	}

	return InstallFromUrl(binPath, binaryUrl)
}

func InstallFromUrl(binPath, url string) error {
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
	if err := Install(binPath, binary); err != nil {
		return fmt.Errorf("update.InstallFromUrl Install: %w", err)
	}
	return nil
}

// Install adds or replaces the watchdog binary into the OS,
// as well as configures systemd
func Install(binPath string, binary []byte) error {
	if _, err := os.Stat(binPath); errors.Is(err, os.ErrNotExist) {
		return addBinary(binPath, binary)
	}
	return replaceBinary(binPath, binary)
}

func addBinary(binPath string, binary []byte) error {
	f, err := os.OpenFile(binPath, os.O_CREATE|os.O_RDWR, 0776)
	if err != nil {
		return fmt.Errorf("watchdog.addBinary OpenFile: %w", err)
	}
	defer f.Close()
	_, err = f.Write(binary)
	if err != nil {
		return fmt.Errorf("watchdog.addBinary Write: %w", err)
	}
	return nil
}

func replaceBinary(binPath string, binary []byte) error {
	tmpFile := fmt.Sprintf("%s_tmp", binPath)
	oldFile := fmt.Sprintf("%s_old", binPath)
	f, err := os.OpenFile(tmpFile, os.O_CREATE|os.O_RDWR, 0776)
	if err != nil {
		return fmt.Errorf("watchdog.replaceBinary OpenFile: %w", err)
	}
	defer f.Close()
	n, err := f.Write(binary)
	if err != nil {
		return fmt.Errorf("watchdog.replaceBinary Write: %w", err)
	}
	log.Printf("Copied %d Bytes\n", n)
	f.Close()
	if err = os.Rename(binPath, oldFile); err != nil {
		return fmt.Errorf("update.replaceBinary Rename: %w", err)
	}
	// // Replace existing binary with new one
	if err = os.Rename(tmpFile, binPath); err != nil {
		os.Rename(oldFile, binPath)
		return fmt.Errorf("update.replaceBinary Rename: %w", err)
	}
	os.Remove(oldFile)
	os.Chmod(binPath, 0776)
	return nil
}
