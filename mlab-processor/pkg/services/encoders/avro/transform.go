package avro

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"runtime"
	"sync"
	"sync/atomic"

	"github.com/hamba/avro/v2"
)

// TransformOptions tune Transform. Zero values mean the defaults.
type TransformOptions struct {
	// Workers decoding, transforming and encoding chunks in parallel (default NumCPU).
	Workers int
	// ChunkRows is the number of input rows handed to fn at a time, and the size of the
	// output blocks (default 8192). Memory in flight is about 3*Workers chunks.
	ChunkRows int
}

// TransformStats counts the rows read from the input and written to the output.
type TransformStats struct {
	Read    int64
	Written int64
}

type chunk struct {
	seq    int
	blocks []Block
	rows   int64
}

type result struct {
	seq   int
	count int64
	data  []byte
	err   error
}

// Transform decodes every row of in as an In, hands them in chunks (in file order) to
// fn on several goroutines, and writes the Out rows fn emits to out in input order:
// the output is the same whatever the number of workers. fn must be safe to call
// concurrently; worker (0..Workers-1) lets it keep per-goroutine scratch space. emit
// must only be called during fn.
func Transform[In, Out any](in *BlockReader, out *BlockWriter, outSchema avro.Schema, opts TransformOptions,
	fn func(worker int, rows []In, emit func(*Out)) error) (TransformStats, error) {
	workers, chunkRows := opts.Workers, opts.ChunkRows
	if workers <= 0 {
		workers = runtime.NumCPU()
	}
	if chunkRows <= 0 {
		chunkRows = 8192
	}
	var stats TransformStats
	var failed atomic.Bool
	chunks := make(chan chunk, workers)
	results := make(chan result, workers)
	var pool sync.Pool // []byte buffers for the compressed output blocks

	// reader: groups the file's blocks into chunks of about chunkRows rows
	var readErr error
	go func() {
		defer close(chunks)
		seq := 0
		var c chunk
		var buf []byte
		for !failed.Load() {
			blk, err := in.Next(buf)
			if err == io.EOF {
				break
			}
			if err != nil {
				readErr = err
				break
			}
			buf = blk.Data[len(blk.Data):] // the chunk's blocks share one backing array
			c.blocks = append(c.blocks, blk)
			c.rows += blk.Count
			if c.rows >= int64(chunkRows) {
				c.seq = seq
				seq++
				chunks <- c
				c, buf = chunk{}, nil
			}
		}
		if c.rows > 0 {
			c.seq = seq
			chunks <- c
		}
	}()

	var wg sync.WaitGroup
	for w := 0; w < workers; w++ {
		wg.Add(1)
		go func(worker int) {
			defer wg.Done()
			decIn, err := NewCodec(in.Codec())
			if err == nil {
				var encOut Codec
				encOut, err = NewCodec(out.Codec())
				if err == nil {
					err = transformWorker(worker, in.Schema(), outSchema, decIn, encOut, chunks, results, &pool, &failed, &stats, fn)
				}
			}
			if err != nil {
				failed.Store(true)
				results <- result{err: err}
				for range chunks { // drain so the reader can finish
				}
			}
		}(w)
	}
	go func() {
		wg.Wait()
		close(results)
	}()

	// writer: puts the blocks back in input order
	pending := map[int]result{}
	next := 0
	var err error
	for r := range results {
		if r.err != nil {
			if err == nil {
				err = r.err
			}
			continue
		}
		if err != nil {
			continue
		}
		pending[r.seq] = r
		for {
			p, ok := pending[next]
			if !ok {
				break
			}
			delete(pending, next)
			next++
			if wErr := out.WriteBlock(p.count, p.data); wErr != nil {
				err = fmt.Errorf("avro: writing block: %w", wErr)
				failed.Store(true)
				break
			}
			stats.Written += p.count
			pool.Put(p.data[:0]) //nolint:staticcheck // slices are fine in a Pool here
		}
	}
	if err == nil && readErr != nil {
		err = readErr
	}
	if err == nil && len(pending) > 0 {
		err = errors.New("avro: transform lost blocks")
	}
	stats.Read = atomic.LoadInt64(&stats.Read)
	return stats, err
}

func transformWorker[In, Out any](worker int, inSchema, outSchema avro.Schema, decIn, encOut Codec,
	chunks <-chan chunk, results chan<- result, pool *sync.Pool, failed *atomic.Bool, stats *TransformStats,
	fn func(worker int, rows []In, emit func(*Out)) error) error {
	rd := avro.NewReader(nil, 0)
	var outBuf bytes.Buffer
	wr := avro.NewWriter(&outBuf, 1<<16)
	var rows []In
	var raw []byte
	for c := range chunks {
		if failed.Load() {
			continue
		}
		rows = rows[:0]
		for _, blk := range c.blocks {
			var err error
			raw, err = decIn.Decode(raw[:0], blk.Data)
			if err != nil {
				return fmt.Errorf("avro: block %d: %w", c.seq, err)
			}
			rd.Reset(raw)
			rd.Error = nil
			for i := int64(0); i < blk.Count; i++ {
				rows = append(rows, *new(In))
				rd.ReadVal(inSchema, &rows[len(rows)-1])
				if rd.Error != nil {
					return fmt.Errorf("avro: decoding row %d of block %d: %w", i, c.seq, rd.Error)
				}
			}
		}
		atomic.AddInt64(&stats.Read, int64(len(rows)))

		outBuf.Reset()
		wr.Reset(&outBuf)
		wr.Error = nil
		var count int64
		emit := func(o *Out) {
			wr.WriteVal(outSchema, o)
			count++
		}
		if err := fn(worker, rows, emit); err != nil {
			return err
		}
		if err := wr.Flush(); err != nil {
			return fmt.Errorf("avro: encoding block %d: %w", c.seq, err)
		}
		var data []byte
		if b, ok := pool.Get().([]byte); ok {
			data = b[:0]
		}
		data, err := encOut.Encode(data, outBuf.Bytes())
		if err != nil {
			return fmt.Errorf("avro: compressing block %d: %w", c.seq, err)
		}
		results <- result{seq: c.seq, count: count, data: data}
	}
	return nil
}
