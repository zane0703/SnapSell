package route

import (
	"math/rand/v2"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zane0703/SnapSell/internal/controller"
	"github.com/zane0703/SnapSell/internal/middleware"
	"github.com/zane0703/SnapSell/internal/model"
)

type (
	ListingRoute struct {
		PATH       string
		Handler    http.Handler
		Controller *controller.ListingController
	}
)

func NewListingRoute(auth middleware.Auth, db *pgxpool.Pool, r *rand.ChaCha8, likingController *controller.LikingController, offerController *controller.OfferController) *ListingRoute {
	c := controller.ListingController{
		Model: model.ListingModel{
			DB: db,
		},
		Auth: auth,
		Rand: r,
	}
	mux := http.ServeMux{}
	path := "/listings"

	//mux.HandleFunc("GET /search/{query}", c.SearchListing)

	mux.HandleFunc("GET /{id}/offer", offerController.GetOffersByListings)
	mux.Handle("POST /{id}/offer", auth.Verify(http.HandlerFunc(offerController.AddOffers)))

	mux.HandleFunc("GET /{id}/like", likingController.GetLikeInfoByListing)
	mux.Handle("POST /{id}/like", auth.Verify(http.HandlerFunc(likingController.AddLike)))
	mux.Handle("DELETE /{id}/like", auth.Verify(http.HandlerFunc(likingController.DeleteLike)))

	mux.HandleFunc("GET /{id}", c.GetListing)
	mux.Handle("PUT /{id}", auth.Verify(http.HandlerFunc(c.UpdateListing)))
	mux.Handle("DELETE /{id}", auth.Verify(http.HandlerFunc(c.DeleteListing)))

	mux.HandleFunc("GET /", c.GetAllListing)
	mux.Handle("POST /", auth.Verify(http.HandlerFunc(c.CreateListings)))

	return &ListingRoute{
		PATH:       path + "/",
		Handler:    http.StripPrefix(path, &mux),
		Controller: &c,
	}
}
