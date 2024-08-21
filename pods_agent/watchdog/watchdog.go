package watchdog

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/internal/update"
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

	// Try to setup and start the wlan client, but don't panic in case it fails
	w.setupWlanClient()
	if w.wlanCli != nil {
		go func() {
			defer sentry.NotifyIfPanic()
			w.startWlanClient(ctx)
		}()
	}
}

func (w *Watchdog) setupWlanClient() {
	ifaces, err := network.Interfaces()
	if err != nil {
		sentry.NotifyErrorOnce(
			errors.WrapWithType(err, "failed to retrieve interfaces at startup", "StartupError"),
			map[string]sentry.Context{},
		)
		return
	}
	iface := ifaces.FindByType(network.Wlan)
	if iface == nil {
		sentry.NotifyErrorOnce(
			errors.NewWithType("wlan interface not found", "StartupError"),
			map[string]sentry.Context{},
		)
		return
	}
	log.Println("watchdog.configureWlanInterface: Configuring Wlan Interface connection for", iface.Name)

	if iface.Name == "" {
		return
	}
	wlanCli, err := w.wlanCliFactory(iface.Name)
	if err != nil {
		sentry.NotifyErrorOnce(
			errors.WrapWithType(err, "", "StartupError").WithMetadata(errors.Metadata{"Wlan": iface.Name}),
			map[string]sentry.Context{},
		)
		return
	}
	w.wlanCli = wlanCli
}

func (w *Watchdog) startWlanClient(ctx context.Context) {
	wifiEvents, err := w.wlanCli.StartSubscriptions()
	if err != nil {
		err := errors.W(err)
		log.Println("watchdog.Watchdog#Run wlanCli.StartSubscriptions:", err)
		sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
	}
	for evt := range wifiEvents {
		w.handleWifiEvents(ctx, evt)
	}
}

// Run is a blocking function that starts all routines related to the Watchdog.
func (w *Watchdog) Run(ctx context.Context) {
	w.setup(ctx)

	timer := time.NewTicker(10 * time.Second)
	cliChan := make(chan ServerMessage)
	if err := w.cli.Connect(cliChan); err != nil {
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
				// Fallback to a manual ping in case the client is failing to connect
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

	case ConnectionStatusChanged:
		log.Printf("Pod Connection Status Changed: %v\n", event.Data)
		w.updateLEDManagerFromStatus(w.scanner.SystemStatus())
		status, err := w.getConnectionsStatus()
		if err != nil {
			err = errors.W(err)
			sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
			log.Println(err)
			return
		}
		w.cli.ReportConnectionStatus(status)

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
	case SyncMessageType:
		err = w.handleSyncRequested(msg.Data.(SyncMessage))
	case UpdateWatchdogMessageType:
		err = w.handleUpdate(msg.Data.(UpdateBinaryServerMessage))
	case EnableTailscaleMessageType:
		err = w.handleEnableTailscale(ctx, msg.Data.(EnableTailscaleServerMessage))
	case DisableTailscaleMessageType:
		err = w.handleDisableTailscale(ctx, msg.Data.(DisableTailscaleServerMessage))
	case ConfigureSSIDMessageType:
		err = w.handleConfigureSSID(ctx, msg.Data.(ConfigureSSIDMessage))
	case ForgetSSIDMessageType:
		err = w.handleForgetSSID(ctx, msg.Data.(ForgetSSIDMessage))
	case ScanAPsMessageType:
		err = w.handleScanAps(ctx, msg.Data.(ScanAPsMessage))
	case ReportLogsMessageType:
		err = w.handleReportLogs(ctx, msg.Data.(ReportLogsMessage))
	case ReportConnectionStatusMessageType:
		err = w.handleReportConnectionStatus(ctx, msg.Data.(ReportConnectionStatusMessage))
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

func (w *Watchdog) handleSyncRequested(data SyncMessage) (err error) {
	syncData := WatchdogSync{}

	if meta := sysinfo.Metadata(); meta != nil {
		syncData.Version = meta.Version
	}

	syncData.TailscaleConnected, err = w.sysManager.TailscaleConnected()
	if err != nil {
		err = errors.W(err)
		log.Println(err)
		sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
	}

	if w.wlanCli != nil {
		nets, err := w.wlanCli.ConfiguredNetworks()
		if err != nil {
			err = errors.W(err)
			log.Println(err)
			sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
		} else {
			syncData.RegisteredSSIDs = make([]string, len(nets))
			for i, net := range nets {
				syncData.RegisteredSSIDs[i] = net.SSID
			}
		}
	}

	connStatus, err := w.getConnectionsStatus()
	if err != nil {
		err = errors.W(err)
		log.Println(err)
		sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
	} else {
		syncData.ConnectionStatus = connStatus
	}

	if err := w.cli.SyncData(syncData); err != nil {
		return errors.W(err)
	}
	return nil
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
		status, _ := w.getConnectionsStatus()
		w.cli.ReportWirelessConnectionStateChanged(status.Wlan.Status, data.SSID)
	case wifi.Disconnected:
		w.cli.ReportWirelessConnectionStateChanged(network.Disconnected, data.SSID)
	}
	return nil
}

func (w *Watchdog) handleConfigureSSID(ctx context.Context, data ConfigureSSIDMessage) error {
	log.Printf("watchdog.handleConfigureSSID: Received SSID configuration request: %+v\n", data)
	connData := wifi.NetworkConnectionData{
		SSID:     data.SSID,
		Password: data.Password,
		Identity: data.Identity,
		Security: wifi.SecType(data.Security),
	}
	err := w.wlanCli.ConfigureNetwork(connData)
	if err != nil {
		return errors.W(err)
	}
	log.Printf("watchdog.handleConfigureSSID: SSID %s successfuly configured.\n", data.SSID)
	currentSSID := w.wlanCli.CurrentSSID()

	if data.Enabled && data.SSID != currentSSID {
		// Disconnect in case it's currently connected to another SSID
		if currentSSID != "" {
			err = w.wlanCli.Disconnect()
			if err != nil {
				return errors.W(err)
			}
			log.Printf("watchdog.handleConfigureSSID: Disconnected from %s\n", currentSSID)
		}

		err = w.wlanCli.Enable(data.SSID)
		if err != nil {
			return errors.W(err)
		}
		log.Printf("watchdog.handleConfigureSSID: Successfully connected to %s\n", data.SSID)

	} else if !data.Enabled && data.SSID == currentSSID {
		err = w.wlanCli.Disconnect()
		if err != nil {
			return errors.W(err)
		}
		log.Printf("watchdog.handleConfigureSSID: Disconnected from %s\n", currentSSID)
	}

	return nil
}

func (w *Watchdog) handleForgetSSID(ctx context.Context, data ForgetSSIDMessage) error {
	err := w.wlanCli.Forget(data.SSID)
	if err != nil {
		return errors.W(err)
	}
	log.Printf("watchdog.handleForgetSSID: %s Removed\n", data.SSID)
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

func (w *Watchdog) handleReportConnectionStatus(ctx context.Context, data ReportConnectionStatusMessage) (err error) {
	log.Println("Reporting Wireless Connection Status")
	status, err := w.getConnectionsStatus()
	if err != nil {
		return errors.W(err)
	}
	w.cli.ReportConnectionStatus(status)
	return nil
}

func (w *Watchdog) handleReportLogs(ctx context.Context, data ReportLogsMessage) error {
	n := data.Lines
	if n == 0 {
		n = 100
	}
	l := make(Logs)
	for _, name := range data.Services {
		svcLogs, err := w.sysManager.GetServiceLogs(name, n)
		if err != nil {
			return errors.W(err)
		}
		l[name] = svcLogs
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

func (w *Watchdog) getConnectionsStatus() (ConnectionsStatus, error) {
	status := ConnectionsStatus{}
	ifaces, err := network.Interfaces()
	if err != nil {
		return status, errors.W(err)
	}
	ethIface := ifaces.FindByType(network.Ethernet)
	wlanIface := ifaces.FindByType(network.Wlan)

	wifiInfo, err := w.wlanCli.ConnectionStatus()
	if err != nil && !errors.Is(err, wifi.ErrNotConnected) {
		return status, errors.W(err)
	}
	status.Wlan.SSID = wifiInfo.SSID
	status.Wlan.Channel = wifiInfo.Channel
	status.Wlan.Frequency = wifiInfo.Frequency
	status.Wlan.LinkSpeed = wifiInfo.TxSpeed
	status.Wlan.SignalStrength = wifiInfo.Signal

	if wlanIface != nil {
		if wlanDetails := wlanIface.Details(); wlanDetails != nil {
			status.Wlan.Status = wlanDetails.Status
		}
	}
	if ethIface != nil {
		if ethDetails := ethIface.Details(); ethDetails != nil {
			status.Ethernet.Status = ethDetails.Status
		}
	}

	return status, nil
}
