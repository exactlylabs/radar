package filequeue

import (
	"bufio"
	"io"
	"os"
	"strconv"
	"sync"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

// FileQueue implements a Queue in a file. It is concurrency safe as long as you have a single instance for each file.
type FileQueue struct {
	errorsFile  string
	cursorFile  string
	file        *os.File
	cursor      int64
	lock        sync.Mutex
	maxByteSize uint64
}

func NewFileQueue(errorsFile, cursorFile string) (*FileQueue, error) {
	cursor, err := loadCursor(cursorFile)
	if err != nil {
		return nil, errors.W(err)
	}

	fq := &FileQueue{
		errorsFile: errorsFile,
		cursorFile: cursorFile,
		cursor:     int64(cursor),
	}
	err = fq.openFile()
	if err != nil {
		return nil, errors.W(err)
	}
	return fq, nil
}

func (fq *FileQueue) openFile() error {
	f, err := os.OpenFile(fq.errorsFile, os.O_CREATE|os.O_APPEND|os.O_RDWR, 0660)
	if err != nil {
		return errors.W(err)
	}
	fq.file = f
	return nil
}

func (fq *FileQueue) persistCursor() error {
	f, err := os.OpenFile(fq.cursorFile, os.O_CREATE|os.O_TRUNC|os.O_RDWR, 0660)
	if err != nil {
		return errors.W(err)
	}
	defer f.Close()
	_, err = f.Write([]byte(strconv.FormatInt(fq.cursor, 10)))
	if err != nil {
		return errors.W(err)
	}
	return nil
}

func (fq *FileQueue) readNext(n int) ([][]byte, uint64) {
	count := 0
	byteSize := uint64(0)
	data := make([][]byte, 0)
	scanner := bufio.NewScanner(fq.file)

	for scanner.Scan() {
		row := scanner.Bytes()
		byteSize += uint64(len(row))
		data = append(data, row)
		count++
		if n != 0 && count >= n {
			return data, byteSize
		}
	}
	return data, byteSize
}

func (fq *FileQueue) Pop() ([]byte, error) {
	fq.lock.Lock()
	defer fq.lock.Unlock()
	fq.file.Seek(fq.cursor, 0)
	if data, _ := fq.readNext(1); len(data) != 0 {
		fq.cursor += int64(len(data[0]) + 1)
		if err := fq.persistCursor(); err != nil {
			return nil, errors.W(err)
		}
		return data[0], nil
	}
	return nil, nil
}

func (fq *FileQueue) Push(data []byte) error {
	fq.lock.Lock()
	defer fq.lock.Unlock()
	_, err := fq.file.Write(append(data, '\n'))
	if err != nil {
		return errors.W(err)
	}
	return nil
}

func (fq *FileQueue) Size() int {
	fq.lock.Lock()
	defer fq.lock.Unlock()
	fq.file.Seek(fq.cursor, 0)
	items, _ := fq.readNext(0)
	count := len(items)
	return count
}

// Shrink will remove all popped data from the queue file, and old entries if a maxByteSize is configured
func (fq *FileQueue) Shrink() error {
	fq.lock.Lock()
	defer fq.lock.Unlock()

	fq.file.Seek(fq.cursor, 0)
	remaining, byteSize := fq.readNext(0)
	fq.file.Close()

	err := os.Remove(fq.errorsFile)
	if err != nil {
		return errors.W(err)
	}

	// Remove old entries in case of the file size is too big
	for fq.maxByteSize != 0 && byteSize > fq.maxByteSize {
		var data []byte
		data, remaining = remaining[0], remaining[1:]
		byteSize -= uint64(len(data))
	}

	err = fq.openFile()
	if err != nil {
		return errors.W(err)
	}

	for _, data := range remaining {
		_, err := fq.file.Write(append(data, '\n'))
		if err != nil {
			return errors.W(err)
		}
	}
	fq.cursor = 0
	if err := fq.persistCursor(); err != nil {
		return errors.W(err)

	}
	return nil
}

func (fq *FileQueue) Close() error {
	err := fq.file.Close()
	if err != nil {
		return errors.W(err)
	}
	return nil
}

func loadCursor(filepath string) (int64, error) {
	cursor := 0
	cursorFile, err := os.Open(filepath)
	if err != nil && !errors.Is(err, os.ErrNotExist) {
		return 0, errors.W(err)
	}
	if cursorFile != nil {
		data, err := io.ReadAll(cursorFile)
		if err != nil {
			return 0, errors.W(err)
		}
		cursor, err = strconv.Atoi(string(data))
		if err != nil {
			return 0, errors.W(err)
		}
	}
	return int64(cursor), nil
}
