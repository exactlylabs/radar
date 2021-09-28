package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/exactlylabs/radar/server/pkg/app/model"
	"github.com/exactlylabs/radar/server/pkg/services/crypt"
	"github.com/exactlylabs/radar/server/pkg/services/jwt"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func AddBeconHandler(w http.ResponseWriter, r *http.Request) {
	// Extract Parameters
	fErr := r.ParseForm()
	if fErr != nil {
		panic("unable to parse http form")
	}

	if len(r.Form["clientId"]) != 1 || len(r.Form["clientSecret"]) != 1 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("must have email and password"))
		return
	}

	clientId := r.Form["clientId"][0]
	clientSecret := r.Form["clientSecret"][0]

	// Verify User
	authHeader := r.Header.Get("Authorization")
	splitToken := strings.Split(authHeader, "Bearer")
	if len(splitToken) != 2 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("must have authorization bearer token"))
		return
	}

	token := strings.TrimSpace(splitToken[1])
	userId, ok := jwt.TokenUserId(token)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("must have authorization bearer token"))
		return
	}

	// AddBeacon Logic

	// Verify client id / secret
	client := &model.Client{}
	tx := model.DB.Where("id = ?", clientId).First(client)
	if tx.Error == gorm.ErrRecordNotFound {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("invalid clientId or clientSecret"))
		return
	} else if tx.Error != nil {
		panic(fmt.Errorf("unable to query for user: %w", tx.Error))
	}

	if !crypt.VerifyPassword(client.SecretHash, clientSecret) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("invalid clientId or clientSecret"))
		return
	}

	utx := model.DB.Model(client).Update("user_id", userId)
	if utx.Error != nil {
		panic(fmt.Errorf("failed to update client user_id: %w", utx.Error))
	}

	w.WriteHeader(http.StatusAccepted)
}

type ListBeaconResponseEntry struct {
	Id      string `json:"id"`
	Name    string `json:"name"`
	Address string `json:"address"`
	Online  bool   `json:"online"`
}

func ListBeaconsHandler(w http.ResponseWriter, r *http.Request) {
	// Verify User
	authHeader := r.Header.Get("Authorization")
	splitToken := strings.Split(authHeader, "Bearer")
	if len(splitToken) != 2 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("must have authorization bearer token"))
		return
	}

	token := strings.TrimSpace(splitToken[1])
	userId, ok := jwt.TokenUserId(token)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("must have authorization bearer token"))
		return
	}

	clients := []model.Client{}
	tx := model.DB.Where("user_id = ?", userId).Take(clients)
	if tx.Error != nil {
		panic(fmt.Errorf("unable to query for clients: %w", tx.Error))
	}

	entries := make([]ListBeaconResponseEntry, len(clients))
	for i := 0; i < len(clients); i++ {
		entries[i].Id = clients[i].ID
		entries[i].Name = clients[i].Name
		entries[i].Address = clients[i].Address
		entries[i].Online = clients[i].PublicKey != ""
	}

	response, mErr := json.Marshal(&entries)
	if mErr != nil {
		panic(fmt.Errorf("unable to marshal response: %w", mErr))
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(response)
}

func VerifyBeaconHandler(w http.ResponseWriter, r *http.Request) {
	// Extract Parameters
	fErr := r.ParseForm()
	if fErr != nil {
		panic("unable to parse http form")
	}

	if len(r.Form["clientId"]) != 1 || len(r.Form["clientSecret"]) != 1 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("must have email and password"))
		return
	}

	clientId := r.Form["clientId"][0]
	clientSecret := r.Form["clientSecret"][0]

	// VerifyBeacon Logic

	// Verify client id / secret
	client := &model.Client{}
	tx := model.DB.Where("id = ?", clientId).First(client)
	if tx.Error == gorm.ErrRecordNotFound {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("invalid clientId or clientSecret"))
		return
	} else if tx.Error != nil {
		panic(fmt.Errorf("unable to query for user: %w", tx.Error))
	}

	if !crypt.VerifyPassword(client.SecretHash, clientSecret) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("invalid clientId or clientSecret"))
		return
	}

	online := client.PublicKey != ""

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf(`{"Online": %b}`, online)))
}

func UpdateBeaconHandler(w http.ResponseWriter, r *http.Request) {
	// Extract Parameters
	vars := mux.Vars(r)
	clientId := vars["clientId"]

	fErr := r.ParseForm()
	if fErr != nil {
		panic("unable to parse http form")
	}

	if len(r.Form["name"]) != 1 || len(r.Form["address"]) != 1 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("must have email and password"))
		return
	}

	name := r.Form["name"][0]
	address := r.Form["address"][0]

	// Verify User
	authHeader := r.Header.Get("Authorization")
	splitToken := strings.Split(authHeader, "Bearer")
	if len(splitToken) != 2 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("must have authorization bearer token"))
		return
	}

	token := strings.TrimSpace(splitToken[1])
	userId, ok := jwt.TokenUserId(token)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("must have authorization bearer token"))
		return
	}

	// UpdateBeacon Logic

	client := &model.Client{}
	tx := model.DB.Where("id = ?", clientId).First(client)
	if tx.Error == gorm.ErrRecordNotFound {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("invalid clientId"))
		return
	} else if tx.Error != nil {
		panic(fmt.Errorf("unable to query for client: %w", tx.Error))
	}

	if client.UserID != uuid.MustParse(userId) {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("client not found in user account"))
		return
	}

	utx := model.DB.Model(client).Updates(map[string]interface{}{"name": name, "address": address})
	if utx.Error != nil {
		panic(fmt.Errorf("unable to update client: %w", utx.Error))
	}

	w.WriteHeader(http.StatusAccepted)
	return
}
