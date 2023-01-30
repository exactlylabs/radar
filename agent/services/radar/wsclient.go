package radar

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/url"
	"sync"
	"time"

	"github.com/exactlylabs/radar/agent/agent"
	"github.com/exactlylabs/radar/agent/services/radar/messages"
	"github.com/exactlylabs/radar/agent/services/sysinfo"
	"github.com/gorilla/websocket"
)

const (
	RadarServerChannelName = "PodAgentChannel"
)
const (
	SyncPeriod  = 60 * time.Second
	RetryPeriod = 15 * time.Second
)

const (
	SaveMeasurement messages.MessageCommandType = "store_result"
	Sync            messages.MessageCommandType = "sync"
)

var ErrNotConnected = errors.New("not connected")
var ErrContextDone = errors.New("context done")
var ErrContextTimeout = errors.New("context timeout")

func (rc *RadarClient) openConnection(ctx context.Context) (*websocket.Conn, error) {
	token, err := getToken(rc.serverURL, rc.clientID, rc.secret)
	if err != nil {
		return nil, fmt.Errorf("radarRadarClient#openConnection getToken: %w", err)
	}
	u, err := url.Parse(rc.serverURL)
	if err != nil {
		return nil, fmt.Errorf("radarRadarClient#openConnection Parse: %w", err)
	}
	wsUrl := u
	if u.Scheme == "http" {
		wsUrl.Scheme = "ws"
	} else {
		wsUrl.Scheme = "wss"
	}
	wsUrl.Path = "/api/v1/clients/ws"
	query := url.Values{}
	query.Set("token", token)
	wsUrl.RawQuery = query.Encode()
	conn, _, err := websocket.DefaultDialer.DialContext(ctx, wsUrl.String(), http.Header{})
	if err != nil {
		return nil, fmt.Errorf("radarRadarClient#openConnection DialContext: %w", err)
	}
	rc.wsConnected = true
	return conn, nil
}

// receiverLoop listens to websocket messages from the server,
// any error will be sent to errCh and then the loop gets terminated
func (rc *RadarClient) receiverLoop() {
	for {
		msg := messages.ReceiveMessage{}
		if err := rc.conn.ReadJSON(&msg); err != nil {
			if websocket.IsUnexpectedCloseError(err) || !errors.Is(err, net.ErrClosed) {
				rc.errCh <- err
			}
			return
		}
		rc.recvCh <- msg
	}
}

// senderLoop sends messages to the peer,
// any error wil be sent to errCh and then the loop gets terminated
func (rc *RadarClient) senderLoop() {
	for command := range rc.sendCh {
		if err := rc.conn.WriteJSON(command); err != nil {
			rc.errCh <- err
		}
	}
}

// waitUntilReady will block until the setup finishes or the context is finished or the connection terminates
func (rc *RadarClient) waitUntilReady(ctx context.Context) error {
	for {
		select {
		case <-ctx.Done():
			return ErrContextDone
		case <-time.After(time.Second):
			if !rc.wsConnected {
				return ErrNotConnected
			} else if rc.isReady {
				return nil
			}
		}
	}
}

// send ensures the connection is ready before sending the message to the sender worker
func (rc *RadarClient) send(ctx context.Context, msg messages.SendCommand) error {
	if err := rc.waitUntilReady(ctx); err != nil {
		return err
	}
	rc.sendCh <- msg
	return nil
}

func (rc *RadarClient) readOne(ctx context.Context) (msg *messages.ReceiveMessage, err error) {
	select {
	case <-ctx.Done():
		return nil, ErrContextDone
	case msg := <-rc.recvCh:
		return &msg, nil
	case err = <-rc.errCh:
		return
	}
}

// listenAndProcess listens to messages received from the receiverLoop or errors from any of the two loops
// it terminates once an error happens
func (rc *RadarClient) listenAndProcess(ctx context.Context, ch chan<- *agent.ServerMessage) error {
	for {
		select {
		case <-ctx.Done():
			return ErrContextDone
		case message := <-rc.recvCh:
			// Parse the message and in case it's a subscription message, check if we need to notify through our channel
			if message.Identifier != nil && message.Identifier.Channel == RadarServerChannelName {
				// Parse the message and callback if needed
				msgData := messages.RadarSubscriptionMessage{}
				message.FillFromPayload(&msgData)
				if msgData.Type == "test_requested" {
					ch <- &agent.ServerMessage{TestRequested: true}
				} else if msgData.Type == "upload_available" {
					payload := messages.UpdateSubscriptionPayload{}
					if err := json.Unmarshal(msgData.Payload, &payload); err != nil {
						log.Println(fmt.Errorf("radar.RadarClient#listenAndProcess Unmarshal: %w", err))
						continue
					}
					ch <- &agent.ServerMessage{
						WatchdogUpdate: payload.Watchdog,
						Update:         payload.Client,
					}
				}
			}
		case err := <-rc.errCh:
			return err
		}
	}
}

func (rc *RadarClient) subscribeToChannels() {
	rc.sendCh <- messages.SendCommand{
		Command: messages.Subscribe,
		Identifier: &messages.Identifier{
			Channel: RadarServerChannelName,
		},
	}
}

// awaitSubscriptionConfirmation blocks until it receives a confirm subscription message
func (rc *RadarClient) awaitSubscriptionConfirmation(ctx context.Context) error {
	for msg, err := rc.readOne(ctx); msg != nil || err != nil; msg, err = rc.readOne(ctx) {
		if errors.Is(err, ErrContextDone) {
			return ErrContextTimeout
		} else if err != nil {
			return err
		}
		if msg.Type == messages.ConfirmSubscription {
			return nil
		}
	}
	return nil
}

func (rc *RadarClient) initializeWorkers(ctx context.Context, wg *sync.WaitGroup) {
	rc.recvCh = make(chan messages.ReceiveMessage)
	rc.sendCh = make(chan messages.SendCommand)
	rc.errCh = make(chan error)

	wg.Add(3) // wait group for sender, to avoid closing a connection in the middle of sending data
	go func() {
		defer wg.Done()
		rc.receiverLoop()
	}()

	go func() {
		defer wg.Done()
		rc.senderLoop()
	}()

	go func() {
		defer wg.Done()
		t := time.NewTicker(SyncPeriod)
		for {
			select {
			case <-ctx.Done():
			case <-t.C:
				rc.Sync(ctx, *sysinfo.Metadata())
			}
		}
	}()

}

func (rc *RadarClient) setup(ctx context.Context, wg *sync.WaitGroup) error {
	conn, err := rc.openConnection(ctx)
	if err != nil {
		return err
	}
	rc.conn = conn
	rc.initializeWorkers(ctx, wg)
	rc.subscribeToChannels()
	awaitCtx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()
	if err := rc.awaitSubscriptionConfirmation(awaitCtx); err != nil {
		return err
	}
	rc.isReady = true
	// ensure the server synchronizes with the agent right after connecting
	rc.Sync(ctx, *sysinfo.Metadata())
	return nil
}

// startClientLoop is a blocking method that connects to the server and initializes both sender and receiver loops.
// It waits until either the context was cancelled or an error has occurred while sending/receiving data,
// then it cancels the loops and waits until everything is closed before returning the error
func (rc *RadarClient) startClientLoop(ctx context.Context, ch chan<- *agent.ServerMessage) error {
	wg := &sync.WaitGroup{}
	if err := rc.setup(ctx, wg); err != nil {
		return err
	}
	// blocks until either the context was cancelled or an error occurred
	err := rc.listenAndProcess(ctx, ch)
	rc.isReady = false
	rc.wsConnected = false
	if err == nil || errors.Is(err, ErrContextDone) {
		// Gracefully close the connection
		rc.conn.WriteControl(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""), time.Time{})
	} else {
		log.Println(fmt.Errorf("radar.RadarClient#startClientLoop listenAndProcess: %w", err))
	}
	log.Println("radar.RadarClient#startClientLoop: Cancelling ws connection")
	rc.conn.Close()
	close(rc.sendCh)
	log.Println("radar.RadarClient#startClientLoop: Waiting for all loops to close")
	wg.Wait()
	return err
}

// Sync this agent data with the server. It only works when the websocket connection is established.
func (rc *RadarClient) Sync(ctx context.Context, metadata sysinfo.ClientMeta) error {
	if err := rc.waitUntilReady(ctx); err != nil {
		return err
	}
	msg := messages.MessageCommand{
		Action:  Sync,
		Payload: metadata,
	}
	return rc.send(ctx, messages.SendCommand{
		Identifier: &messages.Identifier{
			Channel: RadarServerChannelName,
		},
		Command: messages.Message,
		Data:    msg,
	})
}

// SendMeasurement through websocket or through the HTTP endpoint in case of not being connected
func (rc *RadarClient) SendMeasurement(ctx context.Context, testStyle string, result []byte) error {
	msg := messages.MessageCommand{
		Action: SaveMeasurement,
		Payload: messages.MeasurementResult{
			Result: result,
			Style:  testStyle,
		},
	}
	sendMsg := messages.SendCommand{
		Identifier: &messages.Identifier{
			Channel: RadarServerChannelName,
		},
		Command: messages.Message,
		Data:    msg,
	}
	if err := rc.send(ctx, sendMsg); errors.Is(err, ErrNotConnected) {
		return rc.SendMeasurementHTTP(testStyle, result)
	} else if err != nil {
		return err
	}
	return nil
}

// Connect is a blocking function that manages the websocket connection.
// It will always retry when a connection fails, to leave it, you need to cancel the given context
func (rc *RadarClient) Connect(ctx context.Context, ch chan<- *agent.ServerMessage) error {
	timer := time.NewTimer(time.Nanosecond)
	for {
		select {
		case <-ctx.Done():
			return nil
		case <-timer.C:
			err := rc.startClientLoop(ctx, ch)
			if err != nil {
				log.Println(fmt.Errorf("radar.RadarClient#Connect startClientLoop: %w", err))
				msg, err := rc.Ping(sysinfo.Metadata())
				if err != nil {
					log.Println(fmt.Errorf("radar.RadarClient#Connect Ping: %w", err))
				} else {
					ch <- msg
				}
				log.Printf("radar.RadarClient#startClientLoop: Retrying the websocket connection after %v seconds\n", RetryPeriod)
				timer.Reset(RetryPeriod)
			}
		}
	}
}
