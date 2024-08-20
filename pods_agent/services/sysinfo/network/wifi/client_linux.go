package wifi

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/theojulienne/go-wireless"
)

type Client struct {
	cli               *wireless.Client
	ch                chan Event
	close             chan struct{}
	wlanName          string
	subWg             *sync.WaitGroup
	pauseSubscription bool
	currentSSID       string
}

func newClient(wlanInterface string) (WirelessClient, error) {
	if err := wpaIsRunning(wlanInterface); errors.Is(err, os.ErrPermission) {
		return nil, errors.SentinelWithStack(ErrNoPrivileges)
	} else if errors.Is(err, os.ErrNotExist) {
		return nil, errors.SentinelWithStack(ErrNotSupported)
	} else if err != nil {
		return nil, errors.W(err)
	}

	cli, err := wireless.NewClient(wlanInterface)
	if err != nil {
		return nil, errors.W(err)
	}
	cli.ScanTimeout = 10 * time.Second
	var currentSSID string
	nets, _ := cli.Networks()
	if nets != nil {
		if current, found := nets.FindCurrent(); found {
			currentSSID = current.SSID
		}
	}
	c := &Client{
		cli: cli, subWg: new(sync.WaitGroup), wlanName: wlanInterface, currentSSID: currentSSID,
	}
	return c, nil
}

func (c *Client) notifyConnected() <-chan error {
	sub := c.cli.Subscribe(
		wireless.EventAuthReject,
		wireless.EventConnected,
		wireless.EventNetworkNotFound,
		wireless.EventAssocReject,
		wireless.EventTempDisabled,
	)
	ch := make(chan error)
	go func() {
		var err error
		select {
		case ev := <-sub.Next():
			switch ev.Name {
			case wireless.EventConnected:
				err = nil
			case wireless.EventNetworkNotFound:
				err = errors.SentinelWithStack(ErrSSIDNotRegistered)
			case wireless.EventAuthReject:
				err = errors.SentinelWithStack(ErrAuthFailed)
			case wireless.EventAssocReject:
				err = errors.SentinelWithStack(ErrAssociationRejected)
			case wireless.EventTempDisabled:
				err = errors.SentinelWithStack(ErrAuthFailed)
			default:
				err = errors.New("failed to catch event " + ev.Name)
			}
		case <-time.NewTimer(2 * time.Minute).C:
			err = ErrTimeout
		}

		ch <- err
	}()
	return ch
}

func (c *Client) networks() (networks, error) {
	data, err := c.cli.Conn().SendCommand(wireless.CmdListNetworks)
	if err != nil {
		return nil, errors.W(err)
	}
	networks, err := parseNetwork([]byte(data))
	if err != nil {
		return nil, errors.W(err)
	}

	for _, network := range networks {
		network.fillAttributes(func(id, key string) string {
			idInt, _ := strconv.Atoi(id)
			val, err := c.cli.GetNetworkAttr(idInt, key)
			if err != nil {
				return ""
			}
			return val
		})
	}
	return networks, nil
}

func (c *Client) addOrUpdateNetwork(net network) (network, error) {
	if net.ID == "" {
		netId, err := c.cli.Conn().SendCommandInt(wireless.CmdAddNetwork)
		if err != nil {
			return net, errors.W(err)
		}
		net.ID = fmt.Sprintf("%d", netId)
	}

	if err := c.setNetworkAttributes(net); err != nil {
		return net, errors.W(err)
	}

	return net, nil
}

func (c *Client) setNetworkAttributes(net network) error {
	for _, attr := range net.attributes() {
		cmd := []string{wireless.CmdSetNetwork, net.ID, attr}
		command := strings.Join(cmd, " ")
		err := c.cli.Conn().SendCommandBool(command)
		if err != nil {
			if strings.Contains(attr, "psk") || strings.Contains(attr, "password") || strings.Contains(attr, "key") {
				attr = regexp.MustCompile("\".*\"").ReplaceAllString(attr, "[REDACTED]")
			}
			return errors.W(err).WithMetadata(errors.Metadata{
				"command": wireless.CmdSetNetwork, "ID": net.ID, "payload": attr,
			})
		}
	}

	return nil
}

// connect replaces the existing Connect from the library, given a few errors found when using it.
// It will first disconnect from the existing connection before attempting to connect to the new one.
func (c *Client) connect(net network) (network, error) {
	if !net.isCurrent() {
		networks, err := c.networks()
		if err != nil {
			return net, errors.W(err)
		}
		current := networks.findCurrent()
		if current != nil {
			id, _ := strconv.Atoi(current.ID)
			err := c.cli.DisableNetwork(id)
			if err != nil {
				return net, errors.W(err)
			}
		}
	}

	connectedCh := c.notifyConnected()
	id, _ := strconv.Atoi(net.ID)
	if err := c.cli.EnableNetwork(id); err != nil {
		return net, errors.W(err)
	}
	if err := c.cli.Conn().SendCommandBool(wireless.CmdSelectNetwork, net.ID); err != nil {
		return net, errors.W(err)
	}
	if err := <-connectedCh; err != nil {
		return net, errors.W(err)
	}
	err := c.cli.SaveConfig()
	if err != nil {
		return net, errors.W(err)
	}
	return net, err
}

func (c *Client) InterfaceName() string {
	return c.wlanName
}

func (c *Client) StartSubscriptions() (<-chan Event, error) {
	if c.ch != nil {
		return c.ch, nil
	}

	c.ch = make(chan Event, 10)
	c.close = make(chan struct{})
	sub := c.cli.Subscribe(wireless.EventConnected, wireless.EventDisconnected, wireless.EventPasswordChanged)
	c.subWg.Add(1)
	go func() {
		defer c.subWg.Done()
		for {
			select {
			case <-c.close:
				sub.Unsubscribe()
				return
			case evt := <-sub.Next():
				ssid := ""
				networks, _ := c.networks()
				for _, net := range networks {
					if id, found := evt.Arguments["[id"]; found {
						if net.ID == id {
							ssid = net.SSID
						}
					}
				}

				if c.pauseSubscription {
					continue
				}

				switch evt.Name {
				case wireless.EventConnected:
					c.ch <- Event{Connected, ssid}
				case wireless.EventDisconnected:
					c.ch <- Event{Disconnected, ssid}
				case wireless.EventPasswordChanged:
					c.ch <- Event{PasswordChanged, ssid}
				}
			}
		}
	}()
	return c.ch, nil
}

func (c *Client) ScanAccessPoints() ([]APDetails, error) {
	wAps, err := c.cli.Scan()
	if err != nil {
		return nil, errors.W(err)
	}

	networks, err := c.networks()
	if err != nil {
		return nil, errors.W(err)
	}

	currentNetwork := networks.findCurrent()
	aps := make([]APDetails, len(wAps))
	for i, wAp := range wAps {
		bssRes, err := c.cli.Conn().SendCommand(wireless.CmdBss, wAp.BSSID)
		if err != nil {
			return nil, errors.W(err)
		}
		bss, err := parseWPASupplicantBssResponse(bssRes)
		if err != nil {
			return nil, errors.W(err)
		}

		registered := networks.findBySSID(wAp.SSID) != nil
		chann := freqStr2Chan[strconv.Itoa(bss.Freq)]
		aps[i] = APDetails{
			AP: AP{
				SSID:       wAp.SSID,
				Connected:  currentNetwork != nil && currentNetwork.SSID == wAp.SSID,
				Registered: registered,
			},
			BSS:     *bss,
			RSSI:    wAp.RSSI,
			Signal:  wAp.Signal,
			Channel: chann,
		}
	}
	return aps, nil
}

func (c *Client) ConnectionStatus() (status WifiStatus, err error) {
	data, err := c.cli.Conn().SendCommand(wireless.CmdStatus)
	if err != nil {
		return status, errors.W(err)
	}
	status = parseStatus(data)
	if status.Status == "INACTIVE" {
		return status, ErrNotConnected
	}

	pollRes, err := c.cli.Conn().SendCommand(wireless.CmdSignalPoll)
	if err != nil {
		return status, errors.W(err)
	}
	err = wifiStatusFromSignalPollResponse(pollRes, &status)
	if err != nil {
		return status, errors.W(err)
	}
	return status, nil
}

// ConfigureNetwork implements WirelessClient.
func (c *Client) ConfigureNetwork(data NetworkConnectionData) error {
	net := data.toNetwork()
	// Try to find the given network in the registered networks list
	nets, err := c.networks()
	if err != nil {
		return errors.W(err)
	}
	if existing := nets.findBySSID(net.SSID); existing != nil {
		net = existing.merge(net)
	}

	net, err = c.addOrUpdateNetwork(net)
	if err != nil {
		return errors.W(err)
	}
	if err := c.cli.SaveConfig(); err != nil {
		return errors.W(err)
	}
	return nil
}

// CurrentSSID implements WirelessClient.
func (c *Client) CurrentSSID() string {
	return c.currentSSID
}

func (c *Client) ConfiguredNetworks() ([]NetworkConnectionData, error) {
	nets, err := c.networks()
	if err != nil {
		return nil, errors.W(err)
	}
	res := make([]NetworkConnectionData, len(nets))
	for i, net := range nets {
		secType := None
		if net.KeyMgmt == "NONE" && net.WEPPassword != nil {
			secType = WEP
		} else if net.KeyMgmt == "WPA-PSK" {
			secType = WPA2
		} else if net.KeyMgmt == "WPA-EAP" {
			secType = WPA2Enterprise
		}

		res[i] = NetworkConnectionData{
			SSID:     net.SSID,
			Security: secType,
			Identity: net.Identity,
			Hidden:   net.ScanSSID == "1",
		}
	}
	return res, nil
}

// Enable implements WirelessClient.
func (c *Client) Enable(ssid string) error {
	c.pauseSubscription = true
	defer func() { c.pauseSubscription = false }()

	nets, err := c.networks()
	if err != nil {
		return errors.W(err)
	}

	if net := nets.findBySSID(ssid); net != nil {
		if _, err := c.connect(*net); err != nil {
			return errors.W(err)
		}
		// If there's a subscription, manually notify it has connected
		if c.ch != nil {
			c.ch <- Event{Connected, ssid}
		}
		return nil
	}

	return errors.SentinelWithStack(ErrSSIDNotRegistered)
}

// Forget implements WirelessClient.
func (c *Client) Forget(ssid string) error {
	nets, err := c.networks()
	if err != nil {
		return errors.W(err)
	}

	if net := nets.findBySSID(ssid); net != nil {
		id, _ := strconv.Atoi(net.ID)
		err := c.cli.RemoveNetwork(id)
		if err != nil {
			return errors.W(err)
		}
		if err := c.cli.SaveConfig(); err != nil {
			return errors.W(err)
		}
	}
	return nil
}

func (c *Client) Disconnect() error {
	c.pauseSubscription = true
	defer func() { c.pauseSubscription = false }()
	_, err := c.cli.Conn().SendCommand(wireless.CmdDisconnect)
	if err != nil {
		return errors.W(err)
	}
	if c.ch != nil {
		c.ch <- Event{Disconnected, ""}
	}
	return nil
}

func (c *Client) Close() error {
	if c.ch != nil {
		// Make sure to close the running subscription
		c.close <- struct{}{}
		c.subWg.Wait()
		close(c.ch)
	}

	c.cli.Close()
	return nil
}

func wpaIsRunning(ifaceName string) error {
	_, err := os.Stat(filepath.Join("/var/run/wpa_supplicant/", ifaceName))
	if err != nil {
		return err
	}
	return err
}
