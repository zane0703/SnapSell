/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
Date: 09 February 2020 
*/
const {verify} = require('jsonwebtoken');
const {getUser} = require('../model/user.js');
const {compare} = require("bcryptjs")
function verifyToken(req, res, next) {

    var token = req.headers['authorization']; //retrieve authorization header’s content
    if (!token || !token.includes('Bearer')) { //process the token

        res.status(403);
        return res.send({ auth: 'false', message: 'Not authorized!' });
    } else {
        token = token.split('Bearer ')[1]; //obtain the token’s value
        verify(token, process.env.key, function (err, decoded) {//verify token
            if (err) {
                res.status(403);
                return res.json({ auth: false, message: 'Not authorized!' });
            } else {
                let userid = +req.params.userid || +req.body.fk_offeror_id || +req.body.fk_poster_id || +req.body.fk_liker_id
                getUser(userid, (err, result) => {
                    if (err) {
                        res.sendStatus(500)
                    } else {
                        if (result[0].id === decoded.userID && result[0].username === decoded.username) {
                            if(req.body.currentPass){
                                compare(req.body.currentPass,result[0].password,(err,success)=>{
                                    if(err){
                                        res.sendStatus(500)
                                    }else{
                                        if(success){
                                            req.passVerify=true
                                            next()
                                        }else{
                                            res.status(403);
                                            return res.json({ auth: false, message: 'Not authorized!' });
                                        }
                                    }
                                })
                            }else{
                                next();
                            }
                        } else {
                            res.status(403);
                            return res.json({ auth: false, message: 'Not authorized!' });
                        }
                    }
                })

            }

        });
    }

}

module.exports = verifyToken;
