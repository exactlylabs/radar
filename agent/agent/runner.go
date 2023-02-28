package agent

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/exactlylabs/radar/agent/config"
)

func startSpeedTestRunner(ctx context.Context, c *config.Config, runTestCh <-chan bool, runners []Runner, reporter MeasurementReporter) {
	for range runTestCh {
		log.Println("Starting Speed Tests")
		for _, runner := range runners {
			result, err := runner.Run(ctx)
			if err != nil {
				log.Println(fmt.Errorf("agent.startSpeedTestRunner failed running test, skipping it: %w", err))
				continue
			}
			err = reporter.ReportMeasurement(c.ClientId, c.Secret, runner.Type(), result.Raw)
			if err != nil {
				log.Println(err)
				continue
			}
			c.LastTested = fmt.Sprintf("%d", time.Now().Unix())
			c.LastDownloadSpeed = fmt.Sprintf("%.2f", result.DownloadMbps)
			c.LastUploadSpeed = fmt.Sprintf("%.2f", result.UploadMbps)
			if err := config.Save(c); err != nil {
				log.Println(fmt.Errorf("agent.startSpeedTestRunner config.Save: %w", err))
			}
		}
	}
}
