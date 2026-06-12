/*
Student ID:1949955
Name: Ang Yun Zane
Class: DIT/FT/1B/01
*/
import routes from "./routes/app";
Bun.serve({
  port: 8081,
  routes,
  error(error) {
    if (error instanceof Response) {
      return error;
    } else {
      throw error;
    }
  },
});
