package web

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/exactlylabs/radar/server/pkg/app/model"
	"github.com/exactlylabs/radar/server/pkg/services/crypt"
	"github.com/exactlylabs/radar/server/pkg/services/sshconfig"
	"github.com/exactlylabs/radar/server/pkg/services/sshkeygen"
)

type sessionResponse struct {
	PrivateKey        string `json:"privateKey"`
	EndpointHost      string `json:"endpointHost"`
	EndpointPort      int    `json:"endpointPort"`
	RemoteGatewayPort int    `json:"remoteGatewayPort"`
}

var endpointPort int

func init() {
	var err error
	rawEndpointPort := os.Getenv("ENDPOINT_PORT")
	endpointPort, err = strconv.Atoi(rawEndpointPort)
	if err != nil {
		panic(fmt.Errorf("failed to parse int from ENDPOINT_PORT value of '%v': %w", rawEndpointPort, err))
	}
}

func generateClientInfo(client *model.Client) {
	var highestPort sql.NullInt64
	dErr := model.DB.Table("clients").Select("MAX(remote_gateway_port)").Row().Scan(&highestPort)
	if dErr != nil {
		panic(fmt.Errorf("failure finding highest port: %w", dErr))
	}

	portRangeStr := os.Getenv("REMOTE_PORT_RANGE")
	remotePortRange := strings.Split(portRangeStr, "-")
	remotePortMin, err := strconv.Atoi(remotePortRange[0])
	if err != nil {
		panic(fmt.Errorf("failure parsing REMOTE_PORT_RANGE min '%v': %w", remotePortRange[0], err))
	}
	remotePortMax, err := strconv.Atoi(remotePortRange[1])
	if err != nil {
		panic(fmt.Errorf("failure parsing REMOTE_PORT_RANGE max '%v': %w", remotePortRange[1], err))
	}
	var remoteGatewayPort int
	if !highestPort.Valid {
		remoteGatewayPort = remotePortMin
	} else if highestPort.Int64+1 > int64(remotePortMax) {
		panic("no more RemoteGatewayPorts are available")
	} else {
		remoteGatewayPort = int(highestPort.Int64 + 1)
	}

	wErr := sshconfig.WriteConfig(client.ID, remoteGatewayPort, client.PublicKey)
	if wErr != nil {
		panic(fmt.Errorf("error while writing SSH config: %w", wErr))
	}

	client.EndpointHost = os.Getenv("ENDPOINT_HOST")
	client.EndpointPort = endpointPort
	client.RemoteGatewayPort = remoteGatewayPort
}

func sessionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	r.ParseForm()

	if r.Form["clientId"] == nil || r.Form["clientSecret"] == nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Request must have clientId and clientSecret"))
	}

	clientId := r.Form["clientId"]
	clientSecret := r.Form["clientSecret"][0]

	client := &model.Client{}

	model.DB.Find(&client, clientId)
	if client.ID == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if !crypt.VerifyPassword(client.SecretHash, clientSecret) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if client.EndpointPort == 0 {
		// if client never created a session before, generate ports etc
		generateClientInfo(client)
	}

	privateKey, err := sshkeygen.GeneratePrivateKey(4096)
	if err != nil {
		panic(fmt.Errorf("failure generating private key: %w", err))
	}

	publicKey, err := sshkeygen.GeneratePublicKey(&privateKey.PublicKey)
	if err != nil {
		panic(fmt.Errorf("failure generating public key: %w", err))
	}
	client.PublicKey = string(publicKey)
	sshconfig.WritePublicKey(client.ID, client.PublicKey)

	privateKeyBytes := sshkeygen.EncodePrivateKeyToPEM(privateKey)

	model.DB.Save(client)

	response := sessionResponse{
		PrivateKey:        string(privateKeyBytes),
		EndpointHost:      client.EndpointHost,
		EndpointPort:      client.EndpointPort,
		RemoteGatewayPort: client.RemoteGatewayPort,
	}

	eErr := json.NewEncoder(w).Encode(response)
	if eErr != nil {
		panic(fmt.Errorf("failed to encode response: %w", eErr))
	}
}
