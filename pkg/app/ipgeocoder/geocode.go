package ipgeocoder

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"runtime"
	"strconv"
	"sync"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/config"
	"github.com/exactlylabs/mlab-processor/pkg/app/helpers"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/services/netmap"
	"github.com/exactlylabs/mlab-processor/pkg/services/storage"
)

type ipgeocodeWorkItem struct {
	fetchedResult *models.FetchedResult
	date          time.Time
}

type asnInfo struct {
	asn int
	org string
}

func addAsnFileToNetmap(nm *netmap.NetMap, filename string) error {
	file, fErr := os.Open(filename)
	if fErr != nil {
		return fmt.Errorf("addAsnFileToNetmap fErr: %w", fErr)
	}

	r := csv.NewReader(file)

	record, err := r.Read()
	if err != nil {
		return fmt.Errorf("addAsnFileToNetmap err 1: %w", err)
	}

	var networkIndex, asnIndex, asnOrgIndex int
	for index, header := range record {
		switch header {
		case "network":
			networkIndex = index
		case "autonomous_system_number":
			asnIndex = index
		case "autonomous_system_organization":
			asnOrgIndex = index
		}
	}

	count := 0

	for {
		record, err = r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("addAsnFileToNetmap err 2: %w", err)
		}

		asn, _ := strconv.Atoi(record[asnIndex])
		org := record[asnOrgIndex]

		_, network, pErr := net.ParseCIDR(record[networkIndex])
		if pErr != nil {
			return fmt.Errorf("addAsnFileToNetmap pErr: %w", pErr)
		}

		nm.Add(network, &asnInfo{
			asn: asn,
			org: org,
		})

		count += 1
	}

	return nil
}

func addFileToNetmap(nm *netmap.NetMap, filename string) error {
	file, fErr := os.Open(filename)
	if fErr != nil {
		return fmt.Errorf("addFileToNetmap fErr: %w", fErr)
	}

	r := csv.NewReader(file)

	record, err := r.Read()
	if err != nil {
		return fmt.Errorf("addFileToNetmap err 1: %w", err)
	}

	var networkIndex, latitudeIndex, longitudeIndex, accuracyIndex int
	for index, header := range record {
		switch header {
		case "network":
			networkIndex = index
		case "latitude":
			latitudeIndex = index
		case "longitude":
			longitudeIndex = index
		case "accuracy_radius":
			accuracyIndex = index
		}
	}

	count := 0

	for {
		record, err = r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("addFileToNetmap err 2: %w", err)
		}

		lat, _ := strconv.ParseFloat(record[latitudeIndex], 64)
		lon, _ := strconv.ParseFloat(record[longitudeIndex], 64)
		acc, _ := strconv.ParseFloat(record[accuracyIndex], 64)

		_, network, pErr := net.ParseCIDR(record[networkIndex])
		if pErr != nil {
			return fmt.Errorf("addFileToNetmap pErr: %w", pErr)
		}

		nm.Add(network, []float64{lat, lon, acc})

		count += 1
	}

	return nil
}

var lookup = netmap.NewNetMap()
var asnLookup = netmap.NewNetMap()
var lookupInitialized = false

type geocodingPool struct {
	wg *sync.WaitGroup
	ch chan *ipgeocodeWorkItem
}

func geocodingWorker(wg *sync.WaitGroup, ch chan *ipgeocodeWorkItem) {
	defer wg.Done()

	for toProcess := range ch {
		// Save
		latlonRaw := lookup.Lookup(net.ParseIP(toProcess.fetchedResult.IP))
		asnInfoRaw := asnLookup.Lookup(net.ParseIP(toProcess.fetchedResult.IP))

		var lat, lng, acc float64
		var asn int
		var org string
		if latlonRaw != nil {
			latlon := latlonRaw.([]float64)
			lat = latlon[0]
			lng = latlon[1]
			acc = latlon[2]
		}

		if asnInfoRaw != nil {
			asnInfo := asnInfoRaw.(*asnInfo)
			asn = asnInfo.asn
			org = asnInfo.org
		}

		storage.PushDatedRow("geocode", toProcess.date, &models.GeocodedResult{
			Id:                 toProcess.fetchedResult.Id,
			TestStyle:          toProcess.fetchedResult.TestStyle,
			IP:                 toProcess.fetchedResult.IP,
			StartedAt:          toProcess.fetchedResult.StartedAt,
			Upload:             toProcess.fetchedResult.Upload,
			MBPS:               toProcess.fetchedResult.MBPS,
			LossRate:           toProcess.fetchedResult.LossRate,
			MinRTT:             toProcess.fetchedResult.MinRTT,
			Latitude:           lat,
			Longitude:          lng,
			LocationAccuracyKM: acc,
			ASN:                asn,
			ASNOrg:             org,
		})
	}
}

func newGeocodingPool() *geocodingPool {
	ch := make(chan *ipgeocodeWorkItem)
	wg := &sync.WaitGroup{}

	for i := 0; i < runtime.NumCPU(); i++ {
		wg.Add(1)
		go geocodingWorker(wg, ch)
	}

	return &geocodingPool{
		wg: wg,
		ch: ch,
	}
}

func (p *geocodingPool) Queue(toProcess *models.FetchedResult, date time.Time) {
	p.ch <- &ipgeocodeWorkItem{
		fetchedResult: toProcess,
		date:          date,
	}
}

func (p *geocodingPool) Close() {
	close(p.ch)
	p.wg.Wait()
}

func Geocode(startDate, endDate time.Time, rerun bool) {
	if !lookupInitialized {
		ipv4Err := addFileToNetmap(lookup, config.GetConfig().Ipv4DBPath)
		if ipv4Err != nil {
			log.Fatal(ipv4Err)
		}

		ipv6Err := addFileToNetmap(lookup, config.GetConfig().Ipv6DBPath)
		if ipv6Err != nil {
			log.Fatal(ipv6Err)
		}

		asnIpv4Err := addAsnFileToNetmap(asnLookup, config.GetConfig().AsnIpv4DBPath)
		if asnIpv4Err != nil {
			log.Fatal(asnIpv4Err)
		}

		asnIpv6Err := addAsnFileToNetmap(asnLookup, config.GetConfig().AsnIpv6DBPath)
		if asnIpv6Err != nil {
			log.Fatal(asnIpv6Err)
		}

		lookupInitialized = true
	}

	var dateRange []time.Time
	if rerun {
		dateRange = helpers.DateRange(startDate, endDate)
	} else {
		dateRange = storage.Incomplete("ipgeocode", startDate, endDate)
	}

	for _, date := range dateRange {
		pool := newGeocodingPool()

		iter := storage.DatedRows("fetched", &models.FetchedResult{}, date)
		next := iter.Next()
		for next != nil {
			pool.Queue(next.(*models.FetchedResult), date)
			next = iter.Next()
		}

		pool.Close()

		storage.MarkCompleted("ipgeocode", date)
		storage.Close()
	}
}
