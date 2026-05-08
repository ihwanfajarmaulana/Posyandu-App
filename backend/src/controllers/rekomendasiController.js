const { Rekomendasi, Balita, Pertumbuhan } = require('../models');
const { callLLM, buildRekomendasiPrompt } = require('../utils/llmService');

const getByBalita = async (req, res) => {
  try {
    const where = { balita_id: req.params.balita_id };
    if (req.user.role === 'orang_tua') where.is_visible_to_ortu = true;
    const data = await Rekomendasi.findAll({ where, order: [['createdAt', 'DESC']] });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const generate = async (req, res) => {
  try {
    const balita = await Balita.findByPk(req.params.balita_id);
    if (!balita) return res.status(404).json({ success: false, message: 'Balita tidak ditemukan' });

    const riwayat = await Pertumbuhan.findAll({
      where: { balita_id: balita.id },
      order: [['tanggal_ukur', 'DESC']],
      limit: 5,
    });

    const prompt = buildRekomendasiPrompt(balita, riwayat);
    let konten;
    try {
      konten = await callLLM([{ role: 'user', content: 'Berikan rekomendasi untuk balita ini.' }], prompt);
    } catch (llmErr) {
      konten = 'Tidak dapat menghubungi layanan AI saat ini. Silakan coba lagi nanti.';
    }

    const rekomendasi = await Rekomendasi.create({
      balita_id: balita.id,
      dibuat_oleh: req.user.id,
      konten,
      sumber: 'llm',
      prompt_yang_digunakan: prompt,
    });
    return res.status(201).json({ success: true, message: 'Rekomendasi berhasil digenerate', data: rekomendasi });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createManual = async (req, res) => {
  try {
    const { konten, is_visible_to_ortu } = req.body;
    const rekomendasi = await Rekomendasi.create({
      balita_id: req.params.balita_id,
      dibuat_oleh: req.user.id,
      konten,
      sumber: 'manual',
      is_visible_to_ortu: is_visible_to_ortu !== undefined ? is_visible_to_ortu : true,
    });
    return res.status(201).json({ success: true, data: rekomendasi });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getByBalita, generate, createManual };