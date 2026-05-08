const { Pertumbuhan, Balita } = require('../models');
const { Op } = require('sequelize');

const hitungUsiaBulan = (tanggalLahir) => {
  const lahir = new Date(tanggalLahir);
  const sekarang = new Date();
  return (sekarang.getFullYear() - lahir.getFullYear()) * 12 +
    (sekarang.getMonth() - lahir.getMonth());
};

const klasifikasiStatus = (usia_bulan, jenis_kelamin, berat_badan, tinggi_badan) => {
  const is_stunting = tinggi_badan < (45 + usia_bulan * 0.7);
  let status_berat = 'normal', status_tinggi = 'normal', status_gizi = 'gizi_baik';
  if (is_stunting) status_tinggi = 'pendek';
  if (berat_badan < (3.5 + usia_bulan * 0.18)) status_berat = 'kurang';
  if (berat_badan > (5 + usia_bulan * 0.4)) status_berat = 'lebih';
  return { status_berat, status_tinggi, status_gizi, is_stunting };
};

const getByBalita = async (req, res) => {
  try {
    const where = { balita_id: req.params.balita_id };
    if (req.query.from || req.query.to) {
      where.tanggal_ukur = {};
      if (req.query.from) where.tanggal_ukur[Op.gte] = req.query.from;
      if (req.query.to) where.tanggal_ukur[Op.lte] = req.query.to;
    }
    const data = await Pertumbuhan.findAll({ where, order: [['tanggal_ukur', 'ASC']] });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const balita = await Balita.findByPk(req.params.balita_id);
    if (!balita) return res.status(404).json({ success: false, message: 'Balita tidak ditemukan' });

    const { tanggal_ukur, berat_badan, tinggi_badan, lingkar_kepala, catatan } = req.body;
    const usia_bulan = hitungUsiaBulan(balita.tanggal_lahir);
    const status = klasifikasiStatus(usia_bulan, balita.jenis_kelamin, berat_badan, tinggi_badan);

    const pertumbuhan = await Pertumbuhan.create({
      balita_id: req.params.balita_id,
      admin_id: req.user.id,
      tanggal_ukur, berat_badan, tinggi_badan, lingkar_kepala, catatan,
      ...status,
    });
    return res.status(201).json({ success: true, message: 'Data pertumbuhan berhasil dicatat', data: pertumbuhan });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const p = await Pertumbuhan.findByPk(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    await p.update(req.body);
    return res.json({ success: true, message: 'Data pertumbuhan berhasil diupdate', data: p });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const p = await Pertumbuhan.findByPk(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    await p.destroy();
    return res.json({ success: true, message: 'Data pertumbuhan berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getByBalita, create, update, remove };