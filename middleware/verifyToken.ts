/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
Date: 09 February 2020
*/
import { verify, JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import { getUser } from "../model/user";
import { type BunRequest } from "bun";
import CORS_HEADER from "../cors_header";

export default async function verifyToken(
  req: BunRequest,
  userID: number,
  currentPass?: string,
) {
  let token = req.headers.get("Authorization");
  //retrieve authorization header’s content
  if (!token || !token.startsWith("Bearer")) {
    //process the token
    throw Response.json(
      { auth: "false", message: "Not authorized!" },
      { status: 403, headers: CORS_HEADER },
    );
  } else {
    token = token.split("Bearer ")[1]; //obtain the token’s value
    try {
      let decoded = verify(token, process.env.key as string) as JwtPayload;
      //verify token
      let result = await getUser(userID);
      if (
        result[0].id === decoded.userID &&
        result[0].username === decoded.username
      ) {
        if (currentPass) {
          if (await Bun.password.verify(currentPass, result[0].password)) {
            return true;
          } else {
            throw Response.json(
              {
                auth: false,
                message: "Not authorized!",
              },
              { status: 403, headers: CORS_HEADER },
            );
          }
        } else {
          return false;
        }
      } else {
        throw Response.json(
          {
            auth: false,
            message: "Not authorized!",
          },
          { status: 403, headers: CORS_HEADER },
        );
      }
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw Response.json(
          { auth: false, message: "Not authorized!" },
          { status: 403, headers: CORS_HEADER },
        );
      } else {
        throw error;
      }
    }
  }
}
