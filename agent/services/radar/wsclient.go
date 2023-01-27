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
	"github.com/exactlylabs/radar/agent/services/sysinfo"
	"github.com/gorilla/websocket"
)

const RadarServerChannelName = "PodAgentChannel"

type wsCommandType string

const (
	Subscribe   wsCommandType = "subscribe"
	Unsubscribe wsCommandType = "unsubscribe"
	Message     wsCommandType = "message"
)

type messageCommandType string

const (
	SaveMeasurement messageCommandType = "save_measurement"
	Sync            messageCommandType = "sync"
)

type messageType string

const (
	Welcome             messageType = "welcome"
	Disconnect          messageType = "disconnect"
	Ping                messageType = "ping"
	ConfirmSubscription messageType = "confirm_subscription"
	RejectSubscription  messageType = "reject_subscription"
)

var _ agent.RadarClient = &RadarClient{}

type identifier struct {
	Channel string `json:"channel"`
}

func (i *identifier) MarshalJSON() ([]byte, error) {
	v := map[string]interface{}{
		"channel": i.Channel,
	}
	data, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	return json.Marshal(string(data))
}

func (i *identifier) UnmarshalJSON(data []byte) error {
	strJSON := ""
	if err := json.Unmarshal(data, &strJSON); err != nil {
		return err
	}
	v := make(map[string]interface{})
	if err := json.Unmarshal([]byte(strJSON), &v); err != nil {
		return err
	}
	i.Channel = v["channel"].(string)
	return nil
}

type messageCommand struct {
	Action  messageCommandType `json:"action"`
	Payload interface{}        `json:"payload"`
}

type wsReceiveMessage struct {
	Type       messageType `json:"type"`       // ping, welcome, confirm_subscription, disconnect -- for broadcasted messages it will come empty
	Identifier *identifier `json:"identifier"` // escaped JSON
	Data       []byte      `json:"data"`       // content from the subscription
}

type wsSendCommand struct {
	Identifier *identifier   `json:"identifier"` // Needs to be an escaped JSON
	Data       interface{}   `json:"data,omitempty"`
	Command    wsCommandType `json:"command"`
}

// RadarClient exposes methods to communicate with our Radar server
type RadarClient struct {
	serverURL string
	clientID  string
	secret    string
	conn      *websocket.Conn
	recvCh    chan wsReceiveMessage
	sendCh    chan wsSendCommand
	errCh     chan error // Response from sender or reader if anything fails
}

func NewRadarClient(serverURL, clientID, secret string) *RadarClient {
	return &RadarClient{
		serverURL: serverURL,
		clientID:  clientID,
		secret:    secret,
	}
}

func (rc *RadarClient) getToken() (token string, err error) {
	formData := url.Values{}
	formData.Add("unix_user", rc.clientID)
	formData.Add("secret", rc.secret)
	resp, err := http.PostForm(rc.serverURL+"/api/v1/clients/get_token", formData)
	if err != nil {
		err = fmt.Errorf("agent.getToken PostForm: %w", err)
		return
	}
	defer resp.Body.Close()
	tokenResp := make(map[string]interface{})
	if err = json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		err = fmt.Errorf("agent.getToken Decode: %w", err)
		return
	}
	return tokenResp["token"].(string), nil
}

func (rc *RadarClient) openConnection(ctx context.Context) (*websocket.Conn, error) {
	token, err := rc.getToken()
	if err != nil {
		return nil, fmt.Errorf("agent.openConnection getToken: %w", err)
	}
	u, err := url.Parse(rc.serverURL)
	if err != nil {
		return nil, fmt.Errorf("agent.openConnection Parse: %w", err)
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
		return nil, fmt.Errorf("agent.openConnection DialContext: %w", err)
	}
	return conn, nil
}

func (rc *RadarClient) startReader() {
	for {
		msg := wsReceiveMessage{}
		if err := rc.conn.ReadJSON(&msg); err != nil {
			if websocket.IsUnexpectedCloseError(err) || !errors.Is(err, net.ErrClosed) {
				rc.errCh <- err
			}
			return
		}
		rc.recvCh <- msg
	}
}

func (rc *RadarClient) startSender() {
	for command := range rc.sendCh {
		if err := rc.conn.WriteJSON(command); err != nil {
			rc.errCh <- err
		}
	}
}

func (rc *RadarClient) subscribeToAgentChannel() {
	id := &identifier{
		Channel: RadarServerChannelName,
	}
	// data, err := id.MarshalJSON()
	// if err != nil {
	// 	panic(err)
	// }
	rc.sendCh <- wsSendCommand{
		Command:    Subscribe,
		Identifier: id,
	}
}

// startWSConnection is a blocking method that connects to the server and initializes both sender and receiver loops.
// It waits until either the context was cancelled or an error has occurred while sending/receiving data,
// then it cancels the loops and waits until everything is closed before returning the error
func (rc *RadarClient) startWSConnection(ctx context.Context, callback agent.OnServerMessage) error {
	conn, err := rc.openConnection(ctx)
	if err != nil {
		return err
	}
	rc.conn = conn
	wg := &sync.WaitGroup{}

	wg.Add(2) // wait group for sender, to avoid closing a connection in the middle of sending data
	go func() {
		defer wg.Done()
		rc.startReader()
	}()

	go func() {
		defer wg.Done()
		rc.startSender()
	}()
	rc.subscribeToAgentChannel()
	// Wait until either the context was canceled or an error has occurred
READ_LOOP:
	for {
		select {
		case <-ctx.Done():
			break READ_LOOP
		case message := <-rc.recvCh:
			log.Println(message)
			// Call callback if anything is requested from the server
		case chErr := <-rc.errCh:
			log.Println("radar.RadarClient#startWSConnection received an error", chErr)
			err = chErr
			break READ_LOOP
		}
	}
	close(rc.sendCh)
	log.Println("Cancelling ws connection")
	if err == nil {
		// Notify the server about the termination
		rc.conn.WriteControl(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""), time.Time{})
	}
	rc.conn.Close()
	log.Println("Waiting for all loops to close")
	wg.Wait()
	return err
}

func (rc *RadarClient) Connect(ctx context.Context, callback agent.OnServerMessage) error {
	rc.recvCh = make(chan wsReceiveMessage)
	rc.sendCh = make(chan wsSendCommand)
	rc.errCh = make(chan error)
	timer := time.NewTimer(time.Nanosecond)
	for {
		select {
		case <-ctx.Done():
			return nil
		case <-timer.C:
			err := rc.startWSConnection(ctx, callback)
			if err != nil {
				log.Println("Retrying the connection after 15 seconds")
				timer.Reset(time.Second * 15)
			}
		}
	}
}

func (rc *RadarClient) Sync(ctx context.Context, metadata sysinfo.ClientMeta) error {
	msg := messageCommand{
		Action:  Sync,
		Payload: metadata,
	}
	rc.sendCh <- wsSendCommand{
		// Identifier: &identifier{
		// 	Channel: RadarServerChannelName,
		// },
		Command: Message,
		Data:    msg,
	}
	return nil
}

func (rc *RadarClient) SendMeasurement(ctx context.Context, measurement []byte) error {
	msg := messageCommand{
		Action:  SaveMeasurement,
		Payload: measurement,
	}
	rc.sendCh <- wsSendCommand{
		// Identifier: &identifier{
		// 	Channel: RadarServerChannelName,
		// },
		Command: Message,
		Data:    msg,
	}
	return nil
}
