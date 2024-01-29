// src/middleware/authMiddleware.js
const { verifyToken } = require("../config/jwtConfig");

function authenticateToken(req, res, next) {
  const token = req.headers["monyet"];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Forbidden" });
  }
}

module.exports = { authenticateToken };
