const { Op } = require('sequelize');
const { Balita, User, Pertumbuhan, Kunjungan, Imunisasi } = require('../models');

const hitungUsia = (tanggalLahir) => {
  const lahir = new Date(tanggalLahir);
  const sekarang = new Date();
  return (sekarang.getFullYear() - lahir.getFullYear()) * 12 +
    (sekarang.getMonth() - lahir.getMonth());
};

const getAll = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const where = { is_active: true };
    if (req.user.role === 'orang_tua') where.user_id = req.user.id;
    if (search) where.nama = { [Op.like]: `%${search}%` };

    const { count, rows } = await Balita.findAndCountAll({
      where,
      include: [{ model: User, as: 'orang_tua', attributes: ['id', 'nama', 'email', 'no_telepon'] }],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    const data = rows.map((b) => ({ ...b.toJSON(), usia_bulan: hitungUsia(b.tanggal_lahir) }));
    return res.json({ success: true, data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role === 'orang_tua') where.user_id = req.user.id;
    const balita = await Balita.findOne({
      where,
      include: [{ model: User, as: 'orang_tua', attributes: ['id', 'nama', 'email', 'no_telepon'] }],
    });
    if (!balita) return res.status(404).json({ success: false, message: 'Balita tidak ditemukan' });
    return res.json({ success: true, data: { ...balita.toJSON(), usia_bulan: hitungUsia(balita.tanggal_lahir) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { nama, tanggal_lahir, jenis_kelamin, nik, nama_ayah, nama_ibu, alamat, user_id } = req.body;
    const assignedUserId = req.user.role === 'admin' && user_id ? user_id : req.user.id;
    const balita = await Balita.create({ nama, tanggal_lahir, jenis_kelamin, nik, nama_ayah, nama_ibu, alamat, user_id: assignedUserId });
    return res.status(201).json({ success: true, message: 'Data balita berhasil ditambahkan', data: balita });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role === 'orang_tua') where.user_id = req.user.id;
    const balita = await Balita.findOne({ where });
    if (!balita) return res.status(404).json({ success: false, message: 'Balita tidak ditemukan' });
    await balita.update(req.body);
    return res.json({ success: true, message: 'Data balita berhasil diupdate', data: balita });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const balita = await Balita.findByPk(req.params.id);
    if (!balita) return res.status(404).json({ success: false, message: 'Balita tidak ditemukan' });
    await balita.update({ is_active: false });
    return res.json({ success: true, message: 'Data balita berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getRingkasan = async (req, res) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role === 'orang_tua') where.user_id = req.user.id;
    const balita = await Balita.findOne({ where });
    if (!balita) return res.status(404).json({ success: false, message: 'Balita tidak ditemukan' });

    const [totalKunjungan, pertumbuhanTerakhir, imunisasiTerakhir] = await Promise.all([
      Kunjungan.count({ where: { balita_id: balita.id } }),
      Pertumbuhan.findOne({ where: { balita_id: balita.id }, order: [['tanggal_ukur', 'DESC']] }),
      Imunisasi.findAll({ where: { balita_id: balita.id }, order: [['tanggal_pemberian', 'DESC']], limit: 5 }),
    ]);

    return res.json({
      success: true,
      data: {
        balita: { ...balita.toJSON(), usia_bulan: hitungUsia(balita.tanggal_lahir) },
        total_kunjungan: totalKunjungan,
        pertumbuhan_terakhir: pertumbuhanTerakhir,
        imunisasi_terakhir: imunisasiTerakhir,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove, getRingkasan };