package ipgeocoder

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"net"
	"net/netip"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/config"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/services/asnmap"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/encoders/avro"
	"github.com/exactlylabs/mlab-processor/pkg/services/netmap"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
	hamba "github.com/hamba/avro/v2"
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

// Load reads the four GeoLite2 CSVs and the CAIDA file named in conf. The three
// sources are parsed concurrently.
func Load(conf *config.ProcessorConfig) (*Geocoder, error) {
	defer timer.TimeIt(time.Now(), "GeocodeLoad")
	g := &Geocoder{geo: netmap.New[geoInfo](), asn: netmap.New[asnInfo]()}
	errs := make([]error, 3)
	var wg sync.WaitGroup
	wg.Add(3)
	go func() {
		defer wg.Done()
		for _, p := range []string{conf.Ipv4DBPath, conf.Ipv6DBPath} {
			if err := addFileToNetmap(g.geo, p); err != nil {
				errs[0] = err
				return
			}
		}
		g.geo.Build()
	}()
	go func() {
		defer wg.Done()
		intern := map[string]string{}
		for _, p := range []string{conf.AsnIpv4DBPath, conf.AsnIpv6DBPath} {
			if err := addAsnFileToNetmap(g.asn, p, intern); err != nil {
				errs[1] = err
				return
			}
		}
		g.asn.Build()
	}()
	go func() {
		defer wg.Done()
		f, err := os.Open(conf.Asn2OrgDBPath)
		if err != nil {
			errs[2] = fmt.Errorf("ipgeocoder.Load: %w", err)
			return
		}
		defer f.Close()
		g.asnMapper, err = asnmap.New(f)
		if err != nil {
			errs[2] = fmt.Errorf("ipgeocoder.Load asnmap: %w", err)
		}
	}()
	wg.Wait()
	for _, err := range errs {
		if err != nil {
			return nil, err
		}
	}
	log.Printf("IPGeocoder - loaded %d city networks, %d ASN networks", g.geo.Len(), g.asn.Len())
	return g, nil
}

// process fills out from fr. It reports whether the IP was located and had an ASN.
func (g *Geocoder) process(fr *models.FetchedResult, out *models.GeocodedResult) (located, hasASN bool) {
	var latlon geoInfo
	var info asnInfo
	if ip, err := netip.ParseAddr(fr.IP); err == nil {
		latlon, located = g.geo.LookupAddr(ip)
		info, hasASN = g.asn.LookupAddr(ip)
	}

	var asn int
	var org string
	var orgId *string
	if hasASN {
		asn = info.asn
		asnObj, err := g.asnMapper.LookupNumber(asn)
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
	*out = models.GeocodedResult{
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
	return located, hasASN
}

// Geocode reads every fetched row of fetchDS and writes the geocoded row to ds, in the
// same order, using every CPU.
func (g *Geocoder) Geocode(ds datastore.DataStore, fetchDS datastore.DataStore, date time.Time) (*Stats, error) {
	defer timer.TimeIt(time.Now(), "Geocode")
	stats := &Stats{}
	fw, ok := ds.(datastore.FileWriterStore)
	if !ok {
		return stats, fmt.Errorf("ipgeocoder: %T cannot write files", ds)
	}
	in, err := fetchDS.FileReader()
	if err != nil {
		return stats, fmt.Errorf("ipgeocoder: reading fetch output: %w", err)
	}
	defer in.Close()
	reader, err := avro.NewBlockReader(in)
	if err != nil {
		return stats, fmt.Errorf("ipgeocoder: reading fetch output: %w", err)
	}
	out, err := fw.FileWriter()
	if err != nil {
		return stats, fmt.Errorf("ipgeocoder: %w", err)
	}
	schema := hamba.MustParse(models.GeocodedResultSchema)
	writer, err := avro.NewBlockWriter(out, schema, avro.DefaultCodec())
	if err != nil {
		out.Close()
		return stats, fmt.Errorf("ipgeocoder: %w", err)
	}

	var mu sync.Mutex
	tStats, err := avro.Transform(reader, writer, schema, avro.TransformOptions{},
		func(worker int, rows []models.FetchedResult, emit func(*models.GeocodedResult)) error {
			var located, withASN int64
			var gr models.GeocodedResult
			for i := range rows {
				l, a := g.process(&rows[i], &gr)
				if l {
					located++
				}
				if a {
					withASN++
				}
				emit(&gr)
			}
			mu.Lock()
			stats.Located += located
			stats.WithASN += withASN
			mu.Unlock()
			return nil
		})
	stats.Read, stats.Written = tStats.Read, tStats.Written
	if cErr := out.Close(); err == nil && cErr != nil {
		err = fmt.Errorf("ipgeocoder: closing output: %w", cErr)
	}
	if err != nil {
		return stats, fmt.Errorf("ipgeocoder: %w", err)
	}
	if stats.Read != stats.Written {
		return stats, fmt.Errorf("ipgeocoder: read %d rows but wrote %d", stats.Read, stats.Written)
	}
	return stats, nil
}
