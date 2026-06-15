const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');

const authCtrl = require('../controllers/authController');
const balitaCtrl = require('../controllers/balitaController');
const pertumbuhanCtrl = require('../controllers/pertumbuhanController');
const imunisasiCtrl = require('../controllers/imunisasiController');
const kunjunganCtrl = require('../controllers/kunjunganController');
const jadwalCtrl = require('../controllers/jadwalController');
const notifikasiCtrl = require('../controllers/notifikasiController');
const rekomendasiCtrl = require('../controllers/rekomendasiController');
const chatCtrl = require('../controllers/chatController');
const penangananCtrl = require('../controllers/penangananController');
const dashboardCtrl = require('../controllers/dashboardController');
const userCtrl = require('../controllers/userController');

// AUTH
router.post('/auth/register',
  [body('nama').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })],
  authCtrl.register
);
router.post('/auth/login',
  [body('email').isEmail(), body('password').notEmpty()],
  authCtrl.login
);
router.get('/auth/me', authenticate, authCtrl.getMe);
router.put('/auth/me', authenticate, authCtrl.updateProfile);
router.put('/auth/change-password', authenticate, authCtrl.changePassword);

// BALITA
router.get('/balita', authenticate, balitaCtrl.getAll);
router.post('/balita', authenticate, balitaCtrl.create);
router.get('/balita/:id', authenticate, balitaCtrl.getById);
router.put('/balita/:id', authenticate, balitaCtrl.update);
router.delete('/balita/:id', authenticate, authorize('admin'), balitaCtrl.remove);
router.get('/balita/:id/ringkasan', authenticate, balitaCtrl.getRingkasan);

// PERTUMBUHAN
router.get('/balita/:balita_id/pertumbuhan', authenticate, pertumbuhanCtrl.getByBalita);
router.post('/balita/:balita_id/pertumbuhan', authenticate, authorize('admin'), pertumbuhanCtrl.create);
router.put('/pertumbuhan/:id', authenticate, authorize('admin'), pertumbuhanCtrl.update);
router.delete('/pertumbuhan/:id', authenticate, authorize('admin'), pertumbuhanCtrl.remove);

// IMUNISASI
router.get('/balita/:balita_id/imunisasi', authenticate, imunisasiCtrl.getByBalita);
router.post('/balita/:balita_id/imunisasi', authenticate, authorize('admin'), imunisasiCtrl.create);
router.get('/imunisasi/jadwal-berikutnya', authenticate, authorize('admin'), imunisasiCtrl.getJadwalBerikutnya);
router.put('/imunisasi/:id', authenticate, authorize('admin'), imunisasiCtrl.update);
router.delete('/imunisasi/:id', authenticate, authorize('admin'), imunisasiCtrl.remove);

// KUNJUNGAN
router.get('/kunjungan', authenticate, kunjunganCtrl.getAll);
router.post('/kunjungan', authenticate, kunjunganCtrl.create);
router.put('/kunjungan/:id', authenticate, authorize('admin'), kunjunganCtrl.update);
router.delete('/kunjungan/:id', authenticate, authorize('admin'), kunjunganCtrl.remove);

// JADWAL
router.get('/jadwal', authenticate, jadwalCtrl.getAll);
router.get('/jadwal/:id', authenticate, jadwalCtrl.getById);
router.post('/jadwal', authenticate, authorize('admin'), jadwalCtrl.create);
router.put('/jadwal/:id', authenticate, authorize('admin'), jadwalCtrl.update);
router.delete('/jadwal/:id', authenticate, authorize('admin'), jadwalCtrl.remove);

// NOTIFIKASI
router.get('/notifikasi', authenticate, notifikasiCtrl.getAll);
router.patch('/notifikasi/baca-semua', authenticate, notifikasiCtrl.markAllRead);
router.patch('/notifikasi/:id/baca', authenticate, notifikasiCtrl.markRead);
router.post('/notifikasi/broadcast', authenticate, authorize('admin'), notifikasiCtrl.broadcast);

// REKOMENDASI
router.get('/rekomendasi', authenticate, authorize('admin'), rekomendasiCtrl.getAll);
router.get('/balita/:balita_id/rekomendasi', authenticate, rekomendasiCtrl.getByBalita);
// Alias untuk POV orang tua dari frontend teman
router.get('/rekomendasi/anak/:balita_id', authenticate, rekomendasiCtrl.getByBalita);
router.post('/balita/:balita_id/rekomendasi/generate', authenticate, authorize('admin'), rekomendasiCtrl.generate);
router.post('/balita/:balita_id/rekomendasi', authenticate, authorize('admin'), rekomendasiCtrl.createManual);
router.put('/rekomendasi/:id', authenticate, authorize('admin'), rekomendasiCtrl.update);
router.delete('/rekomendasi/:id', authenticate, authorize('admin'), rekomendasiCtrl.remove);

// CHAT
router.get('/chat/:balita_id', authenticate, chatCtrl.getRiwayat);
router.post('/chat/:balita_id', authenticate, chatCtrl.kirimPesan);
router.delete('/chat/:balita_id/session/:session_id', authenticate, chatCtrl.hapusRiwayat)

// PENANGANAN
router.get('/balita/:balita_id/penanganan', authenticate, penangananCtrl.getByBalita);
// Alias untuk POV orang tua dari frontend teman
router.get('/penanganan/anak/:balita_id', authenticate, penangananCtrl.getByBalita);
router.post('/balita/:balita_id/penanganan', authenticate, authorize('admin'), penangananCtrl.create);
router.put('/penanganan/:id', authenticate, authorize('admin'), penangananCtrl.update);
router.delete('/penanganan/:id', authenticate, authorize('admin'), penangananCtrl.remove);

// DASHBOARD & LAPORAN
router.get('/dashboard/statistik', authenticate, authorize('admin'), dashboardCtrl.getStatistik);
router.get('/dashboard/rekap-penimbangan', authenticate, authorize('admin'), dashboardCtrl.getRekapPenimbangan);
router.get('/dashboard/rekap-penimbangan/export', authenticate, authorize('admin'), dashboardCtrl.exportRekapCSV);

// USER MANAGEMENT
router.get('/users', authenticate, authorize('admin'), userCtrl.getAll);
router.get('/users/:id', authenticate, authorize('admin'), userCtrl.getById);
router.put('/users/:id', authenticate, authorize('admin'), userCtrl.update);
router.delete('/users/:id', authenticate, authorize('admin'), userCtrl.remove);

module.exports = router;