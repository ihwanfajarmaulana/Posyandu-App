import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import API from '../api'

const fontFamily = '"Segoe UI", Arial, Helvetica, sans-serif'

const sidebarMenus = [
  { icon: '🏠', label: 'Beranda', to: '/dashboard', activePaths: ['/dashboard'] },
  { icon: '📈', label: 'Tumbuh Kembang', to: '/tumbuh-kembang', activePaths: ['/tumbuh-kembang'] },
  { icon: '💉', label: 'Imunisasi', to: '/imunisasi', activePaths: ['/imunisasi'] },
  { icon: '📅', label: 'Jadwal Posyandu', to: '/jadwal', activePaths: ['/jadwal'] },
  { icon: '🏥', label: 'Kunjungan', to: '/riwayatkunjungan', activePaths: ['/riwayatkunjungan', '/catatkunjungan'] },
  { icon: '📝', label: 'Penanganan & Rekomendasi', to: '/penanganan-rekomendasi', activePaths: ['/penanganan-rekomendasi', '/rekomendasi-balita'] },
  { icon: '👶', label: 'Daftar Balita', to: '/daftar-balita', activePaths: ['/daftar-balita'] },
  { icon: '➕', label: 'Tambah Balita', to: '/tambah-balita', activePaths: ['/tambah-balita'] },
  { icon: '📋', label: 'Laporan Penimbangan', to: '/rekap-penimbangan', activePaths: ['/rekap-penimbangan'] },
  { icon: '👤', label: 'Profil', to: '/profil', activePaths: ['/profil'] },
  { icon: '⚙️', label: 'Pengaturan', to: '/pengaturan', activePaths: ['/pengaturan'] },
]

const daftarVaksin = [
  'Hepatitis B', 'BCG', 'Polio 1', 'Polio 2', 'Polio 3', 'Polio 4',
  'DPT-HB-Hib 1', 'DPT-HB-Hib 2', 'DPT-HB-Hib 3',
  'Campak Rubella', 'DPT Booster', 'Tifoid',
]

const getToday = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const addOneMonth = () => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const formatTanggal = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

const formatUsia = (usiaBulan) => {
  if (usiaBulan === undefined || usiaBulan === null || usiaBulan === '' || Number.isNaN(Number(usiaBulan))) return '-'
  const total = Number(usiaBulan)
  const tahun = Math.floor(total / 12)
  const bulan = total % 12
  if (tahun <= 0) return `${bulan} bulan`
  if (bulan === 0) return `${tahun} tahun`
  return `${tahun} tahun ${bulan} bulan`
}

const formatJenisKelamin = (value) => {
  if (value === 'L') return 'Laki-laki'
  if (value === 'P') return 'Perempuan'
  return value || '-'
}

const getAvatar = (value) => (value === 'P' ? '👧' : '👦')

// Parse info tambahan dari catatan lama (format: "text | Usia: X bulan | Status: Y | ...")
const parseCatatanLama = (catatan) => {
  if (!catatan) return {}
  const result = {}
  const parts = catatan.split(' | ')
  const extracted = []
  const catatanBersih = []

  for (const part of parts) {
    if (part.startsWith('Usia: ')) {
      const val = part.replace('Usia: ', '').replace(' bulan', '')
      result.usia_saat_pemberian = val
      extracted.push(part)
    } else if (part.startsWith('Status: ')) {
      result.status = part.replace('Status: ', '')
      extracted.push(part)
    } else if (part.startsWith('BB: ')) {
      result.berat_badan = part.replace('BB: ', '').replace(' kg', '')
      extracted.push(part)
    } else if (part.startsWith('TB: ')) {
      result.tinggi_badan = part.replace('TB: ', '').replace(' cm', '')
      extracted.push(part)
    } else if (part.startsWith('Petugas: ')) {
      result.petugas = part.replace('Petugas: ', '')
      extracted.push(part)
    } else if (part.startsWith('Lokasi: ')) {
      result.lokasi = part.replace('Lokasi: ', '')
      extracted.push(part)
    } else if (part.startsWith('Vaksin berikutnya: ')) {
      result.vaksin_berikutnya = part.replace('Vaksin berikutnya: ', '')
      extracted.push(part)
    } else {
      catatanBersih.push(part)
    }
  }

  result.catatan_bersih = catatanBersih.join(' | ')
  return result
}

// Gabungkan data API dengan data lokal (extended fields)
const mergeWithLocal = (apiItem, localExtended) => {
  const parsed = parseCatatanLama(apiItem.catatan)
  return {
    ...apiItem,
    usia_saat_pemberian: localExtended?.usia_saat_pemberian ?? parsed.usia_saat_pemberian ?? '',
    status: localExtended?.status ?? parsed.status ?? '',
    berat_badan: localExtended?.berat_badan ?? parsed.berat_badan ?? '',
    tinggi_badan: localExtended?.tinggi_badan ?? parsed.tinggi_badan ?? '',
    petugas: localExtended?.petugas ?? parsed.petugas ?? '',
    lokasi: localExtended?.lokasi ?? parsed.lokasi ?? '',
    vaksin_berikutnya: localExtended?.vaksin_berikutnya ?? parsed.vaksin_berikutnya ?? '',
    jadwal_berikutnya: localExtended?.jadwal_berikutnya ?? apiItem.tanggal_jadwal_berikutnya ?? '',
    catatan: localExtended?.catatan ?? parsed.catatan_bersih ?? apiItem.catatan ?? '',
    _source: 'api',
  }
}

const LOCAL_KEY = (id) => `imunisasi_extended_${id}`
const LOCAL_RECORDS_KEY = (balitaId) => `imunisasi_local_${balitaId}`

const initialForm = (userName = '') => ({
  nama_vaksin: '',
  tanggal_pemberian: getToday(),
  usia_saat_pemberian: '',
  status: 'Sudah Diberikan',
  berat_badan: '',
  tinggi_badan: '',
  petugas: userName,
  lokasi: 'Posyandu Ceria',
  jadwal_berikutnya: addOneMonth(),
  vaksin_berikutnya: '',
  catatan: '',
})

function Sidebar({ location, navigate, handleLogout }) {
  const isActive = (menu) => menu.activePaths.some((path) => location.pathname.startsWith(path))
  return (
    <aside style={styles.sidebar}>
      <button type="button" onClick={() => navigate('/dashboard')} style={styles.brand}>PosyanduCeria</button>
      <nav style={styles.nav}>
        {sidebarMenus.map((menu) => (
          <Link key={menu.label} to={menu.to} style={{ ...styles.navLink, ...(isActive(menu) ? styles.navLinkActive : {}) }}>
            <span style={styles.navIcon}>{menu.icon}</span>
            <span>{menu.label}</span>
          </Link>
        ))}
      </nav>
      <button type="button" onClick={handleLogout} style={styles.logoutButton}>Logout</button>
    </aside>
  )
}

export default function Imunisasi() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
  }, [])

  const [balita, setBalita] = useState(null)
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(() => initialForm(user.nama || ''))
  const [editingId, setEditingId] = useState(null) // null = tambah baru, else = edit
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  useEffect(() => { loadData() }, [id])

  useEffect(() => {
    if (balita?.usia_bulan && !form.usia_saat_pemberian) {
      setForm((prev) => ({ ...prev, usia_saat_pemberian: balita.usia_bulan }))
    }
  }, [balita])

  const getExtendedMap = () => {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY(id)) || '{}') } catch { return {} }
  }

  const saveExtendedMap = (map) => {
    localStorage.setItem(LOCAL_KEY(id), JSON.stringify(map))
  }

  const getLocalRecords = () => {
    try { return JSON.parse(localStorage.getItem(LOCAL_RECORDS_KEY(id)) || '[]') } catch { return [] }
  }

  const saveLocalRecords = (records) => {
    localStorage.setItem(LOCAL_RECORDS_KEY(id), JSON.stringify(records))
  }

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      let selectedBalita = null
      try {
        const detailRes = await API.get(`/balita/${id}`)
        selectedBalita = detailRes.data?.data || detailRes.data
      } catch {
        const listRes = await API.get('/balita?limit=100')
        const list = Array.isArray(listRes.data) ? listRes.data : Array.isArray(listRes.data?.data) ? listRes.data.data : []
        selectedBalita = list.find((item) => String(item.id) === String(id))
      }

      if (!selectedBalita) { setError('Data balita tidak ditemukan.'); return }
      setBalita(selectedBalita)

      let apiRiwayat = []
      try {
        const res = await API.get(`/balita/${id}/imunisasi`)
        apiRiwayat = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : []
      } catch { apiRiwayat = [] }

      const extendedMap = getExtendedMap()
      const localRecords = getLocalRecords()

      // Merge API records dengan extended data lokal
      const mergedApi = apiRiwayat.map((item) => mergeWithLocal(item, extendedMap[String(item.id)]))

      // Gabungkan dengan record lokal (yang belum tersimpan ke API)
      const allRecords = [...localRecords, ...mergedApi].sort(
        (a, b) => new Date(b.tanggal_pemberian) - new Date(a.tanggal_pemberian)
      )

      setRiwayat(allRecords)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data imunisasi.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const openTambah = () => {
    setEditingId(null)
    setForm(initialForm(user.nama || ''))
    if (balita?.usia_bulan) setForm((prev) => ({ ...prev, usia_saat_pemberian: balita.usia_bulan }))
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({
      nama_vaksin: item.nama_vaksin || '',
      tanggal_pemberian: item.tanggal_pemberian || getToday(),
      usia_saat_pemberian: item.usia_saat_pemberian ?? '',
      status: item.status || 'Sudah Diberikan',
      berat_badan: item.berat_badan ?? '',
      tinggi_badan: item.tinggi_badan ?? '',
      petugas: item.petugas || '',
      lokasi: item.lokasi || 'Posyandu Ceria',
      jadwal_berikutnya: item.jadwal_berikutnya || item.tanggal_jadwal_berikutnya || addOneMonth(),
      vaksin_berikutnya: item.vaksin_berikutnya || '',
      catatan: item.catatan || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nama_vaksin) { alert('Nama vaksin wajib dipilih.'); return }
    if (!form.tanggal_pemberian) { alert('Tanggal pemberian wajib diisi.'); return }
    setSaving(true)

    const payload = {
      balita_id: Number(id),
      nama_vaksin: form.nama_vaksin,
      tanggal_pemberian: form.tanggal_pemberian,
      tanggal_jadwal_berikutnya: form.jadwal_berikutnya || null,
      catatan: form.catatan || null,
    }

    // Extended fields yang disimpan lokal
    const extendedFields = {
      usia_saat_pemberian: form.usia_saat_pemberian,
      status: form.status,
      berat_badan: form.berat_badan,
      tinggi_badan: form.tinggi_badan,
      petugas: form.petugas,
      lokasi: form.lokasi,
      vaksin_berikutnya: form.vaksin_berikutnya,
      jadwal_berikutnya: form.jadwal_berikutnya,
      catatan: form.catatan,
    }

    try {
      if (editingId !== null) {
        // === EDIT ===
        const item = riwayat.find((r) => r.id === editingId)
        if (item?._source === 'api') {
          // Coba update ke API
          try {
            await API.put(`/imunisasi/${editingId}`, payload)
          } catch {
            // API mungkin tidak support, lanjut simpan lokal saja
          }
          // Simpan extended fields ke localStorage
          const map = getExtendedMap()
          map[String(editingId)] = extendedFields
          saveExtendedMap(map)
        } else {
          // Record lokal — update langsung
          const localRecs = getLocalRecords()
          const updated = localRecs.map((r) =>
            r.id === editingId
              ? { ...r, ...payload, ...extendedFields, _source: 'local' }
              : r
          )
          saveLocalRecords(updated)
        }

        setRiwayat((prev) =>
          prev.map((r) =>
            r.id === editingId
              ? { ...r, ...payload, ...extendedFields }
              : r
          )
        )
        alert('Data imunisasi berhasil diperbarui.')
      } else {
        // === TAMBAH BARU ===
        let savedId = `local_${Date.now()}`
        let savedData = { ...payload }

        try {
          const res = await API.post(`/balita/${id}/imunisasi`, payload)
          const apiData = res.data?.data || {}
          savedId = apiData.id || savedId
          savedData = { ...apiData }
          // Simpan extended ke map
          const map = getExtendedMap()
          map[String(savedId)] = extendedFields
          saveExtendedMap(map)
        } catch {
          // Simpan sebagai record lokal
          const newRecord = {
            id: savedId,
            ...payload,
            ...extendedFields,
            _source: 'local',
          }
          const localRecs = getLocalRecords()
          saveLocalRecords([newRecord, ...localRecs])
          setRiwayat((prev) =>
            [newRecord, ...prev].sort((a, b) => new Date(b.tanggal_pemberian) - new Date(a.tanggal_pemberian))
          )
          setForm(initialForm(user.nama || ''))
          setShowForm(false)
          setSaving(false)
          alert('Data imunisasi berhasil disimpan (lokal).')
          return
        }

        const newRecord = {
          ...savedData,
          id: savedId,
          ...extendedFields,
          _source: 'api',
        }

        setRiwayat((prev) =>
          [newRecord, ...prev].sort((a, b) => new Date(b.tanggal_pemberian) - new Date(a.tanggal_pemberian))
        )
        alert('Data imunisasi berhasil disimpan.')
      }

      setForm(initialForm(user.nama || ''))
      setShowForm(false)
      setEditingId(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data imunisasi.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    setDeleteConfirmId(null)
    try {
      if (item._source === 'api') {
        try {
          await API.delete(`/imunisasi/${item.id}`)
        } catch {
          // Tetap hapus dari tampilan dan local map
        }
        const map = getExtendedMap()
        delete map[String(item.id)]
        saveExtendedMap(map)
      } else {
        const localRecs = getLocalRecords()
        saveLocalRecords(localRecs.filter((r) => r.id !== item.id))
      }
      setRiwayat((prev) => prev.filter((r) => r.id !== item.id))
      alert('Data imunisasi berhasil dihapus.')
    } catch (err) {
      alert('Gagal menghapus data imunisasi.')
    }
  }

  const totalImunisasi = riwayat.length
  const sudahDiberikan = riwayat.filter((item) => String(item.status || '').toLowerCase().includes('sudah')).length
  const terjadwal = riwayat.filter((item) => String(item.status || '').toLowerCase().includes('terjadwal')).length
  const terlambat = riwayat.filter((item) => String(item.status || '').toLowerCase().includes('terlambat')).length

  return (
    <div style={styles.page}>
      <Sidebar location={location} navigate={navigate} handleLogout={handleLogout} />

      <main style={styles.main}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button type="button" onClick={() => navigate('/imunisasi')} style={styles.backButton}>←</button>
            <div>
              <h1 style={styles.title}>Riwayat Imunisasi</h1>
              <p style={styles.subtitle}>Pantau dan catat pemberian imunisasi balita agar tidak terlambat.</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate('/profil')} style={styles.userBadge}>
            👤 {user?.nama || 'User'}
          </button>
        </header>

        <section style={styles.content}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <section style={styles.profileCard}>
            {loading ? (
              <div style={styles.loadingBox}>Memuat data anak...</div>
            ) : (
              <>
                <div style={styles.avatarBox}>{getAvatar(balita?.jenis_kelamin)}</div>
                <div style={styles.childInfo}>
                  <h2 style={styles.childName}>{balita?.nama || '-'}</h2>
                  <p style={styles.childMeta}>{formatJenisKelamin(balita?.jenis_kelamin)} • {formatUsia(balita?.usia_bulan)}</p>
                  <p style={styles.childSubMeta}>NIK: {balita?.nik || '-'} • Ibu: {balita?.nama_ibu || '-'}</p>
                </div>
                <button type="button" onClick={openTambah} style={styles.addButton}>+ Catat Imunisasi</button>
              </>
            )}
          </section>

          <section style={styles.statGrid}>
            {[
              { icon: '🛡️', label: 'Total Imunisasi', value: totalImunisasi },
              { icon: '✅', label: 'Sudah Diberikan', value: sudahDiberikan },
              { icon: '⏱️', label: 'Terjadwal', value: terjadwal },
              { icon: '⚠️', label: 'Terlambat', value: terlambat },
            ].map((s) => (
              <div key={s.label} style={styles.statCard}>
                <span style={styles.statIcon}>{s.icon}</span>
                <p style={styles.statLabel}>{s.label}</p>
                <h3 style={styles.statValue}>{s.value}</h3>
                <span style={styles.statSmall}>Jenis</span>
              </div>
            ))}
          </section>

          {showForm && (
            <form onSubmit={handleSubmit} style={styles.formCard}>
              <div style={styles.formHeader}>
                <div>
                  <h2 style={styles.formTitle}>{editingId ? 'Edit Data Imunisasi' : 'Catat Pemberian Imunisasi'}</h2>
                  <p style={styles.formSubtitle}>
                    {editingId ? 'Perbarui data imunisasi' : `Isi data vaksin yang diberikan kepada ${balita?.nama || 'balita'}.`}
                  </p>
                </div>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} style={styles.closeButton}>×</button>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nama Vaksin</label>
                  <select value={form.nama_vaksin} onChange={(e) => handleChange('nama_vaksin', e.target.value)} style={styles.input} required>
                    <option value="">Pilih vaksin</option>
                    {daftarVaksin.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Tanggal Pemberian</label>
                  <input type="date" value={form.tanggal_pemberian} onChange={(e) => handleChange('tanggal_pemberian', e.target.value)} style={styles.input} required />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Usia Saat Pemberian (Bulan)</label>
                  <input type="number" value={form.usia_saat_pemberian} onChange={(e) => handleChange('usia_saat_pemberian', e.target.value)} style={styles.input} placeholder="Contoh: 9" />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} style={styles.input}>
                    <option value="Sudah Diberikan">Sudah Diberikan</option>
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Terlambat">Terlambat</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Berat Badan (kg) — Opsional</label>
                  <input type="number" step="0.1" value={form.berat_badan} onChange={(e) => handleChange('berat_badan', e.target.value)} style={styles.input} placeholder="Contoh: 10.5" />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Tinggi Badan (cm) — Opsional</label>
                  <input type="number" step="0.1" value={form.tinggi_badan} onChange={(e) => handleChange('tinggi_badan', e.target.value)} style={styles.input} placeholder="Contoh: 75" />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Petugas</label>
                  <input type="text" value={form.petugas} onChange={(e) => handleChange('petugas', e.target.value)} style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Lokasi</label>
                  <input type="text" value={form.lokasi} onChange={(e) => handleChange('lokasi', e.target.value)} style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Jadwal Berikutnya</label>
                  <input type="date" value={form.jadwal_berikutnya} onChange={(e) => handleChange('jadwal_berikutnya', e.target.value)} style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Vaksin Berikutnya</label>
                  <select value={form.vaksin_berikutnya} onChange={(e) => handleChange('vaksin_berikutnya', e.target.value)} style={styles.input}>
                    <option value="">Pilih vaksin berikutnya</option>
                    {daftarVaksin.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div style={styles.fullColumn}>
                  <label style={styles.label}>Catatan</label>
                  <textarea value={form.catatan} onChange={(e) => handleChange('catatan', e.target.value)} style={styles.textarea} placeholder="Contoh: Anak sehat, tidak demam, vaksin diberikan sesuai jadwal." />
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} style={styles.cancelButton}>Batal</button>
                <button type="submit" disabled={saving} style={styles.saveButton}>
                  {saving ? 'Menyimpan...' : editingId ? 'Perbarui Imunisasi' : 'Simpan Imunisasi'}
                </button>
              </div>
            </form>
          )}

          {/* Modal Konfirmasi Hapus */}
          {deleteConfirmId !== null && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalBox}>
                <div style={styles.modalIcon}>🗑️</div>
                <h3 style={styles.modalTitle}>Hapus Data Imunisasi?</h3>
                <p style={styles.modalText}>
                  Data imunisasi <strong>{riwayat.find(r => r.id === deleteConfirmId)?.nama_vaksin}</strong> akan dihapus permanen.
                </p>
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setDeleteConfirmId(null)} style={styles.cancelButton}>Batal</button>
                  <button
                    type="button"
                    onClick={() => handleDelete(riwayat.find(r => r.id === deleteConfirmId))}
                    style={styles.deleteConfirmButton}
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </div>
          )}

          <section style={styles.tableSection}>
            <h2 style={styles.sectionTitle}>Riwayat Imunisasi</h2>
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Vaksin</th>
                    <th style={styles.th}>Tanggal Pemberian</th>
                    <th style={styles.th}>Usia</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Petugas</th>
                    <th style={styles.th}>Jadwal Berikutnya</th>
                    <th style={styles.th}>Catatan</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayat.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={styles.emptyCell}>Belum ada data imunisasi.</td>
                    </tr>
                  ) : (
                    riwayat.map((item) => {
                      const statusLower = String(item.status || '').toLowerCase()
                      const statusStyle = statusLower.includes('sudah')
                        ? styles.statusDone
                        : statusLower.includes('terlambat')
                        ? styles.statusLate
                        : statusLower.includes('terjadwal')
                        ? styles.statusPlan
                        : styles.statusNeutral

                      return (
                        <tr key={item.id}>
                          <td style={styles.td}>{item.nama_vaksin || '-'}</td>
                          <td style={styles.td}>{formatTanggal(item.tanggal_pemberian)}</td>
                          <td style={styles.td}>{formatUsia(item.usia_saat_pemberian)}</td>
                          <td style={styles.td}>
                            {item.status ? (
                              <span style={{ ...styles.statusBadge, ...statusStyle }}>{item.status}</span>
                            ) : '-'}
                          </td>
                          <td style={styles.td}>{item.petugas || '-'}</td>
                          <td style={styles.td}>
                            {formatTanggal(item.jadwal_berikutnya || item.tanggal_jadwal_berikutnya)}
                            {item.vaksin_berikutnya && (
                              <div style={styles.nextVaksin}>→ {item.vaksin_berikutnya}</div>
                            )}
                          </td>
                          <td style={styles.td}>{item.catatan || '-'}</td>
                          <td style={{ ...styles.td, textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              style={styles.editButton}
                              title="Edit"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(item.id)}
                              style={styles.deleteButton}
                              title="Hapus"
                            >
                              🗑️ Hapus
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', background: '#4F724D', fontFamily },
  sidebar: { width: 240, minHeight: '100vh', background: '#EAF0EF', borderRight: '1px solid rgba(0,0,0,0.05)', padding: '22px 14px 20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', flexShrink: 0, fontFamily },
  brand: { border: 'none', background: 'transparent', color: '#3D6B43', fontSize: 27, fontWeight: 600, letterSpacing: '-0.6px', textAlign: 'left', cursor: 'pointer', padding: '0 6px', marginBottom: 28, fontFamily },
  nav: { display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
  navLink: { minHeight: 44, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', borderRadius: 12, color: '#355C3C', textDecoration: 'none', fontSize: 15, fontWeight: 500, fontFamily },
  navLinkActive: { background: '#CDEBCD', color: '#275031', fontWeight: 600 },
  navIcon: { width: 20, display: 'inline-flex', justifyContent: 'center', flexShrink: 0 },
  logoutButton: { minHeight: 46, borderRadius: 12, border: '1px solid rgba(61, 107, 67, 0.25)', background: 'transparent', color: '#355C3C', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily },
  main: { flex: 1, minWidth: 0, background: '#4F724D', fontFamily },
  header: { padding: '28px 34px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, color: '#FFFFFF', fontFamily },
  headerLeft: { display: 'flex', alignItems: 'flex-start', gap: 16 },
  backButton: { border: 'none', background: 'transparent', color: '#FFFFFF', fontSize: 34, lineHeight: 1, cursor: 'pointer', padding: 0, marginTop: 2, fontFamily },
  title: { margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', fontFamily },
  subtitle: { margin: '8px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.9)', fontFamily },
  userBadge: { border: 'none', background: '#F7E5D8', color: '#6C5145', minHeight: 34, padding: '0 14px', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily },
  content: { padding: '0 34px 36px', fontFamily },
  errorBox: { background: '#FEE2E2', color: '#991B1B', padding: 12, borderRadius: 10, marginBottom: 14, fontSize: 14, fontWeight: 500 },
  loadingBox: { gridColumn: '1 / -1', textAlign: 'center', color: '#6B5247', fontSize: 15, fontWeight: 600 },
  profileCard: { background: '#FFF7F8', border: '1px solid #E7CFCB', borderRadius: 16, padding: '22px 26px', display: 'grid', gridTemplateColumns: '70px 1fr auto', alignItems: 'center', gap: 18, boxShadow: '0 12px 28px rgba(30,45,30,0.12)', marginBottom: 22, fontFamily },
  avatarBox: { width: 62, height: 62, borderRadius: 14, background: '#EAF0EF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 },
  childInfo: { minWidth: 0 },
  childName: { margin: '0 0 5px', color: '#6B5247', fontSize: 25, fontWeight: 650, fontFamily },
  childMeta: { margin: 0, color: '#355C3C', fontSize: 14, fontWeight: 600, fontFamily },
  childSubMeta: { margin: '5px 0 0', color: '#6B5247', fontSize: 13, fontWeight: 600, fontFamily },
  addButton: { minHeight: 42, border: 'none', borderRadius: 10, background: '#4F724D', color: '#FFFFFF', padding: '0 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 18, marginBottom: 22, fontFamily },
  statCard: { background: '#FFF7F8', border: '1px solid #E7CFCB', borderRadius: 14, padding: 18, boxShadow: '0 8px 18px rgba(30,45,30,0.08)', fontFamily },
  statIcon: { width: 40, height: 40, borderRadius: 12, background: '#F3DED2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 20 },
  statLabel: { margin: '0 0 8px', color: '#6B5247', fontSize: 15, fontWeight: 650, fontFamily },
  statValue: { margin: 0, color: '#6B5247', fontSize: 28, fontWeight: 600, fontFamily },
  statSmall: { display: 'block', color: '#6B5247', fontSize: 13, fontWeight: 500, marginTop: 2, fontFamily },
  formCard: { background: '#FFF7F8', border: '1px solid #E7CFCB', borderRadius: 16, padding: 22, boxShadow: '0 12px 28px rgba(30,45,30,0.12)', marginBottom: 22, fontFamily },
  formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 18 },
  formTitle: { margin: 0, color: '#6B5247', fontSize: 21, fontWeight: 700, fontFamily },
  formSubtitle: { margin: '6px 0 0', color: '#8A6A5A', fontSize: 13, fontWeight: 500, fontFamily },
  closeButton: { width: 34, height: 34, border: 'none', borderRadius: '50%', background: '#F3DED2', color: '#6B5247', fontSize: 22, fontWeight: 600, cursor: 'pointer', fontFamily },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px 22px', fontFamily },
  formGroup: { fontFamily },
  fullColumn: { gridColumn: '1 / -1', fontFamily },
  label: { display: 'block', marginBottom: 8, color: '#6B5247', fontSize: 13, fontWeight: 650, fontFamily },
  input: { width: '100%', height: 42, border: '1px solid #E6C9B6', borderRadius: 8, background: '#F3DED2', color: '#6B5247', outline: 'none', padding: '0 12px', fontSize: 14, fontWeight: 500, boxSizing: 'border-box', fontFamily },
  textarea: { width: '100%', minHeight: 90, border: '1px solid #E6C9B6', borderRadius: 8, background: '#F3DED2', color: '#6B5247', outline: 'none', padding: 12, fontSize: 14, fontWeight: 600, boxSizing: 'border-box', resize: 'vertical', fontFamily },
  formActions: { marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 12, fontFamily },
  cancelButton: { minHeight: 38, minWidth: 100, border: 'none', borderRadius: 999, background: '#FFFFFF', color: '#6B5247', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily },
  saveButton: { minHeight: 38, minWidth: 150, border: 'none', borderRadius: 999, background: '#4F724D', color: '#FFFFFF', fontSize: 14, fontWeight: 650, cursor: 'pointer', fontFamily },
  tableSection: { marginTop: 6, fontFamily },
  sectionTitle: { margin: '0 0 14px', color: '#FFFFFF', fontSize: 20, fontWeight: 650, fontFamily },
  tableCard: { background: '#FFF7F8', border: '1px solid #E7CFCB', borderRadius: 16, padding: 18, boxShadow: '0 12px 28px rgba(30,45,30,0.12)', overflowX: 'auto', fontFamily },
  table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'auto', fontFamily },
  th: { textAlign: 'left', color: '#6B5247', fontSize: 13, fontWeight: 800, padding: '12px 10px', borderBottom: '1px solid #E7CFCB', fontFamily, whiteSpace: 'nowrap' },
  td: { color: '#6B5247', fontSize: 13, fontWeight: 500, padding: '13px 10px', borderBottom: '1px solid #F0DCDC', verticalAlign: 'top', fontFamily },
  emptyCell: { textAlign: 'center', color: '#6B5247', fontSize: 14, fontWeight: 600, padding: 24, fontFamily },
  statusBadge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 27, borderRadius: 999, padding: '0 12px', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', fontFamily },
  statusDone: { background: '#DDF4D7', color: '#3B7D2A' },
  statusPlan: { background: '#DDE9FA', color: '#406AAE' },
  statusLate: { background: '#FDE0DF', color: '#C4514D' },
  statusNeutral: { background: '#F3F3F3', color: '#666' },
  nextVaksin: { fontSize: 11, color: '#4F724D', fontWeight: 600, marginTop: 3 },
  editButton: { display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 6, padding: '5px 12px', borderRadius: 8, border: 'none', background: '#DDE9FA', color: '#406AAE', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily },
  deleteButton: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, border: 'none', background: '#FDE0DF', color: '#C4514D', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily },
  deleteConfirmButton: { minHeight: 38, minWidth: 100, border: 'none', borderRadius: 999, background: '#C4514D', color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modalBox: { background: '#FFF7F8', borderRadius: 18, padding: '32px 36px', maxWidth: 380, width: '90%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', fontFamily },
  modalIcon: { fontSize: 40, marginBottom: 12 },
  modalTitle: { margin: '0 0 10px', color: '#6B5247', fontSize: 20, fontWeight: 700, fontFamily },
  modalText: { margin: '0 0 22px', color: '#8A6A5A', fontSize: 14, fontWeight: 500, fontFamily },
  modalActions: { display: 'flex', justifyContent: 'center', gap: 12 },
}
