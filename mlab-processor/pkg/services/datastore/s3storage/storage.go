package s3storage

import (
	"context"
	"io"

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
	Workers    int
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
		uploader:   NewUploader(opts.BucketName, awsSession, opts.Workers),
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
	_, err := s.cli.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(filepath),
	})
	if err != nil {
		errors.W(err)
	}
	return nil
}

// Exists implements datastore.Storage.
func (s *s3Storage) Exists(ctx context.Context, filepath string) (bool, error) {
	_, err := s.cli.HeadObject(&s3.HeadObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(filepath),
	})
	if err != nil {
		if awsErr, ok := err.(awserr.Error); ok && awsErr.Code() == "NotFound" {
			return false, nil
		}
		return false, errors.W(err)
	}
	return true, nil
}

// Get implements datastore.Storage.
func (s *s3Storage) Get(ctx context.Context, filepath string) (io.ReadCloser, error) {
	r, err := s.cli.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(filepath),
	})
	if err != nil {
		return nil, errors.W(err)
	}
	return r.Body, nil
}

// Store implements datastore.Storage.
func (s *s3Storage) Store(ctx context.Context, reader io.ReadCloser, filepath string) error {
	s.uploader.Upload(reader, filepath)
	return nil
}

func (s *s3Storage) Close() error {
	s.uploader.Close()
	return nil
}
