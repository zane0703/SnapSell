import { type Serve } from "bun";
import * as controller from "../controller/app";
import CORS_HEADER from "../cors_header";
function router<W, R extends string>(routes: Serve.Routes<W, R>) {
  return routes;
}

const cors = new Response(null, {
  headers: CORS_HEADER,
});

export default router({
  "/login": {
    POST: controller.login,
    OPTIONS: cors,
  },
  "/users/:userid": {
    GET: controller.getUserById,
    PUT: controller.updateUser,
    OPTIONS: cors,
  },
  "/users": {
    GET: controller.getAllUser,
    POST: controller.createUser,
    OPTIONS: cors,
  },
  "/users/:userid/listings": {
    GET: controller.getListingsByUser,
    OPTIONS: cors,
  },
  "/listings": {
    GET: controller.getAllListings,
    POST: controller.addListings,
    OPTIONS: cors,
  },
  "/listings/:id": {
    GET: controller.getListing,
    PUT: controller.updateListing,
    DELETE: controller.deleteListing,
    OPTIONS: cors,
  },
  "/listings/search/:query": {
    GET: controller.searchListings,
    OPTIONS: cors,
  },
  "/offer/:id": {
    PUT: controller.acceptOffer,
    OPTIONS: cors,
  },
  "/users/:userid/offer": {
    GET: controller.getOfferByOffor,
    OPTIONS: cors,
  },
  "/users/:userid/listings/offer": {
    GET: controller.getOfferByListingPoster,
    OPTIONS: cors,
  },
  "/listings/:id/offers": {
    GET: controller.getOffersByListings,
    POST: controller.addOffers,
    OPTIONS: cors,
  },
  "/listings/:id/like": {
    GET: controller.getLikeInfo,
    POST: controller.addLike,
    DELETE: controller.deleteLike,
    OPTIONS: cors,
  },
  "/users/:id/like": {
    GET: controller.getLikeInfoByUser,
    OPTIONS: cors,
  },
});
