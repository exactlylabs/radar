package web

import (
	"fmt"
	"net/http"

	"github.com/exactlylabs/radar/server/pkg/app/model"
	"github.com/exactlylabs/radar/server/pkg/services/crypt"
	"github.com/exactlylabs/radar/server/pkg/services/jwt"
	"gorm.io/gorm"
)

func loginHandler(w http.ResponseWriter, r *http.Request) {
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

	user := &model.User{}
	tx := model.DB.Where("email = ?", email).First(user)
	if tx.Error == gorm.ErrRecordNotFound {
		w.WriteHeader(400)
		w.Write([]byte("invalid email or password"))
		return
	} else if tx.Error != nil {
		panic(fmt.Errorf("unable to query for user: %w", tx.Error))
	}

	if !crypt.VerifyPassword(user.PasswordHash, password) {
		w.WriteHeader(400)
		w.Write([]byte("invalid email or password"))
		return
	}

	token := jwt.IssueToken(user.ID.String())

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	w.Write([]byte(fmt.Sprintf(`{"token": "%v"}`, token)))
}
