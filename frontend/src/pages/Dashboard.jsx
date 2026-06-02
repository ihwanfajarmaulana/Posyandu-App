import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api'

const menuCards = [
  {
    title: 'Data Balita',
    desc: 'Kelola identitas balita, data ibu, usia, dan informasi dasar anak.',
    icon: '👶',
    to: '/daftar-balita',
  },
  {
    title: 'Kunjungan',
    desc: 'Catat dan lihat riwayat kunjungan posyandu secara teratur.',
    icon: '🏥',
    to: '/riwayatkunjungan',
  },
  {
    title: 'Jadwal Posyandu',
    desc: 'Pantau agenda kegiatan dan jadwal layanan posyandu.',
    icon: '📅',
    to: '/jadwal',
  },
  {
    title: 'Tumbuh Kembang',
    desc: 'Lihat data berat badan, tinggi badan, dan status pertumbuhan anak.',
    icon: '📈',
    to: '/tumbuh-kembang',
  },
  {
    title: 'Imunisasi',
    desc: 'Kelola riwayat imunisasi balita agar data vaksin tetap lengkap.',
    icon: '💉',
    to: '/imunisasi',
  },
  {
    title: 'Penanganan',
    desc: 'Buat catatan penanganan dan rekomendasi untuk orang tua.',
    icon: '📝',
    to: '/penanganan-rekomendasi',
  },
]

const quickActions = [
  { label: 'Tambah Balita', icon: '＋', to: '/tambah-balita' },
  { label: 'Catat Kunjungan', icon: '✍️', to: '/catatkunjungan' },
  { label: 'Cek Jadwal', icon: '📅', to: '/jadwal' },
  { label: 'Laporan', icon: '📊', to: '/rekap-penimbangan' },
]

const focusItems = [
  {
    icon: '🌱',
    title: 'Pantau tumbuh kembang',
    desc: 'Cek data pertumbuhan terakhir untuk melihat balita yang perlu perhatian.',
  },
  {
    icon: '✅',
    title: 'Lengkapi data kunjungan',
    desc: 'Pastikan pencatatan kunjungan hari ini sudah tersimpan dengan benar.',
  },
  {
    icon: '💉',
    title: 'Periksa imunisasi',
    desc: 'Lihat riwayat imunisasi agar jadwal vaksin anak tetap terpantau.',
  },
]

export default function Dashboard() {
  const navigate = useNavigate()

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const [stats, setStats] = useState({
    balita: 0,
    kunjungan: 0,
    jadwal: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const getTotal = (response) => {
      const payload = response?.data

      if (typeof payload?.total === 'number') return payload.total
      if (Array.isArray(payload?.data)) return payload.data.length
      if (Array.isArray(payload)) return payload.length

      return 0
    }

    const loadStats = async () => {
      try {
        const [balitaRes, kunjunganRes, jadwalRes] = await Promise.allSettled([
          API.get('/balita?limit=100'),
          API.get('/kunjungan?limit=100'),
          API.get('/jadwal?limit=100'),
        ])

        if (!mounted) return

        setStats({
          balita: balitaRes.status === 'fulfilled' ? getTotal(balitaRes.value) : 0,
          kunjungan: kunjunganRes.status === 'fulfilled' ? getTotal(kunjunganRes.value) : 0,
          jadwal: jadwalRes.status === 'fulfilled' ? getTotal(jadwalRes.value) : 0,
        })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadStats()

    return () => {
      mounted = false
    }
  }, [])

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="pegawai-dashboard">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => navigate('/dashboard')}>
          <span>P</span>
          PosyanduCeria
        </button>

        <nav className="topnav">
          <Link to="/daftar-balita">Data Balita</Link>
          <Link to="/riwayatkunjungan">Kunjungan</Link>
          <Link to="/tumbuh-kembang">Tumbuh Kembang</Link>
          <Link to="/imunisasi">Imunisasi</Link>
          <Link to="/rekap-penimbangan">Laporan</Link>
        </nav>

        <div className="top-actions">
          <button type="button" className="profile-btn" onClick={() => navigate('/profil')}>
            👤 {user?.nama || user?.name || 'Pegawai'}
          </button>

          <button type="button" className="logout-btn" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Dashboard Pegawai</span>

            <h1>
              Selamat datang,
              <br />
              {user?.nama || user?.name || 'Pegawai Posyandu'} 👋
            </h1>

            <p>
              Pantau data balita, kunjungan, jadwal, imunisasi, tumbuh kembang,
              penanganan, dan laporan posyandu dari satu halaman kerja yang rapi.
            </p>

            <div className="hero-meta">
              <span>📅 {today}</span>
              <span>🌿 Posyandu Digital</span>
              <span>✨ Data lebih tertata</span>
            </div>

            <div className="hero-buttons">
              <Link to="/daftar-balita" className="primary-action">
                Mulai Kelola Data
              </Link>

              <Link to="/catatkunjungan" className="secondary-action">
                Catat Kunjungan
              </Link>
            </div>
          </div>

          <aside className="summary-panel">
            <div className="panel-head">
              <div>
                <span>Ringkasan Sistem</span>
                <h2>Monitoring Posyandu</h2>
              </div>

              <div className="panel-icon">👩‍⚕️</div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span>Data Balita</span>
                <strong>{loading ? '...' : stats.balita}</strong>
                <p>Total anak tersimpan</p>
              </div>

              <div className="stat-card">
                <span>Kunjungan</span>
                <strong>{loading ? '...' : stats.kunjungan}</strong>
                <p>Riwayat layanan</p>
              </div>

              <div className="stat-card">
                <span>Jadwal</span>
                <strong>{loading ? '...' : stats.jadwal}</strong>
                <p>Agenda aktif</p>
              </div>
            </div>

            <div className="quick-panel">
              <div className="section-mini">
                <h3>Akses Cepat</h3>
                <span>Menu yang sering digunakan</span>
              </div>

              <div className="quick-grid">
                {quickActions.map((item) => (
                  <Link key={item.label} to={item.to} className="quick-item">
                    <span>{item.icon}</span>
                    <b>{item.label}</b>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="section-heading">
          <div>
            <span>Menu Kerja</span>
            <h2>Fitur pegawai posyandu</h2>
          </div>

          <p>
            Pilih fitur sesuai pekerjaan yang ingin dilakukan. Setiap menu dibuat
            untuk membantu pencatatan dan pemantauan data posyandu.
          </p>
        </section>

        <section className="menu-grid">
          {menuCards.map((item) => (
            <Link key={item.title} to={item.to} className="menu-card">
              <div className="menu-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <strong>Buka fitur →</strong>
            </Link>
          ))}
        </section>

        <section className="lower-grid">
          <div className="focus-card">
            <div className="section-mini big">
              <span>Prioritas Hari Ini</span>
              <h2>Yang perlu diperhatikan</h2>
            </div>

            <div className="focus-list">
              {focusItems.map((item) => (
                <div key={item.title} className="focus-item">
                  <div>{item.icon}</div>
                  <section>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </section>
                </div>
              ))}
            </div>
          </div>

          <div className="note-card">
            <span>Catatan</span>
            <h2>Dashboard ini khusus pegawai</h2>
            <p>
              Gunakan dashboard ini setelah login untuk mengelola aktivitas
              posyandu. Untuk halaman awal pengguna, gunakan landing page
              sebelum login.
            </p>

            <Link to="/penanganan-rekomendasi">
              Lihat penanganan balita →
            </Link>
          </div>
        </section>
      </main>

      <style>{`
        .pegawai-dashboard {
          min-height: 100vh;
          background:
            radial-gradient(circle at 8% 0%, rgba(244, 214, 198, 0.78), transparent 30%),
            radial-gradient(circle at 92% 8%, rgba(207, 233, 211, 0.86), transparent 32%),
            linear-gradient(135deg, #FFF9F4 0%, #F8FCF6 48%, #F8F0E8 100%);
          color: #1E3024;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow-x: hidden;
        }

        .topbar,
        .dashboard-content {
          width: calc(100% - 88px);
          margin: 0 auto;
        }

        .topbar {
          min-height: 88px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          position: relative;
          z-index: 5;
        }

        .brand {
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #2F613B;
          font-size: 24px;
          font-weight: 750;
          letter-spacing: -0.8px;
          font-family: inherit;
          cursor: pointer;
          white-space: nowrap;
        }

        .brand span {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          background: #2F613B;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          box-shadow: 0 14px 30px rgba(47, 97, 59, 0.22);
        }

        .topnav {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .topnav a {
          text-decoration: none;
          color: #3A5A41;
          font-size: 13px;
          font-weight: 560;
          padding: 9px 13px;
          border-radius: 999px;
          transition: 0.22s ease;
        }

        .topnav a:hover {
          background: rgba(47, 97, 59, 0.08);
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .profile-btn,
        .logout-btn {
          border: none;
          min-height: 40px;
          padding: 0 16px;
          border-radius: 999px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 620;
          cursor: pointer;
          white-space: nowrap;
        }

        .profile-btn {
          background: rgba(255, 255, 255, 0.88);
          color: #2F613B;
          box-shadow: 0 10px 24px rgba(48, 72, 52, 0.08);
        }

        .logout-btn {
          background: #2F613B;
          color: white;
          box-shadow: 0 10px 24px rgba(47, 97, 59, 0.16);
        }

        .dashboard-content {
          padding: 20px 0 76px;
        }

        .hero {
          min-height: 620px;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(420px, 0.78fr);
          gap: 56px;
          align-items: center;
          border-radius: 40px;
          padding: 64px 72px;
          box-sizing: border-box;
          background:
            linear-gradient(135deg, rgba(56, 103, 66, 0.98), rgba(35, 72, 44, 0.98)),
            linear-gradient(135deg, #356B43, #24462D);
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 34px 90px rgba(38, 76, 45, 0.25);
        }

        .hero::before {
          content: '';
          width: 620px;
          height: 620px;
          border-radius: 999px;
          position: absolute;
          right: -240px;
          top: -270px;
          background: rgba(255, 255, 255, 0.10);
        }

        .hero::after {
          content: '';
          width: 380px;
          height: 380px;
          border-radius: 999px;
          position: absolute;
          left: 45%;
          bottom: -230px;
          background: rgba(244, 214, 198, 0.17);
        }

        .hero-copy,
        .summary-panel {
          position: relative;
          z-index: 2;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          padding: 0 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
          color: #FFE8DA;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .hero-copy h1 {
          max-width: 960px;
          margin: 0;
          font-size: clamp(52px, 5vw, 82px);
          line-height: 1.03;
          letter-spacing: -2.8px;
          font-weight: 850;
        }

        .hero-copy p {
          max-width: 820px;
          margin: 25px 0 0;
          color: rgba(255, 255, 255, 0.84);
          font-size: 18px;
          line-height: 1.75;
          font-weight: 450;
        }

        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 28px;
        }

        .hero-meta span {
          padding: 9px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.11);
          color: rgba(255, 255, 255, 0.88);
          font-size: 12px;
          font-weight: 550;
        }

        .hero-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 36px;
        }

        .primary-action,
        .secondary-action {
          min-height: 52px;
          padding: 0 22px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-weight: 650;
          transition: 0.22s ease;
        }

        .primary-action {
          background: #FFF8F3;
          color: #2F613B;
          box-shadow: 0 18px 34px rgba(18, 38, 23, 0.18);
        }

        .secondary-action {
          color: white;
          background: rgba(255, 255, 255, 0.10);
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .primary-action:hover,
        .secondary-action:hover,
        .menu-card:hover,
        .quick-item:hover {
          transform: translateY(-3px);
        }

        .summary-panel {
          width: 100%;
          max-width: 540px;
          justify-self: end;
          padding: 30px;
          border-radius: 34px;
          background: rgba(255, 255, 255, 0.95);
          color: #1E3024;
          box-shadow: 0 28px 68px rgba(20, 42, 25, 0.22);
          backdrop-filter: blur(14px);
          box-sizing: border-box;
        }

        .panel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 22px;
        }

        .panel-head span,
        .section-mini span,
        .section-heading span,
        .note-card > span {
          color: #98715E;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .panel-head h2,
        .section-mini h3,
        .section-mini h2,
        .section-heading h2,
        .note-card h2 {
          margin: 7px 0 0;
          color: #1E3024;
          letter-spacing: -0.8px;
        }

        .panel-head h2 {
          font-size: 25px;
        }

        .panel-icon {
          width: 60px;
          height: 60px;
          border-radius: 22px;
          background: #F4E1D6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .stat-card {
          min-height: 120px;
          padding: 16px;
          border-radius: 22px;
          background: #F8FCF7;
          border: 1px solid #E5EFE2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .stat-card span {
          color: #718472;
          font-size: 12px;
          font-weight: 600;
        }

        .stat-card strong {
          color: #3D7148;
          font-size: 36px;
          line-height: 1;
          font-weight: 780;
        }

        .stat-card p {
          margin: 0;
          color: #6B7A6A;
          font-size: 12px;
          line-height: 1.35;
        }

        .quick-panel {
          margin-top: 16px;
          padding: 18px;
          border-radius: 26px;
          background: #FFF7F2;
          border: 1px solid #F0E1D9;
        }

        .section-mini {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
          margin-bottom: 14px;
        }

        .section-mini h3 {
          font-size: 15px;
        }

        .section-mini.big {
          display: block;
          margin-bottom: 18px;
        }

        .section-mini.big h2 {
          font-size: 32px;
        }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .quick-item {
          min-height: 78px;
          border-radius: 18px;
          background: white;
          border: 1px solid #EEE1DA;
          color: #2F613B;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 7px;
          text-decoration: none;
          transition: 0.22s ease;
          text-align: center;
        }

        .quick-item span {
          font-size: 22px;
        }

        .quick-item b {
          font-size: 12px;
          font-weight: 650;
        }

        .section-heading {
          margin-top: 58px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 34px;
        }

        .section-heading h2 {
          font-size: 36px;
        }

        .section-heading p {
          max-width: 660px;
          margin: 0;
          color: #647464;
          font-size: 15px;
          line-height: 1.7;
          font-weight: 450;
        }

        .menu-grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .menu-card {
          min-height: 275px;
          padding: 28px;
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(229, 221, 214, 0.92);
          box-shadow: 0 18px 44px rgba(66, 83, 67, 0.10);
          color: #1E3024;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: 0.22s ease;
        }

        .menu-icon {
          width: 56px;
          height: 56px;
          border-radius: 20px;
          background: #F4E1D6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 22px;
        }

        .menu-card h3 {
          margin: 0 0 10px;
          color: #1E3024;
          font-size: 23px;
          font-weight: 760;
          letter-spacing: -0.5px;
        }

        .menu-card p {
          margin: 0;
          color: #667866;
          font-size: 14px;
          line-height: 1.68;
          font-weight: 450;
          flex: 1;
        }

        .menu-card strong {
          margin-top: 20px;
          color: #896653;
          font-size: 14px;
          font-weight: 650;
        }

        .lower-grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 22px;
        }

        .focus-card,
        .note-card {
          padding: 30px;
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(229, 221, 214, 0.92);
          box-shadow: 0 18px 44px rgba(66, 83, 67, 0.10);
        }

        .focus-list {
          display: grid;
          gap: 13px;
        }

        .focus-item {
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 14px;
          align-items: center;
          padding: 16px;
          border-radius: 20px;
          background: #F8FCF7;
          border: 1px solid #E5EFE2;
        }

        .focus-item > div {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          background: #F4E1D6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
        }

        .focus-item h3 {
          margin: 0 0 5px;
          color: #1E3024;
          font-size: 16px;
          font-weight: 720;
        }

        .focus-item p,
        .note-card p {
          margin: 0;
          color: #647464;
          font-size: 14px;
          line-height: 1.65;
          font-weight: 440;
        }

        .note-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.94), rgba(241,248,239,0.9));
        }

        .note-card h2 {
          font-size: 32px;
          line-height: 1.2;
          margin-bottom: 14px;
        }

        .note-card a {
          display: inline-flex;
          margin-top: 24px;
          color: #2F613B;
          text-decoration: none;
          font-weight: 700;
        }

        @media (max-width: 1200px) {
          .topbar,
          .dashboard-content {
            width: calc(100% - 40px);
          }

          .topbar {
            height: auto;
            padding: 22px 0;
            align-items: flex-start;
            flex-direction: column;
          }

          .topnav {
            justify-content: flex-start;
          }

          .hero {
            grid-template-columns: 1fr;
            padding: 44px;
          }

          .summary-panel {
            max-width: none;
            justify-self: stretch;
          }

          .menu-grid,
          .lower-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .topbar,
          .dashboard-content {
            width: calc(100% - 24px);
          }

          .top-actions,
          .hero-buttons {
            width: 100%;
          }

          .profile-btn,
          .logout-btn,
          .primary-action,
          .secondary-action {
            flex: 1;
          }

          .hero {
            min-height: auto;
            padding: 28px;
            border-radius: 28px;
          }

          .hero-copy h1 {
            font-size: 40px;
            letter-spacing: -1.4px;
          }

          .hero-copy p {
            font-size: 15px;
          }

          .stats-grid,
          .quick-grid,
          .menu-grid,
          .lower-grid {
            grid-template-columns: 1fr;
          }

          .section-heading {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}