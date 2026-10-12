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

type geoInfo struct {
	lat, lon, acc float64
}

type asnInfo struct {
	asn int
	org string
}

// Geocoder holds the GeoLite2 network maps and the CAIDA ASN→organization map.
type Geocoder struct {
	geo       *netmap.Map[geoInfo]
	asn       *netmap.Map[asnInfo]
	asnMapper *asnmap.ASNMapper
}

// Stats is the per-date accounting of the ipgeocode step.
type Stats struct {
	Read    int64 `json:"read"`
	Written int64 `json:"written"`
	// Located counts rows with a GeoLite2 City match, WithASN rows with an ASN match.
	Located int64 `json:"located"`
	WithASN int64 `json:"with_asn"`
}

func openCSV(filename string) (*os.File, *csv.Reader, map[string]int, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, nil, nil, err
	}
	r := csv.NewReader(file)
	r.ReuseRecord = true
	header, err := r.Read()
	if err != nil {
		file.Close()
		return nil, nil, nil, fmt.Errorf("%s: header: %w", filename, err)
	}
	cols := map[string]int{}
	for i, h := range header {
		cols[h] = i
	}
	return file, r, cols, nil
}

func addAsnFileToNetmap(nm *netmap.Map[asnInfo], filename string, intern map[string]string) error {
	file, r, cols, err := openCSV(filename)
	if err != nil {
		return fmt.Errorf("addAsnFileToNetmap: %w", err)
	}
	defer file.Close()
	networkIndex, asnIndex, asnOrgIndex := cols["network"], cols["autonomous_system_number"], cols["autonomous_system_organization"]

	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("addAsnFileToNetmap %s: %w", filename, err)
		}

		asn, _ := strconv.Atoi(record[asnIndex])
		org, ok := intern[record[asnOrgIndex]]
		if !ok {
			org = string([]byte(record[asnOrgIndex])) // copy: the record is reused
			intern[org] = org
		}

		_, network, pErr := net.ParseCIDR(record[networkIndex])
		if pErr != nil {
			return fmt.Errorf("addAsnFileToNetmap pErr: %w", pErr)
		}
		nm.Add(network, asnInfo{asn: asn, org: org})
	}
	return nil
}

func addFileToNetmap(nm *netmap.Map[geoInfo], filename string) error {
	file, r, cols, err := openCSV(filename)
	if err != nil {
		return fmt.Errorf("addFileToNetmap: %w", err)
	}
	defer file.Close()
	networkIndex, latitudeIndex, longitudeIndex, accuracyIndex := cols["network"], cols["latitude"], cols["longitude"], cols["accuracy_radius"]

	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("addFileToNetmap %s: %w", filename, err)
		}

		lat, _ := strconv.ParseFloat(record[latitudeIndex], 64)
		lon, _ := strconv.ParseFloat(record[longitudeIndex], 64)
		acc, _ := strconv.ParseFloat(record[accuracyIndex], 64)

		_, network, pErr := net.ParseCIDR(record[networkIndex])
		if pErr != nil {
			return fmt.Errorf("addFileToNetmap pErr: %w", pErr)
		}
		nm.Add(network, geoInfo{lat, lon, acc})
	}
	return nil
}

// Load reads the four GeoLite2 CSVs and the CAIDA file named in conf.
func Load(conf *config.ProcessorConfig) (*Geocoder, error) {
	defer timer.TimeIt(time.Now(), "GeocodeLoad")
	g := &Geocoder{geo: netmap.New[geoInfo](), asn: netmap.New[asnInfo]()}
	for _, p := range []string{conf.Ipv4DBPath, conf.Ipv6DBPath} {
		if err := addFileToNetmap(g.geo, p); err != nil {
			return nil, err
		}
	}
	intern := map[string]string{}
	for _, p := range []string{conf.AsnIpv4DBPath, conf.AsnIpv6DBPath} {
		if err := addAsnFileToNetmap(g.asn, p, intern); err != nil {
			return nil, err
		}
	}
	g.geo.Build()
	g.asn.Build()

	f, err := os.Open(conf.Asn2OrgDBPath)
	if err != nil {
		return nil, fmt.Errorf("ipgeocoder.Load: %w", err)
	}
	defer f.Close()
	g.asnMapper, err = asnmap.New(f)
	if err != nil {
		return nil, fmt.Errorf("ipgeocoder.Load asnmap: %w", err)
	}
	log.Printf("IPGeocoder - loaded %d city networks, %d ASN networks", g.geo.Len(), g.asn.Len())
	return g, nil
}

func (g *Geocoder) process(fr *models.FetchedResult, stats *Stats, mu *sync.Mutex) *models.GeocodedResult {
	ip := net.ParseIP(fr.IP)
	latlon, located := g.geo.Lookup(ip)
	info, hasASN := g.asn.Lookup(ip)

	var asn int
	var org string
	var orgId *string
	if hasASN {
		asn = info.asn
		asnObj, err := g.asnMapper.Lookup(strconv.Itoa(asn))
		if err != nil {
			// Try checking the org name against the asnmap we have
			// Sometimes the organization Name is actually the ASN name
			if asnObj, err := g.asnMapper.LookupByName(info.org); err == nil {
				org = asnObj.Organization.Name
				orgId = &asnObj.Organization.Id
			} else {
				org = info.org
			}
		} else {
			org = asnObj.Organization.Name
			orgId = &asnObj.Organization.Id
		}
	}
	if located || hasASN {
		mu.Lock()
		if located {
			stats.Located++
		}
		if hasASN {
			stats.WithASN++
		}
		mu.Unlock()
	}
	return &models.GeocodedResult{
		Id:                 fr.Id,
		TestStyle:          fr.TestStyle,
		IP:                 fr.IP,
		StartedAt:          fr.StartedAt,
		Upload:             fr.Upload,
		MBPS:               fr.MBPS,
		LossRate:           fr.LossRate,
		MinRTT:             fr.MinRTT,
		Latitude:           latlon.lat,
		Longitude:          latlon.lon,
		LocationAccuracyKM: latlon.acc,
		ASN:                asn,
		ASNOrg:             org,
		ASNOrgId:           orgId,
		HasAccessToken:     fr.HasAccessToken,
		AccessTokenSig:     fr.AccessTokenSig,
	}
}

// Geocode reads every fetched row of fetchDS and writes the geocoded row to ds.
func (g *Geocoder) Geocode(ds datastore.DataStore, fetchDS datastore.DataStore, date time.Time) (*Stats, error) {
	defer timer.TimeIt(time.Now(), "Geocode")
	stats := &Stats{}
	var mu sync.Mutex

	iter, err := fetchDS.ItemsReader()
	if err != nil {
		return stats, fmt.Errorf("ipgeocoder: reading fetch output: %w", err)
	}
	defer iter.Close()

	writer := datastorewriter.NewWriter(ds)
	ch := make(chan *models.FetchedResult, 1024)
	var wg sync.WaitGroup
	for i := 0; i < runtime.NumCPU(); i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for fr := range ch {
				writer.WriteItem(g.process(fr, stats, &mu))
			}
		}()
	}
	var readErr error
	for iter.Next() {
		next, err := iter.GetRow()
		if err != nil {
			readErr = fmt.Errorf("ipgeocoder: decoding row %d: %w", stats.Read, err)
			break
		}
		stats.Read++
		ch <- next.(*models.FetchedResult)
	}
	if readErr == nil {
		if err := iter.Err(); err != nil {
			readErr = fmt.Errorf("ipgeocoder: reading fetch output: %w", err)
		}
	}
	close(ch)
	wg.Wait()
	wErr := writer.Close()
	stats.Written = writer.Written()
	if readErr != nil {
		return stats, readErr
	}
	if wErr != nil {
		return stats, wErr
	}
	if stats.Read != stats.Written {
		return stats, fmt.Errorf("ipgeocoder: read %d rows but wrote %d", stats.Read, stats.Written)
	}
	return stats, nil
}
