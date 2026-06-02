import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import API from '../api'

const fontFamily = '"Segoe UI", Arial, Helvetica, sans-serif'
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

const sidebarMenus = [
  { icon: '🏠', label: 'Beranda', to: '/dashboard' },
  { icon: '📈', label: 'Tumbuh Kembang', to: '/tumbuh-kembang' },
  { icon: '💉', label: 'Imunisasi', to: '/imunisasi' },
  { icon: '📅', label: 'Jadwal Posyandu', to: '/jadwal' },
  { icon: '🏥', label: 'Kunjungan', to: '/riwayatkunjungan' },
  { icon: '📝', label: 'Penanganan & Rekomendasi', to: '/penanganan-rekomendasi' },
  { icon: '👶', label: 'Daftar Balita', to: '/daftar-balita' },
  { icon: '📋', label: 'Laporan Penimbangan', to: '/rekap-penimbangan' },
  { icon: '👤', label: 'Profil', to: '/profil' },
]

const formatUsia = (tglLahir) => {
  if (!tglLahir) return '-'
  const lahir = new Date(tglLahir)
  const now = new Date()
  const totalBulan = (now.getFullYear() - lahir.getFullYear()) * 12 + (now.getMonth() - lahir.getMonth())
  const th = Math.floor(totalBulan / 12)
  const bln = totalBulan % 12
  if (th <= 0) return `${bln} bln`
  if (bln === 0) return `${th} th`
  return `${th} th ${bln} bln`
}

const formatTanggal = (v) => {
  if (!v) return '-'
  const d = new Date(v)
  if (isNaN(d)) return '-'
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

const statusGiziLabel = (v) => {
  const map = { gizi_buruk: 'Gizi Buruk', gizi_kurang: 'Gizi Kurang', gizi_baik: 'Normal', gizi_lebih: 'Gizi Lebih', obesitas: 'Obesitas' }
  return map[v] || v || '-'
}

const statusGiziStyle = (v) => {
  if (!v) return { bg: '#F3F3F3', color: '#888' }
  const s = (v || '').toLowerCase()
  if (s === 'gizi_baik') return { bg: '#D1FAE5', color: '#065F46' }
  if (s === 'gizi_kurang') return { bg: '#FEF3C7', color: '#92400E' }
  if (s === 'gizi_buruk') return { bg: '#FEE2E2', color: '#991B1B' }
  if (s === 'gizi_lebih' || s === 'obesitas') return { bg: '#FFEDD5', color: '#9A3412' }
  if (s.includes('stunting')) return { bg: '#FEE2E2', color: '#991B1B' }
  return { bg: '#F3F3F3', color: '#555' }
}

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <aside style={S.sidebar}>
      <button onClick={() => navigate('/dashboard')} style={S.brand}>PosyanduCeria</button>
      <nav style={S.nav}>
        {sidebarMenus.map((m) => (
          <Link key={m.to} to={m.to} style={{ ...S.navLink, ...(location.pathname.startsWith(m.to) ? S.navLinkActive : {}) }}>
            <span style={S.navIcon}>{m.icon}</span><span>{m.label}</span>
          </Link>
        ))}
      </nav>
      <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login') }} style={S.logoutBtn}>Logout</button>
    </aside>
  )
}

export default function RekapPenimbangan() {
  const navigate = useNavigate()
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} } }, [])

  const now = new Date()
  const [bulan, setBulan] = useState(now.getMonth() + 1)
  const [tahun, setTahun] = useState(now.getFullYear())
  const [search, setSearch] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [bulan, tahun])

  const loadData = async () => {
    setLoading(true); setError('')
    try {
      const res = await API.get(`/dashboard/rekap-penimbangan?bulan=${bulan}&tahun=${tahun}`)
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
      setData(list)
    } catch (e) {
      setError('Gagal memuat data rekap penimbangan.')
    } finally { setLoading(false) }
  }

  const filtered = data.filter(d => (d.nama || '').toLowerCase().includes(search.toLowerCase()))

  const getStatusGiziDisplay = (item) => {
    const sg = item.status_gizi
    const stunting = item.stunting === 'Ya' || item.is_stunting
    if (stunting) return { label: 'Stunting', bg: '#FEE2E2', color: '#991B1B' }
    return { label: statusGiziLabel(sg), ...statusGiziStyle(sg) }
  }

  return (
    <div style={S.page}>
      <Sidebar />
      <main style={S.main}>
        <header style={S.header}>
          <div>
            <h1 style={S.title}>Rekap Penimbangan</h1>
            <p style={S.subtitle}>Berikut adalah rekap penimbangan semua balita</p>
          </div>
          <button onClick={() => navigate('/profil')} style={S.userBadge}>🔔 &nbsp; 👤 {user?.nama || 'User'}</button>
        </header>

        <div style={S.content}>
          {/* Filter */}
          <div style={S.filterRow}>
            <div style={S.filterGroup}>
              <label style={S.filterLabel}>Nama Balita</label>
              <div style={S.searchBox}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ..." style={S.searchInput} />
                <span style={S.searchIcon}>🔍</span>
              </div>
            </div>
            <div style={S.filterGroup}>
              <label style={S.filterLabel}>Periode</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={bulan} onChange={e => setBulan(Number(e.target.value))} style={S.select}>
                  {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
                <select value={tahun} onChange={e => setTahun(Number(e.target.value))} style={S.select}>
                  {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <button onClick={() => navigate('/rekap-penimbangan/tambah')} style={S.addBtn}>
              + &nbsp; Catat Rekap Penimbangan
            </button>
          </div>

          {error && <div style={S.errorBox}>{error}</div>}

          {/* Tabel */}
          <div style={S.tableCard}>
            <table style={S.table}>
              <thead>
                <tr style={S.theadRow}>
                  <th style={S.th}>Nama Balita</th>
                  <th style={S.th}>Usia</th>
                  <th style={S.th}>Berat Badan (Kg)</th>
                  <th style={S.th}>Tinggi Badan (Cm)</th>
                  <th style={S.th}>Tanggal</th>
                  <th style={S.th}>Status Gizi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={S.emptyCell}>Memuat data...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={S.emptyCell}>Belum ada data penimbangan untuk periode ini.</td></tr>
                ) : filtered.map((item, i) => {
                  const st = getStatusGiziDisplay(item)
                  return (
                    <tr key={item.id || i} style={S.tr} onClick={() => navigate(`/rekap-penimbangan/${item.id}`)} title="Klik untuk detail">
                      <td style={{ ...S.td, fontWeight: 600, color: '#4F724D', cursor: 'pointer' }}>{item.nama || '-'}</td>
                      <td style={S.td}>{formatUsia(item.tanggal_lahir)}</td>
                      <td style={S.td}>{item.berat_badan ? Number(item.berat_badan).toFixed(1) : '-'}</td>
                      <td style={S.td}>{item.tinggi_badan ? Number(item.tinggi_badan).toFixed(1) : '-'}</td>
                      <td style={S.td}>{formatTanggal(item.tanggal_ukur)}</td>
                      <td style={S.td}>
                        {item.tanggal_ukur ? (
                          <span style={{ ...S.badge, background: st.bg, color: st.color }}>{st.label}</span>
                        ) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Buat Laporan */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button onClick={() => navigate(`/laporan-puskesmas/buat?bulan=${bulan}&tahun=${tahun}`)} style={S.laporanBtn}>
              + &nbsp; Buat Laporan
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', display: 'flex', background: '#4F724D', fontFamily },
  sidebar: { width: 240, minHeight: '100vh', background: '#EAF0EF', borderRight: '1px solid rgba(0,0,0,0.05)', padding: '22px 14px 20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  brand: { border: 'none', background: 'transparent', color: '#3D6B43', fontSize: 24, fontWeight: 700, textAlign: 'left', cursor: 'pointer', padding: '0 6px', marginBottom: 28, fontFamily },
  nav: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  navLink: { minHeight: 42, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', borderRadius: 10, color: '#355C3C', textDecoration: 'none', fontSize: 14, fontWeight: 500, fontFamily },
  navLinkActive: { background: '#CDEBCD', color: '#275031', fontWeight: 700 },
  navIcon: { width: 20, display: 'inline-flex', justifyContent: 'center', flexShrink: 0 },
  logoutBtn: { minHeight: 42, borderRadius: 10, border: '1px solid rgba(61,107,67,0.25)', background: 'transparent', color: '#355C3C', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily },
  main: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' },
  header: { padding: '28px 34px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: '#fff', fontFamily },
  subtitle: { margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily },
  userBadge: { border: 'none', background: '#F7E5D8', color: '#6C5145', minHeight: 34, padding: '0 16px', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily },
  content: { background: '#FDF5F0', margin: '0 24px 24px', borderRadius: 18, padding: '24px 28px', flex: 1 },
  filterRow: { display: 'flex', alignItems: 'flex-end', gap: 18, marginBottom: 20, flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  filterLabel: { fontSize: 13, fontWeight: 700, color: '#5A4035', fontFamily },
  searchBox: { display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #D9C4BA', borderRadius: 10, padding: '0 12px', height: 40, gap: 8, minWidth: 220 },
  searchInput: { border: 'none', outline: 'none', fontSize: 14, color: '#5A4035', background: 'transparent', flex: 1, fontFamily },
  searchIcon: { fontSize: 16, color: '#9E7A6A' },
  select: { height: 40, border: '1.5px solid #D9C4BA', borderRadius: 10, padding: '0 12px', fontSize: 14, color: '#5A4035', background: '#fff', fontFamily, cursor: 'pointer' },
  addBtn: { height: 40, background: '#4F724D', color: '#fff', border: 'none', borderRadius: 10, padding: '0 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily, whiteSpace: 'nowrap' },
  errorBox: { background: '#FEE2E2', color: '#991B1B', padding: 12, borderRadius: 10, marginBottom: 14, fontSize: 14 },
  tableCard: { background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #EDD8D0' },
  table: { width: '100%', borderCollapse: 'collapse', fontFamily },
  theadRow: { background: '#F9F0EB' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#5A4035', borderBottom: '2px solid #EDD8D0' },
  tr: { transition: 'background 0.15s', cursor: 'pointer' },
  td: { padding: '13px 16px', fontSize: 14, color: '#5A4035', borderBottom: '1px solid #F3E6E0', verticalAlign: 'middle' },
  emptyCell: { padding: 28, textAlign: 'center', color: '#9E7A6A', fontSize: 14 },
  badge: { display: 'inline-flex', alignItems: 'center', padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 },
  laporanBtn: { height: 40, background: '#4F724D', color: '#fff', border: 'none', borderRadius: 10, padding: '0 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily },
}
