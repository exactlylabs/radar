package wifi

import (
	"strconv"
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
	currentSSID       *string
}

func newClient(wlanInterface string) (WirelessClient, error) {
	cli, err := wireless.NewClient(wlanInterface)
	if err != nil {
		return nil, errors.W(err)
	}
	cli.ScanTimeout = 10 * time.Second
	var currentSSID *string
	nets, _ := cli.Networks()
	if nets != nil {
		if current, found := nets.FindCurrent(); found {
			currentSSID = &current.SSID
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
				err = c.cli.SaveConfig()
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

func (c *Client) networks() (wireless.Networks, error) {
	networks, err := c.cli.Networks()
	if err != nil {
		return nil, errors.W(err)
	}
	for i := range networks {
		if networks[i].IDStr == "FAIL" || networks[i].IDStr == "" {
			networks[i].IDStr = networks[i].SSID
		}
	}
	return networks, nil
}

func (c *Client) addOrUpdateNetwork(net wireless.Network) (wireless.Network, error) {
	if net.IDStr == "" {
		net.IDStr = net.SSID
	}

	nets, err := c.networks() // use our own .networks().
	if err != nil {
		return net, err
	}

	for _, n := range nets {
		if n.IDStr == net.IDStr {
			return c.cli.UpdateNetwork(net)
		}
	}

	net, err = c.cli.AddNetwork(net)
	if err != nil {
		return net, errors.W(err)
	}
	return net, nil
}

// connect replaces the existing Connect from the library, given a few errors found when using it
func (c *Client) connect(net wireless.Network) (wireless.Network, error) {
	net, err := c.addOrUpdateNetwork(net)
	if err != nil {
		return net, errors.W(err)
	}

	if !net.IsCurrent() {
		networks, err := c.networks()
		if err != nil {
			return net, errors.W(err)
		}
		current, found := networks.FindCurrent()
		if found {
			err := c.cli.DisableNetwork(current.ID)
			if err != nil {
				return net, errors.W(err)
			}
		}
	}
	connectedCh := c.notifyConnected()
	if err := c.cli.EnableNetwork(net.ID); err != nil {
		return net, errors.W(err)
	}
	if err := c.cli.Conn().SendCommandBool(wireless.CmdSelectNetwork, strconv.Itoa(net.ID)); err != nil {
		return net, errors.W(err)
	}
	if err := <-connectedCh; err != nil {
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
						if strconv.Itoa(net.ID) == id {
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
	var currentNetwork *wireless.Network
	if network, found := networks.FindCurrent(); found {
		currentNetwork = &network
	}

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
		_, registered := networks.FindBySSID(wAp.SSID)
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
	status.Status = "INACTIVE"
	wState, err := c.cli.Status()
	if err != nil {
		return status, errors.W(err)
	}
	if wState.WpaState == "INACTIVE" {
		return status, ErrNotConnected
	}

	pollRes, err := c.cli.Conn().SendCommand(wireless.CmdSignalPoll)
	if err != nil {
		return status, errors.W(err)
	}
	status, err = WifiStatusFromSignalPollResponse(pollRes)
	if err != nil {
		return status, errors.W(err)
	}
	status.BSSID = wState.BSSID
	status.Status = wState.WpaState
	status.SSID = wState.SSID
	status.KeyManagement = wState.KeyManagement
	return status, nil
}

func (c *Client) Select(ssid string) error {
	networks, err := c.networks()
	if err != nil {
		return errors.W(err)
	}
	// Iterates through all registered networks and see if it is registered
	for _, network := range networks {
		if network.SSID == ssid {
			if network.IsCurrent() {
				if c.ch != nil {
					c.ch <- Event{Connected, ssid}
				}
				return nil
			}
			// notifyConnected is called before sending commands, as it starts subscriptions. Once we send the commands,
			// then wait until the channel returns
			connectedCh := c.notifyConnected()
			c.pauseSubscription = true
			defer func() { c.pauseSubscription = false }()
			_, err = c.cli.Conn().SendCommand(wireless.CmdSelectNetwork, strconv.Itoa(network.ID))
			if err != nil {
				return errors.W(err)
			}
			if err = <-connectedCh; err != nil {
				return errors.W(err)
			}
			// If there's a subscription, manually notify it has connected
			if c.ch != nil {
				c.ch <- Event{Connected, ssid}
			}

			return nil
		}
	}
	return errors.SentinelWithStack(ErrSSIDNotRegistered)
}

func (c *Client) Connect(ssid, psk string) error {
	toConnectNetwork := wireless.NewNetwork(ssid, psk)
	c.pauseSubscription = true
	defer func() { c.pauseSubscription = false }()
	_, err := c.connect(toConnectNetwork)
	if err != nil {
		return errors.W(err)
	}
	// If there's a subscription, manually notify it has connected
	if c.ch != nil {
		c.ch <- Event{Connected, ssid}
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
