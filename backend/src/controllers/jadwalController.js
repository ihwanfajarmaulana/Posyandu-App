const { Jadwal, User } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
  try {
    const { jenis, from, to, page = 1, limit = 10 } = req.query;
    const where = { is_active: true };
    if (jenis) where.jenis = jenis;
    if (from || to) {
      where.tanggal = {};
      if (from) where.tanggal[Op.gte] = from;
      if (to) where.tanggal[Op.lte] = to;
    }
    const { count, rows } = await Jadwal.findAndCountAll({
      where,
      include: [{ model: User, as: 'admin', attributes: ['id', 'nama'] }],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['tanggal', 'ASC']],
    });
    return res.json({ success: true, data: rows, total: count });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const jadwal = await Jadwal.findByPk(req.params.id, {
      include: [{ model: User, as: 'admin', attributes: ['id', 'nama'] }],
    });
    if (!jadwal) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    return res.json({ success: true, data: jadwal });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { judul, jenis, tanggal } = req.body;
    if (!judul || !String(judul).trim()) {
      return res.status(422).json({ success: false, message: 'Judul jadwal wajib diisi' });
    }
    if (!jenis) {
      return res.status(422).json({ success: false, message: 'Jenis jadwal wajib diisi' });
    }
    if (!tanggal) {
      return res.status(422).json({ success: false, message: 'Tanggal jadwal wajib diisi' });
    }
    const jadwal = await Jadwal.create({ ...req.body, admin_id: req.user.id });
    return res.status(201).json({ success: true, message: 'Jadwal berhasil ditambahkan', data: jadwal });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const jadwal = await Jadwal.findByPk(req.params.id);
    if (!jadwal) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    await jadwal.update(req.body);
    return res.json({ success: true, message: 'Jadwal berhasil diupdate', data: jadwal });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const jadwal = await Jadwal.findByPk(req.params.id);
    if (!jadwal) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    await jadwal.update({ is_active: false });
    return res.json({ success: true, message: 'Jadwal berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };