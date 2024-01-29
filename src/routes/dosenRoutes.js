// src/routes/dosenRoutes.js
const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  getAllMengujiMahasiswa,
  addRevisiByDosen,
  approveRevisi,
  addNilai,
  getDosenRole,
} = require("../controllers/dosenController");

const router = express.Router();

router.use(authenticateToken);

router.get("/menguji-mahasiswa", getAllMengujiMahasiswa);
router.post("/:npm/revisi", addRevisiByDosen);
router.patch("/:npm/revisi/:revisiId/approve", approveRevisi);
router.post("/:npm/nilai", addNilai);
router.get("/role", getDosenRole);

module.exports = router;
