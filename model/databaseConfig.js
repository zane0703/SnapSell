/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
*/
const {createConnection} = require('mysql');
module.exports  = {
    getConnection: function () {
        return createConnection({
            host: "localhost",
            user: "test",
            password: "password",
            database: "snapsell"
        });     
    }
};