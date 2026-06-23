package model

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

type (
	OfferModel struct {
		DB *pgxpool.Pool
	}
	Offer struct {
		ID          int    `json:"id"`
		OfferAmount string `json:"offer"`
		OfferorId   int    `json:"fk_offeror_id"`
		ListingId   int    `json:"fk_listing_id,omitempty"`
		Accepted    *bool  `json:"accepted"`
	}
	OfferWithLid struct {
		Offer
		ListingTitle string `json:"title"`
		OfferorName  string `json:"username"`
	}
)

func (m *OfferModel) GetOffersByListings(ctx context.Context, id int) ([]Offer, error) {
	offers := []Offer{}
	row, err := m.DB.Query(ctx, "SELECT id, offer,fk_offeror_id,fk_listing_id, accepted FROM offers WHERE fk_listing_id=$1", id)
	if err != nil {
		return nil, err
	}
	for row.Next() {
		offer := Offer{}
		row.Scan(&offer.ID, &offer.OfferAmount, &offer.OfferorId, &offer.ListingId, &offer.Accepted)
		offers = append(offers, offer)
	}
	if err = row.Err(); err != nil {
		return nil, err
	}
	return offers, nil
}

func (m *OfferModel) GetOfferByOfferor(ctx context.Context, id int) ([]Offer, error) {
	offers := []Offer{}
	row, err := m.DB.Query(ctx, "SELECT id, offer,fk_offeror_id,fk_listing_id, accepted FROM offers WHERE fk_offeror_id=$1", id)
	if err != nil {
		return nil, err
	}
	for row.Next() {
		offer := Offer{}
		row.Scan(&offer.ID, &offer.OfferAmount, &offer.OfferorId, &offer.ListingId, &offer.Accepted)
		offers = append(offers, offer)
	}
	if err = row.Err(); err != nil {
		return nil, err
	}
	return offers, nil
}

func (m *OfferModel) AddOffers(ctx context.Context, Offer string, offerorId int, listingId int) (int, error) {
	var id int
	err := m.DB.QueryRow(ctx, "INSERT INTO offers(offer,fk_offeror_id,fk_listing_id) VALUES($1, $2, $3) RETURNING id;", Offer, offerorId, listingId).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (m *OfferModel) AcceptOffer(ctx context.Context, id int, posterId int, listingId int, accept bool) error {
	conn, err := m.DB.Acquire(ctx)
	if err != nil {
		return err
	}
	fmt.Println(listingId)
	var posterId2 int
	err = conn.QueryRow(ctx, "SELECT fk_poster_id FROM listings WHERE id=$1", listingId).Scan(&posterId2)
	if err != nil {
		fmt.Println(1)
		return err
	}
	if posterId != posterId2 {
		return errors.New("not poster")
	}
	c, err := conn.Exec(ctx, "UPDATE offers SET accepted=$1 WHERE fk_listing_id=$2 AND id=$3", accept, listingId, id)
	if err != nil {
		fmt.Println(2)
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

func (m *OfferModel) GetOfferByListingPoster(ctx context.Context, userId int) ([]OfferWithLid, error) {
	offers := []OfferWithLid{}
	row, err := m.DB.Query(ctx, "SELECT o.offer,o.id,o.accepted,l.title, u.username,l.id as lId FROM listings l,offers o , users  u WHERE l.fk_poster_id = $1 AND (l.id = o.fk_listing_id  AND o.fk_offeror_id = u.id)", userId)
	if err != nil {
		return nil, err
	}
	for row.Next() {
		offer := OfferWithLid{}
		err = row.Scan(&offer.OfferAmount, &offer.ID, &offer.Accepted, &offer.ListingTitle, &offer.OfferorName, &offer.ListingId)
		if err != nil {
			return nil, err
		}
		offers = append(offers, offer)
	}
	if err = row.Err(); err != nil {
		return nil, err
	}
	return offers, nil
}
