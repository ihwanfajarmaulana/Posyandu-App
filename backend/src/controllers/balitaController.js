const { Op } = require('sequelize')
const { Balita, User, Pertumbuhan, Kunjungan, Imunisasi } = require('../models')

const hitungUsia = (tanggalLahir) => {
  if (!tanggalLahir) return 0

  const lahir = new Date(tanggalLahir)
  const sekarang = new Date()

  if (Number.isNaN(lahir.getTime())) return 0

  let usiaBulan =
    (sekarang.getFullYear() - lahir.getFullYear()) * 12 +
    (sekarang.getMonth() - lahir.getMonth())

  if (sekarang.getDate() < lahir.getDate()) {
    usiaBulan -= 1
  }

  return Math.max(usiaBulan, 0)
}

const getAll = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query

    const pageNumber = Math.max(parseInt(page) || 1, 1)
    const limitNumber = Math.max(parseInt(limit) || 10, 1)

    const where = {
      is_active: true,
    }

    if (req.user?.role === 'orang_tua') {
      where.user_id = req.user.id
    }

    if (search) {
      where[Op.or] = [
        {
          nama: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          nama_ibu: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          nik: {
            [Op.like]: `%${search}%`,
          },
        },
      ]
    }

    const { count, rows } = await Balita.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'orang_tua',
          attributes: ['id', 'nama', 'email', 'no_telepon'],
          required: false,
        },
        {
          model: Pertumbuhan,
          as: 'riwayat_pertumbuhan',
          attributes: [
            'id',
            'tanggal_ukur',
            'berat_badan',
            'tinggi_badan',
            'lingkar_kepala',
            'status_gizi',
            'is_stunting',
            'catatan',
          ],
          required: false,
          separate: true,
          limit: 1,
          order: [['tanggal_ukur', 'DESC']],
        },
        {
          model: Kunjungan,
          as: 'kunjungan',
          attributes: [
            'id',
            'tanggal_kunjungan',
            'jenis_kunjungan',
            'catatan',
          ],
          required: false,
          separate: true,
          limit: 1,
          order: [['tanggal_kunjungan', 'DESC']],
        },
        {
          model: Imunisasi,
          as: 'riwayat_imunisasi',
          attributes: [
            'id',
            'nama_vaksin',
            'tanggal_pemberian',
            'dosis',
            'tanggal_jadwal_berikutnya',
            'catatan',
            'reaksi',
          ],
          required: false,
          separate: true,
          limit: 1,
          order: [['tanggal_pemberian', 'DESC']],
        },
      ],
      limit: limitNumber,
      offset: (pageNumber - 1) * limitNumber,
      order: [['createdAt', 'DESC']],
      distinct: true,
    })

    const data = rows.map((balita) => {
      const item = balita.toJSON()

      const pertumbuhanTerakhir = item.riwayat_pertumbuhan?.[0] || null
      const kunjunganTerakhir = item.kunjungan?.[0] || null
      const imunisasiTerakhir = item.riwayat_imunisasi?.[0] || null

      return {
        ...item,
        usia_bulan: hitungUsia(item.tanggal_lahir),

        pertumbuhan_terakhir: pertumbuhanTerakhir,
        tanggal_ukur_terakhir: pertumbuhanTerakhir?.tanggal_ukur || null,

        kunjungan_terakhir: kunjunganTerakhir,
        tanggal_kunjungan_terakhir: kunjunganTerakhir?.tanggal_kunjungan || null,

        imunisasi_terakhir: imunisasiTerakhir,
        nama_imunisasi_terakhir: imunisasiTerakhir?.nama_vaksin || null,
        tanggal_imunisasi_terakhir: imunisasiTerakhir?.tanggal_pemberian || null,
        status_imunisasi: imunisasiTerakhir ? 'Sudah Imunisasi' : 'Perlu Dicek',
      }
    })

    return res.json({
      success: true,
      data,
      total: count,
      page: pageNumber,
      limit: limitNumber,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

const getById = async (req, res) => {
  try {
    const where = {
      id: req.params.id,
    }

    if (req.user?.role === 'orang_tua') {
      where.user_id = req.user.id
    }

    const balita = await Balita.findOne({
      where,
      include: [
        {
          model: User,
          as: 'orang_tua',
          attributes: ['id', 'nama', 'email', 'no_telepon'],
          required: false,
        },
        {
          model: Pertumbuhan,
          as: 'riwayat_pertumbuhan',
          attributes: [
            'id',
            'tanggal_ukur',
            'berat_badan',
            'tinggi_badan',
            'lingkar_kepala',
            'status_gizi',
            'is_stunting',
            'catatan',
          ],
          required: false,
          separate: true,
          limit: 1,
          order: [['tanggal_ukur', 'DESC']],
        },
        {
          model: Kunjungan,
          as: 'kunjungan',
          attributes: [
            'id',
            'tanggal_kunjungan',
            'jenis_kunjungan',
            'catatan',
          ],
          required: false,
          separate: true,
          limit: 1,
          order: [['tanggal_kunjungan', 'DESC']],
        },
        {
          model: Imunisasi,
          as: 'riwayat_imunisasi',
          attributes: [
            'id',
            'nama_vaksin',
            'tanggal_pemberian',
            'dosis',
            'tanggal_jadwal_berikutnya',
            'catatan',
            'reaksi',
          ],
          required: false,
          separate: true,
          limit: 1,
          order: [['tanggal_pemberian', 'DESC']],
        },
      ],
    })

    if (!balita) {
      return res.status(404).json({
        success: false,
        message: 'Balita tidak ditemukan',
      })
    }

    const item = balita.toJSON()

    const pertumbuhanTerakhir = item.riwayat_pertumbuhan?.[0] || null
    const kunjunganTerakhir = item.kunjungan?.[0] || null
    const imunisasiTerakhir = item.riwayat_imunisasi?.[0] || null

    return res.json({
      success: true,
      data: {
        ...item,
        usia_bulan: hitungUsia(item.tanggal_lahir),

        pertumbuhan_terakhir: pertumbuhanTerakhir,
        tanggal_ukur_terakhir: pertumbuhanTerakhir?.tanggal_ukur || null,

        kunjungan_terakhir: kunjunganTerakhir,
        tanggal_kunjungan_terakhir: kunjunganTerakhir?.tanggal_kunjungan || null,

        imunisasi_terakhir: imunisasiTerakhir,
        nama_imunisasi_terakhir: imunisasiTerakhir?.nama_vaksin || null,
        tanggal_imunisasi_terakhir: imunisasiTerakhir?.tanggal_pemberian || null,
        status_imunisasi: imunisasiTerakhir ? 'Sudah Imunisasi' : 'Perlu Dicek',
      },
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

const create = async (req, res) => {
  try {
    const {
      nama,
      tanggal_lahir,
      jenis_kelamin,
      nik,
      nama_ayah,
      nama_ibu,
      alamat,
      user_id,
    } = req.body

    if (!nama || !tanggal_lahir || !jenis_kelamin) {
      return res.status(400).json({
        success: false,
        message: 'Nama, tanggal lahir, dan jenis kelamin wajib diisi',
      })
    }

    // Resolve the parent account this balita belongs to.
    // - admin/pegawai may explicitly pass a parent's user_id
    // - ortu can only register a balita under their OWN id
    const assignedUserId =
      ['admin', 'pegawai'].includes(req.user?.role) && user_id
        ? user_id
        : req.user.id

    // Verify the target user exists and is actually an orang_tua so the balita
    // is never silently linked to an admin or a non-existent account.
    const targetUser = await User.findByPk(assignedUserId)
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Akun orang tua yang dipilih tidak ditemukan',
      })
    }
    if (targetUser.role !== 'orang_tua') {
      return res.status(422).json({
        success: false,
        message: 'Balita hanya bisa dihubungkan ke akun dengan role orang_tua',
      })
    }

    const balita = await Balita.create({
      nama,
      tanggal_lahir,
      jenis_kelamin,
      nik: nik || null,
      nama_ayah: nama_ayah || null,
      nama_ibu: nama_ibu || null,
      alamat: alamat || null,
      user_id: assignedUserId,
      is_active: true,
    })

    return res.status(201).json({
      success: true,
      message: 'Data balita berhasil ditambahkan',
      data: balita,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

const update = async (req, res) => {
  try {
    const where = {
      id: req.params.id,
    }

    if (req.user?.role === 'orang_tua') {
      where.user_id = req.user.id
    }

    const balita = await Balita.findOne({
      where,
    })

    if (!balita) {
      return res.status(404).json({
        success: false,
        message: 'Balita tidak ditemukan',
      })
    }

    const {
      nama,
      tanggal_lahir,
      jenis_kelamin,
      nik,
      nama_ayah,
      nama_ibu,
      alamat,
      user_id,
    } = req.body

    const payload = {
      nama: nama ?? balita.nama,
      tanggal_lahir: tanggal_lahir ?? balita.tanggal_lahir,
      jenis_kelamin: jenis_kelamin ?? balita.jenis_kelamin,
      nik: nik ?? balita.nik,
      nama_ayah: nama_ayah ?? balita.nama_ayah,
      nama_ibu: nama_ibu ?? balita.nama_ibu,
      alamat: alamat ?? balita.alamat,
    }

    if (['admin', 'pegawai'].includes(req.user?.role) && user_id) {
      // Same orang_tua validation as create — never reassign to a non-existent
      // user or to an admin.
      const targetUser = await User.findByPk(user_id)
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'Akun orang tua tidak ditemukan' })
      }
      if (targetUser.role !== 'orang_tua') {
        return res.status(422).json({ success: false, message: 'Balita hanya bisa dihubungkan ke akun dengan role orang_tua' })
      }
      payload.user_id = user_id
    }

    await balita.update(payload)

    return res.json({
      success: true,
      message: 'Data balita berhasil diupdate',
      data: balita,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

const remove = async (req, res) => {
  try {
    const where = {
      id: req.params.id,
    }

    if (req.user?.role === 'orang_tua') {
      where.user_id = req.user.id
    }

    const balita = await Balita.findOne({
      where,
    })

    if (!balita) {
      return res.status(404).json({
        success: false,
        message: 'Balita tidak ditemukan',
      })
    }

    await balita.update({
      is_active: false,
    })

    return res.json({
      success: true,
      message: 'Data balita berhasil dihapus',
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

const getRingkasan = async (req, res) => {
  try {
    const where = {
      id: req.params.id,
    }

    if (req.user?.role === 'orang_tua') {
      where.user_id = req.user.id
    }

    const balita = await Balita.findOne({
      where,
      include: [
        {
          model: User,
          as: 'orang_tua',
          attributes: ['id', 'nama', 'email', 'no_telepon'],
          required: false,
        },
      ],
    })

    if (!balita) {
      return res.status(404).json({
        success: false,
        message: 'Balita tidak ditemukan',
      })
    }

    const [totalKunjungan, pertumbuhanTerakhir, imunisasiTerakhir] =
      await Promise.all([
        Kunjungan.count({
          where: {
            balita_id: balita.id,
          },
        }),
        Pertumbuhan.findOne({
          where: {
            balita_id: balita.id,
          },
          attributes: [
            'id',
            'tanggal_ukur',
            'berat_badan',
            'tinggi_badan',
            'lingkar_kepala',
            'status_gizi',
            'is_stunting',
            'catatan',
          ],
          order: [['tanggal_ukur', 'DESC']],
        }),
        Imunisasi.findAll({
          where: {
            balita_id: balita.id,
          },
          attributes: [
            'id',
            'nama_vaksin',
            'tanggal_pemberian',
            'dosis',
            'tanggal_jadwal_berikutnya',
            'catatan',
            'reaksi',
          ],
          order: [['tanggal_pemberian', 'DESC']],
          limit: 5,
        }),
      ])

    return res.json({
      success: true,
      data: {
        balita: {
          ...balita.toJSON(),
          usia_bulan: hitungUsia(balita.tanggal_lahir),
          pertumbuhan_terakhir: pertumbuhanTerakhir,
          tanggal_ukur_terakhir: pertumbuhanTerakhir?.tanggal_ukur || null,
        },
        total_kunjungan: totalKunjungan,
        pertumbuhan_terakhir: pertumbuhanTerakhir,
        imunisasi_terakhir: imunisasiTerakhir,
      },
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getRingkasan,
}