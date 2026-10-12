package s3storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/exactlylabs/go-errors/pkg/errors"
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
	awsSession *session.Session
	cli        *s3.S3
	uploader   *Uploader
}

func New(opts S3StorageOptions) (datastore.Storage, error) {
	s3Config := &aws.Config{
		Credentials:      credentials.NewStaticCredentials(opts.AccessKey, opts.SecretKey, ""),
		Endpoint:         aws.String(opts.Endpoint),
		Region:           aws.String(opts.Region),
		S3ForcePathStyle: aws.Bool(true),
	}
	awsSession, err := session.NewSession(s3Config)
	if err != nil {
		return nil, errors.W(err)
	}
	cli := s3.New(awsSession)
	return &s3Storage{
		bucketName: opts.BucketName,
		awsSession: awsSession,
		cli:        cli,
		uploader:   NewUploader(opts.BucketName, awsSession),
	}, nil
}

// List implements datastore.Storage.
func (s *s3Storage) List(ctx context.Context, prefix string) ([]string, error) {
	files := make([]string, 0)
	opts := &s3.ListObjectsInput{Bucket: &s.bucketName, Prefix: &prefix}
	err := s.cli.ListObjectsPagesWithContext(ctx, opts, func(p *s3.ListObjectsOutput, last bool) (shouldContinue bool) {
		for _, obj := range p.Contents {
			files = append(files, *obj.Key)
		}
		return true
	})
	if err != nil {
		return nil, errors.W(err)

	}
	return files, nil
}

// Delete implements datastore.Storage.
func (s *s3Storage) Delete(ctx context.Context, filepath string) error {
	_, err := s.cli.DeleteObjectWithContext(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(filepath),
	})
	if err != nil {
		return errors.W(err)
	}
	return nil
}

// isNotFound is true only when the server positively answered 404 / NoSuchKey.
func isNotFound(err error) bool {
	if reqErr, ok := err.(awserr.RequestFailure); ok && reqErr.StatusCode() == http.StatusNotFound {
		return true
	}
	if awsErr, ok := err.(awserr.Error); ok {
		switch awsErr.Code() {
		case "NotFound", s3.ErrCodeNoSuchKey:
			return true
		}
	}
	return false
}

// existsAttempts / existsBackoff bound the retries of a failing HEAD request.
var existsAttempts = 4
var existsBackoff = 5 * time.Second

// Exists implements datastore.Storage. Only a 404 means "does not exist"; other errors
// (timeouts, 5xx, auth) are retried and then returned, so that a flaky HEAD never makes
// the pipeline redo (and re-upload) a finished day.
func (s *s3Storage) Exists(ctx context.Context, filepath string) (bool, error) {
	var err error
	for i := 0; i < existsAttempts; i++ {
		if i > 0 {
			select {
			case <-time.After(existsBackoff * time.Duration(i)):
			case <-ctx.Done():
				return false, ctx.Err()
			}
		}
		_, err = s.cli.HeadObjectWithContext(ctx, &s3.HeadObjectInput{
			Bucket: aws.String(s.bucketName),
			Key:    aws.String(filepath),
		})
		if err == nil {
			return true, nil
		}
		if isNotFound(err) {
			return false, nil
		}
		log.Printf("s3storage: HEAD %s failed (attempt %d/%d): %v", filepath, i+1, existsAttempts, err)
	}
	return false, fmt.Errorf("s3storage.Exists %s: %w", filepath, err)
}

// Get implements datastore.Storage.
func (s *s3Storage) Get(ctx context.Context, filepath string) (io.ReadCloser, error) {
	r, err := s.cli.GetObjectWithContext(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(filepath),
	})
	if err != nil {
		if isNotFound(err) {
			return nil, os.ErrNotExist
		}
		return nil, errors.W(err)
	}
	return r.Body, nil
}

// Store implements datastore.Storage.
func (s *s3Storage) Store(ctx context.Context, reader io.ReadSeeker, filepath string) error {
	return s.uploader.Upload(reader, filepath)
}

func (s *s3Storage) Close() error {
	return nil
}
