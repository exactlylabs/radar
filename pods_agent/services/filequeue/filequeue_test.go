package filequeue

import (
	"fmt"
	"path/filepath"
	"sync"
	"testing"
)

func newTestFQ(t *testing.T) *FileQueue {
	errorsPath := filepath.Join(t.TempDir(), "errors.test.log")
	cursorPath := filepath.Join(t.TempDir(), "errors.test.cursor")

	fq, err := NewFileQueue(errorsPath, cursorPath)
	if err != nil {
		t.Fatal(err)
	}
	return fq
}

func withTestFileQueue(t *testing.T, callback func(fq *FileQueue)) {
	fq := newTestFQ(t)
	callback(fq)
}

func TestQueuePopEmpty(t *testing.T) {
	withTestFileQueue(t, func(fq *FileQueue) {
		data, err := fq.Pop()
		if err != nil {
			t.Fatal(err)
		}
		if data != nil {
			t.Fatal("Expected nil")
		}
	})
}

func TestQueuePopWithData(t *testing.T) {
	withTestFileQueue(t, func(fq *FileQueue) {
		fq.Push([]byte("Hello, World!"))
		data, err := fq.Pop()
		if err != nil {
			t.Fatal(err)
		}
		if string(data) != "Hello, World!" {
			t.Fatalf("Expected 'Hello, World!', got '%s'", string(data))
		}
	})
}

func TestQueuePopMultiple(t *testing.T) {
	withTestFileQueue(t, func(fq *FileQueue) {
		fq.Push([]byte("Hello, Test1!"))
		fq.Push([]byte("Hello, Test2!"))

		data, err := fq.Pop()
		if err != nil {
			t.Fatal(err)
		}
		if string(data) != "Hello, Test1!" {
			t.Fatalf("Expected 'Hello, Test1!', got '%s'", string(data))
		}

		data, err = fq.Pop()
		if err != nil {
			t.Fatal(err)
		}
		if string(data) != "Hello, Test2!" {
			t.Fatalf("Expected 'Hello, Test2!', got '%s'", string(data))
		}
	})
}

func TestQueueSizeCursorNotMoved(t *testing.T) {
	withTestFileQueue(t, func(fq *FileQueue) {
		fq.Push([]byte("Hello, Test1!"))
		fq.Push([]byte("Hello, Test2!"))

		if fq.Size() != 2 {
			t.Fatalf("Expected 2 items in queue, got %d", fq.Size())
		}

		if fq.cursor != 0 {
			t.Fatalf("Expected cursor to be 0, got %d", fq.cursor)
		}

		data, err := fq.Pop()
		if err != nil {
			t.Fatal(err)
		}
		if string(data) != "Hello, Test1!" {
			t.Fatalf("Expected 'Hello, Test1!', got '%s'", string(data))
		}
	})
}

func TestQueueShrink(t *testing.T) {
	withTestFileQueue(t, func(fq *FileQueue) {
		fq.Push([]byte("Hello, Test1!"))
		fq.Push([]byte("Hello, Test2!"))

		fq.Pop()
		err := fq.Shrink()
		if err != nil {
			t.Fatal(err)
		}

		if fq.cursor != 0 {
			t.Fatalf("Expected cursor to be 0, got %d", fq.cursor)
		}

		if fq.Size() != 1 {
			t.Fatalf("Expected 1 item in queue, got %d", fq.Size())
		}

		data, err := fq.Pop()
		if err != nil {
			t.Fatal(err)
		}
		if string(data) != "Hello, Test2!" {
			t.Fatalf("Expected 'Hello, Test2!', got '%s'", string(data))
		}
	})
}

func TestQueuePushPopConsistency(t *testing.T) {
	withTestFileQueue(t, func(fq *FileQueue) {
		expected := []string{"Data 1", "Data 2", "Data 3"}
		for _, data := range expected {
			err := fq.Push([]byte(data))
			if err != nil {
				t.Fatal(err)
			}
		}

		for _, expectedData := range expected {
			data, err := fq.Pop()
			if err != nil {
				t.Fatal(err)
			}
			if string(data) != expectedData {
				t.Fatalf("Expected '%s', got '%s'", expectedData, string(data))
			}
		}
	})
}

func TestQueueShrinkEmpty(t *testing.T) {
	withTestFileQueue(t, func(fq *FileQueue) {
		err := fq.Shrink()
		if err != nil {
			t.Fatal(err)
		}
		if fq.Size() != 0 {
			t.Fatalf("Expected queue size to be 0 after flush, got %d", fq.Size())
		}
	})
}

func TestQueueReopen(t *testing.T) {
	withTestFileQueue(t, func(fq *FileQueue) {
		fq.Push([]byte("Reopen Test"))
		fq.Close() // Close the current queue

		// Reopen the queue
		reopenedFQ, err := NewFileQueue(fq.errorsFile, fq.cursorFile)
		if err != nil {
			t.Fatal(err)
		}
		defer reopenedFQ.Close()

		data, err := reopenedFQ.Pop()
		if err != nil {
			t.Fatal(err)
		}
		if string(data) != "Reopen Test" {
			t.Fatalf("Expected 'Reopen Test', got '%s'", string(data))
		}
	})
}

func TestQueueMultipleShrinks(t *testing.T) {
	withTestFileQueue(t, func(fq *FileQueue) {
		fq.Push([]byte("Before Shrink"))
		fq.Shrink()
		fq.Push([]byte("After Shrink"))
		fq.Shrink()

		data, err := fq.Pop()
		if err != nil {
			t.Fatal(err)
		}
		if string(data) != "Before Shrink" {
			t.Fatalf("Expected 'Before Shrink', got '%s'", string(data))
		}
	})
}

func TestFileQueueConcurrency(t *testing.T) {
	withTestFileQueue(t, func(fq *FileQueue) {

		var wg sync.WaitGroup
		pushCount := 100
		popCount := 100

		// Concurrently push data into the queue
		for i := 0; i < pushCount; i++ {
			wg.Add(1)
			go func(i int) {
				defer wg.Done()
				data := fmt.Sprintf("Data %d", i)
				if err := fq.Push([]byte(data)); err != nil {
					t.Errorf("Failed to push data: %v", err)
				}
			}(i)
		}

		// Concurrently pop data from the queue
		poppedData := make(map[string]bool)
		var mu sync.Mutex
		for i := 0; i < popCount; i++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				data, err := fq.Pop()
				if err != nil {
					t.Errorf("Failed to pop data: %v", err)
					return
				}
				if data != nil {
					mu.Lock()
					poppedData[string(data)] = true
					mu.Unlock()
				}
			}()
		}

		fq.Shrink()

		wg.Wait()

		// Verify all data was popped
		if len(poppedData) != pushCount {
			t.Errorf("Mismatch in push/pop count: pushed %d, popped %d", pushCount, len(poppedData))
		}

		// Check if the queue is empty
		if size := fq.Size(); size != 0 {
			t.Errorf("Expected queue size to be 0, got %d", size)
		}
	})
}

func TestQueueShrinkWithMaxByteSize(t *testing.T) {
	withTestFileQueue(t, func(fq *FileQueue) {
		// Set a maxByteSize that allows only one item in the queue after shrinking
		fq.maxByteSize = uint64(len("Hello, Test1!\n"))

		// Push two items that would exceed the maxByteSize if both were kept
		fq.Push([]byte("Hello, Test1!"))
		fq.Push([]byte("Hello, Test2!"))

		// Perform the shrink operation
		err := fq.Shrink()
		if err != nil {
			t.Fatal(err)
		}

		// Verify the queue size is 1, as the first item should have been removed to respect maxByteSize
		if fq.Size() != 1 {
			t.Fatalf("Expected 1 item in queue after shrink with maxByteSize, got %d", fq.Size())
		}

		// Pop the remaining item and verify it is the second item pushed
		data, err := fq.Pop()
		if err != nil {
			t.Fatal(err)
		}
		if string(data) != "Hello, Test2!" {
			t.Fatalf("Expected 'Hello, Test2!' after shrink with maxByteSize, got '%s'", string(data))
		}
	})
}
