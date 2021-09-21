package web

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/exactlylabs/radar/server/pkg/app/model"
	"github.com/exactlylabs/radar/server/pkg/services/crypt"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

type registerResponse struct {
	ClientId     string `json:"clientId"`
	ClientSecret string `json:"clientSecret"`
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	clientId := "r" + strings.ToLower(randStringRunes(12))
	clientSecret := randStringRunes(12)

	clientSecretHash, err := crypt.HashPassword(clientSecret)
	if err != nil {
		panic(fmt.Errorf("failed to hash client secret: %w", err))
	}

	client := &model.Client{
		ID:         clientId,
		SecretHash: clientSecretHash,
	}

	model.DB.Create(client)

	eErr := json.NewEncoder(w).Encode(registerResponse{
		ClientId:     clientId,
		ClientSecret: clientSecret,
	})
	if eErr != nil {
		panic(fmt.Errorf("failed to encode response: %w", eErr))
	}
}

var letterRunes = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")

func randStringRunes(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}
