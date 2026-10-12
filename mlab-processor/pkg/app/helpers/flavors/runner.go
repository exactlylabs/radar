package flavors

import (
	"context"
	"fmt"

	"github.com/exactlylabs/mlab-processor/pkg/app/config"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher"
	"github.com/exactlylabs/mlab-processor/pkg/app/pipeline"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/encoders/avro"
)

// NewRunner builds a pipeline runner over the configured storage (STORAGE_TYPE, or
// storageOverride when not empty). The caller closes the returned storage.
func NewRunner(ctx context.Context, conf *config.ProcessorConfig, storageOverride string, opts fetcher.Options) (*pipeline.Runner, datastore.Storage, error) {
	if storageOverride != "" {
		conf.StorageType = storageOverride
	}
	if conf.AvroCodec != "" {
		if err := avro.SetDefaultCodec(avro.CodecName(conf.AvroCodec)); err != nil {
			return nil, nil, fmt.Errorf("AVRO_CODEC: %w", err)
		}
	}
	storage, err := GetStorageFromConfig(ctx, conf)
	if err != nil {
		return nil, nil, err
	}
	return &pipeline.Runner{
		Provider:  NewAvroStorageDataStoreFactory(storage),
		Storage:   storage,
		Conf:      conf,
		FetchOpts: opts,
	}, storage, nil
}
