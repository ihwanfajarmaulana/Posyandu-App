import { useEffect, useState } from 'react'
import API from '../api'
import { SharedSidebar, Icon, ProfilePopup } from '../components/SidebarLayout'
import { GreenHeaderDecorations, CreamSectionDecorations } from '../components/Decorations'

/* ──────────────────────────────────────────────────────────────────────────
   REKOMENDASI page — comprehensive view for a child's growth recommendations.

   Data flow:
   - Fetches the parent's child list (uses the first child by default)
   - Fetches recommendations from the backend (auto-syncs with pegawai's CRUD)
   - Falls back to friendly demo content if any endpoint is missing

   When the pegawai teammate adds/edits/deletes recommendations on their side,
   refreshing this page will show the new data — same endpoint, shared DB.
   ────────────────────────────────────────────────────────────────────────── */

const colors = {
  green: '#4E724C',
  greenDark: '#3F633E',
  greenSoft: '#CFEBD2',
  cream: '#FFF5F8',
  pink: '#FFE0F0',
  pinkSoft: '#FFEBF1',
  tan: '#F2DFD1',
  tanLight: '#F8E8DA',
  brown: '#655040',
  mutedBrown: '#876D5D',
  white: '#FFFFFF',
  red: '#E63946',
  redSoft: '#FFD4D4',
  redPale: '#FFE7E7',
  yellowSoft: '#FFF1B8',
  blue: '#3B82F6',
  blueSoft: '#DBEAFE',
}

/* ─── Fallback content used when backend endpoints aren't available yet ─── */

const rekomendasiFallback = [
  {
    icon: '🍗',
    title: 'Perbanyak konsumsi protein hewani',
    desc: 'Perbanyak konsumsi telur, ikan, daging, tempe, dan tahu untuk sebanyak 2-3 kali sehari untuk membantu pertumbuhan anak',
  },
  {
    icon: '🍩',
    title: 'Mengurangi Jajanan Manis dan Instan',
    desc: 'Batasi konsumsi makanan manis dan instan, maksimal 1-2 kali seminggu, agar kebutuhan gizi anak tetap terjaga.',
  },
  {
    icon: '💧',
    title: 'Mencukupi Kebutuhan Air Putih',
    desc: 'Pastikan anak minum air putih 6-8 gelas sehari agar tubuh tetap sehat dan terhidrasi.',
  },
  {
    icon: '🍳',
    title: 'Membiasakan Sarapan Sehat',
    desc: 'Biasakan anak sarapan seperti nasi, telur, susu, atau buah setiap pagi agar energi dan kebutuhan nutrisinya terpenuhi.',
  },
]

const penangananFallback = [
  {
    icon: '🍲',
    title: 'Meningkatkan porsi makan',
    desc: 'Memberi anak makan dengan porsi yang lebih banyak daripada biasanya.',
  },
  {
    icon: '🥛',
    title: 'Rutin Memberikan Susu',
    desc: 'Berikan susu secara rutin sesuai usia dan kebutuhan anak. (Formula, UHT, UBM)',
  },
  {
    icon: '🏥',
    title: 'Rutin Mengikuti Kegiatan Posyandu',
    desc: 'Ikuti pemeriksaan rutin di posyandu guna memantau kesehatan dan pertumbuhan anak.',
  },
]

/* ─── Helper: calculate age string ─── */
function calcUsia(tanggalLahir) {
  if (!tanggalLahir) return '-'
  const lahir = new Date(tanggalLahir)
  const sekarang = new Date()
  const bulan = (sekarang.getFullYear() - lahir.getFullYear()) * 12 + (sekarang.getMonth() - lahir.getMonth())
  if (bulan < 12) return bulan + ' Bulan'
  const tahun = Math.floor(bulan / 12)
  const sisa = bulan % 12
  return sisa === 0 ? tahun + ' Tahun' : tahun + ' Tahun ' + sisa + ' Bulan'
}

function formatTanggal(tgl) {
  if (!tgl) return '-'
  const d = new Date(tgl)
  if (isNaN(d.getTime())) return '-'
  const bln = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${d.getDate()} ${bln[d.getMonth()]} ${d.getFullYear()}`
}

/* ════════════════════════════════════════════════════════════════════════ */
//  MAIN COMPONENT
/* ════════════════════════════════════════════════════════════════════════ */

export default function Rekomendasi() {
  const [anak, setAnak] = useState(null)
  const [rekomendasi, setRekomendasi] = useState(rekomendasiFallback)
  const [penanganan, setPenanganan] = useState(penangananFallback)
  const [loading, setLoading] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    // 1. Get the parent's children
    API.get('/balita').then(async (res) => {
      if (cancelled) return
      const list = res.data?.data || []
      if (list.length === 0) {
        setLoading(false)
        return
      }
      const firstAnak = list[0]

      // 2. Get the child's latest growth/summary data
      try {
        const ringkasan = await API.get('/balita/' + firstAnak.id + '/ringkasan')
        const p = ringkasan.data?.data?.pertumbuhan_terakhir || {}
        if (!cancelled) {
          setAnak({
            ...firstAnak,
            berat_badan: p.berat_badan ?? null,
            tinggi_badan: p.tinggi_badan ?? null,
            tanggal_ukur: p.tanggal_ukur ?? null,
            status_gizi: p.status_gizi || 'gizi_baik',
            z_score_bb: p.z_score_bb ?? -2.6,
            z_score_tb: p.z_score_tb ?? -2.3,
            z_score_bb_tb: p.z_score_bb_tb ?? -2.1,
          })
        }
      } catch {
        if (!cancelled) setAnak(firstAnak)
      }

      // 3. Try to fetch recommendations for this child from backend.
      // If the endpoint doesn't exist, we keep the fallback list.
      try {
        const rek = await API.get('/rekomendasi/anak/' + firstAnak.id)
        const list = rek.data?.data || []
        if (!cancelled && list.length > 0) setRekomendasi(list)
      } catch {
        // backend may not have this endpoint yet — fallback content stays
      }

      // 4. Try to fetch penanganan (actions parents already did)
      try {
        const pen = await API.get('/penanganan/anak/' + firstAnak.id)
        const list = pen.data?.data || []
        if (!cancelled && list.length > 0) setPenanganan(list)
      } catch {
        // fallback stays
      }
    }).catch(() => {
      // No child data, keep fallback recommendations as inspiration
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  return (
    <div style={s.page}>
      <SharedSidebar activePath="/rekomendasi" />

      <main style={s.main}>
        {/* SINGLE GREEN SECTION — header + Data Anak share one continuous gradient
            so there's no visible seam between them. */}
        <section style={{ ...s.greenSection, position: 'relative', overflow: 'hidden' }}>
          <GreenHeaderDecorations />
          <header style={{ ...s.headerRow, position: 'relative', zIndex: 1 }}>
            <h1 style={s.headerTitle}>Tumbuh Kembang</h1>
            <div style={s.headerRight}>
              <button type="button" style={s.bellBtn} aria-label="Notifikasi" className="pc-btn pc-bell">
                <Icon name="bell" size={20} color={colors.brown} />
              </button>
              <button
                type="button"
                onClick={() => setShowProfile(true)}
                style={{ ...s.userPill, border: 'none', cursor: 'pointer' }}
                className="pc-btn"
              >
                <div style={s.userAvatar}>
                  {(user.nama || 'U').slice(0, 1).toUpperCase()}
                </div>
                <span style={s.userName}>{user.nama || 'User'}</span>
              </button>
            </div>
          </header>

          <h2 style={{ ...s.sectionTitleWhite, position: 'relative', zIndex: 1 }}>Data Anak</h2>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {loading ? (
              <div style={s.loadingBox}>Memuat data anak...</div>
            ) : !anak ? (
              <div style={s.emptyBox}>
                Belum ada data anak. Hubungi kader posyandu untuk mendaftarkan anak.
              </div>
            ) : (
              <DataAnakCard child={anak} />
            )}
          </div>
        </section>

        {/* CHARTS + RECOMMENDATIONS SECTION */}
        <section style={{ ...s.pinkContent, position: 'relative', overflow: 'hidden' }}>
          <CreamSectionDecorations />
          {/* GRAFIK TUMBUH KEMBANG */}
          <h2 style={{ ...s.sectionTitle, position: 'relative', zIndex: 1 }}>Grafik Tumbuh Kembang</h2>
          <div style={{ ...s.chartGrid, position: 'relative', zIndex: 1 }} className="pc-fade-in">
            <GrafikCard
              chartId="bbu"
              title="Berat Badan per Usia (BB/U)"
              zScore={anak?.z_score_bb ?? -2.6}
              yLabel="Berat (kg)"
              xLabel="Usia (bulan)"
              maxY={20}
            />
            <GrafikCard
              chartId="tbu"
              title="Tinggi Badan per Usia (TB/U)"
              zScore={anak?.z_score_tb ?? -2.3}
              yLabel="Tinggi (cm)"
              xLabel="Usia (bulan)"
              maxY={120}
            />
            <GrafikCard
              chartId="bbtb"
              title="Berat Badan per Tinggi Badan (BB/TB)"
              zScore={anak?.z_score_bb_tb ?? -2.1}
              yLabel="Berat (kg)"
              xLabel="Tinggi (cm)"
              maxY={20}
              xMin={45} xMax={120}
            />
          </div>

          {/* TENTANG GRAFIK + Z-SCORE LEGEND */}
          <div style={{ ...s.tentangGrafikCard, position: 'relative', zIndex: 1 }} className="pc-fade-in pc-delay-2">
            <div style={s.tentangLeft}>
              <div style={s.tentangIconBox}>
                <ClipboardIcon />
              </div>
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
                <LegendRow color="#E94B4B" label="< -3 SD" right="→ Stunting / Sangat Kurang" />
                <LegendRow color="#FFD966" label="-3 SD s/d -2 SD" right="→ Risiko" />
                <LegendRow color="#A8E0B0" label="-2 SD s/d +2 SD" right="→ Normal" />
              </div>
            </div>
          </div>

          {/* REKOMENDASI */}
          <div style={{ ...s.rekomendasiSection, position: 'relative', zIndex: 1 }} className="pc-fade-in pc-delay-3">
            <h2 style={s.sectionTitle}>Rekomendasi untuk Mendukung Tumbuh Kembang Anak</h2>
            <div style={s.rekomendasiList}>
              {rekomendasi.map((r, i) => (
                <RekomendasiItem
                  key={i}
                  icon={r.icon || '📌'}
                  title={r.title || r.judul}
                  desc={r.desc || r.deskripsi}
                  delay={i + 1}
                />
              ))}
            </div>
          </div>

          {/* PENANGANAN */}
          <div style={{ ...s.penangananSection, position: 'relative', zIndex: 1 }} className="pc-fade-in pc-delay-4">
            <h2 style={s.sectionTitle}>Penanganan yang Sudah Dilakukan Orang Tua</h2>
            <div style={s.penangananGrid}>
              {penanganan.map((p, i) => (
                <PenangananCard
                  key={i}
                  icon={p.icon || '✓'}
                  title={p.title || p.judul}
                  desc={p.desc || p.deskripsi}
                  delay={i + 1}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Profile drawer */}
      <ProfilePopup open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════ */
//  SUB-COMPONENTS
/* ════════════════════════════════════════════════════════════════════════ */

function DataAnakCard({ child }) {
  const isLakiLaki = child.jenis_kelamin === 'L'
  const usia = calcUsia(child.tanggal_lahir)
  const statusLabel = mapStatusGizi(child.status_gizi)
  const isStunting = ['stunting', 'gizi_buruk', 'gizi_kurang'].includes((child.status_gizi || '').toLowerCase())

  return (
    <div style={s.dataAnakCard} className="pc-scale-in">
      <div style={s.dataAnakLeft}>
        {/* Photo */}
        <div style={s.childPhoto}>
          <Icon name="user" size={64} color={colors.green} />
        </div>
        {/* Info */}
        <div style={s.childInfo}>
          <h3 style={s.childName}>{child.nama || '-'}</h3>
          <div style={s.childTagsRow}>
            <span style={s.tagGender}>
              <span style={{ fontSize: 14 }}>{isLakiLaki ? '♂' : '♀'}</span>
              {isLakiLaki ? 'Laki-laki' : 'Perempuan'}
            </span>
            <span style={s.childAge}>{usia}</span>
          </div>
          <div style={s.detailGrid}>
            <DetailRow icon="📅" label="Tanggal Lahir" value={formatTanggal(child.tanggal_lahir)} />
            <DetailRow icon="🪪" label="ID Anak" value={child.nik || '-'} />
            <DetailRow icon="👩" label="Nama Ibu" value={child.nama_ibu || child.orang_tua?.nama || '-'} />
            <DetailRow icon="📍" label="Posyandu" value={child.posyandu || 'Posyandu Ceria'} />
            <DetailRow icon="🗓" label="Kunjungan Terakhir" value={formatTanggal(child.kunjungan_terakhir || child.tanggal_ukur)} />
          </div>
        </div>
      </div>

      {/* Status Gizi card on the right */}
      <div style={{
        ...s.statusGiziCard,
        background: isStunting ? '#FFE7E7' : '#E6F5E9',
      }}>
        <div style={s.statusGiziTitle}>Status Gizi Terakhir</div>
        <div style={{
          ...s.statusGiziPill,
          background: isStunting ? '#FFD4D4' : '#CFEBD2',
          color: isStunting ? '#E63946' : '#3F633E',
        }}>
          <span style={{ fontSize: 18 }}>{isStunting ? '⚠️' : '✓'}</span>
          {statusLabel}
        </div>
        <div style={s.statusGiziNote}>
          Berdasarkan pengukuran
          <br />
          {formatTanggal(child.tanggal_ukur) || '-'}
        </div>
        <button type="button" style={s.catatBtn} className="pc-btn pc-focusable">
          + Catat Penanganan
        </button>
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={s.detailRow}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 170 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ color: colors.mutedBrown, fontWeight: 700 }}>{label}</span>
      </span>
      <span style={{ color: colors.brown, fontWeight: 700 }}>{value}</span>
    </div>
  )
}

/* ─── Growth Chart card (SVG-based, no external library) ─── */
function GrafikCard({ title, zScore, yLabel, xLabel, maxY = 20, xMin = 0, xMax = 30, chartId = 'chart' }) {
  const isStunting = zScore <= -2

  // Sample data points (Hasil Pengukuran Anak) — visually a low growing curve.
  // In a real app this would come from the API.
  const points = [
    { x: xMin, y: maxY * 0.10 },
    { x: xMin + (xMax - xMin) * 0.2, y: maxY * 0.18 },
    { x: xMin + (xMax - xMin) * 0.4, y: maxY * 0.24 },
    { x: xMin + (xMax - xMin) * 0.6, y: maxY * 0.28 },
    { x: xMin + (xMax - xMin) * 0.8, y: maxY * 0.32 },
    { x: xMax, y: maxY * 0.35 },
  ]

  // Normalize to SVG viewBox
  const W = 200, H = 110, PADL = 28, PADB = 24
  const toX = (x) => PADL + ((x - xMin) / (xMax - xMin)) * (W - PADL - 6)
  const toY = (y) => (H - PADB) - (y / maxY) * (H - PADB - 8)

  // CRITICAL: SVG IDs MUST be safe URL-fragment chars.
  // The previous code used the chart title (with spaces, slashes, parentheses)
  // which made fill="url(#…)" fail and the rect rendered as black.
  const gradId = 'gradZones-' + chartId

  return (
    <div style={s.chartCard}>
      <div style={s.chartCardHeader}>
        <span style={s.chartCardTitle}>{title}</span>
        <span style={s.chartInfoIcon}>ⓘ</span>
      </div>
      <div style={{
        ...s.chartZScoreBadge,
        background: isStunting ? '#FFD4D4' : '#CFEBD2',
        color: isStunting ? '#E63946' : '#3F633E',
      }}>
        {isStunting ? 'Stunting' : 'Normal'} (Z-Score {zScore?.toFixed?.(1) || zScore})
      </div>

      <div style={{ fontSize: 10, color: colors.mutedBrown, marginTop: 6, marginLeft: 4, fontWeight: 700 }}>
        {yLabel}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', marginTop: 4 }}>
        {/* Background bands (WHO zones) — hard color stops create distinct bands */}
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F8B7B7" />
            <stop offset="0.15" stopColor="#F8B7B7" />
            <stop offset="0.15" stopColor="#FFE08A" />
            <stop offset="0.30" stopColor="#FFE08A" />
            <stop offset="0.30" stopColor="#B5E0BC" />
            <stop offset="0.70" stopColor="#B5E0BC" />
            <stop offset="0.70" stopColor="#FFE08A" />
            <stop offset="0.85" stopColor="#FFE08A" />
            <stop offset="0.85" stopColor="#F8B7B7" />
            <stop offset="1" stopColor="#F8B7B7" />
          </linearGradient>
        </defs>
        <rect x={PADL} y="4" width={W - PADL - 6} height={H - PADB - 4} fill={`url(#${gradId})`} rx="4" />

        {/* Y axis labels */}
        {[0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY].map((v, i) => (
          <text key={i} x={PADL - 4} y={toY(v) + 3} fontSize="7" textAnchor="end" fill="#876D5D">
            {Math.round(v)}
          </text>
        ))}

        {/* X axis labels */}
        {[xMin, xMin + (xMax - xMin) * 0.2, xMin + (xMax - xMin) * 0.4, xMin + (xMax - xMin) * 0.6, xMin + (xMax - xMin) * 0.8, xMax].map((v, i) => (
          <text key={i} x={toX(v)} y={H - PADB + 10} fontSize="7" textAnchor="middle" fill="#876D5D">
            {Math.round(v)}
          </text>
        ))}

        {/* Z-Score labels on right */}
        {[
          { label: '+3', color: '#E94B4B', y: maxY * 0.95 },
          { label: '+2', color: '#C99B1F', y: maxY * 0.78 },
          { label: '0', color: '#4E724C', y: maxY * 0.5 },
          { label: '-2', color: '#C99B1F', y: maxY * 0.2 },
          { label: '-3', color: '#E94B4B', y: maxY * 0.08 },
        ].map((z, i) => (
          <text key={i} x={W - 2} y={toY(z.y) + 3} fontSize="7" fontWeight="700" textAnchor="end" fill={z.color}>
            {z.label}
          </text>
        ))}

        {/* Data line + points */}
        <polyline
          points={points.map(p => `${toX(p.x)},${toY(p.y)}`).join(' ')}
          fill="none"
          stroke="#E63946"
          strokeWidth="1.3"
        />
        {points.map((p, i) => (
          <circle key={i} cx={toX(p.x)} cy={toY(p.y)} r="1.6" fill="#FFFFFF" stroke="#E63946" strokeWidth="1.2" />
        ))}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: colors.mutedBrown, fontWeight: 700, marginLeft: 28 }}>{xLabel}</span>
      </div>

      <div style={s.chartLegend}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 14, height: 1.5, background: '#E63946', display: 'inline-block' }} />
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFFFFF', border: '1.5px solid #E63946', display: 'inline-block' }} />
          Hasil Pengukuran Anak
        </span>
      </div>
    </div>
  )
}

function LegendRow({ color, label, right }) {
  return (
    <div style={s.legendRow}>
      <div style={{ ...s.legendSwatch, background: color }} />
      <span style={s.legendLabel}>{label}</span>
      <span style={s.legendRight}>{right}</span>
    </div>
  )
}

function ClipboardIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#876D5D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </svg>
  )
}

function RekomendasiItem({ icon, title, desc, delay = 1 }) {
  return (
    <div style={s.rekomItem} className={`pc-slide-up pc-delay-${delay} pc-hover-lift`}>
      <div style={s.rekomIcon}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={s.rekomTitle}>{title}</div>
        <p style={s.rekomDesc}>{desc}</p>
      </div>
    </div>
  )
}

function PenangananCard({ icon, title, desc, delay = 1 }) {
  return (
    <div style={s.penangananCard} className={`pc-slide-up pc-delay-${delay} pc-hover-lift`}>
      <div style={s.penangananCheck}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div style={s.penangananTitle}>{title}</div>
      <div style={s.penangananIconBig}>
        <span style={{ fontSize: 40 }}>{icon}</span>
      </div>
      <p style={s.penangananDesc}>{desc}</p>
    </div>
  )
}

function mapStatusGizi(s) {
  const map = {
    gizi_baik: 'Normal',
    gizi_kurang: 'Gizi Kurang',
    gizi_lebih: 'Gizi Lebih',
    gizi_buruk: 'Gizi Buruk',
    obesitas: 'Obesitas',
    stunting: 'Stunting',
  }
  return map[s?.toLowerCase()] || 'Stunting'
}

/* ════════════════════════════════════════════════════════════════════════ */
//  STYLES
/* ════════════════════════════════════════════════════════════════════════ */

const s = {
  page: {
    display: 'flex', minHeight: '100vh',
    background: colors.cream,
    fontFamily: "'Noto Sans', sans-serif",
  },
  main: { flex: 1, minWidth: 0 },

  /* Single green section — header row + Data Anak title + child card all
     share one gradient. No seam, no visible line between them. */
  greenSection: {
    background: 'linear-gradient(180deg, #5C8259 0%, #4E724C 45%, #3F633E 100%)',
    padding: '24px 30px 32px',
    boxShadow: '0 4px 18px rgba(63, 99, 62, 0.18)',
  },
  headerRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    gap: 20, flexWrap: 'wrap', marginBottom: 18,
  },
  headerTitle: { margin: 0, fontWeight: 800, fontSize: 26, color: colors.cream },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  bellBtn: {
    width: 38, height: 38, borderRadius: '50%',
    background: colors.tan, border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },
  userPill: {
    background: colors.tan, borderRadius: 30, padding: '4px 14px 4px 4px',
    display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
  },
  userAvatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: colors.brown, color: colors.white,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 800,
  },
  userName: { fontWeight: 700, fontSize: 13, color: colors.brown },

  sectionTitleWhite: {
    margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: colors.cream,
  },

  loadingBox: {
    background: colors.cream, borderRadius: 14, padding: 24,
    textAlign: 'center', color: colors.mutedBrown, fontWeight: 700,
  },
  emptyBox: {
    background: colors.cream, borderRadius: 14, padding: 24,
    textAlign: 'center', color: colors.mutedBrown, fontWeight: 700,
  },

  /* Data Anak card — white background (matches Dashboard's "white card" look),
     bigger downward, with more breathing room inside. */
  dataAnakCard: {
    background: colors.cream,            // light pinkish-white, same as Dashboard
    borderRadius: 22,
    padding: '34px 32px',                // taller & roomier
    display: 'flex', alignItems: 'stretch', gap: 28,
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    flexWrap: 'wrap',
  },
  dataAnakLeft: {
    flex: '1 1 440px', display: 'flex', gap: 28, alignItems: 'center',
  },
  childPhoto: {
    width: 170, height: 170, borderRadius: '50%',
    background: 'linear-gradient(135deg, #DEEED8 0%, #CFEBD2 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '4px solid #FFFFFF',
    boxShadow: '0 6px 16px rgba(101, 80, 64, 0.14)',
    flexShrink: 0,
  },
  childInfo: { flex: 1, minWidth: 0 },
  childName: { margin: '0 0 6px', fontSize: 28, fontWeight: 800, color: colors.brown },
  childTagsRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' },
  tagGender: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    color: colors.blue, fontWeight: 700, fontSize: 14, textDecoration: 'underline',
  },
  childAge: { fontSize: 14, color: colors.brown, fontWeight: 700 },
  detailGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
  detailRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    fontSize: 14, color: colors.brown,
  },

  /* Status Gizi card — sized to match the bigger Data Anak card */
  statusGiziCard: {
    flex: '0 1 250px',
    borderRadius: 18, padding: '22px 22px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 12,
    border: '1px solid rgba(0,0,0,0.06)',
  },
  statusGiziTitle: { fontSize: 15, fontWeight: 800, color: colors.brown, textAlign: 'center' },
  statusGiziPill: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '8px 18px', borderRadius: 12,
    fontWeight: 800, fontSize: 17,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  },
  statusGiziNote: {
    fontSize: 12, color: colors.mutedBrown,
    textAlign: 'center', lineHeight: 1.4,
  },
  catatBtn: {
    marginTop: 6, padding: '9px 18px',
    background: '#CFEBD2', color: colors.green,
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: 10, fontSize: 13, fontWeight: 800,
    cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif",
  },

  /* Pink content section — matches the Dashboard's pinkBand exactly */
  pinkContent: {
    background: 'linear-gradient(180deg, #FFF5F8 0%, #FFEBF1 100%)',
    padding: '28px 30px 40px',
  },
  sectionTitle: {
    margin: '0 0 14px', fontSize: 17, fontWeight: 800, color: colors.brown,
  },

  /* Chart grid */
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16, marginBottom: 24,
  },
  chartCard: {
    background: colors.white, borderRadius: 14,
    padding: 14, boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
  },
  chartCardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  chartCardTitle: { fontSize: 13, fontWeight: 800, color: colors.brown },
  chartInfoIcon: { fontSize: 14, color: colors.mutedBrown },
  chartZScoreBadge: {
    display: 'inline-block', padding: '4px 12px', borderRadius: 999,
    fontSize: 11, fontWeight: 800,
  },
  chartLegend: {
    fontSize: 10, color: colors.mutedBrown, fontWeight: 700,
    marginTop: 6, textAlign: 'left',
  },

  /* Tentang grafik */
  tentangGrafikCard: {
    background: '#F8DCDC', borderRadius: 14,
    padding: 18, display: 'flex', gap: 24,
    flexWrap: 'wrap', marginBottom: 24,
  },
  tentangLeft: {
    display: 'flex', gap: 14, alignItems: 'flex-start',
    flex: '1 1 320px',
  },
  tentangIconBox: {
    width: 48, height: 48, borderRadius: 10,
    background: 'rgba(255,255,255,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  tentangTitle: { fontSize: 14, fontWeight: 800, color: colors.brown, marginBottom: 6 },
  tentangDesc: { margin: 0, fontSize: 12.5, color: colors.mutedBrown, lineHeight: 1.55 },
  tentangRight: {
    flex: '0 1 320px',
    borderLeft: '1px dashed rgba(101, 80, 64, 0.3)',
    paddingLeft: 18,
  },
  legendTitle: { fontSize: 14, fontWeight: 800, color: colors.brown, marginBottom: 8 },
  legendList: { display: 'flex', flexDirection: 'column', gap: 6 },
  legendRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 },
  legendSwatch: { width: 18, height: 12, borderRadius: 3, flexShrink: 0 },
  legendLabel: { fontWeight: 700, color: colors.brown },
  legendRight: { color: colors.mutedBrown, fontWeight: 600 },

  /* Rekomendasi */
  rekomendasiSection: {
    background: '#D9E5FF',
    borderRadius: 18,
    padding: '18px 18px 14px',
    marginBottom: 24,
  },
  rekomendasiList: { display: 'flex', flexDirection: 'column', gap: 10 },
  rekomItem: {
    background: colors.white, borderRadius: 12,
    padding: '12px 14px', display: 'flex', gap: 12,
    alignItems: 'flex-start',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  rekomIcon: {
    width: 38, height: 38, borderRadius: 10,
    background: '#F8E8DA',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  rekomTitle: { fontSize: 13.5, fontWeight: 800, color: colors.brown, marginBottom: 4 },
  rekomDesc: { margin: 0, fontSize: 12, color: colors.mutedBrown, lineHeight: 1.55 },

  /* Penanganan */
  penangananSection: {
    background: '#D9E5FF',
    borderRadius: 18,
    padding: '18px 18px',
  },
  penangananGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  },
  penangananCard: {
    background: colors.white, borderRadius: 14,
    padding: '16px 14px',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    minHeight: 200,
  },
  penangananCheck: {
    position: 'absolute', top: 10, left: 10,
    width: 26, height: 26, borderRadius: 6,
    background: '#4ADE80',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  penangananTitle: {
    fontSize: 13.5, fontWeight: 800, color: colors.brown,
    marginLeft: 38, marginBottom: 10,
    lineHeight: 1.3,
  },
  penangananIconBig: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    margin: '6px 0 8px',
  },
  penangananDesc: {
    margin: 0, fontSize: 11.5, color: colors.mutedBrown,
    lineHeight: 1.55, textAlign: 'center',
  },
}
