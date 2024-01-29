// app.js
const express = require("express");
const bodyParser = require("body-parser");
const { connectDB, mongoose } = require("./src/config/db"); // Import mongoose from db.js
const authRoutes = require("./src/routes/authRoutes");
const mahasiswaRoutes = require("./src/routes/mahasiswaRoutes");
const dosenRoutes = require("./src/routes/dosenRoutes");
const { authenticateToken } = require("./src/middleware/authMiddleware");
const { pasetoConfig } = require("./src/config/jwtConfig");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());

// Connect to MongoDB
connectDB(); // Call connectDB function

// Routes
app.use("/auth", authRoutes);

// Middleware for authentication
app.use(authenticateToken);

// Mahasiswa routes
app.use("/mahasiswa", mahasiswaRoutes);

// Dosen routes
app.use("/dosen", dosenRoutes);

// Server Listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});