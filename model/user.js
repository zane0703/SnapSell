/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
*/
const db = require('./databaseConfig.js');
const jwt = require('jsonwebtoken').sign;
const { hash: hashPass, compare } = require("bcryptjs")
const { raw: sqlRaw} = require('mysql');

module.exports = {
    getUser: function (userid, callback) {//Endpoint GET /users/:id
        const conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                return callback(err, null);
            }
            else {
                console.log("Connected!");
                conn.query('SELECT * FROM users WHERE id = ?', userid, function (err, result) {
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
    getAllUsers: function (callback) {//Endpoint GET /users
        const conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                return callback(err, null);
            }
            else {
                console.log("Connected!");
                conn.query('SELECT * FROM users', function (err, result) {
                    conn.end();
                    if (err) {
                        return callback(err, null);
                    } else {
                        return callback(null, result);
                    }
                });
            }
        });
    }, addUser: function (username, profile_pic_url, password, callback) {//Endpoint POST /users

        const conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                return callback(err, null);
            }
            else {
                console.log("Connected!");
                hashPass(password, 10, function (err, hash) {
                    if (err) {
                        return callback(err, null)
                    } else {
                        conn.query(`INSERT INTO users(username,profile_pic_url,password) VALUES(?,?,?);`,
                            [username, profile_pic_url === true ? null : profile_pic_url, hash], function (err, result) {
                                if (err) {
                                    return callback(err, null);
                                } else {
                                    if (profile_pic_url === true) {
                                        conn.query("UPDATE users SET profile_pic_url= ? WHERE id=?", ["/image/profile/" + result.insertId + ".jpg", result.insertId], function (err) {
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
                })


            }

        });

    }, updateUser: function (username, password, profile_pic_url, id, callback) {//Endpoint PUT /users/:id
        let value = {};
        const conn = db.getConnection();
        let token;
        id = parseInt(id)
        conn.connect(async function (err) {
            if (err) {
                callback(err, null)
            } else {
                console.log("Connected!");
                if (username) {
                    value.username = username
                    token = jwt({ username, userID: id }, process.env.key, {
                        expiresIn: 86400//expires in 24 hrs
                    });
                }
                if (password) {
                    value.password = await hashPass(password, 10)
                }
                if (profile_pic_url === true) {
                    value.profile_pic_url = sqlRaw('CONCAT("/image/profile/",id,".jpg")')
                } else if (profile_pic_url) { value.profile_pic_url = profile_pic_url }
                conn.query("UPDATE users SET ? WHERE id=?", [value, id], function (err, result) {
                    conn.end()
                    if (err) {
                        callback(err, null)
                    } else {
                        if (result.affectedRows) {
                            try {
                                result.token = token
                            } catch (e) { }
                            return callback(null, result)
                        } else {
                            callback(new Error("Unknown user id"), null)
                        }

                    }
                })
            }

        });

    }, loginUser: function (username, password, callback) {

        var conn = db.getConnection();

        conn.connect(function (err) {
            if (err) {
                return callback(err, null);
            }
            else {
                console.log("Connected!");
                conn.query('select * from users where username=?', username, function (err, result) {
                    conn.end();

                    if (err) {
                        return callback(err, null);
                    } else {
                        let token = "";
                        if (result.length == 1) {
                            compare(password, result[0].password, function (err, success) {
                                if (err) {
                                    return callback(err, null)
                                } else {
                                    if (success) {
                                        token = jwt({ username:result[0].username, userID: result[0].id }, process.env.key, {
                                            expiresIn: 86400//expires in 24 hrs
                                        });
                                        return callback(null, { token, userID: result[0].id });
                                    } else {
                                        return callback(403, null)
                                    }
                                }
                            })

                        } else {
                            callback(401, null)

                        }




                    }
                });
            }
        })
    }


}

