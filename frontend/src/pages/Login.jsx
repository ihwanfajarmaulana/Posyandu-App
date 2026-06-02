import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function Login() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [namaAwal, setNamaAwal] = useState('')
  const [namaAkhir, setNamaAkhir] = useState('')
  const [noTelepon, setNoTelepon] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [alamat, setAlamat] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('')
  const [agree, setAgree] = useState(false)

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setSuccess('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await API.post('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.data))

      navigate('/dashboard')
    } catch (_) {
      setError('Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const nama = `${namaAwal} ${namaAkhir}`.trim()

    if (!namaAwal.trim()) {
      setError('Nama awal wajib diisi')
      return
    }

    if (!registerEmail.trim()) {
      setError('Email wajib diisi')
      return
    }

    if (!alamat.trim()) {
      setError('Alamat lengkap wajib diisi')
      return
    }

    if (registerPassword.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    if (registerPassword !== konfirmasiPassword) {
      setError('Password dan konfirmasi password tidak sama')
      return
    }

    if (!agree) {
      setError('Kamu harus menyetujui syarat dan ketentuan terlebih dahulu')
      return
    }

    setLoading(true)

    try {
      await API.post('/auth/register', {
        nama,
        email: registerEmail,
        password: registerPassword,
        no_telepon: noTelepon,
        alamat,
      })

      setSuccess('Pendaftaran berhasil! Silakan masuk menggunakan akun kamu.')
      setNamaAwal('')
      setNamaAkhir('')
      setNoTelepon('')
      setRegisterEmail('')
      setAlamat('')
      setRegisterPassword('')
      setKonfirmasiPassword('')
      setAgree(false)

      setTimeout(() => {
        switchMode('login')
      }, 1200)
    } catch (_) {
      setError('Pendaftaran gagal. Email mungkin sudah terdaftar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-left">
        <div className="left-content">
          <button type="button" className="auth-brand" onClick={() => navigate('/')}>
            PosyanduCeria
          </button>

          <h1>Pantau kesehatan dan tumbuh kembang si kecil dengan lebih mudah</h1>

          <p>
            Bersama posyandu, wujudkan generasi sehat dan cerdas sejak dini
          </p>

          <div className="family-image">
            <img src="/family.png" alt="Keluarga" />
          </div>

          <div className="info-card">
            <div className="info-item">
              <span>📈</span>
              <div>
                <h3>Pantau pertumbuhan anak</h3>
                <p>Lihat grafik dan status gizi anak dengan mudah</p>
              </div>
            </div>

            <div className="info-item">
              <span>🛡️</span>
              <div>
                <h3>Imunisasi Terjadwal</h3>
                <p>Pantau riwayat imunisasi agar anak tidak terlambat vaksin</p>
              </div>
            </div>

            <div className="info-item">
              <span>🏥</span>
              <div>
                <h3>Riwayat Kunjungan</h3>
                <p>Catat kunjungan dan lihat keaktifan anak di posyandu</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="auth-right">
        <section className="auth-hero">
          <div className="welcome-text">
            <h2>Selamat Datang di PosyanduCeria!</h2>
            <p>Silakan masuk ke akun Anda!</p>
          </div>

          <div className={`auth-card ${mode === 'register' ? 'register-card' : ''}`}>
            {mode === 'login' ? (
              <>
                <div className="form-title">
                  <h2>Masuk ke Akun</h2>
                  <p>Silakan isi data berikut untuk melanjutkan</p>
                </div>

                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Email atau Nomor Handphone</label>
                    <div className="input-wrap">
                      <span>👤</span>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Masukkan email atau nomor handphone"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-wrap">
                      <span>🔒</span>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Masukkan password"
                        required
                      />
                    </div>
                  </div>

                  <div className="forgot-row">
                    <button type="button">Lupa Password?</button>
                  </div>

                  {error && <div className="alert error">{error}</div>}
                  {success && <div className="alert success">{success}</div>}

                  <button type="submit" className="main-button" disabled={loading}>
                    {loading ? 'Memproses...' : 'Masuk'}
                  </button>

                  <div className="divider">
                    <span />
                    <p>atau</p>
                    <span />
                  </div>

                  <button
                    type="button"
                    className="google-button"
                    onClick={() => alert('Login dengan Google belum dikonfigurasi.')}
                  >
                    <b>G</b>
                    Masuk dengan Google
                  </button>

                  <p className="switch-text">
                    Belum punya akun?{' '}
                    <button type="button" onClick={() => switchMode('register')}>
                      Daftar di sini
                    </button>
                  </p>
                </form>

                <div className="safe-box">
                  <span>🛡️</span>
                  <div>
                    <h3>Data anda aman bersama kami</h3>
                    <p>Kami menggunakan enkripsi untuk melindungi informasi anda</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-title">
                  <h2>Daftar Akun</h2>
                  <p>Buat akun untuk mulai menggunakan website PosyanduCeria</p>
                </div>

                <form onSubmit={handleRegister}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nama Awal</label>
                      <div className="input-wrap">
                        <span>👤</span>
                        <input
                          type="text"
                          value={namaAwal}
                          onChange={(e) => setNamaAwal(e.target.value)}
                          placeholder="Masukkan nama awal"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Nama Akhir</label>
                      <div className="input-wrap">
                        <span>👤</span>
                        <input
                          type="text"
                          value={namaAkhir}
                          onChange={(e) => setNamaAkhir(e.target.value)}
                          placeholder="Masukkan nama akhir"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>No. Telepon</label>
                      <div className="input-wrap">
                        <span>📞</span>
                        <input
                          type="text"
                          value={noTelepon}
                          onChange={(e) => setNoTelepon(e.target.value)}
                          placeholder="0852xxxxxxxx"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <div className="input-wrap">
                        <span>✉️</span>
                        <input
                          type="email"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          placeholder="contoh@gmail.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group full">
                      <label>Alamat Lengkap</label>
                      <div className="input-wrap">
                        <span>📍</span>
                        <input
                          type="text"
                          value={alamat}
                          onChange={(e) => setAlamat(e.target.value)}
                          placeholder="Masukkan alamat lengkap anda"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <div className="input-wrap">
                        <span>🔒</span>
                        <input
                          type="password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Konfirmasi Password</label>
                      <div className="input-wrap">
                        <span>🔒</span>
                        <input
                          type="password"
                          value={konfirmasiPassword}
                          onChange={(e) => setKonfirmasiPassword(e.target.value)}
                          placeholder="Masukkan ulang password"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="safe-box register-safe">
                    <span>🛡️</span>
                    <div>
                      <h3>Data anda aman bersama kami</h3>
                      <p>Kami menggunakan enkripsi untuk melindungi informasi anda</p>
                    </div>
                  </div>

                  <label className="agree-row">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                    />
                    <span>
                      Saya setuju dengan <b>Syarat & Ketentuan</b> dan <b>Kebijakan Privasi</b>
                    </span>
                  </label>

                  {error && <div className="alert error">{error}</div>}
                  {success && <div className="alert success">{success}</div>}

                  <button type="submit" className="main-button" disabled={loading}>
                    {loading ? 'Memproses...' : 'Daftar'}
                  </button>

                  <p className="switch-text">
                    Sudah punya akun?{' '}
                    <button type="button" onClick={() => switchMode('login')}>
                      Masuk di sini
                    </button>
                  </p>
                </form>
              </>
            )}
          </div>
        </section>
      </main>

      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&display=swap');

        .auth-page {
          width: 100%;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 32% 68%;
          background: #fff7fb;
          overflow: hidden;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #31563b;
        }

        .auth-left {
          min-height: 100vh;
          background: #eaf1ef;
          padding: 42px 42px 34px;
          box-sizing: border-box;
          overflow-y: auto;
        }

        .left-content {
          min-height: calc(100vh - 76px);
          display: flex;
          flex-direction: column;
        }

        .auth-brand {
          border: none;
          background: transparent;
          color: #3f6f49;
          text-align: left;
          font-family: inherit;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.8px;
          cursor: pointer;
          padding: 0;
          margin-bottom: 34px;
        }

        .auth-left h1 {
          margin: 0;
          max-width: 430px;
          color: #2F5F3B;
          font-size: clamp(30px, 3vw, 48px);
          line-height: 1.22;
          letter-spacing: -1.3px;
          font-weight: 630;
          font-family: "Poppins", "Inter", "Segoe UI", sans-serif;
        }

        .auth-left p {
          margin: 18px 0 0;
          max-width: 370px;
          color: #4E7658;
          font-size: 15px;
          line-height: 1.75;
          font-weight: 500;
          letter-spacing: 0.1px;
        }

        .family-image {
          width: min(300px, 72%);
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          overflow: hidden;
          margin: 64px auto 54px;
          background: #d5e2d7;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 22px 45px rgba(51, 88, 57, 0.14);
        }

        .family-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .info-card {
          margin-top: auto;
          background: rgba(255, 247, 251, 0.92);
          border-radius: 18px;
          padding: 18px;
          display: grid;
          gap: 15px;
          box-shadow: 0 16px 38px rgba(51, 88, 57, 0.10);
        }

        .info-item {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 12px;
          align-items: flex-start;
        }

        .info-item > span {
          font-size: 20px;
        }

        .info-item h3 {
          margin: 0 0 4px;
          color: #3f6f49;
          font-size: 14px;
          line-height: 1.25;
          font-weight: 800;
        }

        .info-item p {
          margin: 0;
          color: #3f6f49;
          font-size: 12px;
          line-height: 1.45;
          font-weight: 500;
        }

        .auth-right {
          min-height: 100vh;
          position: relative;
          overflow-y: auto;
          background: linear-gradient(to bottom, #4f724d 0 50%, #fff7fb 50% 100%);
        }

        .auth-hero {
          min-height: 100vh;
          box-sizing: border-box;
          padding: 68px 32px 42px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .welcome-text {
          position: absolute;
          top: 76px;
          left: 24px;
          right: 24px;
          text-align: center;
          color: #eaf1ef;
        }

        .welcome-text h2 {
          margin: 0;
          font-size: clamp(26px, 3vw, 44px);
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: 0.4px;
        }

        .welcome-text p {
          margin: 8px 0 0;
          font-size: clamp(16px, 1.5vw, 22px);
          font-weight: 500;
          color: #f1f4ef;
        }

        .auth-card {
          width: min(620px, calc(100% - 32px));
          margin-top: 145px;
          border-radius: 18px;
          background: rgba(242, 223, 209, 0.95);
          padding: 28px 54px 30px;
          box-sizing: border-box;
          box-shadow: 0 24px 55px rgba(42, 52, 37, 0.14);
          backdrop-filter: blur(8px);
        }

        .auth-card.register-card {
          width: min(820px, calc(100% - 32px));
          margin-top: 145px;
          padding: 24px 48px 28px;
        }

        .auth-right {
          min-height: 100vh;
          position: relative;
          overflow-y: auto;
          background: linear-gradient(to bottom, #4f724d 0 50%, #fff7fb 50% 100%);
        }

        .auth-hero {
          min-height: 100vh;
          box-sizing: border-box;
          padding: 68px 32px 42px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          position: relative;
        }

        .form-title {
          text-align: center;
          margin-bottom: 22px;
        }

        .form-title h2 {
          margin: 0;
          color: #775948;
          font-size: 24px;
          line-height: 1.1;
          font-weight: 850;
          letter-spacing: -0.4px;
        }

        .form-title p {
          margin: 7px 0 0;
          color: #775948;
          font-size: 12px;
          font-weight: 500;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          color: #775948;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 7px;
        }

        .input-wrap {
          height: 42px;
          border-radius: 9px;
          background: rgba(255, 247, 251, 0.92);
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 13px;
          box-sizing: border-box;
        }

        .input-wrap span {
          width: 18px;
          min-width: 18px;
          color: #806251;
          font-size: 14px;
          display: inline-flex;
          justify-content: center;
        }

        .input-wrap input {
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #4c3b31;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
        }

        .input-wrap input::placeholder {
          color: rgba(119, 89, 72, 0.55);
        }

        .forgot-row {
          margin: -4px 0 18px;
          text-align: right;
        }

        .forgot-row button {
          border: none;
          background: transparent;
          color: #8a6652;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .main-button {
          width: 100%;
          height: 46px;
          border: none;
          border-radius: 9px;
          background: #6b4d3f;
          color: white;
          font-family: inherit;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(107, 77, 63, 0.18);
          transition: 0.2s ease;
        }

        .main-button:hover {
          transform: translateY(-1px);
          background: #5f4438;
        }

        .main-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 16px 0 13px;
          color: #7d5e4d;
          font-size: 11px;
          font-weight: 700;
        }

        .divider span {
          height: 1px;
          flex: 1;
          background: rgba(125, 94, 77, 0.25);
        }

        .divider p {
          margin: 0;
        }

        .google-button {
          width: 100%;
          height: 42px;
          border: none;
          border-radius: 9px;
          background: rgba(255, 247, 251, 0.92);
          color: #775948;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
        }

        .google-button b {
          color: #4285f4;
          font-size: 18px;
        }

        .switch-text {
          margin: 15px 0 0;
          text-align: center;
          color: #775948;
          font-size: 12px;
          font-weight: 500;
        }

        .switch-text button {
          border: none;
          background: transparent;
          color: #5d4032;
          padding: 0;
          font-family: inherit;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }

        .safe-box {
          margin: 22px auto 0;
          width: 82%;
          min-height: 46px;
          border-radius: 10px;
          background: rgba(190, 221, 167, 0.72);
          display: grid;
          grid-template-columns: 34px 1fr;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          box-sizing: border-box;
          color: #3b6844;
        }

        .register-safe {
          width: 100%;
          margin: 22px 0 18px;
        }

        .safe-box > span {
          font-size: 20px;
        }

        .safe-box h3 {
          margin: 0;
          font-size: 12px;
          font-weight: 850;
        }

        .safe-box p {
          margin: 2px 0 0;
          font-size: 10px;
          line-height: 1.3;
          font-weight: 500;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px 16px;
        }

        .form-grid .form-group {
          margin-bottom: 0;
        }

        .form-grid .full {
          grid-column: 1 / -1;
        }

        .agree-row {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 4px 0 16px;
          color: #775948;
          font-size: 12px;
          line-height: 1.4;
          font-weight: 500;
          cursor: pointer;
        }

        .agree-row input {
          accent-color: #6b4d3f;
        }

        .agree-row b {
          color: #5d4032;
        }

        .alert {
          border-radius: 9px;
          padding: 9px 12px;
          margin-bottom: 14px;
          text-align: center;
          font-size: 12px;
          font-weight: 700;
        }

        .alert.error {
          color: #b42318;
          background: #fdecea;
        }

        .alert.success {
          color: #16753c;
          background: #e8f7ed;
        }

        @media (max-width: 1024px) {
          .auth-page {
            grid-template-columns: 1fr;
            overflow-y: auto;
          }

          .auth-left {
            min-height: auto;
            padding: 32px 28px;
          }

          .left-content {
            min-height: auto;
          }

          .family-image {
            width: 220px;
            margin: 36px auto;
          }

          .auth-right {
            min-height: 760px;
          }
        }

        @media (max-width: 720px) {
          .auth-left {
            padding: 28px 20px;
          }

          .auth-hero {
            padding: 130px 14px 38px;
            justify-content: flex-start;
          }

          .welcome-text {
            top: 42px;
          }

          .auth-card,
          .auth-card.register-card {
            width: 100%;
            margin-top: 0;
            padding: 24px 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-grid .full {
            grid-column: auto;
          }

          .safe-box {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}