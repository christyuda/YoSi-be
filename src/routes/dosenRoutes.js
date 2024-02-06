// src/routes/dosenRoutes.js
const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  getAllMahasiswaByDosen,
  addRevisiByDosen,
  approveRevisi,
  addNilai,
  getDosenRole,
  assignPenguji,
  addRevisi,
  approveSidang,
  giveNilai,
} = require("../controllers/dosenController");

const router = express.Router();

router.use(authenticateToken);

router.post("/add-revisi", addRevisi);
router.post("/approve", authenticateToken, approveSidang);
router.post("/nilai", authenticateToken, giveNilai);

router.post("/uji-sidang", assignPenguji);
router.get("/menguji-mahasiswa", getAllMahasiswaByDosen);
router.post("/:npm/revisi", addRevisiByDosen);
router.patch("/:npm/revisi/:revisiId/approve", approveRevisi);
router.post("/:npm/nilai", addNilai);
router.get("/role", getDosenRole);

module.exports = router;
