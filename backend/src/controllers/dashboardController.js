const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');
const { Balita, Pertumbuhan, Imunisasi } = require('../models');

const getStatistik = async (req, res) => {
  try {
    const totalBalita = await Balita.count({ where: { is_active: true } });

    const trenBulan = await sequelize.query(`
      SELECT DATE_FORMAT(tanggal_ukur, '%Y-%m') AS bulan,
             COUNT(*) AS jumlah_pengukuran,
             AVG(berat_badan) AS rata_berat,
             AVG(tinggi_badan) AS rata_tinggi,
             SUM(CASE WHEN is_stunting = 1 THEN 1 ELSE 0 END) AS jumlah_stunting
      FROM pertumbuhan
      WHERE tanggal_ukur >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY bulan ORDER BY bulan ASC
    `, { type: QueryTypes.SELECT });

    const statGizi = await sequelize.query(`
      SELECT status_gizi, COUNT(*) as jumlah
      FROM pertumbuhan p
      INNER JOIN (
        SELECT balita_id, MAX(tanggal_ukur) as max_tgl
        FROM pertumbuhan GROUP BY balita_id
      ) latest ON p.balita_id = latest.balita_id AND p.tanggal_ukur = latest.max_tgl
      GROUP BY status_gizi
    `, { type: QueryTypes.SELECT });

    const totalStunting = await sequelize.query(`
      SELECT COUNT(*) as jumlah FROM pertumbuhan p
      INNER JOIN (
        SELECT balita_id, MAX(tanggal_ukur) as max_tgl
        FROM pertumbuhan GROUP BY balita_id
      ) latest ON p.balita_id = latest.balita_id AND p.tanggal_ukur = latest.max_tgl
      WHERE p.is_stunting = 1
    `, { type: QueryTypes.SELECT });

    const sudahImunisasi = await sequelize.query(`
      SELECT COUNT(DISTINCT balita_id) as jumlah FROM imunisasi
    `, { type: QueryTypes.SELECT });

    return res.json({
      success: true,
      data: {
        total_balita: totalBalita,
        stunting: totalStunting[0]?.jumlah || 0,
        sudah_imunisasi: sudahImunisasi[0]?.jumlah || 0,
        status_gizi: statGizi,
        tren_pertumbuhan: trenBulan,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getRekapPenimbangan = async (req, res) => {
  try {
    const month = req.query.bulan || new Date().getMonth() + 1;
    const year = req.query.tahun || new Date().getFullYear();

    const data = await sequelize.query(`
      SELECT b.id, b.nama, b.tanggal_lahir, b.jenis_kelamin,
             u.nama AS nama_orang_tua, u.no_telepon,
             p.tanggal_ukur, p.berat_badan, p.tinggi_badan,
             p.status_berat, p.status_tinggi, p.status_gizi,
             CASE WHEN p.is_stunting = 1 THEN 'Ya' ELSE 'Tidak' END AS stunting
      FROM balita b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN pertumbuhan p ON p.balita_id = b.id
        AND MONTH(p.tanggal_ukur) = :month
        AND YEAR(p.tanggal_ukur) = :year
      WHERE b.is_active = 1
      ORDER BY b.nama ASC
    `, { replacements: { month, year }, type: QueryTypes.SELECT });

    return res.json({ success: true, data, bulan: month, tahun: year });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const exportRekapCSV = async (req, res) => {
  try {
    const month = req.query.bulan || new Date().getMonth() + 1;
    const year = req.query.tahun || new Date().getFullYear();

    const data = await sequelize.query(`
      SELECT b.nama AS Nama_Balita,
             b.tanggal_lahir AS Tanggal_Lahir,
             b.jenis_kelamin AS JK,
             u.nama AS Nama_Orang_Tua,
             u.no_telepon AS No_Telepon,
             p.tanggal_ukur AS Tanggal_Ukur,
             p.berat_badan AS Berat_Badan_Kg,
             p.tinggi_badan AS Tinggi_Badan_Cm,
             p.status_gizi AS Status_Gizi,
             CASE WHEN p.is_stunting = 1 THEN 'Stunting' ELSE 'Normal' END AS Status_Stunting
      FROM balita b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN pertumbuhan p ON p.balita_id = b.id
        AND MONTH(p.tanggal_ukur) = :month
        AND YEAR(p.tanggal_ukur) = :year
      WHERE b.is_active = 1
      ORDER BY b.nama ASC
    `, { replacements: { month, year }, type: QueryTypes.SELECT });

    const header = 'Nama_Balita,Tanggal_Lahir,JK,Nama_Orang_Tua,No_Telepon,Tanggal_Ukur,Berat_Badan_Kg,Tinggi_Badan_Cm,Status_Gizi,Status_Stunting';
    const rows = data.map((row) =>
      Object.values(row).map((v) => `"${v ?? ''}"`).join(',')
    );
    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=rekap_${year}_${month}.csv`);
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStatistik, getRekapPenimbangan, exportRekapCSV };