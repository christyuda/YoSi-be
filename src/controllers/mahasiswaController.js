// src/controllers/mahasiswaController.js
const Mahasiswa = require("../model/mahasiswaModel");
const Dosen = require("../model/dosenModel");
const Sidang = require("../model/sidangModel");

async function getAllMahasiswa(req, res) {
  try {
    const mahasiswaList = await Mahasiswa.find();
    res.json(mahasiswaList);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function getMahasiswaByNPM(req, res) {
  const { npm } = req.params;
  try {
    const mahasiswa = await Mahasiswa.findOne({ npm });
    if (!mahasiswa) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }
    res.json(mahasiswa);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function addRevisi(req, res) {
  const { npm } = req.params;
  const { revisi_text, dosen_nidn } = req.body;

  try {
    // Cari Mahasiswa berdasarkan NPM
    const mahasiswa = await Mahasiswa.findOne({ npm });

    if (!mahasiswa) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    // Cari Dosen Penguji berdasarkan NIDN
    const dosenPenguji = await Dosen.findOne({
      nidn: dosen_nidn,
      role: "dosen",
    });

    if (!dosenPenguji) {
      return res.status(404).json({ error: "Dosen Penguji not found" });
    }

    // Tambahkan revisi berdasarkan Dosen Penguji
    const idnyarevisi = new Date().getTime().toString();

    mahasiswa.revisi.push({
      revisi_id: idnyarevisi,

      dosen_id: dosenPenguji._id.toString(),
      revisi_text,
      status: "pending",
      nilai: 0,
    });

    await mahasiswa.save();
    res.json({ message: "Revisi berhasil ditambahkan", idnyarevisi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function getRevisiById(req, res) {
  const { npm, revisiId } = req.params;
  try {
    const mahasiswa = await Mahasiswa.findOne({
      npm,
      "revisi.revisi_id": revisiId,
    });

    if (!mahasiswa) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    const revisi = mahasiswa.revisi.find(
      (revisi) => revisi.revisi_id === revisiId
    );

    if (!revisi) {
      return res.status(404).json({ error: "Revisi not found" });
    }

    res.json(revisi);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function deleteRevisi(req, res) {
  const { npm, revisiId } = req.params;
  try {
    const mahasiswa = await Mahasiswa.findOne({ npm });

    if (!mahasiswa) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    const revisi = mahasiswa.revisi.find((r) => r.revisi_id === revisiId);

    if (!revisi) {
      return res.status(404).json({ error: "Revisi not found" });
    }

    // Menghapus revisi dari array revisi
    mahasiswa.revisi.pull(revisi);
    await mahasiswa.save();

    res.json({ message: "Revisi berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getSidangByNPM(req, res) {
  const { npm } = req.params;

  try {
    // Cari Mahasiswa berdasarkan NPM
    const mahasiswa = await Mahasiswa.findOne({ npm });

    if (!mahasiswa) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    // Cari Sidang berdasarkan mahasiswa_id
    const sidang = await Sidang.findOne({ mahasiswa_id: mahasiswa._id });

    if (!sidang) {
      return res
        .status(404)
        .json({ error: "Sidang not found for this Mahasiswa" });
    }

    res.json({ sidang });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getMahasiswaRole(req, res) {
  try {
    // Mendapatkan peran mahasiswa berdasarkan username dari token
    const mahasiswa = await Mahasiswa.findOne({ username: req.user.username });

    if (!mahasiswa) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    const role = mahasiswa.role;
    res.status(200).json({ role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function daftarSidang(req, res) {
  const { username, role } = req.user;

  try {
    const mahasiswa = await Mahasiswa.findOne({ username });
    if (!mahasiswa) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    const {
      url_proposal,
      judul,
      pembimbing,
      tahun_akademik,
      jenis_sidang,
      penguji,
      revisi_text,
    } = req.body;

    const dosenPembimbing = await Dosen.findOne({ nidn: pembimbing });
    if (!dosenPembimbing) {
      return res.status(404).json({ error: "Dosen pembimbing not found" });
    }

    // Memvalidasi kuota penguji berdasarkan tipe sidang
    const pengujiCount = await Sidang.countDocuments({ jenis_sidang, penguji });
    const pengujiSelected = await Dosen.findOne({ nidn: penguji });
    if (!pengujiSelected) {
      return res.status(404).json({ error: "Dosen penguji not found" });
    }
    if (pengujiCount >= 2) {
      return res.status(400).json({ error: "Kuota penguji telah penuh" });
    }

    const tgl_pengajuan = new Date();

    const sidang = new Sidang({
      mahasiswa_id: mahasiswa._id,
      npm: mahasiswa.npm,
      revisi_text: revisi_text,
      status: "pending",
      tgl_pengajuan,
      url_proposal,
      tahap: "Pengajuan Sidang",
      judul,
      pembimbing: dosenPembimbing.nidn,
      penguji: pengujiSelected.nidn,
      tahun_akademik,
      jenis_sidang,
      tgl_sidang: "",
      tgl_approve: "",
      createdAt: new Date(),
    });

    // Mengurangi kuota penguji
    pengujiSelected.kuota -= 1;
    await pengujiSelected.save();

    await sidang.save();

    res.json({ message: "Pendaftaran sidang berhasil" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllDosen(req, res) {
  try {
    const dosenList = await Dosen.find();
    res.json(dosenList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
// Di dalam mahasiswaController.js
async function getSidangByNPM(req, res) {
  const npm = req.user.npm;

  try {
    // Cari tabel sidang berdasarkan npm
    const sidangList = await Sidang.find({ npm });

    if (!sidangList || sidangList.length === 0) {
      return res
        .status(404)
        .json({ error: "Tidak ada tabel sidang ditemukan" });
    }

    res.json(sidangList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getTabelSidangById(req, res) {
  const npm = req.user.npm;

  const sidangId = req.params.sidangId;

  try {
    // Cari tabel sidang berdasarkan npm dan id sidang
    const sidang = await Sidang.findOne({ npm, _id: sidangId });

    if (!sidang) {
      return res.status(404).json({
        message: "Sidang tidak ditemukan",
        status: "error",
        data: null,
      });
    }

    res.json({
      message: "Sidang ditemukan",
      status: "success",
      data: {
        _id: sidang._id,
        mahasiswa_id: sidang.mahasiswa_id,
        status: sidang.status,
        jenis_sidang: sidang.jenis_sidang,
        npm: sidang.npm,
        tgl_pengajuan: sidang.tgl_pengajuan,
        url_proposal: sidang.url_proposal,
        judul: sidang.judul,
        tahap: sidang.tahap,
        pembimbing: sidang.pembimbing,
        penguji: sidang.penguji,
        tahun_akademik: sidang.tahun_akademik,
        tgl_sidang: sidang.tgl_sidang,
        revisi_text: sidang.revisi_text,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      status: "error",
      data: null,
    });
  }
}
module.exports = {
  getAllMahasiswa,
  getMahasiswaByNPM,
  addRevisi,
  getRevisiById,
  deleteRevisi,
  getMahasiswaRole,
  daftarSidang,
  getAllDosen,
  getSidangByNPM,
  getTabelSidangById,
};
