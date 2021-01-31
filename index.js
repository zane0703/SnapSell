/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
*/
const { createServer } = require("http");
const { parse } = require("url");
const { resolve } = require("path");
const { stat, createReadStream } = require("fs");
const { extname } = require('path');
const g = require("graphql")
const user = require('./model/user.js');
const listings = require('./model/listings.js');
const offers = require('./model/offers');
const liking = require('./model/liking');
const regex = /\/$/;
const listingQueryType = new g.GraphQLObjectType({
    name: "listing",
    description: 'get listing',
    fields: () => ({
        id: { type: g.GraphQLInt },
        title: { type: g.GraphQLString },
        price: { type: g.GraphQLFloat },
        fk_poster_id: { type: g.GraphQLInt },
        picture_url: { type: g.GraphQLString },
        created_at: { type: g.GraphQLString },
        description: { type: g.GraphQLString },
        like: { type: g.GraphQLInt }

    })
})
const userQueryType = new g.GraphQLObjectType({
    name: "users",
    description: 'get all user',
    fields: () => ({
        id: { type: g.GraphQLInt },
        username: { type: g.GraphQLString },
        password: { type: g.GraphQLString },
        profile_pic_url: { type: g.GraphQLString },
        created_at: { type: g.GraphQLString },
        listings: {
            type: new g.GraphQLList(listingQueryType),
            name: "listing",
            description: "get listing by user id",
            resolve: (parent) => new Promise((resolve, reject) => {
                listings.getListingsByUser(parent.id, (err, result) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                })
            })
        }
    })
})
const schema = new g.GraphQLSchema({
    query: new g.GraphQLObjectType({
        name: "query",
        description: "root",
        fields: () => ({
            user: {
                type: userQueryType,
                description: "get user",
                args: {
                    id: { type: g.GraphQLInt }
                },
                resolve: (parent, args) => new Promise((resolve, reject) => {
                    user.getUser(args.id, (err, result) => {
                        if (err) {
                            reject(err)
                        } else {
                            if (result.length) {
                                resolve(result[0])
                            } else {
                                g.GraphQLError
                                reject(new Error("User not found"))
                            }
                        }
                    })
                })
            },
            users: {
                type: new g.GraphQLList(userQueryType),
                description: "get all users",
                resolve: () => new Promise((resolve, reject) => {
                    user.getAllUsers((err, results) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(results)
                        }
                    })
                })
            },
            listing: {
                type: listingQueryType,
                description: "get listings by id",
                args: {
                    id: { type: g.GraphQLInt }
                },
                resolve: (parent, args) => new Promise((resolve, reject) => {
                    listings.getListing(args.id, (err, result) => {
                        if (err) {
                            reject(err)
                        } else {
                            if (result.length) {
                                resolve(result[0])
                            } else {
                                reject(new Error("listing not found"))
                            }
                        }
                    })
                })
            },
            listings: {
                type: new g.GraphQLList(listingQueryType),
                description: "get all listings ",
                resolve: () => new Promise((resolve, reject) => {
                    listings.getAllListings((err, result) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(result)
                        }
                    })
                })
            }
        })
    })
})
function server(req = http.r, res) {
    let { pathname } = parse(req.url);
    try {
        if (req.method === "GET") {
            if(pathname.match(/\.\.(\\|\/)/gmi)){
                res.statusCode = 400;
                res.end()
            }
            if (pathname === "/") { pathname = "/index.html" }
            let mime;
            switch (extname(pathname)) {
                default:
                    pathname = regex.test(pathname) ? pathname.replace(regex, ".html") : pathname + ".html"
                case ".html":
                    mime = "text/html; charset=UTF-8"
                    break;
                case '.css':
                    mime = "text/css; charset=UTF-8"
                    break;
                case ".ico":
                    mime = "image/x-icon"
                    break;
                case ".jpg":
                    mime = "image/jpeg"
                    break;
            }
            pathname = resolve(__dirname, "./public" + pathname)
            stat(pathname, (err, data) => {
                if (err) {
                    res.statusCode = 404;
                    res.end()
                } else {
                    let mtime = data.mtime.toUTCString()
                    if (mtime === req.headers['if-modified-since']) {
                        res.statusCode = 304
                        res.end()
                    } else {
                        res.writeHead(200, { "Tk": "N", "Content-Language": "en-SG", "Cache-Control": "max-age=84600, public", "Server": "Node.js Server-side JavaScript", "Content-Length": data.size, "Last-Modified": mtime, "Content-Type": mime })
                        createReadStream(pathname).pipe(res);
                    }

                }
            })

        } else {
            if (pathname === "/graphql" && req.method === "POST") {
                let data = []
                req.on("data", chunk => {
                    data.push(chunk)
                })
                req.on("end", () => {
                    console.log(req.headers["content-type"])
                    data = JSON.parse(data.toString())
                   
                    g.graphql(schema, data.query).then(result => {
                        res.writeHead(200, { "Content-Type": "application/json" })
                        res.end(JSON.stringify(result))
                    })
                })
            } else {
                res.writeHead(405, { "Allow": "GET, POST" })
                res.end()
            }


        }
    } catch (e) {
        res.statusCode = 500;
        res.end()
    }
}
/* make a normal http server */
createServer(server).listen(80, () => console.log("\x1b[32mWeb website Hosted at \x1b[4mhttp://localhost\x1b[0m"))
/* make a https server */
require("http2").createSecureServer({
    key: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDSfgOCSwfP1stF
+50seQDvYP9gRFOirgTWaQkdSNfwygHmALCWjCi/lFdO1V89AI1LMJQTsLl3HjS0
zLD1uf/4dopFDxN1iudKY6mVje/vaY2V3FwrpKs4iutOwty2KlgdgNIqrF+dyjgM
zQ4isoXqajT4B6JJKvy3Q09DHHEKdahswKu6O+pu6lIoGSqVPhGGUpLkYghT0ysR
KxZuQdDTmx3LUqVhenX24i6+4ifu0IU6mzEeM+pNQe+XZ3AgFqEiRdxCOhmPVVbC
h3D5GDUa9tOvqKBiv9BCwq55kKq2kgYOIEL0h/GX5AkvpZQ02s1QULEegGk+RN8k
nwzB1YbFAgMBAAECggEAfzT0fetGH07ZrcNvqw69h+0AqHbibG/qMIFtpqr9BWGv
YAaOsYymm5DUaqn8Umtg+E21T2j/zIMOqy0AzJ/Jl6hby3xe8Cwvtv8f32fV1sPd
cvGnKiDr8NHTfte4dsaEVeAiIvPlHQC2etX5cvKch5wDwtkqNDmsXDxrTE2F6yEy
jjKyB3tOUFoaet86IflrhhmWrAeKXJhujbRmC8zWVnx7AN2KT/p+d/D5Kg/oiXzJ
MtO5xWaOGmP6grrH/bmXCVPU5rIoO3FL8fdzdWQOKH4djirpHk5kwxpoEpPLp2ig
wDw8tgO44QkCsJoK0X6uwuhH5yiGHq1vd6jhQLmYgQKBgQD5L78sMTNTsWR85V1+
YCvznWs+k//2c4mNWmN29GIBblC0QvsQYl3fiP7zU6KvxJpBS68EK4gzsNjxzoIF
r/F16QLOkgFoafIQbIb6wx4fJnQEQ+u0BBr1tJe5ylXYpMzdb7HIdIqRad9GIc/j
kAFApeD/obd4HuXcbWs8pQ5KcQKBgQDYP2pJIsup406C+M22dr6YuPmNSYe80DoH
/Rx6xipps2Eg/RXaEgTm34xhDoATitxxGpkZxPh0BCN2Wnm2p4QDA4RzjWa7rzWK
s1CxSIfgLIKq8CZPwpadJA18nzoBMddOv7naCAVzExrHab5LmA4SUvnk6n8Xuo3B
QekS+aLjlQKBgElKreQFpJ8dMf06SUF+b+77giupxENswCx/RXobbygUllAu00GC
bTHuTW6sTtF79hL2e8eyNiFeBrE4mC2sDk0r99NiRl+7qaMDCMCA2z82RDFs+Mq9
2mAiee3/gThzYH5Q9+2JuagDh9RM5aR9GqE1KPSHUDtYeytWU5BGy+lBAoGAcx4P
Lq/fS6k9+msI18GO5S5Tauth3xnaSrZrmtAzc+GSK0WPhG9jPKR0zpYxiDW79Fn8
dsNsoBYz6qVvddTnadNNh1YXAoLbNeMPadD6xFPtm6IMQxmLpEu1AkqhTlGCFOHr
xi3O+NuKve2E6CkiFI8niL1suu0M2XyE3x0VoaECgYBWL0cjlU1OliCcecNbCXiW
IH2BUaU+rI1KHE4QEnCKLSrr+0L/9yk+koZ2i5bdY8upzcbG9BrIBj0I1S6z6+eL
tUEI/qN7W2unrfU2KBdMYeXjE1K8rhOZSysSgvnyReJPyhZoMeDUtJWN9a4c7fC3
DRRLbq/Jn3AHoLkJgI8MGg==
-----END PRIVATE KEY-----`, cert: `-----BEGIN CERTIFICATE-----
MIIDaDCCAlCgAwIBAgIJAJOdMf13XA0oMA0GCSqGSIb3DQEBCwUAMCcxCzAJBgNV
BAYTAlVTMRgwFgYDVQQDDA9FeGFtcGxlLVJvb3QtQ0EwHhcNMTkxMDI5MDAzMDE5
WhcNMjIwODE4MDAzMDE5WjBtMQswCQYDVQQGEwJTRzESMBAGA1UECAwJWW91clN0
YXRlMREwDwYDVQQHDAhZb3VyQ2l0eTEdMBsGA1UECgwURXhhbXBsZS1DZXJ0aWZp
Y2F0ZXMxGDAWBgNVBAMMD2xvY2FsaG9zdC5sb2NhbDCCASIwDQYJKoZIhvcNAQEB
BQADggEPADCCAQoCggEBANJ+A4JLB8/Wy0X7nSx5AO9g/2BEU6KuBNZpCR1I1/DK
AeYAsJaMKL+UV07VXz0AjUswlBOwuXceNLTMsPW5//h2ikUPE3WK50pjqZWN7+9p
jZXcXCukqziK607C3LYqWB2A0iqsX53KOAzNDiKyhepqNPgHokkq/LdDT0MccQp1
qGzAq7o76m7qUigZKpU+EYZSkuRiCFPTKxErFm5B0NObHctSpWF6dfbiLr7iJ+7Q
hTqbMR4z6k1B75dncCAWoSJF3EI6GY9VVsKHcPkYNRr206+ooGK/0ELCrnmQqraS
Bg4gQvSH8ZfkCS+llDTazVBQsR6AaT5E3ySfDMHVhsUCAwEAAaNRME8wHwYDVR0j
BBgwFoAUTei+kVvsqhYR8h90MiH7fp0Uz3YwCQYDVR0TBAIwADALBgNVHQ8EBAMC
BPAwFAYDVR0RBA0wC4IJbG9jYWxob3N0MA0GCSqGSIb3DQEBCwUAA4IBAQBBNOeH
anuFCMN0lrtIKPRuAC01WFnqoYfZer3ptz2FCePf1qR8bs8lnl6jszbxmZpsxgwo
q9TW+ldz+xrzDYqiNmZXiEab06DPUS2rLHPonPiSyMUsIeXNfGtclpvLHkKB7T1g
Mllj3BQjiCTpC2nF5Vh47+fZaUraGBmpHoWEKsDQj08+wJ30O2oUMiQg4UZ8pLga
AnjU6nc/kbUWeG6eT1n3NrSGRrSRev5mD45PEoz7bnh4YJPIvi8msZuJP+TeOeQQ
WlKJW/u3hoSSFpOS4w+EDlMtwQOxXpIJzIZxLWeEhcTYPjJB8ypIhoFBabMr/tK+
AjZcL0/0tT0g+Gzh
-----END CERTIFICATE-----`}, server).listen(443);
