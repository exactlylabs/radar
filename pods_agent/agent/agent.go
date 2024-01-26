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
	"github.com/exactlylabs/radar/pods_agent/internal/info"
	"github.com/exactlylabs/radar/pods_agent/internal/update"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/exactlylabs/radar/pods_agent/watchdog"
)

type Agent struct {
	client      RadarClient
	runners     []Runner
	runTestCh   chan RunTestServerMessage
	serverMsgCh chan *ServerMessage
	wg          *sync.WaitGroup
	started     bool
	conf        *config.Config
}

func NewAgent(client RadarClient, runners []Runner) *Agent {
	return &Agent{
		client:      client,
		runners:     runners,
		runTestCh:   make(chan RunTestServerMessage),
		serverMsgCh: make(chan *ServerMessage),
		wg:          &sync.WaitGroup{},
		started:     false,
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
	a.conf = c
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
		startPingLoop(agentCtx, a.serverMsgCh, a.client, pingFrequency(c))
	}()

	a.client.Connect(agentCtx, a.serverMsgCh)
	defer a.client.Close()

	// Main Loop will listen to the responses and schedule Speed Tests when requested by the server
	for {
		select {
		case <-agentCtx.Done():
			a.Stop()
			cancel()
			a.wg.Wait()
			return

		case serverMsg := <-a.serverMsgCh:
			a.handleServerMessage(*serverMsg, rebooter, cancel)
		}
	}
}

func (a *Agent) handleServerMessage(msg ServerMessage, rebooter Rebooter, cancel context.CancelFunc) {
	if msg.Data == nil {
		// We don't accept empty messages
		return
	}
	switch msg.Type {
	case RunTest:
		maybeSendChannel(a.runTestCh, msg.Data.(RunTestServerMessage))

	case Update:
		if a.conf.Environment == "Dev" {
			log.Println("Received Update Pod Agent Message: ", msg.Data.(UpdateBinaryServerMessage))
			log.Println("Setting version manually to", msg.Data.(UpdateBinaryServerMessage).Version)
			info.SetVersion(msg.Data.(UpdateBinaryServerMessage).Version)
			a.client.Close()
			a.client.Connect(context.Background(), a.serverMsgCh)
		} else {
			updateAgent(msg.Data.(UpdateBinaryServerMessage), cancel)
		}

	case UpdateWatchdog:
		if a.conf.Environment == "Dev" {
			log.Println("Received Update Pod Watchdog Message: ", msg.Data.(UpdateBinaryServerMessage))
			log.Println("Skipping it due to being in Dev Environment")
		} else {
			updateWatchdogIfNeeded(msg.Data.(UpdateBinaryServerMessage), rebooter, cancel)
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
	maybeSendChannel(a.runTestCh, RunTestServerMessage{})
}

// maybeSendChannel simply tries to send to the channel
// and in case the receiver is currently occupied, return.
func maybeSendChannel(ch chan<- RunTestServerMessage, msg RunTestServerMessage) {
	select {
	case ch <- msg:
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

func updateAgent(msg UpdateBinaryServerMessage, cancel context.CancelFunc) {
	log.Printf("An Update for version %v is Available\n", msg.Version)
	err := update.SelfUpdate(msg.BinaryUrl, msg.Version)
	if update.IsValidationError(err) {
		log.Printf("Existent update is invalid: %v\n", err)
		sentry.NotifyErrorOnce(errors.W(err), map[string]sentry.Context{
			"Update Data": {
				"version": msg.Version,
				"url":     msg.BinaryUrl,
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
func updateWatchdogIfNeeded(msg UpdateBinaryServerMessage, rebooter Rebooter, cancel context.CancelFunc) {
	if !sysinfo.WatchdogIsRunning() {
		log.Printf("An Update for Watchdog Version %v is available\n", msg.Version)
		err := watchdog.UpdateWatchdog(msg.BinaryUrl, msg.Version)
		if update.IsValidationError(err) {
			log.Printf("Existent update is invalid: %v\n", err)
			sentry.NotifyErrorOnce(errors.W(err), map[string]sentry.Context{
				"Update Data": {
					"version": msg.Version,
					"url":     msg.BinaryUrl,
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
