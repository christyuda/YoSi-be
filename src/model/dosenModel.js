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
      mahasiswa_id: { type: mongoose.Schema.Types.ObjectId, ref: "Mahasiswa" },
      status: {
        type: String,
        enum: ["pending", "approved"],
        default: "pending",
      },
    },
  ],
  role: {
    type: String,
    default: "dosen",
  },
  is_koordinator: {
    type: Boolean,
    default: false, // Default status tidak sebagai koordinator
  },
});

module.exports = mongoose.model("Dosen", dosenSchema);
