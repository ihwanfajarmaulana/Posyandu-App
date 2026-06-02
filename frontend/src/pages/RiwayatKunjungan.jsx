import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../api'

const initialEditForm = {
  tanggal_kunjungan: '',
  jam_kunjungan: '',
  jenis_kunjungan: 'rutin',
  status: 'hadir',
  petugas: '',
  berat_badan: '',
  tinggi_badan: '',
  lingkar_kepala: '',
  status_gizi: 'Normal',
  suhu_tubuh: '',
  imunisasi: '',
  jadwal_berikutnya: '',
  imunisasi_berikutnya: '',
  lokasi_posyandu: 'Posyandu Ceria',
  pengingat_orangtua: false,
  catatan: '',
}

function parseJson(value) {
  if (!value) return {}
  if (typeof value === 'object') return value

  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

function toArray(value) {
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

function toInputDate(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatTanggal(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTanggalPanjang(value) {
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
  if (bulan === undefined || bulan === null || Number.isNaN(Number(bulan))) {
    return '-'
  }

  const total = Number(bulan)
  const tahun = Math.floor(total / 12)
  const sisaBulan = total % 12

  if (tahun <= 0) return `${sisaBulan} Bulan`
  if (sisaBulan === 0) return `${tahun} Tahun`

  return `${tahun} Tahun ${sisaBulan} Bulan`
}

function formatJenisKelamin(jk) {
  if (jk === 'L') return 'Laki-laki'
  if (jk === 'P') return 'Perempuan'
  return jk || '-'
}

function formatNumber(value, suffix = '') {
  if (value === undefined || value === null || value === '') return '-'

  const number = Number(value)
  if (Number.isNaN(number)) return '-'

  return `${number.toLocaleString('id-ID', {
    maximumFractionDigits: 1,
  })}${suffix}`
}

function parseNumber(value) {
  if (value === '' || value === null || value === undefined) return null

  const number = Number(value)
  return Number.isNaN(number) ? null : number
}

function getVisitDate(item) {
  return item?.tanggal_kunjungan || item?.tanggal || item?.createdAt
}

function getKondisi(item) {
  return parseJson(item?.kondisi)
}

function getBeratBadan(item) {
  const kondisi = getKondisi(item)
  return item?.berat_badan ?? kondisi?.berat_badan ?? ''
}

function getTinggiBadan(item) {
  const kondisi = getKondisi(item)
  return item?.tinggi_badan ?? kondisi?.tinggi_badan ?? ''
}

function getLingkarKepala(item) {
  const kondisi = getKondisi(item)
  return item?.lingkar_kepala ?? kondisi?.lingkar_kepala ?? ''
}

function getStatusGizi(item) {
  const kondisi = getKondisi(item)
  return item?.status_gizi || kondisi?.status_gizi || 'Normal'
}

function getSuhuTubuh(item) {
  const kondisi = getKondisi(item)
  return item?.suhu_tubuh ?? kondisi?.suhu_tubuh ?? ''
}

function getImunisasiText(item) {
  const imunisasiList = toArray(item?.imunisasi)

  if (imunisasiList.length > 0) {
    return imunisasiList.join(', ')
  }

  if (item?.imunisasi_berikutnya) return item.imunisasi_berikutnya
  if (item?.jenis_kunjungan === 'imunisasi') return 'Imunisasi'

  return '-'
}

function getCatatan(item) {
  const kondisi = getKondisi(item)

  return (
    item?.catatan ||
    kondisi?.catatan ||
    kondisi?.keluhan_utama ||
    kondisi?.penanganan_awal ||
    '-'
  )
}

function getStatusGiziLabel(value) {
  if (!value) return '-'

  const text = String(value).replace(/_/g, ' ').toLowerCase()

  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStatusBadgeClass(value) {
  const text = String(value || '').toLowerCase()

  if (text.includes('buruk') || text.includes('stunting')) return 'danger'
  if (text.includes('kurang') || text.includes('risiko')) return 'warning'

  return 'success'
}

function getDelta(currentValue, previousValue, suffix = '') {
  if (
    currentValue === undefined ||
    currentValue === null ||
    currentValue === '' ||
    previousValue === undefined ||
    previousValue === null ||
    previousValue === ''
  ) {
    return ''
  }

  const current = Number(currentValue)
  const previous = Number(previousValue)

  if (Number.isNaN(current) || Number.isNaN(previous)) return ''

  const diff = current - previous

  if (diff === 0) return 'Tidak berubah dari kunjungan lalu'

  const arrow = diff > 0 ? '↑' : '↓'
  const sign = diff > 0 ? '+' : '-'
  const value = Math.abs(diff).toLocaleString('id-ID', {
    maximumFractionDigits: 1,
  })

  return `${arrow} ${sign}${value}${suffix} dari kunjungan lalu`
}

function StatCard({ icon, title, value, subtitle, active }) {
  return (
    <div className={`visit-stat-card ${active ? 'active' : ''}`}>
      <div className="visit-stat-icon">{icon}</div>

      <div>
        <p>{title}</p>
        <h3>{value}</h3>
        {subtitle && <span>{subtitle}</span>}
      </div>
    </div>
  )
}

export default function RiwayatKunjungan() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [balita, setBalita] = useState(null)
  const [kunjungan, setKunjungan] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState(initialEditForm)
  const [saving, setSaving] = useState(false)

  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [balitaRes, kunjunganRes] = await Promise.all([
        API.get(`/balita/${id}`),
        API.get(`/kunjungan?balita_id=${id}&limit=100`),
      ])

      const balitaPayload = balitaRes.data?.data || balitaRes.data || null
      const kunjunganPayload = kunjunganRes.data

      const list = Array.isArray(kunjunganPayload)
        ? kunjunganPayload
        : Array.isArray(kunjunganPayload?.data)
          ? kunjunganPayload.data
          : []

      setBalita(balitaPayload)
      setKunjungan(list)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat riwayat kunjungan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const sortedKunjungan = useMemo(() => {
    return [...kunjungan].sort((a, b) => {
      const dateA = new Date(getVisitDate(a) || 0).getTime()
      const dateB = new Date(getVisitDate(b) || 0).getTime()

      return dateB - dateA
    })
  }, [kunjungan])

  const totalKunjungan = sortedKunjungan.length

  const totalHadir = sortedKunjungan.filter(
    (item) => String(item?.status || 'hadir').toLowerCase() !== 'terlewat'
  ).length

  const totalTerlewat = sortedKunjungan.filter(
    (item) => String(item?.status || '').toLowerCase() === 'terlewat'
  ).length

  const keaktifan =
    totalKunjungan > 0 ? Math.round((totalHadir / totalKunjungan) * 100) : 0

  const kunjunganTerakhir = sortedKunjungan[0] || null
  const usiaBulan = balita?.usia_bulan ?? hitungUsiaBulan(balita?.tanggal_lahir)

  const openEdit = (item) => {
    setEditItem(item)

    setEditForm({
      tanggal_kunjungan: toInputDate(item.tanggal_kunjungan),
      jam_kunjungan: item.jam_kunjungan ? String(item.jam_kunjungan).slice(0, 5) : '',
      jenis_kunjungan: item.jenis_kunjungan || 'rutin',
      status: item.status || 'hadir',
      petugas: item.petugas || item.admin?.nama || '',
      berat_badan: getBeratBadan(item) ?? '',
      tinggi_badan: getTinggiBadan(item) ?? '',
      lingkar_kepala: getLingkarKepala(item) ?? '',
      status_gizi: getStatusGizi(item) || 'Normal',
      suhu_tubuh: getSuhuTubuh(item) ?? '',
      imunisasi: getImunisasiText(item) === '-' ? '' : getImunisasiText(item),
      jadwal_berikutnya: toInputDate(item.jadwal_berikutnya),
      imunisasi_berikutnya: item.imunisasi_berikutnya || '',
      lokasi_posyandu: item.lokasi_posyandu || 'Posyandu Ceria',
      pengingat_orangtua: Boolean(item.pengingat_orangtua),
      catatan: getCatatan(item) === '-' ? '' : getCatatan(item),
    })
  }

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    if (!editItem?.id) return

    if (!editForm.tanggal_kunjungan) {
      alert('Tanggal kunjungan wajib diisi.')
      return
    }

    setSaving(true)

    const payload = {
      tanggal_kunjungan: editForm.tanggal_kunjungan,
      jam_kunjungan: editForm.jam_kunjungan || null,
      jenis_kunjungan: editForm.jenis_kunjungan,
      status: editForm.status,
      petugas: editForm.petugas || null,

      berat_badan: parseNumber(editForm.berat_badan),
      tinggi_badan: parseNumber(editForm.tinggi_badan),
      lingkar_kepala: parseNumber(editForm.lingkar_kepala),
      status_gizi: editForm.status_gizi || null,
      suhu_tubuh: parseNumber(editForm.suhu_tubuh),

      imunisasi: editForm.imunisasi
        ? editForm.imunisasi.split(',').map((item) => item.trim()).filter(Boolean)
        : [],

      jadwal_berikutnya: editForm.jadwal_berikutnya || null,
      imunisasi_berikutnya: editForm.imunisasi_berikutnya || null,
      lokasi_posyandu: editForm.lokasi_posyandu || 'Posyandu Ceria',
      pengingat_orangtua: editForm.pengingat_orangtua,

      catatan: editForm.catatan || null,
    }

    try {
      await API.put(`/kunjungan/${editItem.id}`, payload)

      setEditItem(null)
      setEditForm(initialEditForm)

      await loadData()

      alert('Data kunjungan berhasil diperbarui.')
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui data kunjungan.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem?.id) return

    setDeleting(true)

    try {
      await API.delete(`/kunjungan/${deleteItem.id}`)

      setDeleteItem(null)
      await loadData()

      alert('Data kunjungan berhasil dihapus.')
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus data kunjungan.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="visit-page">
      <header className="visit-header">
        <div>
          <h1>Riwayat Kunjungan</h1>
          <p>Berikut adalah riwayat kunjungan ke posyandu</p>
        </div>

        <button
          type="button"
          className="user-pill"
          onClick={() => navigate('/profil')}
        >
          👤 {user?.nama || user?.name || 'User'}
        </button>
      </header>

      <main className="visit-content">
        {error && <div className="error-box">{error}</div>}

        <section className="child-card">
          <div className="child-avatar">
            {balita?.foto ? (
              <img src={balita.foto} alt={balita?.nama || 'Balita'} />
            ) : (
              <span>{balita?.jenis_kelamin === 'P' ? '👧' : '👦'}</span>
            )}
          </div>

          <div className="child-info">
            <h2>{loading ? 'Memuat data...' : balita?.nama || 'Data Anak'}</h2>

            <div className="child-meta">
              <span className={balita?.jenis_kelamin === 'P' ? 'girl' : 'boy'}>
                {balita?.jenis_kelamin === 'P' ? '♀' : '♂'}{' '}
                {formatJenisKelamin(balita?.jenis_kelamin)}
              </span>

              <span>{formatUsia(usiaBulan)}</span>

              <span>🪪 {balita?.nik || `AN-${String(balita?.id || '').padStart(5, '0')}`}</span>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard icon="✅" title="Kunjungan Hadir" value={totalHadir} subtitle="Kali" />

          <StatCard
            icon="📅"
            title="Kunjungan Terlewat"
            value={totalTerlewat}
            subtitle="Kali"
            active
          />

          <StatCard
            icon="📊"
            title="Keaktifan Kunjungan"
            value={`${keaktifan}%`}
            subtitle="Aktif"
          />

          <StatCard
            icon="🗓️"
            title="Kunjungan Terakhir"
            value={kunjunganTerakhir ? formatTanggalPanjang(getVisitDate(kunjunganTerakhir)) : '-'}
          />
        </section>

        {loading ? (
          <div className="empty-box">Memuat riwayat kunjungan...</div>
        ) : sortedKunjungan.length === 0 ? (
          <div className="empty-box">Belum ada riwayat kunjungan.</div>
        ) : (
          <section className="timeline-area">
            <div className="timeline-line" />

            <div className="timeline-list">
              {sortedKunjungan.map((item, index) => {
                const prev = sortedKunjungan[index + 1]
                const missed = String(item?.status || 'hadir').toLowerCase() === 'terlewat'

                const berat = getBeratBadan(item)
                const tinggi = getTinggiBadan(item)
                const statusGizi = getStatusGizi(item)

                const prevBerat = prev ? getBeratBadan(prev) : ''
                const prevTinggi = prev ? getTinggiBadan(prev) : ''

                return (
                  <article className="timeline-row" key={item.id || index}>
                    <div className={`timeline-marker ${missed ? 'missed' : ''}`}>
                      {missed ? '!' : '✓'}
                    </div>

                    <div className={`visit-card ${missed ? 'missed-card' : ''}`}>
                      <div className="visit-card-head">
                        <div className="visit-title">
                          <h3>{formatTanggal(getVisitDate(item))}</h3>
                          <strong>{item.lokasi_posyandu || 'Posyandu Ceria'}</strong>
                        </div>

                        <div className="visit-actions">
                          <span className={`status-pill ${missed ? 'missed' : 'hadir'}`}>
                            {missed ? 'Terlewat' : 'Hadir'}
                          </span>

                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() => openEdit(item)}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => setDeleteItem(item)}
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </div>

                      {missed ? (
                        <div className="missed-box">
                          <div>⚠️</div>

                          <section>
                            <h4>Kunjungan terlewat</h4>
                            <p>Tidak ada kunjungan pada tanggal ini.</p>
                          </section>
                        </div>
                      ) : (
                        <>
                          <div className="visit-grid">
                            <div className="visit-field">
                              <span>Berat Badan</span>
                              <strong>{formatNumber(berat, ' kg')}</strong>
                              <small>{getDelta(berat, prevBerat, ' kg')}</small>
                            </div>

                            <div className="visit-field">
                              <span>Tinggi Badan</span>
                              <strong>{formatNumber(tinggi, ' cm')}</strong>
                              <small>{getDelta(tinggi, prevTinggi, ' cm')}</small>
                            </div>

                            <div className="visit-field">
                              <span>Status Gizi</span>

                              <b className={`gizi-badge ${getStatusBadgeClass(statusGizi)}`}>
                                {getStatusGiziLabel(statusGizi)}
                              </b>
                            </div>

                            <div className="visit-field">
                              <span>Imunisasi</span>
                              <strong>{getImunisasiText(item)}</strong>
                            </div>
                          </div>

                          <div className="note-row">
                            📝 <b>Catatan Petugas:</b> {getCatatan(item)}
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </main>

      {editItem && (
        <div className="modal-overlay">
          <form className="modal-card edit-modal" onSubmit={handleUpdate}>
            <div className="modal-head">
              <div>
                <h2>Edit Kunjungan</h2>
                <p>Perbarui data kunjungan anak.</p>
              </div>

              <button type="button" onClick={() => setEditItem(null)}>
                ×
              </button>
            </div>

            <div className="form-grid">
              <label>
                Tanggal Kunjungan
                <input
                  type="date"
                  value={editForm.tanggal_kunjungan}
                  onChange={(e) => handleEditChange('tanggal_kunjungan', e.target.value)}
                  required
                />
              </label>

              <label>
                Jam Kunjungan
                <input
                  type="time"
                  value={editForm.jam_kunjungan}
                  onChange={(e) => handleEditChange('jam_kunjungan', e.target.value)}
                />
              </label>

              <label>
                Jenis Kunjungan
                <select
                  value={editForm.jenis_kunjungan}
                  onChange={(e) => handleEditChange('jenis_kunjungan', e.target.value)}
                >
                  <option value="rutin">Rutin</option>
                  <option value="imunisasi">Imunisasi</option>
                  <option value="konsultasi">Konsultasi</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </label>

              <label>
                Status
                <select
                  value={editForm.status}
                  onChange={(e) => handleEditChange('status', e.target.value)}
                >
                  <option value="hadir">Hadir</option>
                  <option value="terlewat">Terlewat</option>
                </select>
              </label>

              <label>
                Petugas
                <input
                  type="text"
                  value={editForm.petugas}
                  onChange={(e) => handleEditChange('petugas', e.target.value)}
                  placeholder="Nama petugas"
                />
              </label>

              <label>
                Lokasi Posyandu
                <input
                  type="text"
                  value={editForm.lokasi_posyandu}
                  onChange={(e) => handleEditChange('lokasi_posyandu', e.target.value)}
                />
              </label>

              <label>
                Berat Badan
                <input
                  type="number"
                  step="0.1"
                  value={editForm.berat_badan}
                  onChange={(e) => handleEditChange('berat_badan', e.target.value)}
                  placeholder="Contoh: 10.5"
                />
              </label>

              <label>
                Tinggi Badan
                <input
                  type="number"
                  step="0.1"
                  value={editForm.tinggi_badan}
                  onChange={(e) => handleEditChange('tinggi_badan', e.target.value)}
                  placeholder="Contoh: 83"
                />
              </label>

              <label>
                Lingkar Kepala
                <input
                  type="number"
                  step="0.1"
                  value={editForm.lingkar_kepala}
                  onChange={(e) => handleEditChange('lingkar_kepala', e.target.value)}
                  placeholder="Contoh: 45"
                />
              </label>

              <label>
                Suhu Tubuh
                <input
                  type="number"
                  step="0.1"
                  value={editForm.suhu_tubuh}
                  onChange={(e) => handleEditChange('suhu_tubuh', e.target.value)}
                  placeholder="Contoh: 36.5"
                />
              </label>

              <label>
                Status Gizi
                <select
                  value={editForm.status_gizi}
                  onChange={(e) => handleEditChange('status_gizi', e.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Gizi Kurang">Gizi Kurang</option>
                  <option value="Gizi Buruk">Gizi Buruk</option>
                  <option value="Stunting">Stunting</option>
                  <option value="Risiko Stunting">Risiko Stunting</option>
                </select>
              </label>

              <label>
                Imunisasi
                <input
                  type="text"
                  value={editForm.imunisasi}
                  onChange={(e) => handleEditChange('imunisasi', e.target.value)}
                  placeholder="Contoh: DPT-HB-Hib"
                />
              </label>

              <label>
                Jadwal Berikutnya
                <input
                  type="date"
                  value={editForm.jadwal_berikutnya}
                  onChange={(e) => handleEditChange('jadwal_berikutnya', e.target.value)}
                />
              </label>

              <label>
                Imunisasi Berikutnya
                <input
                  type="text"
                  value={editForm.imunisasi_berikutnya}
                  onChange={(e) => handleEditChange('imunisasi_berikutnya', e.target.value)}
                  placeholder="Contoh: Campak"
                />
              </label>

              <label className="checkbox-label full">
                <input
                  type="checkbox"
                  checked={editForm.pengingat_orangtua}
                  onChange={(e) => handleEditChange('pengingat_orangtua', e.target.checked)}
                />
                <span>Aktifkan pengingat untuk orang tua</span>
              </label>

              <label className="full">
                Catatan Petugas
                <textarea
                  value={editForm.catatan}
                  onChange={(e) => handleEditChange('catatan', e.target.value)}
                  placeholder="Tambahkan catatan petugas"
                />
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setEditItem(null)}
              >
                Batal
              </button>

              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteItem && (
        <div className="modal-overlay">
          <div className="modal-card delete-modal">
            <div className="delete-icon">🗑️</div>

            <h2>Hapus Kunjungan?</h2>

            <p>
              Data kunjungan tanggal{' '}
              <strong>{formatTanggalPanjang(getVisitDate(deleteItem))}</strong> akan dihapus.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setDeleteItem(null)}
                disabled={deleting}
              >
                Batal
              </button>

              <button
                type="button"
                className="danger-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .visit-page {
          min-height: 100vh;
          background: #4F724D;
          color: #6B4337;
          font-family: "Segoe UI", Arial, sans-serif;
        }

        .visit-header {
          padding: 26px 34px 18px;
          background: #4F724D;
          color: #FFFFFF;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .visit-header h1 {
          margin: 0;
          font-size: 34px;
          line-height: 1.1;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .visit-header p {
          margin: 9px 0 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 600;
        }

        .user-pill {
          border: none;
          border-radius: 999px;
          background: #F7E5D8;
          color: #7A4F43;
          padding: 9px 16px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
        }

        .visit-content {
          padding: 0 34px 56px;
        }

        .error-box {
          background: #FEE2E2;
          color: #991B1B;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 18px;
          font-size: 14px;
          font-weight: 700;
        }

        .child-card {
          background: #FFF7F7;
          border: 1px solid #F1CACA;
          border-radius: 14px;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 26px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .child-avatar {
          width: 72px;
          height: 72px;
          border-radius: 13px;
          background: #F4DFD8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 38px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .child-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .child-info h2 {
          margin: 0 0 8px;
          color: #7A4F43;
          font-size: 30px;
          line-height: 1.1;
          font-weight: 850;
        }

        .child-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          color: #6B5247;
          font-size: 13px;
          font-weight: 750;
        }

        .child-meta .girl {
          color: #D364F7;
        }

        .child-meta .boy {
          color: #2F88F0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 30px;
        }

        .visit-stat-card {
          min-height: 122px;
          background: #FFF7F7;
          border: 1px solid #F1CACA;
          border-radius: 15px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          box-sizing: border-box;
        }

        .visit-stat-card.active {
          outline: 3px solid #27A8FF;
        }

        .visit-stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          background: #E8F7E3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .visit-stat-card p {
          margin: 0 0 12px;
          color: #6B4337;
          font-size: 14px;
          font-weight: 850;
        }

        .visit-stat-card h3 {
          margin: 0;
          color: #8A3D2F;
          font-size: 38px;
          line-height: 1;
          font-weight: 900;
        }

        .visit-stat-card span {
          display: block;
          margin-top: 10px;
          color: #6B5247;
          font-size: 13px;
          font-weight: 800;
        }

        .empty-box {
          background: #FFF7F7;
          border: 1px solid #F1CACA;
          border-radius: 14px;
          padding: 28px;
          text-align: center;
          color: #6B4337;
          font-size: 15px;
          font-weight: 800;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .timeline-area {
          position: relative;
          padding-left: 54px;
        }

        .timeline-line {
          position: absolute;
          top: 18px;
          left: 17px;
          bottom: 18px;
          width: 4px;
          background: rgba(235, 245, 230, 0.92);
          border-radius: 999px;
        }

        .timeline-list {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .timeline-row {
          position: relative;
          width: 100%;
        }

        .timeline-marker {
          position: absolute;
          left: -54px;
          top: 0;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #58C95D;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 900;
          z-index: 2;
          box-shadow: 0 5px 14px rgba(0, 0, 0, 0.16);
        }

        .timeline-marker.missed {
          background: #F3B73F;
        }

        .visit-card {
          width: 100%;
          background: #FFF7F7;
          border: 1px solid #F1CACA;
          border-radius: 14px;
          padding: 15px 18px 14px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          box-sizing: border-box;
        }

        .visit-card.missed-card {
          background: #FFF8EC;
          border-color: #F2D39B;
        }

        .visit-card-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 12px;
        }

        .visit-title {
          display: flex;
          align-items: baseline;
          gap: 24px;
          flex-wrap: wrap;
        }

        .visit-title h3 {
          margin: 0;
          color: #6B4337;
          font-size: 16px;
          font-weight: 900;
        }

        .visit-title strong {
          color: #6B4337;
          font-size: 16px;
          font-weight: 900;
        }

        .visit-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .status-pill {
          min-height: 24px;
          padding: 0 12px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 850;
        }

        .status-pill.hadir {
          background: #DFF7D8;
          color: #36A245;
        }

        .status-pill.missed {
          background: #FFE8A8;
          color: #D28600;
        }

        .edit-btn,
        .delete-btn {
          border-radius: 10px;
          padding: 8px 11px;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
          font-family: inherit;
        }

        .edit-btn {
          border: 1px solid #F2D0B7;
          background: #FFF3E6;
          color: #A45A18;
        }

        .delete-btn {
          border: 1px solid #FECACA;
          background: #FEF2F2;
          color: #B42318;
        }

        .visit-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          border-top: 1px solid #E8C9C9;
          border-bottom: 1px solid #E8C9C9;
        }

        .visit-field {
          min-height: 82px;
          padding: 13px 14px;
          border-right: 1px solid #E8C9C9;
          box-sizing: border-box;
        }

        .visit-field:last-child {
          border-right: none;
        }

        .visit-field span {
          display: block;
          color: #7A5C50;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 900;
          letter-spacing: 0.4px;
          margin-bottom: 8px;
        }

        .visit-field strong {
          display: block;
          color: #6B4337;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.35;
        }

        .visit-field small {
          display: block;
          margin-top: 7px;
          color: #38A64B;
          font-size: 11px;
          font-weight: 800;
          line-height: 1.25;
        }

        .gizi-badge {
          display: inline-flex;
          min-height: 22px;
          min-width: 68px;
          padding: 0 12px;
          border-radius: 999px;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
        }

        .gizi-badge.success {
          background: #DFF7D8;
          color: #36A245;
        }

        .gizi-badge.warning {
          background: #FFF1C8;
          color: #C88406;
        }

        .gizi-badge.danger {
          background: #FFDADA;
          color: #D84E4E;
        }

        .note-row {
          margin-top: 10px;
          color: #6B5247;
          font-size: 12px;
          line-height: 1.5;
        }

        .note-row b {
          color: #6B4337;
        }

        .missed-box {
          background: #FFF2C7;
          border: 1px solid #F4D28A;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #9B5F00;
        }

        .missed-box > div {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #FFD35B;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .missed-box h4 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 900;
        }

        .missed-box p {
          margin: 0;
          font-size: 12px;
          font-weight: 700;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
        }

        .modal-card {
          width: min(940px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: #FFFFFF;
          border-radius: 22px;
          padding: 26px;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
          box-sizing: border-box;
        }

        .delete-modal {
          width: min(420px, 100%);
          text-align: center;
        }

        .delete-icon {
          font-size: 42px;
          margin-bottom: 12px;
        }

        .modal-head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 20px;
        }

        .modal-head h2,
        .delete-modal h2 {
          margin: 0;
          color: #243424;
          font-size: 24px;
          font-weight: 800;
        }

        .modal-head p,
        .delete-modal p {
          margin: 7px 0 0;
          color: #6B7D6B;
          font-size: 14px;
          line-height: 1.55;
        }

        .modal-head button {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 12px;
          background: #F3F7F3;
          color: #4E724C;
          font-size: 22px;
          cursor: pointer;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .form-grid label {
          color: #355C3C;
          font-size: 13px;
          font-weight: 800;
        }

        .form-grid label.full {
          grid-column: 1 / -1;
        }

        .form-grid input,
        .form-grid select,
        .form-grid textarea {
          width: 100%;
          margin-top: 7px;
          border: 1px solid #D4E4D4;
          border-radius: 12px;
          padding: 12px 13px;
          box-sizing: border-box;
          color: #243424;
          font-size: 14px;
          outline: none;
          font-family: inherit;
          background: #FFFFFF;
        }

        .form-grid textarea {
          min-height: 110px;
          resize: vertical;
          line-height: 1.6;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #D4E4D4;
          border-radius: 12px;
          padding: 12px 13px;
          background: #FBFEFB;
        }

        .checkbox-label input {
          width: auto;
          margin: 0;
        }

        .modal-actions {
          margin-top: 22px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }

        .modal-actions button {
          min-height: 42px;
          border-radius: 12px;
          padding: 0 18px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
        }

        .cancel-btn {
          border: 1px solid #D4E4D4;
          background: #FFFFFF;
          color: #4E724C;
        }

        .save-btn {
          border: none;
          background: #4E724C;
          color: #FFFFFF;
        }

        .danger-btn {
          border: none;
          background: #DC2626;
          color: #FFFFFF;
        }

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .visit-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .visit-field:nth-child(2) {
            border-right: none;
          }

          .visit-field:nth-child(1),
          .visit-field:nth-child(2) {
            border-bottom: 1px solid #E8C9C9;
          }
        }

        @media (max-width: 760px) {
          .visit-header {
            flex-direction: column;
            padding: 24px 18px 18px;
          }

          .visit-content {
            padding: 0 18px 42px;
          }

          .stats-grid,
          .visit-grid,
          .form-grid {
            grid-template-columns: 1fr;
          }

          .visit-field,
          .visit-field:nth-child(2) {
            border-right: none;
            border-bottom: 1px solid #E8C9C9;
          }

          .visit-field:last-child {
            border-bottom: none;
          }

          .timeline-area {
            padding-left: 44px;
          }

          .timeline-marker {
            left: -44px;
          }

          .timeline-line {
            left: 17px;
          }

          .visit-card-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .visit-actions {
            justify-content: flex-start;
          }

          .modal-actions {
            flex-direction: column;
          }

          .modal-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}