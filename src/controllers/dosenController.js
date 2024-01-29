// src/controllers/dosenController.js
const Dosen = require("../model/dosenModel");
const Mahasiswa = require("../model/mahasiswaModel");

async function getAllMengujiMahasiswa(req, res) {
  const { dosenId } = req.user;
  try {
    const dosen = await Dosen.findById(dosenId).populate(
      "menguji_mahasiswa.mahasiswa_id"
    );
    const mahasiswaList = dosen.menguji_mahasiswa.map(
      (menguji) => menguji.mahasiswa_id
    );
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

module.exports = {
  getAllMengujiMahasiswa,
  addRevisiByDosen,
  approveRevisi,
  addNilai,
  getDosenRole,
};
