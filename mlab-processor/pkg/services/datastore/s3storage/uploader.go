package s3storage

import (
	"fmt"
	"io"
	"log"
	"time"

	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

// Uploader sends files to a given bucket, synchronously and with retries.
type Uploader struct {
	uploader   *s3manager.Uploader
	bucketName string
	attempts   int
	backoff    time.Duration
}

func NewUploader(bucketName string, awsSession *session.Session) *Uploader {
	return &Uploader{
		bucketName: bucketName,
		uploader:   s3manager.NewUploader(awsSession),
		attempts:   5,
		backoff:    15 * time.Second,
	}
}

// Upload stores src at dst. Every attempt starts from offset 0 of src, so a retry after a
// partial transfer can never store a truncated object.
func (u *Uploader) Upload(src io.ReadSeeker, dst string) error {
	var err error
	for i := 0; i < u.attempts; i++ {
		if i > 0 {
			time.Sleep(u.backoff * time.Duration(i))
		}
		if _, sErr := src.Seek(0, io.SeekStart); sErr != nil {
			return fmt.Errorf("s3storage.Upload seek %s: %w", dst, sErr)
		}
		_, err = u.uploader.Upload(&s3manager.UploadInput{
			Bucket: &u.bucketName,
			Key:    &dst,
			Body:   src,
		})
		if err == nil {
			return nil
		}
		log.Printf("s3storage: upload of %s failed (attempt %d/%d): %v", dst, i+1, u.attempts, err)
	}
	return fmt.Errorf("s3storage.Upload %s: giving up after %d attempts: %w", dst, u.attempts, err)
}
