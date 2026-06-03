const { Penanganan, Balita, User } = require('../models')

const safeStringify = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

const buildPayload = (body = {}) => {
  return {
    tanggal: body.tanggal,
    jenis_masalah: body.jenis_masalah || 'lainnya',
    tindakan: safeStringify(body.tindakan) || 'Catatan penanganan belum diisi',
    perkembangan: body.perkembangan || null,
    dilakukan_oleh: body.dilakukan_oleh || 'orang_tua',
  }
}

const getByBalita = async (req, res) => {
  try {
    // Ortu ownership guard — a parent may only read penanganan for their own balita
    const balita = await Balita.findByPk(req.params.balita_id)
    if (!balita) return res.status(404).json({ success: false, message: 'Balita tidak ditemukan' })
    if (req.user.role === 'orang_tua' && balita.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke data balita ini' })
    }

    const data = await Penanganan.findAll({
      where: {
        balita_id: req.params.balita_id,
      },
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'nama'],
        },
      ],
      order: [
        ['tanggal', 'DESC'],
        ['createdAt', 'DESC'],
      ],
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

const create = async (req, res) => {
  try {
    const balita = await Balita.findByPk(req.params.balita_id)

    if (!balita) {
      return res.status(404).json({
        success: false,
        message: 'Balita tidak ditemukan',
      })
    }

    const payload = buildPayload(req.body)

    if (!payload.tanggal) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal penanganan wajib diisi',
      })
    }
    // Tindakan column is NOT NULL in the DB — guard it here for a clear 422.
    if (!payload.tindakan || !String(payload.tindakan).trim()) {
      return res.status(422).json({
        success: false,
        message: 'Tindakan penanganan wajib diisi',
      })
    }

    const penanganan = await Penanganan.create({
      balita_id: req.params.balita_id,
      admin_id: req.user.id,
      tanggal: payload.tanggal,
      jenis_masalah: payload.jenis_masalah,
      tindakan: payload.tindakan,
      perkembangan: payload.perkembangan,
      dilakukan_oleh: payload.dilakukan_oleh,
    })

    return res.status(201).json({
      success: true,
      message: 'Data penanganan berhasil ditambahkan',
      data: penanganan,
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
    const penanganan = await Penanganan.findByPk(req.params.id)

    if (!penanganan) {
      return res.status(404).json({
        success: false,
        message: 'Data penanganan tidak ditemukan',
      })
    }

    const payload = buildPayload(req.body)

    if (!payload.tanggal) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal penanganan wajib diisi',
      })
    }

    await penanganan.update({
      tanggal: payload.tanggal,
      jenis_masalah: payload.jenis_masalah,
      tindakan: payload.tindakan,
      perkembangan: payload.perkembangan,
      dilakukan_oleh: payload.dilakukan_oleh,
    })

    return res.json({
      success: true,
      message: 'Data penanganan berhasil diupdate',
      data: penanganan,
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
    const penanganan = await Penanganan.findByPk(req.params.id)

    if (!penanganan) {
      return res.status(404).json({
        success: false,
        message: 'Data penanganan tidak ditemukan',
      })
    }

    await penanganan.destroy()

    return res.json({
      success: true,
      message: 'Data penanganan berhasil dihapus',
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

module.exports = {
  getByBalita,
  create,
  update,
  remove,
}