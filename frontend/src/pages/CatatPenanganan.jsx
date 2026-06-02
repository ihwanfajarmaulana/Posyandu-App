import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../api'

const today = new Date().toISOString().slice(0, 10)

const actionOptions = [
  {
    id: 'makan_bergizi',
    icon: '🍲',
    title: 'Meningkatkan makan bergizi',
    desc: 'Berikan porsi makan lebih banyak dari biasanya.',
  },
  {
    id: 'susu',
    icon: '🍼',
    title: 'Rutin memberikan susu',
    desc: 'Berikan susu secara rutin sesuai usia dan kebutuhan anak.',
  },
  {
    id: 'protein',
    icon: '🥩',
    title: 'Menambah asupan protein',
    desc: 'Protein seperti telur, ikan, daging, tempe, dan tahu.',
  },
  {
    id: 'vitamin',
    icon: '💊',
    title: 'Memberikan vitamin/suplemen',
    desc: 'Seperti vitamin A, vitamin C, zinc, zat besi, dan lainnya.',
  },
  {
    id: 'sayur_buah',
    icon: '🥦',
    title: 'Memberikan sayur dan buah',
    desc: 'Konsumsi sayur dan buah setiap hari untuk memenuhi kebutuhan vitamin dan serat.',
  },
  {
    id: 'kurangi_manis',
    icon: '🍟',
    title: 'Mengurangi makanan instan dan manis',
    desc: 'Kurangi makanan instan dan makanan tinggi gula.',
  },
  {
    id: 'aktivitas',
    icon: '🏃',
    title: 'Meningkatkan aktivitas fisik',
    desc: 'Ajak anak bermain di luar ruangan dengan aman.',
  },
  {
    id: 'tidur',
    icon: '🛏️',
    title: 'Tidur yang cukup dan teratur',
    desc: 'Tidur membantu proses pertumbuhan berjalan optimal.',
  },
  {
    id: 'posyandu',
    icon: '📋',
    title: 'Rutin mengikuti kegiatan Posyandu',
    desc: 'Ikuti pemeriksaan di posyandu untuk memantau kesehatan dan pertumbuhan anak.',
  },
]

const defaultRecommendations = [
  {
    id: 1,
    icon: '🥗',
    title: 'Perbanyak konsumsi protein hewani',
    desc: 'Perbanyak konsumsi protein hewani seperti telur, ikan, daging, tempe, dan tahu sebanyak 2–3 kali sehari untuk membantu pertumbuhan anak.',
  },
  {
    id: 2,
    icon: '🎯',
    title: 'Mengurangi jajanan manis dan instan',
    desc: 'Batasi konsumsi makanan manis dan instan, maksimal 1–2 kali seminggu agar kebutuhan gizi anak tetap terjaga.',
  },
  {
    id: 3,
    icon: '💧',
    title: 'Mencukupi kebutuhan air putih',
    desc: 'Pastikan anak minum air putih 6–8 gelas sehari agar tubuh tetap sehat dan terhidrasi.',
  },
  {
    id: 4,
    icon: '🍽️',
    title: 'Membiasakan sarapan sehat',
    desc: 'Biasakan anak sarapan seperti nasi, telur, susu, atau buah setiap pagi agar energi dan kebutuhan nutrisinya terpenuhi.',
  },
]

const iconChoices = ['🥗', '🎯', '💧', '🍽️', '🍼', '🥚', '🍎', '📋', '💪', '🩺']

const emptyModalForm = {
  icon: '🥗',
  title: '',
  desc: '',
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

  if (sekarang.getDate() < lahir.getDate()) {
    bulan -= 1
  }

  return Math.max(bulan, 0)
}

function formatUsia(bulan) {
  if (bulan === undefined || bulan === null || Number.isNaN(Number(bulan))) return '-'

  const total = Number(bulan)
  const tahun = Math.floor(total / 12)
  const sisaBulan = total % 12

  if (tahun <= 0) return `${sisaBulan} Bulan`
  if (sisaBulan === 0) return `${tahun} Tahun`

  return `${tahun} Tahun ${sisaBulan} Bulan`
}

function formatNumber(value, suffix = '') {
  if (value === undefined || value === null || value === '') return '-'

  const num = Number(value)
  if (Number.isNaN(num)) return '-'

  return `${num.toLocaleString('id-ID', {
    maximumFractionDigits: 1,
  })}${suffix}`
}

function getLatestGrowth(balita) {
  return balita?.pertumbuhan_terakhir || balita?.riwayat_pertumbuhan?.[0] || null
}

function getStatusGiziLabel(value) {
  if (!value) return 'Belum ada data'

  const cleaned = String(value).replace(/_/g, ' ').toLowerCase()

  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStatusClass(status) {
  const text = String(status || '').toLowerCase()

  if (text.includes('buruk') || text.includes('stunting') || text.includes('lebih')) return 'danger'
  if (text.includes('kurang') || text.includes('risiko')) return 'warning'

  return 'success'
}

function normalizeJenisMasalah(status) {
  const text = String(status || '').toLowerCase()

  if (text.includes('stunting')) return 'stunting'
  if (text.includes('buruk')) return 'gizi_buruk'
  if (text.includes('kurang')) return 'kurang_berat_badan'

  return 'lainnya'
}

export default function CatatPenanganan() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [balita, setBalita] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [selectedActions, setSelectedActions] = useState(['makan_bergizi', 'susu', 'posyandu'])
  const [recommendations, setRecommendations] = useState(defaultRecommendations)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [modalForm, setModalForm] = useState(emptyModalForm)
  const [editingId, setEditingId] = useState(null)

  const latestGrowth = useMemo(() => getLatestGrowth(balita), [balita])
  const usiaBulan = balita?.usia_bulan ?? hitungUsiaBulan(balita?.tanggal_lahir)

  const statusGizi = latestGrowth?.status_gizi || balita?.status_gizi || 'Belum ada data'
  const statusClass = getStatusClass(statusGizi)

  useEffect(() => {
    let mounted = true

    const loadBalita = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await API.get(`/balita/${id}`)
        const data = res.data?.data || res.data || null

        if (mounted) setBalita(data)
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || 'Gagal memuat data balita.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadBalita()

    return () => {
      mounted = false
    }
  }, [id])

  const toggleAction = (actionId) => {
    setSelectedActions((prev) => {
      if (prev.includes(actionId)) {
        return prev.filter((item) => item !== actionId)
      }

      return [...prev, actionId]
    })
  }

  const openAddModal = () => {
    setModalMode('add')
    setEditingId(null)
    setModalForm(emptyModalForm)
    setModalOpen(true)
  }

  const openEditModal = (item) => {
    setModalMode('edit')
    setEditingId(item.id)
    setModalForm({
      icon: item.icon || '🥗',
      title: item.title || '',
      desc: item.desc || '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalMode('add')
    setEditingId(null)
    setModalForm(emptyModalForm)
  }

  const saveRecommendation = (e) => {
    e.preventDefault()

    if (!modalForm.title.trim()) {
      alert('Judul rekomendasi wajib diisi.')
      return
    }

    if (!modalForm.desc.trim()) {
      alert('Deskripsi rekomendasi wajib diisi.')
      return
    }

    if (modalMode === 'edit') {
      setRecommendations((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                icon: modalForm.icon,
                title: modalForm.title.trim(),
                desc: modalForm.desc.trim(),
              }
            : item
        )
      )
    } else {
      setRecommendations((prev) => [
        ...prev,
        {
          id: Date.now(),
          icon: modalForm.icon,
          title: modalForm.title.trim(),
          desc: modalForm.desc.trim(),
        },
      ])
    }

    closeModal()
  }

  const deleteRecommendation = (recId) => {
    const confirmed = window.confirm('Hapus rekomendasi ini?')
    if (!confirmed) return

    setRecommendations((prev) => prev.filter((item) => item.id !== recId))
  }

  const postPenanganan = async (payload) => {
    try {
      return await API.post(`/balita/${id}/penanganan`, payload)
    } catch (err) {
      const message = String(err.response?.data?.message || '').toLowerCase()

      if (err.response?.status === 404 || message.includes('route tidak ditemukan')) {
        return await API.post(`/penanganan/${id}`, payload)
      }

      throw err
    }
  }

  const handleSubmit = async () => {
    if (selectedActions.length === 0) {
      alert('Pilih minimal satu penanganan yang sudah dilakukan orang tua.')
      return
    }

    setSaving(true)

    const selectedActionData = actionOptions.filter((item) => selectedActions.includes(item.id))

    const payload = {
      tanggal: today,
      jenis_masalah: normalizeJenisMasalah(statusGizi),
      dilakukan_oleh: 'orang_tua',
      perkembangan: `Penanganan dan rekomendasi untuk status gizi: ${statusGizi}`,
      tindakan: {
        checklist_orang_tua: selectedActionData,
        rekomendasi_orang_tua: recommendations,
        status_gizi_terakhir: statusGizi,
        tanggal_pengukuran: latestGrowth?.tanggal_ukur || latestGrowth?.tanggal_kunjungan || null,
      },
    }

    try {
      await postPenanganan(payload)

      alert('Penanganan dan rekomendasi berhasil disimpan.')
      navigate(`/penanganan-rekomendasi/${id}`)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data penanganan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="catat-page">
      <header className="catat-header">
        <div className="header-inner">
          <button type="button" className="back-button" onClick={() => navigate(`/penanganan-rekomendasi/${id}`)}>
            ←
          </button>

          <div>
            <h1>Penanganan & Rekomendasi</h1>
            <p>Data Anak</p>
          </div>
        </div>

        <button type="button" className="user-pill" onClick={() => navigate('/profil')}>
          👤 Yuyun Handayani
        </button>
      </header>

      <main className="catat-main">
        {error && <div className="alert-error">{error}</div>}

        <section className="detail-anak-card catat-anak-card">
          <div className="detail-anak-left">
            <div className="detail-avatar">
              {balita?.foto ? (
                <img src={balita.foto} alt={balita?.nama || 'Balita'} />
              ) : (
                <span>{balita?.jenis_kelamin === 'P' ? '👧' : '👦'}</span>
              )}
            </div>

            <div className="detail-anak-info">
              <h2>{loading ? 'Memuat data...' : balita?.nama || 'Nama Anak'}</h2>

              <div className="gender-row">
                <span className={balita?.jenis_kelamin === 'P' ? 'girl' : 'boy'}>
                  {balita?.jenis_kelamin === 'P' ? '♀ Perempuan' : '♂ Laki-laki'}
                </span>

                <span>{formatUsia(usiaBulan)}</span>
              </div>

              <div className="anak-detail-grid">
                <div>
                  <span>Tanggal Lahir</span>
                  <strong>{formatTanggal(balita?.tanggal_lahir)}</strong>
                </div>

                <div>
                  <span>ID Anak</span>
                  <strong>{balita?.nik || `AN-${String(balita?.id || '').padStart(5, '0')}`}</strong>
                </div>

                <div>
                  <span>BB Terakhir</span>
                  <strong>{formatNumber(latestGrowth?.berat_badan, ' Kg')}</strong>
                </div>

                <div>
                  <span>TB Terakhir</span>
                  <strong>{formatNumber(latestGrowth?.tinggi_badan, ' Cm')}</strong>
                </div>
              </div>

              <div className="status-mini-row">
                <span className={statusClass}>{getStatusGiziLabel(statusGizi)}</span>
                <span className={statusClass}>{latestGrowth?.status_tb_u || 'Perlu Dicek'}</span>
              </div>
            </div>
          </div>

          <div className={`detail-status-card ${statusClass}`}>
            <p>Status Gizi Terakhir</p>
            <h3>⚠ {getStatusGiziLabel(statusGizi)}</h3>
            <span>
              Berdasarkan pengukuran {formatTanggal(latestGrowth?.tanggal_ukur || latestGrowth?.tanggal_kunjungan)}
            </span>
          </div>
        </section>

        <section className="content-card action-section">
          <div className="section-title">
            <span>1</span>
            <h2>Penanganan yang Sudah Dilakukan Orang Tua</h2>
          </div>

          <div className="action-grid">
            {actionOptions.map((item) => {
              const checked = selectedActions.includes(item.id)

              return (
                <label key={item.id} className={`action-item ${checked ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAction(item.id)}
                  />

                  <div className="action-icon">{item.icon}</div>

                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                </label>
              )
            })}
          </div>

          <p className="info-note">
            Informasi ini didapat berdasarkan jawaban orang tua saat konsultasi.
          </p>
        </section>

        <section className="content-card recommendation-section">
          <div className="section-head">
            <div className="section-title">
              <span>2</span>
              <h2>Rekomendasi untuk Orang Tua (saran tindak lanjut)</h2>
            </div>

            <button type="button" className="small-add-btn" onClick={openAddModal}>
              + Tambah Rekomendasi Lain
            </button>
          </div>

          <div className="recommendation-list">
            {recommendations.map((item) => (
              <article key={item.id} className="recommendation-item">
                <div className="rec-icon">{item.icon}</div>

                <div className="rec-text">
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>

                <div className="rec-actions">
                  <button type="button" onClick={() => openEditModal(item)} title="Edit">
                    ✏️
                  </button>

                  <button type="button" onClick={() => deleteRecommendation(item.id)} title="Hapus">
                    🗑️
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-card save-section">
          <div>
            <div className="section-title">
              <span>3</span>
              <h2>Simpan dan Kirim ke Orang Tua</h2>
            </div>

            <p>
              Penanganan dan rekomendasi akan tersimpan di sistem dan dapat dilihat oleh orang tua melalui web.
            </p>
          </div>

          <button type="button" className="save-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Menyimpan...' : '✈ Simpan dan Kirim'}
          </button>
        </section>
      </main>

      {modalOpen && (
        <div className="modal-overlay">
          <form className="recommendation-modal" onSubmit={saveRecommendation}>
            <div className="modal-icon-preview">{modalForm.icon}</div>

            <h2>
              {modalMode === 'edit' ? 'Update Rekomendasi' : 'Tambahkan Rekomendasi Lain'}
            </h2>

            <p className="modal-subtitle">
              Isi rekomendasi tambahan untuk mendukung pertumbuhan dan kesehatan anak.
            </p>

            <label>
              Judul Rekomendasi
              <input
                type="text"
                value={modalForm.title}
                onChange={(e) =>
                  setModalForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Contoh: Perbanyak protein hewani"
              />
            </label>

            <label>
              Deskripsi Singkat
              <textarea
                value={modalForm.desc}
                onChange={(e) =>
                  setModalForm((prev) => ({
                    ...prev,
                    desc: e.target.value,
                  }))
                }
                placeholder="Tulis penjelasan singkat rekomendasi..."
                maxLength={300}
              />

              <small>{modalForm.desc.length}/300</small>
            </label>

            <div className="icon-picker">
              <span>Pilih Ikon</span>

              <div>
                {iconChoices.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={modalForm.icon === icon ? 'active' : ''}
                    onClick={() =>
                      setModalForm((prev) => ({
                        ...prev,
                        icon,
                      }))
                    }
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={closeModal}>
                Batal
              </button>

              <button type="submit" className="submit-btn">
                💾 {modalMode === 'edit' ? 'Update' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .catat-page {
          min-height: 100vh;
          background: #FAF7F5;
          color: #4E3B35;
          font-family: Inter, "Segoe UI", Arial, sans-serif;
        }

        .catat-header {
          min-height: 220px;
          background: #4F724D;
          color: #FFFFFF;
          padding: 34px 42px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          box-sizing: border-box;
        }

        .header-inner {
          display: flex;
          align-items: flex-start;
          gap: 18px;
        }

        .back-button {
          border: none;
          background: transparent;
          color: #FFFFFF;
          font-size: 34px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          margin-top: 2px;
        }

        .catat-header h1 {
          margin: 0;
          font-size: 34px;
          line-height: 1.15;
          font-weight: 700;
          letter-spacing: -0.8px;
        }

        .catat-header p {
          margin: 12px 0 0;
          font-size: 14px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.88);
        }

        .user-pill {
          border: none;
          border-radius: 999px;
          background: #F7E5D8;
          color: #7A4F43;
          padding: 10px 17px;
          font-size: 13px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          white-space: nowrap;
        }

        .catat-main {
          width: min(1280px, calc(100% - 72px));
          margin: -94px auto 0;
          padding-bottom: 70px;
        }

        .alert-error {
          background: #FEE2E2;
          color: #991B1B;
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 18px;
          font-size: 14px;
          font-weight: 700;
        }

        .detail-anak-card {
          background: #FFF7F7;
          border: 1px solid #F0CACA;
          border-radius: 17px;
          padding: 30px 34px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 1fr 250px;
          gap: 28px;
          align-items: center;
          box-shadow: 0 16px 40px rgba(50, 70, 50, 0.13);
          margin-bottom: 34px;
        }

        .detail-anak-left {
          display: flex;
          align-items: center;
          gap: 30px;
          min-width: 0;
        }

        .detail-avatar {
          width: 145px;
          height: 145px;
          border-radius: 999px;
          background: #E7F4E7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .detail-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .detail-anak-info h2 {
          margin: 0 0 7px;
          color: #7A4F43;
          font-size: 25px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -0.4px;
        }

        .gender-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
          color: #6B5247;
          font-size: 13px;
          font-weight: 850;
          flex-wrap: wrap;
        }

        .gender-row .boy {
          color: #2F80ED;
        }

        .gender-row .girl {
          color: #D364F7;
        }

        .anak-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(120px, 1fr));
          gap: 12px 36px;
        }

        .anak-detail-grid span {
          display: block;
          color: #7C6258;
          font-size: 12px;
          font-weight: 850;
          margin-bottom: 5px;
        }

        .anak-detail-grid strong {
          display: block;
          color: #493934;
          font-size: 14px;
          font-weight: 900;
        }

        .status-mini-row {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .status-mini-row span {
          font-size: 13px;
          font-weight: 900;
        }

        .status-mini-row .danger {
          color: #B42318;
        }

        .status-mini-row .warning {
          color: #9A6505;
        }

        .status-mini-row .success {
          color: #2F7D42;
        }

        .detail-status-card {
          min-height: 128px;
          border-radius: 16px;
          padding: 22px;
          box-sizing: border-box;
          text-align: center;
        }

        .detail-status-card.danger {
          background: #FF9F9F;
          color: #9D1A2E;
        }

        .detail-status-card.warning {
          background: #FFE4A6;
          color: #8A5A00;
        }

        .detail-status-card.success {
          background: #DDF4D7;
          color: #2F7D42;
        }

        .detail-status-card p {
          margin: 0 0 12px;
          font-size: 14px;
          font-weight: 900;
        }

        .detail-status-card h3 {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 0 0 12px;
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.5);
          font-size: 18px;
          line-height: 1;
          font-weight: 900;
        }

        .detail-status-card span {
          display: block;
          font-size: 12px;
          line-height: 1.45;
          font-weight: 700;
        }

        .content-card {
          background: #EAF4FF;
          border: 1px solid #D5E7FA;
          border-radius: 16px;
          padding: 18px 22px;
          box-sizing: border-box;
          margin-bottom: 22px;
          box-shadow: 0 8px 22px rgba(77, 114, 150, 0.08);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .section-title span {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: #6B5247;
          color: #FFFFFF;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
          flex-shrink: 0;
        }

        .section-title h2 {
          margin: 0;
          color: #6B4337;
          font-size: 17px;
          font-weight: 900;
          letter-spacing: -0.2px;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px 18px;
        }

        .action-item {
          min-height: 76px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.75);
          display: grid;
          grid-template-columns: 22px 42px 1fr;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          border-radius: 12px;
          padding: 10px 8px;
          transition: 0.2s ease;
        }

        .action-item:hover {
          background: rgba(255, 255, 255, 0.45);
        }

        .action-item input {
          width: 15px;
          height: 15px;
          accent-color: #4F724D;
          cursor: pointer;
        }

        .action-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.58);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .action-item strong {
          display: block;
          color: #5A3C34;
          font-size: 14px;
          font-weight: 900;
          line-height: 1.25;
          margin-bottom: 4px;
        }

        .action-item p {
          margin: 0;
          color: #5F6E78;
          font-size: 12px;
          line-height: 1.45;
          font-weight: 600;
        }

        .info-note {
          margin: 14px 0 0;
          color: #72818B;
          font-size: 12px;
          font-weight: 650;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
        }

        .section-head .section-title {
          margin-bottom: 0;
        }

        .small-add-btn {
          border: 1px solid #7DB8F3;
          background: #FFFFFF;
          color: #2F80ED;
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 850;
          font-family: inherit;
          cursor: pointer;
          white-space: nowrap;
        }

        .recommendation-list {
          display: grid;
          gap: 10px;
        }

        .recommendation-item {
          display: grid;
          grid-template-columns: 40px 1fr 76px;
          gap: 12px;
          align-items: center;
          background: rgba(255, 255, 255, 0.62);
          border-radius: 12px;
          padding: 12px 13px;
          border: 1px solid rgba(255, 255, 255, 0.72);
        }

        .rec-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .rec-text strong {
          display: block;
          color: #5A3C34;
          font-size: 14px;
          font-weight: 900;
          margin-bottom: 4px;
        }

        .rec-text p {
          margin: 0;
          color: #596F7D;
          font-size: 12px;
          line-height: 1.5;
          font-weight: 600;
        }

        .rec-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .rec-actions button {
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 9px;
          background: #FFFFFF;
          cursor: pointer;
          font-size: 15px;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
        }

        .save-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 22px;
        }

        .save-section .section-title {
          margin-bottom: 6px;
        }

        .save-section p {
          margin: 0;
          color: #596F7D;
          font-size: 13px;
          font-weight: 650;
        }

        .save-btn {
          border: none;
          border-radius: 12px;
          background: #4A90E2;
          color: #FFFFFF;
          min-height: 44px;
          padding: 0 22px;
          font-size: 14px;
          font-weight: 900;
          font-family: inherit;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 10px 20px rgba(74, 144, 226, 0.22);
        }

        .save-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.42);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
        }

        .recommendation-modal {
          width: min(430px, 100%);
          background: #FFFFFF;
          border-radius: 20px;
          padding: 28px;
          box-sizing: border-box;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25);
          text-align: center;
        }

        .modal-icon-preview {
          width: 64px;
          height: 64px;
          margin: -4px auto 14px;
          border-radius: 999px;
          background: #EEF7EA;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }

        .recommendation-modal h2 {
          margin: 0;
          color: #5A3C34;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.4px;
        }

        .modal-subtitle {
          margin: 9px 0 20px;
          color: #7B8B78;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 600;
        }

        .recommendation-modal label {
          display: block;
          text-align: left;
          color: #5A3C34;
          font-size: 13px;
          font-weight: 850;
          margin-bottom: 14px;
        }

        .recommendation-modal input,
        .recommendation-modal textarea {
          width: 100%;
          margin-top: 8px;
          border: 1px solid #D8E3D8;
          border-radius: 12px;
          padding: 12px 13px;
          box-sizing: border-box;
          font-family: inherit;
          font-size: 14px;
          color: #3E3A36;
          outline: none;
          background: #FFFFFF;
        }

        .recommendation-modal textarea {
          min-height: 96px;
          resize: vertical;
          line-height: 1.55;
        }

        .recommendation-modal small {
          display: block;
          margin-top: 6px;
          color: #9A9A9A;
          font-size: 11px;
          text-align: right;
        }

        .icon-picker {
          text-align: left;
          margin: 6px 0 22px;
        }

        .icon-picker > span {
          display: block;
          color: #5A3C34;
          font-size: 13px;
          font-weight: 850;
          margin-bottom: 9px;
        }

        .icon-picker > div {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .icon-picker button {
          width: 34px;
          height: 34px;
          border: 1px solid #D8E3D8;
          border-radius: 10px;
          background: #FFFFFF;
          cursor: pointer;
          font-size: 18px;
        }

        .icon-picker button.active {
          border-color: #4F724D;
          background: #EAF7EC;
          box-shadow: 0 0 0 2px rgba(79, 114, 77, 0.14);
        }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 12px;
        }

        .modal-actions button {
          min-height: 44px;
          border-radius: 12px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .cancel-btn {
          border: 1px solid #E1E6E1;
          background: #FFFFFF;
          color: #6B6B6B;
        }

        .submit-btn {
          border: none;
          background: #A45A45;
          color: #FFFFFF;
        }

        @media (max-width: 1100px) {
          .catat-main {
            width: calc(100% - 36px);
          }

          .detail-anak-card {
            grid-template-columns: 1fr;
          }

          .detail-status-card {
            width: 100%;
          }

          .action-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .catat-header {
            flex-direction: column;
            padding: 28px 20px 100px;
          }

          .catat-main {
            width: calc(100% - 28px);
          }

          .detail-anak-left {
            flex-direction: column;
            align-items: flex-start;
          }

          .detail-avatar {
            width: 120px;
            height: 120px;
            font-size: 52px;
          }

          .anak-detail-grid,
          .action-grid {
            grid-template-columns: 1fr;
          }

          .section-head,
          .save-section {
            flex-direction: column;
            align-items: stretch;
          }

          .small-add-btn,
          .save-btn {
            width: 100%;
          }

          .recommendation-item {
            grid-template-columns: 38px 1fr;
          }

          .rec-actions {
            grid-column: 1 / -1;
            justify-content: flex-end;
          }

          .modal-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}