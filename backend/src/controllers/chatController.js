const { ChatHistory, Balita, Pertumbuhan } = require('../models')

function getBalitaWhere(req) {
  const where = {
    id: req.params.balita_id,
  }

  if (req.user?.role === 'orang_tua') {
    where.user_id = req.user.id
  }

  return where
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword))
}

function formatTanggal(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function hitungUsiaBulan(tanggalLahir) {
  if (!tanggalLahir) return 0

  const lahir = new Date(tanggalLahir)
  const sekarang = new Date()

  if (Number.isNaN(lahir.getTime())) return 0

  let bulan =
    (sekarang.getFullYear() - lahir.getFullYear()) * 12 +
    (sekarang.getMonth() - lahir.getMonth())

  if (sekarang.getDate() < lahir.getDate()) bulan -= 1

  return Math.max(bulan, 0)
}

function hitungUsia(tanggalLahir) {
  const bulan = hitungUsiaBulan(tanggalLahir)

  if (!tanggalLahir) return '-'
  if (bulan < 12) return `${bulan} bulan`

  const tahun = Math.floor(bulan / 12)
  const sisaBulan = bulan % 12

  if (sisaBulan === 0) return `${tahun} tahun`
  return `${tahun} tahun ${sisaBulan} bulan`
}

function getRekomendasiTidur(tanggalLahir) {
  const usiaBulan = hitungUsiaBulan(tanggalLahir)

  if (usiaBulan < 4) {
    return {
      range: '14–17 jam per hari',
      label: 'bayi baru lahir',
      note: 'pola tidur bayi baru lahir biasanya masih belum teratur',
    }
  }

  if (usiaBulan < 12) {
    return {
      range: '12–16 jam per hari termasuk tidur siang',
      label: 'bayi',
      note: 'biasanya tidur malam mulai lebih panjang, tetapi tidur siang masih dibutuhkan',
    }
  }

  if (usiaBulan < 36) {
    return {
      range: '11–14 jam per hari termasuk tidur siang',
      label: 'batita',
      note: 'biasanya masih membutuhkan 1 kali tidur siang',
    }
  }

  if (usiaBulan < 72) {
    return {
      range: '10–13 jam per hari termasuk tidur siang',
      label: 'anak usia prasekolah',
      note: 'sebagian anak masih tidur siang, sebagian mulai tidak tidur siang',
    }
  }

  return {
    range: '9–12 jam per hari',
    label: 'anak usia sekolah',
    note: 'usahakan tidur malam cukup dan jadwal tidur konsisten',
  }
}

function getChildContext(balita, pertumbuhanTerakhir) {
  const nama = balita?.nama || 'anak'
  const usia = hitungUsia(balita?.tanggal_lahir)

  const jenisKelamin =
    balita?.jenis_kelamin === 'P'
      ? 'perempuan'
      : balita?.jenis_kelamin === 'L'
        ? 'laki-laki'
        : '-'

  const bb = pertumbuhanTerakhir?.berat_badan
    ? `${pertumbuhanTerakhir.berat_badan} kg`
    : '-'

  const tb = pertumbuhanTerakhir?.tinggi_badan
    ? `${pertumbuhanTerakhir.tinggi_badan} cm`
    : '-'

  const lk = pertumbuhanTerakhir?.lingkar_kepala
    ? `${pertumbuhanTerakhir.lingkar_kepala} cm`
    : '-'

  const statusGizi = pertumbuhanTerakhir?.status_gizi || 'belum ada data status gizi'
  const tanggalUkur = formatTanggal(pertumbuhanTerakhir?.tanggal_ukur)
  const tidur = getRekomendasiTidur(balita?.tanggal_lahir)

  return {
    nama,
    usia,
    jenisKelamin,
    bb,
    tb,
    lk,
    statusGizi,
    tanggalUkur,
    tidur,
  }
}

function isGreeting(text) {
  return hasAny(text, [
    'halo',
    'hai',
    'hi',
    'pagi',
    'siang',
    'sore',
    'malam',
    'assalamualaikum',
    'permisi',
  ])
}

function isAllowedTopic(text) {
  const allowedKeywords = [
    'posyandu',
    'kader',
    'puskesmas',
    'buku kia',
    'kia',
    'kunjungan',
    'jadwal posyandu',
    'agenda posyandu',
    'pemantauan',
    'pemeriksaan anak',
    'anak',
    'balita',
    'bayi',
    'batita',
    'tumbuh',
    'tumbuh kembang',
    'perkembangan',
    'pertumbuhan',
    'motorik',
    'bicara',
    'berjalan',
    'merangkak',
    'duduk',
    'aktif',
    'rewel',
    'gizi',
    'makan',
    'makanan',
    'mpasi',
    'menu',
    'susu',
    'asi',
    'nafsu makan',
    'susah makan',
    'tidak mau makan',
    'ga mau makan',
    'gak mau makan',
    'nggak mau makan',
    'gtm',
    'protein',
    'karbohidrat',
    'sayur',
    'buah',
    'camilan',
    'cemilan',
    'telur',
    'ikan',
    'ayam',
    'tempe',
    'tahu',
    'vitamin',
    'berat',
    'berat badan',
    'bb',
    'tinggi',
    'tinggi badan',
    'tb',
    'lingkar kepala',
    'lk',
    'status gizi',
    'gizi buruk',
    'gizi kurang',
    'gizi lebih',
    'normal',
    'kurus',
    'gemuk',
    'stunting',
    'pendek',
    'z score',
    'zscore',
    'imunisasi',
    'vaksin',
    'bcg',
    'dpt',
    'polio',
    'campak',
    'hib',
    'hepatitis',
    'rotavirus',
    'demam',
    'panas',
    'batuk',
    'pilek',
    'flu',
    'muntah',
    'diare',
    'sakit',
    'ruam',
    'alergi',
    'gatal',
    'sesak',
    'kejang',
    'lemas',
    'obat',
    'dokter',
    'tidur',
    'bobo',
    'bobok',
    'jam tidur',
    'waktu tidur',
    'durasi tidur',
    'susah tidur',
    'sering bangun',
    'rewel malam',
    'begadang',
  ]

  return hasAny(text, allowedKeywords)
}

function getIntent(text) {
  const emergencyKeywords = [
    'kejang',
    'sesak',
    'napas cepat',
    'biru',
    'tidak sadar',
    'lemas sekali',
    'sangat lemas',
    'tidak mau minum',
    'dehidrasi',
    'muntah terus',
    'diare terus',
    'demam tinggi',
    'panas tinggi',
  ]

  const sleepKeywords = [
    'tidur',
    'bobo',
    'bobok',
    'ngantuk',
    'begadang',
    'sering bangun',
    'rewel malam',
    'susah tidur',
    'jam tidur',
    'waktu tidur',
    'durasi tidur',
    'berapa jam',
    'normalnya berapa',
  ]

  const eatingProblemKeywords = [
    'susah makan',
    'sulit makan',
    'tidak mau makan',
    'ga mau makan',
    'gak mau makan',
    'nggak mau makan',
    'anak susah',
    'makan susah',
    'makan sedikit',
    'nafsu makan',
    'pilih pilih makan',
    'menolak makan',
    'gtm',
    'gerakan tutup mulut',
    'tetap makan',
  ]

  const eatingGeneralKeywords = [
    'makan',
    'makanan',
    'mpasi',
    'menu',
    'gizi',
    'protein',
    'karbohidrat',
    'sayur',
    'buah',
    'cemilan',
    'camilan',
    'susu',
    'asi',
    'vitamin',
  ]

  const weightKeywords = [
    'berat badan',
    'beratnya',
    'bb',
    'kurus',
    'gemuk',
    'status gizi',
    'gizi buruk',
    'gizi kurang',
    'gizi lebih',
    'naik berat',
    'turun berat',
  ]

  const heightKeywords = [
    'tinggi badan',
    'tingginya',
    'tb',
    'stunting',
    'pendek',
    'pertumbuhan tinggi',
  ]

  const immunizationKeywords = [
    'imunisasi',
    'vaksin',
    'jadwal imunisasi',
    'bcg',
    'dpt',
    'polio',
    'campak',
    'hib',
    'hepatitis',
    'rotavirus',
  ]

  const sickKeywords = [
    'demam',
    'panas',
    'batuk',
    'pilek',
    'flu',
    'muntah',
    'diare',
    'sakit',
    'ruam',
    'alergi',
    'gatal',
    'obat',
  ]

  const developmentKeywords = [
    'tumbuh kembang',
    'perkembangan',
    'pertumbuhan',
    'motorik',
    'bicara',
    'jalan',
    'berjalan',
    'merangkak',
    'duduk',
    'berdiri',
    'aktif',
    'terlambat',
  ]

  const posyanduKeywords = [
    'posyandu',
    'kader',
    'puskesmas',
    'buku kia',
    'kia',
    'jadwal posyandu',
    'kunjungan',
    'agenda',
    'pemeriksaan',
  ]

  if (hasAny(text, emergencyKeywords)) return 'emergency'
  if (hasAny(text, sleepKeywords)) return 'sleep'
  if (hasAny(text, eatingProblemKeywords)) return 'eating_problem'
  if (hasAny(text, weightKeywords)) return 'weight'
  if (hasAny(text, heightKeywords)) return 'height'
  if (hasAny(text, eatingGeneralKeywords)) return 'food'
  if (hasAny(text, immunizationKeywords)) return 'immunization'
  if (hasAny(text, sickKeywords)) return 'sick'
  if (hasAny(text, developmentKeywords)) return 'development'
  if (hasAny(text, posyanduKeywords)) return 'posyandu'

  return 'general'
}

function buildReply({ pesan, balita, pertumbuhanTerakhir }) {
  const text = normalizeText(pesan)
  const ctx = getChildContext(balita, pertumbuhanTerakhir)

  if (isGreeting(text)) {
    return `Halo, saya Asisten Posyandu Ceria. Saya bisa membantu menjawab pertanyaan seputar balita, tumbuh kembang, gizi, imunisasi, tidur, dan kesehatan anak.

Silakan tanyakan keluhan atau kebutuhan terkait ${ctx.nama}, misalnya:
- anak susah makan,
- berat badan sulit naik,
- jadwal imunisasi,
- waktu tidur anak,
- demam atau batuk,
- atau rekomendasi gizi harian.`
  }

  if (!isAllowedTopic(text)) {
    return `Maaf, obrolanmu di luar topik Posyandu Ceria.

Saya hanya bisa membantu menjawab pertanyaan seputar posyandu, balita, tumbuh kembang anak, gizi, imunisasi, tidur, dan kesehatan anak.`
  }

  const intent = getIntent(text)

  if (intent === 'emergency') {
    return `Untuk kondisi seperti ini, sebaiknya ${ctx.nama} segera diperiksa langsung ke tenaga kesehatan ya.

Tanda seperti kejang, sesak napas, sangat lemas, tidak mau minum, muntah terus-menerus, diare berat, atau demam tinggi termasuk kondisi yang perlu ditangani segera.

Chat ini hanya membantu memberi informasi awal, jadi untuk kondisi yang mengkhawatirkan jangan menunggu terlalu lama.`
  }

  if (intent === 'sleep') {
    return `Untuk ${ctx.nama} yang berusia ${ctx.usia}, waktu tidur yang umumnya dianjurkan adalah sekitar ${ctx.tidur.range}.

Karena ${ctx.nama} termasuk kategori ${ctx.tidur.label}, ${ctx.tidur.note}. Tidur yang cukup penting untuk membantu pertumbuhan, daya tahan tubuh, mood, dan perkembangan anak.

Tips agar tidur anak lebih teratur:
1. Buat jam tidur dan bangun yang konsisten setiap hari.
2. Kurangi aktivitas yang terlalu aktif menjelang tidur.
3. Hindari layar HP/TV sebelum tidur.
4. Buat suasana kamar lebih tenang, redup, dan nyaman.
5. Pastikan anak tidak terlalu lapar atau terlalu kenyang sebelum tidur.

Kalau ${ctx.nama} sering sulit tidur, sering terbangun, mendengkur berat, sesak saat tidur, atau tampak sangat lelah di siang hari, sebaiknya konsultasikan ke tenaga kesehatan.`
  }

  if (intent === 'eating_problem') {
    return `Kalau ${ctx.nama} sedang susah makan, coba lakukan pelan-pelan ya. Untuk usia ${ctx.usia}, anak memang bisa mengalami fase pilih-pilih makanan atau nafsu makan menurun.

Beberapa cara yang bisa dicoba:
1. Berikan porsi kecil tapi lebih sering, jangan langsung dipaksa makan banyak.
2. Buat jadwal makan yang teratur, misalnya 3 kali makan utama dan 2 kali selingan.
3. Hindari terlalu banyak susu, camilan manis, atau minuman manis sebelum jam makan.
4. Variasikan tekstur dan bentuk makanan supaya anak tidak bosan.
5. Ajak makan bersama keluarga agar anak tertarik meniru.
6. Tetap tenang saat anak menolak makan, jangan dipaksa berlebihan karena bisa membuat anak makin menolak.

Data terakhir ${ctx.nama}: BB ${ctx.bb}, TB ${ctx.tb}, status gizi ${ctx.statusGizi}, terakhir diukur ${ctx.tanggalUkur}. Kalau nafsu makan terus menurun, berat badan tidak naik, anak tampak lemas, atau susah makan berlangsung lama, sebaiknya konsultasi langsung ke kader posyandu atau puskesmas.`
  }

  if (intent === 'weight') {
    return `Berdasarkan data terakhir, ${ctx.nama} memiliki BB ${ctx.bb}, TB ${ctx.tb}, dan status gizi ${ctx.statusGizi}. Data ini terakhir dicatat pada ${ctx.tanggalUkur}.

Untuk menilai apakah berat badan sudah sesuai atau belum, perlu dibandingkan dengan umur, jenis kelamin, dan grafik pertumbuhan. Kalau berat badan tidak naik dalam beberapa kali penimbangan, turun, atau status gizinya kurang, sebaiknya dilakukan pemantauan lebih dekat di posyandu.

Saran umumnya:
1. Pastikan makan utama tetap teratur.
2. Tambahkan sumber protein seperti telur, ikan, ayam, tahu, atau tempe.
3. Berikan camilan sehat seperti buah, bubur kacang hijau, atau makanan tinggi energi sesuai usia.
4. Pantau berat badan setiap bulan.`
  }

  if (intent === 'height') {
    return `Untuk pertumbuhan tinggi badan ${ctx.nama}, data terakhir menunjukkan TB ${ctx.tb} dengan status gizi ${ctx.statusGizi}. Pengukuran terakhir tercatat pada ${ctx.tanggalUkur}.

Tinggi badan anak perlu dipantau secara rutin karena berkaitan dengan pertumbuhan jangka panjang. Jika tinggi badan terlihat lebih pendek dibanding anak seusianya, atau grafik tinggi badan tidak naik sesuai umur, sebaiknya konsultasikan ke kader posyandu atau puskesmas.

Hal yang bisa didukung di rumah:
1. Cukupi protein hewani seperti telur, ikan, ayam, atau daging sesuai kemampuan keluarga.
2. Pastikan anak cukup tidur.
3. Pantau tinggi dan berat badan secara rutin.
4. Lengkapi imunisasi dan perhatikan kebersihan makanan.`
  }

  if (intent === 'food') {
    return `Untuk menu makanan ${ctx.nama}, usahakan isinya seimbang ya, tidak hanya nasi atau bubur saja.

Contoh susunan menu sederhana:
1. Karbohidrat: nasi, bubur, kentang, atau ubi.
2. Protein hewani: telur, ikan, ayam, hati ayam, atau daging.
3. Protein nabati: tahu, tempe, atau kacang-kacangan.
4. Sayur dan buah secukupnya.
5. Lemak sehat secukupnya, misalnya dari santan, minyak, atau alpukat sesuai usia.

Kalau ${ctx.nama} susah makan, berikan porsi kecil dulu tetapi lebih sering. Yang penting anak tetap mendapat makanan bergizi dan dipantau berat badannya secara rutin.`
  }

  if (intent === 'immunization') {
    return `Imunisasi penting untuk membantu melindungi ${ctx.nama} dari beberapa penyakit yang dapat dicegah.

Coba cek kembali jadwal imunisasi di buku KIA atau menu imunisasi pada aplikasi. Jika ada imunisasi yang terlewat, biasanya masih bisa dijadwalkan susulan, tetapi sebaiknya dikonfirmasi langsung ke kader posyandu atau puskesmas.

Kalau setelah imunisasi anak demam ringan, biasanya masih wajar. Namun jika demam tinggi, kejang, sesak, atau anak tampak sangat lemas, segera bawa ke tenaga kesehatan.`
  }

  if (intent === 'sick') {
    return `Kalau ${ctx.nama} sedang kurang sehat, hal pertama yang perlu dilakukan adalah memantau kondisi anak dan memperhatikan tanda bahaya.

Yang bisa dilakukan di rumah:
1. Pastikan anak cukup minum.
2. Biarkan anak istirahat cukup.
3. Pantau suhu tubuh jika demam.
4. Perhatikan apakah ada muntah, diare, sesak, ruam, atau anak tampak lemas.
5. Jangan memberi obat sembarangan tanpa arahan tenaga kesehatan.

Segera periksa ke puskesmas atau dokter jika demam tinggi, anak sangat lemas, tidak mau minum, sesak, kejang, muntah terus-menerus, atau diare berat.`
  }

  if (intent === 'development') {
    return `Untuk tumbuh kembang ${ctx.nama}, pemantauan perlu dilihat dari beberapa aspek seperti berat badan, tinggi badan, kemampuan bergerak, bicara, interaksi sosial, dan kebiasaan sehari-hari.

Data terakhir ${ctx.nama}: BB ${ctx.bb}, TB ${ctx.tb}, LK ${ctx.lk}, status gizi ${ctx.statusGizi}, terakhir diukur ${ctx.tanggalUkur}.

Yang bisa dilakukan orang tua:
1. Pantau berat dan tinggi badan secara rutin di posyandu.
2. Berikan stimulasi sesuai usia, seperti mengajak bicara, bermain, membaca, dan bergerak aktif.
3. Pastikan makanan bergizi seimbang.
4. Cukupi waktu tidur.
5. Lengkapi imunisasi.

Jika ${ctx.nama} terlihat terlambat bicara, belum bisa melakukan kemampuan sesuai usianya, atau pertumbuhannya tidak naik dalam beberapa bulan, sebaiknya konsultasi langsung ke kader posyandu atau puskesmas.`
  }

  if (intent === 'posyandu') {
    return `Posyandu membantu memantau kesehatan dan tumbuh kembang anak secara rutin.

Biasanya kegiatan posyandu meliputi:
1. Penimbangan berat badan.
2. Pengukuran tinggi badan dan lingkar kepala.
3. Pemantauan status gizi.
4. Imunisasi sesuai jadwal.
5. Edukasi gizi dan kesehatan anak.
6. Rujukan ke puskesmas jika ditemukan tanda masalah kesehatan.

Untuk ${ctx.nama}, data terakhir yang tercatat adalah BB ${ctx.bb}, TB ${ctx.tb}, LK ${ctx.lk}, dan status gizi ${ctx.statusGizi}.`
  }

  return `Saya bantu jawab secara umum ya.

Untuk ${ctx.nama}, usia ${ctx.usia}, data terakhir menunjukkan BB ${ctx.bb}, TB ${ctx.tb}, LK ${ctx.lk}, dan status gizi ${ctx.statusGizi}. Pengukuran terakhir tercatat pada ${ctx.tanggalUkur}.

Agar pemantauan tumbuh kembang tetap baik, lakukan beberapa hal berikut:
1. Pantau berat dan tinggi badan secara rutin di posyandu.
2. Pastikan makanan anak bergizi seimbang.
3. Lengkapi imunisasi sesuai jadwal.
4. Pastikan anak cukup tidur. Untuk usia ${ctx.usia}, umumnya waktu tidur yang dianjurkan adalah ${ctx.tidur.range}.
5. Perhatikan tanda bahaya seperti demam tinggi, sesak, kejang, muntah terus, diare berat, atau anak sangat lemas.

Kalau boleh, coba tulis keluhannya lebih spesifik, misalnya: anak susah makan, berat badan sulit naik, sering demam, susah tidur, atau belum bisa melakukan kemampuan tertentu sesuai usianya.`
}

const getRiwayat = async (req, res) => {
  try {
    const balita = await Balita.findOne({
      where: getBalitaWhere(req),
    })

    if (!balita) {
      return res.status(404).json({
        success: false,
        message: 'Balita tidak ditemukan atau bukan milik akun ini',
      })
    }

    const where = {
      user_id: req.user.id,
      balita_id: req.params.balita_id,
    }

    if (req.query.session_id) {
      where.session_id = req.query.session_id
    }

    const data = await ChatHistory.findAll({
      where,
      order: [['createdAt', 'ASC']],
      limit: 150,
    })

    return res.json({
      success: true,
      data,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

const kirimPesan = async (req, res) => {
  try {
    const pesan = String(req.body?.pesan || '').trim()
    const sessionId =
      req.body?.session_id || `${req.user.id}-${req.params.balita_id}-${Date.now()}`

    if (!pesan) {
      return res.status(400).json({
        success: false,
        message: 'Pesan tidak boleh kosong',
      })
    }

    const balita = await Balita.findOne({
      where: getBalitaWhere(req),
    })

    if (!balita) {
      return res.status(404).json({
        success: false,
        message: 'Balita tidak ditemukan atau bukan milik akun ini',
      })
    }

    const pertumbuhanTerakhir = await Pertumbuhan.findOne({
      where: {
        balita_id: req.params.balita_id,
      },
      order: [['tanggal_ukur', 'DESC']],
    })

    const userMessage = await ChatHistory.create({
      user_id: req.user.id,
      balita_id: req.params.balita_id,
      role: 'user',
      pesan,
      session_id: sessionId,
    })

    const reply = buildReply({
      pesan,
      balita,
      pertumbuhanTerakhir,
    })

    const assistantMessage = await ChatHistory.create({
      user_id: req.user.id,
      balita_id: req.params.balita_id,
      role: 'assistant',
      pesan: reply,
      session_id: sessionId,
    })

    return res.json({
      success: true,
      data: {
        session_id: sessionId,
        user_message: userMessage,
        assistant_message: assistantMessage,
        pesan: reply,
        createdAt: assistantMessage.createdAt,
      },
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

const hapusRiwayat = async (req, res) => {
  try {
    const balita = await Balita.findOne({
      where: getBalitaWhere(req),
    })

    if (!balita) {
      return res.status(404).json({
        success: false,
        message: 'Balita tidak ditemukan atau bukan milik akun ini',
      })
    }

    const deleted = await ChatHistory.destroy({
      where: {
        user_id: req.user.id,
        balita_id: req.params.balita_id,
        session_id: req.params.session_id,
      },
    })

    return res.json({
      success: true,
      message: 'Riwayat chat berhasil dihapus',
      deleted,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

module.exports = {
  getRiwayat,
  kirimPesan,
  hapusRiwayat,
}