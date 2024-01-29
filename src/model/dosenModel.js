// src/model/dosenModel.js
const mongoose = require("mongoose");

const dosenSchema = new mongoose.Schema({
  nidn: String,
  username: String,
  password: String,
  no_hp: String,
  nama_lengkap: String,
  alamat_lengkap: String,
  tanggal_lahir: Date,
  menguji_mahasiswa: [
    {
      mahasiswa_id: mongoose.Schema.Types.ObjectId,
      status: String,
    },
  ],
  role: {
    type: String,
    default: "dosen",
  },
});

module.exports = mongoose.model("Dosen", dosenSchema);
