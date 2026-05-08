const { ChatHistory, Balita, Pertumbuhan } = require('../models');
const { callLLM } = require('../utils/llmService');

const systemPrompt = `Kamu adalah asisten kesehatan posyandu yang membantu orang tua memahami 
tumbuh kembang balita mereka. Jawab dengan bahasa Indonesia yang mudah dipahami, ramah, dan informatif.
Jika ada pertanyaan medis serius, selalu sarankan untuk berkonsultasi dengan tenaga kesehatan atau dokter.
Fokus pada tumbuh kembang anak, gizi, imunisasi, dan kesehatan balita.`;

const getRiwayat = async (req, res) => {
  try {
    const where = { user_id: req.user.id, balita_id: req.params.balita_id };
    if (req.query.session_id) where.session_id = req.query.session_id;
    const data = await ChatHistory.findAll({
      where,
      order: [['createdAt', 'ASC']],
      limit: 50,
    });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const kirimPesan = async (req, res) => {
  try {
    const { pesan, session_id } = req.body;
    const sessionId = session_id || `${req.user.id}-${req.params.balita_id}-${Date.now()}`;

    const balita = await Balita.findByPk(req.params.balita_id);
    if (!balita) return res.status(404).json({ success: false, message: 'Balita tidak ditemukan' });

    const riwayat = await ChatHistory.findAll({
      where: { user_id: req.user.id, balita_id: req.params.balita_id, session_id: sessionId },
      order: [['createdAt', 'ASC']],
      limit: 20,
    });

    const pertumbuhanTerakhir = await Pertumbuhan.findOne({
      where: { balita_id: req.params.balita_id },
      order: [['tanggal_ukur', 'DESC']],
    });

    const konteksBalita = `Konteks balita yang sedang dibicarakan:
- Nama: ${balita.nama}
- Jenis Kelamin: ${balita.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
- Tanggal Lahir: ${balita.tanggal_lahir}
${pertumbuhanTerakhir ? `- BB Terakhir: ${pertumbuhanTerakhir.berat_badan}kg, TB: ${pertumbuhanTerakhir.tinggi_badan}cm` : ''}`;

    const messages = [
      ...riwayat.map((c) => ({ role: c.role, content: c.pesan })),
      { role: 'user', content: pesan },
    ];

    await ChatHistory.create({
      user_id: req.user.id,
      balita_id: req.params.balita_id,
      role: 'user',
      pesan,
      session_id: sessionId,
    });

    let reply = 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti.';
    try {
      reply = await callLLM(messages, `${systemPrompt}\n\n${konteksBalita}`);
    } catch (e) {
      console.error('LLM Error:', e.message);
    }

    await ChatHistory.create({
      user_id: req.user.id,
      balita_id: req.params.balita_id,
      role: 'assistant',
      pesan: reply,
      session_id: sessionId,
    });

    return res.json({ success: true, data: { session_id: sessionId, pesan: reply } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getRiwayat, kirimPesan };