package controller

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/zane0703/SnapSell/internal/library/response"
	"github.com/zane0703/SnapSell/internal/middleware"
	"github.com/zane0703/SnapSell/internal/model"
)

type (
	OfferController struct {
		Model model.OfferModel
	}
)

func (c *OfferController) AcceptOffer(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	offerId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	body := struct {
		PosterId  int  `json:"fk_poster_id"`
		ListingId int  `json:"fk_listing_id"`
		Accept    bool `json:"accept"`
	}{}
	err = json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	if userId, ok := ctx.Value(middleware.USER_ID_CTX).(int); !ok || userId != body.PosterId {
		w.WriteHeader(403)
		return
	}
	err = c.Model.AcceptOffer(ctx, offerId, body.ListingId, body.PosterId, body.Accept)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(204)

}
func (c *OfferController) GetOfferByOfferor(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	if userId2, ok := ctx.Value(middleware.USER_ID_CTX).(int); !ok || userId != userId2 {
		w.WriteHeader(403)
		return
	}
	offers, err := c.Model.GetOfferByOfferor(ctx, userId)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	response.Json(w, offers)

}
func (c *OfferController) GetOfferByListingPoster(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	if userId2, ok := ctx.Value(middleware.USER_ID_CTX).(int); !ok || userId != userId2 {
		w.WriteHeader(403)
		return
	}
	offers, err := c.Model.GetOfferByListingPoster(ctx, userId)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	response.Json(w, offers)

}

func (c *OfferController) GetOffersByListings(w http.ResponseWriter, r *http.Request) {
	listingId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	offers, err := c.Model.GetOffersByListings(r.Context(), listingId)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	response.Json(w, offers)
}

func (c *OfferController) AddOffers(w http.ResponseWriter, r *http.Request) {
	listingId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	body := struct {
		Offer     string `json:"offer"`
		OfferorId int    `json:"fk_offeror_id"`
	}{}
	json.NewDecoder(r.Body).Decode(&body)
	offerID, err := c.Model.AddOffers(r.Context(), body.Offer, body.OfferorId, listingId)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(201)
	response.Json(w, struct {
		OfferID int `json:"offerID"`
	}{offerID})
}
