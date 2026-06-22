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
	ListingModel struct {
		DB *pgxpool.Pool
	}
	Listing struct {
		ID          int    `json:"id"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Price       string `json:"price"`
		PosterId    int    `json:"fk_poster_id"`
		PictureUrl  *bool  `json:"picture_url"`
	}
)

func (m *ListingModel) GetListing(ctx context.Context, id int) (*Listing, error) {
	listing := Listing{}
	err := m.DB.QueryRow(ctx, "select id, title, description,price,fk_poster_id,picture_url where id=$1;", id).Scan(&listing.ID, &listing.Title, &listing.Description, &listing.Price, &listing.PosterId, &listing.PictureUrl)
	if err != nil {
		return nil, err
	}
	return &listing, nil
}

func (m *ListingModel) GetListingsByUser(ctx context.Context, userId int) ([]Listing, error) {

	row, err := m.DB.Query(ctx, "select id, title, description,price,fk_poster_id,picture_url where fk_poster_id=$1;", userId)
	if err != nil {
		return nil, err
	}
	listings := []Listing{}
	for row.Next() {
		listing := Listing{}
		err = row.Scan(&listing.ID, &listing.Title, &listing.Description, &listing.Price, &listing.PosterId, &listing.PictureUrl)
		if err != nil {
			return nil, err
		}
		listings = append(listings, listing)
	}
	if err = row.Err(); err != nil {
		return nil, err
	}
	return listings, nil
}
func (m *ListingModel) GetAllListings(ctx context.Context) ([]Listing, error) {
	row, err := m.DB.Query(ctx, "select id, title, description,price,fk_poster_id,picture_url;")
	if err != nil {
		return nil, err
	}
	listings := []Listing{}
	for row.Next() {
		listing := Listing{}
		err = row.Scan(&listing.ID, &listing.Title, &listing.Description, &listing.Price, &listing.PosterId, &listing.PictureUrl)
		if err != nil {
			return nil, err
		}
		listings = append(listings, listing)
	}
	if err = row.Err(); err != nil {
		return nil, err
	}
	return listings, nil
}
func (m *ListingModel) SearchListings(ctx context.Context, query string) ([]Listing, error) {
	row, err := m.DB.Query(ctx, "SELECT * FROM listings WHERE title LIKE '%' || $1 || '%'", query)
	if err != nil {
		return nil, err
	}
	listings := []Listing{}
	for row.Next() {
		listing := Listing{}
		err = row.Scan(&listing.ID, &listing.Title, &listing.Description, &listing.Price, &listing.PosterId, &listing.PictureUrl)
		if err != nil {
			return nil, err
		}
		listings = append(listings, listing)
	}
	if err = row.Err(); err != nil {
		return nil, err
	}
	return listings, nil
}
func (m *ListingModel) AddListings(ctx context.Context, title string, description string, price string, posterId int, pictureUrl string) (int, error) {
	var id int
	err := m.DB.QueryRow(ctx, "INSERT INTO listings(title, description,price,fk_poster_id,picture_url) VALUES($1, $2, $3, $4, $5) RETURNING id;", title, description, price, posterId, pictureUrl).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}
func (m *ListingModel) DeleteListing(ctx context.Context, id int, posterId int) error {
	c, err := m.DB.Exec(ctx, "DELETE FROM listings WHERE id=$1 AND fk_poster_id=$2", id, posterId)
	if err != nil {
		return err
	}
	if c.RowsAffected() != 1 {
		return errors.New("not found")
	}
	return nil
}
func (m *ListingModel) UpdateListing(ctx context.Context, id int, posterId int, title *string, description *string, price *string, pictureUrl *string) error {
	keys := make([]string, 0, 4)
	values := make([]any, 0, 6)
	if title != nil {
		values = append(values, *title)
		keys = append(keys, fmt.Sprintf("title=$%d", len(values)))
	}
	if description != nil {
		values = append(values, *description)
		keys = append(keys, fmt.Sprintf("description=$%d", len(values)))
	}
	if price != nil {
		values = append(values, *price)
		keys = append(keys, fmt.Sprintf("price=$%d", len(values)))
	}
	if pictureUrl != nil {
		values = append(values, *pictureUrl)
		keys = append(keys, fmt.Sprintf("picture_url=$%d", len(values)))
	}
	if len(values) == 0 {
		return errors.New("no change")
	}
	values = append(values, id)
	values = append(values, posterId)
	c, err := m.DB.Exec(ctx, fmt.Sprintf("UPDATE listings SET %s WHERE id=$%d AND fk_poster_id=$%d", strings.Join(keys, ", "), len(values)-1, len(values)))
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
