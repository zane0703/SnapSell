package response

import (
	"encoding/json"
	"log"
	"net/http"
)

func Json(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Println(err)
		w.WriteHeader(500)
	}
}
