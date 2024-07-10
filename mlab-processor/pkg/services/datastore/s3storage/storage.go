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

type s3Storage struct {
	bucketName string
	awsSession *session.Session
	cli        *s3.S3
	uploader   *Uploader
}

func New(bucketName, accessKey, secretKey, endpoint, region string) (datastore.Storage, error) {
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
		uploader:   NewUploader(bucketName, awsSession),
	}, nil
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
