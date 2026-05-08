const { Imunisasi, Balita } = require('../models');
const { Op } = require('sequelize');

const getByBalita = async (req, res) => {
  try {
    const data = await Imunisasi.findAll({
      where: { balita_id: req.params.balita_id },
      order: [['tanggal_pemberian', 'ASC']],
    });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getJadwalBerikutnya = async (req, res) => {
  try {
    const hari_ini = new Date();
    const tujuh_hari = new Date();
    tujuh_hari.setDate(tujuh_hari.getDate() + 7);
    const data = await Imunisasi.findAll({
      where: { tanggal_jadwal_berikutnya: { [Op.between]: [hari_ini, tujuh_hari] } },
      include: [{ model: Balita, as: 'balita' }],
      order: [['tanggal_jadwal_berikutnya', 'ASC']],
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
    const imunisasi = await Imunisasi.create({
      ...req.body,
      balita_id: req.params.balita_id,
      admin_id: req.user.id,
    });
    return res.status(201).json({ success: true, message: 'Data imunisasi berhasil dicatat', data: imunisasi });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const im = await Imunisasi.findByPk(req.params.id);
    if (!im) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    await im.update(req.body);
    return res.json({ success: true, message: 'Data imunisasi berhasil diupdate', data: im });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const im = await Imunisasi.findByPk(req.params.id);
    if (!im) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    await im.destroy();
    return res.json({ success: true, message: 'Data imunisasi berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getByBalita, getJadwalBerikutnya, create, update, remove };