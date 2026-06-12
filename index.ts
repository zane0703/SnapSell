import { resolve, extname } from "node:path";
const root = resolve(__dirname, "./public");
const regex = /\/$/;
Bun.serve({
  async fetch(req) {
    let pathname = new URL(req.url).pathname;
    if (pathname.match(/\.\.(\\|\/)/gim)) {
      return new Response("", { status: 400 });
    }
    if (pathname === "/") {
      pathname = "/index.html";
    }
    let mime: string;
    if (extname(pathname) == "") {
      pathname += ".html";
    }
    pathname = resolve(root + pathname);

    const file = Bun.file(pathname);
    if (await file.exists()) {
      switch (req.method) {
        case "GET":
          return new Response(file);
          break;
        case "HEAD":
          return new Response("", {
            status: 200,
            headers: {
              "Content-Type": file.type,
              "Content-Length": file.size.toString(),
            },
          });
          break;
        default:
          return new Response("", {
            status: 405,
          });
          break;
      }
    }
    throw new Response(null, { status: 404 });
  },
  port: 80,
  error(error) {
    if (error instanceof Response) {
      return error;
    } else {
      throw error;
    }
  },
});
