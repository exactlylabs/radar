// Package s3storage stores the processor's outputs in an S3-compatible bucket (Backblaze
// B2 in production) using aws-sdk-go-v2.
package s3storage

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/aws/smithy-go"
	smithyhttp "github.com/aws/smithy-go/transport/http"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
)

type S3StorageOptions struct {
	BucketName string
	AccessKey  string
	SecretKey  string
	Endpoint   string
	Region     string
}

type s3Storage struct {
	bucketName string
	cli        *s3.Client
	// upload / HEAD retry policy on top of the SDK's own retries
	attempts       int
	backoff        time.Duration
	existsAttempts int
	existsBackoff  time.Duration
}

// endpointURL accepts "host[:port]" (https assumed, as aws-sdk-go v1 did) or a full URL.
func endpointURL(e string) string {
	if e == "" || strings.Contains(e, "://") {
		return e
	}
	return "https://" + e
}

func newClient(opts S3StorageOptions, maxAttempts int) *s3.Client {
	return s3.New(s3.Options{
		Region:       opts.Region,
		BaseEndpoint: aws.String(endpointURL(opts.Endpoint)),
		Credentials:  credentials.NewStaticCredentialsProvider(opts.AccessKey, opts.SecretKey, ""),
		UsePathStyle: true,
		// Only send/verify the checksums S3 requires (the pre-2025 behaviour): S3-compatible
		// stores such as B2 do not all accept the newer default CRC32 trailers.
		RequestChecksumCalculation: aws.RequestChecksumCalculationWhenRequired,
		ResponseChecksumValidation: aws.ResponseChecksumValidationWhenRequired,
		RetryMaxAttempts:           maxAttempts,
	})
}

func New(opts S3StorageOptions) (datastore.Storage, error) {
	if opts.BucketName == "" {
		return nil, errors.New("s3storage: bucket name is empty")
	}
	return &s3Storage{
		bucketName:     opts.BucketName,
		cli:            newClient(opts, 0),
		attempts:       5,
		backoff:        15 * time.Second,
		existsAttempts: 4,
		existsBackoff:  5 * time.Second,
	}, nil
}

// isNotFound is true only when the server positively answered 404 / NoSuchKey.
func isNotFound(err error) bool {
	var nsk *types.NoSuchKey
	var nf *types.NotFound
	if errors.As(err, &nsk) || errors.As(err, &nf) {
		return true
	}
	var re *smithyhttp.ResponseError
	if errors.As(err, &re) && re.HTTPStatusCode() == http.StatusNotFound {
		return true
	}
	var ae smithy.APIError
	if errors.As(err, &ae) {
		switch ae.ErrorCode() {
		case "NotFound", "NoSuchKey":
			return true
		}
	}
	return false
}

func sleepCtx(ctx context.Context, d time.Duration) error {
	t := time.NewTimer(d)
	defer t.Stop()
	select {
	case <-t.C:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

// List implements datastore.Storage.
func (s *s3Storage) List(ctx context.Context, prefix string) ([]string, error) {
	files := make([]string, 0)
	p := s3.NewListObjectsV2Paginator(s.cli, &s3.ListObjectsV2Input{Bucket: &s.bucketName, Prefix: &prefix})
	for p.HasMorePages() {
		page, err := p.NextPage(ctx)
		if err != nil {
			return nil, fmt.Errorf("s3storage.List %s: %w", prefix, err)
		}
		for _, obj := range page.Contents {
			files = append(files, aws.ToString(obj.Key))
		}
	}
	return files, nil
}

// Delete implements datastore.Storage.
func (s *s3Storage) Delete(ctx context.Context, filepath string) error {
	_, err := s.cli.DeleteObject(ctx, &s3.DeleteObjectInput{Bucket: &s.bucketName, Key: &filepath})
	if err != nil {
		return fmt.Errorf("s3storage.Delete %s: %w", filepath, err)
	}
	return nil
}

// Exists implements datastore.Storage. Only a 404 means "does not exist"; other errors
// (timeouts, 5xx, auth) are retried and then returned, so that a flaky HEAD never makes
// the pipeline redo (and re-upload) a finished day.
func (s *s3Storage) Exists(ctx context.Context, filepath string) (bool, error) {
	var err error
	for i := 0; i < s.existsAttempts; i++ {
		if i > 0 {
			if sErr := sleepCtx(ctx, s.existsBackoff*time.Duration(i)); sErr != nil {
				return false, sErr
			}
		}
		_, err = s.cli.HeadObject(ctx, &s3.HeadObjectInput{Bucket: &s.bucketName, Key: &filepath})
		if err == nil {
			return true, nil
		}
		if isNotFound(err) {
			return false, nil
		}
		log.Printf("s3storage: HEAD %s failed (attempt %d/%d): %v", filepath, i+1, s.existsAttempts, err)
	}
	return false, fmt.Errorf("s3storage.Exists %s: %w", filepath, err)
}

// Get implements datastore.Storage.
func (s *s3Storage) Get(ctx context.Context, filepath string) (io.ReadCloser, error) {
	out, err := s.cli.GetObject(ctx, &s3.GetObjectInput{Bucket: &s.bucketName, Key: &filepath})
	if err != nil {
		if isNotFound(err) {
			return nil, os.ErrNotExist
		}
		return nil, fmt.Errorf("s3storage.Get %s: %w", filepath, err)
	}
	return out.Body, nil
}

// Store implements datastore.Storage: a single PUT (objects are < 5 GB) retried with
// backoff. Every attempt starts from offset 0 of reader, so a retry after a partial
// transfer can never store a truncated object.
func (s *s3Storage) Store(ctx context.Context, reader io.ReadSeeker, filepath string) error {
	size, err := reader.Seek(0, io.SeekEnd)
	if err != nil {
		return fmt.Errorf("s3storage.Store %s: size: %w", filepath, err)
	}
	for i := 0; i < s.attempts; i++ {
		if i > 0 {
			if sErr := sleepCtx(ctx, s.backoff*time.Duration(i)); sErr != nil {
				return sErr
			}
		}
		if _, sErr := reader.Seek(0, io.SeekStart); sErr != nil {
			return fmt.Errorf("s3storage.Store %s: seek: %w", filepath, sErr)
		}
		_, err = s.cli.PutObject(ctx, &s3.PutObjectInput{
			Bucket:        &s.bucketName,
			Key:           &filepath,
			Body:          reader,
			ContentLength: aws.Int64(size),
		})
		if err == nil {
			return nil
		}
		log.Printf("s3storage: upload of %s failed (attempt %d/%d): %v", filepath, i+1, s.attempts, err)
	}
	return fmt.Errorf("s3storage.Store %s: giving up after %d attempts: %w", filepath, s.attempts, err)
}

func (s *s3Storage) Close() error {
	return nil
}
