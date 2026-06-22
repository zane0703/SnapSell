package controller

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand/v2"
	"net/http"
	"os"
	"strconv"

	"github.com/zane0703/SnapSell/internal/library/response"
	"github.com/zane0703/SnapSell/internal/middleware"
	"github.com/zane0703/SnapSell/internal/model"
)

type (
	ListingController struct {
		Model model.ListingModel
		Auth  middleware.Auth
		Rand  *rand.ChaCha8
	}
)

func (c *ListingController) CreateListings(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	err := r.ParseMultipartForm(maxContent)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}

	title := r.FormValue("title")
	pictureURL := r.FormValue("picture_url")
	description := r.FormValue("description")
	price := r.FormValue("price")
	posterID, err := strconv.Atoi(r.FormValue("fk_poster_id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	if userId, ok := ctx.Value(middleware.USER_ID_CTX).(int); !ok || userId != posterID {
		w.WriteHeader(403)
		return
	}
	file, _, err := r.FormFile("pic")
	if err == nil && r.FormValue("upload") == "1" {

		randName := make([]byte, 64)
		for {
			c.Rand.Read(randName)
			filename := base64.RawStdEncoding.EncodeToString(randName)
			pictureURL = fmt.Sprintf("./public/image/listImg/%s.jpg", filename)
			_, err := os.Stat(pictureURL)
			if err != nil {
				if os.IsNotExist(err) {
					break
				}
				log.Println(err)
				w.WriteHeader(500)
				return
			}
		}
		file2, err := os.OpenFile(pictureURL, os.O_CREATE, 0755)
		if err != nil {
			log.Println(err)
			w.WriteHeader(500)
			return
		}
		defer file2.Close()
		_, err = io.Copy(file2, file)
		if err != nil {
			log.Println(err)
			w.WriteHeader(500)
			return
		}
	}
	userId, err := c.Model.AddListings(ctx, title, description, price, posterID, pictureURL)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(201)
	response.Json(w, struct {
		UserID int `json:"userID"`
	}{userId})
}

func (c *ListingController) UpdateListing(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(maxContent)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	ctx := r.Context()
	listingID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}

	var (
		title       *string
		description *string
		price       *string
		pictureUrl  *string
	)
	if value := r.FormValue("title"); value != "" {
		title = &value
	}
	if value := r.FormValue("description"); value != "" {
		description = &value
	}
	if value := r.FormValue("price"); value != "" {
		price = &value
	}
	if value := r.FormValue("price"); value != "" {
		pictureUrl = &value
	}
	posterID, err := strconv.Atoi(r.FormValue("picture_url"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	if userId, ok := ctx.Value(middleware.USER_ID_CTX).(int); !ok || posterID != userId {
		w.WriteHeader(403)
		return
	}

	file, _, err := r.FormFile("pic")
	if err == nil && r.FormValue("upload") == "1" {
		var profilePicURL2 string
		randName := make([]byte, 64)
		for {
			c.Rand.Read(randName)
			filename := base64.RawStdEncoding.EncodeToString(randName)
			profilePicURL2 = fmt.Sprintf("./public/image/listImg/%s.jpg", filename)
			_, err := os.Stat(profilePicURL2)
			if err != nil {
				if os.IsNotExist(err) {
					break
				}
				log.Println(err)
				w.WriteHeader(500)
				return
			}
		}
		file2, err := os.OpenFile(profilePicURL2, os.O_CREATE, 0755)
		if err != nil {
			log.Println(err)
			w.WriteHeader(500)
			return
		}
		_, err = io.Copy(file2, file)
		if err != nil {
			log.Println(err)
			w.WriteHeader(500)
			return
		}
		pictureUrl = &profilePicURL2
	}
	err = c.Model.UpdateListing(ctx, listingID, posterID, title, description, price, pictureUrl)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}

	w.WriteHeader(204)
}

func (c *ListingController) DeleteListing(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	listingId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	body := struct {
		PosterID int `json:"fk_poster_id"`
	}{}
	json.NewDecoder(r.Body).Decode(&body)
	if userId, ok := ctx.Value(middleware.USER_ID_CTX).(int); !ok || body.PosterID != userId {
		w.WriteHeader(403)
		return
	}
	err = c.Model.DeleteListing(ctx, listingId, body.PosterID)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(204)
}

func (c *ListingController) SearchListing(w http.ResponseWriter, r *http.Request) {
	query := r.PathValue("query")
	listings, err := c.Model.SearchListings(r.Context(), query)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	response.Json(w, listings)
}

func (c *ListingController) GetListing(w http.ResponseWriter, r *http.Request) {
	listingId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	listing, err := c.Model.GetListing(r.Context(), listingId)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	response.Json(w, *listing)
}

func (c *ListingController) GetAllListing(w http.ResponseWriter, r *http.Request) {
	listings, err := c.Model.GetAllListings(r.Context())
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	response.Json(w, listings)
}

func (c *ListingController) GetListingByUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	if userId2, ok := ctx.Value(middleware.USER_ID_CTX).(int); !ok || userId2 != userId {
		w.WriteHeader(403)
		return
	}
	listings, err := c.Model.GetListingsByUser(ctx, userId)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	response.Json(w, listings)
}
