package agent

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/services/ws"
)

func startSpeedTestRunner(ctx context.Context, c *config.Config, runTestCh <-chan bool, runners []Runner, reporter RadarClient) {
	for range runTestCh {
		log.Println("Starting Speed Tests")
		successfull := false
		backoff := ws.NewExponentialBackOff(2*time.Second, time.Minute, 2.0)
		for !successfull {
			for _, runner := range runners {
				result, err := runner.Run(ctx)
				if err != nil {
					err = errors.Wrap(err, "failed to run speed test")
					log.Println(err)
					sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
					continue
				}
				err = reporter.SendMeasurement(ctx, runner.Type(), result.Raw)
				if err != nil {
					err = errors.Wrap(err, "failed to send speed test result to server")
					log.Println(err)
					sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
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
			if !successfull {
				log.Println("agent.startSpeedTestRunner: all runners have failed, retrying after backoff period")
				<-backoff.Next()
			}
		}
	}
}
