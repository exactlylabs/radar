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
	// objects of at least multipartThreshold bytes are uploaded in partSize parts,
	// concurrency at a time (B2 wants parts of 5 MB or more)
	multipartThreshold int64
	partSize           int64
	concurrency        int
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

		multipartThreshold: 64 << 20,
		partSize:           32 << 20,
		concurrency:        8,
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

// Store implements datastore.Storage. Small objects go in a single PUT retried with
// backoff; every attempt starts from offset 0 of reader, so a retry after a partial
// transfer can never store a truncated object. Objects of multipartThreshold bytes or
// more (a day's files are 100-500 MB) go as a multipart upload with concurrency parts
// in flight, each part retried on its own; the object only exists once every part is
// in and the upload is completed, and a failed upload is aborted.
func (s *s3Storage) Store(ctx context.Context, reader io.ReadSeeker, filepath string) error {
	size, err := reader.Seek(0, io.SeekEnd)
	if err != nil {
		return fmt.Errorf("s3storage.Store %s: size: %w", filepath, err)
	}
	if ra, ok := reader.(io.ReaderAt); ok && size >= s.multipartThreshold {
		return s.storeMultipart(ctx, ra, size, filepath)
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

type completedPart struct {
	n    int32
	etag string
}

func (s *s3Storage) storeMultipart(ctx context.Context, ra io.ReaderAt, size int64, filepath string) error {
	start := time.Now()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	create, err := s.cli.CreateMultipartUpload(ctx, &s3.CreateMultipartUploadInput{Bucket: &s.bucketName, Key: &filepath})
	if err != nil {
		return fmt.Errorf("s3storage.Store %s: creating multipart upload: %w", filepath, err)
	}
	uploadID := create.UploadId
	nParts := int((size + s.partSize - 1) / s.partSize)
	parts := make([]completedPart, nParts)
	errs := make(chan error, nParts)
	sem := make(chan struct{}, s.concurrency)
	for i := 0; i < nParts; i++ {
		sem <- struct{}{}
		go func(i int) {
			defer func() { <-sem }()
			off := int64(i) * s.partSize
			n := s.partSize
			if off+n > size {
				n = size - off
			}
			etag, err := s.uploadPart(ctx, uploadID, filepath, int32(i+1), io.NewSectionReader(ra, off, n), n)
			if err != nil {
				cancel() // stop the other parts
			}
			parts[i] = completedPart{int32(i + 1), etag}
			errs <- err
		}(i)
	}
	for i := 0; i < nParts; i++ {
		if pErr := <-errs; pErr != nil && err == nil {
			err = pErr
		}
	}
	if err != nil {
		// a fresh context: the shared one is cancelled
		abortCtx, abortCancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer abortCancel()
		if _, aErr := s.cli.AbortMultipartUpload(abortCtx, &s3.AbortMultipartUploadInput{Bucket: &s.bucketName, Key: &filepath, UploadId: uploadID}); aErr != nil {
			log.Printf("s3storage: aborting multipart upload of %s: %v", filepath, aErr)
		}
		return fmt.Errorf("s3storage.Store %s: %w", filepath, err)
	}
	completed := make([]types.CompletedPart, nParts)
	for i, p := range parts {
		completed[i] = types.CompletedPart{PartNumber: aws.Int32(p.n), ETag: aws.String(p.etag)}
	}
	_, err = s.cli.CompleteMultipartUpload(ctx, &s3.CompleteMultipartUploadInput{
		Bucket: &s.bucketName, Key: &filepath, UploadId: uploadID,
		MultipartUpload: &types.CompletedMultipartUpload{Parts: completed},
	})
	if err != nil {
		return fmt.Errorf("s3storage.Store %s: completing multipart upload: %w", filepath, err)
	}
	log.Printf("s3storage: uploaded %s (%d MB, %d parts) in %.0fs", filepath, size>>20, nParts, time.Since(start).Seconds())
	return nil
}

// uploadPart sends one part, retrying with backoff from the part's start.
func (s *s3Storage) uploadPart(ctx context.Context, uploadID *string, filepath string, n int32, body *io.SectionReader, size int64) (string, error) {
	var err error
	for i := 0; i < s.attempts; i++ {
		if i > 0 {
			if sErr := sleepCtx(ctx, s.backoff*time.Duration(i)); sErr != nil {
				return "", sErr
			}
		}
		if _, sErr := body.Seek(0, io.SeekStart); sErr != nil {
			return "", sErr
		}
		var out *s3.UploadPartOutput
		out, err = s.cli.UploadPart(ctx, &s3.UploadPartInput{
			Bucket: &s.bucketName, Key: &filepath, UploadId: uploadID, PartNumber: aws.Int32(n),
			Body: body, ContentLength: aws.Int64(size),
		})
		if err == nil {
			return aws.ToString(out.ETag), nil
		}
		if ctx.Err() != nil {
			return "", err
		}
		log.Printf("s3storage: part %d of %s failed (attempt %d/%d): %v", n, filepath, i+1, s.attempts, err)
	}
	return "", fmt.Errorf("part %d: giving up after %d attempts: %w", n, s.attempts, err)
}

func (s *s3Storage) Close() error {
	return nil
}
