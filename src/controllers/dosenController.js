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

async function assignPenguji(req, res) {
  const { npm } = req.body; // Get npm directly from the request body

  try {
    // Find the Mahasiswa based on npm
    const mahasiswa = await Mahasiswa.findOne({ npm });

    if (!mahasiswa) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    // Find the Sidang document for the specified mahasiswa_id
    const sidang = await Sidang.findOne({
      mahasiswa_id: mahasiswa._id,
      penguji: null,
    });

    if (!sidang) {
      return res
        .status(404)
        .json({ error: "Sidang not found or penguji already assigned" });
    }

    // Update the Sidang document with the Dosen's nidn as penguji
    sidang.penguji = req.user.nidn; // Assuming req.user.nidn contains the Dosen's nidn
    sidang.status = "pending"; // You can update other fields if needed

    // Save the updated Sidang document
    await sidang.save();

    res.json({ message: "Sidang updated for uji" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function setKoordinatorStatus(req, res) {
  const { nidn } = req.user;

  try {
    // Cari dosen berdasarkan ID
    const dosen = await Dosen.findOne({ nidn });

    if (!dosen) {
      return res.status(404).json({ error: "Dosen not found" });
    }

    // Cek apakah sudah ada koordinator lain
    const existingKoordinator = await Dosen.findOne({
      is_koordinator: true,
      _id: { $ne: dosen._id },
    });

    if (existingKoordinator) {
      const { nama_lengkap, nidn } = existingKoordinator;

      return res.status(409).json({
        error: "Sudah ada koordinator lain",
        koordinator: { nama_lengkap, nidn },
      });
    }

    // Set status koordinator menjadi true
    dosen.is_koordinator = true;

    // Simpan perubahan
    await dosen.save();

    res.json({ message: "Status koordinator berhasil diubah" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  setKoordinatorStatus,
  getAllMahasiswaByDosen,
  addRevisiByDosen,
  approveRevisi,
  addNilai,
  getDosenRole,
  assignPenguji,
};
