// src/routes/mahasiswaRoutes.js
const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  getAllMahasiswa,
  getMahasiswaByNPM,
  addRevisi,
  getRevisiById,
  deleteRevisi,
  getMahasiswaRole,
} = require("../controllers/mahasiswaController");

const router = express.Router();

router.use(authenticateToken);

router.get("/", getAllMahasiswa);
router.get("/:npm", getMahasiswaByNPM);
router.post("/:npm/revisi", addRevisi);
router.get("/:npm/revisi/:revisiId", getRevisiById);
router.delete("/:npm/revisi/:revisiId", deleteRevisi);
router.get("/role", getMahasiswaRole);

module.exports = router;
