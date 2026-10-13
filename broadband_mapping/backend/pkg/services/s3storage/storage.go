package s3storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"

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

// Read implements ingestor.Storage. The object is streamed; a read that fails, or ends before
// the object's size, is resumed with a Range request from the bytes already delivered, up to
// readResumes times. Connections do get cut on a busy link: on 2026-10-12 the ingestor died 15
// times in an hour with "avro: truncated block: unexpected EOF" while a fetch saturated it.
func (s *s3Storage) Read(ctx context.Context, path string) (io.ReadCloser, error) {
	r := &resumingReader{ctx: ctx, s: s, key: path, size: -1}
	if err := r.open(); err != nil {
		return nil, err
	}
	return r, nil
}

const readResumes = 10

type resumingReader struct {
	ctx     context.Context
	s       *s3Storage
	key     string
	body    io.ReadCloser
	offset  int64 // bytes delivered to the caller
	size    int64 // the object's size, -1 until the first response
	resumes int
}

func (r *resumingReader) open() error {
	in := &s3.GetObjectInput{Bucket: &r.s.bucketName, Key: &r.key}
	if r.offset > 0 {
		in.Range = aws.String(fmt.Sprintf("bytes=%d-", r.offset))
	}
	out, err := r.s.cli.GetObjectWithContext(r.ctx, in)
	if err != nil {
		return errors.W(err)
	}
	if r.size < 0 && out.ContentLength != nil {
		r.size = *out.ContentLength
	}
	r.body = out.Body
	return nil
}

func (r *resumingReader) Read(p []byte) (int, error) {
	for {
		n, err := r.body.Read(p)
		r.offset += int64(n)
		if err == nil {
			return n, nil
		}
		if err == io.EOF && (r.size < 0 || r.offset >= r.size) {
			return n, io.EOF
		}
		if r.ctx.Err() != nil {
			return n, err
		}
		if r.resumes >= readResumes {
			return n, errors.Wrap(err, "s3storage.Read %s: gave up after %d resumes at byte %d of %d", r.key, r.resumes, r.offset, r.size)
		}
		r.resumes++
		r.body.Close()
		log.Printf("s3storage.Read %s: %v at byte %d of %d, resume %d/%d\n", r.key, err, r.offset, r.size, r.resumes, readResumes)
		time.Sleep(time.Duration(r.resumes) * 2 * time.Second)
		if err := r.open(); err != nil {
			return n, err
		}
		if n > 0 {
			return n, nil
		}
	}
}

func (r *resumingReader) Close() error {
	return r.body.Close()
}
