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
	UserRoute struct {
		PATH    string
		Handler http.Handler
	}
)

func NewUserRoute(auth middleware.Auth, db *pgxpool.Pool, r *rand.ChaCha8, listingController *controller.ListingController, likingController *controller.LikingController, offerController *controller.OfferController) *UserRoute {
	c := controller.UserController{
		Auth: auth,
		Rand: r,
		Model: model.UserModel{
			DB: db,
		},
	}
	mux := http.ServeMux{}
	path := "/users"

	mux.Handle("GET /{id}/listings", auth.Verify(http.HandlerFunc(listingController.GetListingByUser)))

	mux.Handle("GET /{id}/listings/offers", auth.Verify(http.HandlerFunc(offerController.GetOfferByListingPoster)))

	mux.Handle("GET /{id}/offers", auth.Verify(http.HandlerFunc(offerController.GetOfferByOfferor)))

	mux.Handle("GET /{id}/like", auth.Verify(http.HandlerFunc(likingController.GetLikeInfoByLiker)))

	mux.Handle("POST /login", http.HandlerFunc(c.Login))
	mux.Handle("GET /{id}", auth.Verify(http.HandlerFunc(c.GetUserById)))
	mux.Handle("PUT /{id}", auth.Verify(http.HandlerFunc(c.UpdateUser)))
	mux.Handle("GET /", auth.Verify(http.HandlerFunc(c.GetAllUser)))
	mux.Handle("POST /", http.HandlerFunc(c.CreateUser))

	return &UserRoute{
		PATH:    path + "/",
		Handler: http.StripPrefix(path, &mux),
	}
}
