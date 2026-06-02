import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import API from '../api'

const fontFamily = '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif'

const menuItems = [
  { icon: '🏠', label: 'Beranda', to: '/dashboard', activePaths: ['/dashboard'] },
  { icon: '📈', label: 'Tumbuh Kembang', to: '/tumbuh-kembang', activePaths: ['/tumbuh-kembang', '/tumbuhkembang'] },
  { icon: '💉', label: 'Imunisasi', to: '/imunisasi', activePaths: ['/imunisasi'] },
  { icon: '📅', label: 'Jadwal Posyandu', to: '/jadwal', activePaths: ['/jadwal', '/jadwal-posyandu'] },
  { icon: '🏥', label: 'Kunjungan', to: '/riwayatkunjungan', activePaths: ['/riwayatkunjungan', '/catatkunjungan'] },
  { icon: '📝', label: 'Penanganan & Rekomendasi', to: '/penanganan-rekomendasi', activePaths: ['/penanganan-rekomendasi', '/rekomendasi-balita'] },
  { icon: '👶', label: 'Daftar Balita', to: '/daftar-balita', activePaths: ['/daftar-balita'] },
  { icon: '➕', label: 'Tambah Balita', to: '/tambah-balita', activePaths: ['/tambah-balita'] },
  { icon: '📋', label: 'Laporan Penimbangan', to: '/rekap-penimbangan', activePaths: ['/rekap-penimbangan'] },
  { icon: '👤', label: 'Profil', to: '/profil', activePaths: ['/profil'] },
  { icon: '⚙️', label: 'Pengaturan', to: '/pengaturan', activePaths: ['/pengaturan'] },
]

const jenisConfig = {
  penimbangan: { label: 'Posyandu Rutin', color: '#4caf7d', bg: '#e8f7ef', icon: '⚖️' },
  imunisasi: { label: 'Imunisasi', color: '#b06ce0', bg: '#f3e8fc', icon: '💉' },
  makanan_tambahan: { label: 'Pemberian Makanan Tambahan', color: '#e05555', bg: '#fceaea', icon: '🍽️' },
  penyuluhan: { label: 'Penyuluhan Kesehatan', color: '#e0c040', bg: '#fcf8e3', icon: '👨‍👩‍👧' },
  lainnya: { label: 'Lainnya', color: '#5b8dee', bg: '#e8effd', icon: '📌' },
}

const bulanNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

function MiniCalendar({ year, month, jadwal, onChangeMonth }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const markedDays = new Set(
    jadwal
      .filter(j => {
        const d = new Date(j.tanggal)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .map(j => new Date(j.tanggal).getDate())
  )

  const cells = []
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div style={s.calBox}>
      <div style={s.calHeader}>
        <button style={s.calNav} onClick={() => onChangeMonth(-1)}>{'◀'}</button>
        <span style={s.calTitle}>{bulanNames[month]} {year}</span>
        <button style={s.calNav} onClick={() => onChangeMonth(1)}>{'▶'}</button>
      </div>
      <div style={s.calGrid}>
        {['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d => (
          <div key={d} style={s.calDayLabel}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
          const hasEvent = markedDays.has(day)
          return (
            <div key={day} style={{
              ...s.calDay,
              ...(isToday ? s.calDayToday : {}),
              ...(hasEvent && !isToday ? s.calDayEvent : {}),
            }}>
              {day}
            </div>
          )
        })}
      </div>
      <div style={s.legendTitle}>Detail Kegiatan</div>
      <div style={s.legend}>
        {Object.entries(jenisConfig).filter(([k]) => k !== 'lainnya').map(([key, cfg]) => (
          <div key={key} style={s.legendItem}>
            <span style={{...s.legendDot, background: cfg.color}} />
            <span style={s.legendLabel}>{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ tanggal }) {
  const now = new Date()
  const d = new Date(tanggal)
  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return <span style={{...s.badge, background: '#e0e0e0', color: '#777'}}>Selesai</span>
  if (diffDays === 0) return <span style={{...s.badge, background: '#4caf7d', color: '#fff'}}>Hari Ini</span>
  if (diffDays <= 3) return <span style={{...s.badge, background: '#ff9800', color: '#fff'}}>Segera</span>
  if (diffDays <= 30) return <span style={{...s.badge, background: '#d1ecf1', color: '#2e6da4'}}>Akan Datang</span>
  return <span style={{...s.badge, background: '#cfe2ff', color: '#2255a4'}}>Terjadwal</span>
}

function JadwalCard({ item, isAdmin, onEdit, onDelete }) {
  const cfg = jenisConfig[item.jenis] || jenisConfig.lainnya
  const tanggal = new Date(item.tanggal)
  const tgl = `${tanggal.getDate()} ${bulanNames[tanggal.getMonth()]} ${tanggal.getFullYear()}`
  const jam = `${String(item.waktu_mulai || '').slice(0,5)} - ${String(item.waktu_selesai || '').slice(0,5)}`

  return (
    <div style={s.jadwalCard}>
      <div style={{...s.jadwalIconWrap, background: cfg.bg}}>
        <span style={s.jadwalIcon}>{cfg.icon}</span>
      </div>
      <div style={s.jadwalInfo}>
        <div style={s.jadwalTitle}>{item.judul || cfg.label}</div>
        <div style={s.jadwalDesc}>{item.deskripsi || cfg.label}</div>
        <div style={s.jadwalMeta}>
          <span style={s.jadwalMetaItem}><span style={s.metaIcon}>📍</span>{item.lokasi || 'Posyandu'}</span>
          <span style={s.jadwalMetaItem}><span style={s.metaIcon}>📅</span>{tgl}</span>
          <span style={s.jadwalMetaItem}><span style={s.metaIcon}>🕐</span>{jam}</span>
        </div>
      </div>
      <div style={s.jadwalRight}>
        <StatusBadge tanggal={item.tanggal} />
        {isAdmin && (
          <div style={s.jadwalActions}>
            <button style={s.iconBtn} onClick={() => onEdit(item)} title="Edit">✏️</button>
            <button style={{...s.iconBtn, ...s.iconBtnRed}} onClick={() => onDelete(item.id)} title="Hapus">🗑️</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Full-page form component ──────────────────────────────────────────────────
function FormPage({ editId, form, setForm, onSubmit, onCancel, user }) {
  const [notifToggle, setNotifToggle] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div style={s.formPage}>
      {/* Form header */}
      <header style={s.formHeader}>
        <div style={s.formHeaderLeft}>
          <button type="button" onClick={onCancel} style={s.backBtn}>←</button>
          <div>
            <h1 style={s.formHeaderTitle}>{editId ? 'Edit Agenda Posyandu' : 'Tambah Agenda Posyandu'}</h1>
            <p style={s.formHeaderSub}>{editId ? 'Ubah data agenda posyandu' : 'Tambah agenda baru kegiatan posyandu'}</p>
          </div>
        </div>
        <div style={s.userArea}>
          <button type="button" style={s.notifBtn}>🔔</button>
          <button type="button" style={s.userPill}>
            <span style={s.userAvatar}>👤</span>
            <span>{user.nama || 'User'}</span>
          </button>
        </div>
      </header>

      {/* Form body */}
      <div style={s.formBody}>
        <form onSubmit={handleSubmit} style={s.formWrap}>
          <div style={s.formCard}>
            <div style={s.formCardTitle}>Kelola Agenda Posyandu</div>

            {/* Row 1: Nama Kegiatan + Jenis Kegiatan */}
            <div style={s.formGrid}>
              <div style={s.fg}>
                <label style={s.flabel}>Nama Kegiatan</label>
                <input
                  type="text" required value={form.judul}
                  onChange={e => setForm({...form, judul: e.target.value})}
                  style={s.finput} placeholder="Contoh: Imunisasi Campak"
                />
              </div>
              <div style={s.fg}>
                <label style={s.flabel}>Jenis Kegiatan</label>
                <select value={form.jenis} onChange={e => setForm({...form, jenis: e.target.value})} style={s.finput}>
                  <option value="penimbangan">Posyandu Rutin (Penimbangan)</option>
                  <option value="imunisasi">Imunisasi</option>
                  <option value="makanan_tambahan">Makanan Tambahan</option>
                  <option value="penyuluhan">Penyuluhan Kesehatan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            {/* Row 2: Tanggal + Waktu */}
            <div style={s.formGrid}>
              <div style={s.fg}>
                <label style={s.flabel}>Tanggal Kegiatan</label>
                <input
                  type="date" required value={form.tanggal}
                  onChange={e => setForm({...form, tanggal: e.target.value})}
                  style={s.finput}
                />
              </div>
              <div style={s.fg}>
                <label style={s.flabel}>Waktu Kegiatan</label>
                <div style={s.timeRow}>
                  <input
                    type="time" value={form.waktu_mulai}
                    onChange={e => setForm({...form, waktu_mulai: e.target.value})}
                    style={{...s.finput, flex: 1}}
                  />
                  <span style={s.timeSep}>–</span>
                  <input
                    type="time" value={form.waktu_selesai}
                    onChange={e => setForm({...form, waktu_selesai: e.target.value})}
                    style={{...s.finput, flex: 1}}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Lokasi full width */}
            <div style={s.fg}>
              <label style={s.flabel}>Lokasi Kegiatan</label>
              <input
                type="text" value={form.lokasi}
                onChange={e => setForm({...form, lokasi: e.target.value})}
                style={s.finput} placeholder="Contoh: Posyandu Mawar"
              />
            </div>

            {/* Row 4: Deskripsi full width */}
            <div style={s.fg}>
              <label style={s.flabel}>Deskripsi Kegiatan</label>
              <input
                type="text" value={form.deskripsi}
                onChange={e => setForm({...form, deskripsi: e.target.value})}
                style={s.finput} placeholder="Contoh: Pemberian imunisasi campak"
              />
            </div>

            {/* Notifikasi toggle */}
            <div style={s.notifRow}>
              <span style={s.notifBell}>🔔</span>
              <div style={s.notifText}>
                <div style={s.notifTitle}>Peringatan Notifikasi</div>
                <div style={s.notifSub}>Kirim pengingat kepada orang tua balita</div>
              </div>
              <button
                type="button"
                onClick={() => setNotifToggle(v => !v)}
                style={{...s.toggle, ...(notifToggle ? s.toggleOn : s.toggleOff)}}
                aria-label="Toggle notifikasi"
              >
                <span style={{...s.toggleThumb, ...(notifToggle ? s.toggleThumbOn : {})}} />
              </button>
            </div>
          </div>

          {/* Save button */}
          <div style={s.formFooter}>
            <button type="submit" style={s.saveAgendaBtn}>
              💾 Simpan Agenda
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Jadwal() {
  const [jadwal, setJadwal] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterJenis, setFilterJenis] = useState('semua')
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [filterBulan, setFilterBulan] = useState(new Date().getMonth())
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear())

  const [form, setForm] = useState({
    judul: '', jenis: 'penimbangan', tanggal: '',
    waktu_mulai: '08:00', waktu_selesai: '12:00', lokasi: '', deskripsi: '',
  })

  const navigate = useNavigate()
  const location = useLocation()

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
  }, [])
  const isAdmin = user.role === 'admin'

  useEffect(() => { loadJadwal() }, [])

  const loadJadwal = async () => {
    setLoading(true); setError('')
    try {
      const res = await API.get('/jadwal')
      const list = Array.isArray(res.data) ? res.data : res.data?.data || []
      setJadwal(list)
    } catch (err) {
      setError('Gagal memuat jadwal: ' + (err.response?.data?.message || err.message))
      setJadwal([])
    } finally { setLoading(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login')
  }

  const resetForm = () => {
    setEditId(null)
    setForm({ judul: '', jenis: 'penimbangan', tanggal: '', waktu_mulai: '08:00', waktu_selesai: '12:00', lokasi: '', deskripsi: '' })
  }

  const handleSubmit = async () => {
    try {
      if (editId) {
        await API.put(`/jadwal/${editId}`, form)
      } else {
        await API.post('/jadwal', form)
      }
      resetForm()
      setShowForm(false)
      await loadJadwal()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Terjadi kesalahan'
      alert('Gagal menyimpan jadwal: ' + msg)
    }
  }

  const handleEdit = (item) => {
    setEditId(item.id)
    setForm({
      judul: item.judul || '', jenis: item.jenis || 'penimbangan',
      tanggal: item.tanggal ? String(item.tanggal).slice(0, 10) : '',
      waktu_mulai: item.waktu_mulai || '08:00', waktu_selesai: item.waktu_selesai || '12:00',
      lokasi: item.lokasi || '', deskripsi: item.deskripsi || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin hapus jadwal ini?')) return
    try { await API.delete(`/jadwal/${id}`); loadJadwal() }
    catch (err) { alert('Gagal hapus: ' + (err.response?.data?.message || err.message)) }
  }

  const handleChangeCalMonth = (dir) => {
    let m = calMonth + dir, y = calYear
    if (m < 0) { m = 11; y-- } else if (m > 11) { m = 0; y++ }
    setCalMonth(m); setCalYear(y); setFilterBulan(m); setFilterTahun(y)
  }

  const filteredJadwal = useMemo(() => {
    return jadwal
      .filter(j => {
        const d = new Date(j.tanggal)
        const matchBulan = d.getMonth() === filterBulan && d.getFullYear() === filterTahun
        const matchJenis = filterJenis === 'semua' || j.jenis === filterJenis
        const matchSearch = !search || (j.judul || '').toLowerCase().includes(search.toLowerCase()) || (j.lokasi || '').toLowerCase().includes(search.toLowerCase())
        return matchBulan && matchJenis && matchSearch
      })
      .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
  }, [jadwal, filterBulan, filterTahun, filterJenis, search])

  const isActiveMenu = (item) => item.activePaths.some(p => location.pathname.startsWith(p))

  // Show full-page form when showForm is true
  if (showForm) {
    return (
      <div style={s.page}>
        <aside style={s.sidebar}>
          <button type="button" onClick={() => navigate('/dashboard')} style={s.brand}>PosyanduCeria</button>
          <nav style={s.nav}>
            {menuItems.map(item => (
              <Link key={item.label} to={item.to} style={{...s.navLink, ...(isActiveMenu(item) ? s.navActive : {})}}>
                <span style={s.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <button type="button" onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </aside>
        <FormPage
          editId={editId}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); resetForm() }}
          user={user}
        />
      </div>
    )
  }

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <button type="button" onClick={() => navigate('/dashboard')} style={s.brand}>PosyanduCeria</button>
        <nav style={s.nav}>
          {menuItems.map(item => (
            <Link key={item.label} to={item.to} style={{...s.navLink, ...(isActiveMenu(item) ? s.navActive : {})}}>
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <button type="button" onClick={handleLogout} style={s.logoutBtn}>Logout</button>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <header style={s.header}>
          <div>
            <h1 style={s.headerTitle}>Agenda Posyandu</h1>
            <p style={s.headerSub}>Kelola semua jadwal kegiatan posyandu,<br/>imunisasi, dan pemberian makanan tambahan.</p>
          </div>
          <div style={s.userArea}>
            <button type="button" style={s.notifBtn} onClick={() => {
              if ('Notification' in window) Notification.requestPermission()
            }}>🔔</button>
            <button type="button" onClick={() => navigate('/profil')} style={s.userPill}>
              <span style={s.userAvatar}>👤</span>
              <span>{user.nama || 'User'}</span>
            </button>
          </div>
        </header>

        <div style={s.filterBar}>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Jadwal Kegiatan</label>
            <div style={s.searchWrap}>
              <input type="text" placeholder="Search ..." value={search} onChange={e => setSearch(e.target.value)} style={s.searchInput} />
              <span style={s.searchIcon}>🔍</span>
            </div>
          </div>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Jenis Kegiatan</label>
            <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)} style={s.selectInput}>
              <option value="semua">Semua Jenis</option>
              <option value="penimbangan">Posyandu Rutin</option>
              <option value="imunisasi">Imunisasi</option>
              <option value="makanan_tambahan">Makanan Tambahan</option>
              <option value="penyuluhan">Penyuluhan Kesehatan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Bulan</label>
            <select
              value={`${filterTahun}-${filterBulan}`}
              onChange={e => {
                const [y, m] = e.target.value.split('-')
                setFilterTahun(Number(y)); setFilterBulan(Number(m))
                setCalYear(Number(y)); setCalMonth(Number(m))
              }}
              style={s.selectInput}
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i} value={`${filterTahun}-${i}`}>📅 {bulanNames[i]} {filterTahun}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={s.contentWrap}>
          <MiniCalendar year={calYear} month={calMonth} jadwal={jadwal} onChangeMonth={handleChangeCalMonth} />
          <div style={s.listPanel}>
            <div style={s.listHeader}>Jadwal Kegiatan</div>
            {error && <div style={s.errorBox}>{error}</div>}
            {loading ? (
              <div style={s.loading}>Memuat data...</div>
            ) : filteredJadwal.length === 0 ? (
              <div style={s.empty}>Tidak ada jadwal untuk periode ini.</div>
            ) : (
              <div style={s.cardList}>
                {filteredJadwal.map(item => (
                  <JadwalCard key={item.id} item={item} isAdmin={isAdmin} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <button type="button" style={s.fab} onClick={() => { resetForm(); setShowForm(true) }}>
            📅 Tambah Agenda Posyandu
          </button>
        )}
      </main>
    </div>
  )
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: '#4a6741', fontFamily },
  sidebar: {
    width: 248, minHeight: '100vh', background: '#eaf2eb', padding: '28px 14px 24px',
    boxSizing: 'border-box', display: 'flex', flexDirection: 'column', flexShrink: 0,
  },
  brand: {
    border: 'none', background: 'transparent', color: '#3a5c38', fontSize: 22, fontWeight: 800,
    textAlign: 'left', padding: '0 4px', marginBottom: 28, cursor: 'pointer', fontFamily,
  },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navLink: {
    minHeight: 44, display: 'flex', alignItems: 'center', gap: 11, padding: '0 12px',
    borderRadius: 10, color: '#3a5c38', textDecoration: 'none', fontSize: 14.5, fontWeight: 500, fontFamily,
  },
  navActive: { background: '#c7e8ca', color: '#235029', fontWeight: 700 },
  navIcon: { width: 20, fontSize: 16 },
  logoutBtn: {
    width: '100%', minHeight: 42, border: '1px solid #b5ccb4', background: 'transparent',
    borderRadius: 9, color: '#3a5c38', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily,
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  header: {
    background: '#4a6741', padding: '24px 32px 18px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'flex-start', gap: 16,
  },
  headerTitle: { margin: '0 0 4px', color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' },
  headerSub: { margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: 13.5, lineHeight: 1.5 },
  userArea: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  notifBtn: { width: 36, height: 36, border: 'none', borderRadius: '50%', background: '#f3dece', cursor: 'pointer', fontSize: 15 },
  userPill: {
    border: 'none', borderRadius: 999, background: '#f3dece', color: '#5c3d28',
    padding: '5px 14px 5px 5px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily,
  },
  userAvatar: {
    width: 28, height: 28, borderRadius: '50%', background: '#7a5440', color: '#fff',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
  },
  filterBar: { background: '#4a6741', padding: '0 32px 20px', display: 'flex', gap: 18, flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  filterLabel: { color: '#d4ead4', fontSize: 12.5, fontWeight: 600 },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchInput: {
    height: 36, padding: '0 36px 0 12px', border: '1px solid #ccc', borderRadius: 8,
    fontSize: 13.5, outline: 'none', background: '#fff', color: '#333', fontFamily, width: 200,
  },
  searchIcon: { position: 'absolute', right: 10, fontSize: 14, pointerEvents: 'none' },
  selectInput: {
    height: 36, padding: '0 10px', border: '1px solid #ccc', borderRadius: 8,
    fontSize: 13.5, outline: 'none', background: '#fff', color: '#333', fontFamily, cursor: 'pointer',
  },
  contentWrap: { flex: 1, display: 'flex', gap: 18, padding: '18px 24px 100px', alignItems: 'flex-start' },
  // Calendar
  calBox: {
    width: 240, flexShrink: 0, background: '#fff', borderRadius: 16, padding: '18px 16px',
    boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
  },
  calHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  calNav: { border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#4a6741', padding: '4px 6px' },
  calTitle: { fontWeight: 700, fontSize: 13.5, color: '#333' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 14 },
  calDayLabel: { textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: '#999', padding: '2px 0 4px' },
  calDay: { textAlign: 'center', fontSize: 12, padding: '4px 2px', borderRadius: 6, cursor: 'default', color: '#444' },
  calDayToday: { background: '#4a6741', color: '#fff', fontWeight: 700 },
  calDayEvent: { background: '#d4ead4', color: '#235029', fontWeight: 600 },
  legendTitle: { fontSize: 11.5, fontWeight: 700, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' },
  legend: { display: 'flex', flexDirection: 'column', gap: 6 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 7 },
  legendDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  legendLabel: { fontSize: 12, color: '#555' },
  // List panel
  listPanel: {
    flex: 1, background: '#fff', borderRadius: 16, padding: '20px 22px',
    boxShadow: '0 4px 18px rgba(0,0,0,0.08)', minWidth: 0,
  },
  listHeader: { fontSize: 17, fontWeight: 800, color: '#2c3e2c', marginBottom: 14 },
  errorBox: { background: '#fee2e2', color: '#991b1b', padding: '12px 14px', borderRadius: 10, marginBottom: 14, fontSize: 13.5 },
  loading: { textAlign: 'center', color: '#888', padding: 28, fontSize: 14 },
  empty: { textAlign: 'center', color: '#aaa', padding: 32, fontSize: 14 },
  cardList: { display: 'flex', flexDirection: 'column', gap: 12 },
  // Jadwal card
  jadwalCard: {
    display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
    borderRadius: 12, border: '1px solid #efefef', background: '#fafafa',
  },
  jadwalIconWrap: {
    width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  jadwalIcon: { fontSize: 22 },
  jadwalInfo: { flex: 1, minWidth: 0 },
  jadwalTitle: { fontSize: 14.5, fontWeight: 700, color: '#2c3e2c', marginBottom: 2 },
  jadwalDesc: { fontSize: 12.5, color: '#888', marginBottom: 8 },
  jadwalMeta: { display: 'flex', flexWrap: 'wrap', gap: 12 },
  jadwalMetaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: '#555' },
  metaIcon: { fontSize: 13 },
  jadwalRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 },
  badge: { borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
  jadwalActions: { display: 'flex', gap: 6 },
  iconBtn: { border: '1px solid #e0e0e0', background: '#fff', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', fontSize: 14 },
  iconBtnRed: { borderColor: '#fca5a5' },
  // FAB
  fab: {
    position: 'fixed', bottom: 28, right: 32, background: '#f3dece', color: '#5c3d28',
    border: 'none', borderRadius: 14, padding: '14px 26px', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', boxShadow: '0 6px 20px rgba(150,100,70,0.25)', display: 'flex',
    alignItems: 'center', gap: 9, fontFamily, zIndex: 100,
  },

  // ── Full-page form styles ──────────────────────────────────────────────────
  formPage: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  formHeader: {
    background: '#4a6741', padding: '22px 32px 18px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'flex-start', gap: 16,
  },
  formHeaderLeft: { display: 'flex', alignItems: 'flex-start', gap: 14 },
  backBtn: {
    border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff',
    borderRadius: 10, width: 38, height: 38, fontSize: 18, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
  },
  formHeaderTitle: { margin: '0 0 3px', color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px' },
  formHeaderSub: { margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  formBody: {
    flex: 1, background: '#4a6741', padding: '28px 32px 40px',
    display: 'flex', flexDirection: 'column',
  },
  formWrap: { display: 'flex', flexDirection: 'column', gap: 0 },
  formCard: {
    background: '#fff',
    // crosshatch grid pattern like the design
    backgroundImage: `
      linear-gradient(rgba(220,190,170,0.25) 1px, transparent 1px),
      linear-gradient(90deg, rgba(220,190,170,0.25) 1px, transparent 1px)
    `,
    backgroundSize: '28px 28px',
    borderRadius: 16, padding: '28px 28px 20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  formCardTitle: { fontSize: 16, fontWeight: 800, color: '#2c3e2c', marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 16 },
  fg: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 },
  flabel: { fontSize: 12.5, fontWeight: 700, color: '#666' },
  finput: {
    width: '100%', boxSizing: 'border-box', padding: '10px 14px',
    border: 'none', borderRadius: 8, fontSize: 13.5, color: '#3a3020',
    outline: 'none', fontFamily, background: '#f5e6d8', fontWeight: 500,
  },
  timeRow: { display: 'flex', alignItems: 'center', gap: 8 },
  timeSep: { color: '#999', fontSize: 16, flexShrink: 0 },
  // Notif toggle row
  notifRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#fef9e7', border: '1px solid #f5e2a0', borderRadius: 10,
    padding: '12px 16px', marginTop: 4,
  },
  notifBell: { fontSize: 20, flexShrink: 0 },
  notifText: { flex: 1 },
  notifTitle: { fontSize: 13.5, fontWeight: 700, color: '#7a5c00' },
  notifSub: { fontSize: 12, color: '#a08030', marginTop: 2 },
  toggle: {
    width: 44, height: 24, borderRadius: 999, border: 'none',
    cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s', padding: 0,
  },
  toggleOn: { background: '#4a6741' },
  toggleOff: { background: '#ccc' },
  toggleThumb: {
    position: 'absolute', top: 3, left: 3, width: 18, height: 18,
    borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  toggleThumbOn: { left: 23 },
  // Footer save button
  formFooter: { display: 'flex', justifyContent: 'flex-end', marginTop: 24 },
  saveAgendaBtn: {
    background: '#f3dece', color: '#5c3d28', border: 'none', borderRadius: 12,
    padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(150,100,70,0.2)', display: 'flex', alignItems: 'center',
    gap: 8, fontFamily,
  },
}