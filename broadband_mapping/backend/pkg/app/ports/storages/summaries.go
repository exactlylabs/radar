package storages

import (
	"fmt"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
)

type MeasurementScore struct {
	Bad          float64 `json:"bad"`
	Medium       float64 `json:"medium"`
	Good         float64 `json:"good"`
	TotalSamples uint64  `json:"total_samples"`
}

type GeospaceSummaryResult struct {
	Geospace       DetailedGeospace `json:"geospace"`
	ASNOrg         *ASNOrg          `json:"asn"`
	DownloadMedian float64          `json:"download_median"`
	UploadMedian   float64          `json:"upload_median"`
	LatencyMedian  float64          `json:"latency_median"`
	UploadScores   MeasurementScore `json:"upload_scores"`
	DownloadScores MeasurementScore `json:"download_scores"`
}

type GeoASNsResult struct {
	GeospaceId string `json:"geospace_id"`
	GeoId      string `json:"geo_id"`
	ASNId      string `json:"asn_id"`
	Org        string `json:"asn_org"`
}

// SummaryFilter has all possible filters.
// If nothing is given, it uses all data, if only year, it filters to that year.
// All other fields require that the Year is also provided, so their value is referenced to that year.
type SummaryFilter struct {
	Year     *int `json:"year"`
	Semester *int `json:"semester"`
	Quarter  *int `json:"quarter"`
	Month    *int `json:"month"`
	Week     *int `json:"week"` // Weeks of the Year.
}

func (sf SummaryFilter) String() string {
	var y, s, q, m, w string
	if sf.Year != nil {
		y = fmt.Sprintf("%d", *sf.Year)
	}
	if sf.Semester != nil {
		s = fmt.Sprintf("%d", *sf.Semester)
	}
	if sf.Quarter != nil {
		q = fmt.Sprintf("%d", *sf.Quarter)
	}
	if sf.Month != nil {
		m = fmt.Sprintf("%d", *sf.Month)
	}
	if sf.Week != nil {
		w = fmt.Sprintf("%d", *sf.Week)
	}
	return fmt.Sprintf("%s-%s-%s-%s-%s", y, s, q, m, w)
}

type SummariesStorage interface {
	Open() error
	Close() error
	Connected() error
	// Summarize is called when new data is ready to be summarized by this interface
	Summarize(from int) error
	SummaryForGeospace(geospaceId string, filter SummaryFilter) (*GeospaceSummaryResult, error)
	SummaryForGeoAndASN(geospaceId, asnId string, filter SummaryFilter) (*GeospaceSummaryResult, error)
	SummaryForNamespace(namespace namespaces.Namespace, filter SummaryFilter) ([]GeospaceSummaryResult, error)
	SummaryForNamespaceAndASN(namespace namespaces.Namespace, asnId string, filter SummaryFilter) ([]GeospaceSummaryResult, error)
}
