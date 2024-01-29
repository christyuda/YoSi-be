// src/config/jwtConfig.js
const jwt = require("jsonwebtoken");

const secretKey = "your_secret_key"; // Ganti dengan kunci rahasia yang aman

function createToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: "1d" });
}

function verifyToken(token) {
  return jwt.verify(token, secretKey);
}

module.exports = { createToken, verifyToken };
