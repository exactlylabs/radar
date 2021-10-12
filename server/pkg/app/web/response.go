package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/exactlylabs/radar/server/pkg/services/jwt"
)

type RadarWebResponse struct {
	Data          interface{}         `json:"data,omitempty"`
	FailureReason string              `json:"failureReason,omitempty"`
	FailureCode   string              `json:"failureCode,omitempty"`
	FailureArgs   map[string][]string `json:"failureArgs,omitempty"`
}

func loggedInUser(w http.ResponseWriter, r *http.Request) (string, bool) {
	// Verify User
	authHeader := r.Header.Get("Authorization")
	splitToken := strings.Split(authHeader, "Bearer")
	if len(splitToken) != 2 {
		respondUserErr(w, "must have authorization bearer token", "", nil)
		return "", false
	}

	token := strings.TrimSpace(splitToken[1])
	userId, ok := jwt.TokenUserId(token)
	if !ok {
		response := RadarWebResponse{
			FailureReason: "Unauthorized",
			FailureCode:   "",
			FailureArgs:   nil,
		}

		responseJson, mErr := json.Marshal(&response)
		if mErr != nil {
			panic(fmt.Errorf("unable to marshal auth err response: %w", mErr))
		}

		w.WriteHeader(http.StatusUnauthorized)
		w.Header().Set("Content-Type", "application/json")
		w.Write(responseJson)

		return "", false
	}

	return userId, true
}

func respondOk(w http.ResponseWriter, content interface{}) {
	response := RadarWebResponse{
		Data: content,
	}

	responseJson, mErr := json.Marshal(&response)
	if mErr != nil {
		panic(fmt.Errorf("unable to marshal ok response: %w", mErr))
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(responseJson)
}

func respondUserErr(w http.ResponseWriter, reason string, code string, args map[string][]string) {
	response := RadarWebResponse{
		FailureReason: reason,
		FailureCode:   code,
		FailureArgs:   args,
	}

	responseJson, mErr := json.Marshal(&response)
	if mErr != nil {
		panic(fmt.Errorf("unable to marshal user err response: %w", mErr))
	}

	w.WriteHeader(http.StatusBadRequest)
	w.Header().Set("Content-Type", "application/json")
	w.Write(responseJson)
}
