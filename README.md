Alur proses bisnis pada aplikasi ini melibatkan dua jenis pengguna utama, yaitu Mahasiswa dan Dosen. Berikut adalah penjelasan alur proses bisnis dari beberapa endpoint yang telah diimplementasikan:

1. Registrasi Mahasiswa:
   Endpoint: POST /register
   Body (raw JSON):
   json
   Copy code
   {
   "role": "mahasiswa",
   "npm": "1234567890",
   "username": "mahasiswa_username",
   "password": "hashed_password",
   "no_hp": "1234567890",
   "nama_lengkap": "Nama Lengkap Mahasiswa",
   "alamat_lengkap": "Alamat Lengkap Mahasiswa",
   "tanggal_lahir": "2000-01-01",
   "jenis_pengajuan_sidang": "p1", // Ganti dengan jenis yang sesuai
   "draft_sidang": "url_draft_sidang",
   "url_aplikasi": "url_aplikasi"
   }
   Proses:
   Server melakukan pemeriksaan apakah username atau npm sudah ada.
   Jika belum ada, maka server menyimpan data mahasiswa baru ke dalam database.
2. Registrasi Dosen:
   Endpoint: POST /register
   Body (raw JSON):
   json
   Copy code
   {
   "role": "dosen",
   "nidn": "0987654321",
   "username": "dosen_username",
   "password": "hashed_password",
   "no_hp": "0987654321",
   "nama_lengkap": "Nama Lengkap Dosen",
   "alamat_lengkap": "Alamat Lengkap Dosen",
   "tanggal_lahir": "1980-01-01"
   }
   Proses:
   Server melakukan pemeriksaan apakah username atau nidn sudah ada.
   Jika belum ada, maka server menyimpan data dosen baru ke dalam database.
3. Login:
   Endpoint: POST /login
   Body (raw JSON):
   json
   Copy code
   {
   "username": "mahasiswa_username",
   "password": "hashed_password",
   "role": "mahasiswa"
   }
   atau
   json
   Copy code
   {
   "username": "dosen_username",
   "password": "hashed_password",
   "role": "dosen"
   }
   Proses:
   Server memeriksa apakah username dan password yang diberikan sesuai.
   Jika sesuai, server menghasilkan token JWT yang akan digunakan untuk otorisasi pada permintaan selanjutnya.
4. Mahasiswa Menambahkan Revisi:
   Endpoint: POST /mahasiswa/:id/revisi
   Body (raw JSON):
   json
   Copy code
   {
   "revisi_text": "Isi revisi yang diberikan oleh mahasiswa",
   "dosen_id": "dosen_id"
   }
   Proses:
   Server memeriksa apakah mahasiswa dengan id tertentu ada dalam database.
   Jika ada, server menambahkan revisi yang diberikan oleh mahasiswa ke dalam array revisi mahasiswa tersebut.
5. Dosen Menambahkan Revisi:
   Endpoint: POST /dosen/:id/revisi
   Body (raw JSON):
   json
   Copy code
   {
   "revisi_text": "Isi revisi yang diberikan oleh dosen"
   }
   Proses:
   Server memeriksa apakah dosen dengan id tertentu ada dalam database.
   Jika ada, server menambahkan revisi yang diberikan oleh dosen ke dalam array revisi mahasiswa yang diuji oleh dosen tersebut.
   Selain itu, status revisi dan status ujian mahasiswa juga diperbarui.
6. Dosen Menyetujui Revisi:
   Endpoint: PUT /dosen/:id/revisi/:revisiId/approve
   Proses:
   Server memeriksa apakah dosen dengan id tertentu dan revisi dengan revisiId tertentu ada dalam database.
   Jika ada, server menyetujui revisi dan memperbarui status revisi serta status ujian mahasiswa yang bersangkutan.
7. Dosen Menambahkan Nilai:
   Endpoint: POST /dosen/:id/nilai
   Body (raw JSON):
   json
   Copy code
   {
   "nilai": 85
   }
   Proses:
   Server memeriksa apakah mahasiswa dengan id tertentu ada dalam database.
   Jika ada, server menambahkan nilai pada revisi mahasiswa yang telah diapprove oleh dosen.
   Setiap endpoint memiliki proses verifikasi dan validasi data untuk memastikan integritas data dan keamanan sistem. Pastikan untuk memahami dan memastikan pengaturan keamanan yang cukup, seperti melindungi endpoint dengan autentikasi dan otorisasi yang sesuai.
