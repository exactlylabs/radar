package radar

import (
	"context"
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
	WirelessStatusReport           cable.CustomActionTypes = "wireless_status_report"
	WirelessConnectionStateChanged cable.CustomActionTypes = "wireless_connection_state_changed"
	ActionErrorReport              cable.CustomActionTypes = "action_error_report"
)

// Server MessageTypes
const (
	UpdateWatchdog            cable.MessageType = "update"                      // when requested, the agent should update itself
	WatchdogVersionChanged    cable.MessageType = "version_changed"             // same as update, but sent through the subscription channel
	EnableTailscale           cable.MessageType = "enable_tailscale"            // when requested, the agent should install and enable tailscale VPN
	DisableTailscale          cable.MessageType = "disable_tailscale"           // when requested, the agent should disable tailscale VPN
	ConnectToWirelessNetwork  cable.MessageType = "connect_to_wireless_network" // when requested, the agent will authenticate to the wireless network and select it
	SelectWirelessNetwork     cable.MessageType = "select_wireless_network"     // when requested, it expects the network to be already registered, and just selects it
	ScanWirelessNetworks      cable.MessageType = "scan_wireless_networks"      // when requested, it expects a wireless AP scan
	ReportWirelessStatus      cable.MessageType = "report_wireless_status"      // when requested, it expects a response with the current status of the wireless connection
	SetWlanInterface          cable.MessageType = "set_wlan_interface"          // when requested, it expects the watchdog to connect to a wlan interface bus
	DisconnectWirelessNetwork cable.MessageType = "disconnect_wireless_network" // when requested, it expects the wireless network to be turned off
)

var WatchdogUserAgent = "RadarPodsWatchdog/"

// RadarWatchdogClient implements watchdog.WatchdogClient, connecting to the server using websocket
type RadarWatchdogClient struct {
	serverURL      string
	clientID       string
	secret         string
	channel        *cable.ChannelClient
	returnCh       chan<- watchdog.ServerMessage
	connected      bool
	getSyncMessage watchdog.GetSyncMessageFunc
}

func NewWatchdogClient(serverURL, clientID, secret string) *RadarWatchdogClient {
	return &RadarWatchdogClient{
		serverURL: serverURL,
		clientID:  clientID,
		secret:    secret,
	}
}

func (c *RadarWatchdogClient) Connect(ctx context.Context, ch chan<- watchdog.ServerMessage, getSync watchdog.GetSyncMessageFunc) error {
	c.getSyncMessage = getSync
	h := http.Header{}
	h.Set("User-Agent", WatchdogUserAgent+sysinfo.Metadata().Version)
	// Setting a header that is in the Forbidden Header Name -- Basically, any header starting with Sec-
	// https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
	h.Set("Sec-Radar-Tool", "true")
	c.channel = cable.NewChannel(c.serverURL, fmt.Sprintf("%s:%s", c.clientID, c.secret), WatchdogChannelName, h)
	c.returnCh = ch
	c.channel.OnMessage = c.handleMessage
	c.channel.OnSubscribed = c.sendSync
	c.channel.OnConnectionError = func(error) {
		c.connected = false
	}
	c.channel.OnConnected = func() {
		c.connected = true
		log.Println("WatchdogChannel connected")
	}
	if err := c.channel.Connect(ctx); err != nil {
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
	case ConnectToWirelessNetwork:
		payload := cable.ParseMessage[*messages.ConnectToWirelessNetworkPayload](msg)
		if payload != nil {
			c.returnCh <- watchdog.ServerMessage{
				Type: watchdog.ConnectToSSIDMessageType,
				Data: watchdog.ConnectToSSIDMessage{
					SSID: payload.SSID,
					PSK:  payload.PSK,
				},
			}
		}
	case SelectWirelessNetwork:
		payload := cable.ParseMessage[*messages.SelectWirelessNetworkPayload](msg)
		if payload != nil {
			c.returnCh <- watchdog.ServerMessage{
				Type: watchdog.ConnectToExistingSSIDMessageType,
				Data: watchdog.ConnectToExistingSSIDMessage{
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
	case ReportWirelessStatus:
		payload := cable.ParseMessage[*messages.ReportWirelessStatusPayload](msg)
		if payload != nil {
			c.returnCh <- watchdog.ServerMessage{
				Type: watchdog.ReportWirelessStatusMessageType,
				Data: watchdog.ReportWirelessStatusMessage{},
			}
		}
	case SetWlanInterface:
		payload := cable.ParseMessage[*messages.SetWlanInterfacePayload](msg)
		if payload != nil {
			c.returnCh <- watchdog.ServerMessage{
				Type: watchdog.SetWlanInterfaceMessageType,
				Data: watchdog.SetWlanInterfaceMessage{
					Name: payload.Name,
				},
			}
		}
	case DisconnectWirelessNetwork:
		payload := cable.ParseMessage[*messages.DisconnectWirelessNetworkPayload](msg)
		if payload != nil {
			c.returnCh <- watchdog.ServerMessage{
				Type: watchdog.DisconnectWirelessNetworkMessageType,
				Data: watchdog.DisconnectWirelessNetworkMessage{},
			}
		}
	}
}

func (c *RadarWatchdogClient) sendSync() {
	payload := c.getSyncMessage()
	c.channel.SendAction(cable.CustomActionData{
		Action:  Sync,
		Payload: payload,
	})
}

func (c *RadarWatchdogClient) WatchdogPing(meta *sysinfo.ClientMeta) (*watchdog.ServerMessage, error) {
	apiUrl := fmt.Sprintf("%s/clients/%s/watchdog_status", c.serverURL, c.clientID)
	form := url.Values{}
	form.Add("secret", c.secret)
	form.Add("version", meta.Version)
	req, err := NewRequest("POST", apiUrl, strings.NewReader(form.Encode()))
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

func (c *RadarWatchdogClient) ReportWirelessStatus(status wifi.WifiStatus) {
	c.channel.SendAction(cable.CustomActionData{
		Action: WirelessStatusReport,
		Payload: messages.WirelessStatusReport{
			Status: status,
		},
	})
}

func (c *RadarWatchdogClient) ReportWirelessConnectionStateChanged(state, ssid string) {
	c.channel.SendAction(cable.CustomActionData{
		Action: WirelessConnectionStateChanged,
		Payload: messages.WirelessStateChangedReport{
			State: state,
			SSID:  ssid,
		},
	})
}

func (c *RadarWatchdogClient) ReportActionError(action watchdog.MessageType, err error) {
	actionStr := ""
	switch action {
	case watchdog.ConnectToSSIDMessageType:
		actionStr = string(ConnectToWirelessNetwork)
	case watchdog.ConnectToExistingSSIDMessageType:
		actionStr = string(SelectWirelessNetwork)
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
