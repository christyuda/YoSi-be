const bcrypt = require("bcrypt");
const { createToken } = require("../config/jwtConfig");
const Mahasiswa = require("../model/mahasiswaModel");
const Dosen = require("../model/dosenModel");

async function register(req, res) {
  try {
    const { role, ...userData } = req.body;

    // Check if the username already exists
    const existingUser = await getUserByUsername(userData.username, role);

    if (existingUser) {
      return res.status(409).json({ error: "Duplicate username" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    if (role === "mahasiswa") {
      userData.jenis_pengajuan_sidang = req.body.jenis_pengajuan_sidang;
    }

    const newUser =
      role === "mahasiswa"
        ? new Mahasiswa({ ...userData, role, password: hashedPassword })
        : new Dosen({ ...userData, role, password: hashedPassword });

    await newUser.save();

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function login(req, res) {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Bad request",
        statusCode: 400,
        error: "Username dan password harus diisi"});
    }

    // Log informasi login ke konsol
    console.log(`Login request: username=${username}, role=${role}`);

    // Cari user berdasarkan username
    const user = await getUserByUsername(username, role);

    if (!user) {
      // Jika user tidak ditemukan, berikan respons 401 (Unauthorized)
      console.log(`User not found for username=${username}`);
      return res.status(404).json({ message: "User Not Found",
      statusCode: 404,
      error: `Akun tidak sesuai pastikan username =${username} benar`});
    }

    // Periksa kesesuaian password menggunakan bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Jika password tidak sesuai, berikan respons 401 (Unauthorized)
      console.log(`Invalid password for username=${username}`);
      return res.status(404).json({ message: "Not Found User",
      statusCode: 404,
      error: `Akun tidak sesuai pastikan username = ${username} memasukan password yang benar`});
    }

    // Jika username dan password valid, generate token
    const token = createToken({
      username: user.username,
      role : user.role,
      nidn: user?.nidn,
      npm: user?.npm,
      nama_lengkap: user?.nama_lengkap || "nama lengkap tidak ada",
    });
    console.log(token);

    // Log informasi sukses login
    console.log(`Successful login for username=${username}, role=${role}`);

    // Berikan respons 200 (OK) bersama dengan token
    res.status(200).json({  
    message: "Login successful",
    statusCode: 200,
    role: role,
    token: token});

  } catch (error) {
    // Tangani kesalahan server dengan memberikan respons 500 (Internal Server Error)
    console.error(error);
    res.status(500).json({message: "Internal Server Error ni",
    statusCode: 500,});
  }
}
async function getUserByUsername(username, role) {
  const lowercaseRole = role.toLowerCase(); // Mengonversi role ke huruf kecil
  const UserModel = lowercaseRole === "mahasiswa" ? Mahasiswa : Dosen;
  return await UserModel.findOne({ username });
}

module.exports = { register, login };
