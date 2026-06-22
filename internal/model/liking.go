package model

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

type (
	LikingModel struct {
		DB *pgxpool.Pool
	}
	Liking struct {
		ID           int    `json:"id"`
		LikerName    string `json:"liker_name"`
		LikerId      int    `json:"fk_liker_id"`
		ListingTitle string `json:"listing_title"`
		ListingId    int    `json:"fk_listing_id"`
	}
)

func (m *LikingModel) GetLikeInfoByListing(ctx context.Context, listingId int) ([]Liking, error) {

	row, err := m.DB.Query(ctx, "SELECT l.id, u.username, l.fk_liker_id, i.title, l.fk_listing_id FROM liking l INNER JOIN users u ON l.fk_liker_id = u.id INNER JOIN listings i ON l.fk_listing_id = i.id WHERE l.fk_listing_id=$1", listingId)
	if err != nil {
		return nil, err
	}
	likings := []Liking{}
	for row.Next() {
		liking := Liking{}
		err = row.Scan(&liking.ID, &liking.LikerName, &liking.LikerId, &liking.ListingTitle, &liking.ListingId)
		if err != nil {
			return nil, err
		}
		likings = append(likings, liking)
	}
	return likings, nil
}
func (m *LikingModel) GetLikeInfoByLiker(ctx context.Context, likerId int) ([]Liking, error) {

	row, err := m.DB.Query(ctx, "SELECT l.id, u.username, l.fk_liker_id, i.title, l.fk_listing_id FROM liking l INNER JOIN users u ON l.fk_liker_id = u.id INNER JOIN listings i ON l.fk_listing_id = i.id WHERE l.fk_liker_id=$1", likerId)
	if err != nil {
		return nil, err
	}
	likings := []Liking{}
	for row.Next() {
		liking := Liking{}
		err = row.Scan(&liking.ID, &liking.LikerName, &liking.LikerId, &liking.ListingTitle, &liking.ListingId)
		if err != nil {
			return nil, err
		}
		likings = append(likings, liking)
	}
	return likings, nil
}

func (m *LikingModel) AddLike(ctx context.Context, listingId int, likerId int) (int, error) {
	tx, err := m.DB.Begin(ctx)
	if err != nil {
		return 0, err
	}
	var id int
	err = tx.QueryRow(ctx, "INSERT INTO liking(fk_liker_id,fk_listing_id) VALUES($1,$2) RETURNING id;", likerId, listingId).Scan(&id)
	if err != nil {
		err2 := tx.Rollback(ctx)
		if err2 != nil {
			return 0, errors.Join(err, err2)
		}
		return 0, err
	}
	_, err = tx.Exec(ctx, "UPDATE listings SET \"like\"=\"like\" + 1 WHERE id=$1;", listingId)
	if err != nil {
		err2 := tx.Rollback(ctx)
		if err2 != nil {
			return 0, errors.Join(err, err2)
		}
		return 0, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (m *LikingModel) DeleteLike(ctx context.Context, listingId int, likerId int) (int, error) {
	tx, err := m.DB.Begin(ctx)
	if err != nil {
		return 0, err
	}
	var id int
	err = tx.QueryRow(ctx, "DELETE FROM liking WHERE fk_liker_id=$1 AND fk_listing_id=$2", likerId, listingId).Scan(&id)
	if err != nil {
		err2 := tx.Rollback(ctx)
		if err2 != nil {
			return 0, errors.Join(err, err2)
		}
		return 0, err
	}
	_, err = tx.Exec(ctx, "UPDATE listings SET \"like\"=\"like\" - 1 WHERE id=$1;", listingId)
	if err != nil {
		err2 := tx.Rollback(ctx)
		if err2 != nil {
			return 0, errors.Join(err, err2)
		}
		return 0, err
	}
	err = tx.Commit(ctx)
	if err != nil {
		return 0, err
	}
	return id, nil
}
