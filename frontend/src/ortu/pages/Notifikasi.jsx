import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'
import { SharedSidebar, Icon, ProfilePopup } from '../components/SidebarLayout'
import { GreenHeaderDecorations, GreenContentDecorations } from '../components/Decorations'

// ─── Warna ───────────────────────────────────────────────────────────────────
const colors = {
  green: '#4E724C',
  greenSoft: '#CFEBD2',
  cream: '#FFF5F8',
  tan: '#F2DFD1',
  brown: '#655040',
  mutedBrown: '#876D5D',
  white: '#FFFFFF',
}

// ─── Nama bulan Indonesia ─────────────────────────────────────────────────────
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

// ─── Data demo notifikasi ─────────────────────────────────────────────────────
// Dipakai kalau API tidak bisa diakses
const demoNotif = [
  {
    id: 1,
    judul: 'Imunisasi Campak',
    tanggalLabel: 'Besok',
    waktuLabel: '08.00 - 12.00 WIB',
    lokasi: 'Posyandu Melati',
    pesan: 'Jangan lupa membawa buku KIA!',
  },
  {
    id: 2,
    judul: 'Imunisasi DPT',
    tanggalLabel: '12 Juli 2026',
    waktuLabel: '09.00 - 12.00 WIB',
    lokasi: 'Posyandu Melati',
    pesan: 'Jangan lupa membawa buku KIA!',
  },
  {
    id: 3,
    judul: 'Posyandu Rutin',
    tanggalLabel: '13 Juli 2026',
    waktuLabel: '08.00 - 12.00 WIB',
    lokasi: 'Posyandu Melati',
    pesan: 'Jangan lupa membawa buku KIA!',
  },
  {
    id: 4,
    judul: 'Imunisasi Polio',
    tanggalLabel: '20 Juli 2026',
    waktuLabel: '08.00 - 12.00 WIB',
    lokasi: 'Posyandu Melati',
    pesan: 'Jangan lupa membawa buku KIA!',
  },
  {
    id: 5,
    judul: 'Pemberian Makanan Tambahan',
    tanggalLabel: '28 Juli 2026',
    waktuLabel: '08.00 - 12.00 WIB',
    lokasi: 'Posyandu Melati',
    pesan: 'Jangan lupa membawa buku KIA!',
  },
  {
    id: 6,
    judul: 'Penyuluhan Kesehatan',
    tanggalLabel: 'Hari Ini',
    waktuLabel: '08.00 - 12.00 WIB',
    lokasi: 'Posyandu Melati',
    pesan: 'Jangan lupa membawa buku KIA!',
  },
]

// ─── Helper: ubah tanggal jadi label "Hari Ini", "Besok", atau "D Bulan YYYY" ─
function formatLabelTanggal(tanggalStr) {
  if (!tanggalStr) return '-'
  const tgl = new Date(tanggalStr)
  if (isNaN(tgl)) return '-'

  const hariIni = new Date()
  hariIni.setHours(0, 0, 0, 0)
  tgl.setHours(0, 0, 0, 0)

  const selisih = tgl - hariIni
  const satuHari = 24 * 60 * 60 * 1000

  if (selisih === 0) return 'Hari Ini'
  if (selisih === satuHari) return 'Besok'
  return `${tgl.getDate()} ${BULAN[tgl.getMonth()]} ${tgl.getFullYear()}`
}

// ─── Helper: format jam "08:00" jadi "08.00 WIB" ────────────────────────────
function formatWaktuLabel(mulai, selesai) {
  const fmt = (w) => (w ? w.substring(0, 5).replace(':', '.') : '--')
  return `${fmt(mulai)} - ${fmt(selesai)} WIB`
}

// ─── Helper: ubah data jadwal dari API jadi format notifikasi ────────────────
function jadwalKeNotif(jadwal) {
  return jadwal.map((j) => ({
    id: j.id,
    judul: j.judul || 'Kegiatan Posyandu',
    tanggalLabel: formatLabelTanggal(j.tanggal),
    waktuLabel: formatWaktuLabel(j.waktu_mulai, j.waktu_selesai),
    lokasi: j.lokasi || 'Posyandu',
    pesan: 'Jangan lupa membawa buku KIA!',
  }))
}

// ════════════════════════════════════════════════════════════════════════════
//  KOMPONEN UTAMA
// ════════════════════════════════════════════════════════════════════════════
export default function Notifikasi() {
  const [notifList, setNotifList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProfile, setShowProfile] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // ── Ambil data: coba /notifikasi dulu, fallback ke /jadwal, lalu demo ──
  useEffect(() => {
    let cancelled = false

    API.get('/jadwal')
      .then((res) => {
        if (cancelled) return
        const list = Array.isArray(res.data) ? res.data : (res.data.data || [])
        // Hanya tampilkan event yang belum lewat
        const mendatang = list.filter((j) => {
          if (!j.tanggal) return false
          const d = new Date(j.tanggal)
          d.setHours(0, 0, 0, 0)
          const hariIni = new Date()
          hariIni.setHours(0, 0, 0, 0)
          return d >= hariIni
        })
        setNotifList(mendatang.length > 0 ? jadwalKeNotif(mendatang) : demoNotif)
      })
      .catch(() => {
        if (!cancelled) setNotifList(demoNotif)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  // ════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={s.page}>
      <SharedSidebar activePath="/notifikasi" />

      <main style={s.main}>
        {/* ── Header hijau ── */}
        <header style={{ ...s.header, position: 'relative', overflow: 'hidden' }}>
          <GreenHeaderDecorations />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={s.headerTitle}>Notifikasi</div>
            <div style={s.headerSubtitle}>
              Lihat pengingat kegiatan posyandu agar tidak melewatkan jadwal anak.
            </div>
          </div>
          <div style={{ ...s.headerRight, position: 'relative', zIndex: 1 }}>
            <Link to="/notifikasi" style={s.bellBtn} aria-label="Notifikasi" className="pc-btn pc-bell">
              <Icon name="bell" size={20} color={colors.brown} />
            </Link>
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

        {/* ── Area konten ── */}
        <section style={{ ...s.contentArea, position: 'relative', overflow: 'hidden' }}>
          <GreenContentDecorations />
          {loading ? (
            <div style={{ ...s.loadingText, position: 'relative', zIndex: 1 }}>Memuat notifikasi...</div>
          ) : notifList.length === 0 ? (
            <div style={{ ...s.kosongWrap, position: 'relative', zIndex: 1 }}>
              <Icon name="bell" size={48} color={colors.cream} />
              <div style={s.kosongTeks}>Belum ada notifikasi saat ini.</div>
            </div>
          ) : (
            <div style={{ ...s.grid, position: 'relative', zIndex: 1 }}>
              {notifList.map((notif, i) => (
                <KartuNotif key={notif.id} notif={notif} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Slide-in profile drawer */}
      <ProfilePopup open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}

// ─── Komponen kartu notifikasi ────────────────────────────────────────────────
function KartuNotif({ notif, index = 0 }) {
  // Cycle through delays 1-6 so even with many cards animation stays snappy
  const delayClass = `pc-delay-${(index % 6) + 1}`
  return (
    <div style={s.kartu} className={`pc-slide-up pc-hover-lift ${delayClass}`}>
      {/* Ikon bel */}
      <div style={s.kartuIkon} className="pc-bell">
        <Icon name="bell" size={28} color={colors.brown} strokeWidth={1.6} />
      </div>

      {/* Konten teks */}
      <div style={s.kartuKonten}>
        <div style={s.kartuJudul}>{notif.judul}</div>
        <div style={s.kartuWaktuRow}>
          <span style={s.kartuTanggal}>{notif.tanggalLabel}</span>
          <span style={s.kartuWaktu}>{notif.waktuLabel}</span>
        </div>
        <div style={s.kartuLokasi}>
          <IkonGedung />
          <span>{notif.lokasi}</span>
        </div>
        <div style={s.kartuPesan}>{notif.pesan}</div>
      </div>
    </div>
  )
}

// ─── Ikon gedung/lokasi kecil ─────────────────────────────────────────────────
function IkonGedung() {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M3 21h18M9 21V7l9-4v18" />
      <path d="M9 7H3v14" />
      <path d="M12 12h.01M12 16h.01M16 12h.01M16 16h.01" />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════════════════════════════════════════
const s = {
  // Layout
  page: {
    width: '100%', minHeight: '100vh',
    fontFamily: "'Noto Sans', sans-serif",
    display: 'flex', background: colors.cream,
  },
  main: {
    flex: 1, minWidth: 0,
    display: 'flex', flexDirection: 'column',
  },

  // Header
  header: {
    background: 'linear-gradient(135deg, #5C8259 0%, #4E724C 50%, #3F633E 100%)',
    padding: '24px 30px',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 20, flexWrap: 'wrap',
    boxShadow: '0 4px 18px rgba(63, 99, 62, 0.18)',
  },
  headerTitle: { fontWeight: 800, fontSize: 26, color: colors.cream },
  headerSubtitle: {
    color: colors.cream, opacity: 0.88,
    fontSize: 13, marginTop: 4, maxWidth: 420,
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  bellBtn: {
    width: 38, height: 38, borderRadius: '50%',
    background: colors.tan, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none', flexShrink: 0,
  },
  userPill: {
    background: colors.tan, borderRadius: 30,
    padding: '4px 14px 4px 4px',
    display: 'flex', alignItems: 'center',
    gap: 8, textDecoration: 'none',
  },
  userAvatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: colors.brown, color: colors.white,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 13, fontWeight: 800,
  },
  userName: { fontWeight: 700, fontSize: 13, color: colors.brown },

  // Konten
  contentArea: {
    flex: 1, padding: '28px 30px',
    background: 'linear-gradient(180deg, #4E724C 0%, #3F633E 100%)',
  },
  loadingText: {
    textAlign: 'center', color: colors.cream,
    padding: 48, fontSize: 15,
  },
  kosongWrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '80px 20px', gap: 16,
  },
  kosongTeks: {
    color: colors.cream, fontSize: 15, fontWeight: 600,
  },

  // Grid 2 kolom
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 18,
  },

  // Kartu notifikasi
  kartu: {
    background: colors.cream,
    borderRadius: 16,
    padding: '20px 22px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
  },
  kartuIkon: {
    width: 52, height: 52, borderRadius: '50%',
    background: 'linear-gradient(135deg, #F8E8DA 0%, #F2DFD1 60%, #E5CFBC 100%)',
    flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(101, 80, 64, 0.15)',
  },
  kartuKonten: { flex: 1, minWidth: 0 },
  kartuJudul: {
    fontWeight: 800, fontSize: 16,
    color: colors.brown, marginBottom: 6,
  },
  kartuWaktuRow: {
    display: 'flex', gap: 14,
    alignItems: 'center', flexWrap: 'wrap',
    marginBottom: 6,
  },
  kartuTanggal: {
    fontSize: 13, fontWeight: 700, color: colors.brown,
  },
  kartuWaktu: {
    fontSize: 13, fontWeight: 600, color: colors.mutedBrown,
  },
  kartuLokasi: {
    display: 'inline-flex', alignItems: 'center',
    gap: 5, fontSize: 12, color: colors.mutedBrown,
    fontWeight: 500, marginBottom: 10,
  },
  kartuPesan: {
    fontWeight: 700, fontSize: 13,
    color: colors.brown,
    paddingTop: 10,
    borderTop: '1px dashed #EDE4DC',
  },
}
