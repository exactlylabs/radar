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
	"github.com/exactlylabs/mlab-processor/pkg/app/datastorewriter"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/services/asnmap"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/netmap"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
)

const StepName string = "ipgeocode"

var asnMapper *asnmap.ASNMapper

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

func processItem(toProcess *ipgeocodeWorkItem) *models.GeocodedResult {
	defer timer.TimeIt(time.Now(), "GeocodeProcessRow")

	// Save
	latlonRaw := lookup.Lookup(net.ParseIP(toProcess.fetchedResult.IP))
	asnInfoRaw := asnLookup.Lookup(net.ParseIP(toProcess.fetchedResult.IP))

	var lat, lng, acc float64
	var asn int
	var org string
	var orgId *string
	if latlonRaw != nil {
		latlon := latlonRaw.([]float64)
		lat = latlon[0]
		lng = latlon[1]
		acc = latlon[2]
	}

	if asnInfoRaw != nil {
		asnInfo := asnInfoRaw.(*asnInfo)
		asn = asnInfo.asn
		asnObj, err := asnMapper.Lookup(fmt.Sprintf("%d", asn))
		if err != nil {
			// Try checking the org name against the asnmap we have
			// Sometimes the organization Name is actually the ASN name
			if asnObj, err := asnMapper.LookupByName(asnInfo.org); err == nil {
				org = asnObj.Organization.Name
				orgId = &asnObj.Organization.Id
			} else {
				org = asnInfo.org
			}
		} else {
			org = asnObj.Organization.Name
			orgId = &asnObj.Organization.Id
		}
	}
	return &models.GeocodedResult{
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
		ASNOrgId:           orgId,
		HasAccessToken:     toProcess.fetchedResult.HasAccessToken,
		AccessTokenSig:     toProcess.fetchedResult.AccessTokenSig,
	}
}

func storeGeocodedResult(writer *datastorewriter.DataStoreWriter, result *models.GeocodedResult) {
	defer timer.TimeIt(time.Now(), "GeocodeWriteRow")
	writer.WriteItem(result)
}

func geocodingWorker(wg *sync.WaitGroup, writer *datastorewriter.DataStoreWriter, ch chan *ipgeocodeWorkItem) {
	defer wg.Done()

	for toProcess := range ch {
		result := processItem(toProcess)
		storeGeocodedResult(writer, result)
	}
}

func newGeocodingPool(writer *datastorewriter.DataStoreWriter) *geocodingPool {
	ch := make(chan *ipgeocodeWorkItem)
	wg := &sync.WaitGroup{}
	// It appears to be consuming 50% of the CPUs with a pool of only NumCPU. With the double we get ~80%
	// Does this apply to any machine? Or just mine?
	for i := 0; i < runtime.NumCPU()*2; i++ {
		wg.Add(1)
		go geocodingWorker(wg, writer, ch)
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

func initializeNetMaps() {
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
}

func initializeASNMapper() {
	f, err := os.Open(config.GetConfig().Asn2OrgDBPath)
	if err != nil {
		log.Fatal(fmt.Errorf("ipgeocoder.initializeASNMapper Open: %w", err))
	}
	defer f.Close()
	asnMapper, err = asnmap.New(f)
	if err != nil {
		log.Fatal(fmt.Errorf("ipgeocoder.initializeASNMapper New: %w", err))
	}
}

func processDate(ds datastore.DataStore, fetchDS datastore.DataStore, date time.Time) error {
	writer := datastorewriter.NewWriter(ds)
	defer writer.Close()
	pool := newGeocodingPool(writer)
	log.Printf("IPGeocoder - Getting Rows for %v\n", date)
	iter, err := fetchDS.ItemsReader()
	if err != nil {
		return fmt.Errorf("ipgeocoder.processDate fetchDS.Read error: %w", err)
	}

	for iter.Next() {
		next, err := func() (any, error) {
			defer timer.TimeIt(time.Now(), "GeocodeReadRow")
			return iter.GetRow()
		}()
		if err != nil {
			return fmt.Errorf("ipgeocoder.processDate iter.Next error: %w", err)
		}
		pool.Queue(next.(*models.FetchedResult), date)

	}

	pool.Close() // Wait until all jobs are done
	log.Printf("IPGeocoder - Finished Processing for %v\n", date)
	return nil
}

func Geocode(ds datastore.DataStore, fetchDS datastore.DataStore, date time.Time) {
	defer timer.TimeIt(time.Now(), "Geocode")
	if !lookupInitialized {
		initializeNetMaps()
		initializeASNMapper()
		lookupInitialized = true
	}

	if err := processDate(ds, fetchDS, date); err != nil {
		panic(err)
	}
}
