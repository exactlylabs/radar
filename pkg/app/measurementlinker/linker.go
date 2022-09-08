package measurementlinker

import (
	"fmt"
	"sync"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/app/writer"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
)

const StepName = "measurementlink"
const linkTimeFrame = time.Minute * 10 // Amount of time to consider a measurement of the same ip as being from the same test set

func cleanIpMap(ipMap *sync.Map) {
	ipMap.Range(func(k any, v any) bool {
		if time.Since(time.Unix(v.(*models.GeocodedResult).StartedAt, 0)) > linkTimeFrame {
			ipMap.Delete(k)
		}
		return true
	})
}

func LinkMeasurements(ds datastore.DataStore, geocodeDS datastore.DataStore, date time.Time, ipMap *sync.Map) {
	it, err := geocodeDS.ItemsReader()
	if err != nil {
		panic(fmt.Errorf("measurementlinker.LinkMeasurements ItemReader: %w", err))
	}
	writer := writer.NewWriter(ds)
	defer writer.Close()
	for it.Next() {
		next, err := func() (any, error) {
			defer timer.TimeIt(time.Now(), "LinkMeasurementsReadRow")
			return it.GetRow()
		}()
		if err != nil {
			panic(fmt.Errorf("measurementlinker.LinkMeasurements GetRow: %w", err))
		}
		measurement := next.(*models.GeocodedResult)
		if m, loaded := ipMap.LoadOrStore(measurement.IP, measurement); loaded {
			existingMeas := m.(*models.GeocodedResult)
			if existingMeas.Upload == measurement.Upload || float64(measurement.StartedAt-existingMeas.StartedAt) > linkTimeFrame.Seconds() {
				ipMap.Store(measurement.IP, measurement)
			} else {
				item := &models.MeasLinkResult{}
				if measurement.Upload {
					item.DownloadId = existingMeas.Id
					item.UploadId = measurement.Id
				} else {
					item.DownloadId = existingMeas.Id
					item.UploadId = measurement.Id
				}
				writer.WriteItem(item)
			}
		}
	}
	cleanIpMap(ipMap)
}
