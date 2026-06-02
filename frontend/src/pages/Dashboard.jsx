import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'
import { SharedSidebar, Icon, ProfilePopup } from '../components/SidebarLayout'
import { GreenHeaderDecorations } from '../components/Decorations'

const colors = {
  green: '#4E724C',
  greenDark: '#3F633E',
  greenSoft: '#CFEBD2',
  cream: '#FFF5F8',
  tan: '#F2DFD1',
  brown: '#655040',
  mutedBrown: '#876D5D',
  white: '#FFFFFF',
  red: '#FF6B6B',
  redSoft: '#FFD4D4',
  yellow: '#FFD966',
  yellowSoft: '#FFF1B8',
  pink: '#FFAFE5',
  pinkSoft: '#FFE0F4',
  tagPurple: '#D9A8FF',
}

const beritaList = [
  {
    id: 1,
    tag: 'Tips Kesehatan',
    title: 'Pentingnya Memantau Pertumbuhan Anak Secara Rutin',
    desc: 'Memantau pertumbuhan anak secara rutin dapat membantu...',
    date: '20 Mei 2026',
    reads: 5,
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=200&fit=crop',
  },
  {
    id: 2,
    tag: 'Gizi Anak',
    title: 'Ide Menu Sehat dan Bergizi untuk Balita',
    desc: 'Menu sehat setiap hari penting untuk mendukung tumbuh kembang...',
    date: '18 Mei 2026',
    reads: 15,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=200&fit=crop',
  },
  {
    id: 3,
    tag: 'Imunisasi',
    title: 'Jangan Lewatkan Jadwal Imunisasi Anak',
    desc: 'Imunisasi lengkap dapat melindungi anak dari berbagai penyakit berbahaya...',
    date: '1 Mei 2026',
    reads: 20,
    image: 'https://images.unsplash.com/photo-1632053002615-9cc1ade39e95?w=400&h=200&fit=crop',
  },
]

function hitungUsia(tanggalLahir) {
  if (!tanggalLahir) return '-'
  const lahir = new Date(tanggalLahir)
  const sekarang = new Date()
  const bulan = (sekarang.getFullYear() - lahir.getFullYear()) * 12 + (sekarang.getMonth() - lahir.getMonth())
  if (bulan < 12) return bulan + ' Bulan'
  const tahun = Math.floor(bulan / 12)
  const sisaBulan = bulan % 12
  return sisaBulan === 0 ? tahun + ' Tahun' : tahun + ' Tahun ' + sisaBulan + ' Bulan'
}

function formatStatusGizi(s) {
  const map = { gizi_baik: 'Normal', gizi_kurang: 'Kurang', gizi_lebih: 'Lebih', gizi_buruk: 'Buruk', obesitas: 'Obesitas' }
  return map[s] || 'Normal'
}

export default function Dashboard() {
  const [anak, setAnak] = useState(null)
  const [daftarAnak, setDaftarAnak] = useState([])
  const [loadingAnak, setLoadingAnak] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const [user] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('user') || '{}')
    return stored.nama ? stored : { nama: '' }
  })

  useEffect(() => {
    let cancelled = false
    API.get('/balita')
      .then(async (res) => {
        if (cancelled) return
        const list = res.data?.data || []
        setDaftarAnak(list)
        if (list.length === 0) {
          setAnak(null)
          return
        }
        const firstAnak = list[0]
        try {
          const ringkasan = await API.get('/balita/' + firstAnak.id + '/ringkasan')
          const p = ringkasan.data?.data?.pertumbuhan_terakhir
          setAnak({
            ...firstAnak,
            berat_badan: p?.berat_badan ?? null,
            tinggi_badan: p?.tinggi_badan ?? null,
            status_gizi: formatStatusGizi(p?.status_gizi),
            status: 'Sehat',
          })
        } catch {
          setAnak({ ...firstAnak, status: 'Sehat' })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDaftarAnak([])
          setAnak(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAnak(false)
      })
    return () => { cancelled = true }
  }, [])

  const usia = anak ? hitungUsia(anak.tanggal_lahir) : '-'
  const isLakiLaki = anak?.jenis_kelamin === 'L'
  const firstName = anak?.nama?.split(' ')[0] || 'anak Anda'

  return (
    <div style={styles.page}>
      <SharedSidebar activePath="/dashboard" />
      <main style={styles.main}>
        {/* ===== TOP HALF: green background ===== */}
        <div style={styles.greenBand}>
          <GreenHeaderDecorations />
          {/* Top header */}
          <header style={{ ...styles.topHeader, position: 'relative', zIndex: 1 }} className="pc-slide-down">
            <div>
              <h1 style={styles.greeting}>Halo, {user.nama || 'Bunda'}!</h1>
              <p style={styles.subtitle}>Pantau tumbuh kembang {firstName} dengan mudah!</p>
            </div>
            <div style={styles.headerRight}>
              <Link to="/notifikasi" style={styles.notifBtn} aria-label="Notifikasi" className="pc-btn pc-bell">
                <Icon name="bell" size={20} color={colors.brown} />
              </Link>
              <button
                type="button"
                onClick={() => setShowProfile(true)}
                style={{ ...styles.userPill, border: 'none', cursor: 'pointer' }}
                className="pc-btn"
              >
                <div style={styles.userAvatar}>
                  <Icon name="user" size={16} color={colors.white} />
                </div>
                <span style={styles.userName}>
                  {user.nama?.replace(/^Ibu\s+/i, '') || 'User'}
                </span>
              </button>
            </div>
          </header>

          {/* Child profile card — 3 states: loading, empty (no balita registered), loaded */}
          <section style={{ ...styles.childCard, position: 'relative', zIndex: 1 }} className="pc-scale-in pc-delay-1">
            {loadingAnak ? (
              <div style={{ ...styles.childCardInner, justifyContent: 'center', minHeight: 140 }}>
                <span style={{ color: colors.mutedBrown, fontWeight: 700 }}>Memuat data anak...</span>
              </div>
            ) : !anak ? (
              <div style={{ ...styles.childCardInner, flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 24px' }}>
                <div style={styles.childPhoto}>
                  <Icon name="user" size={56} color={colors.green} />
                </div>
                <h2 style={{ ...styles.childName, marginTop: 14 }}>Belum ada data anak terdaftar</h2>
                <p style={{ margin: '8px 0 0', color: colors.mutedBrown, fontSize: 13, maxWidth: 480, lineHeight: 1.5 }}>
                  Akun Anda belum memiliki balita yang terdaftar. Silakan hubungi kader posyandu setempat untuk mendaftarkan anak Anda.
                </p>
              </div>
            ) : (
              <div style={styles.childCardInner}>
                <div style={styles.childPhoto}>
                  <Icon name="user" size={64} color={colors.green} />
                </div>
                <div style={styles.childInfo}>
                  <h2 style={styles.childName}>{anak.nama}</h2>
                  <div style={styles.childTags}>
                    <span style={styles.tagGender}>
                      <CheckSmall /> {isLakiLaki ? 'Laki-laki' : 'Perempuan'}
                    </span>
                    <span style={styles.childAge}>{usia}</span>
                  </div>
                  <span style={styles.tagSehat}>
                    <CheckSmall /> {anak.status || 'Sehat'}
                  </span>
                  {daftarAnak.length > 1 && (
                    <div style={{ marginTop: 10, fontSize: 12, color: colors.mutedBrown, fontWeight: 600 }}>
                      Anda memiliki {daftarAnak.length} anak terdaftar — pilih lewat menu Tumbuh Kembang.
                    </div>
                  )}
                </div>
                <div style={styles.childStats}>
                  <StatItem bg="linear-gradient(135deg, #DEEED8 0%, #CFEBD2 100%)" label="ID Anak" value={anak.nik || '-'} icon={<IdIcon />} />
                  <StatItem bg="linear-gradient(135deg, #FFE0E0 0%, #FFD4D4 100%)" label="Berat Badan" value={anak.berat_badan ? anak.berat_badan + ' kg' : '-'} icon={<WeightIcon />} />
                  <StatItem bg="linear-gradient(135deg, #FFF8D0 0%, #FFF1B8 100%)" label="Tinggi Badan" value={anak.tinggi_badan ? anak.tinggi_badan + ' cm' : '-'} icon={<HeightIcon />} />
                  <StatItem bg="linear-gradient(135deg, #FFEFFA 0%, #FFE0F4 100%)" label="Status Gizi" value={anak.status_gizi || '-'} icon={<NutritionIcon />} />
                </div>
              </div>
            )}
          </section>

          {/* Quick action cards */}
          <section style={{ ...styles.actionsGrid, position: 'relative', zIndex: 1 }}>
            <ActionCard to="/jadwal" iconName="calendar" title="Agenda Posyandu" desc="Lihat Semua agenda posyandu untuk balita anda!" delayClass="pc-delay-2" />
            <ActionCard to="/tumbuh-kembang" iconName="chart" title="Riwayat Pertumbuhan" desc="Pantau perkembangan balita berdasarkan hasil pemeriksaan" delayClass="pc-delay-3" />
            <ActionCard to="/chat" iconName="chat" title="Chat & Konsultasi" desc="Tanyakan seputar tumbuh kembang anak dengan AI!" badge="AI" delayClass="pc-delay-4" />
            <ActionCard to="/rekomendasi" iconName="bookmark" title="Rekomendasi" desc="Dapatkan rekomendasi sesuai kebutuhan anak" delayClass="pc-delay-5" />
          </section>
        </div>

        {/* ===== BOTTOM HALF: pinkish-white background ===== */}
        <div style={styles.pinkBand}>
          <section style={styles.newsSection}>
            <h2 style={styles.newsTitle}>Informasi & Berita</h2>
            <div style={styles.newsGrid}>
              {beritaList.map((b) => <NewsCard key={b.id} berita={b} />)}
            </div>
          </section>
        </div>
      </main>

      {/* Slide-in profile drawer */}
      <ProfilePopup open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}

function StatItem({ bg, label, value, icon }) {
  return (
    <div style={styles.statItem}>
      <div style={{ ...styles.statIconBox, background: bg }}>{icon}</div>
      <div>
        <div style={styles.statLabel}>{label}</div>
        <div style={styles.statValue}>{value}</div>
      </div>
    </div>
  )
}

function ActionCard({ to, iconName, title, desc, badge, delayClass = '' }) {
  return (
    <Link
      to={to}
      style={styles.actionCard}
      className={`pc-slide-up pc-hover-lift ${delayClass}`}
    >
      <div style={styles.actionIconWrap}>
        <div style={styles.actionIconCircle}>
          <Icon name={iconName} size={28} color={colors.green} strokeWidth={1.8} />
        </div>
        {badge && <span style={styles.actionBadge}>{badge}</span>}
      </div>
      <h3 style={styles.actionTitle}>{title}</h3>
      <p style={styles.actionDesc}>{desc}</p>
      <span style={styles.actionArrow} aria-hidden="true">
        <Icon name="arrow-right" size={16} color={colors.white} strokeWidth={2.2} />
      </span>
    </Link>
  )
}

function NewsCard({ berita }) {
  return (
    <article style={styles.newsCard} className="pc-slide-up pc-hover-lift">
      <div style={{ ...styles.newsImage, backgroundImage: 'url(' + berita.image + ')' }} />
      <div style={styles.newsBody}>
        <span style={styles.newsTag}>{berita.tag}</span>
        <h3 style={styles.newsItemTitle}>{berita.title}</h3>
        <p style={styles.newsDesc}>{berita.desc}</p>
        <div style={styles.newsFooter}>
          <span>{berita.date}</span>
          <span>Dibaca oleh {berita.reads} orang</span>
        </div>
      </div>
    </article>
  )
}

function CheckSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IdIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4E724C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="12" r="2" />
      <path d="M7 17c0-1.7 1.3-3 3-3s3 1.3 3 3" />
      <line x1="15" y1="10" x2="19" y2="10" />
      <line x1="15" y1="14" x2="18" y2="14" />
    </svg>
  )
}

function WeightIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E04545" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      <path d="M10 13l2-2 2 2" />
    </svg>
  )
}

function HeightIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C99B1F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2" />
      <path d="M12 8v6M9 14h6M9 21l3-4 3 4" />
      <path d="M4 4v17M4 7h2M4 10h2M4 13h2M4 16h2M4 19h2" />
    </svg>
  )
}

function NutritionIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D65FFA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l5-5 4 4 5-7 4 5" />
      <path d="M3 21h18" />
    </svg>
  )
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: colors.cream, fontFamily: "'Noto Sans', sans-serif" },
  main: { flex: 1, overflowY: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column' },
  // The TOP half of the main area — green band with rich diagonal gradient
  greenBand: {
    background: 'linear-gradient(135deg, #5C8259 0%, #4E724C 45%, #3F633E 100%)',
    padding: '28px 32px 28px',
    boxShadow: '0 4px 20px rgba(63, 99, 62, 0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  // The BOTTOM half — soft pinkish white band with subtle gradient
  pinkBand: {
    background: 'linear-gradient(180deg, #FFF5F8 0%, #FFEBF1 100%)',
    padding: '24px 32px 40px',
    flex: 1,
  },
  topHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: 20, marginBottom: 22, flexWrap: 'wrap',
  },
  // Greeting now sits on green, so flip text to white
  greeting: { margin: 0, fontSize: 'clamp(20px, 1.8vw, 26px)', fontWeight: 800, color: colors.white },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  notifBtn: {
    width: 38, height: 38, borderRadius: '50%', background: colors.tan,
    display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
  },
  userPill: {
    background: colors.tan, borderRadius: 30, padding: '4px 14px 4px 4px',
    display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
  },
  userAvatar: {
    width: 30, height: 30, borderRadius: '50%', background: colors.brown,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userName: { fontWeight: 700, fontSize: 13, color: colors.brown },
  // No more green outer wrapper — the green band behind it already provides the color
  childCard: { marginBottom: 22 },
  childCardInner: {
    position: 'relative',
    // Use cream (light pinkish-white) — matches the "white card" aesthetic
    background: colors.cream,
    borderRadius: 22,
    // Bigger padding makes the card taller and more spacious
    padding: '30px 32px',
    display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  childPhoto: {
    // Bigger photo circle to match the bigger card
    width: 140, height: 140, borderRadius: '50%',
    background: 'linear-gradient(135deg, #F8E8DA 0%, #F2DFD1 60%, #E5CFBC 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, border: '3px solid #CFEBD2',
    boxShadow: '0 6px 18px rgba(101, 80, 64, 0.14)',
  },
  childInfo: { flex: '1 1 220px' },
  childName: { margin: 0, fontSize: 26, fontWeight: 800, color: colors.brown },
  childTags: { display: 'flex', alignItems: 'center', gap: 12, margin: '10px 0', flexWrap: 'wrap' },
  tagGender: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 10px', color: colors.green,
    fontSize: 12, fontWeight: 700, textDecoration: 'underline',
  },
  childAge: { fontSize: 13, color: colors.brown, fontWeight: 600 },
  tagSehat: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '4px 12px', background: colors.greenSoft, color: colors.green,
    borderRadius: 999, fontSize: 12, fontWeight: 700,
  },
  childStats: {
    display: 'flex', gap: 20, flexWrap: 'wrap',
    paddingLeft: 16, borderLeft: '1px dashed ' + colors.tan,
  },
  statItem: { display: 'flex', alignItems: 'center', gap: 10 },
  statIconBox: {
    width: 48, height: 48, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statLabel: { fontSize: 12, color: colors.mutedBrown, fontWeight: 700 },
  statValue: { fontSize: 18, fontWeight: 800, color: colors.brown, marginTop: 2 },
  actionsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16, marginBottom: 28,
  },
  actionCard: {
    position: 'relative',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFAFC 100%)',
    borderRadius: 16,
    padding: '22px 20px 52px', textDecoration: 'none', color: colors.brown,
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
  },
  actionIconWrap: { position: 'relative', marginBottom: 14 },
  actionIconCircle: {
    width: 62, height: 62, borderRadius: '50%',
    background: 'linear-gradient(135deg, #DEEED8 0%, #CFEBD2 70%, #BCDFC0 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(78, 114, 76, 0.15)',
  },
  actionBadge: {
    position: 'absolute', top: -4, right: -8,
    background: 'linear-gradient(135deg, #FFC2EC 0%, #FFAFE5 100%)',
    color: colors.white,
    fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 999,
    boxShadow: '0 2px 6px rgba(255, 175, 229, 0.4)',
  },
  actionTitle: { margin: 0, fontSize: 16, fontWeight: 800, color: colors.brown },
  actionDesc: { margin: '8px 0 0', fontSize: 12, color: colors.mutedBrown, lineHeight: 1.45 },
  actionArrow: {
    position: 'absolute', bottom: 14, right: 14,
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg, #5C8259 0%, #4E724C 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 3px 8px rgba(78, 114, 76, 0.35)',
  },
  newsSection: { marginTop: 8 },
  newsTitle: { margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: colors.green, textAlign: 'left' },
  newsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 },
  newsCard: {
    background: colors.white, borderRadius: 14, overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    display: 'flex', flexDirection: 'column',
  },
  newsImage: {
    height: 140, backgroundSize: 'cover', backgroundPosition: 'center',
    backgroundColor: colors.tan,
  },
  newsBody: { padding: '14px 16px 16px' },
  newsTag: {
    display: 'inline-block', padding: '3px 12px',
    background: 'linear-gradient(135deg, #E2BFFF 0%, #D9A8FF 100%)',
    color: colors.white,
    borderRadius: 999, fontSize: 11, fontWeight: 700, marginBottom: 8,
    boxShadow: '0 2px 6px rgba(217, 168, 255, 0.35)',
  },
  newsItemTitle: { margin: 0, fontSize: 15, fontWeight: 800, color: colors.brown, lineHeight: 1.3 },
  newsDesc: { margin: '8px 0 12px', fontSize: 12, color: colors.mutedBrown, lineHeight: 1.45 },
  newsFooter: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: colors.mutedBrown },
}
