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
  const { username, role } = req.user; // Mengambil informasi dari req.user

  try {
    // Cari mahasiswa berdasarkan NPM
    const mahasiswa = await Mahasiswa.findOne({ username });

    if (!mahasiswa) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    // Dapatkan data dari body request
    const {
      tgl_pengajuan,
      url_proposal,
      judul,
      pembimbing,
      tahun_akademik,
      jenis_sidang,
      penguji,
    } = req.body;

    // Cari dosen pembimbing berdasarkan NIDN
    const dosenPembimbing = await Dosen.findOne({ nidn: pembimbing });

    if (!dosenPembimbing) {
      return res.status(404).json({ error: "Dosen pembimbing not found" });
    }

    // Buat objek Sidang
    const sidang = new Sidang({
      mahasiswa_id: mahasiswa._id,
      npm: mahasiswa.npm,
      revisi_text: "",
      status: "pending",
      tgl_pengajuan,
      url_proposal,
      tahap: "",
      judul,
      pembimbing: dosenPembimbing.nidn,
      penguji: penguji || null,
      tahun_akademik,
      jenis_sidang,
    });

    // Simpan data Sidang
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
module.exports = {
  getAllMahasiswa,
  getMahasiswaByNPM,
  addRevisi,
  getRevisiById,
  deleteRevisi,
  getMahasiswaRole,
  daftarSidang,
  getAllDosen,
};
