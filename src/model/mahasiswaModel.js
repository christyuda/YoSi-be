// src/model/mahasiswaModel.js
const mongoose = require("mongoose");

const revisiSchema = new mongoose.Schema({
  revisi_id: String,
  dosen_id: mongoose.Schema.Types.ObjectId,
  revisi_text: String,
  status: String,
  nilai: Number,
});
const mahasiswaSchema = new mongoose.Schema({
  npm: String,
  username: String,
  password: String,
  no_hp: String,
  nama_lengkap: String,
  alamat_lengkap: String,
  tanggal_lahir: Date,
  jenis_pengajuan_sidang: {
    type: String,
    enum: ["p1", "p2", "p3", "i1", "i2", "ta"],
    default: "Belum ada jadwal sidang",
  },
  draft_sidang: String,
  url_aplikasi: String,
  revisi: [revisiSchema],

  nilai: Number,
  role: {
    type: String,
    default: "mahasiswa",
  },
});

module.exports = mongoose.model("Mahasiswa", mahasiswaSchema);
