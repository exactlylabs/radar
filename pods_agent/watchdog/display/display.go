package display

import (
	"bufio"
	"context"
	_ "embed"
	"fmt"
	"io"
	"log"
	"text/template"
	"time"

	"github.com/exactlylabs/radar/agent/config"
	"github.com/exactlylabs/radar/agent/internal/info"
	"github.com/exactlylabs/radar/agent/services/sysinfo"
)

type AgentClient interface {
	GetVersion() (string, error)
	IsRunning() (bool, error)
}

type PodInfoProvider interface {
	Interfaces() ([]sysinfo.NetInterface, error)
}

//go:embed logo160x38.txt
var logo []byte

//go:embed displaytemplate.txt
var templ string

func Refresh(w io.Writer, c *config.Config, agentCli AgentClient, podProber PodInfoProvider) {
	t := template.Must(template.New("display").Funcs(funcMap).Parse(templ))
	v, err := agentCli.GetVersion()
	if err != nil {
		log.Println(fmt.Errorf("display.StartDisplayLoop getVersion: %w", err))
		v = "N/A"
	}
	info := info.BuildInfo()
	ifaces, err := podProber.Interfaces()
	if err != nil {
		log.Println(fmt.Errorf("display.Refresh Interfaces: %w", err))
		ifaces = make([]sysinfo.NetInterface, 0)
	}

	isRunning, runningErr := agentCli.IsRunning()
	lastTestedAt := c.LastTestedAt()
	lastTestedStr := ""
	if lastTestedAt != nil {
		// Format set to mm/dd/yyyy HH:MM TZ
		lastTestedStr = lastTestedAt.Format("01/02/2006 15:04 MST")
	}
	args := map[string]interface{}{
		"podId":                   c.ClientId,
		"podOsVersion":            info.Version,
		"podAgentVersion":         v,
		"netInterfaces":           ifaces,
		"lastMeasurementTime":     lastTestedStr,
		"lastMeasurementDownload": c.LastDownloadSpeed,
		"lastMeasurementUpload":   c.LastUploadSpeed,
		"isRunning":               isRunning,
		"runningErr":              runningErr,
		"lastDisplayUpdate":       time.Now().Format("01/02/2006 15:04 MST"),
	}
	b := bufio.NewWriter(w)
	b.WriteString("\033[H\033[2J")
	b.Write(logo)
	if err := t.Execute(b, args); err != nil {
		panic(fmt.Errorf("display.Execute: %w", err))
	}
	b.Flush()
}

// StartDisplayLoop is a blocking function, that keeps sending the current display info to a Writer interface
func StartDisplayLoop(ctx context.Context, w io.Writer, agentCli AgentClient, podProber PodInfoProvider) {
	timer := time.NewTimer(time.Second)
	for {
		select {
		case <-ctx.Done():
			return
		case <-timer.C:
			c := config.Reload()
			Refresh(w, c, agentCli, podProber)
			timer.Reset(time.Minute)
		}
	}
}
