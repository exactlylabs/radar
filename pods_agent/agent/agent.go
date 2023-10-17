package agent

import (
	"context"
	"log"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/internal/update"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/exactlylabs/radar/pods_agent/watchdog"
)

type Agent struct {
	client     RadarClient
	runners    []Runner
	runTestCh  chan bool
	pingRespCh chan *ServerMessage
	wg         *sync.WaitGroup
	started    bool
}

func NewAgent(client RadarClient, runners []Runner) *Agent {
	return &Agent{
		client:     client,
		runners:    runners,
		runTestCh:  make(chan bool),
		pingRespCh: make(chan *ServerMessage),
		wg:         &sync.WaitGroup{},
		started:    false,
	}
}

// registerAgent tries to register the agent to the server and retries
// every 10 seconds in case of error until it succeeds or the context is cancelled
func (a *Agent) registerAgent(ctx context.Context, c *config.Config) *RegisteredPod {
	retryPeriod := 10 * time.Second
	for {
		log.Println("Registering the pod to the server")
		pod, err := a.client.Register(c.RegistrationToken)
		if err != nil {
			err = errors.Wrap(err, "failed to register pod to server")
			log.Println(err)
			sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
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

func (a *Agent) Setup(ctx context.Context, c *config.Config) {
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
	err := config.Save(c)
	if err != nil {
		panic(errors.W(err))
	}
}

// Start the Agent, blocking the current goroutine
func (a *Agent) Start(ctx context.Context, c *config.Config, rebooter Rebooter) {
	agentCtx, cancel := context.WithCancel(ctx)
	a.Setup(ctx, c)

	// Start the workers
	a.wg.Add(2)
	go func() {
		defer a.wg.Done()
		defer sentry.NotifyIfPanic() // always add this to each new goroutine
		startSpeedTestRunner(agentCtx, c, a.runTestCh, a.runners, a.client)
	}()
	go func() {
		defer a.wg.Done()
		defer sentry.NotifyIfPanic() // always add this to each new goroutine
		startPingLoop(agentCtx, a.pingRespCh, a.client, pingFrequency(c))
	}()

	a.client.Connect(agentCtx, a.pingRespCh)
	defer a.client.Close()

	// Main Loop will listen to the responses and schedule Speed Tests when requested by the server
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
				updateAgent(*pingResp.Update, cancel)
			}
			if pingResp.WatchdogUpdate != nil {
				updateWatchdogIfNeeded(*pingResp.WatchdogUpdate, rebooter, cancel)
			}
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
		panic(errors.Wrap(err, "unable to convert %v to integer", freqStr))
	}
	return time.Duration(freqInt) * base
}

func pingFrequency(c *config.Config) time.Duration {
	pingFreqStr := c.PingFreq
	pingFreq := strToDuration(pingFreqStr, time.Second)
	return pingFreq
}

func updateAgent(bu BinaryUpdate, cancel context.CancelFunc) {
	log.Printf("An Update for version %v is Available\n", bu.Version)
	err := update.SelfUpdate(bu.BinaryUrl, bu.Version)
	if update.IsValidationError(err) {
		log.Printf("Existent update is invalid: %v\n", err)
		sentry.NotifyErrorOnce(errors.W(err), map[string]sentry.Context{
			"Update Data": {
				"version": bu.Version,
				"url":     bu.BinaryUrl,
			},
		})
	} else if err != nil {
		panic(errors.W(err))
	} else {
		log.Println("Successfully Updated the Binary. Exiting current version.")
		cancel()
		os.Exit(1)
	}
}

// updateWatchdogIfNeeded verifies if the watchdog is running, and in case it's not, it updates it.
func updateWatchdogIfNeeded(bu BinaryUpdate, rebooter Rebooter, cancel context.CancelFunc) {
	if !sysinfo.WatchdogIsRunning() {
		log.Printf("An Update for Watchdog Version %v is available\n", bu.Version)
		err := watchdog.UpdateWatchdog(bu.BinaryUrl, bu.Version)
		if update.IsValidationError(err) {
			log.Printf("Existent update is invalid: %v\n", err)
			sentry.NotifyErrorOnce(errors.W(err), map[string]sentry.Context{
				"Update Data": {
					"version": bu.Version,
					"url":     bu.BinaryUrl,
				},
			})
		} else if err != nil {
			panic(errors.W(err))
		} else {
			log.Println("Successfully Updated the Watchdog. Restarting the whole system")
			if err := rebooter.Reboot(); err != nil {
				panic(errors.Wrap(err, "Reboot failed"))
			}
			cancel()
			os.Exit(1)
		}
	}
}
