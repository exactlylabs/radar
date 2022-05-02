package agent

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"strconv"
	"sync"
	"time"

	"github.com/exactlylabs/radar/agent/config"
	"github.com/exactlylabs/radar/agent/internal/update"
	"github.com/exactlylabs/radar/agent/services/tracing"
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

func NewAgent(client ServerClient, runners []Runner) *Agent {
	return &Agent{
		pinger:     client.(Pinger),
		registerer: client.(Registerer),
		reporter:   client.(MeasurementReporter),
		runners:    runners,
		runTestCh:  make(chan bool),
		pingRespCh: make(chan *PingResponse),
		wg:         &sync.WaitGroup{},
		started:    false,
	}
}

// registerAgent tries to register the agent to the server and retries
// every 10 seconds in case of error until it succeeds or the context is cancelled
func (a *Agent) registerAgent(ctx context.Context, c *config.Config) *RegisteredPod {
	retryPeriod := 10 * time.Second
	isShippedPod := false
	var err error
	if c.IsShippedPod != nil {
		isShippedPod, err = strconv.ParseBool(*c.IsShippedPod)
		if err != nil {
			panic(fmt.Errorf("agent.registerAgent error parsing isShippedPod: %w", err))
		}
	}
	for {
		log.Println("Registering the pod to the server")
		pod, err := a.registerer.Register(isShippedPod)
		if err != nil {
			log.Println(err)
			log.Printf("Waiting %v before retrying\n", retryPeriod)
		}
		if pod != nil {
			return pod
		}
		select {
		case <-ctx.Done():
			return nil
		case <-time.NewTimer(retryPeriod).C:
		}
	}
}

func (a *Agent) setup(ctx context.Context, c *config.Config) {
	if c.ClientId == "" {
		log.Println("No Client ID found for this agent.")

		pod := a.registerAgent(ctx, c)
		if pod == nil {
			// Context was cancelled, skip all rest
			return
		}
		c.ClientId = pod.ClientId
		c.Secret = pod.Secret
		log.Println("Agent Registered to the Server!")
		log.Println("Client ID =", c.ClientId)
		log.Println("Secret =", c.Secret)
		log.Println("You can find these values in the config file located at", config.Join("config.conf"))
	}
	if c.TestMinute == "" {
		s := rand.NewSource(time.Now().UnixNano())
		r := rand.New(s)
		c.TestMinute = fmt.Sprintf("%d", r.Intn(59))
	}
	err := config.Save(c)
	if err != nil {
		panic(err)
	}
}

// Start the Agent, blocking the current goroutine
func (a *Agent) Start(ctx context.Context, c *config.Config) {
	agentCtx, cancel := context.WithCancel(ctx)
	a.setup(ctx, c)

	// Start the workers
	a.wg.Add(2)
	go func() {
		defer a.wg.Done()
		defer tracing.NotifyPanic() // always add this to each new goroutine
		startSpeedTestRunner(agentCtx, c, a.runTestCh, a.runners, a.reporter)
	}()
	go func() {
		defer a.wg.Done()
		defer tracing.NotifyPanic() // always add this to each new goroutine
		startPingLoop(agentCtx, a.pingRespCh, a.pinger, pingFrequency(c), c.ClientId, c.Secret)
	}()

	// Main Loop will listen to the responses and schedule Speed Tests
	speedTestTimer := newSpeedTestTicker(c)
	firstRun := true
	for {
		select {
		case <-agentCtx.Done():
			a.Stop()
			cancel()
			a.wg.Wait()
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
				cancel()
			}
		case <-speedTestTimer.C:
			if firstRun {
				firstRun = false
				// Now that it started at the correct minute,
				// start the timer with the correct frequency
				speedTestTimer.Reset(speedTestFrequency(c))
			}
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

// newSpeedTestTicker initiates a ticker configured to trigger
// at the next `TestMinute` from the config file.
// Make sure to Reset() it to the proper frequency after first run
func newSpeedTestTicker(c *config.Config) *time.Ticker {
	minute, err := strconv.Atoi(c.TestMinute)
	if err != nil {
		panic(fmt.Errorf("agent.Start error converting TestMinute to int: %w", err))
	}
	minutesMissing := minute - (time.Now().Minute())
	if minutesMissing < 0 {
		minutesMissing = 60 - minutesMissing
	} else if minutesMissing == 0 {
		return time.NewTicker(time.Second)
	}
	return time.NewTicker(time.Minute * time.Duration(minutesMissing))
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
