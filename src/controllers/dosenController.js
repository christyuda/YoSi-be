// src/controllers/dosenController.js
const Dosen = require("../model/dosenModel");
const Mahasiswa = require("../model/mahasiswaModel");
const Sidang = require("../model/sidangModel");

async function getAllMahasiswaByDosen(req, res) {
  const { dosenId } = req.user;

  try {
    const dosen = await Dosen.findById(dosenId);

    if (!dosen) {
      return res.status(404).json({ error: "Dosen not found" });
    }

    const mahasiswaList = [];

    for (const mengujiEntry of dosen.menguji_mahasiswa) {
      const mahasiswa = await Mahasiswa.findById(mengujiEntry.mahasiswa_id);

      if (mahasiswa) {
        mahasiswaList.push(mahasiswa);
      }
    }

    res.json(mahasiswaList);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function addRevisiByDosen(req, res) {
  const { id } = req.params;
  const { revisi_text } = req.body;
  const { dosenId } = req.user;

  try {
    const dosen = await Dosen.findById(dosenId);
    const mahasiswa = await Mahasiswa.findById(id);

    const revisi = {
      dosen_id: dosenId,
      revisi_text,
      status: "pending",
      nilai: 0,
    };

    mahasiswa.revisi.push(revisi);
    dosen.menguji_mahasiswa.push({ mahasiswa_id: id, status: "pending" });

    await mahasiswa.save();
    await dosen.save();

    res.json({ message: "Revisi berhasil ditambahkan oleh dosen" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function approveRevisi(req, res) {
  const { id, revisiId } = req.params;
  const { dosenId } = req.user;

  try {
    const dosen = await Dosen.findById(dosenId);
    const mahasiswa = await Mahasiswa.findById(id);

    const revisi = mahasiswa.revisi.id(revisiId);
    revisi.status = "approved";

    const mengujiIndex = dosen.menguji_mahasiswa.findIndex((menguji) =>
      menguji.mahasiswa_id.equals(id)
    );
    dosen.menguji_mahasiswa[mengujiIndex].status = "approved";

    await mahasiswa.save();
    await dosen.save();

    res.json({ message: "Revisi berhasil diapprove oleh dosen" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function addNilai(req, res) {
  const { id } = req.params;
  const { nilai } = req.body;
  const { dosenId } = req.user;

  try {
    const mahasiswa = await Mahasiswa.findById(id);
    const revisi = mahasiswa.revisi.find(
      (r) => r.dosen_id.equals(dosenId) && r.status === "approved"
    );

    if (!revisi) {
      return res
        .status(400)
        .json({ error: "Revisi belum diapprove oleh dosen" });
    }

    revisi.nilai = nilai;
    await mahasiswa.save();

    res.json({ message: "Nilai berhasil ditambahkan oleh dosen" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function getDosenRole(req, res) {
  try {
    // Mendapatkan peran dosen berdasarkan username dari token
    const dosen = await Dosen.findOne({ username: req.user.username });

    if (!dosen) {
      return res.status(404).json({ error: "Dosen not found" });
    }

    const role = dosen.role;
    res.status(200).json({ role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//v2
async function assignPenguji(req, res) {
  const { npm, jenis_sidang, tahun_akademik, tgl_sidang } = req.body;

  try {
    // Temukan Mahasiswa berdasarkan npm
    const mahasiswa = await Mahasiswa.findOne({ npm });

    if (!mahasiswa) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    // Temukan dokumen Sidang untuk mahasiswa_id tertentu
    const sidang = await Sidang.findOne({
      mahasiswa_id: mahasiswa._id,
      penguji: null || "",
      jenis_sidang: jenis_sidang,
      tahun_akademik: tahun_akademik,
      tgl_sidang: { $exists: false },
    });

    if (!sidang) {
      return res.status(404).json({
        error: "Maaf, sidang tidak ditemukan atau penguji sudah ditetapkan",
        detail: {
          nidn: req.user.nidn,
          nama_lengkap: req.user?.nama_lengkap,
        },
      });
    }

    // Perbarui dokumen Sidang dengan nidn Dosen dari token sebagai penguji
    sidang.penguji = req.user.nidn;
    sidang.status = "pending";
    sidang.tahap = "sidang";
    sidang.tgl_sidang = tgl_sidang;

    // Simpan dokumen Sidang yang diperbarui
    await sidang.save();

    res.json({ message: "Sidang updated for uji" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function addRevisi(req, res) {
  const { npm, revisi_text, tgl_sidang, jenis_sidang, batas_waktu_revisi } =
    req.body;

  try {
    // Temukan Mahasiswa berdasarkan npm
    const mahasiswa = await Mahasiswa.findOne({ npm });

    if (!mahasiswa) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    // Temukan dokumen Sidang untuk mahasiswa_id tertentu, penguji, tgl_sidang, dan jenis_sidang
    const sidang = await Sidang.findOne({
      mahasiswa_id: mahasiswa._id,
      penguji: req.user.nidn,
      tgl_sidang: new Date(tgl_sidang),
      jenis_sidang,
    });

    if (!sidang) {
      return res.status(404).json({
        error:
          "Maaf, sidang tidak ditemukan atau Anda bukan penguji untuk mahasiswa ini pada tanggal dan jenis sidang tersebut",
      });
    }

    // Perbarui dokumen Sidang dengan revisi_text dan batas_waktu_revisi
    sidang.revisi_text.push({
      text: revisi_text,
      tgl_revisi: new Date(),
      batas_waktu: new Date(batas_waktu_revisi),
    });

    sidang.status = "pending";
    sidang.tahap = "Revisian";

    // Simpan dokumen Sidang yang diperbarui
    await sidang.save();

    res.json({ message: "Revisi added to Sidang" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function approveSidang(req, res) {
  const { npm, tgl_sidang, jenis_sidang } = req.body;

  try {
    // Cari Sidang berdasarkan npm, tanggal sidang, dan jenis sidang
    const sidang = await Sidang.findOne({
      npm,
      tgl_sidang: new Date(tgl_sidang),
      jenis_sidang,
      penguji: req.user.nidn, // Pastikan dosen yang melakukan approve adalah penguji yang sesuai
      status: "pending", // Hanya sidang yang berstatus pending yang dapat diapprove
    });

    if (!sidang) {
      return res.status(404).json({
        error: "Sidang tidak ditemukan atau tidak dapat diapprove",
      });
    }

    // Update status sidang menjadi approved
    sidang.status = "approved";
    sidang.tgl_approve = new Date();
    sidang.tahap = "Penilaian Sidang Silahkan ";

    // Simpan perubahan
    await sidang.save();

    res.json({ message: "Sidang berhasil diapprove" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function giveNilai(req, res) {
  const { npm, jenis_sidang, nilai } = req.body;

  try {
    // Temukan Sidang yang memenuhi kriteria
    const sidang = await Sidang.findOne({
      npm,
      jenis_sidang,
      status: "approved", // Hanya yang sudah diapprove yang dapat diberikan nilai
    });

    if (!sidang) {
      return res.status(404).json({
        error: "Sidang not found or not yet approved",
      });
    }

    // Berikan nilai pada Sidang
    sidang.nilai = nilai;
    sidang.status = "completed";
    sidang.tahap =
      "Sidang Selesai Terimakasih Sudah Mengikuti Peraturan Dengan Baik";

    // Simpan perubahan pada Sidang
    await sidang.save();

    res.json({ message: "Nilai added to Sidang" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getAllMahasiswaByDosen,
  addRevisiByDosen,
  approveRevisi,
  addNilai,
  getDosenRole,
  assignPenguji,
  addRevisi,
  approveSidang,
  giveNilai,
};
