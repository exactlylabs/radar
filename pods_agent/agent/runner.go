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
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/netroute"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/wifi"
	"github.com/exactlylabs/radar/pods_agent/services/ws"
)

func startSpeedTestRunner(ctx context.Context, c *config.Config, runTestCh <-chan RunTestServerMessage, runners []Runner, reporter RadarClient) {
	for msg := range runTestCh {
		log.Println("Starting Speed Tests")
		runUntilSuccessfull(ctx, runners, reporter, c, msg.Interfaces)
		log.Println("Finished running Speed Tests")
	}
}

func runUntilSuccessfull(ctx context.Context, runners []Runner, reporter RadarClient, c *config.Config, interfaces []string) {

	successfull := false
	backoff := ws.NewExponentialBackOff(2*time.Second, time.Minute, 2.0)
	if len(interfaces) == 0 {
		// Fallback to default interface in case of nothing given
		interfaces = []string{"default"}
	}
	wlanNames, err := wifi.WlanInterfaceNames()
	if err != nil {
		panic(errors.W(err))
	}
	for !successfull {
		for _, runner := range runners {
			for _, iface := range interfaces {

				if iface == "default" {
					r, err := netroute.DefaultRoute()
					if err == nil {
						iface = r.Interface.Name
					} else {
						iface = "" // Runner internally should default to the default route
					}
				}
				report := MeasurementReport{
					Interface: iface,
				}

				// Gather ConnectionInfo of the Wifi signal and skip the test if it fails to retrieve it
				if slices.Contains(wlanNames, iface) {
					report.Wlan = true
					status, err := getWlanConnInfo(iface)
					if errors.Is(err, wifi.ErrNotConnected) || errors.Is(err, wifi.ErrNotSuported) {
						// Send failed measurement
						continue
					} else if err != nil {
						err = errors.W(err)
						log.Println(err)
						sentry.NotifyErrorOnce(err, map[string]sentry.Context{
							"interface": {"name": iface},
						})
						continue
					}
					report.ConnectionInfo = status
				}
				runnerBackoff := ws.NewExponentialBackOff(5*time.Second, time.Minute, 2.0)
				result, err := runRunner(runner, runnerBackoff, 3, iface)
				if err != nil {
					log.Println(errors.Wrap(err, "failed all attempts to run speed test"))
					continue
				}
				report.Result = result.Raw

				senderBackoff := ws.NewExponentialBackOff(15*time.Second, time.Minute, 2.0)
				err = sendMeasurement(ctx, reporter, report, runner.Type(), senderBackoff, 5)
				if err != nil {
					log.Println(errors.Wrap(err, "failed all attempts to send speed test result to server"))
					continue
				}

				c.LastTested = fmt.Sprintf("%d", time.Now().Unix())
				c.LastDownloadSpeed = fmt.Sprintf("%.2f", result.DownloadMbps)
				c.LastUploadSpeed = fmt.Sprintf("%.2f", result.UploadMbps)
				if err := config.Save(c); err != nil {
					log.Println(errors.Wrap(err, "failed to save config"))
					sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
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

func runRunner(runner Runner, backoff *ws.ExponentialBackOff, retries int, ifaceName string) (res *Measurement, err error) {
	for i := 0; i < retries; i++ {
		res, err = runner.RunForInterface(context.Background(), ifaceName)
		if err != nil {
			log.Println(errors.Wrap(err, "failed to run speed test"))
			if !errors.Is(err, ErrRunnerConnectionError) {
				sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
			}
			<-backoff.Next()
			continue
		}
		return res, nil
	}
	return nil, err
}

func sendMeasurement(ctx context.Context, reporter RadarClient, report MeasurementReport, runnerName string, backoff *ws.ExponentialBackOff, retries int) (err error) {
	for i := 0; i < retries; i++ {
		err = reporter.SendMeasurement(ctx, runnerName, report)
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

func getWlanConnInfo(name string) (*wifi.WifiStatus, error) {
	wlanCli, err := wifi.NewWirelessClient(name)
	if err != nil {
		err = errors.W(err)
		log.Println(err)
		sentry.NotifyErrorOnce(err, map[string]sentry.Context{
			"interface": {"name": name},
		})
	}
	defer wlanCli.Close()
	status, err := wlanCli.ConnectionStatus()
	if err != nil {
		return nil, errors.W(err)
	}
	return &status, nil
}
