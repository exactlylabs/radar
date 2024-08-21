package radar

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/services/radar/cable"
	"github.com/exactlylabs/radar/pods_agent/services/radar/messages"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/wifi"
	"github.com/exactlylabs/radar/pods_agent/watchdog"
)

var _ watchdog.WatchdogClient = &RadarWatchdogClient{}

const (
	WatchdogChannelName = "WatchdogChannel"
)

// CustomActionTypes
const (
	NDT7DiagnoseReport             cable.CustomActionTypes = "ndt7_diagnose_report"
	TailscaleConnected             cable.CustomActionTypes = "tailscale_connected"
	TailscaleDisconnected          cable.CustomActionTypes = "tailscale_disconnected"
	AccessPointsFound              cable.CustomActionTypes = "access_points_found"
	ConnectionStatusReport         cable.CustomActionTypes = "connection_status_report"
	WirelessConnectionStateChanged cable.CustomActionTypes = "wireless_connection_state_changed"
	LogsReport                     cable.CustomActionTypes = "logs_report"
	ActionErrorReport              cable.CustomActionTypes = "action_error_report"
)

// Server MessageTypes
const (
	UpdateWatchdog           cable.MessageType = "update"                     // when requested, the agent should update itself
	WatchdogVersionChanged   cable.MessageType = "version_changed"            // same as update, but sent through the subscription channel
	EnableTailscale          cable.MessageType = "enable_tailscale"           // when requested, the agent should install and enable tailscale VPN
	DisableTailscale         cable.MessageType = "disable_tailscale"          // when requested, the agent should disable tailscale VPN
	ConfigureWirelessNetwork cable.MessageType = "configure_wireless_network" // when requested, the watchdog will setup a wireless network in the driver, and connect/disconnect depending on the enabled flag
	DeleteWirelessNetwork    cable.MessageType = "delete_wireless_network"    // when requested, it expects the network to deleted from the driver.
	ScanWirelessNetworks     cable.MessageType = "scan_wireless_networks"     // when requested, it expects a wireless AP scan
	ReportConnectionStatus   cable.MessageType = "report_connection_status"   // when requested, it expects a response with the current status of the both eth and wlan connections
	ReportLogs               cable.MessageType = "report_logs"                // when requested, expects logs to get collected
)

var WatchdogUserAgent = "RadarPodsWatchdog/"

// RadarWatchdogClient implements watchdog.WatchdogClient, connecting to the server using websocket
type RadarWatchdogClient struct {
	serverURL string
	clientID  string
	secret    string
	channel   *cable.ChannelClient
	returnCh  chan<- watchdog.ServerMessage
	connected bool
}

func NewWatchdogClient(serverURL, clientID, secret string) *RadarWatchdogClient {
	return &RadarWatchdogClient{
		serverURL: serverURL,
		clientID:  clientID,
		secret:    secret,
	}
}

func (c *RadarWatchdogClient) Connect(ch chan<- watchdog.ServerMessage) error {
	h := http.Header{}
	h.Set("User-Agent", WatchdogUserAgent+sysinfo.Metadata().Version)
	// Setting a header that is in the Forbidden Header Name -- Basically, any header starting with Sec-
	// https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
	h.Set("Sec-Radar-Tool", "true")
	c.channel = cable.NewChannel(c.serverURL, fmt.Sprintf("%s:%s", c.clientID, c.secret), WatchdogChannelName, h)
	c.returnCh = ch
	c.channel.OnMessage = c.handleMessage
	c.channel.OnSubscribed = c.requestSync
	c.channel.OnConnectionError = func(error) {
		c.connected = false
	}
	c.channel.OnConnected = func() {
		c.connected = true
		log.Println("WatchdogChannel connected")
	}
	if err := c.channel.Connect(); err != nil {
		return errors.Wrap(err, "failed to connect to channel")
	}
	return nil
}

func (c *RadarWatchdogClient) Connected() bool {
	return c.connected
}

func (c *RadarWatchdogClient) Close() error {
	return c.channel.Close()
}

// handleMessage will notify the caller with the message already parsed
func (c *RadarWatchdogClient) handleMessage(msg cable.ServerMessage) {
	switch msg.Type {
	case cable.Ping:
		c.returnCh <- watchdog.ServerMessage{
			Type: watchdog.HealthCheckMessageType,
			Data: watchdog.HealthCheckServerMessage{},
		}
	case WatchdogVersionChanged, UpdateWatchdog:
		payload := cable.ParseMessage[*messages.VersionChangedSubscriptionPayload](msg)
		if payload != nil {
			c.returnCh <- watchdog.ServerMessage{
				Type: watchdog.UpdateWatchdogMessageType,
				Data: watchdog.UpdateBinaryServerMessage{
					Version:   payload.Version,
					BinaryUrl: c.serverURL + payload.BinaryUrl, // Websocket client only sends the path
				},
			}
		}

	case EnableTailscale:
		payload := cable.ParseMessage[*messages.EnableTailscaleSubscriptionPayload](msg)
		if payload != nil {
			c.returnCh <- watchdog.ServerMessage{
				Type: watchdog.EnableTailscaleMessageType,
				Data: watchdog.EnableTailscaleServerMessage{
					KeyId:   payload.KeyId,
					AuthKey: payload.AuthKey,
					Tags:    payload.Tags,
				},
			}
		}
	case DisableTailscale:
		payload := cable.ParseMessage[*messages.DisableTailscaleSubscriptionPayload](msg)
		if payload != nil {
			c.returnCh <- watchdog.ServerMessage{
				Type: watchdog.DisableTailscaleMessageType,
				Data: watchdog.DisableTailscaleServerMessage{
					KeyId: payload.KeyId,
				},
			}
		}
	case ConfigureWirelessNetwork:
		payload := cable.ParseMessage[*messages.ConfigureWirelessNetworkPayload](msg)
		if payload != nil {
			c.returnCh <- watchdog.ServerMessage{
				Type: watchdog.ConfigureSSIDMessageType,
				Data: watchdog.ConfigureSSIDMessage{
					SSID:     payload.SSID,
					Password: payload.Password,
					Security: payload.Security,
					Identity: payload.Identity,
					Hidden:   payload.Hidden,
					Enabled:  payload.Enabled,
				},
			}
		}
	case DeleteWirelessNetwork:
		payload := cable.ParseMessage[*messages.DeleteWirelessNetworkPayload](msg)
		if payload != nil {
			c.returnCh <- watchdog.ServerMessage{
				Type: watchdog.ForgetSSIDMessageType,
				Data: watchdog.ForgetSSIDMessage{
					SSID: payload.SSID,
				},
			}
		}
	case ScanWirelessNetworks:
		payload := cable.ParseMessage[*messages.ScanWirelessNetworksPayload](msg)
		if payload != nil {
			c.returnCh <- watchdog.ServerMessage{
				Type: watchdog.ScanAPsMessageType,
				Data: watchdog.ScanAPsMessage{},
			}
		}
	case ReportConnectionStatus:
		payload := cable.ParseMessage[*messages.ReportConnectionStatusPayload](msg)
		if payload != nil {
			c.returnCh <- watchdog.ServerMessage{
				Type: watchdog.ReportConnectionStatusMessageType,
				Data: watchdog.ReportConnectionStatusMessage{},
			}
		}
	case ReportLogs:
		payload := cable.ParseMessage[*messages.ReportLogsPayload](msg)
		if payload != nil {
			c.returnCh <- watchdog.ServerMessage{
				Type: watchdog.ReportLogsMessageType,
				Data: watchdog.ReportLogsMessage{
					Lines:    payload.Lines,
					Services: payload.Services,
				},
			}
		}
	}
}

func (c *RadarWatchdogClient) requestSync() {
	c.returnCh <- watchdog.ServerMessage{
		Type: watchdog.SyncMessageType,
		Data: watchdog.SyncMessage{},
	}
}

func (c *RadarWatchdogClient) WatchdogPing(meta *sysinfo.ClientMeta) (*watchdog.ServerMessage, error) {
	apiUrl := fmt.Sprintf("%s/clients/%s/watchdog_status", c.serverURL, c.clientID)
	form := url.Values{}
	form.Add("secret", c.secret)
	form.Add("version", meta.Version)
	req, err := NewRequest("POST", apiUrl, c.clientID, c.secret, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, errors.W(err)
	}
	req.Header.Add("Accept", "application/json")
	if meta.RegistrationToken != nil {
		req.Header.Add("Authorization", fmt.Sprintf("Token %s", *meta.RegistrationToken))
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "request failed").WithMetadata(errors.Metadata{"url": req.URL, "method": req.Method})
	}
	if resp.StatusCode != 200 {
		return nil, errors.New("radarClient#WatchdogPing wrong status code %d", resp.StatusCode)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "failed to read response body")
	}
	podConfig := &WatchdogStatusResponse{}
	if err := json.Unmarshal(body, podConfig); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal response body").WithMetadata(errors.Metadata{"body": string(body)})
	}
	res := &watchdog.ServerMessage{}
	if podConfig.Update != nil {
		res.Type = watchdog.UpdateWatchdogMessageType
		res.Data = &watchdog.UpdateBinaryServerMessage{
			Version:   podConfig.Update.Version,
			BinaryUrl: fmt.Sprintf("%s/%s", c.serverURL, podConfig.Update.Url),
		}
	}
	return res, nil
}

func (c *RadarWatchdogClient) NotifyTailscaleConnected(keyId string) {
	c.channel.SendAction(cable.CustomActionData{
		Action: TailscaleConnected,
		Payload: messages.TailscaleConnected{
			KeyId: keyId,
		},
	})
}

func (c *RadarWatchdogClient) NotifyTailscaleDisconnected(keyId string) {
	c.channel.SendAction(cable.CustomActionData{
		Action: TailscaleDisconnected,
		Payload: messages.TailscaleDisconnected{
			KeyId: keyId,
		},
	})
}

// ReportScanAPsResult implements watchdog.WatchdogClient.
func (c *RadarWatchdogClient) ReportScanAPsResult(aps []wifi.APDetails) {
	c.channel.SendAction(cable.CustomActionData{
		Action: AccessPointsFound,
		Payload: messages.AccessPointsFound{
			APs: aps,
		},
	})
}

func (c *RadarWatchdogClient) ReportConnectionStatus(status watchdog.ConnectionsStatus) {
	c.channel.SendAction(cable.CustomActionData{
		Action:  ConnectionStatusReport,
		Payload: status,
	})
}

func (c *RadarWatchdogClient) ReportWirelessConnectionStateChanged(status network.NetStatus, ssid string) {
	c.channel.SendAction(cable.CustomActionData{
		Action: WirelessConnectionStateChanged,
		Payload: messages.WirelessStateChangedReport{
			State: string(status),
			SSID:  ssid,
		},
	})
}

// ReportLogs implements watchdog.WatchdogClient.
func (c *RadarWatchdogClient) ReportLogs(l watchdog.Logs) {
	c.channel.SendAction(cable.CustomActionData{
		Action:  LogsReport,
		Payload: l,
	})
}

func (c *RadarWatchdogClient) ReportActionError(action watchdog.MessageType, err error) {
	actionStr := ""
	switch action {
	case watchdog.ConfigureSSIDMessageType:
		actionStr = string(ConfigureWirelessNetwork)
	case watchdog.ForgetSSIDMessageType:
		actionStr = string(DeleteWirelessNetwork)
	case watchdog.ScanAPsMessageType:
		actionStr = string(ScanWirelessNetworks)
	}
	errType := errors.W(err).Type()
	if errType == "" {
		errType = "InternalError"
	}
	c.channel.SendAction(cable.CustomActionData{
		Action: ActionErrorReport,
		Payload: messages.ErrorReport{
			Action:    actionStr,
			Error:     err.Error(),
			ErrorType: errType,
		},
	})
}

func (c *RadarWatchdogClient) SyncData(data watchdog.WatchdogSync) error {
	err := c.channel.SendAction(cable.CustomActionData{
		Action:  Sync,
		Payload: data,
	})
	if err != nil {
		return errors.W(err)
	}
	return nil
}
