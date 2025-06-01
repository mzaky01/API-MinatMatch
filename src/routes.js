const { registerHandler, loginHandler } = require("./auth");

const fs = require("fs");
const path = require("path");

const routes = [
  {
    method: "POST",
    path: "/register",
    handler: registerHandler,
  },
  {
    method: "POST",
    path: "/login",
    handler: loginHandler,
  },
  {
    method: "GET",
    path: "/",
    handler: (request, h) => {
      const filePath = path.join(__dirname, "index.html");
      const html = fs.readFileSync(filePath, "utf-8");
      return h.response(html).type("text/html");
    },
  },
];

module.exports = routes;
