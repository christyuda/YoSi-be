const express = require("express");
const db = require("./src/config/db");
const mahasiswaRoutes = require("./src/routes/mahasiswaRoutes");
// Import other route files as needed

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/mahasiswa", mahasiswaRoutes);

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
