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
	LikingController struct {
		Model model.LikingModel
	}
)

func (c *LikingController) GetLikeInfoByLiker(w http.ResponseWriter, r *http.Request) {
	listingId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	likeInfo, err := c.Model.GetLikeInfoByLiker(r.Context(), listingId)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	response.Json(w, likeInfo)
}
func (c *LikingController) GetLikeInfoByListing(w http.ResponseWriter, r *http.Request) {
	listingId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	likeInfo, err := c.Model.GetLikeInfoByListing(r.Context(), listingId)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	response.Json(w, likeInfo)
}
func (c *LikingController) AddLike(w http.ResponseWriter, r *http.Request) {
	listingId, err := strconv.Atoi(r.PathValue("id"))
	ctx := r.Context()
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	body := struct {
		LikerId int `json:"fk_liker_id"`
	}{}
	err = json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	if userId, ok := ctx.Value(middleware.USER_ID_CTX).(int); !ok || userId != body.LikerId {
		w.WriteHeader(403)
		return
	}
	likingID, err := c.Model.AddLike(ctx, listingId, body.LikerId)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(201)
	response.Json(w, struct {
		LikingID int `json:"likingID"`
	}{likingID})
}

func (c *LikingController) DeleteLike(w http.ResponseWriter, r *http.Request) {
	listingId, err := strconv.Atoi(r.PathValue("id"))
	ctx := r.Context()
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	body := struct {
		LikerId int `json:"fk_liker_id"`
	}{}
	err = json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	if userId, ok := ctx.Value(middleware.USER_ID_CTX).(int); !ok || userId != body.LikerId {
		w.WriteHeader(403)
		return
	}
	err = c.Model.DeleteLike(ctx, listingId, body.LikerId)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(204)
}
