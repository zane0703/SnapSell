/*
Student ID:1949955
Name: Ang Yun, Zane
Class: DIT/FT/1B/01
*/
//const { get } = require("https");
import { type BunRequest } from "bun";
import * as user from "../model/user";
import * as listings from "../model/listings";
import * as offers from "../model/offers";
import * as liking from "../model/liking";
import verifyToken from "../middleware/verifyToken.js";
import CORS_HEADER from "../cors_header";
//import multer = require("multer");
//import cors = require("cors");
/* Users */

export async function login(req: BunRequest) {
  let { username, password } = await req.json();
  let result = await user.loginUser(username, password);
  return Response.json(result, { headers: CORS_HEADER });
}
export async function getUserById(req: BunRequest<"/users/:userid">) {
  let userid = +req.params.userid;
  await verifyToken(req, userid);
  let result = await user.getUser(userid);
  if (result) {
    if (result.length == 1) {
      result = result[0];
      delete result.password;
      return Response.json(result, { headers: CORS_HEADER });
    } else {
      return new Response(null, { status: 404, headers: CORS_HEADER });
    }
  } else {
    return new Response(null, { status: 500, headers: CORS_HEADER });
  }
}

export async function getAllUser(req: BunRequest) {
  let users = await user.getAllUsers();
  users.forEach((x: any) => {
    delete x.password;
  });
  return Response.json(users, { headers: CORS_HEADER });
}

export async function createUser(req: BunRequest) {
  //let captcha = req.body["g-recaptcha-response"];
  let formData = await req.formData();
  /* if (captcha) {
      if (err) {
        switch (err.message) {
          case "File too large":
            res.status(413);
            break;
          case "Unsupported image format, jpg only":
            res.status(415);
            break;
          default:
            res.status(500);
        }
        res.send(err);
      } else {
        get(
          new URL(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.recaptcha}&response=${captcha}`,
          ),
          (res2) =>
            let data = [];
            res2.on("data", (chunk) => data.push(chunk));
            res2.on("end", () => {
              data = JSON.parse(Buffer.concat(data).toString());
              if (data.success) {{*/
  let username = formData.get("username") as string;
  let profile_pic_url = formData.get("profile_pic_url") as string | null;
  let password = formData.get("password") as string;
  let file = formData.get("pic") as File;
  try {
    let result: number;
    if (file && formData.get("upload") == "1") {
      if (file.type.toLowerCase() !== "image/jpeg") {
        return new Response(null, {
          status: 415,
          headers: { "Accept-Post": "image/jpeg", ...CORS_HEADER },
        });
      }
      result = await user.addUser(username, true, password);
      await Bun.write(".\\public\\image\\profile\\" + result + ".jpg", file);
    } else {
      result = await user.addUser(username, profile_pic_url, password);
    }
    return Response.json({ userID: result }, { headers: CORS_HEADER });
  } catch (error: any) {
    if (error.errno === 1062) {
      return new Response(null, { status: 409, headers: CORS_HEADER });
    } else {
      throw error;
    }
  }

  /* });
            res.on("error", (err) => res.sendStatus(500));
          },
      );
      }
    } else {
      res.sendStatus(422);
    }
  }); */
}
export async function updateUser(req: BunRequest<"/users/:userid">) {
  let userid = parseInt(req.params.userid);
  let formData = await req.formData();
  let username = formData.get("username") as string;
  let profile_pic_url = formData.get("profile_pic_url") as string | null;
  let password = formData.get("password") as string;
  let file = formData.get("pic") as File;
  let passVerify = await verifyToken(
    req,
    userid,
    formData.get("currentPass") as string,
  );
  if (!password || passVerify) {
    try {
      let result;
      if (file && formData.get("upload") == "1") {
        if (file.type.toLowerCase() !== "image/jpeg") {
          return new Response(null, {
            status: 415,
            headers: { "Accept-Post": "image/jpeg", ...CORS_HEADER },
          });
        }
        result = await user.updateUser(userid, username, password, true);
        await Bun.write(".\\public\\image\\profile\\" + userid + ".jpg", file);
      } else {
        result = await await user.updateUser(
          userid,
          username,
          password,
          profile_pic_url,
        );
      }
      if (result.token) {
        return Response.json({ token: result.token }, { headers: CORS_HEADER });
      } else {
        return new Response(null, { status: 204 });
      }
    } catch (error: any) {
      if (error.errno === 1062) {
        return new Response(null, { status: 409 });
      } else {
        throw error;
      }
    }
  } else {
    return Response.json(
      { auth: false, message: "Not authorized!" },
      { status: 403, headers: CORS_HEADER },
    );
  }
}
/* Listing */
export async function getListingsByUser(
  req: BunRequest<"/users/:userid/listings/">,
) {
  let userid = parseInt(req.params.userid);
  await verifyToken(req, userid);
  let result = await listings.getListingsByUser(userid);
  return Response.json(result, { headers: CORS_HEADER });
}
export async function getAllListings(req: BunRequest) {
  let result = await listings.getAllListings();
  result.forEach((x: any) => {
    if (x.picture_url === "/image/listImg/:id.jpg") {
      x.picture_url = x.picture_url.replace("/:id", "/" + x.id);
    }
  });
  return Response.json(result, { headers: CORS_HEADER });
}
export async function getListing(req: BunRequest<"/listings/:id/">) {
  let listing_id = +req.params.id;
  let result = await listings.getListing(listing_id);
  if (result.length === 1) {
    return Response.json(result[0], { headers: CORS_HEADER });
  } else {
    return new Response(null, { status: 404, headers: CORS_HEADER });
  }
}

export async function addListings(req: BunRequest) {
  let formData = await req.formData();
  let title = formData.get("title") as string;
  let description = formData.get("description") as string;
  let price = formData.get("price") as string;
  let fk_poster_id = parseInt(formData.get("fk_poster_id") as string);
  let file = formData.get("pic") as File;
  await verifyToken(req, fk_poster_id);
  let result: number;
  if (file && formData.get("upload") == "1") {
    if (file.type.toLowerCase() !== "image/jpeg") {
      return new Response(null, {
        status: 415,
        headers: { "Accept-Post": "image/jpeg", ...CORS_HEADER },
      });
    }
    result = await listings.addListings(
      title,
      description,
      +price,
      fk_poster_id,
      true,
    );
    await Bun.write(".\\public\\image\\listImg\\" + result + ".jpg", file);
  } else {
    result = await listings.addListings(
      title,
      description,
      +price,
      +fk_poster_id,
      formData.get("picture_url") as string,
    );
  }
  return Response.json({ listingID: result }, { headers: CORS_HEADER });
}
export async function deleteListing(req: BunRequest<"/listings/:id/">) {
  let id = +req.params.id;
  let { fk_poster_id } = await req.json();
  await listings.deleteListing(id, fk_poster_id);
  let file = Bun.file(".\\public\\image\\listImg\\" + id + ".jpg");
  if (await file.exists()) {
    await file.delete();
  }
  return new Response(null, { status: 204, headers: CORS_HEADER });
}
export async function updateListing(req: BunRequest<"/listings/:id/">) {
  let id = +req.params.id;
  let formData = await req.formData();
  let title = formData.get("title") as string;
  let description = formData.get("description") as string;
  let price = parseInt(formData.get("price") as string);
  let fk_poster_id = parseInt(formData.get("fk_poster_id") as string);

  await verifyToken(req, fk_poster_id);
  let file = formData.get("pic") as File;
  if (file && formData.get("upload") == "1") {
    if (file.type.toLowerCase() !== "image/jpeg") {
      return new Response(null, {
        status: 415,
        headers: { "Accept-Post": "image/jpeg", ...CORS_HEADER },
      });
    }
    await listings.updateListing(
      id,
      fk_poster_id,
      title,
      description,
      price,
      true,
    );
    await Bun.write(".\\public\\image\\listImg\\" + id + ".jpg", file);
  } else {
    await listings.updateListing(
      id,
      fk_poster_id,
      title,
      description,
      price,
      formData.get("picture_url") as string,
    );
  }
  return new Response(null, { status: 204, headers: CORS_HEADER });
}
export async function searchListings(
  req: BunRequest<"/listings/search/:query">,
) {
  let { query } = req.params;
  let result = await listings.searchListings(query);
  result.forEach((x: any) => {
    if (x.picture_url === "/image/listImg/:id.jpg") {
      x.picture_url = x.picture_url.replace("/:id", "/" + x.id);
    }
  });
  return Response.json(result, { headers: CORS_HEADER });
}
/* Offer */
export async function acceptOffer(req: BunRequest<"/offer/:id">) {
  let { fk_poster_id, fk_listing_id, accept } = await req.json();
  await verifyToken(req, fk_poster_id);
  let id = +req.params.id;
  await offers.acceptOffer(id, fk_poster_id, fk_listing_id, accept);
  return new Response(null, { status: 204, headers: CORS_HEADER });
}
export async function getOfferByOffor(req: BunRequest<"/users/:userid/offer">) {
  let userid = +req.params.userid;
  await verifyToken(req, userid);
  let result = await offers.getOfferByOfferor(+userid);
  return Response.json(result, { headers: CORS_HEADER });
}
export async function getOfferByListingPoster(
  req: BunRequest<"/users/:userid/listings/offer">,
) {
  let userid = +req.params.userid;
  await verifyToken(req, userid);
  let result = await offers.getOfferByListingPoster(userid);
  return Response.json(result, { headers: CORS_HEADER });
}
export async function getOffersByListings(
  req: BunRequest<"/listings/:id/offers/">,
) {
  let { id } = req.params;
  let result = offers.getOffersByListings(+id);
  return Response.json(result, { headers: CORS_HEADER });
}
export async function addOffers(req: BunRequest<"/listings/:id/offers/">) {
  let { id } = req.params;
  let { offer, fk_offeror_id } = await req.json();
  await verifyToken(req, fk_offeror_id);
  let result = await offers.addOffers(offer, fk_offeror_id, +id);
  return Response.json(
    { offerID: result },
    { status: 201, headers: CORS_HEADER },
  );
}

/* Liking */
export async function getLikeInfo(req: BunRequest<"/listings/:id/like">) {
  let { id } = req.params;
  let result = await liking.getLikeInfo(+id);
  return Response.json(result, { headers: CORS_HEADER });
}
export async function getLikeInfoByUser(req: BunRequest<"/users/:id/like">) {
  let { id } = req.params;
  let result = await liking.getLikeInfoByUser(+id);
  return Response.json(result, { headers: CORS_HEADER });
}
export async function addLike(req: BunRequest<"/listings/:id/like">) {
  let { id } = req.params;
  let { fk_liker_id } = await req.json();
  await verifyToken(req, fk_liker_id);
  let result = await liking.addLike(+id, fk_liker_id);
  return Response.json(
    { likingID: result },
    { status: 201, headers: CORS_HEADER },
  );
}
export async function deleteLike(req: BunRequest<"/listings/:id/like">) {
  let { id } = req.params;
  let { fk_liker_id } = await req.json();
  await verifyToken(req, fk_liker_id);
  await liking.deleteLike(fk_liker_id, +id);
  return new Response(null, { status: 204, headers: CORS_HEADER });
}
