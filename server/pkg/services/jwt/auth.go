package jwt

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
)

var jwtExpLength = time.Hour * 24 * 30 * 3 // approximately 3 months
var hmacSecretKey = []byte(os.Getenv("JWT_HMAC_SECRET"))

func IssueToken(userId string) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": userId,
		"exp":    time.Now().UTC().Add(jwtExpLength).Unix(),
	})
	tokenString, err := token.SignedString(hmacSecretKey)
	if err != nil {
		panic(fmt.Errorf("unexpected issue signing jwt: %w", err))
	}

	return tokenString
}

func TokenUserId(tokenString string) (string, bool) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return hmacSecretKey, nil
	})
	if err != nil {
		return "", false
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims["userId"].(string), true
	} else {
		return "", false
	}
}
