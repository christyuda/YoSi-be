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
  daftarSidang,
  getAllDosen,
} = require("../controllers/mahasiswaController");

const router = express.Router();

router.use(authenticateToken);

router.get("/", getAllMahasiswa);
router.post("/daftar-sidang", authenticateToken, daftarSidang);
router.get("/all-dosen", authenticateToken, getAllDosen);

router.get("/:npm", getMahasiswaByNPM);
router.post("/:npm/revisi", addRevisi);
router.get("/:npm/revisi/:revisiId", getRevisiById);
router.delete("/:npm/revisi/:revisiId", deleteRevisi);
router.get("/role", getMahasiswaRole);

module.exports = router;
