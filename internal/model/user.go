package model

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

type (
	UserModel struct {
		DB *pgxpool.Pool
	}
	User struct {
		ID            int    `json:"id"`
		Username      string `json:"username"`
		ProfilePicUrl string `json:"profile_pic_url"`
		Password      string `json:"password,omitempty"`
	}
)

func (m *UserModel) GetUser(ctx context.Context, id int) (*User, error) {
	user := User{}
	err := m.DB.QueryRow(ctx, "SELECT id, username, profile_pic_url FROM users WHERE id=$1;", id).Scan(&user.ID, &user.Username, &user.ProfilePicUrl)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
func (m *UserModel) GetUserPw(ctx context.Context, id int) (string, error) {
	var password string
	err := m.DB.QueryRow(ctx, "SELECT password FROM users WHERE id=$1;", id).Scan(&password)
	if err != nil {
		return "", err
	}
	return password, nil
}

func (m *UserModel) GetAllUsers(ctx context.Context) ([]User, error) {
	users := []User{}
	row, err := m.DB.Query(ctx, "SELECT id, username, profile_pic_url FROM users;")
	if err != nil {
		return nil, err
	}
	for row.Next() {
		user := User{}
		err = row.Scan(&user.ID, &user.Username, &user.ProfilePicUrl)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	if err = row.Err(); err != nil {
		return nil, err
	}
	return users, nil
}

func (m *UserModel) AddUser(ctx context.Context, username string, ProfilePicUrl string, password string) (int, error) {
	var userId int
	err := m.DB.QueryRow(ctx, "INSERT INTO users(username,profile_pic_url,password) VALUES($1, $2, $3) RETURNING id;", username, ProfilePicUrl, password).Scan(&userId)
	if err != nil {
		return 0, err
	}
	return userId, nil
}

func (m *UserModel) UpdateUser(ctx context.Context, id int, username *string, password *string, ProfilePicUrl *string) error {

	keys := make([]string, 0, 3)
	values := make([]any, 0, 4)
	if username != nil {
		values = append(values, *username)
		keys = append(keys, fmt.Sprintf("username=$%d", len(values)))
	}
	if password != nil {
		values = append(values, *password)
		keys = append(keys, fmt.Sprintf("password=$%d", len(values)))
	}
	if ProfilePicUrl != nil {
		values = append(values, *ProfilePicUrl)
		keys = append(keys, fmt.Sprintf("profile_pic_url=$%d", len(values)))
	}
	if len(values) == 0 {
		return errors.New("no change")
	}
	values = append(values, id)
	c, err := m.DB.Exec(ctx, fmt.Sprintf("UPDATE users SET %s WHERE id=$%d", strings.Join(keys, ", "), len(values)), values...)
	if err != nil {
		return err
	}
	switch c.RowsAffected() {
	case 0:
		return errors.New("not found")
	case 1:
		return nil
	default:
		err = errors.New("multiple row updated")
		log.Fatal(err)
		os.Exit(1)
		return err
	}
}

func (m *UserModel) GetUserByUsername(ctx context.Context, username string) (*User, error) {
	user := User{}
	err := m.DB.QueryRow(ctx, "SELECT id, username, profile_pic_url, password FROM users WHERE username=$1;", username).Scan(&user.ID, &user.Username, &user.ProfilePicUrl, &user.Password)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
