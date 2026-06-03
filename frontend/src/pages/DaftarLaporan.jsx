import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const fontFamily = '"Segoe UI", Arial, Helvetica, sans-serif'
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const POSYANDU_LIST = ['Semua Posyandu','Posyandu Ceria','Posyandu Mawar','Posyandu Melati','Posyandu Anggrek','Posyandu Kenanga']

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
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).replace(/ /g, ' ')
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

export default function DaftarLaporan() {
  const navigate = useNavigate()
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} } }, [])

  const now = new Date()
  const [filterBulan, setFilterBulan] = useState(now.getMonth() + 1)
  const [filterTahun] = useState(now.getFullYear())
  const [filterPosyandu, setFilterPosyandu] = useState('Semua Posyandu')
  const [laporan, setLaporan] = useState([])
  const [deleteId, setDeleteId] = useState(null)
  const [viewItem, setViewItem] = useState(null)

  useEffect(() => { loadLaporan() }, [])

  const loadLaporan = () => {
    try {
      const data = JSON.parse(localStorage.getItem('daftar_laporan_puskesmas') || '[]')
      setLaporan(data)
    } catch { setLaporan([]) }
  }

  const filtered = laporan.filter(l => {
    const bulanMatch = l.bulan === filterBulan
    const posyanduMatch = filterPosyandu === 'Semua Posyandu' || l.posyandu === filterPosyandu
    return bulanMatch && posyanduMatch
  })

  const handleDelete = (id) => {
    const updated = laporan.filter(l => l.id !== id)
    localStorage.setItem('daftar_laporan_puskesmas', JSON.stringify(updated))
    setLaporan(updated)
    setDeleteId(null)
  }

  const handleEdit = (item) => {
    navigate(`/laporan-puskesmas/buat?bulan=${item.bulan}&tahun=${item.tahun}`)
  }

  return (
    <div style={S.page}>
      {/* Embedded <Sidebar/> removed — global AppSidebar from PegawaiShell takes over */}
      <main style={S.main}>
        <header style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => navigate('/rekap-penimbangan')} style={S.backBtn}>←</button>
            <div>
              <h1 style={S.title}>Daftar Laporan</h1>
              <p style={S.subtitle}>Kelola laporan hasil penimbangan balita</p>
            </div>
          </div>
          <button onClick={() => navigate('/profil')} style={S.userBadge}>🔔 &nbsp; 👤 {user?.nama || 'User'}</button>
        </header>

        <div style={S.content}>
          {/* Filter */}
          <div style={S.filterRow}>
            <div style={S.selectWrapper}>
              <span>📅</span>
              <select value={filterBulan} onChange={e => setFilterBulan(Number(e.target.value))} style={S.select}>
                {MONTHS.map((m, i) => <option key={i} value={i+1}>{m} {filterTahun}</option>)}
              </select>
            </div>
            <div style={S.selectWrapper}>
              <span>📍</span>
              <select value={filterPosyandu} onChange={e => setFilterPosyandu(e.target.value)} style={S.select}>
                {POSYANDU_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={S.tableCard}>
            <table style={S.table}>
              <thead>
                <tr style={S.theadRow}>
                  <th style={S.th}>Judul Laporan</th>
                  <th style={S.th}>Posyandu</th>
                  <th style={S.th}>Periode</th>
                  <th style={S.th}>Tanggal Dibuat</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={S.emptyCell}>Belum ada laporan untuk periode ini.</td></tr>
                ) : filtered.map((item) => (
                  <tr key={item.id} style={S.tr}>
                    <td style={{ ...S.td, fontWeight: 600, color: '#3A2A25' }}>{item.judul}</td>
                    <td style={S.td}>{item.posyandu}</td>
                    <td style={S.td}>{item.periode}</td>
                    <td style={S.td}>{formatTanggal(item.tanggal_dibuat)}</td>
                    <td style={{ ...S.td, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button onClick={() => setViewItem(item)} style={S.iconBtn} title="Lihat">👁️</button>
                        <button onClick={() => handleEdit(item)} style={S.iconBtn} title="Edit">✏️</button>
                        <button onClick={() => setDeleteId(item.id)} style={{ ...S.iconBtn, background: '#FEE2E2' }} title="Hapus">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button onClick={() => navigate('/laporan-puskesmas/buat')} style={S.addBtn}>
              + &nbsp; Buat Laporan
            </button>
          </div>
        </div>
      </main>

      {/* Delete Confirm Modal */}
      {deleteId !== null && (
        <div style={S.modalOverlay}>
          <div style={S.modalBox}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🗑️</div>
            <h3 style={S.modalTitle}>Hapus Laporan?</h3>
            <p style={S.modalText}>Laporan ini akan dihapus permanen dan tidak dapat dikembalikan.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={S.cancelBtn}>Batal</button>
              <button onClick={() => handleDelete(deleteId)} style={S.deleteBtn}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div style={S.modalOverlay} onClick={() => setViewItem(null)}>
          <div style={{ ...S.modalBox, maxWidth: 700, maxHeight: '90vh', overflow: 'auto', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#3A2A25', fontFamily }}>{viewItem.judul}</h3>
              <button onClick={() => setViewItem(null)} style={{ border: 'none', background: '#F3DED2', borderRadius: '50%', width: 32, height: 32, fontSize: 18, cursor: 'pointer', color: '#6B5247' }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: '#7A5A50', marginBottom: 16, fontFamily }}>Posyandu: {viewItem.posyandu} • Periode: {viewItem.periode} • Dibuat: {formatTanggal(viewItem.tanggal_dibuat)}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily }}>
              <thead>
                <tr style={{ background: '#F9F0EB' }}>
                  {['Nama Balita','Usia','BB (Kg)','TB (Cm)','Tanggal','Status Gizi'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#5A4035', borderBottom: '2px solid #EDD8D0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(viewItem.data || []).map((row, i) => {
                  const sg = row.status_gizi
                  const stunting = row.is_stunting || row.stunting
                  const lbl = stunting === 'Ya' || stunting === true || stunting === 1 ? 'Stunting' : ({ gizi_buruk: 'Gizi Buruk', gizi_kurang: 'Gizi Kurang', gizi_baik: 'Normal', gizi_lebih: 'Gizi Lebih' }[sg] || sg || '-')
                  const badgeSt = stunting === 'Ya' || stunting === true || stunting === 1
                    ? { bg: '#FEE2E2', color: '#991B1B' }
                    : sg === 'gizi_baik' ? { bg: '#D1FAE5', color: '#065F46' }
                    : sg === 'gizi_kurang' ? { bg: '#FEF3C7', color: '#92400E' }
                    : sg === 'gizi_buruk' ? { bg: '#FEE2E2', color: '#991B1B' }
                    : { bg: '#D1FAE5', color: '#065F46' }
                  return (
                    <tr key={i}>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#5A4035', borderBottom: '1px solid #F3E6E0' }}>{row.nama}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#5A4035', borderBottom: '1px solid #F3E6E0' }}>{row.tanggal_lahir ? (() => { const lahir = new Date(row.tanggal_lahir); const now = new Date(); const bln = (now.getFullYear()-lahir.getFullYear())*12+(now.getMonth()-lahir.getMonth()); const th=Math.floor(bln/12); const b=bln%12; return th<=0?`${b} bln`:b===0?`${th} th`:`${th} th ${b} bln` })() : '-'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#5A4035', borderBottom: '1px solid #F3E6E0' }}>{row.berat_badan ? Number(row.berat_badan).toFixed(1) : '-'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#5A4035', borderBottom: '1px solid #F3E6E0' }}>{row.tinggi_badan ? Number(row.tinggi_badan).toFixed(1) : '-'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#5A4035', borderBottom: '1px solid #F3E6E0' }}>{row.tanggal_ukur ? new Date(row.tanggal_ukur).toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'}) : '-'}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #F3E6E0' }}>
                        <span style={{ display: 'inline-flex', padding: '3px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: badgeSt.bg, color: badgeSt.color }}>{lbl}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
  filterRow: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
  selectWrapper: { display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #D9C4BA', borderRadius: 10, padding: '0 14px', height: 42, gap: 8 },
  select: { border: 'none', outline: 'none', fontSize: 14, color: '#5A4035', background: 'transparent', fontFamily, cursor: 'pointer', minWidth: 140 },
  tableCard: { background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #EDD8D0' },
  table: { width: '100%', borderCollapse: 'collapse', fontFamily },
  theadRow: { background: '#F9F0EB' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#5A4035', borderBottom: '2px solid #EDD8D0' },
  tr: {},
  td: { padding: '13px 16px', fontSize: 13, color: '#5A4035', borderBottom: '1px solid #F3E6E0', verticalAlign: 'middle' },
  emptyCell: { padding: 36, textAlign: 'center', color: '#9E7A6A', fontSize: 14 },
  iconBtn: { width: 34, height: 34, border: 'none', borderRadius: 8, background: '#F0F0F0', fontSize: 16, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  addBtn: { height: 40, background: '#4F724D', color: '#fff', border: 'none', borderRadius: 10, padding: '0 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modalBox: { background: '#fff', borderRadius: 20, padding: '36px 44px', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.22)', maxWidth: 400, width: '90%', fontFamily },
  modalTitle: { margin: '0 0 10px', fontSize: 20, fontWeight: 800, color: '#3A2A25', fontFamily },
  modalText: { margin: '0 0 24px', fontSize: 14, color: '#5A4035', lineHeight: 1.6, fontFamily },
  cancelBtn: { height: 42, minWidth: 100, border: '2px solid #D9C4BA', borderRadius: 999, background: '#fff', color: '#5A4035', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily },
  deleteBtn: { height: 42, minWidth: 120, border: 'none', borderRadius: 999, background: '#C4514D', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily },
}
