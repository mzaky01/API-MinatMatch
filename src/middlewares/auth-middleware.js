const Boom = require("@hapi/boom");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (request, h) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw Boom.unauthorized("Access denied. Invalid token format.");
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    request.auth = decoded;
    return h.continue;
  } catch {
    throw Boom.unauthorized("Invalid token.");
  }
};

module.exports = {
  authMiddleware,
};