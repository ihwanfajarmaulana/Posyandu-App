const { Notifikasi, Balita, Jadwal, User } = require('../models');

const getAll = async (req, res) => {
  try {
    const where = { user_id: req.user.id };
    if (req.query.is_read !== undefined) where.is_read = req.query.is_read === 'true';
    const data = await Notifikasi.findAll({
      where,
      include: [
        { model: Balita, as: 'balita', attributes: ['id', 'nama'] },
        { model: Jadwal, as: 'jadwal', attributes: ['id', 'judul', 'tanggal'] },
      ],
      order: [['tanggal_kirim', 'DESC']],
    });
    const unread = await Notifikasi.count({ where: { user_id: req.user.id, is_read: false } });
    return res.json({ success: true, data, unread_count: unread });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const markRead = async (req, res) => {
  try {
    const n = await Notifikasi.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!n) return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan' });
    await n.update({ is_read: true });
    return res.json({ success: true, message: 'Notifikasi ditandai sudah dibaca' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notifikasi.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    return res.json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const broadcast = async (req, res) => {
  try {
    const { judul, pesan, tipe, jadwal_id } = req.body;
    const orangTua = await User.findAll({ where: { role: 'orang_tua', is_active: true }, attributes: ['id'] });
    const notifData = orangTua.map((u) => ({
      user_id: u.id, judul, pesan, tipe: tipe || 'jadwal',
      jadwal_id: jadwal_id || null, tanggal_kirim: new Date(),
    }));
    await Notifikasi.bulkCreate(notifData);
    return res.status(201).json({ success: true, message: `Notifikasi dikirim ke ${orangTua.length} pengguna` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, markRead, markAllRead, broadcast };