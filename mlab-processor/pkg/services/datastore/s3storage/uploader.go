package s3storage

import (
	"io"
	"log"
	"sync"

	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/exactlylabs/go-errors/pkg/errors"
)

type uploadData struct {
	reader io.ReadCloser
	dst    string
}

// Uploader sends data to a given bucket
type Uploader struct {
	uploadCh   chan *uploadData
	wg         *sync.WaitGroup
	uploader   *s3manager.Uploader
	bucketName string
}

func NewUploader(bucketName string, awsSession *session.Session) *Uploader {
	wg := &sync.WaitGroup{}
	ch := make(chan *uploadData)
	wg.Add(1)
	u := &Uploader{
		uploadCh:   ch,
		wg:         wg,
		bucketName: bucketName,
		uploader:   s3manager.NewUploader(awsSession),
	}
	go func() {
		defer wg.Done()
		u.uploadWorker(ch)
	}()
	return u
}

func (u *Uploader) Upload(src io.ReadCloser, dst string) {
	u.uploadCh <- &uploadData{
		reader: src,
		dst:    dst,
	}
}

func (u *Uploader) Close() {
	close(u.uploadCh)
	u.wg.Wait()
}

func (u *Uploader) uploadWorker(ch chan *uploadData) {
	for work := range ch {
		_, err := u.uploader.Upload(&s3manager.UploadInput{
			Bucket: &u.bucketName,
			Key:    &work.dst,
			Body:   work.reader,
		})
		if err != nil {
			log.Println(errors.W(err))
		}
		work.reader.Close()
	}
}
