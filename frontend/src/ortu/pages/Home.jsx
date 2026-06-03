import { Link, useNavigate } from 'react-router-dom'

const colors = {
  green: '#4E724C',
  greenDark: '#3F633E',
  brown: '#A08772',
  cream: '#FFF5F8',
  white: '#FFFFFF',
}

// Typical pre-login landing page navigation. These link to anchor sections
// on the home page (you can add the corresponding sections later, e.g. an
// "About" section with id="tentang"). For now they just scroll to top.
const navItems = [
  { label: 'Beranda', to: '#top' },
  { label: 'Tentang', to: '#tentang' },
  { label: 'Layanan', to: '#layanan' },
  { label: 'Kontak', to: '#kontak' },
]

const cards = [
  {
    title: 'Tumbuh Kembang',
    desc: 'Pantau perkembangan berat badan dan tinggi badan anak secara rutin untuk memastikan tumbuh kembang si kecil berjalan dengan optimal.',
    to: '/tumbuh-kembang',
  },
  {
    title: 'Imunisasi',
    desc: 'Pantau riwayat pemberian imunisasi anak secara lengkap serta lihat jadwal vaksin berikutnya agar tidak terjadi keterlambatan dan kesehatan si kecil tetap terjaga dengan baik.',
    to: '/imunisasi',
  },
  {
    title: 'Riwayat Kunjungan',
    desc: 'Lihat dan catat setiap kunjungan balita ke posyandu untuk membantu memantau keaktifan, pemeriksaan rutin, serta perkembangan kesehatan anak secara berkala.',
    to: '/kunjungan',
  },
]

/* ─── Data for the TENTANG (About) section ─── */
const nilaiList = [
  {
    icon: 'shield',
    title: 'Aman & Terpercaya',
    desc: 'Data anak dan keluarga Anda dijaga aman dengan standar keamanan tinggi.',
  },
  {
    icon: 'star',
    title: 'Mudah Digunakan',
    desc: 'Antarmuka sederhana yang dirancang khusus untuk para bunda — siapa saja bisa pakai.',
  },
  {
    icon: 'clock',
    title: 'Pantau Setiap Saat',
    desc: 'Akses riwayat kesehatan dan jadwal posyandu kapan pun, di mana pun.',
  },
  {
    icon: 'heart',
    title: 'Untuk Semua Bunda',
    desc: 'Dirancang untuk membantu setiap keluarga Indonesia menjaga kesehatan balita.',
  },
]

const statsList = [
  { number: '1.200+', label: 'Bunda Aktif' },
  { number: '50+', label: 'Posyandu Mitra' },
  { number: '5K+', label: 'Catatan Tumbuh Kembang' },
  { number: '99%', label: 'Bunda Puas' },
]

/* ─── Data for the LAYANAN (Services) section ─── */
const layananList = [
  {
    icon: 'chart',
    title: 'Tumbuh Kembang',
    desc: 'Grafik berat & tinggi badan anak, status gizi otomatis, dan riwayat lengkap.',
    bg: 'linear-gradient(135deg, #DEEED8 0%, #CFEBD2 100%)',
    color: '#4E724C',
  },
  {
    icon: 'syringe',
    title: 'Imunisasi',
    desc: 'Lihat riwayat vaksin lengkap dan dapatkan pengingat sebelum jadwal vaksin berikutnya.',
    bg: 'linear-gradient(135deg, #FFE0E0 0%, #FFD4D4 100%)',
    color: '#E04545',
  },
  {
    icon: 'calendar',
    title: 'Agenda Posyandu',
    desc: 'Kalender kegiatan posyandu lengkap dengan filter jenis kegiatan dan detail lokasi.',
    bg: 'linear-gradient(135deg, #FFF8D0 0%, #FFF1B8 100%)',
    color: '#C99B1F',
  },
  {
    icon: 'bell',
    title: 'Notifikasi & Pengingat',
    desc: 'Tidak ada lagi jadwal terlewat — sistem pengingat otomatis untuk semua kegiatan posyandu.',
    bg: 'linear-gradient(135deg, #FFEFFA 0%, #FFE0F4 100%)',
    color: '#D65FFA',
  },
  {
    icon: 'chat',
    title: 'Chat AI Konsultasi',
    desc: 'Tanyakan apapun seputar tumbuh kembang anak dengan asisten AI yang siap 24/7.',
    bg: 'linear-gradient(135deg, #DEEED8 0%, #CFEBD2 100%)',
    color: '#4E724C',
  },
  {
    icon: 'bookmark',
    title: 'Rekomendasi Personal',
    desc: 'Saran personal seputar gizi, stimulasi, dan kesehatan berdasarkan usia anak Anda.',
    bg: 'linear-gradient(135deg, #FFE0E0 0%, #FFD4D4 100%)',
    color: '#E04545',
  },
]

/* ─── Data for the KONTAK (Contact) section ─── */
const kontakList = [
  { icon: 'mail', label: 'Email', value: 'halo@posyanduceria.id' },
  { icon: 'phone', label: 'Telepon', value: '+62 812 3456 7890' },
  { icon: 'pin', label: 'Alamat', value: 'Jl. Posyandu Sehat No. 12, Jakarta' },
  { icon: 'clock', label: 'Jam Operasional', value: 'Senin – Jumat, 08.00 – 17.00 WIB' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={styles.page} className="pc-fade-in">
      {/* ============================================================
          GREEN BAND
          - Decorative background SVGs (blobs + floating icons)
          - Top navbar pinned at the top
          - Intro text centered vertically in remaining space
          ============================================================ */}
      <div style={styles.greenBand}>

        {/* ── Decorative background elements (purely visual, no interaction) ── */}
        <div style={styles.decorations} aria-hidden="true">
          {/* Soft glowing blobs for ambient depth */}
          <div style={{
            ...styles.blob,
            top: '10%', left: '4%', width: 280, height: 280,
            background: 'radial-gradient(circle, rgba(207,235,210,0.45), transparent 70%)',
          }} className="pc-float-slow" />
          <div style={{
            ...styles.blob,
            top: '40%', right: '6%', width: 340, height: 340,
            background: 'radial-gradient(circle, rgba(255,245,248,0.30), transparent 70%)',
          }} className="pc-float" />
          <div style={{
            ...styles.blob,
            bottom: '15%', left: '30%', width: 220, height: 220,
            background: 'radial-gradient(circle, rgba(255,234,238,0.25), transparent 70%)',
          }} className="pc-float-delay" />

          {/* Floating heart icons — symbolic of care & family */}
          <FloatingHeart style={{ top: '18%', left: '12%' }} size={28} delayClass="pc-float-slow" />
          <FloatingHeart style={{ top: '70%', left: '8%' }} size={20} delayClass="pc-float" />
          <FloatingHeart style={{ top: '25%', right: '14%' }} size={22} delayClass="pc-float-delay" />

          {/* Sparkles for extra visual interest */}
          <FloatingSparkle style={{ top: '55%', left: '20%' }} size={18} delayClass="pc-float" />
          <FloatingSparkle style={{ top: '15%', right: '28%' }} size={16} delayClass="pc-float-slow" />

          {/* Large baby+parent silhouette in the bottom-right corner (very subtle) */}
          <ParentBabySilhouette />
        </div>

        {/* ── Real content sits ABOVE the decorations (zIndex 1) ── */}

        {/* Navbar pinned to the top */}
        <header style={styles.headerRow} className="pc-slide-down">
          <button
            type="button"
            onClick={() => navigate('/home')}
            style={styles.brandBtn}
            aria-label="Ke beranda"
            className="pc-btn"
          >
            PosyanduCeria
          </button>

          <div style={styles.rightSide}>
            <nav style={styles.nav} aria-label="Menu utama">
              {navItems.map((item) => (
                // Plain <a> for anchor links — lets the browser handle the
                // native smooth scroll. React Router's <Link> would update
                // the URL but skip the scroll.
                <a
                  key={item.label}
                  href={item.to}
                  className="pc-btn"
                  style={styles.navLink}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Login / Sign Up CTA button in top-right — always goes to /login */}
            <Link
              to="/login"
              className="pc-btn pc-focusable"
              style={styles.authBtn}
            >
              Masuk / Daftar
            </Link>
          </div>
        </header>

        {/* Intro text — centered vertically in the remaining green space */}
        <div style={styles.introWrap}>
          <p style={styles.introText} className="pc-slide-up pc-delay-2">
            Posyandu Ceria hadir untuk membantu bunda memantau kesehatan dan tumbuh
            kembang si kecil dengan lebih mudah, praktis, dan terorganisir setiap
            harinya.
          </p>
        </div>
      </div>

      {/* ============================================================
          PINK BAND with 3 feature cards
          ============================================================ */}
      <div style={styles.pinkBand}>
        <div style={styles.cardsGrid}>
          {cards.map((card, i) => (
            <Link
              key={card.title}
              to={card.to}
              style={styles.card}
              className={`pc-slide-up pc-delay-${i + 2} pc-hover-lift`}
            >
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardDesc}>{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ============================================================
          TENTANG (About) Section
          ============================================================ */}
      <section id="tentang" style={styles.tentangSection}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionHeading}>
            <span style={styles.eyebrow}>Tentang Kami</span>
            <h2 style={styles.sectionTitle}>Hadir Untuk Mendampingi Setiap Bunda</h2>
            <p style={styles.sectionLead}>
              PosyanduCeria adalah aplikasi pendamping orang tua untuk memantau
              kesehatan dan tumbuh kembang balita. Kami percaya setiap anak
              berhak tumbuh sehat — dan setiap bunda berhak punya alat yang
              memudahkan, bukan menyulitkan.
            </p>
          </div>

          <div style={styles.valuesGrid}>
            {nilaiList.map((nilai, i) => (
              <div
                key={nilai.title}
                style={styles.valueCard}
                className={`pc-slide-up pc-delay-${i + 1} pc-hover-lift`}
              >
                <div style={styles.valueIconWrap}>
                  <ValueIcon name={nilai.icon} />
                </div>
                <h3 style={styles.valueTitle}>{nilai.title}</h3>
                <p style={styles.valueDesc}>{nilai.desc}</p>
              </div>
            ))}
          </div>

          <div style={styles.statsRow}>
            {statsList.map((stat, i) => (
              <div
                key={stat.label}
                style={styles.statBox}
                className={`pc-scale-in pc-delay-${i + 2}`}
              >
                <div style={styles.statNumber}>{stat.number}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          LAYANAN (Services) Section
          ============================================================ */}
      <section id="layanan" style={styles.layananSection}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionHeading}>
            <span style={styles.eyebrow}>Layanan</span>
            <h2 style={styles.sectionTitle}>Semua Yang Bunda Butuhkan</h2>
            <p style={styles.sectionLead}>
              Fitur lengkap untuk memantau setiap tahap perjalanan si kecil,
              dari penimbangan rutin sampai konsultasi dengan AI.
            </p>
          </div>

          <div style={styles.layananGrid}>
            {layananList.map((item, i) => (
              <div
                key={item.title}
                style={styles.layananCard}
                className={`pc-slide-up pc-delay-${(i % 6) + 1} pc-hover-lift`}
              >
                <div style={{ ...styles.layananIcon, background: item.bg }}>
                  <ServiceIcon name={item.icon} color={item.color} />
                </div>
                <h3 style={styles.layananTitle}>{item.title}</h3>
                <p style={styles.layananDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          KONTAK (Contact) Section
          ============================================================ */}
      <section id="kontak" style={styles.kontakSection}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
          <div className="pc-float-slow" style={{
            position: 'absolute', top: '10%', left: '6%',
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(207,235,210,0.30), transparent 70%)',
            filter: 'blur(40px)',
          }} />
          <div className="pc-float" style={{
            position: 'absolute', bottom: '15%', right: '8%',
            width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,245,248,0.25), transparent 70%)',
            filter: 'blur(40px)',
          }} />
        </div>

        <div style={{ ...styles.sectionInner, position: 'relative', zIndex: 1 }}>
          <div style={{ ...styles.sectionHeading, color: '#FFFFFF' }}>
            <span style={{ ...styles.eyebrow, color: '#CFEBD2' }}>Hubungi Kami</span>
            <h2 style={{ ...styles.sectionTitle, color: '#FFFFFF' }}>Punya Pertanyaan?</h2>
            <p style={{ ...styles.sectionLead, color: 'rgba(255,255,255,0.85)' }}>
              Tim kami siap membantu. Hubungi kami lewat saluran berikut atau
              kirim pesan langsung.
            </p>
          </div>

          <div style={styles.kontakLayout}>
            {/* Left: contact info */}
            <div style={styles.kontakInfo}>
              {kontakList.map((k, i) => (
                <div
                  key={k.label}
                  style={styles.kontakItem}
                  className={`pc-slide-up pc-delay-${i + 1} pc-hover-lift`}
                >
                  <div style={styles.kontakIcon}>
                    <ContactIcon name={k.icon} />
                  </div>
                  <div>
                    <div style={styles.kontakLabel}>{k.label}</div>
                    <div style={styles.kontakValue}>{k.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: contact form */}
            <form
              style={styles.kontakForm}
              className="pc-scale-in pc-delay-2"
              onSubmit={(e) => {
                e.preventDefault()
                alert('Terima kasih! Pesan Anda sudah kami terima dan akan kami balas via email.')
                e.target.reset()
              }}
            >
              <div style={styles.formField}>
                <label style={styles.formLabel}>Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Anda..."
                  className="pc-input"
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="email@contoh.com"
                  className="pc-input"
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Pesan</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tulis pesan Anda..."
                  className="pc-input"
                  style={{ ...styles.formInput, resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="pc-btn pc-focusable" style={styles.formButton}>
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <div style={styles.footerBrandName}>PosyanduCeria</div>
            <p style={styles.footerTagline}>
              Bersama posyandu, wujudkan generasi sehat dan cerdas sejak dini.
            </p>
          </div>
          <div style={styles.footerCol}>
            <div style={styles.footerColTitle}>Tautan Cepat</div>
            <a href="#tentang" style={styles.footerLink}>Tentang Kami</a>
            <a href="#layanan" style={styles.footerLink}>Layanan</a>
            <a href="#kontak" style={styles.footerLink}>Kontak</a>
          </div>
          <div style={styles.footerCol}>
            <div style={styles.footerColTitle}>Akun</div>
            <Link to="/login" style={styles.footerLink}>Masuk</Link>
            <Link to="/login" style={styles.footerLink}>Daftar</Link>
          </div>
        </div>
        <div style={styles.footerBottom}>
          © {new Date().getFullYear()} PosyanduCeria. Dibuat dengan ❤️ untuk para Bunda di Indonesia.
        </div>
      </footer>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   DECORATIVE SUB-COMPONENTS
   These are small SVG icons that float around in the green band background.
   All low-opacity so they don't distract from the real content.
   ──────────────────────────────────────────────────────────────────────────── */

function FloatingHeart({ style, size = 24, delayClass = 'pc-float' }) {
  return (
    <svg
      className={delayClass}
      style={{ ...styles.floatIcon, ...style }}
      width={size} height={size} viewBox="0 0 24 24"
      fill="rgba(255, 255, 255, 0.22)"
      stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function FloatingSparkle({ style, size = 18, delayClass = 'pc-float' }) {
  return (
    <svg
      className={delayClass}
      style={{ ...styles.floatIcon, ...style }}
      width={size} height={size} viewBox="0 0 24 24"
      fill="rgba(255, 255, 255, 0.30)"
    >
      <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"/>
    </svg>
  )
}

/* ─── Icons used in the TENTANG value cards ─── */
function ValueIcon({ name }) {
  const common = {
    width: 28, height: 28, viewBox: '0 0 24 24',
    fill: 'none', stroke: '#4E724C', strokeWidth: 2,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  switch (name) {
    case 'shield':
      return <svg {...common}><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z"/><path d="m9 12 2 2 4-4"/></svg>
    case 'star':
      return <svg {...common}><path d="M12 2 15 9l7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    case 'heart':
      return <svg {...common}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    default: return null
  }
}

/* ─── Icons used in the LAYANAN service cards ─── */
function ServiceIcon({ name, color = '#4E724C' }) {
  const common = {
    width: 30, height: 30, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth: 2,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  switch (name) {
    case 'chart':
      return <svg {...common}><path d="M4 19V5"/><path d="M4 19h17"/><path d="m7 14 3-3 3 2 5-6"/></svg>
    case 'syringe':
      return <svg {...common}><path d="m18 2 4 4"/><path d="m17 7 2-2"/><path d="M6 18 18 6"/><path d="m8 8 8 8"/><path d="m5 19-3 3"/><path d="M9 15 5 11"/></svg>
    case 'calendar':
      return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>
    case 'bell':
      return <svg {...common}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/></svg>
    case 'chat':
      return <svg {...common}><path d="M21 12a8 8 0 0 1-8 8 8 8 0 0 1-3.6-.86L3 20l1.2-4.5A8 8 0 0 1 4 12a8 8 0 0 1 8-8h1a8 8 0 0 1 8 8z"/></svg>
    case 'bookmark':
      return <svg {...common}><path d="M5 3h14a1 1 0 0 1 1 1v17l-4-2.5-4 2.5-4-2.5-4 2.5V4a1 1 0 0 1 1-1z"/></svg>
    default: return null
  }
}

/* ─── Icons used in the KONTAK info row ─── */
function ContactIcon({ name }) {
  const common = {
    width: 22, height: 22, viewBox: '0 0 24 24',
    fill: 'none', stroke: '#4E724C', strokeWidth: 2,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  switch (name) {
    case 'mail':
      return <svg {...common}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
    case 'phone':
      return <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    case 'pin':
      return <svg {...common}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    default: return null
  }
}

function ParentBabySilhouette() {
  // Stylized parent holding baby — abstract simplified shapes for safety.
  // Sits in the bottom-right corner of the green band with very low opacity.
  return (
    <svg
      style={{
        position: 'absolute',
        bottom: 10, right: 30,
        width: 'clamp(120px, 18vw, 220px)',
        height: 'auto',
        opacity: 0.14,
        pointerEvents: 'none',
      }}
      viewBox="0 0 200 200" fill="rgba(255,255,255,1)"
      aria-hidden="true"
    >
      {/* Parent body (rounded shape) */}
      <path d="M100 90c-22 0-40 18-40 40v60h80v-60c0-22-18-40-40-40z"/>
      {/* Parent head */}
      <circle cx="100" cy="55" r="22"/>
      {/* Baby body in arms */}
      <ellipse cx="130" cy="125" rx="22" ry="18"/>
      {/* Baby head */}
      <circle cx="148" cy="115" r="11"/>
      {/* Parent arm wrapping baby */}
      <path d="M70 110c0-8 6-15 15-18l30-5c8-1 15 4 17 12s-3 16-11 18l-30 5c-12 2-21-3-21-12z" opacity="0.85"/>
    </svg>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */

const styles = {
  page: {
    minHeight: '100vh',
    background: colors.cream,
    fontFamily: "'Noto Sans', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  greenBand: {
    position: 'relative', // anchor for absolutely-positioned decorations
    overflow: 'hidden',   // crop any decorations that overflow the band
    background: 'linear-gradient(135deg, #5C8259 0%, #4E724C 50%, #3F633E 100%)',
    padding: '20px 48px clamp(110px, 16vh, 170px)',
    boxShadow: '0 4px 20px rgba(63, 99, 62, 0.15)',
    // Slightly less than full screen so the brown feature cards peek up
    // clearly at the bottom — gives the user a clear visual hint to scroll.
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  },
  // Absolute-positioned layer that contains all decorations
  decorations: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(30px)',
    pointerEvents: 'none',
  },
  floatIcon: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  headerRow: {
    position: 'relative',  // sit above decorations
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    flexWrap: 'wrap',
  },
  brandBtn: {
    background: 'transparent',
    border: 'none',
    color: colors.white,
    fontSize: 22,
    fontWeight: 800,
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
  },
  // Right side of header holds nav + login button
  rightSide: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(16px, 2vw, 28px)',
    flexWrap: 'wrap',
  },
  nav: {
    display: 'flex',
    gap: 'clamp(18px, 2.6vw, 36px)',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  navLink: {
    color: colors.white,
    textDecoration: 'none',
    fontSize: 'clamp(13px, 1.05vw, 15px)',
  },
  // The "Masuk / Daftar" CTA button
  authBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'linear-gradient(135deg, #FFF5F8 0%, #FFEAF1 100%)',
    color: colors.green,
    padding: '9px 20px',
    borderRadius: 30,
    fontSize: 13,
    fontWeight: 800,
    textDecoration: 'none',
    border: '2px solid rgba(255, 255, 255, 0.6)',
    boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
    whiteSpace: 'nowrap',
  },
  // Wrapper that centers intro text in remaining vertical space
  introWrap: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 0',
  },
  introText: {
    color: colors.white,
    fontWeight: 700,
    fontSize: 'clamp(16px, 1.55vw, 20px)',
    textAlign: 'center',
    maxWidth: 760,
    margin: 0,
    lineHeight: 1.55,
    textShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  pinkBand: {
    background: 'linear-gradient(180deg, #FFF5F8 0%, #FFEBF1 100%)',
    flex: '0 0 auto',
    padding: '0 48px 60px',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 24,
    maxWidth: 1100,
    margin: '0 auto',
    marginTop: 'clamp(-90px, -12vh, -70px)',
  },
  card: {
    background: 'linear-gradient(135deg, #B59B85 0%, #A08772 55%, #876D5D 100%)',
    borderRadius: 16,
    padding: '24px 22px 28px',
    color: colors.white,
    textDecoration: 'none',
    boxShadow: '0 10px 24px rgba(101, 80, 64, 0.25)',
    display: 'block',
  },
  cardTitle: {
    margin: '0 0 14px',
    fontSize: 20,
    fontWeight: 800,
    textAlign: 'center',
  },
  cardDesc: {
    margin: 0,
    fontSize: 13.5,
    lineHeight: 1.55,
    textAlign: 'center',
    fontWeight: 500,
  },

  /* ───── Shared section helpers ───── */
  sectionInner: {
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },
  sectionHeading: {
    textAlign: 'center',
    maxWidth: 720,
    margin: '0 auto 48px',
  },
  eyebrow: {
    display: 'inline-block',
    color: '#4E724C',
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    background: '#CFEBD2',
    padding: '4px 14px',
    borderRadius: 999,
    marginBottom: 14,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 'clamp(24px, 2.8vw, 36px)',
    fontWeight: 800,
    color: '#3F633E',
    lineHeight: 1.2,
  },
  sectionLead: {
    margin: '14px 0 0',
    fontSize: 'clamp(14px, 1.15vw, 16px)',
    color: '#876D5D',
    lineHeight: 1.7,
  },

  /* ───── TENTANG section ───── */
  tentangSection: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F8 100%)',
    padding: 'clamp(60px, 8vh, 90px) clamp(24px, 4vw, 48px)',
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: 22,
    marginBottom: 56,
  },
  valueCard: {
    background: '#FFFFFF',
    borderRadius: 16,
    padding: '26px 22px',
    boxShadow: '0 6px 20px rgba(78,114,76,0.08)',
    textAlign: 'center',
    border: '1px solid rgba(78,114,76,0.06)',
  },
  valueIconWrap: {
    width: 64, height: 64, borderRadius: '50%',
    background: 'linear-gradient(135deg, #DEEED8 0%, #CFEBD2 70%, #BCDFC0 100%)',
    margin: '0 auto 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(78,114,76,0.18)',
  },
  valueTitle: {
    margin: '0 0 8px',
    fontSize: 16,
    fontWeight: 800,
    color: '#3F633E',
  },
  valueDesc: {
    margin: 0,
    fontSize: 13,
    color: '#876D5D',
    lineHeight: 1.55,
  },

  /* ───── Stats row ───── */
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 18,
    background: 'linear-gradient(135deg, #5C8259 0%, #4E724C 50%, #3F633E 100%)',
    borderRadius: 20,
    padding: '32px 28px',
    boxShadow: '0 10px 30px rgba(78,114,76,0.2)',
  },
  statBox: {
    textAlign: 'center',
    color: '#FFFFFF',
  },
  statNumber: {
    fontSize: 'clamp(28px, 3vw, 36px)',
    fontWeight: 800,
    color: '#FFFFFF',
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontWeight: 600,
  },

  /* ───── LAYANAN section ───── */
  layananSection: {
    background: 'linear-gradient(180deg, #FFF5F8 0%, #FFEBF1 100%)',
    padding: 'clamp(60px, 8vh, 90px) clamp(24px, 4vw, 48px)',
  },
  layananGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 22,
  },
  layananCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFAFC 100%)',
    borderRadius: 18,
    padding: '28px 24px',
    boxShadow: '0 6px 22px rgba(101, 80, 64, 0.1)',
    border: '1px solid rgba(101, 80, 64, 0.05)',
  },
  layananIcon: {
    width: 56, height: 56, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
  },
  layananTitle: {
    margin: '0 0 10px',
    fontSize: 18,
    fontWeight: 800,
    color: '#3F633E',
  },
  layananDesc: {
    margin: 0,
    fontSize: 13.5,
    color: '#876D5D',
    lineHeight: 1.6,
  },

  /* ───── KONTAK section ───── */
  kontakSection: {
    position: 'relative',
    background: 'linear-gradient(135deg, #5C8259 0%, #4E724C 50%, #3F633E 100%)',
    padding: 'clamp(60px, 8vh, 90px) clamp(24px, 4vw, 48px)',
    overflow: 'hidden',
  },
  kontakLayout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 36,
    alignItems: 'start',
  },
  kontakInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  kontakItem: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
  },
  kontakIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: 'linear-gradient(135deg, #DEEED8 0%, #CFEBD2 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  kontakLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#876D5D',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  kontakValue: {
    fontSize: 14.5,
    fontWeight: 700,
    color: '#3F633E',
    marginTop: 2,
  },

  /* ───── Contact form ───── */
  kontakForm: {
    background: 'rgba(255,255,255,0.97)',
    borderRadius: 18,
    padding: 'clamp(20px, 3vw, 30px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
  },
  formLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: '#3F633E',
    marginBottom: 6,
  },
  formInput: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: '1px solid #E0D4CC',
    background: '#FFF5F8',
    color: '#655040',
    fontSize: 14,
    fontFamily: "'Noto Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  },
  formButton: {
    marginTop: 8,
    padding: '13px 24px',
    border: 'none',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #5C8259 0%, #4E724C 100%)',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily: "'Noto Sans', sans-serif",
    boxShadow: '0 6px 18px rgba(78,114,76,0.35)',
  },

  /* ───── Footer ───── */
  footer: {
    background: 'linear-gradient(180deg, #3F633E 0%, #2F4F2E 100%)',
    color: '#CFEBD2',
    padding: 'clamp(40px, 5vh, 60px) clamp(24px, 4vw, 48px) 0',
  },
  footerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: 36,
    paddingBottom: 32,
    borderBottom: '1px solid rgba(255,255,255,0.12)',
  },
  footerBrand: {
    maxWidth: 360,
  },
  footerBrandName: {
    color: '#FFFFFF',
    fontWeight: 800,
    fontSize: 22,
    marginBottom: 10,
  },
  footerTagline: {
    margin: 0,
    fontSize: 13.5,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.7)',
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  footerColTitle: {
    color: '#FFFFFF',
    fontWeight: 800,
    fontSize: 14,
    marginBottom: 6,
  },
  footerLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: 13.5,
    transition: 'color 0.2s ease',
  },
  footerBottom: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px 0',
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },
}
