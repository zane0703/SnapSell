package controller

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"math/rand/v2"
	"net/http"
	"os"
	"strconv"

	"github.com/zane0703/SnapSell/internal/library/password"
	"github.com/zane0703/SnapSell/internal/library/response"
	"github.com/zane0703/SnapSell/internal/middleware"
	"github.com/zane0703/SnapSell/internal/model"
)

type (
	UserController struct {
		Model model.UserModel
		Auth  middleware.Auth
		Rand  *rand.ChaCha8
	}
	loginInfo struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
)

var maxContent = int64(math.Pow(2, 20))

func (c *UserController) Login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	body := loginInfo{}
	json.NewDecoder(r.Body).Decode(&body)
	user, err := c.Model.GetUserByUsername(ctx, body.Username)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	match, err := password.Verify(user.Password, body.Password)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	if match {
		token, err := c.Auth.GenToken(user.ID)
		if err != nil {
			log.Println(err)
			w.WriteHeader(500)
			return
		}
		response.Json(w, struct {
			Token  string `json:"token"`
			UserID int    `json:"userID"`
		}{token, user.ID})
	} else {
		w.WriteHeader(401)
	}

}
func (c *UserController) GetUserById(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	user, err := c.Model.GetUser(ctx, userId)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	response.Json(w, user)
}

func (c *UserController) GetAllUser(w http.ResponseWriter, r *http.Request) {
	users, err := c.Model.GetAllUsers(r.Context())
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(users)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
}

func (c *UserController) CreateUser(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(maxContent)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}

	username := r.FormValue("username")
	profilePicURL := r.FormValue("profile_pic_url")
	pw := r.FormValue("password")
	file, _, err := r.FormFile("pic")
	if err == nil && r.FormValue("upload") == "1" {

		randName := make([]byte, 15)
		for {
			c.Rand.Read(randName)
			filename := base64.URLEncoding.EncodeToString(randName)
			profilePicURL = fmt.Sprintf("/image/profile/%s.jpg", filename)
			_, err := os.Stat("./public" + profilePicURL)
			if err != nil {
				if os.IsNotExist(err) {
					break
				}
				log.Println(err)
				w.WriteHeader(500)
				return
			}
		}
		file2, err := os.OpenFile("./public"+profilePicURL, os.O_CREATE, 0755)
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
	}
	hashPW, err := password.Hash(pw)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	userId, err := c.Model.AddUser(r.Context(), username, profilePicURL, hashPW)
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

func (c *UserController) UpdateUser(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(maxContent)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
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

	var (
		pw            *string
		username      *string
		profilePicURL *string
	)
	if value := r.FormValue("username"); value != "" {
		username = &value
	}
	if value := r.FormValue("profile_pic_url"); value != "" {
		profilePicURL = &value
	}

	if value := r.FormValue("password"); value != "" {
		if currentPass := r.FormValue("currentPass"); currentPass == "" {
			w.WriteHeader(400)
			return
		} else {

			oldPw, err := c.Model.GetUserPw(ctx, userId)
			if err != nil {
				log.Println(err)
				w.WriteHeader(500)
				return
			}
			match, err := password.Verify(oldPw, currentPass)
			if err != nil {
				log.Println(err)
				w.WriteHeader(500)
				return
			}
			if !match {
				w.WriteHeader(403)
				return
			}
			pw2, err := password.Hash(value)
			if err != nil {
				log.Println(err)
				w.WriteHeader(500)
				return
			}
			pw = &pw2

		}

	}
	file, _, err := r.FormFile("pic")
	if err == nil && r.FormValue("upload") == "1" {
		var profilePicURL2 string
		randName := make([]byte, 15)
		for {
			c.Rand.Read(randName)
			filename := base64.URLEncoding.EncodeToString(randName)
			profilePicURL2 = fmt.Sprintf("/image/profile/%s.jpg", filename)
			_, err := os.Stat("./public" + profilePicURL2)
			if err != nil {
				if os.IsNotExist(err) {
					break
				}
				log.Println(err)
				w.WriteHeader(500)
				return
			}
		}
		file2, err := os.OpenFile("./public/"+profilePicURL2, os.O_CREATE, 0755)
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
		profilePicURL = &profilePicURL2
	}
	err = c.Model.UpdateUser(ctx, userId, username, pw, profilePicURL)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}

	w.WriteHeader(204)
}
