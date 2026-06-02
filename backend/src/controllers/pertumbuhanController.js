const { Pertumbuhan, Balita } = require('../models');
const { Op } = require('sequelize');

const hitungUsiaBulan = (tanggalLahir) => {
  const lahir = new Date(tanggalLahir);
  const sekarang = new Date();
  return (sekarang.getFullYear() - lahir.getFullYear()) * 12 +
    (sekarang.getMonth() - lahir.getMonth());
};

// ─────────────────────────────────────────────
// Tabel median & SD WHO untuk BB/U, TB/U, BB/TB
// Sumber: WHO Child Growth Standards
// Hanya untuk usia 0–60 bulan (indeks = usia dalam bulan)
// Format: [median, SD]  — nilai untuk Laki-laki (L) dan Perempuan (P)
// ─────────────────────────────────────────────

// BB/U (Weight-for-Age) median & SD per bulan
const BB_U_L = [
  [3.3,0.39],[4.5,0.52],[5.6,0.62],[6.4,0.7],[7.0,0.75],[7.5,0.79],[7.9,0.82],[8.3,0.85],[8.6,0.87],[8.9,0.89],
  [9.2,0.91],[9.4,0.93],[9.6,0.95],[9.9,0.97],[10.1,0.99],[10.3,1.01],[10.5,1.02],[10.7,1.04],[10.9,1.06],[11.1,1.07],
  [11.3,1.09],[11.5,1.11],[11.8,1.13],[12.0,1.15],[12.2,1.17],[12.4,1.19],[12.5,1.2],[12.7,1.22],[12.9,1.24],[13.1,1.26],
  [13.3,1.27],[13.5,1.29],[13.7,1.31],[13.8,1.33],[14.0,1.35],[14.2,1.37],[14.3,1.38],[14.5,1.4],[14.7,1.42],[14.8,1.44],
  [15.0,1.46],[15.2,1.47],[15.3,1.49],[15.5,1.51],[15.7,1.53],[15.8,1.55],[16.0,1.56],[16.2,1.58],[16.3,1.6],[16.5,1.62],
  [16.7,1.64],[16.8,1.66],[17.0,1.68],[17.2,1.7],[17.3,1.71],[17.5,1.73],[17.7,1.75],[17.8,1.77],[18.0,1.79],[18.2,1.81],
  [18.3,1.82]
];
const BB_U_P = [
  [3.2,0.38],[4.2,0.49],[5.1,0.58],[5.8,0.64],[6.4,0.7],[6.9,0.74],[7.3,0.77],[7.6,0.8],[7.9,0.82],[8.2,0.85],
  [8.5,0.87],[8.7,0.89],[8.9,0.91],[9.2,0.93],[9.4,0.95],[9.6,0.97],[9.8,0.99],[10.0,1.01],[10.2,1.03],[10.4,1.05],
  [10.6,1.07],[10.9,1.09],[11.1,1.11],[11.3,1.13],[11.5,1.15],[11.7,1.17],[11.9,1.19],[12.1,1.2],[12.3,1.22],[12.5,1.24],
  [12.7,1.26],[12.9,1.28],[13.1,1.3],[13.3,1.32],[13.5,1.34],[13.7,1.36],[13.9,1.38],[14.1,1.4],[14.3,1.42],[14.5,1.44],
  [14.7,1.46],[14.9,1.48],[15.1,1.5],[15.3,1.52],[15.5,1.54],[15.7,1.56],[15.9,1.58],[16.1,1.6],[16.3,1.62],[16.5,1.64],
  [16.7,1.66],[16.9,1.68],[17.1,1.7],[17.3,1.72],[17.5,1.74],[17.7,1.76],[17.9,1.78],[18.1,1.8],[18.3,1.82],[18.5,1.84],
  [18.7,1.86]
];

// TB/U (Height-for-Age) median & SD per bulan
const TB_U_L = [
  [49.9,1.89],[54.7,2.0],[58.4,2.08],[61.4,2.14],[63.9,2.19],[65.9,2.23],[67.6,2.26],[69.2,2.28],[70.6,2.31],[72.0,2.33],
  [73.3,2.35],[74.5,2.37],[75.7,2.39],[76.9,2.41],[78.0,2.43],[79.1,2.45],[80.2,2.46],[81.2,2.48],[82.3,2.5],[83.2,2.52],
  [84.2,2.53],[85.1,2.55],[86.0,2.57],[86.9,2.58],[87.8,2.6],[88.7,2.62],[89.6,2.63],[90.4,2.65],[91.2,2.67],[92.1,2.68],
  [92.9,2.7],[93.7,2.72],[94.4,2.73],[95.2,2.75],[95.9,2.77],[96.7,2.78],[97.4,2.8],[98.2,2.82],[98.9,2.83],[99.6,2.85],
  [100.4,2.86],[101.1,2.88],[101.8,2.9],[102.5,2.91],[103.2,2.93],[103.9,2.95],[104.7,2.96],[105.4,2.98],[106.1,2.99],[106.7,3.01],
  [107.4,3.02],[108.1,3.04],[108.8,3.06],[109.4,3.07],[110.1,3.09],[110.8,3.1],[111.4,3.12],[112.1,3.14],[112.7,3.15],[113.4,3.17],
  [114.0,3.18]
];
const TB_U_P = [
  [49.1,1.86],[53.7,1.97],[57.1,2.04],[59.8,2.09],[62.1,2.14],[64.0,2.17],[65.7,2.2],[67.3,2.23],[68.7,2.25],[70.1,2.27],
  [71.5,2.29],[72.8,2.31],[74.0,2.33],[75.2,2.35],[76.4,2.37],[77.5,2.39],[78.6,2.4],[79.7,2.42],[80.7,2.44],[81.7,2.46],
  [82.7,2.47],[83.7,2.49],[84.6,2.51],[85.5,2.52],[86.4,2.54],[87.3,2.56],[88.2,2.57],[89.1,2.59],[89.9,2.61],[90.7,2.62],
  [91.6,2.64],[92.4,2.66],[93.2,2.67],[94.0,2.69],[94.8,2.71],[95.6,2.72],[96.4,2.74],[97.2,2.75],[97.9,2.77],[98.7,2.79],
  [99.5,2.8],[100.2,2.82],[101.0,2.84],[101.7,2.85],[102.5,2.87],[103.2,2.88],[103.9,2.9],[104.7,2.92],[105.4,2.93],[106.1,2.95],
  [106.8,2.96],[107.5,2.98],[108.2,3.0],[108.9,3.01],[109.6,3.03],[110.3,3.04],[111.0,3.06],[111.7,3.08],[112.3,3.09],[113.0,3.11],
  [113.7,3.12]
];

// BB/TB (Weight-for-Height) — diindeks per cm tinggi (45–120 cm, step 0.5)
// Format lebih sederhana: gunakan interpolasi linier antara nilai terdekat
// Nilai median BB untuk tinggi tertentu (L & P) dari standar WHO
const BB_TB_REF = {
  L: {
    45:2.0, 46:2.2, 47:2.4, 48:2.6, 49:2.9, 50:3.2, 51:3.5, 52:3.8, 53:4.1, 54:4.5,
    55:4.9, 56:5.2, 57:5.6, 58:6.0, 59:6.3, 60:6.7, 61:7.0, 62:7.4, 63:7.7, 64:8.0,
    65:8.3, 66:8.6, 67:8.9, 68:9.2, 69:9.5, 70:9.8, 71:10.1, 72:10.3, 73:10.6, 74:10.9,
    75:11.1, 76:11.4, 77:11.7, 78:11.9, 79:12.2, 80:12.5, 81:12.7, 82:13.0, 83:13.3, 84:13.6,
    85:13.9, 86:14.2, 87:14.5, 88:14.9, 89:15.2, 90:15.6, 91:15.9, 92:16.2, 93:16.6, 94:17.0,
    95:17.4, 96:17.7, 97:18.1, 98:18.5, 99:18.9, 100:19.3, 101:19.7, 102:20.1, 103:20.5, 104:21.0,
    105:21.4, 106:21.9, 107:22.3, 108:22.8, 109:23.3, 110:23.8, 111:24.3, 112:24.8, 113:25.4, 114:25.9,
    115:26.5, 116:27.1, 117:27.6, 118:28.2, 119:28.9, 120:29.5
  },
  P: {
    45:2.0, 46:2.2, 47:2.4, 48:2.6, 49:2.9, 50:3.2, 51:3.5, 52:3.8, 53:4.1, 54:4.4,
    55:4.7, 56:5.1, 57:5.4, 58:5.7, 59:6.1, 60:6.4, 61:6.7, 62:7.0, 63:7.4, 64:7.7,
    65:8.0, 66:8.3, 67:8.6, 68:8.9, 69:9.2, 70:9.4, 71:9.7, 72:10.0, 73:10.3, 74:10.6,
    75:10.9, 76:11.2, 77:11.5, 78:11.8, 79:12.1, 80:12.4, 81:12.7, 82:13.1, 83:13.4, 84:13.7,
    85:14.1, 86:14.4, 87:14.8, 88:15.2, 89:15.6, 90:16.0, 91:16.4, 92:16.8, 93:17.2, 94:17.6,
    95:18.0, 96:18.5, 97:18.9, 98:19.4, 99:19.9, 100:20.4, 101:20.9, 102:21.4, 103:21.9, 104:22.5,
    105:23.1, 106:23.6, 107:24.2, 108:24.9, 109:25.5, 110:26.2, 111:26.9, 112:27.6, 113:28.3, 114:29.1,
    115:29.9, 116:30.7, 117:31.5, 118:32.4, 119:33.3, 120:34.2
  }
};

// SD untuk BB/TB (approx ~0.9–1.5 kg, gunakan estimasi proporsional)
const getBBTBSD = (tbCm, jk) => {
  const ref = BB_TB_REF[jk === 'P' ? 'P' : 'L'];
  const median = getInterpolasi(ref, tbCm);
  return median * 0.12; // ±12% dari median sebagai estimasi 1 SD
};

const getInterpolasi = (tabel, nilai) => {
  const keys = Object.keys(tabel).map(Number).sort((a, b) => a - b);
  if (nilai <= keys[0]) return tabel[keys[0]];
  if (nilai >= keys[keys.length - 1]) return tabel[keys[keys.length - 1]];
  const low = keys.filter(k => k <= nilai).pop();
  const high = keys.filter(k => k >= nilai)[0];
  if (low === high) return tabel[low];
  const ratio = (nilai - low) / (high - low);
  return tabel[low] + ratio * (tabel[high] - tabel[low]);
};

// Hitung Z-Score: (nilai - median) / SD
const hitungZScore = (nilai, median, sd) => {
  if (!sd) return 0;
  return parseFloat(((nilai - median) / sd).toFixed(2));
};

const hitungSemuaZScore = (usia_bulan, jenis_kelamin, berat_badan, tinggi_badan) => {
  const idx = Math.min(Math.max(Math.round(usia_bulan), 0), 60);
  const isP = jenis_kelamin === 'P';

  // BB/U
  const [medBBU, sdBBU] = isP ? BB_U_P[idx] : BB_U_L[idx];
  const bb_u = hitungZScore(berat_badan, medBBU, sdBBU);

  // TB/U
  const [medTBU, sdTBU] = isP ? TB_U_P[idx] : TB_U_L[idx];
  const tb_u = hitungZScore(tinggi_badan, medTBU, sdTBU);

  // BB/TB
  const ref = BB_TB_REF[isP ? 'P' : 'L'];
  const medBBTB = getInterpolasi(ref, tinggi_badan);
  const sdBBTB = getBBTBSD(tinggi_badan, jenis_kelamin);
  const bb_tb = hitungZScore(berat_badan, medBBTB, sdBBTB);

  return { bb_u, tb_u, bb_tb };
};

const klasifikasiStatus = (usia_bulan, jenis_kelamin, berat_badan, tinggi_badan) => {
  const is_stunting = tinggi_badan < (45 + usia_bulan * 0.7);
  let status_berat = 'normal', status_tinggi = 'normal', status_gizi = 'gizi_baik';

  if (is_stunting) status_tinggi = 'pendek';

  if (berat_badan < (3.5 + usia_bulan * 0.18)) status_berat = 'kurang';
  else if (berat_badan > (5 + usia_bulan * 0.4)) status_berat = 'lebih';

  if (status_berat === 'sangat_kurang' || (is_stunting && status_berat === 'kurang')) {
    status_gizi = 'gizi_buruk';
  } else if (status_berat === 'kurang' || is_stunting) {
    status_gizi = 'gizi_kurang';
  } else if (status_berat === 'lebih') {
    status_gizi = 'gizi_lebih';
  } else {
    status_gizi = 'gizi_baik';
  }

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
    const zscore = hitungSemuaZScore(usia_bulan, balita.jenis_kelamin, berat_badan, tinggi_badan);

    const pertumbuhan = await Pertumbuhan.create({
      balita_id: req.params.balita_id,
      admin_id: req.user.id,
      tanggal_ukur, berat_badan, tinggi_badan, lingkar_kepala, catatan,
      ...status,
      ...zscore,
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

    // Kalau ada update BB/TB, hitung ulang zscore dan status
    const { berat_badan, tinggi_badan } = req.body;
    if (berat_badan || tinggi_badan) {
      const balita = await Balita.findByPk(p.balita_id);
      if (balita) {
        const bb = berat_badan || p.berat_badan;
        const tb = tinggi_badan || p.tinggi_badan;
        const usia_bulan = hitungUsiaBulan(balita.tanggal_lahir);
        const status = klasifikasiStatus(usia_bulan, balita.jenis_kelamin, bb, tb);
        const zscore = hitungSemuaZScore(usia_bulan, balita.jenis_kelamin, bb, tb);
        Object.assign(req.body, status, zscore);
      }
    }

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