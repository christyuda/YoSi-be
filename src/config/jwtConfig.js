// src/config/jwtConfig.js
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY; // Ganti dengan kunci rahasia yang aman

function createToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: "1d" });
}

function verifyToken(token) {
  return jwt.verify(token, secretKey);
}

module.exports = { createToken, verifyToken };
