import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import API from '../api'

const fontFamily = '"Segoe UI", Arial, Helvetica, sans-serif'
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const POSYANDU_LIST = ['Posyandu Ceria','Posyandu Mawar','Posyandu Melati','Posyandu Anggrek','Posyandu Kenanga']

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
  if (th <= 0) return `${bln} bln`
  if (bln === 0) return `${th} th`
  return `${th} th ${bln} bln`
}

const statusGiziLabel = (v, stunting) => {
  if (stunting === 'Ya' || stunting === true || stunting === 1) return 'Stunting'
  const map = { gizi_buruk: 'Gizi Buruk', gizi_kurang: 'Gizi Kurang', gizi_baik: 'Normal', gizi_lebih: 'Gizi Lebih', obesitas: 'Obesitas' }
  return map[v] || v || 'Normal'
}

const statusGiziBadge = (v, stunting) => {
  if (stunting === 'Ya' || stunting === true || stunting === 1) return { bg: '#FEE2E2', color: '#991B1B' }
  const s = (v || '').toLowerCase()
  if (s === 'gizi_baik') return { bg: '#D1FAE5', color: '#065F46' }
  if (s === 'gizi_kurang') return { bg: '#FEF3C7', color: '#92400E' }
  if (s === 'gizi_buruk') return { bg: '#FEE2E2', color: '#991B1B' }
  if (s === 'gizi_lebih' || s === 'obesitas') return { bg: '#FFEDD5', color: '#9A3412' }
  return { bg: '#D1FAE5', color: '#065F46' }
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

export default function LaporanPuskesmas() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} } }, [])

  // Parse query params
  const params = new URLSearchParams(location.search)
  const now = new Date()
  const initBulan = Number(params.get('bulan')) || (now.getMonth() + 1)
  const initTahun = Number(params.get('tahun')) || now.getFullYear()

  const [bulan, setBulan] = useState(initBulan)
  const [tahun, setTahun] = useState(initTahun)
  const [posyandu, setPosyandu] = useState(POSYANDU_LIST[0])
  const [judulLaporan, setJudulLaporan] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    setJudulLaporan(`Laporan Hasil Penimbangan Balita Periode ${MONTHS[bulan-1]} ${tahun}`)
    loadData()
  }, [bulan, tahun])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await API.get(`/dashboard/rekap-penimbangan?bulan=${bulan}&tahun=${tahun}`)
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
      // Hanya tampilkan yang punya data penimbangan
      setData(list.filter(d => d.tanggal_ukur))
    } catch { setData([]) }
    finally { setLoading(false) }
  }

  const handleKirim = async () => {
    setSending(true)
    // Simpan laporan ke localStorage
    try {
      const laporanKey = 'daftar_laporan_puskesmas'
      const existing = JSON.parse(localStorage.getItem(laporanKey) || '[]')
      const newLaporan = {
        id: Date.now(),
        judul: judulLaporan,
        posyandu,
        periode: MONTHS[bulan - 1] + ' ' + tahun,
        bulan, tahun,
        tanggal_dibuat: new Date().toISOString().slice(0, 10),
        data: data,
        status: 'terkirim',
      }
      localStorage.setItem(laporanKey, JSON.stringify([newLaporan, ...existing]))
      setTimeout(() => {
        setSending(false)
        setShowSuccessModal(true)
      }, 1200)
    } catch {
      setSending(false)
      alert('Gagal mengirim laporan.')
    }
  }

  const handleUnduhPDF = () => {
    // Trigger browser print
    window.print()
  }

  const handleCetak = () => {
    window.print()
  }

  return (
    <div style={S.page}>
      <Sidebar />
      <main style={S.main}>
        <header style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => navigate('/rekap-penimbangan')} style={S.backBtn}>←</button>
            <div>
              <h1 style={S.title}>Laporan Puskesmas</h1>
              <p style={S.subtitle}>Buat dan unduh laporan hasil penimbangan balita</p>
            </div>
          </div>
          <button onClick={() => navigate('/profil')} style={S.userBadge}>🔔 &nbsp; 👤 {user?.nama || 'User'}</button>
        </header>

        <div style={S.content}>
          {/* Filter */}
          <div style={S.filterSection}>
            <div style={S.filterRow}>
              <div style={S.filterGroup}>
                <label style={S.filterLabel}>Periode Laporan</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={S.selectWrapper}>
                    <span style={S.selectIcon}>📅</span>
                    <select value={bulan} onChange={e => setBulan(Number(e.target.value))} style={S.select}>
                      {MONTHS.map((m, i) => <option key={i} value={i+1}>{m} {tahun}</option>)}
                    </select>
                  </div>
                  <div style={S.selectWrapper}>
                    <span style={S.selectIcon}>📍</span>
                    <select value={posyandu} onChange={e => setPosyandu(e.target.value)} style={S.select}>
                      {POSYANDU_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div style={S.judulRow}>
              <label style={S.filterLabel}>Judul Laporan</label>
              <input
                value={judulLaporan}
                onChange={e => setJudulLaporan(e.target.value)}
                style={S.judulInput}
              />
            </div>
          </div>

          {/* Preview Laporan */}
          <div style={S.previewSection}>
            <label style={S.filterLabel}>Preview Laporan</label>
            <div style={S.previewCard} id="laporan-preview">
              <div style={S.previewHeader}>
                <h2 style={S.previewTitle}>LAPORAN HASIL PENIMBANGAN BALITA</h2>
                <p style={S.previewPeriode}>Periode Laporan: {MONTHS[bulan-1]} {tahun}</p>
              </div>
              <div style={{ padding: '0 20px 20px' }}>
                <p style={S.previewSectionLabel}>Rincian Hasil Pemeriksaan</p>
                <table style={S.previewTable}>
                  <thead>
                    <tr>
                      {['Nama Balita','Usia','Berat Badan (Kg)','Tinggi Badan (Cm)','Tanggal','Status Gizi'].map(h => (
                        <th key={h} style={S.previewTh}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} style={S.previewTd}>Memuat...</td></tr>
                    ) : data.length === 0 ? (
                      <tr><td colSpan={6} style={S.previewTd}>Tidak ada data untuk periode ini.</td></tr>
                    ) : data.map((item, i) => {
                      const bd = statusGiziBadge(item.status_gizi, item.is_stunting || item.stunting)
                      const lbl = statusGiziLabel(item.status_gizi, item.is_stunting || item.stunting)
                      const isHighlight = lbl !== 'Normal'
                      return (
                        <tr key={item.id || i} style={{ background: isHighlight ? '#FFF8F0' : '#fff', border: isHighlight ? '2px solid #E8A870' : 'none' }}>
                          <td style={S.previewTd}>{item.nama}</td>
                          <td style={S.previewTd}>{formatUsia(item.tanggal_lahir)}</td>
                          <td style={S.previewTd}>{item.berat_badan ? Number(item.berat_badan).toFixed(1) : '-'}</td>
                          <td style={S.previewTd}>{item.tinggi_badan ? Number(item.tinggi_badan).toFixed(1) : '-'}</td>
                          <td style={S.previewTd}>{formatTanggal(item.tanggal_ukur)}</td>
                          <td style={S.previewTd}>
                            <span style={{ ...S.badge, background: bd.bg, color: bd.color }}>{lbl}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div style={{ textAlign: 'right', marginTop: 30, marginRight: 20 }}>
                  <p style={{ fontSize: 13, color: '#5A4035', fontWeight: 700 }}>TTD</p>
                  <div style={{ height: 50 }} />
                  <div style={{ borderTop: '1px solid #5A4035', width: 150, marginLeft: 'auto', paddingTop: 4 }}>
                    <p style={{ fontSize: 12, color: '#5A4035', margin: 0 }}>Petugas Posyandu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={S.actionRow}>
            <button onClick={handleUnduhPDF} style={S.unduhBtn}>⬇️ &nbsp; Unduh PDF</button>
            <button onClick={handleCetak} style={S.cetakBtn}>🖨️ &nbsp; Cetak Laporan</button>
            <button onClick={handleKirim} disabled={sending} style={S.kirimBtn}>
              {sending ? '⏳ Mengirim...' : '📤 Kirim ke Puskesmas'}
            </button>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={S.modalOverlay}>
          <div style={S.modalBox}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h3 style={S.modalTitle}>Laporan Berhasil Dikirim!</h3>
            <p style={S.modalText}>
              Laporan <strong>{judulLaporan}</strong> telah berhasil dikirim ke puskesmas.
            </p>
            <button
              onClick={() => { setShowSuccessModal(false); navigate('/laporan-puskesmas/daftar') }}
              style={S.modalBtn}
            >
              Lihat Daftar Laporan
            </button>
          </div>
        </div>
      )}
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
  filterSection: { marginBottom: 22, background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid #EDD8D0' },
  filterRow: { marginBottom: 16 },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  filterLabel: { fontSize: 13, fontWeight: 700, color: '#5A4035', fontFamily, display: 'block', marginBottom: 4 },
  selectWrapper: { display: 'flex', alignItems: 'center', background: '#F9F0EB', border: '1.5px solid #D9C4BA', borderRadius: 10, padding: '0 12px', height: 42, gap: 8 },
  selectIcon: { fontSize: 15 },
  select: { border: 'none', outline: 'none', fontSize: 14, color: '#5A4035', background: 'transparent', fontFamily, cursor: 'pointer', minWidth: 140 },
  judulRow: {},
  judulInput: { width: '100%', height: 44, border: '1.5px solid #D9C4BA', borderRadius: 10, padding: '0 16px', fontSize: 14, color: '#5A4035', background: '#F9F0EB', fontFamily, boxSizing: 'border-box', outline: 'none' },
  previewSection: { marginBottom: 22 },
  previewCard: { background: '#fff', border: '1.5px solid #D9C4BA', borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  previewHeader: { textAlign: 'center', padding: '24px 20px 12px', borderBottom: '1px solid #EDD8D0' },
  previewTitle: { margin: 0, fontSize: 16, fontWeight: 800, color: '#3A2A25', letterSpacing: 0.5, fontFamily },
  previewPeriode: { margin: '6px 0 0', fontSize: 13, color: '#7A5A50', fontFamily },
  previewSectionLabel: { fontSize: 13, fontWeight: 700, color: '#5A4035', margin: '16px 0 10px', fontFamily },
  previewTable: { width: '100%', borderCollapse: 'collapse', fontFamily },
  previewTh: { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#5A4035', borderBottom: '2px solid #EDD8D0', background: '#F9F0EB' },
  previewTd: { padding: '10px 12px', fontSize: 13, color: '#5A4035', borderBottom: '1px solid #F3E6E0' },
  badge: { display: 'inline-flex', alignItems: 'center', padding: '3px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700 },
  actionRow: { display: 'flex', gap: 14, justifyContent: 'flex-end', flexWrap: 'wrap' },
  unduhBtn: { height: 42, background: '#fff', color: '#4F724D', border: '2px solid #4F724D', borderRadius: 10, padding: '0 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily },
  cetakBtn: { height: 42, background: '#fff', color: '#5A4035', border: '2px solid #D9C4BA', borderRadius: 10, padding: '0 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily },
  kirimBtn: { height: 42, background: '#4F724D', color: '#fff', border: 'none', borderRadius: 10, padding: '0 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modalBox: { background: '#fff', borderRadius: 20, padding: '40px 48px', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.22)', maxWidth: 420, width: '90%', fontFamily },
  modalTitle: { margin: '0 0 12px', fontSize: 22, fontWeight: 800, color: '#2D6B43', fontFamily },
  modalText: { margin: '0 0 28px', fontSize: 14, color: '#5A4035', lineHeight: 1.6, fontFamily },
  modalBtn: { height: 46, background: '#4F724D', color: '#fff', border: 'none', borderRadius: 999, padding: '0 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily },
}
