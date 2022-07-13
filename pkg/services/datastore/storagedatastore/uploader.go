package storagedatastore

import (
	"context"
	"io"
	"sync"

	gcpstorage "cloud.google.com/go/storage"
)

type uploadData struct {
	writer io.WriteCloser
	reader io.ReadCloser
}

// Uploader sends data to a given bucket
type Uploader struct {
	uploadCh chan *uploadData
	wg       *sync.WaitGroup
	bucket   *gcpstorage.BucketHandle
}

func NewUploader(bucket *gcpstorage.BucketHandle) *Uploader {
	wg := &sync.WaitGroup{}
	ch := make(chan *uploadData)
	wg.Add(1)
	go func() {
		defer wg.Done()
		uploadWorker(ch)
	}()
	return &Uploader{
		uploadCh: ch,
		wg:       wg,
		bucket:   bucket,
	}
}

func (u *Uploader) Upload(src io.ReadCloser, dst string) {
	ctx := context.Background()
	u.uploadCh <- &uploadData{
		writer: u.bucket.Object(dst).NewWriter(ctx),
		reader: src,
	}
}

func (u *Uploader) Close() {
	close(u.uploadCh)
	u.wg.Wait()
}

func uploadWorker(ch chan *uploadData) {
	for work := range ch {
		io.Copy(work.writer, work.reader)
		work.writer.Close()
		work.reader.Close()
	}
}
