const Boom = require("@hapi/boom");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (request, h) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw Boom.unauthorized("Akses ditolak. Format token tidak sesuai");
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    request.auth = decoded;
    return h.continue;
  } catch {
    throw Boom.unauthorized("Token tidak valid");
  }
};

module.exports = {
  authMiddleware,
};