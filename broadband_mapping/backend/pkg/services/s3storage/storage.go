package s3storage

import (
	"context"
	"io"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ingestor"
)

type s3Storage struct {
	bucketName string
	awsSession *session.Session
	cli        *s3.S3
}

func New(bucketName, accessKey, secretKey, endpoint, region string) (ingestor.Storage, error) {
	s3Config := &aws.Config{
		Credentials:      credentials.NewStaticCredentials(accessKey, secretKey, ""),
		Endpoint:         aws.String(endpoint),
		Region:           aws.String(region),
		S3ForcePathStyle: aws.Bool(true),
	}
	awsSession, err := session.NewSession(s3Config)
	if err != nil {
		return nil, errors.W(err)
	}
	cli := s3.New(awsSession)
	return &s3Storage{
		bucketName: bucketName,
		awsSession: awsSession,
		cli:        cli,
	}, nil
}

// Close implements ingestor.Storage.
func (s *s3Storage) Close() error {
	return nil
}

// List implements ingestor.Storage.
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

// Read implements ingestor.Storage.
func (s *s3Storage) Read(ctx context.Context, path string) (io.ReadCloser, error) {
	r, err := s.cli.GetObjectWithContext(ctx, &s3.GetObjectInput{
		Bucket: &s.bucketName,
		Key:    &path,
	})
	if err != nil {
		return nil, errors.W(err)
	}
	return r.Body, nil
}
