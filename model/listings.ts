/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
*/
import { sql } from "bun";

export async function getListing(listing_id: number) {
  return await sql`SELECT * FROM listings WHERE id = ${listing_id}`;
}

export async function getListingsByUser(user_id: number) {
  return await sql`SELECT * FROM listings WHERE fk_poster_id = ${user_id}`;
}

export async function getAllListings() {
  return await sql.unsafe("SELECT * FROM listings");
}

export async function searchListings(query: string) {
  return await sql`SELECT * FROM listings WHERE title LIKE '%' || ${query} || '%'`;
}

export async function addListings(
  title: string,
  description: string,
  price: number,
  fk_poster_id: number,
  picture_url: true | string,
) {
  return await sql.begin(async (tx) => {
    let result =
      await tx`INSERT INTO listings(title, description,price,fk_poster_id,picture_url) VALUES(${title},${description},${price},${fk_poster_id},${picture_url === true ? "null" : picture_url})  RETURNING id`;
    if (picture_url === true) {
      await tx`UPDATE listings SET picture_url ='/image/listImg/' || ${result[0].id} || '.jpg' WHERE id=${result[0].id}`;
    }
    return result[0].id as number;
  });
}

export async function deleteListing(id: number, fk_poster_id: number) {
  let result =
    await sql`DELETE FROM listings WHERE id=${id} AND fk_poster_id=${fk_poster_id}`;
  return result;
}
export async function updateListing(
  id: number,
  fk_poster_id: number,
  title?: string,
  description?: string,
  price?: number,
  picture_url?: string | true,
) {
  let value: any = {};
  if (picture_url === true) {
    value.picture_url = sql.unsafe("'/image/listImg/' || \"id\" || '.jpg'");
  } else if (picture_url) {
    value.picture_url = picture_url;
  }
  if (title) {
    value.title = title;
  }
  if (description) {
    value.description = description;
  }
  if (price) {
    value.price = price;
  }
  await sql`UPDATE listings SET ${sql(value)} WHERE id=${id} AND fk_poster_id=${fk_poster_id}`;
}
