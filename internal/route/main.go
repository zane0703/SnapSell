package route

import (
	cr "crypto/rand"
	"math/rand/v2"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zane0703/SnapSell/internal/controller"
	"github.com/zane0703/SnapSell/internal/middleware"
	"github.com/zane0703/SnapSell/internal/model"
)

func NewRoute(auth middleware.Auth, db *pgxpool.Pool) http.Handler {

	mux := http.ServeMux{}

	seed := make([]byte, 32)
	cr.Read(seed)
	cc8 := rand.NewChaCha8([32]byte(seed))

	likeController := controller.LikingController{
		Model: model.LikingModel{
			DB: db,
		},
	}
	offerRoute := NewOfferRoute(auth, db)
	listingRoute := NewListingRoute(auth, db, cc8, &likeController, offerRoute.Controller)
	userRoute := NewUserRoute(auth, db, cc8, listingRoute.Controller, &likeController, offerRoute.Controller)

	mux.Handle(offerRoute.PATH, offerRoute.Handler)
	mux.Handle(listingRoute.PATH, listingRoute.Handler)
	mux.Handle(userRoute.PATH, userRoute.Handler)

	return &mux
}
