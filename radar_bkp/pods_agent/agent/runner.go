package agent

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/services/tracing"
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
					err = fmt.Errorf("agent.startSpeedTestRunner failed running test, skipping it: %w", err)
					log.Println(err)
					tracing.NotifyErrorOnce(err, tracing.Context{})
					continue
				}
				err = reporter.SendMeasurement(ctx, runner.Type(), result.Raw)
				if err != nil {
					err = fmt.Errorf("agent.startSpeedTestRunner failed sending speedtest result: %w", err)
					log.Println(err)
					tracing.NotifyErrorOnce(err, tracing.Context{})
					continue
				}
				c.LastTested = fmt.Sprintf("%d", time.Now().Unix())
				c.LastDownloadSpeed = fmt.Sprintf("%.2f", result.DownloadMbps)
				c.LastUploadSpeed = fmt.Sprintf("%.2f", result.UploadMbps)
				if err := config.Save(c); err != nil {
					log.Println(fmt.Errorf("agent.startSpeedTestRunner config.Save: %w", err))
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
