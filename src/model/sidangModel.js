const mongoose = require("mongoose");

const sidangSchema = new mongoose.Schema({
  mahasiswa_id: { type: mongoose.Schema.Types.ObjectId, ref: "Mahasiswa" },
  revisi_text: [
    {
      text: { type: String, required: true },
      tgl_revisi: { type: Date, default: Date.now },
      batas_waktu: { type: Date },
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "Approved","Not Approved", "Completed"],
    default: "pending",
  },
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
  tgl_sidang: { type: Date },
  tgl_approve: { type: Date },
  nilai: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  
  
});

const Sidang = mongoose.model("Sidang", sidangSchema);

module.exports = Sidang;
