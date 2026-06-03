import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../api'
import { SharedSidebar, Icon, ProfilePopup } from '../components/SidebarLayout'
import { GreenHeaderDecorations, CreamSectionDecorations } from '../components/Decorations'
import useRefreshOnFocus from '../hooks/useRefreshOnFocus'

/* ──────────────────────────────────────────────────────────────────────────
   RIWAYAT PERTUMBUHAN — one child's growth history (ortu / read-only view).

   Matches the Figma "Riwayat Pertumbuhan" design:
     green header + Data Anak card + Status Gizi card
     → 3 WHO growth charts
     → Tentang Grafik + Z-Score legend
     → Riwayat Pengukuran table
   Opened from the Pilih Balita page as /tumbuh-kembang/:id.
   ────────────────────────────────────────────────────────────────────────── */

const colors = {
  green: '#4E724C',
  greenDark: '#3F633E',
  greenSoft: '#CFEBD2',
  cream: '#FFF5F8',
  tan: '#F2DFD1',
  brown: '#655040',
  mutedBrown: '#6A6A6A',
  white: '#FFFFFF',
  blue: '#3287EF',
  pink: '#D65FFA',
  red: '#E63946',
  redSoft: '#FFD4D4',
  statusBg: '#CEFCBD',
  tableHeadBlue: '#E4ECF8',
  tentangPink: '#F2D1D1',
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

/* ─── Demo data (used when backend has nothing, e.g. demo-* ids) ─── */
const demoChildren = {
  'demo-1': { id: 'demo-1', nama: 'Ellea Araga', jenis_kelamin: 'P', tanggal_lahir: '2021-02-02', nik: 'AN-10240', nama_ibu: 'Valecia Sanjaya' },
  'demo-2': { id: 'demo-2', nama: 'Elang Araga', jenis_kelamin: 'L', tanggal_lahir: '2023-10-02', nik: 'AN-10339', nama_ibu: 'Valecia Sanjaya' },
}
const demoHistory = [
  { id: 'h1', tanggal_ukur: '2026-07-05', berat_badan: 12.5, tinggi_badan: 88.0, status_gizi: 'gizi_baik', z_score_bb: -0.5, z_score_tb: 0, z_score_bb_tb: 0.3 },
  { id: 'h2', tanggal_ukur: '2026-05-20', berat_badan: 11.8, tinggi_badan: 85.0, status_gizi: 'gizi_baik', z_score_bb: -0.2, z_score_tb: -0.7, z_score_bb_tb: 0 },
  { id: 'h3', tanggal_ukur: '2026-03-15', berat_badan: 11.2, tinggi_badan: 82.0, status_gizi: 'gizi_baik', z_score_bb: -0.4, z_score_tb: -0.9, z_score_bb_tb: 0.1 },
  { id: 'h4', tanggal_ukur: '2026-01-10', berat_badan: 10.4, tinggi_badan: 79.0, status_gizi: 'gizi_baik', z_score_bb: -0.3, z_score_tb: -1.0, z_score_bb_tb: 0 },
  { id: 'h5', tanggal_ukur: '2025-11-12', berat_badan: 9.5, tinggi_badan: 76.0, status_gizi: 'gizi_baik', z_score_bb: -0.5, z_score_tb: -1.1, z_score_bb_tb: -0.1 },
]

/* ─── Helpers ─── */
function getList(r) {
  if (Array.isArray(r?.data)) return r.data
  if (Array.isArray(r?.data?.data)) return r.data.data
  return []
}
function getData(r) { return r?.data?.data || r?.data || null }

function calcUsia(tanggalLahir) {
  if (!tanggalLahir) return '-'
  const lahir = new Date(tanggalLahir)
  const now = new Date()
  const bulan = (now.getFullYear() - lahir.getFullYear()) * 12 + (now.getMonth() - lahir.getMonth())
  const tahun = Math.floor(bulan / 12)
  const sisa = bulan % 12
  if (tahun === 0) return sisa + ' Bulan'
  return sisa === 0 ? tahun + ' Tahun' : tahun + ' Tahun ' + sisa + ' Bulan'
}
function usiaSingkat(tanggalLahir, tanggalUkur) {
  if (!tanggalLahir) return '-'
  const lahir = new Date(tanggalLahir)
  const ref = tanggalUkur ? new Date(tanggalUkur) : new Date()
  const bulan = (ref.getFullYear() - lahir.getFullYear()) * 12 + (ref.getMonth() - lahir.getMonth())
  const tahun = Math.floor(bulan / 12)
  const sisa = bulan % 12
  return tahun + ' th ' + sisa + ' bln'
}
function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return `${String(d.getDate()).padStart(2, '0')} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
}
function formatDecimal(value) {
  if (value === null || value === undefined || value === '') return '-'
  const n = Number(value)
  if (Number.isNaN(n)) return value
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(n)
}
function mapStatusGizi(st) {
  const map = { gizi_baik: 'Normal', gizi_kurang: 'Gizi Kurang', gizi_lebih: 'Gizi Lebih', gizi_buruk: 'Gizi Buruk', obesitas: 'Obesitas', stunting: 'Stunting' }
  return map[(st || '').toLowerCase()] || 'Normal'
}
function isBadStatus(st) {
  return ['stunting', 'gizi_buruk', 'gizi_kurang'].includes((st || '').toLowerCase())
}
/* Z-score → label + "-0,5 (Normal)" style string */
function zLabel(z) {
  if (z == null || z === '') return '-'
  const n = Number(z)
  if (Number.isNaN(n)) return '-'
  let label = 'Normal'
  if (n < -3) label = 'Stunting'
  else if (n < -2) label = 'Risiko'
  const txt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(n)
  return `${txt} (${label})`
}

export default function TumbuhKembang() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [child, setChild] = useState(null)
  const [history, setHistory] = useState([])
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const refresh = useRefreshOnFocus()

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function load() {
      if (!id) { navigate('/tumbuh-kembang'); return }

      // Demo path (no backend)
      if (String(id).startsWith('demo-')) {
        if (!cancelled) {
          setChild(demoChildren[id] || demoChildren['demo-2'])
          setHistory(demoHistory)
          setLatest(demoHistory[0])
          setLoading(false)
        }
        return
      }

      try {
        const [childRes, histRes, ringkasanRes] = await Promise.all([
          API.get('/balita/' + id),
          API.get('/balita/' + id + '/pertumbuhan').catch(() => ({ data: { data: [] } })),
          API.get('/balita/' + id + '/ringkasan').catch(() => ({ data: { data: {} } })),
        ])
        if (cancelled) return
        setChild(getData(childRes))
        const hist = getList(histRes)
        setHistory(hist)
        const ringkasan = getData(ringkasanRes) || {}
        const sorted = [...hist].sort((a, b) => new Date(b.tanggal_ukur || 0) - new Date(a.tanggal_ukur || 0))
        setLatest(ringkasan.pertumbuhan_terakhir || sorted[0] || null)
      } catch {
        if (!cancelled) navigate('/tumbuh-kembang')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id, navigate, refresh])

  // Newest-first for the table
  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(b.tanggal_ukur || 0) - new Date(a.tanggal_ukur || 0)),
    [history]
  )
  // Oldest-first for the charts (so the line reads left→right over time)
  const chartHistory = useMemo(() => [...sortedHistory].reverse(), [sortedHistory])

  const isLaki = child?.jenis_kelamin === 'L'
  const statusGizi = latest?.status_gizi
  const bad = isBadStatus(statusGizi)

  return (
    <div style={s.page}>
      <SharedSidebar activePath="/tumbuh-kembang" />

      <main style={s.main}>
        {/* GREEN SECTION: header + Data Anak (one continuous gradient, no seam) */}
        <section style={{ ...s.greenSection, position: 'relative', overflow: 'hidden' }}>
          <GreenHeaderDecorations />
          <header style={{ ...s.headerRow, position: 'relative', zIndex: 1 }} className="pc-slide-down">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="button" onClick={() => navigate('/tumbuh-kembang')} style={s.backBtn} aria-label="Kembali ke pilih balita" className="pc-btn pc-focusable">
                <Icon name="arrow-left" size={20} color={colors.cream} strokeWidth={2.4} />
              </button>
              <h1 style={s.headerTitle}>Riwayat Pertumbuhan</h1>
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

          <h2 style={{ ...s.sectionTitleWhite, position: 'relative', zIndex: 1 }}>Data Anak</h2>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {loading ? (
              <div style={s.stateBox}>Memuat data anak...</div>
            ) : !child ? (
              <div style={s.stateBox}>Data anak tidak ditemukan.</div>
            ) : (
              <div style={s.dataAnakCard} className="pc-scale-in">
                <div style={s.dataAnakLeft}>
                  <div style={s.childPhoto}>
                    <Icon name="user" size={64} color={colors.green} />
                  </div>
                  <div style={s.childInfo}>
                    <h3 style={s.childName}>{child.nama}</h3>
                    <div style={s.childTagsRow}>
                      <span style={{ ...s.tagGender, color: isLaki ? colors.blue : colors.pink }}>
                        {isLaki ? '♂ Laki-laki' : '♀ Perempuan'}
                      </span>
                      <span style={s.childAge}>{calcUsia(child.tanggal_lahir)}</span>
                    </div>
                    <div style={s.detailGrid}>
                      <DetailRow label="Tanggal Lahir" value={formatDate(child.tanggal_lahir)} />
                      <DetailRow label="ID Anak" value={child.nik || '-'} />
                      <DetailRow label="Nama Ibu" value={child.nama_ibu || child.orang_tua?.nama || '-'} />
                      <DetailRow label="Posyandu" value={child.posyandu || 'Posyandu Ceria'} />
                      <DetailRow label="Kunjungan Terakhir" value={formatDate(latest?.tanggal_ukur)} />
                    </div>
                  </div>
                </div>

                <div style={{ ...s.statusCard, background: bad ? '#FCE4E4' : colors.greenSoft }}>
                  <div style={s.statusTitle}>Status Gizi Terakhir</div>
                  <div style={{ ...s.statusPill, background: bad ? colors.redSoft : '#CEFCBD', color: bad ? colors.red : colors.green }}>
                    <span style={{ fontSize: 18 }}>{bad ? '⚠️' : '✓'}</span>
                    {mapStatusGizi(statusGizi)}
                  </div>
                  <div style={s.statusNote}>
                    Berdasarkan pengukuran<br />{formatDate(latest?.tanggal_ukur)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CREAM SECTION: charts + legend + table */}
        <section style={{ ...s.creamSection, position: 'relative', overflow: 'hidden' }}>
          <CreamSectionDecorations />

          {/* Charts */}
          <h2 style={{ ...s.sectionTitle, position: 'relative', zIndex: 1 }}>Grafik Tumbuh Kembang</h2>
          <div style={{ ...s.chartGrid, position: 'relative', zIndex: 1 }} className="pc-fade-in">
            <GrowthChart chartId="bbu" title="Berat Badan per Usia (BB/U)" zScore={latest?.z_score_bb ?? 0} yLabel="Berat (kg)" xLabel="Usia (bulan)"
              values={chartHistory.map((h) => Number(h.berat_badan)).filter((v) => !Number.isNaN(v))} />
            <GrowthChart chartId="tbu" title="Tinggi Badan per Usia (TB/U)" zScore={latest?.z_score_tb ?? 0} yLabel="Tinggi (cm)" xLabel="Usia (bulan)"
              values={chartHistory.map((h) => Number(h.tinggi_badan)).filter((v) => !Number.isNaN(v))} />
            <GrowthChart chartId="bbtb" title="Berat Badan per Tinggi Badan (BB/TB)" zScore={latest?.z_score_bb_tb ?? 0} yLabel="Berat (kg)" xLabel="Tinggi (cm)"
              values={chartHistory.map((h) => Number(h.berat_badan)).filter((v) => !Number.isNaN(v))} />
          </div>

          {/* Tentang grafik + legend */}
          <div style={{ ...s.tentangCard, position: 'relative', zIndex: 1 }} className="pc-fade-in pc-delay-2">
            <div style={s.tentangLeft}>
              <div style={s.tentangIconBox}><ClipboardIcon /></div>
              <div>
                <div style={s.tentangTitle}>Tentang Grafik Tumbuh Kembang</div>
                <p style={s.tentangDesc}>
                  Grafik ini menunjukkan status pertumbuhan anak berdasarkan standar WHO.
                  Z-Score adalah indikator yang digunakan untuk menilai apakah pertumbuhan
                  anak sesuai, kurang, atau lebih dari standar
                </p>
              </div>
            </div>
            <div style={s.tentangRight}>
              <div style={s.legendTitle}>Keterangan Z-Score WHO</div>
              <div style={s.legendList}>
                <LegendRow color="#FF1010" label="< -3 SD" right="→ Stunting / Sangat Kurang" />
                <LegendRow color="#FFE9AE" label="-3 SD s/d -2 SD" right="→ Risiko" />
                <LegendRow color="#E4F8EB" label="-2 SD s/d +2 SD" right="→ Normal" />
              </div>
            </div>
          </div>

          {/* Riwayat Pengukuran table */}
          <h2 style={{ ...s.sectionTitle, position: 'relative', zIndex: 1, marginTop: 26 }}>Riwayat Pengukuran</h2>
          <div style={{ ...s.tableCard, position: 'relative', zIndex: 1 }} className="pc-fade-in pc-delay-3">
            <div style={{ ...s.tableHead, background: colors.tableHeadBlue }}>
              <span>Tanggal</span>
              <span>Usia</span>
              <span>Berat Badan (Kg)</span>
              <span>Tinggi Badan (Cm)</span>
              <span>BB/U</span>
              <span>TB/U</span>
              <span>BB/TB</span>
              <span>Status Gizi</span>
            </div>
            {loading ? (
              <div style={s.stateBox}>Memuat...</div>
            ) : sortedHistory.length === 0 ? (
              <div style={s.stateBox}>Belum ada data pengukuran.</div>
            ) : (
              sortedHistory.map((row, i) => {
                const rowBad = isBadStatus(row.status_gizi)
                return (
                  <div key={row.id || i} style={{ ...s.tableRow, background: i === 0 ? '#F4F8FF' : colors.white }}>
                    <span style={s.tcell}>{formatDate(row.tanggal_ukur)}</span>
                    <span style={s.tcell}>{usiaSingkat(child?.tanggal_lahir, row.tanggal_ukur)}</span>
                    <span style={s.tcell}>{formatDecimal(row.berat_badan)}</span>
                    <span style={s.tcell}>{formatDecimal(row.tinggi_badan)}</span>
                    <span style={s.tcell}>{zLabel(row.z_score_bb)}</span>
                    <span style={s.tcell}>{zLabel(row.z_score_tb)}</span>
                    <span style={s.tcell}>{zLabel(row.z_score_bb_tb)}</span>
                    <span>
                      <span style={{ ...s.statusBadge, background: rowBad ? colors.redSoft : colors.statusBg, color: rowBad ? colors.red : colors.green }}>
                        {mapStatusGizi(row.status_gizi)}
                      </span>
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </main>

      <ProfilePopup open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}

/* ─── Sub-components ─── */
function DetailRow({ label, value }) {
  return (
    <div style={s.detailRow}>
      <span style={{ color: colors.brown, fontWeight: 700, minWidth: 150 }}>{label}</span>
      <span style={{ color: colors.brown, fontWeight: 700 }}>{value}</span>
    </div>
  )
}

function LegendRow({ color, label, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
      <span style={{ width: 16, height: 14, borderRadius: 3, background: color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }} />
      <span style={{ fontWeight: 700, color: colors.brown, minWidth: 120 }}>{label}</span>
      <span style={{ color: colors.brown, fontWeight: 500 }}>{right}</span>
    </div>
  )
}

function ClipboardIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#655040" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 7h6M9 11h6M9 15h4" />
    </svg>
  )
}

/* SVG growth chart with WHO color bands + the child's measurement line (green). */
function GrowthChart({ chartId, title, zScore, yLabel, xLabel, values = [] }) {
  const bad = Number(zScore) <= -2
  const W = 220, H = 120, PADL = 26, PADB = 22
  const maxData = values.length ? Math.max(...values) : 1
  const maxY = Math.max(1, maxData * 1.25)
  const n = values.length
  const toX = (i) => PADL + (n <= 1 ? 0.5 : i / (n - 1)) * (W - PADL - 8)
  const toY = (v) => (H - PADB) - (v / maxY) * (H - PADB - 8)
  const gradId = 'whoBands-' + chartId

  return (
    <div style={s.chartCard}>
      <div style={s.chartHeader}>
        <span style={s.chartTitle}>{title}</span>
        <span style={{ fontSize: 13, color: colors.mutedBrown }}>ⓘ</span>
      </div>
      <div style={{ ...s.chartBadge, background: bad ? colors.redSoft : '#CEFCBD', color: bad ? colors.red : colors.green }}>
        {bad ? 'Perlu Perhatian' : 'Normal'} (Z-Score {Number(zScore).toFixed(1)})
      </div>
      <div style={{ fontSize: 10, color: colors.mutedBrown, marginTop: 6, marginLeft: 2, fontWeight: 700 }}>{yLabel}</div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', marginTop: 2 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F8B7B7" /><stop offset="0.14" stopColor="#F8B7B7" />
            <stop offset="0.14" stopColor="#FFE9AE" /><stop offset="0.30" stopColor="#FFE9AE" />
            <stop offset="0.30" stopColor="#CFEBD2" /><stop offset="0.72" stopColor="#CFEBD2" />
            <stop offset="0.72" stopColor="#FFE9AE" /><stop offset="0.86" stopColor="#FFE9AE" />
            <stop offset="0.86" stopColor="#F8B7B7" /><stop offset="1" stopColor="#F8B7B7" />
          </linearGradient>
        </defs>
        <rect x={PADL} y="4" width={W - PADL - 8} height={H - PADB - 4} fill={`url(#${gradId})`} rx="4" />

        {/* Y axis ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
          <text key={i} x={PADL - 4} y={toY(maxY * f) + 3} fontSize="7" textAnchor="end" fill="#876D5D">{Math.round(maxY * f)}</text>
        ))}
        {/* Z-score side labels */}
        {[{ l: '+3', y: 0.95, c: '#E94B4B' }, { l: '+2', y: 0.78, c: '#C99B1F' }, { l: '0', y: 0.5, c: '#4E724C' }, { l: '-2', y: 0.2, c: '#C99B1F' }, { l: '-3', y: 0.06, c: '#E94B4B' }].map((z, i) => (
          <text key={i} x={W - 2} y={toY(maxY * z.y) + 3} fontSize="7" fontWeight="700" textAnchor="end" fill={z.c}>{z.l}</text>
        ))}
        {/* Data line + dots (green) */}
        {n > 0 && (
          <polyline points={values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')} fill="none" stroke="#2FA866" strokeWidth="1.6" />
        )}
        {values.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r="2" fill="#FFFFFF" stroke="#2FA866" strokeWidth="1.4" />
        ))}
      </svg>

      <div style={{ fontSize: 10, color: colors.mutedBrown, fontWeight: 700, marginLeft: 26, marginTop: 2 }}>{xLabel}</div>
      <div style={s.chartLegend}>
        <span style={{ width: 14, height: 2, background: '#2FA866', display: 'inline-block' }} />
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFFFFF', border: '1.5px solid #2FA866', display: 'inline-block' }} />
        Hasil Pengukuran Anak
      </div>
    </div>
  )
}

/* ─── Styles ─── */
const TCOLS = '1fr 0.8fr 1.1fr 1.1fr 1fr 1fr 1fr 0.95fr'

const s = {
  page: { display: 'flex', minHeight: '100vh', background: colors.cream, fontFamily: "'Noto Sans', sans-serif" },
  main: { flex: 1, minWidth: 0 },

  greenSection: { background: 'linear-gradient(180deg, #5C8259 0%, #4E724C 45%, #3F633E 100%)', padding: '24px 30px 32px', boxShadow: '0 4px 18px rgba(63,99,62,0.18)' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 18 },
  backBtn: { width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
  headerTitle: { margin: 0, fontWeight: 800, fontSize: 26, color: colors.cream },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  bellBtn: { width: 38, height: 38, borderRadius: '50%', background: colors.tan, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  userPill: { background: colors.tan, borderRadius: 30, padding: '4px 14px 4px 4px', display: 'flex', alignItems: 'center', gap: 8 },
  userAvatar: { width: 30, height: 30, borderRadius: '50%', background: colors.brown, color: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 },
  userName: { fontWeight: 700, fontSize: 13, color: colors.brown },

  sectionTitleWhite: { margin: '0 0 14px', fontSize: 18, fontWeight: 800, color: colors.white },
  stateBox: { background: colors.cream, borderRadius: 14, padding: 26, textAlign: 'center', color: colors.mutedBrown, fontWeight: 700 },

  dataAnakCard: { background: colors.cream, borderRadius: 18, padding: '28px 30px', display: 'flex', alignItems: 'stretch', gap: 26, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', flexWrap: 'wrap' },
  dataAnakLeft: { flex: '1 1 440px', display: 'flex', gap: 26, alignItems: 'center' },
  childPhoto: { width: 150, height: 150, borderRadius: '50%', background: 'linear-gradient(135deg, #DEEED8 0%, #CFEBD2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #FFFFFF', boxShadow: '0 6px 16px rgba(101,80,64,0.14)', flexShrink: 0 },
  childInfo: { flex: 1, minWidth: 0 },
  childName: { margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: colors.brown },
  childTagsRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' },
  tagGender: { fontWeight: 700, fontSize: 13 },
  childAge: { fontSize: 13, color: colors.brown, fontWeight: 700 },
  detailGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
  detailRow: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: colors.brown },

  statusCard: { flex: '0 1 250px', borderRadius: 15, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, justifyContent: 'center' },
  statusTitle: { fontSize: 18, fontWeight: 600, color: colors.green, textAlign: 'center' },
  statusPill: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 22px', borderRadius: 999, fontWeight: 700, fontSize: 18, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' },
  statusNote: { fontSize: 13, color: colors.mutedBrown, textAlign: 'center', lineHeight: 1.45, fontWeight: 600 },

  creamSection: { background: 'linear-gradient(180deg, #FFF5F8 0%, #FFEBF1 100%)', padding: '26px 30px 44px' },
  sectionTitle: { margin: '0 0 14px', fontSize: 18, fontWeight: 800, color: colors.brown },

  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 22 },
  chartCard: { background: colors.white, borderRadius: 12, padding: 14, boxShadow: '0 4px 14px rgba(0,0,0,0.06)' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  chartTitle: { fontSize: 13, fontWeight: 800, color: colors.brown },
  chartBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800 },
  chartLegend: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: colors.mutedBrown, fontWeight: 700, marginTop: 6 },

  tentangCard: { background: colors.tentangPink, borderRadius: 14, padding: 18, display: 'flex', gap: 24, flexWrap: 'wrap' },
  tentangLeft: { display: 'flex', gap: 14, alignItems: 'flex-start', flex: '1 1 320px' },
  tentangIconBox: { width: 50, height: 50, borderRadius: 10, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tentangTitle: { fontSize: 15, fontWeight: 800, color: colors.brown, marginBottom: 6 },
  tentangDesc: { margin: 0, fontSize: 12, color: colors.brown, lineHeight: 1.5 },
  tentangRight: { flex: '0 1 320px', borderLeft: '1px solid rgba(106,106,106,0.45)', paddingLeft: 18 },
  legendTitle: { fontSize: 15, fontWeight: 800, color: colors.brown, marginBottom: 8 },
  legendList: { display: 'flex', flexDirection: 'column', gap: 7 },

  tableCard: { background: colors.white, borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' },
  tableHead: { display: 'grid', gridTemplateColumns: TCOLS, gap: 8, alignItems: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 800, color: colors.brown },
  tableRow: { display: 'grid', gridTemplateColumns: TCOLS, gap: 8, alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #EEE', fontSize: 12 },
  tcell: { color: colors.brown, fontWeight: 600 },
  statusBadge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '3px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 },
}
