package clickhousestorages

import (
	"context"
	"fmt"
	"log"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorages/views"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/google/uuid"
)

type summariesStorage struct {
	conn driver.Conn
}

func (*summariesStorage) Close() error {
	return nil
}

func (*summariesStorage) Open() error {
	return nil
}

func (ss *summariesStorage) Connected() error {
	return errors.Wrap(ss.conn.Ping(context.Background()), "summariesStorage#Connected")
}

// Summarize implements storages.SummariesStorage
func (ss *summariesStorage) Summarize(from int) error {
	log.Println("summariesStorage#Summarize Starting Updating Views")
	for _, name := range views.ViewsCreationOrder[from:] {
		query := views.MaterializedViews[name]
		tmpName := name + "_tmp"
		if err := ss.conn.Exec(context.Background(), fmt.Sprintf("DROP VIEW %s", tmpName)); err != nil {
			log.Println(errors.Wrap(err, "summariesStorage#Summarize Exec Drop"))
		}
		if err := ss.conn.Exec(context.Background(), query); err != nil {
			return errors.Wrap(err, "summariesStorage#Summarize Exec Create")
		}
		log.Println("Created View", tmpName)
		// Exchange the names
		if err := ss.conn.Exec(context.Background(), fmt.Sprintf("EXCHANGE TABLES %s AND %s", tmpName, name)); err != nil {
			log.Println(errors.Wrap(err, "summariesStorage#Summarize Exec Exchange"))
			log.Println("Trying to rename instead")
			if err := ss.conn.Exec(context.Background(), fmt.Sprintf("RENAME TABLE %s TO %s", tmpName, name)); err != nil {
				return errors.Wrap(err, "summariesStorage#Summarize Exec Rename")
			}
		}
		log.Println("Renamed to View", name)
	}
	log.Println("Finished updating views")
	return nil
}

// SummaryForGeoAndASN implements storages.SummariesStorage
func (ss *summariesStorage) SummaryForGeoAndASN(geospaceId string, asnId string, filter storages.SummaryFilter) (*storages.GeospaceSummaryResult, error) {
	query, args, err := geospaceASNSummaryQuery(geospaceId, asnId, filter)
	if err != nil {
		return nil, errors.Wrap(err, "summariesStorage#SummaryForGeoAndASN geospaceASNSummaryQuery")
	}
	rows, err := ss.conn.Query(context.Background(), query, args...)
	if err != nil {
		return nil, errors.Wrap(err, "summariesStorage#SummaryForGeoAndASN Query")
	}
	res := &storages.GeospaceSummaryResult{}
	for rows.Next() {
		if err := scanToSummaryResult(rows, res, true); err != nil {
			return nil, errors.Wrap(err, "summariesStorage#SummaryForGeoAndASN scanToSummaryResult")
		}
	}
	return res, nil
}

// SummaryForGeospace implements storages.SummariesStorage
func (ss *summariesStorage) SummaryForGeospace(geospaceId string, filter storages.SummaryFilter) (*storages.GeospaceSummaryResult, error) {
	query, args, err := geospaceSummaryQuery(geospaceId, filter)
	if err != nil {
		return nil, errors.Wrap(err, "summariesStorage#SummaryForGeospace geospaceSummaryQuery")
	}
	rows, err := ss.conn.Query(context.Background(), query, args...)
	if err != nil {
		return nil, errors.Wrap(err, "summariesStorage#SummaryForGeospace Query")
	}
	res := &storages.GeospaceSummaryResult{
		Geospace: storages.DetailedGeospace{},
	}
	for rows.Next() {
		if err := scanToSummaryResult(rows, res, false); err != nil {
			return nil, errors.Wrap(err, "summariesStorage#SummaryForGeospace scanToSummaryResult")
		}
	}
	return res, nil
}

// SummaryForNamespace implements storages.SummariesStorage
func (ss *summariesStorage) SummaryForNamespace(namespace namespaces.Namespace, filter storages.SummaryFilter) ([]storages.GeospaceSummaryResult, error) {
	query, args, err := summaryQuery(namespace, filter)
	if err != nil {
		return nil, errors.Wrap(err, "summariesStorage#SummaryForNamespace mountSummaryQuery")
	}
	rows, err := ss.conn.Query(context.Background(), query, args...)
	if err != nil {
		return nil, errors.Wrap(err, "summariesStorage#SummaryForNamespace Query")
	}
	defer rows.Close()
	// Since we return a summary from all geospaces, we hold their values here
	geoResults := map[string]*storages.GeospaceSummaryResult{}
	for rows.Next() {
		// For every row, check if the geospace returned from the query exists
		// if not, create a new and register it into the map so we can populate it
		// otherwise, we just complete the information (upload or download)
		score := storages.MeasurementScore{}
		g := storages.DetailedGeospace{Namespace: namespace}
		gParent := &storages.Geospace{}
		var parentNs string
		var upload bool
		var medMbps, medMinRTT float64
		var badCount, mediumCount, goodCount uint64
		if err := rows.Scan(
			&medMbps, &medMinRTT, &badCount, &mediumCount, &goodCount,
			&score.TotalSamples, &upload, &g.Id, &g.GeoId, &g.Name, &g.Centroid[0], &g.Centroid[1],
			&gParent.Id, &gParent.Name, &gParent.GeoId, &parentNs, &gParent.Centroid[0], &gParent.Centroid[1], &gParent.ParentId,
		); err != nil {
			return nil, errors.Wrap(err, "summariesStorage#SummaryForNamespace Scan")
		}
		if _, exists := geoResults[g.Id]; !exists {
			geoResults[g.Id] = &storages.GeospaceSummaryResult{
				Geospace: g,
			}
		}
		res := geoResults[g.Id]
		score.Bad = float64(badCount) / float64(score.TotalSamples)
		score.Medium = float64(mediumCount) / float64(score.TotalSamples)
		score.Good = float64(goodCount) / float64(score.TotalSamples)
		if upload {
			res.UploadMedian = medMbps
			res.UploadScores = score
		} else {
			res.DownloadMedian = medMbps
			res.LatencyMedian = medMinRTT
			res.DownloadScores = score
		}
		if gParent.Id != "" && uuid.MustParse(gParent.Id) != uuid.Nil {
			gParent.Namespace = namespaces.Namespace(parentNs)
			res.Geospace.Parent = gParent
		}
	}

	returnValues := make([]storages.GeospaceSummaryResult, len(geoResults))
	i := 0
	for _, v := range geoResults {
		returnValues[i] = *v
		i++
	}
	return returnValues, nil
}

// SummaryForNamespaceAndASN implements storages.SummariesStorage
func (ss *summariesStorage) SummaryForNamespaceAndASN(namespace namespaces.Namespace, asnId string, filter storages.SummaryFilter) ([]storages.GeospaceSummaryResult, error) {
	query, args, err := summaryAsnQuery(namespace, asnId, filter)
	if err != nil {
		return nil, errors.Wrap(err, "summariesStorage#SummaryForNamespaceAndASN summaryAsnQuery")
	}
	rows, err := ss.conn.Query(context.Background(), query, args...)
	if err != nil {
		return nil, errors.Wrap(err, "summariesStorage#SummaryForNamespaceAndASN Query")
	}
	defer rows.Close()
	// Since we return a summary from all geospaces, we hold their values here
	geoResults := map[string]*storages.GeospaceSummaryResult{}
	for rows.Next() {
		// For every row, check if the geospace returned from the query exists
		// if not, create a new and register it into the map so we can populate it
		// otherwise, we just complete the information (upload or download)
		score := storages.MeasurementScore{}
		g := storages.DetailedGeospace{Namespace: namespace}
		gParent := &storages.Geospace{}
		var parentNs string
		asnOrg := &storages.ASNOrg{
			Id: asnId,
		}
		var upload bool
		var medMbps, medMinRTT float64
		var badCount, mediumCount, goodCount uint64
		if err := rows.Scan(
			&medMbps, &medMinRTT, &badCount, &mediumCount, &goodCount,
			&score.TotalSamples, &upload, &g.Id, &g.GeoId, &g.Name,
			&g.Centroid[0], &g.Centroid[1],
			&gParent.Id, &gParent.Name, &gParent.GeoId, &parentNs, &gParent.Centroid[0],
			&gParent.Centroid[1], &gParent.ParentId,
			&asnOrg.Organization); err != nil {
			return nil, errors.Wrap(err, "summariesStorage#SummaryForNamespaceAndASN Scan")
		}
		if _, exists := geoResults[g.Id]; !exists {
			geoResults[g.Id] = &storages.GeospaceSummaryResult{
				Geospace: g,
				ASNOrg:   asnOrg,
			}
		}
		res := geoResults[g.Id]
		score.Bad = float64(badCount) / float64(score.TotalSamples)
		score.Medium = float64(mediumCount) / float64(score.TotalSamples)
		score.Good = float64(goodCount) / float64(score.TotalSamples)
		if upload {
			res.UploadMedian = medMbps
			res.UploadScores = score
		} else {
			res.DownloadMedian = medMbps
			res.LatencyMedian = medMinRTT
			res.DownloadScores = score
		}
		if gParent.Id != "" && uuid.MustParse(gParent.Id) != uuid.Nil {
			gParent.Namespace = namespaces.Namespace(parentNs)
			res.Geospace.Parent = gParent
		}
	}

	returnValues := make([]storages.GeospaceSummaryResult, len(geoResults))
	i := 0
	for _, v := range geoResults {
		returnValues[i] = *v
		i++
	}
	return returnValues, nil
}

func NewSummariesStorage(conn driver.Conn) storages.SummariesStorage {
	return &summariesStorage{
		conn: conn,
	}
}
