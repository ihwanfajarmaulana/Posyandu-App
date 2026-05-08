const { Penanganan, Balita, User } = require('../models');

const getByBalita = async (req, res) => {
  try {
    const data = await Penanganan.findAll({
      where: { balita_id: req.params.balita_id },
      include: [{ model: User, as: 'admin', attributes: ['id', 'nama'] }],
      order: [['tanggal', 'DESC']],
    });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const balita = await Balita.findByPk(req.params.balita_id);
    if (!balita) return res.status(404).json({ success: false, message: 'Balita tidak ditemukan' });
    const penanganan = await Penanganan.create({
      ...req.body,
      balita_id: req.params.balita_id,
      admin_id: req.user.id,
    });
    return res.status(201).json({ success: true, message: 'Data penanganan berhasil ditambahkan', data: penanganan });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const p = await Penanganan.findByPk(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    await p.update(req.body);
    return res.json({ success: true, message: 'Data penanganan berhasil diupdate', data: p });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const p = await Penanganan.findByPk(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    await p.destroy();
    return res.json({ success: true, message: 'Data penanganan berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getByBalita, create, update, remove };