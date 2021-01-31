/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
*/
const db = require('./databaseConfig.js');
module.exports = {
    /**
     * 
     * @param {number} id 
     * @param {function callback(Error,Object=result) {
         
     }} callback
     */
    getLikeInfo: function (id, callback) {//Endpoint GET /listing/:id/like
        let conn = db.getConnection()
        conn.connect(function (err) {
            if (err) {
                callback(err, null);
            } else {
                conn.query(`SELECT l.id,u.username AS liker_name, l.fk_liker_id,i.title AS listing_title , l.fk_listing_id FROM liking l
INNER JOIN users u
ON l.fk_liker_id = u.id
INNER JOIN listings i
ON l.fk_listing_id = i.id
WHERE l.fk_listing_id=?`, id, function (err, result) {
                    conn.end()
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, result)
                    }
                })
            }
        })
    },
    getLikeInfoByUser: function (id, callback) {//Endpoint GET /listing/:id/like
        let conn = db.getConnection()
        conn.connect(function (err) {
            if (err) {
                callback(err, null);
            } else {
                conn.query(`SELECT l.id,u.username AS liker_name, l.fk_liker_id,i.title AS listing_title , l.fk_listing_id FROM liking l
INNER JOIN users u
ON l.fk_liker_id = u.id
INNER JOIN listings i
ON l.fk_listing_id = i.id
WHERE l.fk_liker_id=?`, id, function (err, result) {
                    conn.end()
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, result)
                    }
                })
            }
        })},
        addLike: function (id, fk_liker_id, callback) {//Endpoint POST /listing/:id/like
        let conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                conn.end();
                callback(err, null);
            } else {
                conn.query('INSERT INTO liking(fk_liker_id,fk_listing_id) VALUES(?,?);', [fk_liker_id, id], function (err, result) {
                    if (err) {
                        conn.end();
                        callback(err, null);
                    } else {
                        /* increment like point for that listings */
                        conn.query("UPDATE listings SET `like` = `like` + 1 WHERE id = ?;", id, function (err) {
                            conn.end();
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result)
                            }
                        })
                    }
                })
            }
        })
    },
    deleteLike: function (fk_liker_id, id, callback) {//Endpoint DELETE /listing/:id/like
        let conn = db.getConnection()
        conn.connect(function (err) {
            if (err) {
                conn.end()
                callback(err, null);
            } else {
                conn.query("DELETE FROM liking WHERE fk_liker_id=? && fk_listing_id=?;", [fk_liker_id, id], function (err, result) {
                    if (err) {
                        conn.end()
                        callback(err, null)
                    } else {
                        if (result.affectedRows) {
                            /* decrement like point for that listings */
                            conn.query("UPDATE listings SET `like`=`like` - 1 WHERE id=?;", [id], function (err, result) {
                                conn.end();
                                if (err) {
                                    callback(err)
                                } else {
                                    callback(null, result)
                                }
                            })
                        } else {
                            conn.end()
                            callback(new Error("no like"), null)
                        }

                    }
                })
            }
        })

    }
}