package web

import (
	"fmt"
	"net/http"

	"github.com/exactlylabs/radar/server/pkg/app/model"
	"github.com/exactlylabs/radar/server/pkg/services/crypt"
	"github.com/exactlylabs/radar/server/pkg/services/jwt"
)

func signupHandler(w http.ResponseWriter, r *http.Request) {
	fErr := r.ParseForm()
	if fErr != nil {
		panic("unable to parse http form")
	}

	if len(r.Form["email"]) != 1 {
		respondUserErr(w, "email must be set", "", map[string][]string{
			"email": {"must be set"},
		})
		return
	}

	if len(r.Form["password"]) != 1 {
		respondUserErr(w, "password must be set", "", map[string][]string{
			"password": {"must be set"},
		})
		return
	}

	// TODO: Validate Email
	// TODO: Validate Password complexity
	email := r.Form["email"][0]
	password := r.Form["password"][0]

	passwordHash, hErr := crypt.HashPassword(password)
	if hErr != nil {
		panic("unable to hash password")
	}

	user := &model.User{
		Email:        email,
		PasswordHash: passwordHash,
	}

	tx := model.DB.Create(user)
	if tx.Error != nil {
		panic(fmt.Errorf("failed to create user: %w", tx.Error))
	}

	token := jwt.IssueToken(user.ID.String())

	w.WriteHeader(http.StatusAccepted)
	respondOk(w, map[string]string{
		"token": token,
	})
}
