package watchdog

import (
	"context"
	"log"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/internal/update"
	"github.com/exactlylabs/radar/pods_agent/services/radar/messages"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/wifi"
	"github.com/exactlylabs/radar/pods_agent/watchdog/display"
)

type Watchdog struct {
	c               *config.Config
	sysManager      SystemManager
	agentCli        display.AgentClient
	cli             WatchdogClient
	wlanCliFactory  WlanClientFactory
	wlanCli         wifi.WirelessClient
	scanner         *Scanner
	ledManager      *ACTLEDManager
	lastHealthCheck time.Time
}

type WlanClientFactory func(ifaceName string) (wifi.WirelessClient, error)

func NewWatchdog(c *config.Config, sysManager SystemManager, agentCli display.AgentClient, cli WatchdogClient, wlanCliFactory WlanClientFactory) *Watchdog {
	return &Watchdog{
		c:               c,
		sysManager:      sysManager,
		agentCli:        agentCli,
		cli:             cli,
		wlanCliFactory:  wlanCliFactory,
		wlanCli:         nil,
		scanner:         NewScanner(sysManager),
		ledManager:      NewActLEDManager(sysManager),
		lastHealthCheck: time.Now(),
	}
}

func (w *Watchdog) setup(ctx context.Context) {
	go func() {
		defer sentry.NotifyIfPanic()
		display.StartDisplayLoop(ctx, os.Stdout, w.agentCli, w.sysManager)
	}()
	go func() {
		defer sentry.NotifyIfPanic()
		w.scanner.StartScanLoop(ctx)
	}()
	go func() {
		defer sentry.NotifyIfPanic()
		w.ledManager.Start(ctx)
	}()

	if w.c.WlanInterface != "" {
		if err := w.configureWlanInterface(ctx, w.c.WlanInterface); err != nil {
			log.Println(err)
			sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
		}
	}
}

func (w *Watchdog) configureWlanInterface(ctx context.Context, name string) error {
	log.Println("Configuring Wlan Interface connection for", name)
	if w.wlanCli != nil {
		w.wlanCli.Close()
	}
	if name == "" {
		return nil
	}
	wlanCli, err := w.wlanCliFactory(name)
	if err != nil {
		return errors.W(err).WithMetadata(errors.Metadata{"Wlan": name})
	}
	w.wlanCli = wlanCli
	w.c = config.Reload()
	w.c.WlanInterface = name
	config.Save(w.c)
	go func() {
		wifiEvents, err := w.wlanCli.StartSubscriptions()
		if err != nil {
			err := errors.W(err)
			log.Println("watchdog.Watchdog#Run wlanCli.StartSubscriptions:", err)
			sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
		}
		for evt := range wifiEvents {
			w.handleWifiEvents(ctx, evt)
		}
	}()
	return nil
}

func (w *Watchdog) getSync() messages.WatchdogSync {
	meta := sysinfo.Metadata()
	tsConnected, err := w.sysManager.TailscaleConnected()
	if err != nil {
		err = errors.W(err)
		log.Println(err)
		sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
	}
	wlan := ""
	var wifiStatus *wifi.WifiStatus
	if w.wlanCli != nil {
		wlan = w.wlanCli.InterfaceName()
		status, err := w.wlanCli.ConnectionStatus()
		if err != nil {
			err = errors.W(err)
			log.Println(err)
			sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
		}
		wifiStatus = &status
	}
	return messages.WatchdogSync{
		Sync: messages.Sync{
			OSVersion:         runtime.GOOS,
			HardwarePlatform:  runtime.GOARCH,
			Distribution:      meta.Distribution,
			Version:           meta.Version,
			NetInterfaces:     meta.NetInterfaces,
			WatchdogVersion:   meta.WatchdogVersion,
			RegistrationToken: meta.RegistrationToken,
		},
		TailscaleConnected: tsConnected,
		WlanInterface:      wlan,
		WifiStatus:         wifiStatus,
	}
}

// Run is a blocking function that starts all routines related to the Watchdog.
func (w *Watchdog) Run(ctx context.Context) {
	w.setup(ctx)

	timer := time.NewTicker(10 * time.Second)
	cliChan := make(chan ServerMessage)
	if err := w.cli.Connect(cliChan, w.getSync); err != nil {
		panic(err)
	}
	// Ensure everything is properly stopped when leaving
	defer func() {
		if w.wlanCli != nil {
			w.wlanCli.Close()
		}
		w.cli.Close()
	}()
	healthChecker := time.NewTicker(time.Second * 5)
	for {
		select {
		case <-ctx.Done():
			return
		case <-healthChecker.C:
			// Validate that the client is connected, and in a healthy state. Restart the connection if otherwise.
			if w.cli.Connected() && time.Since(w.lastHealthCheck) > time.Minute*2 {
				panic("Watchdog can't continue working because WatchdogClient is connected but in an unhealthy state.")
			}
		case event := <-w.scanner.Events():
			w.handleSystemEvent(event)
		case msg := <-cliChan:
			w.handleMessage(ctx, msg)
		case <-timer.C:
			if !w.cli.Connected() {
				res, err := w.cli.WatchdogPing(sysinfo.Metadata())
				if err != nil {
					log.Println(errors.W(err))
					continue
				} else if res != nil {
					w.handleMessage(ctx, *res)
				}
			}
		}
	}
}

func (w *Watchdog) handleSystemEvent(event SystemEvent) {
	switch event.EventType {
	case SystemFileChanged:
		log.Println("System File has Changed, requesting reboot.")
		if err := w.sysManager.Reboot(); err != nil {
			err = errors.W(err)
			sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
			log.Println(err)
		}

	case AgentStatusChanged:
		log.Printf("Radar Agent Status Changed: %v\n", event.Data)
		w.updateLEDManagerFromStatus(w.scanner.SystemStatus())
	case EthernetStatusChanged:
		log.Printf("Pod Ethernet Status Changed: %v\n", event.Data)
		w.updateLEDManagerFromStatus(w.scanner.SystemStatus())

	case LoginDetected:
		evt := event.Data.(LoginEvent)
		if previousAuthLogTime.Before(evt.Time) {
			previousAuthLogTime = evt.Time
		}
		log.Printf("New Login Detected at %v, notifying through tracing\n", evt.Time)
		sentry.NotifyError(
			errors.NewWithType("new Login Detected in the Pod", "Login Detected"),
			map[string]sentry.Context{
				"Login Info": {"User": evt.User, "Time": evt.Time, "Unix User": w.c.ClientId},
			},
		)
	}
}

func (w *Watchdog) handleMessage(ctx context.Context, msg ServerMessage) {
	if msg.Data == nil {
		// We don't accept empty messages
		return
	}
	var err error
	switch msg.Type {
	case HealthCheckMessageType:
		w.lastHealthCheck = time.Now()
	case UpdateWatchdogMessageType:
		err = w.handleUpdate(msg.Data.(UpdateBinaryServerMessage))
	case EnableTailscaleMessageType:
		err = w.handleEnableTailscale(ctx, msg.Data.(EnableTailscaleServerMessage))
	case DisableTailscaleMessageType:
		err = w.handleDisableTailscale(ctx, msg.Data.(DisableTailscaleServerMessage))
	case ConnectToSSIDMessageType:
		err = w.handleConnectToSSID(ctx, msg.Data.(ConnectToSSIDMessage))
	case ConnectToExistingSSIDMessageType:
		err = w.handleConnectToExistingSSID(ctx, msg.Data.(ConnectToExistingSSIDMessage))
	case ScanAPsMessageType:
		err = w.handleScanAps(ctx, msg.Data.(ScanAPsMessage))
	case ReportWirelessStatusMessageType:
		err = w.handleReportWirelessStatus(ctx, msg.Data.(ReportWirelessStatusMessage))
	case SetWlanInterfaceMessageType:
		err = w.handleSetWlanInterface(ctx, msg.Data.(SetWlanInterfaceMessage))
	case DisconnectWirelessNetworkMessageType:
		err = w.handleDisconnectWirelessNetwork(ctx, msg.Data.(DisconnectWirelessNetworkMessage))
	case ReportLogsMessageType:
		err = w.handleReportLogs(ctx, msg.Data.(ReportLogsMessage))
	}

	if err != nil {
		err = errors.W(err)
		log.Println(err)
		if w.shouldReportToSentry(err) {
			sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
		}
		w.cli.ReportActionError(msg.Type, err)
	}
}

func (w *Watchdog) shouldReportToSentry(err error) bool {
	if err == nil {
		return false
	} else if errors.Is(err, wifi.ErrAuthFailed) {
		return false
	}
	return true
}

func (w *Watchdog) handleUpdate(data UpdateBinaryServerMessage) error {
	log.Printf("An Update for Watchdog Version %v is available\n", data.Version)
	err := UpdateWatchdog(data.BinaryUrl, data.Version)
	if update.IsValidationError(err) {
		log.Printf("Existent update is invalid: %v\n", err)
		sentry.NotifyErrorOnce(err, map[string]sentry.Context{
			"Update Data": {
				"version": data.Version,
				"url":     data.BinaryUrl,
			},
		})
	} else if err != nil {
		panic(err)
	} else {
		log.Println("Successfully Updated the Watchdog. Restarting the whole system")
		if err := w.sysManager.Reboot(); err != nil {
			panic(err)
		}
		os.Exit(1)
	}
	return nil
}

func (w *Watchdog) handleEnableTailscale(ctx context.Context, data EnableTailscaleServerMessage) error {
	err := w.sysManager.TailscaleUp(data.AuthKey, data.Tags)
	if err != nil {
		err = errors.W(err).WithMetadata(errors.Metadata{
			"keyId": data.KeyId,
			"tags":  data.Tags,
		})
		return err
	}
	log.Println("Successfully Logged in to Tailnet")
	w.cli.NotifyTailscaleConnected(data.KeyId)
	return nil
}

func (w *Watchdog) handleDisableTailscale(ctx context.Context, data DisableTailscaleServerMessage) error {
	err := w.sysManager.TailscaleDown()
	if err != nil {
		return errors.W(err).WithMetadata(errors.Metadata{
			"keyId": data.KeyId,
		})
	}
	log.Println("Successfully Logged out of Tailnet")
	w.cli.NotifyTailscaleDisconnected(data.KeyId)
	return nil
}

func (w *Watchdog) handleWifiEvents(ctx context.Context, data wifi.Event) error {
	switch data.Type {
	case wifi.Connected:
		w.cli.ReportWirelessConnectionStateChanged("connected", data.SSID)
	case wifi.Disconnected:
		w.cli.ReportWirelessConnectionStateChanged("disconnected", data.SSID)
	}
	return nil
}

func (w *Watchdog) handleConnectToSSID(ctx context.Context, data ConnectToSSIDMessage) error {
	log.Println("Requested to connect to SSID:", data.SSID)
	err := w.wlanCli.Connect(data.SSID, data.PSK)
	if err != nil {
		return errors.W(err)
	}
	log.Println("Successfully connected to SSID.")
	return nil
}

func (w *Watchdog) handleConnectToExistingSSID(ctx context.Context, data ConnectToExistingSSIDMessage) error {
	log.Println("Requested to connect to existing SSID:", data.SSID)
	err := w.wlanCli.Select(data.SSID)
	if err != nil {
		return errors.W(err)
	}
	log.Println("Successfully connected to SSID.")
	return nil
}

func (w *Watchdog) handleScanAps(ctx context.Context, data ScanAPsMessage) error {
	if w.wlanCli == nil {
		return wifi.ErrNotConnected
	}

	log.Println("Starting Wireless Networks Scan")
	aps, err := w.wlanCli.ScanAccessPoints()
	if err != nil {
		return errors.W(err)
	}
	log.Println("Network Scan Finished, sending report back to server.")
	w.cli.ReportScanAPsResult(aps)
	return nil
}

func (w *Watchdog) handleReportWirelessStatus(ctx context.Context, data ReportWirelessStatusMessage) error {
	if w.wlanCli == nil {
		return wifi.ErrNotConnected
	}
	log.Println("Reporting Wireless Connection Status")
	status, err := w.wlanCli.ConnectionStatus()
	if err != nil && !errors.Is(err, wifi.ErrNotConnected) {
		return errors.W(err)
	}
	w.cli.ReportWirelessStatus(status)
	return nil
}

func (w *Watchdog) handleSetWlanInterface(ctx context.Context, data SetWlanInterfaceMessage) error {
	if err := w.configureWlanInterface(ctx, data.Name); err != nil {
		return errors.W(err)
	}
	return nil
}

func (w *Watchdog) handleDisconnectWirelessNetwork(ctx context.Context, data DisconnectWirelessNetworkMessage) error {
	if w.wlanCli != nil {
		log.Println("Disconnecting from Wireless Network")
		err := w.wlanCli.Disconnect()
		if err != nil {
			return errors.W(err)
		}
	}
	return nil
}

func (w *Watchdog) handleReportLogs(ctx context.Context, data ReportLogsMessage) error {
	n := data.Lines
	if n == 0 {
		n = 100
	}
	l := make(Logs)
	for _, name := range data.Services {
		// svcLogs, err := w.sysManager.GetServiceLogs(name, n)
		// if err != nil {
		// 	return errors.W(err)
		// }
		command := strings.SplitN(name, " ", 1)
		args := strings.Split(command[1], " ")
		out, err := exec.Command(command[0], args...).Output()
		if err != nil {
			return errors.W(err)
		}
		l[name] = string(out)
	}

	w.cli.ReportLogs(l)
	return nil
}

func (w *Watchdog) updateLEDManagerFromStatus(status SystemStatus) {
	if status.EthernetStatus == network.ConnectedWithInternet && status.PodAgentRunning {
		w.ledManager.SetPattern(LEDOn)
	} else if !status.PodAgentRunning {
		w.ledManager.SetPattern(LEDOff)
	} else if status.EthernetStatus == network.ConnectedNoInternet {
		w.ledManager.SetPattern(LEDBlinkSlow)
	} else if status.EthernetStatus == network.Disconnected {
		w.ledManager.SetPattern(LEDBlinkFast)
	} else {
		w.ledManager.SetPattern(append(LEDBlinkDot, LEDBlinkDash...))
	}
}
