const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('orang_tua', 'admin'), allowNull: false, defaultValue: 'orang_tua' },
  no_telepon: { type: DataTypes.STRING(20) },
  alamat: { type: DataTypes.TEXT },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'users',
});

User.prototype.validatePassword = function (plain) {
  return this.password === plain;
};

const Balita = sequelize.define('Balita', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  nama: { type: DataTypes.STRING(100), allowNull: false },
  tanggal_lahir: { type: DataTypes.DATEONLY, allowNull: false },
  jenis_kelamin: { type: DataTypes.ENUM('L', 'P'), allowNull: false },
  nik: { type: DataTypes.STRING(20), unique: true },
  nama_ayah: { type: DataTypes.STRING(100) },
  nama_ibu: { type: DataTypes.STRING(100) },
  alamat: { type: DataTypes.TEXT },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'balita' });

const Kunjungan = sequelize.define('Kunjungan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  balita_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // Informasi Kunjungan
  tanggal_kunjungan: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  jam_kunjungan: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  jenis_kunjungan: {
    type: DataTypes.ENUM('rutin', 'imunisasi', 'konsultasi', 'lainnya'),
    defaultValue: 'rutin',
  },
  status: {
    type: DataTypes.ENUM('hadir', 'terlewat'),
    defaultValue: 'hadir',
  },
  petugas: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

  // Pemeriksaan Fisik
  berat_badan: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  tinggi_badan: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  lingkar_kepala: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  status_gizi: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  suhu_tubuh: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true,
  },

  // Data tambahan dari form
  imunisasi: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  kondisi: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  // Tindak lanjut
  jadwal_berikutnya: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  imunisasi_berikutnya: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  lokasi_posyandu: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  pengingat_orangtua: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // Catatan Petugas
  catatan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  }, {
    tableName: 'kunjungan',
  }),
  const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);

    const user = await User.findOne({
      where: { email }
    });

    console.log("USER:", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    console.log("PASSWORD DB:", user.password);
    console.log("IS ACTIVE:", user.is_active);

    const valid = user.validatePassword(password);

    console.log("VALID:", valid);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Password tidak cocok"
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      data: user
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const Pertumbuhan = sequelize.define('Pertumbuhan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  balita_id: { type: DataTypes.INTEGER, allowNull: false },
  admin_id: { type: DataTypes.INTEGER, allowNull: false },
  tanggal_ukur: { type: DataTypes.DATEONLY, allowNull: false },
  berat_badan: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  tinggi_badan: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  lingkar_kepala: { type: DataTypes.DECIMAL(5, 2) },
  status_berat: { type: DataTypes.ENUM('sangat_kurang', 'kurang', 'normal', 'lebih') },
  status_tinggi: { type: DataTypes.ENUM('sangat_pendek', 'pendek', 'normal', 'tinggi') },
  status_gizi: { type: DataTypes.ENUM('gizi_buruk', 'gizi_kurang', 'gizi_baik', 'gizi_lebih', 'obesitas') },
  is_stunting: { type: DataTypes.BOOLEAN, defaultValue: false },
  catatan: { type: DataTypes.TEXT },
}, { tableName: 'pertumbuhan' });

const Imunisasi = sequelize.define('Imunisasi', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  balita_id: { type: DataTypes.INTEGER, allowNull: false },
  admin_id: { type: DataTypes.INTEGER, allowNull: false },
  nama_vaksin: { type: DataTypes.STRING(100), allowNull: false },
  tanggal_pemberian: { type: DataTypes.DATEONLY, allowNull: false },
  dosis: { type: DataTypes.STRING(20) },
  batch_vaksin: { type: DataTypes.STRING(50) },
  tanggal_jadwal_berikutnya: { type: DataTypes.DATEONLY },
  catatan: { type: DataTypes.TEXT },
  reaksi: { type: DataTypes.TEXT },
}, { tableName: 'imunisasi' });

const Jadwal = sequelize.define('Jadwal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  admin_id: { type: DataTypes.INTEGER, allowNull: false },
  judul: { type: DataTypes.STRING(200), allowNull: false },
  deskripsi: { type: DataTypes.TEXT },
  jenis: { type: DataTypes.ENUM('penimbangan', 'imunisasi', 'makanan_tambahan', 'penyuluhan', 'lainnya'), allowNull: false },
  tanggal: { type: DataTypes.DATEONLY, allowNull: false },
  waktu_mulai: { type: DataTypes.TIME },
  waktu_selesai: { type: DataTypes.TIME },
  lokasi: { type: DataTypes.STRING(200) },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'jadwal' });

const Notifikasi = sequelize.define('Notifikasi', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER },
  balita_id: { type: DataTypes.INTEGER },
  jadwal_id: { type: DataTypes.INTEGER },
  judul: { type: DataTypes.STRING(200), allowNull: false },
  pesan: { type: DataTypes.TEXT, allowNull: false },
  tipe: { type: DataTypes.ENUM('imunisasi', 'jadwal', 'pertumbuhan', 'umum'), defaultValue: 'umum' },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  tanggal_kirim: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'notifikasi' });

const Rekomendasi = sequelize.define('Rekomendasi', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  balita_id: { type: DataTypes.INTEGER, allowNull: false },
  dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
  konten: { type: DataTypes.TEXT, allowNull: false },
  sumber: { type: DataTypes.ENUM('llm', 'manual'), defaultValue: 'llm' },
  prompt_yang_digunakan: { type: DataTypes.TEXT },
  is_visible_to_ortu: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'rekomendasi' });

const ChatHistory = sequelize.define('ChatHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  balita_id: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
  pesan: { type: DataTypes.TEXT, allowNull: false },
  session_id: { type: DataTypes.STRING(100) },
}, { tableName: 'chat_history' });

const Penanganan = sequelize.define('Penanganan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  balita_id: { type: DataTypes.INTEGER, allowNull: false },
  admin_id: { type: DataTypes.INTEGER, allowNull: false },
  tanggal: { type: DataTypes.DATEONLY, allowNull: false },
  jenis_masalah: { type: DataTypes.ENUM('kurang_berat_badan', 'kurang_tinggi_badan', 'stunting', 'gizi_buruk', 'lainnya') },
  tindakan: { type: DataTypes.TEXT, allowNull: false },
  perkembangan: { type: DataTypes.TEXT },
  dilakukan_oleh: { type: DataTypes.ENUM('orang_tua', 'tenaga_kesehatan', 'keduanya'), defaultValue: 'orang_tua' },
}, { tableName: 'penanganan' });

// Relasi
User.hasMany(Balita, { foreignKey: 'user_id', as: 'balita' });
Balita.belongsTo(User, { foreignKey: 'user_id', as: 'orang_tua' });

Balita.hasMany(Kunjungan, {
  foreignKey: 'balita_id',
  as: 'kunjungan',
})

Kunjungan.belongsTo(Balita, {
  foreignKey: 'balita_id',
  as: 'balita',
})

User.hasMany(Kunjungan, {
  foreignKey: 'admin_id',
  as: 'kunjungan_dibuat',
})

Kunjungan.belongsTo(User, {
  foreignKey: 'admin_id',
  as: 'admin',
})

Balita.hasMany(Pertumbuhan, { foreignKey: 'balita_id', as: 'riwayat_pertumbuhan' });
Pertumbuhan.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });
Pertumbuhan.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

Balita.hasMany(Imunisasi, { foreignKey: 'balita_id', as: 'riwayat_imunisasi' });
Imunisasi.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });
Imunisasi.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

User.hasMany(Jadwal, { foreignKey: 'admin_id', as: 'jadwal_dibuat' });
Jadwal.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

User.hasMany(Notifikasi, { foreignKey: 'user_id', as: 'notifikasi' });
Notifikasi.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Notifikasi.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });
Notifikasi.belongsTo(Jadwal, { foreignKey: 'jadwal_id', as: 'jadwal' });

Balita.hasMany(Rekomendasi, { foreignKey: 'balita_id', as: 'rekomendasi' });
Rekomendasi.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });
Rekomendasi.belongsTo(User, { foreignKey: 'dibuat_oleh', as: 'pembuat' });

User.hasMany(ChatHistory, { foreignKey: 'user_id', as: 'chat_history' });
ChatHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ChatHistory.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });

Balita.hasMany(Penanganan, { foreignKey: 'balita_id', as: 'penanganan' });
Penanganan.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });
Penanganan.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

module.exports = {
  User, Balita, Kunjungan, Pertumbuhan, Imunisasi,
  Jadwal, Notifikasi, Rekomendasi, ChatHistory, Penanganan,
};