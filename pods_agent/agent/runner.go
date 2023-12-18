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
		runUntilSuccessfull(ctx, runners, reporter, c)
		log.Println("Finished running Speed Tests")
	}
}

func runUntilSuccessfull(ctx context.Context, runners []Runner, reporter RadarClient, c *config.Config) {
	successfull := false
	backoff := ws.NewExponentialBackOff(2*time.Second, time.Minute, 2.0)

	for !successfull {
		for _, runner := range runners {
			runnerBackoff := ws.NewExponentialBackOff(5*time.Second, time.Minute, 2.0)
			result, err := runRunner(runner, runnerBackoff, 3)
			if err != nil {
				log.Println(errors.Wrap(err, "failed all attempts to run speed test"))
				continue
			}

			senderBackoff := ws.NewExponentialBackOff(15*time.Second, time.Minute, 2.0)
			err = sendMeasurement(ctx, reporter, result, runner.Type(), senderBackoff, 5)
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

		if !successfull {
			log.Println("agent.startSpeedTestRunner: all runners have failed, retrying after backoff period")
			<-backoff.Next()
		}
	}
}

func runRunner(runner Runner, backoff *ws.ExponentialBackOff, retries int) (res *Measurement, err error) {
	for i := 0; i < retries; i++ {
		res, err = runner.Run(context.Background())
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

func sendMeasurement(ctx context.Context, reporter RadarClient, measurement *Measurement, runnerName string, backoff *ws.ExponentialBackOff, retries int) (err error) {
	for i := 0; i < retries; i++ {
		err = reporter.SendMeasurement(ctx, runnerName, measurement.Raw)
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
