import { useState } from 'react'
import API from '../api'

export default function Login() {
  const [activeTab, setActiveTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [nama, setNama] = useState('')
  const [konfirmPassword, setKonfirmPassword] = useState('')
  const [sukses, setSukses] = useState('')

  const handleRegister = async (e) => {
  e.preventDefault()
  setError('')
  setSukses('')

  if (password !== konfirmPassword) {
    setError('Password dan konfirmasi password tidak sama')
    return
  }

  if (password.length < 6) {
    setError('Password minimal 6 karakter')
    return
  }

  setLoading(true)
  try {
    await API.post('/auth/register', { nama, email, password })
    setSukses('Registrasi berhasil! Silakan login.')
    setNama('')
    setEmail('')
    setPassword('')
    setKonfirmPassword('')
    setTimeout(() => setActiveTab('signin'), 2000)
  } catch (_) {
    setError('Registrasi gagal. Email mungkin sudah terdaftar.')
  } finally {
    setLoading(false)
  }
}

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await API.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.data))
      window.location.href = '/dashboard'
    } catch (_) {
      setError('Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        fontFamily: "'Noto Sans', sans-serif",
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
    }}>

      {/* ── PANEL KIRI ── */}
      <div style={{
        width: '30%',
        height: '100%',
        background: '#E9EFEF',
        display: 'flex',
        flexDirection: 'column',
        padding: '4vh 3vw',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}>

        {/* Logo */}
        <div style={{
          fontWeight: 700,
          fontSize: 'clamp(20px, 2vw, 30px)',
          color: '#4E724C',
          marginBottom: '3vh',
          marginTop: '5vh'
        }}>
          PosyanduCeria
        </div>

        {/* Tagline besar */}
        <div style={{
          fontWeight: 500,
          fontSize: 'clamp(16px, 1.6vw, 22px)',
          lineHeight: '1.4',
          color: '#4E724C',
          marginBottom: '0.5vh',
        }}>
          Pantau kesehatan dan tumbuh kembang si kecil dengan lebih mudah
        </div>

        {/* Tagline kecil */}
        <div style={{
          fontWeight: 400,
          fontSize: 'clamp(12px, 1vw, 15px)',
          lineHeight: '1.5',
          color: '#4E724C',
          marginBottom: '10vh',
        }}>
          Bersama posyandu, wujudkan generasi sehat dan cerdas sejak dini
        </div>

        {/* Gambar bulat */}
        <div style={{
          width: 'clamp(300px, 18vw, 280px)',
          height: 'clamp(300px, 18vw, 280px)',
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#c8d8c8',
          alignSelf: 'center',
          marginBottom: '10vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <img
            src="/family.png"
            alt="Keluarga"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentNode.innerHTML = '<span style="font-size:60px">👨‍👩‍👧‍👦</span>'
            }}
          />
        </div>

        {/* Card fitur */}
        <div style={{
          background: '#FFF5F8',
          borderRadius: 15,
          padding: '2vh 1.5vw',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5vh',
        }}>

          {[
            { icon: '📈', title: 'Pantau pertumbuhan anak', desc: 'Lihat grafik dan status gizi anak dengan mudah' },
            { icon: '🛡️', title: 'Imunisasi Terjadwal', desc: 'Pantau riwayat imunisasi agar anak tidak terlambat vaksin' },
            { icon: '🏥', title: 'Riwayat Kunjungan', desc: 'Catat kunjungan dan lihat keaktifan anak di posyandu' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ fontSize: 'clamp(16px, 1.4vw, 20px)', marginTop: 2, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{
                  fontWeight: 600,
                  fontSize: 'clamp(11px, 0.85vw, 13px)',
                  color: '#4E724C',
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: 'clamp(10px, 0.75vw, 11px)',
                  color: '#4E724C',
                  lineHeight: '1.4',
                }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* ── PANEL KANAN ── */}
      <div style={{
        flex: 1,
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }}>

        {/* Background atas hijau */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '50%',
          background: '#4E724C',
        }} />

        {/* Background bawah pink */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '50%',
          background: '#FFF5F8',
        }} />

        {/* Judul */}
        <div style={{
          position: 'absolute',
          top: '8%',
          left: 0, right: 0,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: 'clamp(22px, 3vw, 40px)',
          color: '#E9EFEF',
          zIndex: 1,
          padding: '0 2vw',
          marginTop: '3vh'
        }}>
          Selamat Datang di PosyanduCeria!
        </div>

        {/* Card Form */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          width: 'clamp(320px, 36vw, 480px)',
          background: '#F2DFD1',
          borderRadius: 15,
          padding: 'clamp(20px, 3vh, 36px) clamp(20px, 3vw, 40px)',
          boxSizing: 'border-box',
          marginTop: '5%',
        }}>

          {/* Tab */}
          <div style={{ display: 'flex', gap: 'clamp(20px, 3vw, 50px)', marginBottom: '2.5vh' }}>
            {['signin', 'signup'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                    setActiveTab(tab)
                    setError('')
                    setSukses('')
                    }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: "'Noto Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(16px, 1.6vw, 22px)',
                  color: '#93735C',
                  cursor: 'pointer',
                  textDecoration: activeTab === tab ? 'underline' : 'none',
                  padding: 0,
                }}
              >
                {tab === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form Sign In */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLogin}>

              {/* Email */}
              <div style={{ marginBottom: '2vh' }}>
                <label style={{
                  display: 'block',
                  fontWeight: 700,
                  fontSize: 'clamp(12px, 1vw, 15px)',
                  color: '#93735C',
                  marginBottom: 8,
                }}>
                  Email atau Nomor Handphone
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email..."
                  required
                  style={{
                    width: '100%',
                    height: 'clamp(40px, 5vh, 50px)',
                    background: '#FFF5F8',
                    borderRadius: 10,
                    border: 'none',
                    padding: '0 15px',
                    fontSize: 'clamp(12px, 1vw, 14px)',
                    fontFamily: "'Noto Sans', sans-serif",
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1vh' }}>
                <label style={{
                  display: 'block',
                  fontWeight: 700,
                  fontSize: 'clamp(12px, 1vw, 15px)',
                  color: '#93735C',
                  marginBottom: 8,
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  required
                  style={{
                    width: '100%',
                    height: 'clamp(40px, 5vh, 50px)',
                    background: '#FFF5F8',
                    borderRadius: 10,
                    border: 'none',
                    padding: '0 15px',
                    fontSize: 'clamp(12px, 1vw, 14px)',
                    fontFamily: "'Noto Sans', sans-serif",
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Lupa password */}
              <div style={{ textAlign: 'right', marginBottom: '1.5vh' }}>
                <span style={{
                  fontSize: 'clamp(11px, 0.9vw, 13px)',
                  color: '#93735C',
                  cursor: 'pointer',
                }}>
                  Lupa Password?
                </span>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  color: '#c0392b',
                  fontSize: 13,
                  marginBottom: '1.5vh',
                  textAlign: 'center',
                  background: '#fdecea',
                  padding: '8px 12px',
                  borderRadius: 8,
                }}>
                  {error}
                </div>
              )}

              {/* Tombol Masuk */}
              <div style={{ textAlign: 'center', marginTop: '1vh' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: 'clamp(160px, 15vw, 220px)',
                    height: 'clamp(38px, 5vh, 46px)',
                    background: '#FFF5F8',
                    borderRadius: 10,
                    border: 'none',
                    fontFamily: "'Noto Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(13px, 1.1vw, 16px)',
                    color: '#93735C',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {loading ? 'Memuat...' : 'Masuk'}
                </button>
              </div>

            </form>
          )}

          {/* Form Sign Up */}
            {activeTab === 'signup' && (
            <form onSubmit={handleRegister}>

                <div style={{ marginBottom: 14 }}>
                <label style={{
                    display: 'block',
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#93735C',
                    marginBottom: 8,
                }}>
                    Nama Lengkap
                </label>
                <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama lengkap..."
                    required
                    style={{
                    width: '100%',
                    height: 46,
                    background: '#FFF5F8',
                    borderRadius: 10,
                    border: 'none',
                    padding: '0 15px',
                    fontSize: 13,
                    fontFamily: "'Noto Sans', sans-serif",
                    boxSizing: 'border-box',
                    outline: 'none',
                    }}
                />
                </div>

                <div style={{ marginBottom: 14 }}>
                <label style={{
                    display: 'block',
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#93735C',
                    marginBottom: 8,
                }}>
                    Email atau Nomor Handphone
                </label>
                <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email..."
                    required
                    style={{
                    width: '100%',
                    height: 46,
                    background: '#FFF5F8',
                    borderRadius: 10,
                    border: 'none',
                    padding: '0 15px',
                    fontSize: 13,
                    fontFamily: "'Noto Sans', sans-serif",
                    boxSizing: 'border-box',
                    outline: 'none',
                    }}
                />
                </div>

                <div style={{ marginBottom: 14 }}>
                <label style={{
                    display: 'block',
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#93735C',
                    marginBottom: 8,
                }}>
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password..."
                    required
                    style={{
                    width: '100%',
                    height: 46,
                    background: '#FFF5F8',
                    borderRadius: 10,
                    border: 'none',
                    padding: '0 15px',
                    fontSize: 13,
                    fontFamily: "'Noto Sans', sans-serif",
                    boxSizing: 'border-box',
                    outline: 'none',
                    }}
                />
                </div>

                <div style={{ marginBottom: 14 }}>
                <label style={{
                    display: 'block',
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#93735C',
                    marginBottom: 8,
                }}>
                    Konfirmasi Password
                </label>
                <input
                    type="password"
                    value={konfirmPassword}
                    onChange={(e) => setKonfirmPassword(e.target.value)}
                    placeholder="Ulangi password..."
                    required
                    style={{
                    width: '100%',
                    height: 46,
                    background: '#FFF5F8',
                    borderRadius: 10,
                    border: 'none',
                    padding: '0 15px',
                    fontSize: 13,
                    fontFamily: "'Noto Sans', sans-serif",
                    boxSizing: 'border-box',
                    outline: 'none',
                    }}
                />
                </div>

                {error && (
                <div style={{
                    color: '#c0392b',
                    fontSize: 12,
                    marginBottom: 12,
                    textAlign: 'center',
                    background: '#fdecea',
                    padding: '8px 12px',
                    borderRadius: 8,
                }}>
                    {error}
                </div>
                )}

                {sukses && (
                <div style={{
                    color: '#27ae60',
                    fontSize: 12,
                    marginBottom: 12,
                    textAlign: 'center',
                    background: '#eafaf1',
                    padding: '8px 12px',
                    borderRadius: 8,
                }}>
                    {sukses}
                </div>
                )}

                <div style={{ textAlign: 'center' }}>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                    width: 200,
                    height: 44,
                    background: '#FFF5F8',
                    borderRadius: 10,
                    border: 'none',
                    fontFamily: "'Noto Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#93735C',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading ? 'Memuat...' : 'Daftar'}
                </button>
                </div>

            </form>
            )}


        </div>
      </div>
    </div>
  )
}