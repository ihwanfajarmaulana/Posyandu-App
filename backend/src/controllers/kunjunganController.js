const { Kunjungan, Balita, User } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
  try {
    const { balita_id, from, to, page = 1, limit = 10 } = req.query;
    const where = {};
    if (balita_id) where.balita_id = balita_id;
    if (from || to) {
      where.tanggal_kunjungan = {};
      if (from) where.tanggal_kunjungan[Op.gte] = from;
      if (to) where.tanggal_kunjungan[Op.lte] = to;
    }
    const balitaWhere = {};
    if (req.user.role === 'orang_tua') balitaWhere.user_id = req.user.id;

    const { count, rows } = await Kunjungan.findAndCountAll({
      where,
      include: [
        { model: Balita, as: 'balita', where: balitaWhere, attributes: ['id', 'nama', 'tanggal_lahir'] },
        { model: User, as: 'admin', attributes: ['id', 'nama'] },
      ],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['tanggal_kunjungan', 'DESC']],
    });
    return res.json({ success: true, data: rows, total: count });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { balita_id, tanggal_kunjungan, jenis_kunjungan, catatan } = req.body;
    const balita = await Balita.findByPk(balita_id);
    if (!balita) return res.status(404).json({ success: false, message: 'Balita tidak ditemukan' });
    const kunjungan = await Kunjungan.create({
      balita_id, tanggal_kunjungan, jenis_kunjungan, catatan, admin_id: req.user.id,
    });
    return res.status(201).json({ success: true, message: 'Kunjungan berhasil dicatat', data: kunjungan });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const k = await Kunjungan.findByPk(req.params.id);
    if (!k) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    await k.update(req.body);
    return res.json({ success: true, message: 'Data kunjungan berhasil diupdate', data: k });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const k = await Kunjungan.findByPk(req.params.id);
    if (!k) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    await k.destroy();
    return res.json({ success: true, message: 'Data kunjungan berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, create, update, remove };