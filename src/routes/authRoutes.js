// src/routes/authRoutes.js
const express = require("express");
const { login, register } = require("../controllers/authController");

const router = express.Router();

// POST endpoint untuk login
router.post("/login", login);

// POST endpoint untuk registrasi
router.post("/register", register);

module.exports = router;
