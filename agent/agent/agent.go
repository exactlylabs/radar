package agent

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/exactlylabs/radar/agent/config"
	"github.com/exactlylabs/radar/agent/internal/update"
)

type Agent struct {
	pinger     Pinger
	registerer Registerer
	reporter   MeasurementReporter
	runners    []Runner
	runTestCh  chan bool
	pingRespCh chan *PingResponse
	wg         *sync.WaitGroup
	started    bool
}

func NewAgent(pinger Pinger, registerer Registerer, reporter MeasurementReporter, runners []Runner) *Agent {
	return &Agent{
		pinger:     pinger,
		registerer: registerer,
		reporter:   reporter,
		runners:    runners,
		runTestCh:  make(chan bool),
		pingRespCh: make(chan *PingResponse),
		wg:         &sync.WaitGroup{},
		started:    false,
	}
}

func (a *Agent) setup(c *config.Config) {
	if c.ClientId == "" {
		pod, err := a.registerer.Register()
		if err != nil {
			panic(err)
		}
		c.ClientId = pod.ClientId
		c.Secret = pod.Secret
		err = config.Save(c)
		if err != nil {
			panic(err)
		}
	}
}

// Start the Agent, blocking the current goroutine
func (a *Agent) Start(ctx context.Context, c *config.Config) {
	a.setup(c)

	// Start the workers
	a.wg.Add(2)
	go func() {
		defer a.wg.Done()
		startSpeedTestRunner(ctx, c, a.runTestCh, a.runners, a.reporter)
	}()
	go func() {
		defer a.wg.Done()
		startPingLoop(ctx, a.pingRespCh, a.pinger, pingFrequency(c), c.ClientId, c.Secret)
	}()

	// Main Loop will listen to the responses and schedule Speed Tests
	speedTestTimer := time.NewTicker(speedTestFrequency(c))
	for {
		select {
		case <-ctx.Done():
			log.Println("Stopping Agent tasks")
			a.Stop()
			a.wg.Wait()
			log.Println("Agent tasks finished")
			return

		case pingResp := <-a.pingRespCh:
			if pingResp.TestRequested {
				maybeSendChannel(a.runTestCh)
			}
			if pingResp.Update != nil {
				log.Printf("An Update for version %v is Available\n", pingResp.Update.Version)
				err := update.SelfUpdate(pingResp.Update.BinaryUrl)
				if err != nil {
					panic(err)
				}
				log.Println("Successfully Updated the Binary. Exiting current version.")
				os.Exit(1)
			}
		case <-speedTestTimer.C:
			maybeSendChannel(a.runTestCh)
		}
	}
}

func (a *Agent) Stop() {
	close(a.runTestCh)
}

func (a *Agent) StartTest() {
	if !a.started {
		panic("you cannot start a test before starting the agent")
	}
	maybeSendChannel(a.runTestCh)
}

// maybeSendChannel simply tries to send to the channel
// and in case the receiver is currently occupied, return.
func maybeSendChannel(ch chan<- bool) {
	select {
	case ch <- true:
	default:
	}
}

func strToDuration(freqStr string, base time.Duration) time.Duration {
	freqInt, err := strconv.Atoi(freqStr)
	if err != nil {
		panic(fmt.Errorf("unable to convert %v to integer", freqStr))
	}
	return time.Duration(freqInt) * base
}

func pingFrequency(c *config.Config) time.Duration {
	pingFreqStr := c.PingFreq
	pingFreq := strToDuration(pingFreqStr, time.Second)
	return pingFreq
}

func speedTestFrequency(c *config.Config) time.Duration {
	testFreqStr := c.TestFreq
	testFreq := strToDuration(testFreqStr, time.Second)
	return testFreq
}
