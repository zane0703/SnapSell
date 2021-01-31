/*
Student ID:1949955
Name: Ang Yun, Zane
Class: DIT/FT/1B/01
*/
const { json, urlencoded } = require('body-parser');
const { get } = require("https");
const app = require('express')();
const user = require('../model/user.js');
const listings = require('../model/listings.js');
const offers = require('../model/offers');
const liking = require('../model/liking');
const { writeFileSync,unlink } = require('fs');
const verifyToken = require('../auth/verifyToken.js');
const multer = require("multer");
const cors = require("cors")
function fileFilter(req, file, callback) {
    /* check if the image is a jpg file */
    if (file.mimetype !== "image/jpeg") {
        callback({ message: "Unsupported image format, jpg only" }, false)
    } else {
        callback(null, true);
    }

}
/* cors is to allow website with different URL to access this API */
app.use(cors())
/* multer a middleware to process multipart/form data from required body so user can uploaded their profile picture */
const upload = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 1048576 } }).single("pic");
/* body parser a middleware to process required body */
app.use(json());
app.use(urlencoded({ extended: false }));
/* Users */
app.post('/login', function (req, res) {
    let { username, password } = req.body
    user.loginUser(username, password, function (err, result) {
        if (!err) {
            res.status(200)
            res.cookie("id",result.token,{httpOnly:true})
            res.type("json")
            res.json(result);

        } else {
            if (err === 401) {
                res.sendStatus(401)
            } else if (err === 403) {
                res.status(403);
                res.json({ auth: false, message: 'Not authorized!' });
            } else {
                res.status(500);
                console.log(err)
                res.end()
            }

        }

    });


});
app.get('/users/:userid', verifyToken, function (req, res) {
    let userid = +req.params.userid
    user.getUser(userid, function (err, result) {
        if (!err) {
            if (result) {
                result = result[0];
                delete result.password;
                res.status(200);
                res.json(result);
            } else {
                res.sendStatus(500)
            }

        } else {
            res.sendStatus(500);
        }
    });

});
app.get('/users/', function (req, res) {
    user.getAllUsers(function (err, result) {
        if (!err) {
            result.forEach(x => {
                delete x.password
            })
            res.status(200);
            res.json(result);
        } else {
            res.sendStatus(500);
        }
    });

});
app.post('/users/', function (req, res) {
    upload(req, res, function (err) {
        let captcha = req.body["g-recaptcha-response"]
        if (captcha) {
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
                get(new URL(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.recaptcha}&response=${captcha}`)
                    , (res2) => {
                        let data = []
                        res2.on("data", chunk => data.push(chunk))
                        res2.on("end", () => {
                            data = JSON.parse(Buffer.concat(data).toString())
                            if (data.success) {
                                let { username, profile_pic_url, password } = req.body;
                                if (req.file && req.body.upload == 1) {
                                    user.addUser(username, true, password, function (err, result) {
                                        if (!err) {
                                            writeFileSync(".\\public\\image\\profile\\" + result.insertId + ".jpg", req.file.buffer)
                                            res.status(201)
                                            res.type('json')
                                            res.json({ userID: result.insertId })
                                        } else {
                                            console.log(err)
                                            if (err.errno === 1062) {
                                                res.statusMessage = "username have been taken"
                                                res.sendStatus(422)
                                            } else { res.sendStatus(500); }


                                        }
                                    });
                                } else {
                                    user.addUser(username, profile_pic_url, password, function (err, result) {
                                        if (err) {
                                            if (err.errno === 1062) {
                                                res.sendStatus(409)
                                            } else { res.sendStatus(500); }
                                        } else {
                                            res.status(201)
                                            res.type('json')
                                            res.json({ userID: result.insertId })
                                        }
                                    });
                                }
                            } else {
                                res.sendStatus(422)
                            }
                        })
                        res.on("error", (err) => res.sendStatus(500))
                    })

            }
        } else {
            res.sendStatus(422)
        }
    })
}
);
app.put('/users/:userid', function (req, res) {
    upload(req, res, function (err) {
        let { userid } = req.params;
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
            verifyToken(req, res, () => {
                let { username, profile_pic_url, password } = req.body;
                if (!password || req.passVerify) {
                    if (req.file && req.body.upload == 1) {
                        user.updateUser(username, password, true, userid, function (err, result) {
                            if (err) {
                                console.log(err)
                                if (err.errno === 1062) {
                                    res.sendStatus(422)
                                } else { res.sendStatus(500) }
                            } else {
                                writeFileSync(".\\public\\image\\profile\\" + userid + ".jpg", req.file.buffer)
                                if (result.token) {
                                    res.status(200)
                                    res.json({ token: result.token })
                                } else {
                                    res.sendStatus(204);
                                }
                            }
                        })
                    } else {
                        user.updateUser(username, password, profile_pic_url, userid, function (err, result) {
                            if (err) {
                                console.log(err)
                                if (err.errno === 1062) {
                                    res.sendStatus(422)
                                } else { res.sendStatus(500) }
                            } else {
                                if (result.token) {
                                    console.log(result)
                                    res.status(200)
                                    res.json({ token: result.token })
                                } else {
                                    res.sendStatus(204);
                                }


                            }
                        })
                    }
                } else {
                    res.status(403);
                    return res.json({ auth: false, message: 'Not authorized!' });
                }

            })
        }
    })



})
/* Listing */
app.get('/users/:userid/listings/', verifyToken, function (req, res) {
    let  userid  = +req.params.userid ;
    listings.getListingsByUser(userid, function (err, result) {
        if (err) {
            res.sendStatus(500);
        } else {
            res.status(200);
            res.json(result);
        }
    })
})
app.get('/listings/', function (req, res) {
    listings.getAllListings(function (err, result) {
        if (err) {
            res.sendStatus(500);
        } else {
            result.forEach(x => {
                if (x.picture_url === "/image/listImg/:id.jpg") { x.picture_url = x.picture_url.replace("/:id", "/" + x.id); }
            })
            res.status(200)
            res.send(result)
        }
    })
})
app.get('/listings/:listing_id/', function (req, res) {
    let  listing_id  = +req.params.listing_id;
    listings.getListing(listing_id, function (err, [result]) {
        if (err) {
            res.sendStatus(500);
        } else {
            if (result) {
                res.status(201);
                res.json(result);
            } else {
                res.status(404);
                res.send("Your requested listings not found");
            }
        }
    })
})

app.post('/listings/', function (req, res) {
    upload(req, res, (err) => {
        if (err) {
            console.log(err)
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
            verifyToken(req, res, function () {
                if (req.file && req.body.upload == 1) {
                    let { title, description, price, fk_poster_id } = req.body;
                    listings.addListings(title, description, +price, +fk_poster_id, true, function (err, result) {
                        if (err) {
                            console.log(err)
                            res.sendStatus(500);
                        } else {
                            writeFileSync(".\\public\\image\\listImg\\" + result.insertId + ".jpg", req.file.buffer)
                            res.status(201)
                            res.type('json')
                            res.json({ listingID: result.insertId })
                        }
                    })
                } else {
                    let { title, description, price, fk_poster_id, picture_url } = req.body;
                    listings.addListings(title, description, price, fk_poster_id, picture_url, function (err, result) {
                        if (err) {
                            console.log(err)
                            res.sendStatus(500);
                        } else {
                            res.status(201)
                            res.type('json')
                            res.json({ listingID: result.insertId })
                        }
                    })
                }
            })


        }
    })


})
app.delete('/listings/:id/', verifyToken, function (req, res) {
    let id = +req.params.id
    let { fk_poster_id } = req.body
    listings.deleteListing(id, fk_poster_id, function (err, result) {
        if (err) {
            console.log(err)
            res.sendStatus(500);
        } else {
            unlink(".\\public\\image\\listImg\\" + id + ".jpg",(err)=>{})
            res.sendStatus(204);
        }
    })
})
app.put('/listings/:id/', function (req, res) {
    upload(req, res, (err) => {
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
            verifyToken(req, res, function () {
                let id = +req.params.id;
                let { title, description, price, fk_poster_id ,picture_url} = req.body;
                if (req.file && req.body.upload == 1) {
                    listings.updateListing(title,fk_poster_id, description, price,true, id, function (err, result) {
                        if (err) {
                            res.sendStatus(500)
                        } else {
                            console.log(result)
                            writeFileSync(".\\public\\image\\listImg\\" + id + ".jpg", req.file.buffer)
                            res.sendStatus(204)

                        }
                    })
                }else{
                    listings.updateListing(title,fk_poster_id, description, price,picture_url, id, function (err, result) {
                        if (err) {
                            console.log(err)
                            res.sendStatus(500)
                            console.log(err)
                        } else {
                            res.sendStatus(204)

                        }
                    })
                }

            })

        }
    })
})
app.get("/listings/search/:query", function (req, res) {
    let { query } = req.params
    listings.searchListings(query, function (err, result) {
        if (err) {
            res.sendStatus(500)
        } else {
            result.forEach(x => {
                if (x.picture_url === "/image/listImg/:id.jpg") { x.picture_url = x.picture_url.replace("/:id", "/" + x.id); }
            })
            res.status(200);
            res.json(result)
        }
    })

})
/* Offer */
app.put("/offer/:id", verifyToken, function (req, res) {
    let { fk_poster_id, fk_listing_id, accept } = req.body
    let id = +req.params.id
    offers.AcceptOffer(id, fk_poster_id, fk_listing_id, accept, function (err, result) {
        if (err) {
            console.log(err)
            res.sendStatus(500)
        } else {
            res.sendStatus(204)
        }
    })
})
app.get("/users/:userid/offer", verifyToken, function (req, res) {
    let { userid } = req.params
    offers.getOfferByOffor(userid, function (err, result) {
        if (err) {
            console.log(err)
            res.sendStatus(500);
        } else {
            res.status(200);
            res.json(result)
        }
    })
})
app.get("/users/:userid/listings/offer", verifyToken, function (req, res) {
    let { userid } = req.params;
    offers.getOfferByListingPoster(userid, function (err, result) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(200);
            res.json(result)
        }
    })
})
app.get('/listings/:id/offers/', function (req, res) {
    let { id } = req.params;
    offers.getOffersByListings(id, function (err, result) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(200);
            res.send(result)
        }
    })
})
app.post('/listings/:id/offers/', verifyToken, function (req, res) {
    let { id } = req.params;
    let { offer, fk_offeror_id } = req.body;
    offers.addOffers(offer, fk_offeror_id, id, function (err, result) {
        if (err) {
            console.log(err)
            res.sendStatus(500)
        } else {
            res.status(201);
            res.json({ offerID: result.insertId })
        }
    })
})

/* Liking */
app.get("/listings/:id/like", function (req, res) {
    let { id } = req.params;
    liking.getLikeInfo(id, function (err, result) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(200);
            res.json(result)
        }
    })
})
app.get("/users/:id/like", function (req, res) {
    let { id } = req.params;
    liking.getLikeInfoByUser(id, function (err, result) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(200);
            res.json(result)
        }
    })
})
app.post("/listings/:id/like",verifyToken, function (req, res) {
    let { id } = req.params;
    let { fk_liker_id } = req.body;
    liking.addLike(id, fk_liker_id, function (err, result) {
        if (err) {
            res.sendStatus(500);
            console.log(err)
        } else {
            res.status(201);
            res.json({ likingID: result.insertId });
        }
    })
})
app.delete("/listings/:id/like",verifyToken, function (req, res) {
    let { id } = req.params;
    let { fk_liker_id } = req.body;
    liking.deleteLike(fk_liker_id, id, function (err, result) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.sendStatus(204)
        }
    })
})
module.exports = app;