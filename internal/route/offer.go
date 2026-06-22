package route

import (
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zane0703/SnapSell/internal/controller"
	"github.com/zane0703/SnapSell/internal/middleware"
	"github.com/zane0703/SnapSell/internal/model"
)

type (
	OfferRoute struct {
		PATH       string
		Handler    http.Handler
		Controller *controller.OfferController
	}
)

func NewOfferRoute(auth middleware.Auth, db *pgxpool.Pool) OfferRoute {
	c := controller.OfferController{
		Model: model.OfferModel{
			DB: db,
		},
	}
	path := "/offer"
	mux := http.ServeMux{}
	mux.Handle("/{id}", auth.Verify(http.HandlerFunc(c.AcceptOffer)))
	return OfferRoute{
		PATH:       path + "/",
		Handler:    http.StripPrefix(path, &mux),
		Controller: &c,
	}

}
