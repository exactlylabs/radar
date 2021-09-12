package web

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/exactlylabs/radar/server/pkg/app/model"
	"github.com/exactlylabs/radar/server/pkg/services/sshconfig"
	"github.com/exactlylabs/radar/server/pkg/services/sshkeygen"
)

type registerResponse struct {
	ClientId          string `json:"clientId"`
	PrivateKey        string `json:"privateKey"`
	EndpointHost      string `json:"endpointHost"`
	EndpointPort      int    `json:"endpointPort"`
	RemoteGatewayPort int    `json:"remoteGatewayPort"`
}

var endpointPort int

func init() {
	var err error
	rand.Seed(time.Now().UnixNano())
	rawEndpointPort := os.Getenv("ENDPOINT_PORT")
	endpointPort, err = strconv.Atoi(rawEndpointPort)
	if err != nil {
		panic(fmt.Errorf("failed to parse int from ENDPOINT_PORT value of '%v': %w", rawEndpointPort, err))
	}
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	clientId := RandStringRunes(24)
	privateKey, err := sshkeygen.GeneratePrivateKey(4096)
	if err != nil {
		panic(fmt.Errorf("failure generating private key: %w", err))
	}
	publicKey, err := sshkeygen.GeneratePublicKey(&privateKey.PublicKey)
	if err != nil {
		panic(fmt.Errorf("failure generating public key: %w", err))
	}

	privateKeyBytes := sshkeygen.EncodePrivateKeyToPEM(privateKey)

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
		w.WriteHeader(400)
		w.Write([]byte("No more RemoteGatewayPorts are available, contact the administrator"))
		return
	} else {
		remoteGatewayPort = int(highestPort.Int64 + 1)
	}

	client := &model.Client{
		ID:                clientId,
		Name:              "",
		PublicKey:         string(publicKey),
		EndpointHost:      os.Getenv("ENDPOINT_HOST"),
		EndpointPort:      endpointPort,
		RemoteGatewayPort: remoteGatewayPort,
	}

	wErr := sshconfig.WriteConfig(client.ID, client.RemoteGatewayPort, client.PublicKey)
	if wErr != nil {
		panic(fmt.Errorf("error while writing SSH config: %w", wErr))
	}

	model.DB.Create(client)

	response := registerResponse{
		ClientId:          client.ID,
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

var letterRunes = []rune("abcdefghijklmnopqrstuvwxyz")

func RandStringRunes(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}
