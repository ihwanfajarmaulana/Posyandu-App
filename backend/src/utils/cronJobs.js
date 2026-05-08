const cron = require('node-cron');
const { Imunisasi, Balita, User, Notifikasi } = require('../models');
const { Op } = require('sequelize');

const setupCronJobs = () => {
  cron.schedule('0 7 * * *', async () => {
    console.log('[CRON] Cek reminder imunisasi...');
    try {
      const tiga_hari = new Date();
      tiga_hari.setDate(tiga_hari.getDate() + 3);
      const hari_ini = new Date();

      const jadwalImunisasi = await Imunisasi.findAll({
        where: {
          tanggal_jadwal_berikutnya: { [Op.between]: [hari_ini, tiga_hari] },
        },
        include: [{
          model: Balita,
          as: 'balita',
          where: { is_active: true },
          include: [{ model: User, as: 'orang_tua' }],
        }],
      });

      for (const imunisasi of jadwalImunisasi) {
        const balita = imunisasi.balita;
        const orang_tua = balita.orang_tua;
        if (!orang_tua) continue;

        const existing = await Notifikasi.findOne({
          where: {
            user_id: orang_tua.id,
            balita_id: balita.id,
            tipe: 'imunisasi',
            judul: { [Op.like]: `%${imunisasi.nama_vaksin}%` },
            createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        });
        if (existing) continue;

        await Notifikasi.create({
          user_id: orang_tua.id,
          balita_id: balita.id,
          judul: `Reminder Imunisasi ${imunisasi.nama_vaksin}`,
          pesan: `Jadwal imunisasi ${imunisasi.nama_vaksin} untuk ${balita.nama} pada tanggal ${imunisasi.tanggal_jadwal_berikutnya}. Jangan lupa ke posyandu!`,
          tipe: 'imunisasi',
          tanggal_kirim: new Date(),
        });
        console.log(`[CRON] Notifikasi dibuat untuk ${balita.nama}`);
      }
    } catch (err) {
      console.error('[CRON] Error:', err.message);
    }
  });

  console.log('[CRON] Cron jobs aktif');
};

module.exports = { setupCronJobs };