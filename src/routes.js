const { registerHandler, loginHandler, authMiddleware, changePasswordHandler, getProfileHandler, editProfileHandler, deleteAccountHandler } = require("./auth");

const fs = require("fs");
const path = require("path");
const { predictCareer } = require("./utils/predict");
const { predictionHistoryHandler, deletePredictionByIdHandler, deletePredictionHistoryHandler } = require("./prediction");

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
  {
    method: 'POST',
    path: '/predict',
    handler: predictCareer,
    options: {
      pre: [{ method: authMiddleware}] 
    }
  },
  {
    method: "GET",
    path: "/prediction-history",
    handler: predictionHistoryHandler,
    options: {
      pre: [{ method: authMiddleware}]
    }
  } ,
  {
    method: "DELETE",
    path: "/prediction-history",
    handler: deletePredictionHistoryHandler,
    options: {
      pre: [{ method: authMiddleware}]
    }
  },
  {
    method: "DELETE",
    path: "/prediction-history/{id}",
    handler: deletePredictionByIdHandler,
    options: {
      pre: [{ method: authMiddleware}]
    }
  },
  {
    method: "POST",
    path: "/change-password",
    handler: changePasswordHandler,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: "GET",
    path: "/profile",
    handler: getProfileHandler,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: "PUT",
    path: "/profile",
    handler: editProfileHandler,
    options: {
      pre: [{ method: authMiddleware }],
      payload: {
        output: "stream",
        parse: true,
        allow: ["multipart/form-data"],
        multipart: true,
        maxBytes: 5 * 1024 * 1024, 
      },
    },
  },
  {
    method: "DELETE",
    path: "/account",
    handler: deleteAccountHandler,
    options: {
      pre: [{ method: authMiddleware }],
    },
  }
];

module.exports = routes;
