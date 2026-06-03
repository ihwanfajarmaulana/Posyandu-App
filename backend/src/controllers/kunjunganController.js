const { Kunjungan, Balita, User } = require('../models')
const { Op } = require('sequelize')

const parseLimit = (value) => {
  return Math.min(Math.max(parseInt(value || 10, 10) || 10, 1), 100)
}

const normalizeJenisKunjungan = (value) => {
  const allowed = ['rutin', 'imunisasi', 'konsultasi', 'lainnya']

  if (!value) return 'rutin'

  const normalized = String(value).toLowerCase().replace(/\s+/g, '_')

  if (allowed.includes(normalized)) return normalized
  if (normalized.includes('imunisasi')) return 'imunisasi'
  if (normalized.includes('konsultasi')) return 'konsultasi'
  if (normalized.includes('rutin')) return 'rutin'

  return 'lainnya'
}

const normalizeStatus = (value) => {
  return value === 'terlewat' ? 'terlewat' : 'hadir'
}

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value) return []

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null

  const number = Number(value)
  return Number.isNaN(number) ? null : number
}

const buildKondisiPayload = (body = {}) => {
  return {
    konsultasi: toArray(body.konsultasi),
    kondisi_anak: toArray(body.kondisi_anak),

    keluhan_utama: body.keluhan_utama || '',
    durasi_keluhan: body.durasi_keluhan || '',
    penanganan_awal: body.penanganan_awal || '',
    petugas_bekerja: body.petugas_bekerja || '',

    tindakan_berikutnya: body.tindakan_berikutnya || '',
    pengingat_ortu:
      body.pengingat_ortu !== undefined
        ? Boolean(body.pengingat_ortu)
        : Boolean(body.pengingat_orangtua),
  }
}

const canAccessBalita = async (req, balitaId) => {
  const balita = await Balita.findByPk(balitaId)

  if (!balita) {
    return {
      allowed: false,
      status: 404,
      message: 'Balita tidak ditemukan',
    }
  }

  if (req.user.role === 'orang_tua' && balita.user_id !== req.user.id) {
    return {
      allowed: false,
      status: 403,
      message: 'Tidak boleh mengakses data balita ini',
    }
  }

  return {
    allowed: true,
    balita,
  }
}

const getAll = async (req, res) => {
  try {
    const { balita_id, from, to, page = 1 } = req.query
    const limit = parseLimit(req.query.limit)

    const where = {}

    if (balita_id) {
      where.balita_id = balita_id
    }

    if (from || to) {
      where.tanggal_kunjungan = {}

      if (from) {
        where.tanggal_kunjungan[Op.gte] = from
      }

      if (to) {
        where.tanggal_kunjungan[Op.lte] = to
      }
    }

    const balitaWhere = {}

    if (req.user.role === 'orang_tua') {
      balitaWhere.user_id = req.user.id
    }

    const { count, rows } = await Kunjungan.findAndCountAll({
      where,
      include: [
        {
          model: Balita,
          as: 'balita',
          where: balitaWhere,
          attributes: [
            'id',
            'nama',
            'tanggal_lahir',
            'jenis_kelamin',
            'nama_ibu',
            'user_id',
          ],
        },
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'nama'],
        },
      ],
      limit,
      offset: (parseInt(page, 10) - 1) * limit,
      order: [
        ['tanggal_kunjungan', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    })

    return res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page, 10),
      limit,
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
      balita_id,
      tanggal_kunjungan,
      jam_kunjungan,
      jenis_kunjungan,
      status,
      petugas,

      berat_badan,
      tinggi_badan,
      lingkar_kepala,
      status_gizi,
      suhu_tubuh,

      jadwal_berikutnya,
      lokasi_posyandu,
      catatan,
    } = req.body

    if (!balita_id) {
      return res.status(422).json({
        success: false,
        message: 'balita_id wajib diisi',
      })
    }

    if (!tanggal_kunjungan) {
      return res.status(422).json({
        success: false,
        message: 'tanggal_kunjungan wajib diisi',
      })
    }

    const access = await canAccessBalita(req, balita_id)

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      })
    }

    const kunjungan = await Kunjungan.create({
      balita_id,
      admin_id: req.user.id,

      tanggal_kunjungan,
      jam_kunjungan: jam_kunjungan || null,
      jenis_kunjungan: normalizeJenisKunjungan(jenis_kunjungan),
      status: normalizeStatus(status),
      petugas: petugas || null,

      berat_badan: toNumberOrNull(berat_badan),
      tinggi_badan: toNumberOrNull(tinggi_badan),
      lingkar_kepala: toNumberOrNull(lingkar_kepala),
      status_gizi: status_gizi || null,
      suhu_tubuh: toNumberOrNull(suhu_tubuh),

      imunisasi: toArray(req.body.imunisasi),
      kondisi: buildKondisiPayload(req.body),

      jadwal_berikutnya: jadwal_berikutnya || null,
      imunisasi_berikutnya: req.body.tindakan_berikutnya || null,
      lokasi_posyandu: lokasi_posyandu || null,
      pengingat_orangtua:
        req.body.pengingat_ortu !== undefined
          ? Boolean(req.body.pengingat_ortu)
          : Boolean(req.body.pengingat_orangtua),

      catatan: catatan || null,
    })

    return res.status(201).json({
      success: true,
      message: 'Kunjungan berhasil dicatat',
      data: kunjungan,
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
    const kunjungan = await Kunjungan.findByPk(req.params.id)

    if (!kunjungan) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan',
      })
    }

    const payload = {
      tanggal_kunjungan: req.body.tanggal_kunjungan || kunjungan.tanggal_kunjungan,
      jam_kunjungan: req.body.jam_kunjungan || null,
      jenis_kunjungan: normalizeJenisKunjungan(req.body.jenis_kunjungan),
      status: normalizeStatus(req.body.status),
      petugas: req.body.petugas || null,

      berat_badan: toNumberOrNull(req.body.berat_badan),
      tinggi_badan: toNumberOrNull(req.body.tinggi_badan),
      lingkar_kepala: toNumberOrNull(req.body.lingkar_kepala),
      status_gizi: req.body.status_gizi || null,
      suhu_tubuh: toNumberOrNull(req.body.suhu_tubuh),

      imunisasi: toArray(req.body.imunisasi),
      kondisi: buildKondisiPayload(req.body),

      jadwal_berikutnya: req.body.jadwal_berikutnya || null,
      imunisasi_berikutnya: req.body.tindakan_berikutnya || null,
      lokasi_posyandu: req.body.lokasi_posyandu || null,
      pengingat_orangtua:
        req.body.pengingat_ortu !== undefined
          ? Boolean(req.body.pengingat_ortu)
          : Boolean(req.body.pengingat_orangtua),

      catatan: req.body.catatan || null,
    }

    await kunjungan.update(payload)

    return res.json({
      success: true,
      message: 'Data kunjungan berhasil diupdate',
      data: kunjungan,
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
    const kunjungan = await Kunjungan.findByPk(req.params.id)

    if (!kunjungan) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan',
      })
    }

    await kunjungan.destroy()

    return res.json({
      success: true,
      message: 'Data kunjungan berhasil dihapus',
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
  create,
  update,
  remove,
}