package ndt7diagnose

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"runtime"
	"time"

	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/gorilla/websocket"
	"github.com/m-lab/locate/api/locate"
	v2 "github.com/m-lab/locate/api/v2"
)

const clientName = "exactlylabs-radar-pods"

type TargetConnectionTest struct {
	TargetMachine string `json:"target_machine"`
	SelectedURL   string `json:"selected_url"`
	Error         error  `json:"error"`
}

type DiagnoseReport struct {
	Targets         []v2.Target            `json:"targets"`
	ConnectionTests []TargetConnectionTest `json:"connection_tests"`
}

// RunDiagnose will test connection to ndt7 servers
func RunDiagnose() (*DiagnoseReport, error) {
	report := &DiagnoseReport{
		ConnectionTests: make([]TargetConnectionTest, 0),
	}

	ctx := context.Background()
	locator := locate.NewClient(clientName + "/" + sysinfo.Metadata().Version)
	targets, err := locator.Nearest(ctx, "ndt/ndt7")
	if err != nil {
		return nil, fmt.Errorf("ndt7speedtest.RunDiagnose Nearest: %w", err)
	}
	report.Targets = targets
	for _, target := range targets {
		test := TargetConnectionTest{TargetMachine: target.Machine}

		// from https://github.com/m-lab/ndt7-client-go/blob/main/ndt7.go#L184
		// resource has the format scheme://downloadTestURL or scheme://uploadTestURL
		// our tests use a `ws` scheme
		testUrl := target.URLs["ws:///ndt/v7/download"]
		test.SelectedURL = testUrl

		u, err := url.Parse(testUrl)
		if err != nil {
			test.Error = fmt.Errorf("ndt7diagnose.RunDiagnose Parse: %w", err)
			report.ConnectionTests = append(report.ConnectionTests, test)
			continue
		}

		conn, err := doConnect(ctx, u.String())
		if err != nil {
			test.Error = fmt.Errorf("ndt7diagnose.RunDiagnose doConnect: %w", err)
			report.ConnectionTests = append(report.ConnectionTests, test)
			continue
		}
		conn.Close()
		report.ConnectionTests = append(report.ConnectionTests, test)
	}
	return report, nil
}

func doConnect(ctx context.Context, serviceURL string) (*websocket.Conn, error) {
	dialer := websocket.Dialer{
		HandshakeTimeout: 7 * time.Second,
	}
	URL, _ := url.Parse(serviceURL)
	q := URL.Query()
	q.Set("client_arch", runtime.GOARCH)
	q.Set("client_library_name", "ndt7-client-go")
	q.Set("client_library_version", "0.7.0")
	q.Set("client_name", clientName)
	q.Set("client_os", runtime.GOOS)
	q.Set("client_version", sysinfo.Metadata().Version)
	URL.RawQuery = q.Encode()
	headers := http.Header{}
	headers.Add("Sec-WebSocket-Protocol", "net.measurementlab.ndt.v7")
	headers.Add("User-Agent", clientName+"/"+sysinfo.Metadata().Version)
	conn, _, err := dialer.DialContext(ctx, URL.String(), headers)
	return conn, err
}
