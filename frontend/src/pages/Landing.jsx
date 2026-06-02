import { Link, useNavigate } from 'react-router-dom'

const features = [
  {
    icon: '👶',
    title: 'Data Balita',
    desc: 'Membantu petugas menyimpan dan mengelola data balita secara lebih rapi.',
  },
  {
    icon: '🏥',
    title: 'Kunjungan Posyandu',
    desc: 'Riwayat kunjungan dapat dicatat agar pelayanan lebih mudah dipantau.',
  },
  {
    icon: '📈',
    title: 'Tumbuh Kembang',
    desc: 'Pemantauan berat badan, tinggi badan, dan perkembangan anak menjadi lebih terarah.',
  },
  {
    icon: '💉',
    title: 'Imunisasi',
    desc: 'Catatan imunisasi anak dapat tersimpan dengan lebih lengkap dan mudah dicek.',
  },
  {
    icon: '📅',
    title: 'Jadwal Posyandu',
    desc: 'Informasi jadwal kegiatan posyandu dapat dikelola dengan lebih tertata.',
  },
  {
    icon: '📊',
    title: 'Laporan',
    desc: 'Data pelayanan dapat direkap untuk membantu kebutuhan laporan posyandu.',
  },
]

const benefits = [
  {
    icon: '🌿',
    title: 'Mudah digunakan',
    desc: 'Tampilan dibuat sederhana agar petugas dapat menggunakan sistem dengan nyaman.',
  },
  {
    icon: '📌',
    title: 'Data lebih tertata',
    desc: 'Setiap data posyandu disimpan dalam alur yang lebih jelas dan mudah ditemukan.',
  },
  {
    icon: '✨',
    title: 'Mendukung pelayanan',
    desc: 'Membantu proses pencatatan, pemantauan, dan pelaporan kegiatan posyandu.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  return (
    <div className="landing-page">
      <header className="landing-navbar">
        <button type="button" className="landing-brand" onClick={() => navigate('/')}>
          <span>P</span>
          PosyanduCeria
        </button>

        <nav className="landing-menu">
          <a href="#fitur">Fitur</a>
          <a href="#manfaat">Manfaat</a>
          <a href="#tentang">Tentang</a>
        </nav>

        <Link to={token ? '/dashboard' : '/login'} className="landing-login">
          {token ? 'Dashboard' : 'Login'}
        </Link>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="hero-badge">Sistem Informasi Posyandu Digital</span>

            <h1>
              Pantau kesehatan balita dengan lebih rapi, cepat, dan mudah.
            </h1>

            <p>
              PosyanduCeria merupakan sistem informasi yang membantu proses
              pencatatan dan pemantauan kegiatan posyandu, mulai dari data
              balita, kunjungan, imunisasi, tumbuh kembang, jadwal, hingga laporan.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="primary-button">
                Login
              </Link>

              <a href="#fitur" className="secondary-button">
                Lihat Fitur
              </a>
            </div>

            <div className="hero-tags">
              <span>🌿 Mudah digunakan</span>
              <span>📌 Data lebih rapi</span>
              <span>✨ Tampilan modern</span>
            </div>
          </div>

          <aside className="hero-info">
            <div className="info-header">
              <span>Tentang Sistem</span>
              <h2>PosyanduCeria</h2>
              <p>
                Sistem ini dirancang untuk membantu petugas posyandu dalam
                melakukan pencatatan data secara digital sehingga kegiatan
                pelayanan dapat berjalan lebih tertata.
              </p>
            </div>

            <div className="info-list">
              <div>
                <span>01</span>
                <section>
                  <h3>Pencatatan lebih praktis</h3>
                  <p>Data balita dan layanan posyandu dapat dicatat melalui sistem.</p>
                </section>
              </div>

              <div>
                <span>02</span>
                <section>
                  <h3>Pemantauan lebih mudah</h3>
                  <p>Riwayat kunjungan, imunisasi, dan tumbuh kembang dapat dilihat kembali.</p>
                </section>
              </div>

              <div>
                <span>03</span>
                <section>
                  <h3>Laporan lebih tertata</h3>
                  <p>Data yang tersimpan dapat digunakan untuk mendukung pembuatan laporan.</p>
                </section>
              </div>
            </div>
          </aside>
        </section>

        <section id="fitur" className="feature-section">
          <div className="section-heading">
            <div>
              <span>Fitur utama</span>
              <h2>Satu sistem untuk kebutuhan posyandu</h2>
            </div>

            <p>
              Fitur dibuat untuk membantu petugas dalam proses pencatatan,
              pemantauan, dan pelaporan kegiatan posyandu.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((item) => (
              <div key={item.title} className="feature-card">
                <div>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="manfaat" className="benefit-section">
          <div className="section-heading benefit-heading">
            <div>
              <span>Manfaat</span>
              <h2>Membantu kegiatan posyandu menjadi lebih terarah</h2>
            </div>

            <p>
              PosyanduCeria dibuat agar proses kerja petugas menjadi lebih
              sederhana tanpa mengurangi kebutuhan pencatatan data.
            </p>
          </div>

          <div className="benefit-grid">
            {benefits.map((item) => (
              <div key={item.title} className="benefit-card">
                <span>{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="tentang" className="about-section">
          <div>
            <span>Tentang PosyanduCeria</span>
            <h2>Digitalisasi pencatatan posyandu yang sederhana dan nyaman.</h2>
          </div>

          <p>
            Dengan PosyanduCeria, kegiatan posyandu dapat dikelola dalam satu
            sistem yang lebih rapi. Petugas dapat login untuk mengakses dashboard,
            mengelola data balita, mencatat kunjungan, melihat riwayat imunisasi,
            memantau tumbuh kembang, serta membuat laporan.
          </p>
        </section>
      </main>

      <style>{`
        .landing-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 8% 4%, rgba(244, 214, 198, 0.78), transparent 30%),
            radial-gradient(circle at 92% 8%, rgba(207, 233, 211, 0.86), transparent 32%),
            linear-gradient(135deg, #FFF9F4 0%, #F8FCF6 48%, #F8F0E8 100%);
          color: #1E3024;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow-x: hidden;
        }

        .landing-navbar,
        .landing-main {
          width: calc(100% - 88px);
          margin: 0 auto;
        }

        .landing-navbar {
          min-height: 88px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          position: relative;
          z-index: 5;
        }

        .landing-brand {
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

        .landing-brand span {
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

        .landing-menu {
          flex: 1;
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .landing-menu a {
          color: #3A5A41;
          text-decoration: none;
          font-size: 14px;
          font-weight: 560;
          padding: 9px 14px;
          border-radius: 999px;
          transition: 0.22s ease;
        }

        .landing-menu a:hover {
          background: rgba(47, 97, 59, 0.08);
        }

        .landing-login {
          min-height: 42px;
          padding: 0 20px;
          border-radius: 999px;
          background: #2F613B;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 13px;
          font-weight: 650;
          box-shadow: 0 12px 28px rgba(47, 97, 59, 0.18);
          white-space: nowrap;
        }

        .landing-main {
          padding: 20px 0 80px;
        }

        .landing-hero {
          min-height: 620px;
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(420px, 0.78fr);
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

        .landing-hero::before {
          content: '';
          width: 620px;
          height: 620px;
          border-radius: 999px;
          position: absolute;
          right: -240px;
          top: -270px;
          background: rgba(255, 255, 255, 0.10);
        }

        .landing-hero::after {
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
        .hero-info {
          position: relative;
          z-index: 2;
        }

        .hero-badge {
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
          font-size: clamp(52px, 5vw, 84px);
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

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 36px;
        }

        .primary-button,
        .secondary-button {
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

        .primary-button {
          background: #FFF8F3;
          color: #2F613B;
          box-shadow: 0 18px 34px rgba(18, 38, 23, 0.18);
        }

        .secondary-button {
          color: white;
          background: rgba(255, 255, 255, 0.10);
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .primary-button:hover,
        .secondary-button:hover,
        .feature-card:hover,
        .benefit-card:hover {
          transform: translateY(-3px);
        }

        .hero-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 28px;
        }

        .hero-tags span {
          padding: 9px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.11);
          color: rgba(255, 255, 255, 0.88);
          font-size: 12px;
          font-weight: 550;
        }

        .hero-info {
          width: 100%;
          max-width: 540px;
          justify-self: end;
          padding: 34px;
          border-radius: 34px;
          background: rgba(255, 255, 255, 0.95);
          color: #1E3024;
          box-shadow: 0 28px 68px rgba(20, 42, 25, 0.22);
          backdrop-filter: blur(14px);
          box-sizing: border-box;
        }

        .info-header span,
        .section-heading span,
        .about-section span {
          color: #98715E;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .info-header h2 {
          margin: 8px 0 12px;
          font-size: 34px;
          letter-spacing: -1px;
          color: #1E3024;
        }

        .info-header p {
          margin: 0;
          color: #647464;
          font-size: 15px;
          line-height: 1.7;
        }

        .info-list {
          display: grid;
          gap: 13px;
          margin-top: 24px;
        }

        .info-list > div {
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 14px;
          align-items: center;
          padding: 16px;
          border-radius: 20px;
          background: #FFF7F2;
          border: 1px solid #F0E1D9;
        }

        .info-list > div > span {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          background: white;
          color: #2F613B;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
        }

        .info-list h3 {
          margin: 0 0 5px;
          color: #1E3024;
          font-size: 16px;
        }

        .info-list p {
          margin: 0;
          color: #647464;
          font-size: 13px;
          line-height: 1.5;
        }

        .feature-section,
        .benefit-section,
        .about-section {
          margin-top: 58px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 34px;
          margin-bottom: 24px;
        }

        .section-heading h2,
        .about-section h2 {
          margin: 8px 0 0;
          color: #1E3024;
          font-size: 36px;
          letter-spacing: -1px;
          line-height: 1.2;
        }

        .section-heading p,
        .about-section p {
          max-width: 680px;
          margin: 0;
          color: #647464;
          font-size: 15px;
          line-height: 1.7;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .feature-card,
        .benefit-card,
        .about-section {
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(229, 221, 214, 0.92);
          box-shadow: 0 18px 44px rgba(66, 83, 67, 0.10);
        }

        .feature-card {
          min-height: 245px;
          padding: 28px;
          border-radius: 32px;
          transition: 0.22s ease;
        }

        .feature-card > div {
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

        .feature-card h3,
        .benefit-card h3 {
          margin: 0 0 10px;
          color: #1E3024;
          font-size: 23px;
          letter-spacing: -0.5px;
        }

        .feature-card p,
        .benefit-card p {
          margin: 0;
          color: #667866;
          font-size: 14px;
          line-height: 1.68;
        }

        .benefit-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .benefit-card {
          padding: 28px;
          border-radius: 30px;
          transition: 0.22s ease;
        }

        .benefit-card > span {
          width: 54px;
          height: 54px;
          border-radius: 19px;
          background: #E8F4E6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 20px;
        }

        .about-section {
          padding: 36px;
          border-radius: 34px;
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 34px;
          align-items: center;
        }

        @media (max-width: 1200px) {
          .landing-navbar,
          .landing-main {
            width: calc(100% - 40px);
          }

          .landing-navbar {
            height: auto;
            padding: 22px 0;
            flex-direction: column;
            align-items: flex-start;
          }

          .landing-menu {
            justify-content: flex-start;
          }

          .landing-hero,
          .about-section {
            grid-template-columns: 1fr;
            padding: 44px;
          }

          .hero-info {
            max-width: none;
            justify-self: stretch;
          }

          .feature-grid,
          .benefit-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .landing-navbar,
          .landing-main {
            width: calc(100% - 24px);
          }

          .landing-hero,
          .about-section {
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

          .hero-actions {
            width: 100%;
          }

          .primary-button,
          .secondary-button {
            flex: 1;
          }

          .feature-grid,
          .benefit-grid {
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