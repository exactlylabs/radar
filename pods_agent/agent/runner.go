package agent

import (
	"context"
	"fmt"
	"log"
	"slices"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/wifi"
	"github.com/exactlylabs/radar/pods_agent/services/ws"
)

type runnersExecutor struct {
	runners   []Runner
	reporter  RadarClient
	c         *config.Config
	wlanNames []string
}

func newExecutor(c *config.Config, runners []Runner, reporter RadarClient) *runnersExecutor {
	wlanNames, err := wifi.WlanInterfaceNames()
	if err != nil && !errors.Is(err, wifi.ErrNotSupported) {
		sentry.NotifyErrorOnce(errors.W(err), map[string]sentry.Context{})
	}
	return &runnersExecutor{
		runners:   runners,
		reporter:  reporter,
		c:         c,
		wlanNames: wlanNames,
	}
}

func (r *runnersExecutor) listen(ctx context.Context, runTestCh <-chan RunTestServerMessage) {
	for msg := range runTestCh {
		log.Println("Starting Speed Tests")
		r.runUntilSuccessfull(ctx, msg.Interfaces)
		log.Println("Finished running Speed Tests")
	}
}

func (r *runnersExecutor) fillWlanInfo(report *MeasurementReport, iface string) error {
	report.Wlan = true
	status, err := getWlanConnInfo(iface)
	report.ConnectionInfo = status
	return err
}

// sendMeasurement with a retry mechanism, to avoid causing another run of the runner interface
func (r *runnersExecutor) sendMeasurement(ctx context.Context, report MeasurementReport, runner Runner, retries int) (err error) {
	backoff := ws.NewExponentialBackOff(15*time.Second, time.Minute, 2.0)
	for i := 0; i < retries; i++ {
		err = r.reporter.SendMeasurement(ctx, runner.Type(), report)
		if err != nil {
			err = errors.Wrap(err, "failed to send speed test result to server")
			log.Println(err)
			if !errors.Is(err, ErrServerConnectionError) {
				sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
			}
			<-backoff.Next()
			continue
		}
		return nil
	}
	return err
}

func (r *runnersExecutor) execute(ctx context.Context, runner Runner, iface string) (report *MeasurementReport, err error) {
	report = &MeasurementReport{}
	report.Interface = iface

	// Gather ConnectionInfo of the Wifi signal and skip the test if it fails to retrieve it
	if slices.Contains(r.wlanNames, iface) {
		if err := r.fillWlanInfo(report, iface); err != nil {
			return nil, errors.W(err).WithMetadata(errors.Metadata{"interface": iface})
		}
	}

	// Execute the Runner using either the selected interface or the default in case none given.
	var result *Measurement
	if iface != "" {
		result, err = runner.RunForInterface(ctx, iface)
	} else {
		result, err = runner.Run(ctx)
	}
	if err != nil {
		return nil, errors.Wrap(err, "failed to run speed test").WithMetadata(errors.Metadata{"runner": runner.Type(), "interface": iface})
	}
	report.Result = result.Raw

	// Report back to the server
	err = r.sendMeasurement(ctx, *report, runner, 5)
	if err != nil {
		return nil, errors.Wrap(err, "failed all attempts to send speed test result to server")
	}

	// Update local configuration file with the latest test results (watchdog uses this information from the config file)
	r.c.LastTested = fmt.Sprintf("%d", time.Now().Unix())
	r.c.LastDownloadSpeed = fmt.Sprintf("%.2f", result.DownloadMbps)
	r.c.LastUploadSpeed = fmt.Sprintf("%.2f", result.UploadMbps)
	if err := config.Save(r.c); err != nil {
		log.Println(errors.Wrap(err, "failed to save config"))
		sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
	}

	return report, nil
}

// runUntilSuccessfull will block until at least one measurement report was sent successfully to the server
func (r *runnersExecutor) runUntilSuccessfull(ctx context.Context, interfaces []string) {
	successfull := false
	backoff := ws.NewExponentialBackOff(2*time.Second, time.Minute, 2.0)
	if len(interfaces) == 0 {
		interfaces = append(interfaces, "")
	}

	for !successfull {
		for _, runner := range r.runners {
			for _, iface := range interfaces {
				_, err := r.execute(ctx, runner, iface)
				if err != nil {
					err = errors.W(err)
					log.Println(err)
					if !errorIsAny(err, ErrRunnerConnectionError, wifi.ErrNotConnected, wifi.ErrNotSupported) {
						// Nothing to do about these errors
						sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
					}
					continue
				}
				successfull = true
			}
		}

		if !successfull {
			log.Println("agent.startSpeedTestRunner: all runners have failed, retrying after backoff period")
			<-backoff.Next()
		}
	}
}

func getWlanConnInfo(name string) (*wifi.WifiStatus, error) {
	wlanCli, err := wifi.NewWirelessClient(name)
	if err != nil {
		return nil, errors.W(err)
	}
	defer wlanCli.Close()
	status, err := wlanCli.ConnectionStatus()
	if err != nil {
		return nil, errors.W(err)
	}
	return &status, nil
}
