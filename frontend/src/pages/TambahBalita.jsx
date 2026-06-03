import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import API from '../api'

const fontFamily = '"Segoe UI", Arial, Helvetica, sans-serif'

const sidebarMenus = [
  { icon: '🏠', label: 'Beranda', to: '/dashboard' },
  { icon: '📈', label: 'Tumbuh Kembang', to: '/tumbuh-kembang' },
  { icon: '💉', label: 'Imunisasi', to: '/imunisasi' },
  { icon: '📅', label: 'Jadwal Posyandu', to: '/jadwal' },
  { icon: '🏥', label: 'Kunjungan', to: '/riwayatkunjungan' },
  { icon: '📝', label: 'Penanganan & Rekomendasi', to: '/penanganan-rekomendasi' },
  { icon: '👶', label: 'Daftar Balita', to: '/daftar-balita' },
  { icon: '➕', label: 'Tambah Balita', to: '/tambah-balita' },
  { icon: '📋', label: 'Laporan Penimbangan', to: '/rekap-penimbangan' },
  { icon: '👤', label: 'Profil', to: '/profil' },
]

function formatUsia(usiaBulan) {
  if (usiaBulan === undefined || usiaBulan === null || Number.isNaN(Number(usiaBulan))) return '-'
  const total = Number(usiaBulan)
  const tahun = Math.floor(total / 12)
  const bulan = total % 12
  if (tahun <= 0) return `${bulan} bulan`
  if (bulan === 0) return `${tahun} tahun`
  return `${tahun} tahun ${bulan} bulan`
}

function hitungUsia(tanggalLahir) {
  if (!tanggalLahir) return null
  const lahir = new Date(tanggalLahir)
  const now = new Date()
  const months =
    (now.getFullYear() - lahir.getFullYear()) * 12 + (now.getMonth() - lahir.getMonth())
  return months
}

function formatTanggalIndonesia(iso) {
  if (!iso) return '-'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function TambahBalita() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const location = useLocation()

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
  }, [])

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [nonaktifLoading, setNonaktifLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const emptyForm = {
    nama: '',
    user_id: '',
    jenis_kelamin: 'L',
    kota_kelahiran: '',
    tanggal_lahir: '',
    nik: '',
    nama_ibu: '',
    nik_ibu: '',
    no_telepon_ibu: '',
    nama_ayah: '',
    nik_ayah: '',
    no_telepon_ayah: '',
    alamat: '',
    alamat_posyandu: '',
    tanggal_terdaftar: new Date().toISOString().split('T')[0],
  }

  const [form, setForm] = useState(emptyForm)
  const [balitaData, setBalitaData] = useState(null)
  const [usiaBulan, setUsiaBulan] = useState(null)
  const [orangTuaList, setOrangTuaList] = useState([])

  useEffect(() => {
    if (!isEdit) return
    let isMounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await API.get(`/balita/${id}`)
        const data = res.data?.data || res.data
        if (!isMounted) return
        setBalitaData(data)
        setUsiaBulan(data?.usia_bulan ?? hitungUsia(data?.tanggal_lahir))

        // Split alamat - try to parse nama_ibu, nik_ibu, etc from orang_tua
        const orang_tua = data?.orang_tua || {}

        setForm({
          nama: data?.nama || '',
          user_id: data?.user_id || data?.orang_tua?.id || '',
          jenis_kelamin: data?.jenis_kelamin || 'L',
          kota_kelahiran: data?.kota_kelahiran || '',
          tanggal_lahir: data?.tanggal_lahir || '',
          nik: data?.nik || '',
          nama_ibu: data?.nama_ibu || orang_tua?.nama || '',
          nik_ibu: data?.nik_ibu || '',
          no_telepon_ibu: data?.no_telepon_ibu || orang_tua?.no_telepon || '',
          nama_ayah: data?.nama_ayah || '',
          nik_ayah: data?.nik_ayah || '',
          no_telepon_ayah: data?.no_telepon_ayah || '',
          alamat: data?.alamat || '',
          alamat_posyandu: data?.alamat_posyandu || '',
          tanggal_terdaftar: data?.createdAt
            ? data.createdAt.split('T')[0]
            : new Date().toISOString().split('T')[0],
        })
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Gagal memuat data balita.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [id, isEdit])

  // Auto-calculate usia when tanggal_lahir changes
  useEffect(() => {
    if (form.tanggal_lahir) {
      setUsiaBulan(hitungUsia(form.tanggal_lahir))
    }
  }, [form.tanggal_lahir])

  // Load the list of parent (orang tua) accounts. The balita MUST be linked to
  // one of these (user_id) or it will never show up on that parent's ortu app.
  useEffect(() => {
    let mounted = true
    API.get('/users', { params: { role: 'orang_tua', limit: 200 } })
      .then((res) => { if (mounted) setOrangTuaList(res.data?.data || []) })
      .catch(() => { if (mounted) setOrangTuaList([]) })
    return () => { mounted = false }
  }, [])

  // Picking a parent links the child + auto-fills mother name/phone if empty
  const handleParentSelect = (value) => {
    const parent = orangTuaList.find((u) => String(u.id) === String(value))
    setForm((prev) => ({
      ...prev,
      user_id: value,
      nama_ibu: prev.nama_ibu || parent?.nama || '',
      no_telepon_ibu: prev.no_telepon_ibu || parent?.no_telepon || '',
    }))
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isActive = (to) => {
    if (to === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(to)
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')

    if (!form.nama.trim()) { setError('Nama lengkap balita wajib diisi.'); return }
    if (!form.tanggal_lahir) { setError('Tanggal lahir wajib diisi.'); return }
    if (!form.jenis_kelamin) { setError('Jenis kelamin wajib dipilih.'); return }
    if (!isEdit && !form.user_id) { setError('Pilih akun orang tua agar data balita muncul di aplikasi orang tua.'); return }
    if (!form.nama_ibu.trim()) { setError('Nama ibu wajib diisi.'); return }

    const payload = {
      nama: form.nama,
      user_id: form.user_id || undefined,
      jenis_kelamin: form.jenis_kelamin,
      kota_kelahiran: form.kota_kelahiran,
      tanggal_lahir: form.tanggal_lahir,
      nik: form.nik,
      nama_ibu: form.nama_ibu,
      nik_ibu: form.nik_ibu,
      no_telepon_ibu: form.no_telepon_ibu,
      nama_ayah: form.nama_ayah,
      nik_ayah: form.nik_ayah,
      no_telepon_ayah: form.no_telepon_ayah,
      alamat: form.alamat,
      alamat_posyandu: form.alamat_posyandu,
    }

    setSaving(true)
    try {
      if (isEdit) {
        await API.put(`/balita/${id}`, payload)
        setSuccess('Data balita berhasil diperbarui!')
      } else {
        await API.post('/balita', payload)
        setSuccess('Data balita berhasil ditambahkan!')
        setForm(emptyForm)
        setUsiaBulan(null)
      }
      setTimeout(() => navigate('/daftar-balita'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data balita.')
    } finally {
      setSaving(false)
    }
  }

  const handleNonaktif = async () => {
    if (!window.confirm(`Nonaktifkan data ${balitaData?.nama}?`)) return
    setNonaktifLoading(true)
    try {
      await API.delete(`/balita/${id}`)
      navigate('/daftar-balita')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menonaktifkan data.')
    } finally {
      setNonaktifLoading(false)
    }
  }

  const anakId = isEdit ? (balitaData?.id ? `AN-${String(balitaData.id).padStart(5, '0')}` : '-') : null

  return (
    <div style={styles.page}>
      {/* Embedded sidebar removed — global AppSidebar from PegawaiShell takes over */}

      {/* Main */}
      <main style={styles.main}>
        <header style={styles.hero}>
          <div style={styles.heroLeft}>
            <button type="button" onClick={() => navigate('/daftar-balita')} style={styles.backButton}>
              ←
            </button>
            <div>
              <h1 style={styles.heroTitle}>Daftar Balita</h1>
              <p style={styles.heroSubtitle}>Cari dan pilih balita untuk mengelola data balita</p>
            </div>
          </div>
          <div style={styles.heroRight}>
            <button type="button" style={styles.notificationButton}>🔔</button>
            <button type="button" onClick={() => navigate('/profil')} style={styles.userBadge}>
              👤 {user?.nama || 'User'}
            </button>
          </div>
        </header>

        <section style={styles.contentWrap}>
          {loading ? (
            <div style={styles.loadingFull}>Memuat data balita...</div>
          ) : (
            <>
              {/* Profile Header (edit mode) */}
              {isEdit && balitaData && (
                <div style={styles.profileCard}>
                  <div style={styles.profileAvatarWrap}>
                    <div style={styles.profileAvatar}>
                      {balitaData?.foto ? (
                        <img src={balitaData.foto} alt={balitaData.nama} style={styles.profileAvatarImg} />
                      ) : (
                        <span style={{ fontSize: 42 }}>
                          {balitaData?.jenis_kelamin === 'P' ? '👧' : '👦'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={styles.profileInfo}>
                    <div style={styles.profileName}>{balitaData?.nama || '-'}</div>
                    <div style={styles.profileMeta}>
                      <span style={{
                        ...styles.profileGender,
                        color: balitaData?.jenis_kelamin === 'P' ? '#D364F7' : '#2F88F0',
                      }}>
                        {balitaData?.jenis_kelamin === 'P' ? '♀' : '♂'}{' '}
                        {balitaData?.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'}
                      </span>
                      <span style={styles.profileAge}>
                        {usiaBulan !== null ? formatUsia(usiaBulan) : '-'}
                      </span>
                    </div>
                    <div style={styles.profileId}>
                      <span style={styles.profileIdLabel}>🪪 ID Anak</span>
                      <span style={styles.profileIdValue}>{anakId}</span>
                    </div>
                  </div>
                </div>
              )}

              {error && <div style={styles.errorBox}>{error}</div>}
              {success && <div style={styles.successBox}>{success}</div>}

              {/* Section 1: Identitas Balita */}
              <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionNumber}>1</div>
                  <h2 style={styles.sectionTitle}>Identitas Balita</h2>
                </div>

                <div style={styles.formGrid3}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>ID Anak (Otomatis)</label>
                    <input
                      type="text"
                      value={isEdit ? anakId : 'Otomatis'}
                      disabled
                      style={styles.inputDisabled}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Nama Lengkap <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nama}
                      onChange={(e) => handleChange('nama', e.target.value)}
                      placeholder="Nama lengkap anak"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Jenis Kelamin <span style={styles.required}>*</span>
                    </label>
                    <div style={styles.genderToggle}>
                      <button
                        type="button"
                        onClick={() => handleChange('jenis_kelamin', 'L')}
                        style={{
                          ...styles.genderBtn,
                          ...(form.jenis_kelamin === 'L' ? styles.genderBtnActiveMale : {}),
                        }}
                      >
                        ♂ Laki-laki
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('jenis_kelamin', 'P')}
                        style={{
                          ...styles.genderBtn,
                          ...(form.jenis_kelamin === 'P' ? styles.genderBtnActiveFemale : {}),
                        }}
                      >
                        ♀ Perempuan
                      </button>
                    </div>
                  </div>
                </div>

                <div style={styles.formGrid3}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Kota Kelahiran</label>
                    <input
                      type="text"
                      value={form.kota_kelahiran}
                      onChange={(e) => handleChange('kota_kelahiran', e.target.value)}
                      placeholder="Kota kelahiran"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Tanggal Lahir <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="date"
                      value={form.tanggal_lahir}
                      onChange={(e) => handleChange('tanggal_lahir', e.target.value)}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Usia (Otomatis)</label>
                    <input
                      type="text"
                      value={usiaBulan !== null ? formatUsia(usiaBulan) : '-'}
                      disabled
                      style={styles.inputDisabled}
                    />
                  </div>
                </div>

                <div style={styles.formGrid1}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Nomor Induk Kependudukan Anak
                    </label>
                    <div style={styles.inputWithIcon}>
                      <input
                        type="text"
                        value={form.nik}
                        onChange={(e) => handleChange('nik', e.target.value)}
                        placeholder="Belum diisi"
                        style={{ ...styles.input, paddingRight: 40 }}
                        maxLength={20}
                      />
                      <span style={styles.inputIconRight}>🪪</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Data Orang Tua / Wali */}
              <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionNumber}>2</div>
                  <h2 style={styles.sectionTitle}>Data Orang Tua / Wali</h2>
                </div>

                {/* Parent ACCOUNT selector — links the balita to a real ortu account
                    so the child appears on the parent's app. */}
                <div style={styles.formGrid1}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Akun Orang Tua (Pemilik Data) <span style={styles.required}>*</span>
                    </label>
                    <select
                      value={form.user_id}
                      onChange={(e) => handleParentSelect(e.target.value)}
                      style={styles.input}
                    >
                      <option value="">— Pilih akun orang tua —</option>
                      {orangTuaList.map((u) => (
                        <option key={u.id} value={u.id}>{u.nama} — {u.email}</option>
                      ))}
                    </select>
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#876D5D', fontWeight: 600 }}>
                      Wajib dipilih agar data balita muncul di aplikasi orang tua (ortu).
                    </p>
                  </div>
                </div>

                <div style={styles.formGrid3}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Nama Ibu <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nama_ibu}
                      onChange={(e) => handleChange('nama_ibu', e.target.value)}
                      placeholder="Nama ibu"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      NIK Ibu <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nik_ibu}
                      onChange={(e) => handleChange('nik_ibu', e.target.value)}
                      placeholder="NIK ibu"
                      style={styles.input}
                      maxLength={20}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Nomor Telepon Ibu <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.no_telepon_ibu}
                      onChange={(e) => handleChange('no_telepon_ibu', e.target.value)}
                      placeholder="No. telepon ibu"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formGrid3}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Nama Ayah <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nama_ayah}
                      onChange={(e) => handleChange('nama_ayah', e.target.value)}
                      placeholder="Nama ayah"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      NIK Ayah <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nik_ayah}
                      onChange={(e) => handleChange('nik_ayah', e.target.value)}
                      placeholder="NIK ayah"
                      style={styles.input}
                      maxLength={20}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nomor Telepon Ayah</label>
                    <input
                      type="text"
                      value={form.no_telepon_ayah}
                      onChange={(e) => handleChange('no_telepon_ayah', e.target.value)}
                      placeholder="Belum diisi"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formGrid1}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Alamat Lengkap <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.alamat}
                      onChange={(e) => handleChange('alamat', e.target.value)}
                      placeholder="Alamat lengkap"
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Informasi Lainnya */}
              <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionNumber}>3</div>
                  <h2 style={styles.sectionTitle}>Informasi Lainnya</h2>
                </div>

                <div style={styles.formGrid3}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Tanggal Terdaftar <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={isEdit && balitaData?.createdAt
                        ? formatTanggalIndonesia(balitaData.createdAt)
                        : formatTanggalIndonesia(form.tanggal_terdaftar + 'T00:00:00')}
                      disabled
                      style={styles.inputDisabled}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Terakhir Diukur <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={isEdit && balitaData?.updatedAt
                        ? formatTanggalIndonesia(balitaData.updatedAt)
                        : '-'}
                      disabled
                      style={styles.inputDisabled}
                    />
                  </div>
                  <div />
                </div>

                <div style={styles.formGrid1}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Alamat Posyandu</label>
                    <input
                      type="text"
                      value={form.alamat_posyandu}
                      onChange={(e) => handleChange('alamat_posyandu', e.target.value)}
                      placeholder="Alamat posyandu"
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={styles.actionRow}>
                {isEdit && (
                  <button
                    type="button"
                    onClick={handleNonaktif}
                    disabled={nonaktifLoading}
                    style={styles.nonaktifBtn}
                  >
                    🗑️ {nonaktifLoading ? 'Memproses...' : 'Nonaktifkan Data'}
                  </button>
                )}
                <div style={{ flex: 1 }} />
                <button
                  type="button"
                  onClick={() => navigate('/daftar-balita')}
                  style={styles.batalBtn}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={styles.simpanBtn}
                >
                  💾 {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Data'}
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    background: '#4F724D',
    fontFamily,
  },
  sidebar: {
    width: 240,
    minHeight: '100vh',
    background: '#EAF0EF',
    borderRight: '1px solid rgba(0,0,0,0.05)',
    padding: '22px 14px 20px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    fontFamily,
    flexShrink: 0,
  },
  brand: {
    border: 'none', background: 'transparent', color: '#3D6B43',
    fontSize: 27, fontWeight: 700, letterSpacing: '-0.6px',
    textAlign: 'left', cursor: 'pointer', padding: '0 6px',
    marginBottom: 28, fontFamily,
  },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navLink: {
    minHeight: 42, display: 'flex', alignItems: 'center', gap: 12,
    padding: '0 14px', borderRadius: 12, color: '#355C3C',
    textDecoration: 'none', fontSize: 14, fontWeight: 500, fontFamily,
  },
  navLinkActive: { background: '#CDEBCD', color: '#275031', fontWeight: 700 },
  navIcon: { width: 20, display: 'inline-flex', justifyContent: 'center', flexShrink: 0 },
  logoutButton: {
    minHeight: 46, borderRadius: 12, border: '1px solid rgba(61,107,67,0.25)',
    background: 'transparent', color: '#355C3C', fontSize: 14,
    fontWeight: 600, cursor: 'pointer', fontFamily, marginTop: 8,
  },
  main: { flex: 1, minWidth: 0, background: '#4F724D', fontFamily, overflowY: 'auto' },
  hero: {
    padding: '24px 34px 18px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    gap: 20, color: '#fff',
  },
  heroLeft: { display: 'flex', alignItems: 'flex-start', gap: 16 },
  backButton: {
    border: 'none', background: 'transparent', color: '#fff',
    fontSize: 34, lineHeight: 1, cursor: 'pointer', padding: 0, marginTop: 2,
  },
  heroTitle: { margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' },
  heroSubtitle: { margin: '8px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  heroRight: { display: 'flex', alignItems: 'center', gap: 10 },
  notificationButton: {
    width: 34, height: 34, borderRadius: '50%', border: 'none',
    background: '#F7E5D8', cursor: 'pointer', fontSize: 16,
  },
  userBadge: {
    border: 'none', background: '#F7E5D8', color: '#6C5145',
    minHeight: 34, padding: '0 14px', borderRadius: 999,
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily,
  },
  contentWrap: { padding: '10px 34px 34px' },
  loadingFull: {
    background: '#FFF7F8', borderRadius: 16, padding: '40px',
    textAlign: 'center', color: '#8A6A5A', fontSize: 15, fontWeight: 500,
  },

  // Profile card (edit mode only)
  profileCard: {
    background: '#FFF7F8',
    borderRadius: 16,
    border: '1px solid #E7CFCB',
    padding: '20px 24px',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    boxShadow: '0 4px 12px rgba(30,45,30,0.08)',
  },
  profileAvatarWrap: { flexShrink: 0 },
  profileAvatar: {
    width: 74, height: 74, borderRadius: '50%',
    background: '#EAEFF0', display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  profileAvatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: 700, color: '#3D1F1A', marginBottom: 6 },
  profileMeta: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 },
  profileGender: { fontSize: 14, fontWeight: 700 },
  profileAge: { fontSize: 14, color: '#8A6A5A', fontWeight: 500 },
  profileId: { display: 'flex', alignItems: 'center', gap: 8 },
  profileIdLabel: { fontSize: 13, color: '#8A6A5A' },
  profileIdValue: { fontSize: 13, fontWeight: 700, color: '#6B5247' },

  errorBox: {
    background: '#FEE2E2', color: '#991B1B',
    padding: '12px 16px', borderRadius: 10, marginBottom: 14,
    fontSize: 14, fontWeight: 500,
  },
  successBox: {
    background: '#DCFCE7', color: '#166534',
    padding: '12px 16px', borderRadius: 10, marginBottom: 14,
    fontSize: 14, fontWeight: 500,
  },

  // Section card
  sectionCard: {
    background: '#EAF2FF',
    borderRadius: 16,
    border: '1px solid #C9DCF3',
    padding: '20px 24px',
    marginBottom: 16,
    boxShadow: '0 4px 12px rgba(30,45,80,0.07)',
  },
  sectionHeader: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
  },
  sectionNumber: {
    width: 28, height: 28, borderRadius: '50%',
    background: '#2F6FC4', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, flexShrink: 0,
  },
  sectionTitle: {
    margin: 0, fontSize: 16, fontWeight: 700, color: '#1E3A5C',
  },

  // Form layouts
  formGrid3: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px 18px', marginBottom: 14,
  },
  formGrid1: {
    display: 'grid', gridTemplateColumns: '1fr', gap: '14px 18px', marginBottom: 14,
  },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#4A6080', fontFamily },
  required: { color: '#E53E3E' },
  input: {
    height: 42, borderRadius: 9, border: '1px solid #C8D8EE',
    padding: '0 12px', background: '#fff', color: '#3D4F6B',
    fontSize: 14, fontWeight: 500, outline: 'none', fontFamily,
    boxSizing: 'border-box', width: '100%',
  },
  inputDisabled: {
    height: 42, borderRadius: 9, border: '1px solid #D5E3F0',
    padding: '0 12px', background: '#EDF2F9', color: '#8A9BB5',
    fontSize: 14, fontWeight: 500, fontFamily,
    boxSizing: 'border-box', width: '100%',
  },
  inputWithIcon: { position: 'relative' },
  inputIconRight: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    fontSize: 16, pointerEvents: 'none',
  },

  // Gender toggle
  genderToggle: { display: 'flex', gap: 8 },
  genderBtn: {
    flex: 1, height: 42, borderRadius: 9, border: '1px solid #C8D8EE',
    background: '#fff', color: '#4A6080', fontSize: 14,
    fontWeight: 600, cursor: 'pointer', fontFamily, transition: 'all 0.15s',
  },
  genderBtnActiveMale: {
    background: '#2F88F0', color: '#fff', border: '1px solid #2F88F0',
  },
  genderBtnActiveFemale: {
    background: '#D364F7', color: '#fff', border: '1px solid #D364F7',
  },

  // Action row
  actionRow: {
    display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap',
  },
  nonaktifBtn: {
    minHeight: 46, padding: '0 20px', borderRadius: 12,
    border: 'none', background: '#FEE2E2', color: '#DC2626',
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  batalBtn: {
    minHeight: 46, padding: '0 20px', borderRadius: 12,
    border: '1px solid #C8D8EE', background: '#EDF2F9', color: '#4A6080',
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily,
  },
  simpanBtn: {
    minHeight: 46, padding: '0 24px', borderRadius: 12,
    border: 'none', background: '#2F6FC4', color: '#fff',
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily,
    display: 'flex', alignItems: 'center', gap: 8,
  },
}
