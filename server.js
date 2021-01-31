/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
*/
if(process.env.dev){require("dotenv").config()}
const app = require('./controller/app.js');
/* call the server to listen to port 8081 to start the server */
const server = app.listen(process.env.port, ()=>console.log("\x1b[32m",'Web App Hosted at \x1b[4mhttp://localhost:'+process.env.port,"\x1b[0m"));
