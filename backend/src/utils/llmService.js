const axios = require('axios');

const callLLM = async (messages, systemPrompt = '') => {
  const fullMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const response = await axios.post(
    process.env.LLM_API_URL,
    {
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      messages: fullMessages,
      max_tokens: 1000,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
};

const buildRekomendasiPrompt = (balita, riwayatPertumbuhan) => {
  const data = riwayatPertumbuhan.slice(-3).map((p) =>
    `- Tanggal: ${p.tanggal_ukur}, BB: ${p.berat_badan}kg, TB: ${p.tinggi_badan}cm, Status: ${p.status_gizi}`
  ).join('\n');

  return `Kamu adalah ahli gizi anak dan tenaga kesehatan posyandu.
Berikan rekomendasi yang jelas, mudah dipahami orang tua, dan berbasis bukti ilmiah.

Data Balita:
- Nama: ${balita.nama}
- Jenis Kelamin: ${balita.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
- Tanggal Lahir: ${balita.tanggal_lahir}

Riwayat Pertumbuhan Terakhir:
${data || 'Belum ada data pertumbuhan'}

Berikan rekomendasi singkat (3-5 poin) mengenai:
1. Status gizi anak
2. Saran pola makan
3. Stimulasi tumbuh kembang
4. Kapan perlu ke dokter/puskesmas
Format: poin-poin yang jelas dan mudah dipahami.`;
};

module.exports = { callLLM, buildRekomendasiPrompt };