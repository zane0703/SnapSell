/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
*/

import { sql } from "bun";

export async function getOffersByListings(id: number) {
  return await sql`SELECT * FROM offers WHERE fk_listing_id=${id}`;
}

export async function getOfferByOfferor(userid: number) {
  return await sql`SELECT o.offer,l.title,o.accepted FROM offers o INNER JOIN listings l ON l.id = fk_listing_id WHERE fk_offeror_id = ${userid}`;
}

export async function addOffers(
  offer: number,
  fk_offeror_id: number,
  id: number,
) {
  let result =
    await sql`INSERT INTO offers(offer,fk_offeror_id,fk_listing_id) VALUES(${offer},${fk_offeror_id},${id}) RETURNING id;`;
  return result[0].id as number;
}

export async function getOfferByListingPoster(userid: number) {
  return await sql`SELECT o.offer,o.id,o.accepted,l.title, u.username,l.id as lId FROM listings l,offers o , users  u
        WHERE l.fk_poster_id = ${userid} AND (l.id = o.fk_listing_id  AND o.fk_offeror_id = u.id)`;
}

export async function acceptOffer(
  id: number,
  fk_poster_id: number,
  fk_listing_id: number,
  accept: boolean,
) {
  let result =
    await sql`SELECT id FROM listings WHERE fk_poster_id=${fk_poster_id} AND id=${fk_listing_id};`;
  if (result.length) {
    let result2 =
      await sql`UPDATE offers set accepted=${accept} WHERE fk_listing_id=${fk_listing_id} AND id=${id};`;
    /* if (!result2.affectedRows) {
      throw new Error("no rows");
    } */
    return result2;
  }
}
