const mongoose = require("mongoose");

const sidangSchema = new mongoose.Schema({
  mahasiswa_id: { type: mongoose.Schema.Types.ObjectId, ref: "Mahasiswa" },
  revisi_text: [{ type: String }],
  status: { type: String, enum: ["pending", "approved"], default: "pending" },
  jenis_sidang: { type: String, default: "DefaultSidang" },
  npm: { type: String },
  nidn: { type: String },
  tgl_pengajuan: { type: Date },
  url_proposal: { type: String },
  judul: { type: String },
  tahap: { type: String, default: "" },
  pembimbing: { type: String, ref: "Dosen" },
  penguji: { type: String },
  tahun_akademik: { type: String },
});

const Sidang = mongoose.model("Sidang", sidangSchema);

module.exports = Sidang;
