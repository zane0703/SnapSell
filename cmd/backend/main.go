package main

import (
	"context"
	"log"
	"net/http"

	_ "github.com/joho/godotenv/autoload"
	"github.com/zane0703/SnapSell/internal/middleware"
	"github.com/zane0703/SnapSell/internal/route"
	"github.com/zane0703/SnapSell/internal/services"
)

func main() {
	ctx := context.Background()
	db, err := services.NewDB(ctx)
	if err != nil {
		log.Panicln(err)
	}
	auth, err := middleware.NewAuth()
	if err != nil {
		log.Panicln(err)
	}

	mux := route.NewRoute(*auth, db)

	server := http.Server{
		Addr:    "localhost:8081",
		Handler: middleware.Cors(mux),
	}

	err = server.ListenAndServe()
	if err != nil {
		log.Panicln(err)
	}

}
