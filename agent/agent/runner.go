package agent

import (
	"context"
	"log"

	"github.com/exactlylabs/radar/agent/config"
)

func startSpeedTestRunner(ctx context.Context, c *config.Config, runTestCh <-chan bool, runners []Runner, reporter MeasurementReporter) {
	for range runTestCh {
		log.Println("Starting Speed Tests")
		for _, runner := range runners {
			result, err := runner.Run(ctx)
			if err != nil {
				panic(err)
			}
			err = reporter.ReportMeasurement(c.ClientId, c.Secret, runner.Type(), result)
			if err != nil {
				log.Println(err)
				continue
			}
		}
	}
}
