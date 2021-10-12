package web

import (
	"fmt"
	"net/http"

	"github.com/exactlylabs/radar/server/pkg/app/model"
	"github.com/exactlylabs/radar/server/pkg/services/crypt"
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

	if len(r.Form["beaconSecret"]) != 1 {
		respondUserErr(w, "must have beaconSecret", "", map[string][]string{
			"beaconSecret": {"must be set"},
		})
		return
	}

	params := mux.Vars(r)

	beaconId := params["beaconId"]
	beaconSecret := r.Form["beaconSecret"][0]
	name := r.Form["name"][0]
	address := r.Form["address"][0]

	fmt.Println("ASFSDFSDF", beaconId)

	// Verify User
	userId, ok := loggedInUser(w, r)
	if !ok {
		return
	}

	// AddBeacon Logic

	// Verify client id / secret
	client := &model.Client{}
	tx := model.DB.Where("id = ?", beaconId).First(client)
	if tx.Error == gorm.ErrRecordNotFound {
		respondUserErr(w, "beacon not found", "", map[string][]string{
			"beaconId": {"not found"},
		})
		return
	} else if tx.Error != nil {
		panic(fmt.Errorf("unable to query for user: %w", tx.Error))
	}

	if !crypt.VerifyPassword(client.SecretHash, beaconSecret) {
		respondUserErr(w, "invalid beaconSecret", "", map[string][]string{
			"beaconSecret": {"is invalid"},
		})
		return
	}

	utx := model.DB.Model(client).Updates(map[string]interface{}{"user_id": userId, "address": address, "name": name})
	if utx.Error != nil {
		panic(fmt.Errorf("failed to update client user_id: %w", utx.Error))
	}

	w.WriteHeader(http.StatusAccepted)
	respondOk(w, map[string]interface{}{})
}

type ListBeaconResponseEntry struct {
	Id      string `json:"id"`
	Name    string `json:"name"`
	Address string `json:"address"`
	Online  bool   `json:"online"`
}

func ListBeaconsHandler(w http.ResponseWriter, r *http.Request) {
	// Verify User
	userId, ok := loggedInUser(w, r)
	if !ok {
		return
	}

	clients := []model.Client{}
	tx := model.DB.Where("user_id = ?", userId).Take(&clients)
	if tx.Error != nil && tx.Error != gorm.ErrRecordNotFound {
		panic(fmt.Errorf("unable to query for clients: %w", tx.Error))
	}

	entries := make([]ListBeaconResponseEntry, len(clients))
	for i := 0; i < len(clients); i++ {
		entries[i].Id = clients[i].ID
		entries[i].Name = clients[i].Name
		entries[i].Address = clients[i].Address
		entries[i].Online = clients[i].RemoteGatewayPort != 0
	}

	w.WriteHeader(http.StatusOK)
	respondOk(w, entries)
}

func VerifyBeaconHandler(w http.ResponseWriter, r *http.Request) {
	// Extract Parameters
	fErr := r.ParseForm()
	if fErr != nil {
		panic("unable to parse http form")
	}

	if len(r.Form["clientId"]) != 1 {
		respondUserErr(w, "must have clientId", "", map[string][]string{
			"clientId": {"must be set"},
		})
		return
	}

	if len(r.Form["clientSecret"]) != 1 {
		respondUserErr(w, "must have clientSecret", "", map[string][]string{
			"clientSecret": {"must be set"},
		})
		return
	}

	clientId := r.Form["clientId"][0]
	clientSecret := r.Form["clientSecret"][0]

	// VerifyBeacon Logic

	// Verify client id / secret
	client := &model.Client{}
	tx := model.DB.Where("id = ?", clientId).First(client)
	if tx.Error == gorm.ErrRecordNotFound {
		respondUserErr(w, "client not found", "", nil)
		return
	} else if tx.Error != nil {
		panic(fmt.Errorf("unable to query for user: %w", tx.Error))
	}

	if !crypt.VerifyPassword(client.SecretHash, clientSecret) {
		respondUserErr(w, "invalid client secret", "", map[string][]string{
			"clientSecret": {"is invalid"},
		})
		return
	}

	online := client.PublicKey != ""

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	respondOk(w, map[string]bool{"online": online})
}

func UpdateBeaconHandler(w http.ResponseWriter, r *http.Request) {
	// Extract Parameters
	vars := mux.Vars(r)
	beaconId := vars["beaconId"]

	fErr := r.ParseForm()
	if fErr != nil {
		panic("unable to parse http form")
	}

	if len(r.Form["name"]) != 1 {
		respondUserErr(w, "name cannot be empty", "", map[string][]string{
			"name": {"is empty"},
		})
		return
	}

	if len(r.Form["address"]) != 1 {
		respondUserErr(w, "address cannot be empty", "", map[string][]string{
			"address": {"is empty"},
		})
		return
	}

	name := r.Form["name"][0]
	address := r.Form["address"][0]

	// Verify User
	userId, ok := loggedInUser(w, r)
	if !ok {
		return
	}

	// UpdateBeacon Logic

	client := &model.Client{}
	tx := model.DB.Where("id = ?", beaconId).First(client)
	if tx.Error == gorm.ErrRecordNotFound {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("invalid beaconId"))
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
}
