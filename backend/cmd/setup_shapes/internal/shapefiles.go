package internal

import (
	"io"
	"net/http"
	"os"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
)

func DownloadShapeFile(dst string, url string) error {
	res, err := http.Get(url)
	if err != nil {
		if err != nil {
			return errors.Wrap(err, "internal.DownloadShapeFile Get")
		}
	}
	if res.StatusCode != 200 {
		return errors.New("internal.DownloadShapeFile invalid status %d", res.StatusCode)
	}
	defer res.Body.Close()
	f, err := os.OpenFile(dst, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0664)
	if err != nil {
		return errors.Wrap(err, "internal.DownloadShapeFile OpenFile")
	}
	defer f.Close()
	_, err = io.Copy(f, res.Body)
	if err != nil {
		return errors.Wrap(err, "internal.DownloadShapeFile Copy")
	}
	return nil
}
