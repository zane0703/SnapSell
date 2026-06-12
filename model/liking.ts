/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
*/
import { sql } from "bun";

export async function getLikeInfo(id: number) {
  //Endpoint GET /listing/:id/like
  return await sql`SELECT l.id,u.username AS liker_name, l.fk_liker_id,i.title AS listing_title , l.fk_listing_id FROM liking l
INNER JOIN users u
ON l.fk_liker_id = u.id
INNER JOIN listings i
ON l.fk_listing_id = i.id
WHERE l.fk_listing_id=${id}`;
}

export async function getLikeInfoByUser(id: number) {
  return await sql`SELECT l.id,u.username AS liker_name, l.fk_liker_id,i.title AS listing_title , l.fk_listing_id FROM liking l
INNER JOIN users u
ON l.fk_liker_id = u.id
INNER JOIN listings i
ON l.fk_listing_id = i.id
WHERE l.fk_liker_id=${id}`;
}

export async function addLike(id: number, fk_liker_id: number) {
  return await sql.begin(async (tx) => {
    let result =
      await tx`INSERT INTO liking(fk_liker_id,fk_listing_id) VALUES(${fk_liker_id},${id}) RETURNING id`;
    await tx`UPDATE listings SET "like" = "like" + 1 WHERE id = ${id};`;
    return result[0].id as number;
  });
}

export async function deleteLike(id: number, fk_liker_id: number) {
  await sql.begin(async (tx) => {
    await tx`DELETE FROM liking WHERE fk_liker_id=${fk_liker_id} AND fk_listing_id=${id};`;
    await tx`UPDATE listings SET "like"="like" - 1 WHERE id=${id};`;
  });
}
