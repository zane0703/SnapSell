
/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
*/
const db = require('./databaseConfig.js');
module.exports = {
    getOffersByListings: function (id, callback) {//Endpoint GET /listing/:id/offer
        let conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                callback(err, null)
            } else {
                console.log("Connected!");
                conn.query(`SELECT * FROM offers WHERE fk_listing_id=?`, id, function (err, result) {
                    conn.end();
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, result);
                    }
                })
            }
        })
    },getOfferByOffor:function(userid,callback){
        let conn = db.getConnection()
        conn.connect(function(err){
            if(err){
                return callback(err,null)
            }else{
                conn.query("SELECt o.offer,l.title,o.accepted FROM offers o INNER JOIN listings l ON l.id = fk_listing_id WHERE fk_offeror_id = ?",userid,function(err,result){
                    conn.end()
                    if(err){
                        return callback(err,null)
                    }else{
                        return callback(null,result)
                    }
                })
            }
        })
    },
    addOffers: function (offer, fk_offeror_id, id, callback) {//Endpoint POST /listing/:id/offer
        let conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                callback(err, null)
            } else {
                console.log("Connected!");
                conn.query("INSERT INTO offers(offer,fk_offeror_id,fk_listing_id) VALUES(?,?,?)", [offer, fk_offeror_id, id], function (err, result) {
                    conn.end();
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, result)
                    }
                })
            }
        })
    }, getOfferByListingPoster: function (userid, callback) {
        let conn = db.getConnection()
        conn.connect(function (err) {
            if (err) {
                return callback(err, null)
            } else {
                conn.query(`SELECT o.offer,o.id,o.accepted,l.title, u.username,l.id as lId FROM listings l,offers o , users  u
                WHERE l.fk_poster_id = ? AND (l.id = o.fk_listing_id  AND o.fk_offeror_id = u.id)`, userid, function (err, result) {
                    conn.end()
                    if (err) {
                        callback(err, null)
                    } else {
                        callback(null, result)
                    }
                })
            }
        })

    }, AcceptOffer: function (id, fk_poster_id,fk_listing_id, accept, callback) {
        conn = db.getConnection()
        conn.connect(function (err) {
            if (err) {
                return callback(err, null)
            } else {
                /* to verify if the poster not anyone */
                conn.query("SELECT id FROM listings WHERE fk_poster_id=? AND id=?;", [fk_poster_id,fk_listing_id,], function (err, result) {
                    if (err) {
                        conn.end()
                        return callback(err, null)
                    } else {
                        if(result.length){
                            conn.query("UPDATE offers set accepted=? WHERE fk_listing_id=? AND id=?;", [accept, result[0].id, id], function (err, result2) {
                                conn.end()
                                if (err) {
                                    return callback(err, null)
                                } else {
                                    if (result2.affectedRows) {
                                        callback(null, result2)
                                    } else {
                                        callback(new Error("no rows"),null)
                                    }
                                }
                            })
                        }else{
                            callback(new Error("no rows"),null)
                        }
                        
                    }
                })
            }
        })

    }
}