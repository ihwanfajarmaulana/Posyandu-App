import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import { SharedSidebar, Icon, ProfilePopup } from './SidebarLayout'
import { GreenHeaderDecorations, CreamSectionDecorations } from './Decorations'
import useRefreshOnFocus from '../hooks/useRefreshOnFocus'

/* ──────────────────────────────────────────────────────────────────────────
   PilihBalitaPage — SHARED "Pilih Balita" picker (ortu POV).

   Used by BOTH flows so they share one design:
     • Riwayat Pertumbuhan  → basePath="/tumbuh-kembang"
     • Rekomendasi          → basePath="/rekomendasi"

   It only lists THIS parent's own children (/balita is scoped to the logged-in
   parent). Clicking a row navigates to `${basePath}/${childId}`.
   Matches the Figma "Pilih Balita" table 1:1 (no admin edit/delete column —
   that's a pegawai action, so it's intentionally omitted for parents).
   ────────────────────────────────────────────────────────────────────────── */

const colors = {
  green: '#4E724C',
  cream: '#FFF5F8',
  tan: '#F2DFD1',
  brown: '#655040',
  mutedBrown: '#6A6A6A',
  white: '#FFFFFF',
  blue: '#3287EF',
  pink: '#D65FFA',
  rowLine: 'rgba(147, 115, 92, 0.45)',
  pinkBtn: '#FFA6A7',
  pinkBtnSoft: 'rgba(255, 166, 167, 0.59)',
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
const PAGE_SIZE = 7

/* Demo rows used only when the backend returns nothing — mirrors the Figma table */
const demoRows = [
  { id: 'demo-1', nama: 'Archio Baskara', jenis_kelamin: 'L', usia_bulan: 29, nama_ibu: 'Agatha Theresia', terakhir_diukur: '2026-05-20', tindakan: 'Pengukuran (BB, TB, Lingkar Kepala) dan Imunisasi Polio 3' },
  { id: 'demo-2', nama: 'Elang Araga', jenis_kelamin: 'L', usia_bulan: 32, nama_ibu: 'Valecia Sanjaya', terakhir_diukur: '2026-05-20', tindakan: 'Pengukuran (BB, TB, Lingkar Kepala) dan Imunisasi Campak Rubella' },
  { id: 'demo-3', nama: 'James Zhao', jenis_kelamin: 'L', usia_bulan: 14, nama_ibu: 'Gwenn Priscia', terakhir_diukur: '2026-05-19', tindakan: 'Pengukuran (BB, TB, Lingkar Kepala) dan Imunisasi DPT-HB-Hib 1' },
  { id: 'demo-4', nama: 'Christy Tan', jenis_kelamin: 'P', usia_bulan: 29, nama_ibu: 'Chatherine Tan', terakhir_diukur: '2026-05-19', tindakan: 'Pengukuran (BB, TB, Lingkar Kepala) dan Imunisasi Polio 1' },
  { id: 'demo-5', nama: 'Windy Adyaputri', jenis_kelamin: 'P', usia_bulan: 41, nama_ibu: 'Thania Anastasya', terakhir_diukur: '2026-04-05', tindakan: 'Pengukuran (BB, TB, Lingkar Kepala) dan Imunisasi Booster Tifoid' },
  { id: 'demo-6', nama: 'Sean Jeffrey', jenis_kelamin: 'L', usia_bulan: 37, nama_ibu: 'Kalina Ayara', terakhir_diukur: '2026-05-10', tindakan: 'Pengukuran (BB, TB, Lingkar Kepala) dan Imunisasi Polio 2' },
  { id: 'demo-7', nama: 'Eunia Karlina', jenis_kelamin: 'P', usia_bulan: 39, nama_ibu: 'Oriya Belina', terakhir_diukur: '2026-05-10', tindakan: 'Pengukuran (BB, TB, Lingkar Kepala) dan Imunisasi Booster Tifoid' },
]

function getList(response) {
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  return []
}

function calcUsia(tanggalLahir, fallbackBulan) {
  let bulan = fallbackBulan
  if (tanggalLahir) {
    const lahir = new Date(tanggalLahir)
    const now = new Date()
    bulan = (now.getFullYear() - lahir.getFullYear()) * 12 + (now.getMonth() - lahir.getMonth())
  }
  if (bulan == null || Number.isNaN(bulan)) return '-'
  const tahun = Math.floor(bulan / 12)
  const sisa = bulan % 12
  if (tahun === 0) return sisa + ' Bulan'
  return sisa === 0 ? tahun + ' Tahun' : tahun + ' Tahun ' + sisa + ' Bulan'
}

function ageInMonths(tanggalLahir, fallbackBulan) {
  if (tanggalLahir) {
    const lahir = new Date(tanggalLahir)
    const now = new Date()
    return (now.getFullYear() - lahir.getFullYear()) * 12 + (now.getMonth() - lahir.getMonth())
  }
  return Number(fallbackBulan) || 0
}

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return `${String(d.getDate()).padStart(2, '0')} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
}

function mapRow(child) {
  return {
    id: child.id,
    nama: child.nama || 'Anak',
    jenis_kelamin: child.jenis_kelamin,
    tanggal_lahir: child.tanggal_lahir,
    usia_bulan: child.usia_bulan,
    nama_ibu: child.nama_ibu || child.orang_tua?.nama || '-',
    terakhir_diukur: child.kunjungan_terakhir || child.tanggal_ukur || child.updatedAt || null,
    tindakan: child.tindakan_terakhir || 'Pengukuran (BB, TB, Lingkar Kepala)',
  }
}

/* Build the page-number list with ellipsis, e.g. [1,2,3,'...',7,8] */
function buildPages(current, total) {
  if (total <= 8) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, 2, 3, total - 1, total, current - 1, current, current + 1])
  const arr = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out = []
  let prev = 0
  for (const p of arr) {
    if (p - prev > 1) out.push('...')
    out.push(p)
    prev = p
  }
  return out
}

export default function PilihBalitaPage({
  title = 'Pilih Balita',
  subtitle = 'Cari dan pilih balita untuk melihat riwayat tumbuh kembang balita',
  basePath = '/tumbuh-kembang',
  activePath = '/tumbuh-kembang',
  backTo = '/dashboard',
}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [usiaFilter, setUsiaFilter] = useState('semua')
  const [page, setPage] = useState(1)
  const [showProfile, setShowProfile] = useState(false)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const refresh = useRefreshOnFocus()

  useEffect(() => {
    let cancelled = false
    API.get('/balita', { params: { limit: 100 } })
      .then((res) => {
        if (cancelled) return
        const list = getList(res)
        setRows(list.length ? list.map(mapRow) : demoRows)
      })
      .catch(() => { if (!cancelled) setRows(demoRows) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [refresh])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      const matchSearch = !q
        || r.nama.toLowerCase().includes(q)
        || (r.nama_ibu || '').toLowerCase().includes(q)
      if (!matchSearch) return false
      if (usiaFilter === 'semua') return true
      const bln = ageInMonths(r.tanggal_lahir, r.usia_bulan)
      if (usiaFilter === '0-1') return bln < 12
      if (usiaFilter === '1-3') return bln >= 12 && bln < 36
      if (usiaFilter === '3-5') return bln >= 36 && bln <= 60
      return true
    })
  }, [rows, search, usiaFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const startIdx = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const endIdx = Math.min(safePage * PAGE_SIZE, filtered.length)
  const pages = buildPages(safePage, totalPages)

  return (
    <div style={s.page}>
      <SharedSidebar activePath={activePath} />

      <main style={s.main}>
        {/* GREEN HEADER */}
        <section style={{ ...s.greenSection, position: 'relative', overflow: 'hidden' }}>
          <GreenHeaderDecorations />
          <header style={{ ...s.headerRow, position: 'relative', zIndex: 1 }} className="pc-slide-down">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <button type="button" onClick={() => navigate(backTo)} style={s.backBtn} aria-label="Kembali" className="pc-btn pc-focusable">
                <Icon name="arrow-left" size={20} color={colors.cream} strokeWidth={2.4} />
              </button>
              <div>
                <h1 style={s.headerTitle}>{title}</h1>
                <p style={s.headerSub}>{subtitle}</p>
              </div>
            </div>
            <div style={s.headerRight}>
              <button type="button" onClick={() => navigate('/notifikasi')} style={s.bellBtn} aria-label="Notifikasi" className="pc-btn pc-bell">
                <Icon name="bell" size={20} color={colors.brown} />
              </button>
              <button type="button" onClick={() => setShowProfile(true)} style={{ ...s.userPill, border: 'none', cursor: 'pointer' }} className="pc-btn">
                <div style={s.userAvatar}>{(user.nama || 'U').slice(0, 1).toUpperCase()}</div>
                <span style={s.userName}>{user.nama || 'User'}</span>
              </button>
            </div>
          </header>
        </section>

        {/* CREAM CONTENT */}
        <section style={{ ...s.creamSection, position: 'relative', overflow: 'hidden' }}>
          <CreamSectionDecorations />

          <div style={{ ...s.outerCard, position: 'relative', zIndex: 1 }} className="pc-fade-in">
            {/* Search + filter */}
            <div style={s.controlsRow}>
              <div style={s.searchBox}>
                <SearchIcon />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Cari nama anak / nama ibu / ID anak"
                  style={s.searchInput}
                  className="pc-input"
                />
              </div>
              <div style={s.filterBox}>
                <select value={usiaFilter} onChange={(e) => { setUsiaFilter(e.target.value); setPage(1) }} style={s.filterSelect} aria-label="Filter usia">
                  <option value="semua">Semua Usia</option>
                  <option value="0-1">0 - 1 Tahun</option>
                  <option value="1-3">1 - 3 Tahun</option>
                  <option value="3-5">3 - 5 Tahun</option>
                </select>
                <span style={s.chevron}><ChevronDown /></span>
              </div>
            </div>

            {/* White table card */}
            <div style={s.tableCard}>
              <div style={s.tableHead}>
                <span>Nama Anak</span>
                <span>Usia</span>
                <span>Nama Ibu</span>
                <span>Terakhir Diukur</span>
                <span>Tindakan</span>
              </div>

              {loading ? (
                <div style={s.stateBox}>Memuat data balita...</div>
              ) : pageRows.length === 0 ? (
                <div style={s.stateBox}>
                  {rows.length === 0
                    ? 'Belum ada data anak terdaftar. Hubungi kader posyandu untuk mendaftarkan anak Anda.'
                    : 'Tidak ada anak yang cocok dengan pencarian.'}
                </div>
              ) : (
                pageRows.map((r, i) => {
                  const isLaki = r.jenis_kelamin === 'L'
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => navigate(basePath + '/' + r.id)}
                      style={{ ...s.tableRow, borderTop: i === 0 ? 'none' : '1px solid ' + colors.rowLine }}
                      className="pc-table-row pc-focusable"
                    >
                      <span style={s.cellNama}>
                        <span style={s.rowAvatar}>
                          <Icon name="user" size={24} color={colors.green} strokeWidth={2} />
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span style={s.rowName}>{r.nama}</span>
                          <span style={{ ...s.rowGender, color: isLaki ? colors.blue : colors.pink }}>
                            {isLaki ? '♂ Laki-laki' : '♀ Perempuan'}
                          </span>
                        </span>
                      </span>
                      <span style={s.cell}>{calcUsia(r.tanggal_lahir, r.usia_bulan)}</span>
                      <span style={s.cell}>{r.nama_ibu}</span>
                      <span style={s.cell}>{formatDate(r.terakhir_diukur)}</span>
                      <span style={{ ...s.cell, lineHeight: 1.35 }}>{r.tindakan}</span>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer: count + pagination */}
            <div style={s.footerRow}>
              <span style={s.countText}>Menampilkan {startIdx}-{endIdx} dari {filtered.length} anak</span>
              <div style={s.pagination}>
                <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{ ...s.navBtn, background: safePage <= 1 ? colors.pinkBtnSoft : colors.pinkBtn, cursor: safePage <= 1 ? 'default' : 'pointer' }} className="pc-btn">
                  ‹ Sebelumnya
                </button>
                {pages.map((p, i) => p === '...' ? (
                  <span key={'e' + i} style={s.ellipsis}>...</span>
                ) : (
                  <button key={p} type="button" onClick={() => setPage(p)}
                    style={{ ...s.pageNum, background: p === safePage ? colors.pinkBtn : colors.pinkBtnSoft }} className="pc-btn">
                    {p}
                  </button>
                ))}
                <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={{ ...s.navBtn, background: safePage >= totalPages ? colors.pinkBtnSoft : colors.pinkBtn, cursor: safePage >= totalPages ? 'default' : 'pointer' }} className="pc-btn">
                  Selanjutnya ›
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ProfilePopup open={showProfile} onClose={() => setShowProfile(false)} />

      <style>{`
        .pc-table-row { transition: background 0.15s ease; }
        .pc-table-row:hover { background: #FFF0F5 !important; }
      `}</style>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6A6A6A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, flexShrink: 0 }}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6A6A6A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

const COLS = '1.6fr 1fr 1.1fr 1fr 1.8fr'

const s = {
  page: { display: 'flex', minHeight: '100vh', background: colors.cream, fontFamily: "'Noto Sans', sans-serif" },
  main: { flex: 1, minWidth: 0 },

  greenSection: { background: 'linear-gradient(180deg, #5C8259 0%, #4E724C 45%, #3F633E 100%)', padding: '24px 30px 28px', boxShadow: '0 4px 18px rgba(63,99,62,0.18)' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' },
  backBtn: { width: 38, height: 38, borderRadius: '50%', marginTop: 2, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
  headerTitle: { margin: 0, fontWeight: 800, fontSize: 26, color: colors.cream },
  headerSub: { margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.85)', maxWidth: 480 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  bellBtn: { width: 38, height: 38, borderRadius: '50%', background: colors.tan, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  userPill: { background: colors.tan, borderRadius: 30, padding: '4px 14px 4px 4px', display: 'flex', alignItems: 'center', gap: 8 },
  userAvatar: { width: 30, height: 30, borderRadius: '50%', background: colors.brown, color: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 },
  userName: { fontWeight: 700, fontSize: 13, color: colors.brown },

  creamSection: { background: 'linear-gradient(180deg, #FFF5F8 0%, #FFEBF1 100%)', padding: '26px 30px 40px', minHeight: 'calc(100vh - 120px)' },
  outerCard: { background: colors.cream, borderRadius: 16, padding: '22px 22px 18px', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' },

  controlsRow: { display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' },
  searchBox: { flex: '1 1 380px', display: 'flex', alignItems: 'center', gap: 10, background: colors.tan, borderRadius: 8, padding: '0 14px', height: 40 },
  searchInput: { flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: colors.brown, height: '100%' },
  filterBox: { position: 'relative', flex: '0 0 220px' },
  filterSelect: { width: '100%', height: 40, borderRadius: 8, border: 'none', background: colors.tan, padding: '0 36px 0 14px', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: colors.brown, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' },
  chevron: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' },

  tableCard: { background: colors.white, borderRadius: 10, border: '1px solid rgba(147,115,92,0.22)', overflow: 'hidden' },
  tableHead: { display: 'grid', gridTemplateColumns: COLS, gap: 12, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid ' + colors.rowLine, fontSize: 14, fontWeight: 800, color: colors.brown },
  tableRow: { display: 'grid', gridTemplateColumns: COLS, gap: 12, alignItems: 'center', width: '100%', padding: '12px 20px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif" },
  cellNama: { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 },
  rowAvatar: { width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #DEEED8 0%, #CFEBD2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFFFFF' },
  rowName: { display: 'block', fontSize: 13, fontWeight: 700, color: colors.brown, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowGender: { display: 'block', fontSize: 11.5, fontWeight: 700, marginTop: 2 },
  cell: { fontSize: 12.5, fontWeight: 600, color: colors.brown, minWidth: 0 },

  stateBox: { padding: '34px 24px', textAlign: 'center', color: colors.mutedBrown, fontWeight: 700, fontSize: 13 },

  footerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' },
  countText: { fontSize: 12, fontWeight: 700, color: colors.brown },
  pagination: { display: 'flex', alignItems: 'center', gap: 6 },
  navBtn: { border: 'none', color: colors.white, fontWeight: 700, fontSize: 11, padding: '6px 12px', borderRadius: 6, fontFamily: "'Noto Sans', sans-serif" },
  pageNum: { border: 'none', color: colors.white, fontWeight: 800, fontSize: 12, minWidth: 26, height: 26, padding: '0 6px', borderRadius: 6, fontFamily: "'Noto Sans', sans-serif", cursor: 'pointer' },
  ellipsis: { color: colors.brown, fontWeight: 800, fontSize: 12, padding: '0 2px' },
}
