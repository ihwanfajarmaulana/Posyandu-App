import { Link, useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      fontFamily: "'Noto Sans', sans-serif",
      position: 'relative',
    }}>

      {/* BACKGROUND HIJAU - SETENGAH ATAS */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '55%',
        background: '#4E724C',
        zIndex: 0,
      }} />

      {/* BACKGROUND PINK - SETENGAH BAWAH */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '45%',
        background: '#FFF5F8',
        zIndex: 0,
      }} />

      {/* KONTEN DI ATAS BACKGROUND */}
      <div style={{
        position: 'relative',
        zIndex: 1,
      }}>

        {/* NAVBAR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '25px 50px',
        }}>
          <div style={{
            fontWeight: 700,
            fontSize: 36,
            color: '#FFF5F8',
            marginRight: 'auto',
          }}>
            PosyanduCeria
          </div>

          <div style={{ display: 'flex', gap: 50, alignItems: 'center' }}>
            {[
              { label: 'Beranda', to: '/dashboard' },
              { label: 'Tumbuh Kembang', to: '/tumbuh-kembang' },
              { label: 'Imunisasi', to: '/imunisasi' },
              { label: 'Jadwal Posyandu', to: '/jadwal' },
              { label: 'Riwayat Kunjungan', to: '/kunjungan' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                style={{
                  color: '#FFF5F8',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: 20,
                }}
              >
                {item.label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFF5F8',
                fontWeight: 500,
                fontSize: 20,
                cursor: 'pointer',
                fontFamily: "'Noto Sans', sans-serif",
                padding: 0,
              }}
            >
              Profil
            </button>
          </div>
        </div>

        {/* HERO TEXT */}
        <div style={{
          textAlign: 'center',
          padding: '60px 20px 50px',
        }}>
          <div style={{
            fontWeight: 700,
            fontSize: 28,
            color: '#FFFFFF',
            maxWidth: 768,
            margin: '0 auto',
            marginTop: '50px',
            lineHeight: '1.4',
          }}>
            Posyandu Ceria hadir untuk membantu bunda memantau kesehatan dan tumbuh kembang si kecil dengan lebih mudah, praktis, dan terorganisir setiap harinya.
          </div>
        </div>

        {/* 3 CARD FITUR - MELINTASI HIJAU & PINK */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 30,
          padding: '0 60px',
          marginTop: '30px',
          flexWrap: 'wrap',
        }}>
          {[
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
          ].map((item) => (
            <Link
              key={item.title}
              to={item.to}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                width: 325,
                height: 275,
                background: '#93735C',
                borderRadius: 30,
                padding: 24,
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: 28,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  marginBottom: 24,
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontWeight: 500,
                  fontSize: 20,
                  color: '#FFFFFF',
                  lineHeight: '25px',
                  textAlign: 'center',
                }}>
                  {item.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* SPACE KOSONG BAWAH SUPAYA PANJANG */}
        <div style={{ height: 100 }}></div>

      </div>
    </div>
  )
}