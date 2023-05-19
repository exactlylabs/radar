package models

import (
	_ "embed"
)

//go:embed measlinkresult.avsc
var MeasLinkResultSchema string

type MeasLinkResult struct {
	DownloadId string `avro:"download_id"`
	UploadId   string `avro:"upload_id"`
}
