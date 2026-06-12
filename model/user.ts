/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
*/
import { sign as jwt } from "jsonwebtoken";
import { sql } from "bun";

export async function getUser(userid: number) {
  return await sql`SELECT * FROM users WHERE id = ${userid}`;
}

export async function getAllUsers() {
  return await sql`SELECT * FROM users`;
}

export async function addUser(
  username: string,
  profile_pic_url: string | true | null,
  password: string,
) {
  let hash = await Bun.password.hash(password);
  return await sql.begin(async (tx) => {
    let result =
      await tx`INSERT INTO users(username,profile_pic_url,password) VALUES(${username},${profile_pic_url === true ? null : profile_pic_url},${hash}) RETURNING id;`;
    if (profile_pic_url === true) {
      await tx`UPDATE users SET profile_pic_url= '/image/profile/'|| ${result[0].id} || '.jpg' WHERE id=${result[0].id};`;
    }
    return result[0].id as number;
  });
}

export async function updateUser(
  id: number,
  username?: string,
  password?: string,
  profile_pic_url?: string | true | null,
) {
  let value: { [k: string]: any } = {};
  let token: string | null | undefined;
  if (username) {
    value.username = username;
    token = jwt({ username, userID: id }, process.env.key as string, {
      expiresIn: 86400, //expires in 24 hrs
    });
  }
  if (password) {
    value.password = await Bun.password.hash(password);
  }
  if (profile_pic_url === true) {
    value.profile_pic_url = sql.unsafe("'/image/profile/' ||\"id\" || '.jpg'");
  } else if (profile_pic_url) {
    value.profile_pic_url = profile_pic_url;
  }
  let result = await sql`UPDATE users SET ${sql(value)} WHERE id=${id}`;
  if (result.affectedRows) {
    try {
      result.token = token;
    } catch (e) {}
    return result;
  } else {
    throw new Error("Unknown user id");
  }
}

export async function loginUser(username: string, password: string) {
  let result = await sql`select * from users where username=${username}`;
  if (result.length == 1) {
    if (await Bun.password.verify(password, result[0].password)) {
      let token = jwt(
        { username: result[0].username, userID: result[0].id },
        process.env.key as string,
        {
          expiresIn: 86400, //expires in 24 hrs
        },
      );
      return { token, userID: result[0].id };
    } else {
      throw new Response(null, { status: 401 });
    }
  } else {
    throw new Response(null, { status: 404 });
  }
}
