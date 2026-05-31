import { useState } from 'react'
import API from '../api'

/* ─── Small SVG icons used inside the form fields ──────────────────────── */
function FormIcon({ name, size = 18, color = '#93735C' }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth: 2,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  switch (name) {
    case 'user':
      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21c1.6-4 14.4-4 16 0"/></svg>
    case 'lock':
      return <svg {...common}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
    case 'mail':
      return <svg {...common}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
    case 'phone':
      return <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    case 'pin':
      return <svg {...common}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    case 'shield':
      return <svg {...common}><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z"/></svg>
    case 'chart':
      return <svg {...common}><path d="M4 19V5"/><path d="M4 19h17"/><path d="m7 14 3-3 3 2 5-6"/></svg>
    default: return null
  }
}

/* ─── Reusable form field with an icon inside the input ────────────────── */
function IconField({ icon, label, type = 'text', value, onChange, placeholder, required = true }) {
  const labelStyle = {
    display: 'block',
    fontWeight: 700,
    fontSize: 13.5,
    color: '#655040',
    marginBottom: 7,
  }
  const wrapStyle = { position: 'relative' }
  const iconStyle = {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    pointerEvents: 'none',
  }
  const inputStyle = {
    width: '100%',
    height: 38,
    background: '#FFF5F8',
    borderRadius: 10,
    border: '1px solid transparent',
    padding: '0 14px 0 40px',  // extra left padding for the icon
    fontSize: 13,
    fontFamily: "'Noto Sans', sans-serif",
    boxSizing: 'border-box',
    outline: 'none',
    color: '#655040',
  }
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={wrapStyle}>
        <span style={iconStyle}><FormIcon name={icon} /></span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="pc-input"
          style={inputStyle}
        />
      </div>
    </div>
  )
}

/* ─── Google "G" logo (small multicolored icon) ─────────────────────────── */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 4 24a20 20 0 1 0 39.6-3.5z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.5-5.2l-6.2-5.3A12 12 0 0 1 24 36a12 12 0 0 1-11.3-8l-6.5 5A20 20 0 0 0 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.5l6.2 5.3c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  )
}

/* ─── Security info banner shown at the bottom of both forms ────────────── */
function SecurityBanner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: '#E0F0DD',
      borderRadius: 10,
      padding: '10px 14px',
      marginTop: 6,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: '#FFFFFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <FormIcon name="shield" size={18} color="#4E724C" />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 12, color: '#3F633E' }}>
          Data anda aman bersama kami
        </div>
        <div style={{ fontSize: 11, color: '#4E724C', marginTop: 2, lineHeight: 1.4 }}>
          kami menggunakan enkripsi untuk melindungi informasi anda
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  const [activeTab, setActiveTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [nama, setNama] = useState('')          // First name (Nama Awal)
  const [namaAkhir, setNamaAkhir] = useState('') // Last name (Nama Akhir)
  const [noTelepon, setNoTelepon] = useState('')
  const [alamat, setAlamat] = useState('')
  const [konfirmPassword, setKonfirmPassword] = useState('')
  const [sukses, setSukses] = useState('')
  const [terms, setTerms] = useState(false)      // Checkbox: agreed to T&C

  const handleRegister = async (e) => {
  e.preventDefault()
  setError('')
  setSukses('')

  if (!terms) {
    setError('Mohon setujui Syarat & Ketentuan untuk melanjutkan')
    return
  }

  if (password !== konfirmPassword) {
    setError('Password dan konfirmasi password tidak sama')
    return
  }

  if (password.length < 6) {
    setError('Password minimal 6 karakter')
    return
  }

  // Combine "Nama Awal" + "Nama Akhir" into a single full name string
  // because the backend expects a single `nama` field.
  const fullName = [nama, namaAkhir].filter(Boolean).join(' ').trim()

  setLoading(true)
  try {
    await API.post('/auth/register', {
      nama: fullName,
      email,
      password,
      no_telepon: noTelepon,  // backend may or may not store this — sent for forward-compat
      alamat: alamat,
    })
    setSukses('Registrasi berhasil! Silakan login.')
    setNama('')
    setNamaAkhir('')
    setNoTelepon('')
    setAlamat('')
    setEmail('')
    setPassword('')
    setKonfirmPassword('')
    setTerms(false)
    setTimeout(() => setActiveTab('signin'), 2000)
  } catch {
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
      // After successful login, send the user straight to their dashboard.
      window.location.href = '/dashboard'
    } catch {
      setError('Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="pc-fade-in"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        fontFamily: "'Noto Sans', sans-serif",
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >

      {/* ── PANEL KIRI ── */}
      <div
        className="pc-slide-left"
        style={{
          width: '30%',
          height: '100%',
          background: 'linear-gradient(180deg, #EEF3F3 0%, #E5EBEB 60%, #DDE5E5 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '4vh 3vw',
          boxSizing: 'border-box',
          overflowY: 'auto',
          boxShadow: '4px 0 18px rgba(0,0,0,0.06)',
        }}
      >

        {/* Logo */}
        <div
          className="pc-slide-down pc-delay-1"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(20px, 2vw, 30px)',
            color: '#4E724C',
            marginBottom: '3vh',
            marginTop: '5vh'
          }}
        >
          PosyanduCeria
        </div>

        {/* Tagline besar */}
        <div
          className="pc-slide-up pc-delay-2"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(16px, 1.6vw, 22px)',
            lineHeight: '1.4',
            color: '#4E724C',
            marginBottom: '0.5vh',
          }}
        >
          Pantau kesehatan dan tumbuh kembang si kecil dengan lebih mudah
        </div>

        {/* Tagline kecil */}
        <div
          className="pc-slide-up pc-delay-3"
          style={{
            fontWeight: 400,
            fontSize: 'clamp(12px, 1vw, 15px)',
            lineHeight: '1.5',
            color: '#4E724C',
            marginBottom: '10vh',
          }}
        >
          Bersama posyandu, wujudkan generasi sehat dan cerdas sejak dini
        </div>

        {/* Gambar bulat */}
        <div
          className="pc-scale-in pc-delay-4 pc-float-slow"
          style={{
            width: 'clamp(300px, 18vw, 280px)',
            height: 'clamp(300px, 18vw, 280px)',
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #dceadd 0%, #c8d8c8 60%, #b4c8b4 100%)',
            alignSelf: 'center',
            marginBottom: '10vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 10px 30px rgba(78, 114, 76, 0.18)',
          }}
        >
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
        <div
          className="pc-slide-up pc-delay-5"
          style={{
            background: 'linear-gradient(180deg, #FFF5F8 0%, #FFEBF1 100%)',
            borderRadius: 15,
            padding: '2vh 1.5vw',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5vh',
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          }}
        >

          {[
            { icon: 'chart', title: 'Pantau pertumbuhan anak', desc: 'Lihat grafik dan status gizi anak dengan mudah' },
            { icon: 'shield', title: 'Imunisasi Terjadwal', desc: 'Pantau riwayat imunisasi agar anak tidak terlambat vaksin' },
            { icon: 'user', title: 'Riwayat Kunjungan', desc: 'Catat kunjungan dan lihat keaktifan anak di posyandu' },
          ].map((item, i) => (
            <div
              key={i}
              className={`pc-slide-left pc-delay-${i + 4}`}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}
            >
              <div style={{
                marginTop: 2,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FormIcon name={item.icon} size={22} color="#4E724C" />
              </div>
              <div>
                <div style={{
                  fontWeight: 700,
                  fontSize: 'clamp(11px, 0.9vw, 13px)',
                  color: '#4E724C',
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: 'clamp(10px, 0.75vw, 11px)',
                  color: '#4E724C',
                  lineHeight: '1.4',
                  opacity: 0.85,
                }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* ── PANEL KANAN ── */}
      <div
        className="pc-slide-right"
        style={{
          flex: 1,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >

        {/* Background atas hijau (gradient) */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '50%',
          background: 'linear-gradient(135deg, #5C8259 0%, #4E724C 50%, #3F633E 100%)',
        }} />

        {/* Background bawah pink (gradient) */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, #FFF5F8 0%, #FFEBF1 100%)',
        }} />

        {/* ── Floating decorations on the green background ── */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div className="pc-float-slow" style={{
            position: 'absolute', top: '8%', left: '6%',
            width: 180, height: 180, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(207,235,210,0.45), transparent 70%)',
            filter: 'blur(30px)',
          }} />
          <div className="pc-float" style={{
            position: 'absolute', top: '25%', right: '8%',
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,245,248,0.35), transparent 70%)',
            filter: 'blur(30px)',
          }} />
          <svg className="pc-float" style={{ position: 'absolute', top: '15%', right: '20%' }}
               width="24" height="24" viewBox="0 0 24 24"
               fill="rgba(255,255,255,0.25)">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <svg className="pc-float-delay" style={{ position: 'absolute', top: '12%', left: '25%' }}
               width="18" height="18" viewBox="0 0 24 24"
               fill="rgba(255,255,255,0.3)">
            <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"/>
          </svg>
        </div>

        {/* Judul */}
        <div
          className="pc-slide-down pc-delay-2"
          style={{
            position: 'absolute',
            top: 'clamp(36px, 6vh, 72px)',
            left: 0, right: 0,
            textAlign: 'center',
            fontWeight: 800,
            fontSize: 'clamp(22px, 2.6vw, 34px)',
            color: '#E9EFEF',
            zIndex: 1,
            padding: '0 2vw',
            textShadow: '0 2px 8px rgba(0,0,0,0.18)',
            lineHeight: 1.2,
          }}
        >
          Selamat Datang di PosyanduCeria!
        </div>

        {/* ── Static area that holds the form card (no scroll).
              Centered in the area BELOW the title — floats nicely. ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 'clamp(110px, 16vh, 160px)',
          paddingBottom: 'clamp(20px, 3vh, 40px)',
          paddingLeft: 16,
          paddingRight: 16,
          zIndex: 2,
        }}>

        {/* Card Form */}
        <div
          className="pc-scale-in pc-delay-3"
          style={{
            position: 'relative',
            // Same width on both tabs — never resizes when switching.
            width: 'clamp(420px, 50vw, 640px)',
            maxWidth: '100%',
            background: 'linear-gradient(135deg, #F8E8DA 0%, #F2DFD1 60%, #E5CFBC 100%)',
            borderRadius: 20,
            // Tighter padding so the card stays compact and never overflows the viewport
            padding: 'clamp(18px, 2.4vh, 28px) clamp(24px, 3vw, 40px)',
            boxSizing: 'border-box',
            boxShadow: '0 24px 60px rgba(101, 80, 64, 0.28), 0 6px 16px rgba(0,0,0,0.12)',
          }}
        >

          {/* Tab */}
          <div style={{ display: 'flex', gap: 'clamp(20px, 3vw, 50px)', marginBottom: '2.5vh' }}>
            {['signin', 'signup'].map((tab) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    setError('')
                    setSukses('')
                  }}
                  className="pc-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: "'Noto Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(16px, 1.6vw, 22px)',
                    color: isActive ? '#4E724C' : '#93735C',
                    cursor: 'pointer',
                    padding: '4px 2px',
                    borderBottom: isActive ? '3px solid #4E724C' : '3px solid transparent',
                    transition: 'color 0.25s ease, border-color 0.25s ease',
                  }}
                >
                  {tab === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              )
            })}
          </div>

          {/* Form Sign In */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLogin} key="signin-form" className="pc-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Title */}
              <div className="pc-slide-down" style={{ textAlign: 'center', marginBottom: 4 }}>
                <h2 style={{ margin: 0, color: '#3F633E', fontWeight: 800, fontSize: 22 }}>Masuk ke Akun</h2>
                <p style={{ margin: '6px 0 0', color: '#876D5D', fontSize: 12.5 }}>
                  Silakan isi data berikut untuk melanjutkan
                </p>
              </div>

              {/* Email field */}
              <div className="pc-slide-up pc-delay-1">
                <IconField
                  icon="user"
                  label="Email atau Nomor Handphone"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email atau nomor handphone"
                />
              </div>

              {/* Password field */}
              <div className="pc-slide-up pc-delay-2">
                <IconField
                  icon="lock"
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                />
              </div>

              {/* Lupa Password? */}
              <div className="pc-slide-up pc-delay-3" style={{ textAlign: 'right', marginTop: -4 }}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert('Fitur reset password belum tersedia.') }}
                  style={{
                    fontSize: 12,
                    color: '#876D5D',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Lupa Password?
                </a>
              </div>

              {/* Error message */}
              {error && (
                <div className="pc-scale-in" style={{
                  color: '#c0392b',
                  fontSize: 12.5,
                  textAlign: 'center',
                  background: '#fdecea',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontWeight: 600,
                }}>
                  {error}
                </div>
              )}

              {/* Full-width brown Masuk button */}
              <button
                type="submit"
                disabled={loading}
                className="pc-btn pc-focusable pc-slide-up pc-delay-4"
                style={{
                  width: '100%',
                  height: 42,
                  background: 'linear-gradient(135deg, #76604D 0%, #5F4D3D 100%)',
                  borderRadius: 10,
                  border: 'none',
                  fontFamily: "'Noto Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  color: '#FFFFFF',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(95, 77, 61, 0.35)',
                  marginTop: 2,
                }}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span className="pc-spin" style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid #FFFFFF',
                      borderTopColor: 'transparent',
                      display: 'inline-block',
                    }} />
                    Memuat...
                  </span>
                ) : 'Masuk'}
              </button>

              {/* "atau" divider */}
              <div className="pc-fade-in pc-delay-5" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: '#876D5D',
                fontSize: 12,
                fontWeight: 600,
              }}>
                <div style={{ flex: 1, height: 1, background: '#D8C3B3' }} />
                <span>atau</span>
                <div style={{ flex: 1, height: 1, background: '#D8C3B3' }} />
              </div>

              {/* Google sign-in button (cosmetic for now) */}
              <button
                type="button"
                onClick={() => alert('Login dengan Google belum tersedia.')}
                className="pc-btn pc-focusable pc-slide-up pc-delay-5"
                style={{
                  width: '100%',
                  height: 46,
                  background: '#FFFFFF',
                  borderRadius: 10,
                  border: '1px solid #E0D4CC',
                  fontFamily: "'Noto Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#5F4D3D',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <GoogleLogo />
                Masuk dengan Google
              </button>

              {/* Belum punya akun? */}
              <div className="pc-fade-in pc-delay-5" style={{ textAlign: 'center', fontSize: 12.5, color: '#876D5D', marginTop: 2 }}>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('signup'); setError(''); setSukses('') }}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    color: '#3F633E', fontWeight: 800, cursor: 'pointer',
                    fontFamily: "'Noto Sans', sans-serif", fontSize: 12.5,
                  }}
                >
                  Daftar di sini
                </button>
              </div>

              {/* Security banner */}
              <div className="pc-slide-up pc-delay-6">
                <SecurityBanner />
              </div>

            </form>
          )}

          {/* Form Sign Up */}
            {activeTab === 'signup' && (
            <form onSubmit={handleRegister} key="signup-form" className="pc-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Title */}
              <div className="pc-slide-down" style={{ textAlign: 'center', marginBottom: 4 }}>
                <h2 style={{ margin: 0, color: '#3F633E', fontWeight: 800, fontSize: 22 }}>Daftar Akun</h2>
                <p style={{ margin: '6px 0 0', color: '#876D5D', fontSize: 12.5 }}>
                  Buat akun untuk mulai menggunakan website PosyanduCeria
                </p>
              </div>

              {/* Nama Awal / Nama Akhir (2 columns) */}
              <div className="pc-slide-up pc-delay-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <IconField
                  icon="user"
                  label="Nama Awal"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama awal"
                />
                <IconField
                  icon="user"
                  label="Nama Akhir"
                  value={namaAkhir}
                  onChange={(e) => setNamaAkhir(e.target.value)}
                  placeholder="Masukkan nama akhir"
                  required={false}
                />
              </div>

              {/* No. Telepon / Email (2 columns) */}
              <div className="pc-slide-up pc-delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <IconField
                  icon="phone"
                  label="No. Telepon"
                  value={noTelepon}
                  onChange={(e) => setNoTelepon(e.target.value)}
                  placeholder="0852xxxxxxxxx"
                  required={false}
                />
                <IconField
                  icon="mail"
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@gmail.com"
                />
              </div>

              {/* Alamat Lengkap (full width) */}
              <div className="pc-slide-up pc-delay-3">
                <IconField
                  icon="pin"
                  label="Alamat Lengkap"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Masukkan alamat lengkap anda"
                  required={false}
                />
              </div>

              {/* Password / Konfirmasi Password (2 columns) */}
              <div className="pc-slide-up pc-delay-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <IconField
                  icon="lock"
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                />
                <IconField
                  icon="lock"
                  type="password"
                  label="Konfirmasi Password"
                  value={konfirmPassword}
                  onChange={(e) => setKonfirmPassword(e.target.value)}
                  placeholder="Masukkan ulang password"
                />
              </div>

              {/* Security banner */}
              <div className="pc-slide-up pc-delay-5">
                <SecurityBanner />
              </div>

              {/* Terms checkbox */}
              <label className="pc-slide-up pc-delay-5" style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                fontSize: 12.5,
                color: '#655040',
                cursor: 'pointer',
                lineHeight: 1.5,
              }}>
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, cursor: 'pointer', accentColor: '#4E724C' }}
                />
                <span>
                  Saya setuju dengan{' '}
                  <span style={{ color: '#3F633E', fontWeight: 800 }}>Syarat & Ketentuan</span>
                  {' '}dan{' '}
                  <span style={{ color: '#3F633E', fontWeight: 800 }}>Kebijakan Privasi</span>
                </span>
              </label>

              {/* Error / Success */}
              {error && (
                <div className="pc-scale-in" style={{
                  color: '#c0392b',
                  fontSize: 12.5,
                  textAlign: 'center',
                  background: '#fdecea',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontWeight: 600,
                }}>
                  {error}
                </div>
              )}
              {sukses && (
                <div className="pc-scale-in" style={{
                  color: '#27ae60',
                  fontSize: 12.5,
                  textAlign: 'center',
                  background: '#eafaf1',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontWeight: 600,
                }}>
                  {sukses}
                </div>
              )}

              {/* Full-width brown Daftar button */}
              <button
                type="submit"
                disabled={loading}
                className="pc-btn pc-focusable"
                style={{
                  width: '100%',
                  height: 42,
                  background: 'linear-gradient(135deg, #76604D 0%, #5F4D3D 100%)',
                  borderRadius: 10,
                  border: 'none',
                  fontFamily: "'Noto Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  color: '#FFFFFF',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(95, 77, 61, 0.35)',
                }}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span className="pc-spin" style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid #FFFFFF',
                      borderTopColor: 'transparent',
                      display: 'inline-block',
                    }} />
                    Memuat...
                  </span>
                ) : 'Daftar'}
              </button>

              {/* "sudah punya akun?" link */}
              <div style={{ textAlign: 'center', fontSize: 12.5, color: '#876D5D' }}>
                sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('signin'); setError(''); setSukses('') }}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    color: '#3F633E', fontWeight: 800, cursor: 'pointer',
                    fontFamily: "'Noto Sans', sans-serif", fontSize: 12.5,
                  }}
                >
                  Masuk di sini
                </button>
              </div>

              {/* Hide the OLD signup form below — replaced by the new design above. */}
              <div style={{ display: 'none' }}>

                <div className="pc-slide-up pc-delay-1" style={{ marginBottom: 14 }}>
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
                    className="pc-input"
                    style={{
                    width: '100%',
                    height: 46,
                    background: '#FFF5F8',
                    borderRadius: 10,
                    border: '1px solid transparent',
                    padding: '0 15px',
                    fontSize: 13,
                    fontFamily: "'Noto Sans', sans-serif",
                    boxSizing: 'border-box',
                    outline: 'none',
                    }}
                />
                </div>

                <div className="pc-slide-up pc-delay-2" style={{ marginBottom: 14 }}>
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
                    className="pc-input"
                    style={{
                    width: '100%',
                    height: 46,
                    background: '#FFF5F8',
                    borderRadius: 10,
                    border: '1px solid transparent',
                    padding: '0 15px',
                    fontSize: 13,
                    fontFamily: "'Noto Sans', sans-serif",
                    boxSizing: 'border-box',
                    outline: 'none',
                    }}
                />
                </div>

                <div className="pc-slide-up pc-delay-3" style={{ marginBottom: 14 }}>
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
                    className="pc-input"
                    style={{
                    width: '100%',
                    height: 46,
                    background: '#FFF5F8',
                    borderRadius: 10,
                    border: '1px solid transparent',
                    padding: '0 15px',
                    fontSize: 13,
                    fontFamily: "'Noto Sans', sans-serif",
                    boxSizing: 'border-box',
                    outline: 'none',
                    }}
                />
                </div>

                <div className="pc-slide-up pc-delay-4" style={{ marginBottom: 14 }}>
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
                    className="pc-input"
                    style={{
                    width: '100%',
                    height: 46,
                    background: '#FFF5F8',
                    borderRadius: 10,
                    border: '1px solid transparent',
                    padding: '0 15px',
                    fontSize: 13,
                    fontFamily: "'Noto Sans', sans-serif",
                    boxSizing: 'border-box',
                    outline: 'none',
                    }}
                />
                </div>

                {error && (
                <div className="pc-scale-in" style={{
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
                <div className="pc-scale-in" style={{
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

                <div className="pc-slide-up pc-delay-5" style={{ textAlign: 'center' }}>
                <button
                    type="submit"
                    disabled={loading}
                    className="pc-btn pc-focusable"
                    style={{
                    width: 200,
                    height: 44,
                    background: loading
                      ? '#FFF5F8'
                      : 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F8 100%)',
                    borderRadius: 10,
                    border: 'none',
                    fontFamily: "'Noto Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#4E724C',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                    }}
                >
                    {loading ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span className="pc-spin" style={{
                          width: 14, height: 14, borderRadius: '50%',
                          border: '2px solid #93735C',
                          borderTopColor: 'transparent',
                          display: 'inline-block',
                        }} />
                        Memuat...
                      </span>
                    ) : 'Daftar'}
                </button>
                </div>

              </div>{/* end of OLD hidden signup form wrapper */}

            </form>
            )}


        </div>{/* end of card form */}
        </div>{/* end of scrollable area */}
      </div>{/* end of right panel */}
    </div>
  )
}
