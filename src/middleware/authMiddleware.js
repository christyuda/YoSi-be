// src/middleware/authMiddleware.js
const { verifyToken } = require("../config/jwtConfig");
require("dotenv").config();
function authenticateToken(req, res, next) {
  const token = req.headers[process.env.TOKEN_HEADER_NAME];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = verifyToken(token);
    console.log("Token Payload:", payload);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Forbidden" });
  }
}

module.exports = { authenticateToken };
