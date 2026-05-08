const { User, Balita } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { nama: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['nama', 'ASC']],
    });
    return res.json({ success: true, data: rows, total: count });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Balita, as: 'balita', where: { is_active: true }, required: false }],
    });
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    const { nama, no_telepon, alamat, is_active } = req.body;
    await user.update({ nama, no_telepon, alamat, is_active });
    return res.json({ success: true, message: 'Data user berhasil diupdate' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    await user.update({ is_active: false });
    return res.json({ success: true, message: 'User berhasil dinonaktifkan' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, update, remove };