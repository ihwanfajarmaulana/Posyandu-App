import { useEffect, useState, useMemo, useRef } from 'react'
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'
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
  { icon: '📋', label: 'Laporan Penimbangan', to: '/rekap-penimbangan' },
  { icon: '👤', label: 'Profil', to: '/profil' },
]

const formatTanggal = (v) => {
  if (!v) return '-'
  const d = new Date(v)
  if (isNaN(d)) return '-'
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

const formatUsia = (tglLahir) => {
  if (!tglLahir) return '-'
  const lahir = new Date(tglLahir)
  const now = new Date()
  const totalBulan = (now.getFullYear() - lahir.getFullYear()) * 12 + (now.getMonth() - lahir.getMonth())
  const th = Math.floor(totalBulan / 12)
  const bln = totalBulan % 12
  if (th <= 0) return `${bln} Bulan`
  if (bln === 0) return `${th} Tahun`
  return `${th} Tahun ${bln} Bulan`
}

const statusGiziLabel = (v, stunting) => {
  if (stunting === 'Ya' || stunting === true || stunting === 1) return 'Stunting'
  const map = { gizi_buruk: 'Gizi Buruk', gizi_kurang: 'Gizi Kurang', gizi_baik: 'Normal', gizi_lebih: 'Gizi Lebih', obesitas: 'Obesitas' }
  return map[v] || v || 'Normal'
}

const statusGiziBadge = (v, stunting) => {
  if (stunting === 'Ya' || stunting === true || stunting === 1)
    return { bg: '#FEE2E2', color: '#991B1B' }
  const s = (v || '').toLowerCase()
  if (s === 'gizi_baik') return { bg: '#D1FAE5', color: '#065F46' }
  if (s === 'gizi_kurang') return { bg: '#FEF3C7', color: '#92400E' }
  if (s === 'gizi_buruk') return { bg: '#FEE2E2', color: '#991B1B' }
  if (s === 'gizi_lebih' || s === 'obesitas') return { bg: '#FFEDD5', color: '#9A3412' }
  return { bg: '#D1FAE5', color: '#065F46' }
}

const jenisKelaminLabel = (v) => v === 'L' ? 'Laki-laki' : v === 'P' ? 'Perempuan' : v || '-'

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

// Mini sparkline chart menggunakan SVG sederhana
function GrafikPertumbuhan({ data, jenis_kelamin }) {
  if (!data || data.length < 2) return <p style={{ color: '#9E7A6A', fontSize: 13, textAlign: 'center' }}>Data tidak cukup untuk menampilkan grafik.</p>

  const sorted = [...data].sort((a, b) => new Date(a.tanggal_ukur) - new Date(b.tanggal_ukur))
  const bbVals = sorted.map(d => Number(d.berat_badan) || 0)
  const tbVals = sorted.map(d => Number(d.tinggi_badan) || 0)
  const labels = sorted.map(d => formatTanggal(d.tanggal_ukur).slice(0, 6))

  const renderLine = (vals, color, title, unit) => {
    const W = 260, H = 120, PAD = 24
    const min = Math.min(...vals) - 1
    const max = Math.max(...vals) + 1
    const xStep = (W - PAD * 2) / (vals.length - 1)
    const toY = v => PAD + (H - PAD * 2) * (1 - (v - min) / (max - min))
    const points = vals.map((v, i) => `${PAD + i * xStep},${toY(v)}`).join(' ')

    return (
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#5A4035' }}>{title}</p>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(p => (
            <line key={p} x1={PAD} y1={PAD + (H - PAD * 2) * p} x2={W - PAD} y2={PAD + (H - PAD * 2) * p}
              stroke="#EDD8D0" strokeWidth="1" strokeDasharray="4,3" />
          ))}
          {/* Line */}
          <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {/* Dots */}
          {vals.map((v, i) => (
            <circle key={i} cx={PAD + i * xStep} cy={toY(v)} r={4} fill={color} stroke="#fff" strokeWidth={1.5} />
          ))}
          {/* Y labels */}
          <text x={PAD - 2} y={PAD + 4} textAnchor="end" fontSize={9} fill="#9E7A6A">{max.toFixed(0)}{unit}</text>
          <text x={PAD - 2} y={H - PAD + 4} textAnchor="end" fontSize={9} fill="#9E7A6A">{min.toFixed(0)}{unit}</text>
        </svg>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      {renderLine(bbVals, '#4F724D', 'Berat Badan per Usia (BB/U)', 'kg')}
      {renderLine(tbVals, '#D97B4A', 'Tinggi Badan per Usia (TB/U)', 'cm')}
    </div>
  )
}

export default function DetailRekapPenimbangan() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} } }, [])

  const [balita, setBalita] = useState(null)
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    setLoading(true); setError('')
    try {
      const [bRes, pRes] = await Promise.all([
        API.get(`/balita/${id}`),
        API.get(`/balita/${id}/pertumbuhan`),
      ])
      const b = bRes.data?.data || bRes.data
      setBalita(b)
      const pList = Array.isArray(pRes.data?.data) ? pRes.data.data : Array.isArray(pRes.data) ? pRes.data : []
      setRiwayat(pList.sort((a, b) => new Date(b.tanggal_ukur) - new Date(a.tanggal_ukur)))
    } catch (e) {
      setError('Gagal memuat data.')
    } finally { setLoading(false) }
  }

  const latestData = riwayat[0] || null
  const latestStatus = latestData ? statusGiziLabel(latestData.status_gizi, latestData.is_stunting || latestData.stunting) : '-'
  const latestBadge = latestData ? statusGiziBadge(latestData.status_gizi, latestData.is_stunting || latestData.stunting) : { bg: '#F3F3F3', color: '#888' }

  const handleCetakData = () => navigate(`/laporan-puskesmas/buat?balita_id=${id}`)

  return (
    <div style={S.page}>
      {/* Embedded <Sidebar/> removed — global AppSidebar from PegawaiShell takes over */}
      <main style={S.main}>
        <header style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => navigate('/rekap-penimbangan')} style={S.backBtn}>←</button>
            <div>
              <h1 style={S.title}>Detail Rekap Penimbangan</h1>
              <p style={S.subtitle}>Detail rekap penimbangan {balita?.nama || ''}</p>
            </div>
          </div>
          <button onClick={() => navigate('/profil')} style={S.userBadge}>🔔 &nbsp; 👤 {user?.nama || 'User'}</button>
        </header>

        <div style={S.content}>
          {error && <div style={S.errorBox}>{error}</div>}
          {loading ? <p style={{ color: '#9E7A6A', textAlign: 'center', padding: 40 }}>Memuat data...</p> : (
            <>
              {/* Profile Card */}
              <div style={S.profileCard}>
                <div style={S.avatarCircle}>{balita?.jenis_kelamin === 'P' ? '👧' : '👦'}</div>
                <div style={S.profileInfo}>
                  <h2 style={S.profileName}>{balita?.nama || '-'}</h2>
                  <span style={S.genderBadge}>{jenisKelaminLabel(balita?.jenis_kelamin)}</span>
                  <span style={S.agePill}>{formatUsia(balita?.tanggal_lahir)}</span>
                  <div style={S.profileMeta}>
                    <MetaRow icon="📅" label="Tanggal Lahir" value={formatTanggal(balita?.tanggal_lahir)} />
                    <MetaRow icon="🪪" label="ID Anak" value={balita?.nik || `AN-${String(balita?.id || '').padStart(5, '0')}`} />
                    <MetaRow icon="👩" label="Nama Ibu" value={balita?.nama_ibu || '-'} />
                    <MetaRow icon="📍" label="Posyandu" value="Posyandu Ceria" />
                    <MetaRow icon="📅" label="Kunjungan Terakhir" value={formatTanggal(latestData?.tanggal_ukur)} />
                  </div>
                </div>
                <div style={S.statusBox}>
                  <p style={S.statusTitle}>Status Gizi Terakhir</p>
                  <div style={{ ...S.statusBadgeLarge, background: latestBadge.bg, color: latestBadge.color }}>
                    ✅ {latestStatus}
                  </div>
                  <p style={S.statusSub}>Berdasarkan pengukuran<br />{formatTanggal(latestData?.tanggal_ukur)}</p>
                </div>
              </div>

              {/* Riwayat Pemeriksaan */}
              <section style={S.section}>
                <h3 style={S.sectionTitle}>Riwayat Pemeriksaan</h3>
                <div style={S.tableCard}>
                  <table style={S.table}>
                    <thead>
                      <tr style={S.theadRow}>
                        <th style={S.th}>Tanggal</th>
                        <th style={S.th}>Usia</th>
                        <th style={S.th}>Berat Badan (Kg)</th>
                        <th style={S.th}>Tinggi Badan (Cm)</th>
                        <th style={S.th}>Status Gizi</th>
                        <th style={S.th}>Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riwayat.length === 0 ? (
                        <tr><td colSpan={6} style={S.emptyCell}>Belum ada riwayat pemeriksaan.</td></tr>
                      ) : riwayat.map((item, i) => {
                        const badge = statusGiziBadge(item.status_gizi, item.is_stunting || item.stunting)
                        const lbl = statusGiziLabel(item.status_gizi, item.is_stunting || item.stunting)
                        return (
                          <tr key={item.id || i}>
                            <td style={S.td}>{formatTanggal(item.tanggal_ukur)}</td>
                            <td style={S.td}>{formatUsia(balita?.tanggal_lahir)}</td>
                            <td style={S.td}>{item.berat_badan ? Number(item.berat_badan).toFixed(1) : '-'}</td>
                            <td style={S.td}>{item.tinggi_badan ? Number(item.tinggi_badan).toFixed(1) : '-'}</td>
                            <td style={S.td}>
                              <span style={{ ...S.badge, background: badge.bg, color: badge.color }}>{lbl}</span>
                            </td>
                            <td style={S.td}>
                              <span style={S.catatanIcon} title={item.catatan || 'Tidak ada catatan'}>📋</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Grafik Pertumbuhan */}
              <section style={S.section}>
                <h3 style={S.sectionTitle}>Grafik Pertumbuhan</h3>
                <div style={S.grafikCard}>
                  <GrafikPertumbuhan data={riwayat} jenis_kelamin={balita?.jenis_kelamin} />
                </div>
              </section>

              {/* Catatan Terakhir */}
              {latestData?.catatan && (
                <section style={S.section}>
                  <h3 style={S.sectionTitle}>Catatan Pemeriksaan Terakhir</h3>
                  <div style={S.catatanCard}>
                    <span style={{ fontSize: 28 }}>📋</span>
                    <p style={S.catatanText}>{latestData.catatan}</p>
                  </div>
                </section>
              )}

              {/* Footer Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button onClick={handleCetakData} style={S.cetakBtn}>🖨️ &nbsp; Cetak Data</button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function MetaRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 13, color: '#7A5A50', minWidth: 120 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#4A3530' }}>{value}</span>
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
  backBtn: { border: 'none', background: 'transparent', color: '#fff', fontSize: 32, cursor: 'pointer', padding: 0, lineHeight: 1 },
  title: { margin: 0, fontSize: 26, fontWeight: 700, color: '#fff', fontFamily },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily },
  userBadge: { border: 'none', background: '#F7E5D8', color: '#6C5145', minHeight: 34, padding: '0 16px', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily },
  content: { background: '#FDF5F0', margin: '0 24px 24px', borderRadius: 18, padding: '24px 28px', flex: 1 },
  errorBox: { background: '#FEE2E2', color: '#991B1B', padding: 12, borderRadius: 10, marginBottom: 14, fontSize: 14 },
  profileCard: { display: 'flex', gap: 24, background: '#fff', borderRadius: 16, padding: '22px 26px', border: '1px solid #EDD8D0', marginBottom: 24, alignItems: 'flex-start', flexWrap: 'wrap' },
  avatarCircle: { width: 90, height: 90, borderRadius: '50%', background: '#EAF0EF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, flexShrink: 0, border: '3px solid #4F724D' },
  profileInfo: { flex: 1, minWidth: 220 },
  profileName: { margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#3A2A25', fontFamily },
  genderBadge: { display: 'inline-block', background: '#FDE0DF', color: '#B91C1C', borderRadius: 999, padding: '3px 12px', fontSize: 12, fontWeight: 700, marginRight: 8 },
  agePill: { display: 'inline-block', background: '#EAF0EF', color: '#3D6B43', borderRadius: 999, padding: '3px 12px', fontSize: 12, fontWeight: 700 },
  profileMeta: { marginTop: 14 },
  statusBox: { background: '#EAF4EA', border: '1px solid #B2D8B2', borderRadius: 14, padding: '16px 22px', minWidth: 190, textAlign: 'center', flexShrink: 0 },
  statusTitle: { margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#3D6B43' },
  statusBadgeLarge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 10, fontSize: 16, fontWeight: 800, marginBottom: 10 },
  statusSub: { margin: 0, fontSize: 12, color: '#5A7A5A', lineHeight: 1.5 },
  section: { marginBottom: 28 },
  sectionTitle: { margin: '0 0 14px', fontSize: 18, fontWeight: 700, color: '#3A2A25', fontFamily },
  tableCard: { background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #EDD8D0' },
  table: { width: '100%', borderCollapse: 'collapse', fontFamily },
  theadRow: { background: '#F9F0EB' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#5A4035', borderBottom: '2px solid #EDD8D0' },
  td: { padding: '12px 16px', fontSize: 13, color: '#5A4035', borderBottom: '1px solid #F3E6E0', verticalAlign: 'middle' },
  emptyCell: { padding: 28, textAlign: 'center', color: '#9E7A6A', fontSize: 14 },
  badge: { display: 'inline-flex', alignItems: 'center', padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 },
  catatanIcon: { fontSize: 20, cursor: 'pointer' },
  grafikCard: { background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #EDD8D0' },
  catatanCard: { background: '#FFFBF0', border: '1px solid #F0D890', borderRadius: 14, padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'flex-start' },
  catatanText: { margin: 0, fontSize: 14, color: '#5A4035', lineHeight: 1.7 },
  cetakBtn: { height: 42, background: '#4F724D', color: '#fff', border: 'none', borderRadius: 10, padding: '0 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily },
}
