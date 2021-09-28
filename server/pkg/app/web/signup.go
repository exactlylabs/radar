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

	if len(r.Form["email"]) != 1 || len(r.Form["password"]) != 1 {
		w.WriteHeader(400)
		w.Write([]byte("must have email and password"))
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

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	w.Write([]byte(fmt.Sprintf(`{"token": "%v"}`, token)))
}
