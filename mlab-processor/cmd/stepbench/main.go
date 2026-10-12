// Command stepbench benchmarks the post-fetch steps (ipgeocode, reversegeocode) on a
// synthetic fetch file of realistic shape, with the real GeoLite2 / CAIDA / TIGER inputs.
//
//	stepbench -workdir /tmp/bench -input /path/to/input gen -rows 6200000
//	stepbench -workdir /tmp/bench -input /path/to/input ipgeocode [-cpuprofile f] [-memprofile f]
//	stepbench -workdir /tmp/bench -input /path/to/input reversegeocode [...]
//
// Every phase prints wall time, CPU seconds (user+sys), peak RSS of the process so far,
// and the heap allocations made during the phase.
package main

import (
	"bufio"
	"bytes"
	"encoding/csv"
	"flag"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net"
	"os"
	"path/filepath"
	"runtime"
	"runtime/pprof"
	"sort"
	"strings"
	"syscall"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/config"
	"github.com/exactlylabs/mlab-processor/pkg/app/helpers/flavors"
	"github.com/exactlylabs/mlab-processor/pkg/app/ipgeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/app/pipeline"
	"github.com/exactlylabs/mlab-processor/pkg/app/reversegeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore/localstorage"
	"github.com/exactlylabs/mlab-processor/pkg/services/encoders/avro"
	hamba "github.com/hamba/avro/v2"
	"github.com/hamba/avro/v2/ocf"
)

var (
	workdir    = flag.String("workdir", "/tmp/claude-pipeline-perf/work", "directory for output/ and storage/")
	inputDir   = flag.String("input", "/tmp/claude-pipeline-perf/input", "directory with the GeoLite2 CSVs, as-org2info.jsonl and tl_us_*.zip")
	rows       = flag.Int("rows", 6_200_000, "gen: rows of the synthetic fetch file")
	cpuprofile = flag.String("cpuprofile", "", "write a CPU profile of the step")
	memprofile = flag.String("memprofile", "", "write an allocation profile of the step")
	seed       = flag.Int64("seed", 1, "gen: random seed")
)

const date = "2026-07-31"

type phase struct {
	name  string
	start time.Time
	ru    syscall.Rusage
	ms    runtime.MemStats
}

func begin(name string) *phase {
	p := &phase{name: name, start: time.Now()}
	syscall.Getrusage(syscall.RUSAGE_SELF, &p.ru)
	runtime.ReadMemStats(&p.ms)
	return p
}

func tv(t syscall.Timeval) float64 { return float64(t.Sec) + float64(t.Usec)/1e6 }

func (p *phase) end() {
	var ru syscall.Rusage
	var ms runtime.MemStats
	syscall.Getrusage(syscall.RUSAGE_SELF, &ru)
	runtime.ReadMemStats(&ms)
	cpu := tv(ru.Utime) + tv(ru.Stime) - tv(p.ru.Utime) - tv(p.ru.Stime)
	fmt.Printf("PHASE %-16s wall=%.2fs cpu=%.1fs maxrss=%dMB mallocs=%.1fM alloc=%.0fMB\n",
		p.name, time.Since(p.start).Seconds(), cpu, ru.Maxrss/1024,
		float64(ms.Mallocs-p.ms.Mallocs)/1e6, float64(ms.TotalAlloc-p.ms.TotalAlloc)/1e6)
}

func conf() *config.ProcessorConfig {
	in := func(f string) string { return filepath.Join(*inputDir, f) }
	return &config.ProcessorConfig{
		Ipv4DBPath:    in("GeoLite2-City-Blocks-IPv4.csv"),
		Ipv6DBPath:    in("GeoLite2-City-Blocks-IPv6.csv"),
		AsnIpv4DBPath: in("GeoLite2-ASN-Blocks-IPv4.csv"),
		AsnIpv6DBPath: in("GeoLite2-ASN-Blocks-IPv6.csv"),
		Asn2OrgDBPath: in("as-org2info.jsonl"),
		ShapePaths: fmt.Sprintf("US_STATES:%s;US_COUNTIES:%s;US_AIANNH:%s",
			in("tl_us_state.zip"), in("tl_us_county.zip"), in("tl_us_aiannh.zip")),
		StorageType: "local",
	}
}

func provider() pipeline.DataStoreProvider {
	st, err := localstorage.New("storage")
	if err != nil {
		log.Fatal(err)
	}
	return flavors.NewAvroStorageDataStoreFactory(st)
}

func ds(step string, obj any) datastore.DataStore {
	d, err := provider()(step, mustDate(), obj)
	if err != nil {
		log.Fatal(err)
	}
	return d
}

func mustDate() time.Time {
	d, _ := time.Parse("2006-01-02", date)
	return d
}

// sampleNetworks returns up to n random networks of a GeoLite2 blocks CSV.
func sampleNetworks(path string, n int, r *rand.Rand) []*net.IPNet {
	f, err := os.Open(path)
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()
	cr := csv.NewReader(bufio.NewReaderSize(f, 1<<20))
	cr.ReuseRecord = true
	if _, err := cr.Read(); err != nil {
		log.Fatal(err)
	}
	// reservoir sampling
	out := make([]*net.IPNet, 0, n)
	seen := 0
	for {
		rec, err := cr.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}
		seen++
		if len(out) < n {
			_, nw, _ := net.ParseCIDR(rec[0])
			out = append(out, nw)
		} else if j := r.Intn(seen); j < n {
			_, nw, _ := net.ParseCIDR(rec[0])
			out[j] = nw
		}
	}
	return out
}

func randomHost(nw *net.IPNet, r *rand.Rand) string {
	ip := make(net.IP, len(nw.IP))
	copy(ip, nw.IP)
	for i := range ip {
		ip[i] |= byte(r.Intn(256)) &^ nw.Mask[i]
	}
	return ip.String()
}

func gen() {
	r := rand.New(rand.NewSource(*seed))
	p := begin("gen-sample")
	v4 := sampleNetworks(filepath.Join(*inputDir, "GeoLite2-City-Blocks-IPv4.csv"), 300_000, r)
	v6 := sampleNetworks(filepath.Join(*inputDir, "GeoLite2-City-Blocks-IPv6.csv"), 30_000, r)
	p.end()
	p = begin("gen-write")
	d := ds("fetch", models.FetchedResult{})
	w, err := d.ItemWriter()
	if err != nil {
		log.Fatal(err)
	}
	day := mustDate().Unix()
	// ~2% of real clients are in no GeoLite2 network: random addresses.
	styles := []string{"ndt7", "ndt7", "ndt7", "ndt7", "ndt5"}
	sig := strings.Repeat("a", 86)
	for i := 0; i < *rows; i++ {
		var ip string
		switch x := r.Intn(100); {
		case x < 2:
			ip = fmt.Sprintf("%d.%d.%d.%d", r.Intn(256), r.Intn(256), r.Intn(256), r.Intn(256))
		case x < 12:
			ip = randomHost(v6[r.Intn(len(v6))], r)
		default:
			ip = randomHost(v4[r.Intn(len(v4))], r)
		}
		at := day + int64(r.Intn(86400))
		fr := &models.FetchedResult{
			Id:        fmt.Sprintf("ndt-%05x_%d_%016X", r.Intn(1<<20), at, r.Int63n(1<<40)),
			TestStyle: styles[r.Intn(len(styles))],
			IP:        ip,
			StartedAt: at,
			Upload:    r.Intn(2) == 0,
			MBPS:      r.Float32() * 900,
		}
		if r.Intn(10) != 0 {
			lr := r.Float32() * 0.05
			fr.LossRate = &lr
		}
		if r.Intn(10) != 0 {
			rtt := r.Float32() * 200
			fr.MinRTT = &rtt
		}
		if r.Intn(5) == 0 {
			fr.HasAccessToken = true
			fr.AccessTokenSig = &sig
		}
		if err := w.Write(fr); err != nil {
			log.Fatal(err)
		}
	}
	if err := w.Close(); err != nil {
		log.Fatal(err)
	}
	if err := d.Flush(); err != nil {
		log.Fatal(err)
	}
	p.end()
	fi, _ := os.Stat("storage/fetch/" + date + ".avro")
	fmt.Printf("fetch file: %d rows, %d MB\n", *rows, fi.Size()/1e6)
}

func profiles(step string) func() {
	var cpu *os.File
	if *cpuprofile != "" {
		var err error
		cpu, err = os.Create(*cpuprofile)
		if err != nil {
			log.Fatal(err)
		}
		pprof.StartCPUProfile(cpu)
	}
	return func() {
		if cpu != nil {
			pprof.StopCPUProfile()
			cpu.Close()
		}
		if *memprofile != "" {
			f, err := os.Create(*memprofile)
			if err != nil {
				log.Fatal(err)
			}
			pprof.Lookup("allocs").WriteTo(f, 0)
			f.Close()
		}
	}
}

func fileSize(step string) int64 {
	fi, err := os.Stat(fmt.Sprintf("storage/%s/%s.avro", step, date))
	if err != nil {
		return -1
	}
	return fi.Size()
}

func runIPGeocode() {
	p := begin("ipgeocode-load")
	g, err := ipgeocoder.Load(conf())
	if err != nil {
		log.Fatal(err)
	}
	p.end()
	in := ds("fetch", models.FetchedResult{})
	out := ds("ipgeocode", models.GeocodedResult{})
	out.Clear()
	stop := profiles("ipgeocode")
	p = begin("ipgeocode")
	stats, err := g.Geocode(out, in, mustDate())
	if err != nil {
		log.Fatal(err)
	}
	p.end()
	stop()
	p = begin("ipgeocode-upload")
	if err := out.Flush(); err != nil {
		log.Fatal(err)
	}
	p.end()
	fmt.Printf("ipgeocode: %+v, output %d MB\n", *stats, fileSize("ipgeocode")/1e6)
}

func runReverseGeocode() {
	p := begin("revgeo-load")
	g, err := reversegeocoder.Load(conf())
	if err != nil {
		log.Fatal(err)
	}
	p.end()
	in := ds("ipgeocode", models.GeocodedResult{})
	out := ds("reversegeocode", models.RevGeoResult{})
	out.Clear()
	stop := profiles("reversegeocode")
	p = begin("reversegeocode")
	stats, err := g.ReverseGeocode(out, in, mustDate())
	if err != nil {
		log.Fatal(err)
	}
	p.end()
	stop()
	p = begin("revgeo-upload")
	if err := out.Flush(); err != nil {
		log.Fatal(err)
	}
	p.end()
	fmt.Printf("reversegeocode: %+v, output %d MB\n", *stats, fileSize("reversegeocode")/1e6)
}

func main() {
	flag.Parse()
	if err := os.MkdirAll(*workdir, 0755); err != nil {
		log.Fatal(err)
	}
	if err := os.Chdir(*workdir); err != nil {
		log.Fatal(err)
	}
	fmt.Printf("GOMAXPROCS=%d\n", runtime.GOMAXPROCS(0))
	for _, cmd := range flag.Args() {
		switch cmd {
		case "gen":
			gen()
		case "ipgeocode":
			runIPGeocode()
		case "reversegeocode":
			runReverseGeocode()
		case "codecs":
			codecs("ipgeocode")
			codecs("reversegeocode")
		case "compare":
			// compare <other workdir>: the step outputs here and there hold the same rows
			compare(flag.Args()[len(flag.Args())-1])
			return
		default:
			log.Fatalf("unknown command %q", cmd)
		}
	}
}

// codecs re-compresses the blocks of a step's output with every codec and reports the
// compressed size and the encode / decode CPU time.
func codecs(step string) {
	f, err := os.Open(fmt.Sprintf("storage/%s/%s.avro", step, date))
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()
	br, err := avro.NewBlockReader(f)
	if err != nil {
		log.Fatal(err)
	}
	dec, _ := avro.NewCodec(br.Codec())
	var blocks [][]byte
	raw := 0
	for {
		b, err := br.Next(nil)
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}
		d, err := dec.Decode(nil, b.Data)
		if err != nil {
			log.Fatal(err)
		}
		blocks = append(blocks, d)
		raw += len(d)
	}
	fmt.Printf("%s: %d blocks, %d MB raw\n", step, len(blocks), raw/1e6)
	for _, name := range []avro.CodecName{avro.Null, avro.Snappy, avro.Deflate, avro.ZStandard} {
		c, err := avro.NewCodec(name)
		if err != nil {
			log.Fatal(err)
		}
		var comp [][]byte
		size := 0
		start := time.Now()
		for _, b := range blocks {
			out, err := c.Encode(nil, b)
			if err != nil {
				log.Fatal(err)
			}
			comp = append(comp, out)
			size += len(out)
		}
		enc := time.Since(start)
		start = time.Now()
		var buf []byte
		for _, b := range comp {
			if buf, err = c.Decode(buf[:0], b); err != nil {
				log.Fatal(err)
			}
		}
		fmt.Printf("  %-10s %4d MB  encode %.2fs  decode %.2fs (single core)\n", name, size/1e6, enc.Seconds(), time.Since(start).Seconds())
	}
}

// compare checks that the ipgeocode and reversegeocode outputs of this workdir and of
// other hold the same rows (whatever their order, block size or codec): the rows'
// canonical Avro encodings, sorted, are identical.
func compare(other string) {
	for _, step := range []string{"ipgeocode", "reversegeocode"} {
		var sums [2][]string
		for i, dir := range []string{".", other} {
			f, err := os.Open(fmt.Sprintf("%s/storage/%s/%s.avro", dir, step, date))
			if err != nil {
				log.Fatal(err)
			}
			dec, err := ocf.NewDecoder(f)
			if err != nil {
				log.Fatal(err)
			}
			var buf bytes.Buffer
			enc := hamba.NewEncoderForSchema(dec.Schema(), &buf)
			for dec.HasNext() {
				var row any
				if step == "ipgeocode" {
					row = &models.GeocodedResult{}
				} else {
					row = &models.RevGeoResult{}
				}
				if err := dec.Decode(row); err != nil {
					log.Fatal(err)
				}
				buf.Reset()
				if err := enc.Encode(row); err != nil {
					log.Fatal(err)
				}
				sums[i] = append(sums[i], buf.String())
			}
			if err := dec.Error(); err != nil {
				log.Fatal(err)
			}
			f.Close()
			sort.Strings(sums[i])
		}
		same := len(sums[0]) == len(sums[1])
		for i := 0; same && i < len(sums[0]); i++ {
			same = sums[0][i] == sums[1][i]
		}
		fmt.Printf("%s: %d rows here, %d rows in %s, identical=%v\n", step, len(sums[0]), len(sums[1]), other, same)
	}
}
