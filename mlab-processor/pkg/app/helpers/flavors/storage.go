package flavors

import (
	"context"
	"log"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-processor/pkg/app/config"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore/gcpstorage"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore/localstorage"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore/s3storage"
)

func GetStorageFromConfig(ctx context.Context, conf *config.ProcessorConfig) (datastore.Storage, error) {
	switch conf.StorageType {
	case "gcs":
		log.Println("Using GCS as Storage mechanism")
		ctx := context.Background()
		storage, err := gcpstorage.New(ctx, conf.UploadBucketName)
		if err != nil {
			return nil, errors.W(err)
		}
		return storage, nil

	case "s3":
		log.Println("Using Backblaze B2 as Storage mechanism")
		storage, err := s3storage.New(
			s3storage.S3StorageOptions{
				BucketName: conf.UploadBucketName,
				AccessKey:  conf.S3AccessKey,
				SecretKey:  conf.S3SecretKey,
				Endpoint:   conf.S3Endpoint,
				Region:     conf.S3Region,
				Workers:    1,
			},
		)
		if err != nil {
			return nil, errors.W(err)
		}
		return storage, nil
	case "local":
		log.Println("Using local storage")
		storage, err := localstorage.New("storage")
		if err != nil {
			return nil, errors.W(err)
		}
		return storage, nil
	}
	return nil, errors.New("Unknown storage type")
}
