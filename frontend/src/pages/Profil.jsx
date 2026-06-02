import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

const splitName = (nama = '') => {
  const parts = String(nama || '').trim().split(' ').filter(Boolean)

  if (parts.length === 0) {
    return {
      nama_awal: '',
      nama_akhir: '',
    }
  }

  if (parts.length === 1) {
    return {
      nama_awal: parts[0],
      nama_akhir: '',
    }
  }

  return {
    nama_awal: parts[0],
    nama_akhir: parts.slice(1).join(' '),
  }
}

const getRoleLabel = (role) => {
  if (role === 'admin') return 'Admin'
  if (role === 'orang_tua') return 'Orang Tua'
  return role || 'Pengguna'
}

export default function Profil() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const storedUser = useMemo(() => getStoredUser(), [])
  const initialName = splitName(storedUser.nama || storedUser.name || '')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nama_awal: initialName.nama_awal,
    nama_akhir: initialName.nama_akhir,
    no_telepon: storedUser.no_telepon || storedUser.no_hp || storedUser.telepon || '',
    email: storedUser.email || '',
    alamat: storedUser.alamat || '',
    role: storedUser.role || '',
    foto_profil: storedUser.foto_profil || storedUser.profile_picture || '',
  })

  const fullName = `${form.nama_awal} ${form.nama_akhir}`.trim()

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      setLoading(true)

      try {
        const res = await API.get('/auth/me')
        const data = res.data?.data || res.data || {}
        const nama = splitName(data.nama || storedUser.nama || '')

        const localUser = getStoredUser()

        if (!mounted) return

        setForm((prev) => ({
          ...prev,
          nama_awal: nama.nama_awal,
          nama_akhir: nama.nama_akhir,
          no_telepon: data.no_telepon || localUser.no_telepon || '',
          email: data.email || localUser.email || '',
          alamat: data.alamat || localUser.alamat || '',
          role: data.role || localUser.role || '',
          foto_profil: localUser.foto_profil || localUser.profile_picture || prev.foto_profil || '',
        }))

        localStorage.setItem(
          'user',
          JSON.stringify({
            ...localUser,
            ...data,
            foto_profil: localUser.foto_profil || localUser.profile_picture || '',
            profile_picture: localUser.foto_profil || localUser.profile_picture || '',
          })
        )
      } catch {
        // kalau /auth/me gagal, tetap pakai data dari localStorage
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [])

  const handleChange = (field, value) => {
    setMessage('')
    setError('')

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePickImage = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 2MB.')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        foto_profil: reader.result,
      }))
    }

    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setForm((prev) => ({
      ...prev,
      foto_profil: '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!form.nama_awal.trim()) {
      setError('Nama awal wajib diisi.')
      return
    }

    if (!form.email.trim()) {
      setError('Email wajib diisi.')
      return
    }

    setSaving(true)

    const payload = {
      nama: fullName,
      no_telepon: form.no_telepon,
      alamat: form.alamat,
    }

    try {
      const res = await API.put('/auth/me', payload)
      const updatedFromBackend = res.data?.data || {}

      const oldUser = getStoredUser()

      const updatedUser = {
        ...oldUser,
        ...updatedFromBackend,
        nama: fullName,
        name: fullName,
        email: form.email,
        no_telepon: form.no_telepon,
        no_hp: form.no_telepon,
        alamat: form.alamat,
        role: form.role || oldUser.role,
        foto_profil: form.foto_profil,
        profile_picture: form.foto_profil,
      }

      localStorage.setItem('user', JSON.stringify(updatedUser))

      setMessage('Profil berhasil diperbarui.')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan profil.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div>
          <span>Profil</span>
          <h1>Data Pengguna</h1>
          <p>Kelola informasi akun yang digunakan di aplikasi PosyanduCeria.</p>
        </div>

        <button type="button" className="header-user" onClick={() => navigate('/profil')}>
          👤 {fullName || 'Pengguna'}
        </button>
      </header>

      <main className="profile-content">
        <aside className="profile-card">
          <div className="avatar-wrap">
            {form.foto_profil ? (
              <img src={form.foto_profil} alt="Foto profil" />
            ) : (
              <div className="avatar-placeholder">
                {fullName ? fullName.charAt(0).toUpperCase() : 'P'}
              </div>
            )}

            <button type="button" className="camera-btn" onClick={handlePickImage}>
              📷
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />

          <h2>{fullName || 'Nama Pengguna'}</h2>
          <p>{form.email || '-'}</p>

          <span className="role-badge">{getRoleLabel(form.role)}</span>

          <div className="profile-actions">
            <button type="button" onClick={handlePickImage}>
              Ganti Foto
            </button>

            <button type="button" onClick={handleRemoveImage}>
              Hapus Foto
            </button>
          </div>

          <div className="side-info">
            <div>
              <span>No. Telepon</span>
              <strong>{form.no_telepon || '-'}</strong>
            </div>

            <div>
              <span>Alamat</span>
              <strong>{form.alamat || '-'}</strong>
            </div>
          </div>
        </aside>

        <section className="form-card">
          <div className="form-head">
            <div>
              <span>Edit Profil</span>
              <h2>Informasi Akun</h2>
              <p>Data mengikuti form pendaftaran akun PosyanduCeria.</p>
            </div>
          </div>

          {loading && <div className="alert info">Memuat data profil...</div>}
          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Nama Awal
                <div className="input-wrap">
                  <span>👤</span>
                  <input
                    type="text"
                    value={form.nama_awal}
                    onChange={(e) => handleChange('nama_awal', e.target.value)}
                    placeholder="Masukkan nama awal"
                    required
                  />
                </div>
              </label>

              <label>
                Nama Akhir
                <div className="input-wrap">
                  <span>👤</span>
                  <input
                    type="text"
                    value={form.nama_akhir}
                    onChange={(e) => handleChange('nama_akhir', e.target.value)}
                    placeholder="Masukkan nama akhir"
                  />
                </div>
              </label>

              <label>
                No. Telepon
                <div className="input-wrap">
                  <span>📞</span>
                  <input
                    type="text"
                    value={form.no_telepon}
                    onChange={(e) => handleChange('no_telepon', e.target.value)}
                    placeholder="0852xxxxxxxx"
                  />
                </div>
              </label>

              <label>
                Email
                <div className="input-wrap disabled">
                  <span>✉️</span>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    placeholder="contoh@gmail.com"
                  />
                </div>
              </label>

              <label className="full">
                Alamat Lengkap
                <div className="input-wrap textarea-wrap">
                  <span>📍</span>
                  <textarea
                    value={form.alamat}
                    onChange={(e) => handleChange('alamat', e.target.value)}
                    placeholder="Masukkan alamat lengkap anda"
                  />
                </div>
              </label>

              <label>
                Role
                <div className="input-wrap disabled">
                  <span>🛡️</span>
                  <input type="text" value={getRoleLabel(form.role)} disabled />
                </div>
              </label>
            </div>

            <div className="note-box">
              <span>🔒</span>
              <div>
                <strong>Email dan role tidak dapat diubah dari halaman profil.</strong>
                <p>Perubahan nama, nomor telepon, alamat, dan foto profil dapat disimpan dari halaman ini.</p>
              </div>
            </div>

            <div className="button-row">
              <button type="button" className="back-button" onClick={() => navigate('/dashboard')}>
                Kembali
              </button>

              <button type="button" className="logout-button" onClick={handleLogout}>
                Keluar
              </button>

              <button type="submit" className="save-button" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </form>
        </section>
      </main>

      <style>{`
        .profile-page {
          min-height: 100vh;
          background: #F7FAF7;
          color: #243424;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .profile-header {
          min-height: 210px;
          background: #4F724D;
          color: white;
          padding: 34px 42px 48px;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
        }

        .profile-header span {
          display: block;
          margin-bottom: 8px;
          color: #F5E2D6;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .profile-header h1 {
          margin: 0;
          font-size: 42px;
          line-height: 1.05;
          letter-spacing: -1.4px;
          font-weight: 850;
        }

        .profile-header p {
          margin: 12px 0 0;
          color: rgba(255,255,255,0.88);
          line-height: 1.6;
          font-weight: 500;
        }

        .header-user {
          border: none;
          min-height: 42px;
          padding: 0 18px;
          border-radius: 999px;
          background: #F7E5D8;
          color: #6C5145;
          font-family: inherit;
          font-weight: 750;
          cursor: pointer;
          white-space: nowrap;
        }

        .profile-content {
          width: calc(100% - 84px);
          margin: 34px auto 0;
          padding-bottom: 56px;
          display: grid;
          grid-template-columns: 330px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .profile-card,
        .form-card {
          background: #FFFFFF;
          border: 1px solid #DDE8DD;
          border-radius: 24px;
          box-shadow: 0 18px 44px rgba(55, 80, 58, 0.10);
        }

        .profile-card {
          padding: 28px;
          text-align: center;
        }

        .avatar-wrap {
          width: 128px;
          height: 128px;
          margin: 0 auto 18px;
          position: relative;
          border-radius: 34px;
          background: #F8EEEE;
          overflow: visible;
        }

        .avatar-wrap img,
        .avatar-placeholder {
          width: 128px;
          height: 128px;
          border-radius: 34px;
          object-fit: cover;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-placeholder {
          background: linear-gradient(135deg, #F4E1D6, #E7F4E5);
          color: #3F6F49;
          font-size: 54px;
          font-weight: 850;
        }

        .camera-btn {
          position: absolute;
          right: -8px;
          bottom: -8px;
          width: 42px;
          height: 42px;
          border: 4px solid white;
          border-radius: 16px;
          background: #4F724D;
          color: white;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(47, 97, 59, 0.22);
        }

        .profile-card h2 {
          margin: 12px 0 6px;
          font-size: 25px;
          line-height: 1.2;
          letter-spacing: -0.7px;
          color: #243424;
        }

        .profile-card p {
          margin: 0;
          color: #6B5247;
          font-size: 14px;
        }

        .role-badge {
          display: inline-flex;
          margin: 16px 0 20px;
          padding: 8px 16px;
          border-radius: 999px;
          background: #DDF4D7;
          color: #3B7D2A;
          font-size: 13px;
          font-weight: 800;
        }

        .profile-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 18px;
        }

        .profile-actions button {
          min-height: 38px;
          border-radius: 12px;
          border: 1px solid #DDE8DD;
          background: #F8FCF7;
          color: #355C3C;
          font-family: inherit;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .side-info {
          display: grid;
          gap: 10px;
          text-align: left;
        }

        .side-info div {
          border: 1px solid #DDE8DD;
          border-radius: 16px;
          padding: 14px;
          background: #FCFEFC;
        }

        .side-info span {
          display: block;
          color: #779078;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 6px;
        }

        .side-info strong {
          color: #243424;
          font-size: 14px;
          line-height: 1.5;
          word-break: break-word;
        }

        .form-card {
          padding: 30px;
        }

        .form-head {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .form-head span {
          color: #98715E;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .form-head h2 {
          margin: 8px 0 6px;
          color: #243424;
          font-size: 31px;
          letter-spacing: -0.9px;
        }

        .form-head p {
          margin: 0;
          color: #667866;
          line-height: 1.6;
        }

        .alert {
          border-radius: 14px;
          padding: 13px 15px;
          margin-bottom: 18px;
          font-weight: 750;
          font-size: 14px;
        }

        .alert.info {
          background: #EFF6FF;
          color: #1D4E89;
        }

        .alert.success {
          background: #EAF7EC;
          color: #2F613B;
        }

        .alert.error {
          background: #FEE2E2;
          color: #B42318;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .form-grid label {
          color: #355C3C;
          font-size: 13px;
          font-weight: 850;
        }

        .form-grid label.full {
          grid-column: 1 / -1;
        }

        .input-wrap {
          min-height: 48px;
          margin-top: 8px;
          border: 1px solid #D5E4D5;
          border-radius: 14px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 14px;
          box-sizing: border-box;
        }

        .input-wrap.disabled {
          background: #F3F7F3;
          color: #718472;
        }

        .input-wrap > span {
          width: 20px;
          min-width: 20px;
          display: inline-flex;
          justify-content: center;
        }

        .input-wrap input,
        .input-wrap textarea {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #243424;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
        }

        .input-wrap input:disabled {
          color: #718472;
          cursor: not-allowed;
        }

        .textarea-wrap {
          align-items: flex-start;
          padding-top: 14px;
          padding-bottom: 14px;
        }

        .textarea-wrap textarea {
          min-height: 118px;
          resize: vertical;
          line-height: 1.6;
        }

        .note-box {
          margin-top: 20px;
          border-radius: 16px;
          background: #F4F9F3;
          border: 1px solid #DDE8DD;
          padding: 15px;
          display: grid;
          grid-template-columns: 38px 1fr;
          gap: 12px;
          align-items: flex-start;
        }

        .note-box > span {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          background: #DDF4D7;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .note-box strong {
          color: #2F613B;
          font-size: 14px;
        }

        .note-box p {
          margin: 5px 0 0;
          color: #667866;
          line-height: 1.55;
          font-size: 13px;
        }

        .button-row {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }

        .button-row button {
          min-height: 44px;
          border-radius: 13px;
          padding: 0 18px;
          font-family: inherit;
          font-weight: 850;
          cursor: pointer;
        }

        .back-button {
          border: 1px solid #DDE8DD;
          background: #FFFFFF;
          color: #355C3C;
        }

        .logout-button {
          border: 1px solid #FECACA;
          background: #FEF2F2;
          color: #B42318;
        }

        .save-button {
          border: none;
          background: #4F724D;
          color: white;
          box-shadow: 0 12px 24px rgba(47, 97, 59, 0.18);
        }

        .save-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        @media (max-width: 1050px) {
          .profile-content {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .profile-header {
            flex-direction: column;
            padding: 28px 20px 52px;
          }

          .profile-content {
            width: calc(100% - 28px);
            margin-top: -34px;
          }

          .form-card,
          .profile-card {
            padding: 22px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-grid label.full {
            grid-column: auto;
          }

          .button-row {
            flex-direction: column;
          }

          .button-row button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}