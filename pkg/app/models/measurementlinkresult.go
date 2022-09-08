package models

import (
	_ "embed"
)

//go:embed measlinkresult.avsc
var MeasLinkResultSchema string

type MeasLinkResult struct {
	DownloadId string `parquet:"name=download_id, type=BYTE_ARRAY, convertedtype=UTF8" avro:"download_id"`
	UploadId   string `parquet:"name=upload_id, type=BYTE_ARRAY, convertedtype=UTF8" avro:"upload_id"`
}
