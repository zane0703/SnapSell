package middleware

import (
	"context"
	"net/http"
	"os"

	"encoding/base64"

	"time"

	"github.com/golang-jwt/jwt/v5"
)

type (
	JWTClaim struct {
		jwt.RegisteredClaims
		UID int
	}
	Auth struct {
		secret []byte
	}
)

var USER_ID_CTX = "userID"

func NewAuth() (*Auth, error) {
	secret, err := base64.StdEncoding.DecodeString(os.Getenv("SECRET"))
	if err != nil {
		return nil, err
	}
	return &Auth{secret: secret}, nil
}

func (a *Auth) getJWTSecret(t *jwt.Token) (any, error) {
	return a.secret, nil
}

func (a *Auth) Verify(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authorization := r.Header.Get("Authorization")
		if authorization[:7] == "Bearer " {
			claims := &JWTClaim{}
			token, err := jwt.ParseWithClaims(authorization[7:], claims, a.getJWTSecret, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
			if err != nil {
				w.WriteHeader(500)
			} else if token.Valid {
				ctx := r.Context()
				ctx = context.WithValue(ctx, USER_ID_CTX, claims.UID)
				next.ServeHTTP(w, r.WithContext(ctx))
			} else {
				w.WriteHeader(401)
			}

		}

	})
}

func (a *Auth) GenToken(userId int) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		JWTClaim{
			jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)), IssuedAt: jwt.NewNumericDate(time.Now())},
			userId,
		})
	return token.SignedString(a.secret)
}
