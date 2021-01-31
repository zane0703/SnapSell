/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
*/
const db = require('./databaseConfig.js');

const {raw:sqlRaw} = require('mysql');
module.exports = {
    getListing: function (listing_id, callback) {//Endpoint GET /listing/:id
        const conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                return callback(err, null);
            }
            else {
                console.log("Connected!");
                conn.query('SELECT * FROM listings WHERE id = ?', listing_id, function (err, result) {
                    conn.end();
                    if (err) {
                        return callback(err, null);
                    } else {
                        return callback(null, result);
                    }
                });
            }
        });
    },
    getListingsByUser: function (user_id, callback) {//Endpoint post /users/:userid/listing
        const conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                return callback(err, null);
            }
            else {
                console.log("Connected!");
                conn.query('SELECT * FROM listings WHERE fk_poster_id = ?', user_id, function (err, result) {
                    conn.end();
                    if (err) {
                        return callback(err, null);
                    } else {
                        return callback(null, result);
                    }
                });
            }
        });
    },
    getAllListings: function (callback) {//Endpoint GET /listing
        const conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                return callback(err, null);
            }
            else {
                console.log("Connected!");
                conn.query('SELECT * FROM listings', function (err, result) {
                    conn.end();
                    if (err) {
                        return callback(err, null);
                    } else {
                        return callback(null, result);
                    }
                });
            }
        });
    },searchListings:function(query,callback){
        const conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                return callback(err, null);
            }
            else {
                console.log("Connected!");
                conn.query('SELECT * FROM listings WHERE title REGEXP ?',query, function (err, result) {
                    conn.end();
                    if (err) {
                        return callback(err, null);
                    } else {
                        return callback(null, result);
                    }
                });
            }
        });
    }, addListings: function (title, description, price, fk_poster_id,picture_url, callback) {//Endpoint POST /listing
        const conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                return callback(err, null);
            }
            else {
                console.log("Connected!");
                conn.query('INSERT INTO listings(title, description,price,fk_poster_id,picture_url) VALUES(?,?,?,?,?)',
                    [title, description, price, fk_poster_id,picture_url===true?"null":picture_url], function (err, result) {
                        if (err) {
                            conn.end();
                            return callback(err, null);

                        } else {
                            if (picture_url === true) {
                                conn.query("UPDATE listings SET picture_url = ? WHERE id=?", ["/image/listImg/" + result.insertId + ".jpg", result.insertId], function (err) {
                                    conn.end();
                                    if (err) {
                                        return callback(err, null);

                                    } else {
                                        return callback(null, result);
                                    }
                                })
                            } else {
                                conn.end();
                                return callback(null, result);
                            }
                        }
                    });

            }

        });

    }, deleteListing: function (id,fk_poster_id, callback) {//Endpoint DELETE /listing/:id
        const conn = db.getConnection()
        conn.connect(function (err) {
            if (err) {
                callback(err, null)
            } else {
                console.log("Connected!")
                conn.query("DELETE FROM listings WHERE id=? AND fk_poster_id=?", [id,fk_poster_id], function (err, result) {
                    conn.end()
                    if (err) {
                        callback(err, null)
                    } else {
                        if (result.affectedRows) {
                            callback(null, result)
                        } else {
                            callback(new Error("unknown listing id"), null)
                        }
                    }
                })
            }
        })

    },
    updateListing: function (title,fk_poster_id, description, price,picture_url, id, callback) {//Endpoint PUT /listing/:id

        const conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                callback(err, null)
            } else {
                console.log("Connected!");
                let value={}
                if (picture_url === true) {
                    value.picture_url = sqlRaw('CONCAT("/image/listImg/",id,".jpg")')
                }else if(picture_url){value.picture_url = picture_url}
                if(title){value.title = title}
                if(description){value.description=description}
                if(price){value.price= price}

                conn.query("UPDATE listings SET ? WHERE id=? AND fk_poster_id=?", [value, id,fk_poster_id], function (err, result) {
                    conn.end()
                    if (err) {
                        callback(err, null)
                    } else {
                        if (result.affectedRows) {
                            callback(null, result)
                        } else {
                            callback(new Error("Unknown listing id"), null)
                        }
                    }
                })
            }

        });

    }


}
