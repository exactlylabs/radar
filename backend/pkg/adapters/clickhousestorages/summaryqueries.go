package clickhousestorages

import (
	"fmt"
	"strings"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
	"github.com/google/uuid"
)

// aggWindow has the rules to select the aggregation window based on the filter
func aggWindow(filter storages.SummaryFilter) string {
	if filter.Week != nil && filter.Year != nil {
		return "week"
	} else if filter.Month != nil && filter.Year != nil {
		return "month"
	} else if filter.Semester != nil && filter.Year != nil {
		return "semester"
	} else if filter.Quarter != nil && filter.Year != nil {
		return "quarter"
	} else if filter.Year != nil {
		return "year"
	} else if filter.Year == nil && filter.Semester == nil && filter.Month == nil && filter.Week == nil {
		return "alltime"
	}
	return "alltime"
}

func viewName(asnId *string, filter storages.SummaryFilter) string {
	aggWindow := aggWindow(filter)
	if aggWindow == "" {
		return ""
	}
	if asnId != nil {
		return fmt.Sprintf("summary_%s", aggWindow)
	}
	return fmt.Sprintf("summary_geospace_%s", aggWindow)
}

func summaryFilter(geospaceId *string, asnOrgId *string, filter storages.SummaryFilter) (string, []any) {
	args := []interface{}{}
	filterStr := []string{}

	if geospaceId != nil {
		filterStr = append(filterStr, "geospace_id = ?")
		args = append(args, *geospaceId)
	}
	if asnOrgId != nil {
		filterStr = append(filterStr, "asn_org_id = ?")
		args = append(args, *asnOrgId)
	}
	switch aggWindow(filter) {
	case "week":
		filterStr = append(filterStr, "year = ? AND week = ?")
		args = append(args, *filter.Year, *filter.Week)
	case "month":
		filterStr = append(filterStr, "year = ? AND month = ?")
		args = append(args, *filter.Year, *filter.Month)
	case "quarter":
		filterStr = append(filterStr, "year = ? AND quarter = ?")
		args = append(args, *filter.Year, *filter.Quarter)
	case "semester":
		filterStr = append(filterStr, "year = ? AND semester = ?")
		args = append(args, *filter.Year, *filter.Semester)
	case "year":
		filterStr = append(filterStr, "year = ?")
		args = append(args, *filter.Year)
	}

	return strings.Join(filterStr, "AND "), args
}

func summaryQuery(namespace namespaces.Namespace, filter storages.SummaryFilter) (query string, args []interface{}, err error) {
	query = `
	SELECT med_mbps, med_min_rtt, bad_count, normal_count, 
		good_count, total_samples, upload, 
		g.id, g.geo_id, g.name, g.centroid_lat, g.centroid_long,
		p.id, p.name, p.geo_id, p.namespace, p.centroid_lat, p.centroid_long, p.parent_id
	`
	viewName := viewName(nil, filter)
	if viewName == "" {
		return "", nil, errors.New("chSummarizer#summaryQuery wrong filter set")
	}
	query = fmt.Sprintf("%s FROM %s s JOIN geospaces g ON g.id = s.geospace_id LEFT JOIN geospaces p ON g.parent_id = p.id", query, viewName)
	filterStr, args := summaryFilter(nil, nil, filter)
	if filterStr != "" {
		query = fmt.Sprintf("%s WHERE %s AND geospace_id IN (SELECT id FROM geospaces WHERE namespace = ?)", query, filterStr)
		args = append(args, namespace)
	} else {
		query += " WHERE geospace_id IN (SELECT id FROM geospaces WHERE namespace = ?)"
		args = append(args, namespace)
	}
	return
}

func summaryAsnQuery(namespace namespaces.Namespace, asnOrgId string, filter storages.SummaryFilter) (query string, args []interface{}, err error) {
	query = `
	SELECT med_mbps, med_min_rtt, bad_count, normal_count, 
		good_count, total_samples, upload, 
		g.id, g.geo_id, g.name, g.centroid_lat, g.centroid_long, 
		p.id, p.name, p.geo_id, p.namespace, p.centroid_lat, p.centroid_long, p.parent_id,
		a.name
	`
	viewName := viewName(&asnOrgId, filter)
	if viewName == "" {
		return "", nil, errors.New("chSummarizer#summaryQuery wrong filter set")
	}
	query = fmt.Sprintf("%s FROM %s s JOIN geospaces g ON g.id = s.geospace_id LEFT JOIN geospaces p ON g.parent_id = p.id JOIN asn_orgs a ON s.asn_org_id = a.id", query, viewName)
	filterStr, args := summaryFilter(nil, &asnOrgId, filter)
	if filterStr != "" {
		query = fmt.Sprintf("%s WHERE %s AND geospace_id IN (SELECT id FROM geospaces WHERE namespace = ?) AND s.asn_org_id = ?", query, filterStr)
		args = append(args, namespace, asnOrgId)
	} else {
		query += " WHERE geospace_id IN (SELECT id FROM geospaces WHERE namespace = ?) AND s.asn_org_id = ?"
		args = append(args, namespace, asnOrgId)
	}
	return
}

func geospaceSummaryQuery(geospaceId string, filter storages.SummaryFilter) (query string, args []interface{}, err error) {
	query = `
	SELECT med_mbps, med_min_rtt, bad_count, normal_count, 
		good_count, total_samples, upload, 
		g.id, g.geo_id, g.namespace, g.name, g.centroid_lat, g.centroid_long, 
		p.id, p.name, p.geo_id, p.namespace, p.centroid_lat, p.centroid_long, p.parent_id
	`
	viewName := viewName(nil, filter)
	if viewName == "" {
		return "", nil, errors.New("clickhousesummarizer.geospaceSummaryQuery wrong filter set")
	}
	query = fmt.Sprintf("%s FROM %s s JOIN geospaces g ON g.id = s.geospace_id LEFT JOIN geospaces p ON g.parent_id = p.id ", query, viewName)
	filterStr, args := summaryFilter(&geospaceId, nil, filter)
	query = fmt.Sprintf("%s WHERE %s", query, filterStr)
	return
}

func geospaceASNSummaryQuery(geospaceId string, asnId string, filter storages.SummaryFilter) (query string, args []interface{}, err error) {
	query = `
	SELECT med_mbps, med_min_rtt, bad_count, normal_count, 
		good_count, total_samples, upload, 
		g.id, g.geo_id, g.namespace, g.name, g.centroid_lat, g.centroid_long, 
		p.id, p.name, p.geo_id, p.namespace, p.centroid_lat, p.centroid_long, p.parent_id,
		a.id, a.name
	`
	viewName := viewName(&asnId, filter)
	if viewName == "" {
		return "", nil, errors.New("clickhousesummarizer.geospaceAsnSummaryQuery wrong filter set")
	}
	query = fmt.Sprintf("%s FROM %s s JOIN geospaces g ON g.id = s.geospace_id LEFT JOIN geospaces p ON g.parent_id = p.id LEFT JOIN asn_orgs a ON a.id = s.asn_org_id", query, viewName)
	filterStr, args := summaryFilter(&geospaceId, &asnId, filter)
	query = fmt.Sprintf("%s WHERE %s", query, filterStr)
	return
}

func scanToSummaryResult(rows driver.Rows, res *storages.GeospaceSummaryResult, hasASN bool) (err error) {
	score := storages.MeasurementScore{}
	var upload bool
	var medMbps, medMinRTT float64
	var badCount, mediumCount, goodCount uint64
	var asnOrgId, asnName *string
	var ns string
	var parentNs string
	gParent := storages.Geospace{}
	if hasASN {
		err = rows.Scan(
			&medMbps, &medMinRTT, &badCount, &mediumCount, &goodCount,
			&score.TotalSamples, &upload, &res.Geospace.Id, &res.Geospace.GeoId,
			&ns, &res.Geospace.Name, &res.Geospace.Centroid[0], &res.Geospace.Centroid[1],
			&gParent.Id, &gParent.Name, &gParent.GeoId, &parentNs, &gParent.Centroid[0],
			&gParent.Centroid[1], &gParent.ParentId, &asnOrgId, &asnName,
		)
	} else {
		err = rows.Scan(
			&medMbps, &medMinRTT, &badCount, &mediumCount, &goodCount,
			&score.TotalSamples, &upload, &res.Geospace.Id, &res.Geospace.GeoId,
			&ns, &res.Geospace.Name, &res.Geospace.Centroid[0], &res.Geospace.Centroid[1],
			&gParent.Id, &gParent.Name, &gParent.GeoId, &parentNs, &gParent.Centroid[0],
			&gParent.Centroid[1], &gParent.ParentId,
		)
	}
	if err != nil {
		return errors.Wrap(err, "clickhousesummarizer.scanToSummaryResult Scan")
	}
	res.Geospace.Namespace = namespaces.Namespace(ns)
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
	if hasASN {
		res.ASNOrg = &storages.ASNOrg{
			Id:           *asnOrgId,
			Organization: *asnName,
		}
	}
	if gParent.Id != "" && uuid.MustParse(gParent.Id) != uuid.Nil {
		gParent.Namespace = namespaces.Namespace(parentNs)
		res.Geospace.Parent = &gParent

	}
	return nil
}
