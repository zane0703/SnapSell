package middleware

import (
	"net/http"
)

func Cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Host != "localhost" {
			w.WriteHeader(400)
			return
		}
		header := w.Header()
		header.Add("Access-Control-Allow-Origin", "http://localhost")
		header.Add("Access-Control-Allow-Methods", "OPTIONS, POST, GET, PUT, DELETE")
		header.Add("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method != http.MethodOptions {
			next.ServeHTTP(w, r)
		}
	})
}
