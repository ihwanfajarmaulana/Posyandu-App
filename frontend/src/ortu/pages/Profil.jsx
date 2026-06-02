import { useEffect, useState } from 'react'
import API from '../api'
import SidebarLayout from '../components/SidebarLayout'

const emptyPasswordForm = {
  old_password: '',
  new_password: '',
  confirm_password: '',
}

export default function Profil() {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  const [profile, setProfile] = useState({
    nama: storedUser.nama || '',
    email: storedUser.email || '',
    role: storedUser.role || '',
    no_telepon: '',
    alamat: '',
  })
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    API.get('/auth/me')
      .then((res) => {
        const data = res.data.data || {}
        if (!cancelled) {
          setProfile({
            nama: data.nama || '',
            email: data.email || '',
            role: data.role || '',
            no_telepon: data.no_telepon || '',
            alamat: data.alamat || '',
          })
        }
        localStorage.setItem('user', JSON.stringify({
          id: data.id,
          nama: data.nama,
          email: data.email,
          role: data.role,
        }))
      })
      .catch((err) => {
        if (!cancelled) {
          setError('Gagal memuat profil: ' + (err.response?.data?.message || err.message))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleProfileChange = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setSavingProfile(true)
    try {
      const res = await API.put('/auth/me', {
        nama: profile.nama,
        no_telepon: profile.no_telepon,
        alamat: profile.alamat,
      })
      const updated = res.data.data || profile
      const nextUser = {
        id: updated.id || storedUser.id,
        nama: updated.nama || profile.nama,
        email: updated.email || profile.email,
        role: updated.role || profile.role,
      }
      localStorage.setItem('user', JSON.stringify(nextUser))
      setProfile((current) => ({
        ...current,
        nama: nextUser.nama,
        email: nextUser.email,
        role: nextUser.role,
        no_telepon: updated.no_telepon || current.no_telepon,
        alamat: updated.alamat || current.alamat,
      }))
      setMessage('Profil berhasil diperbarui.')
    } catch (err) {
      setError('Gagal menyimpan profil: ' + (err.response?.data?.message || err.message))
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (passwordForm.new_password.length < 6) {
      setError('Password baru minimal 6 karakter.')
      return
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('Konfirmasi password baru belum sama.')
      return
    }

    setSavingPassword(true)
    try {
      await API.put('/auth/change-password', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      })
      setPasswordForm(emptyPasswordForm)
      setMessage('Password berhasil diperbarui.')
    } catch (err) {
      setError('Gagal mengganti password: ' + (err.response?.data?.message || err.message))
    } finally {
      setSavingPassword(false)
    }
  }

  const fieldStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #E0D4CC',
    background: '#FFF5F8',
    color: '#655040',
    fontSize: 14,
    fontFamily: "'Noto Sans', sans-serif",
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontWeight: 800,
    color: '#655040',
    fontSize: 14,
    marginBottom: 8,
  }

  return (
    <SidebarLayout
      title="Profil"
      subtitle="Kelola data akun yang dipakai untuk masuk ke aplikasi PosyanduCeria."
      activePath="/profil"
    >
      {loading ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 15,
          padding: 32,
          color: '#655040',
          fontWeight: 800,
          textAlign: 'center',
        }}>
          Memuat profil...
        </div>
      ) : (
        <>
          {error && (
            <div style={{
              background: '#fdecea',
              color: '#c0392b',
              padding: '12px 16px',
              borderRadius: 10,
              marginBottom: 20,
              fontWeight: 800,
              fontSize: 14,
            }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{
              background: '#eafaf1',
              color: '#218c53',
              padding: '12px 16px',
              borderRadius: 10,
              marginBottom: 20,
              fontWeight: 800,
              fontSize: 14,
            }}>
              {message}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 360px) minmax(0, 1fr)',
            gap: 22,
            alignItems: 'start',
          }}>
            <section style={{
              background: '#FFFFFF',
              borderRadius: 15,
              padding: 24,
              boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                width: 92,
                height: 92,
                borderRadius: '50%',
                background: '#CFEBD2',
                color: '#4E724C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                fontWeight: 800,
                marginBottom: 18,
              }}>
                {profile.nama?.slice(0, 1).toUpperCase() || 'U'}
              </div>

              <div style={{
                color: '#655040',
                fontWeight: 800,
                fontSize: 22,
                marginBottom: 6,
              }}>
                {profile.nama || 'User'}
              </div>
              <div style={{ color: '#93735C', fontWeight: 700, fontSize: 13, marginBottom: 16 }}>
                {profile.email || '-'}
              </div>
              <span style={{
                display: 'inline-block',
                background: '#E9EFEF',
                color: '#4E724C',
                borderRadius: 20,
                padding: '5px 14px',
                fontWeight: 800,
                fontSize: 12,
              }}>
                {profile.role === 'admin' ? 'Admin Posyandu' : 'Orang Tua'}
              </span>
            </section>

            <div style={{ display: 'grid', gap: 22 }}>
              <form
                onSubmit={handleProfileSubmit}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 15,
                  padding: 24,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{
                  color: '#4E724C',
                  fontWeight: 800,
                  fontSize: 18,
                  marginBottom: 18,
                }}>
                  Data Profil
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                }}>
                  <div>
                    <label style={labelStyle}>Nama Lengkap</label>
                    <input
                      type="text"
                      value={profile.nama}
                      onChange={(e) => handleProfileChange('nama', e.target.value)}
                      required
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      style={{ ...fieldStyle, opacity: 0.75 }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Nomor Telepon</label>
                    <input
                      type="text"
                      value={profile.no_telepon}
                      onChange={(e) => handleProfileChange('no_telepon', e.target.value)}
                      placeholder="Contoh: 08123456789"
                      style={fieldStyle}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Alamat</label>
                    <textarea
                      value={profile.alamat}
                      onChange={(e) => handleProfileChange('alamat', e.target.value)}
                      rows={4}
                      placeholder="Masukkan alamat lengkap..."
                      style={{
                        ...fieldStyle,
                        resize: 'vertical',
                        lineHeight: '20px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{
                      background: '#4E724C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 10,
                      padding: '11px 22px',
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: savingProfile ? 'not-allowed' : 'pointer',
                      opacity: savingProfile ? 0.7 : 1,
                      fontFamily: "'Noto Sans', sans-serif",
                    }}
                  >
                    {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                  </button>
                </div>
              </form>

              <form
                onSubmit={handlePasswordSubmit}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 15,
                  padding: 24,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{
                  color: '#4E724C',
                  fontWeight: 800,
                  fontSize: 18,
                  marginBottom: 18,
                }}>
                  Ganti Password
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                }}>
                  <div>
                    <label style={labelStyle}>Password Lama</label>
                    <input
                      type="password"
                      value={passwordForm.old_password}
                      onChange={(e) => handlePasswordChange('old_password', e.target.value)}
                      required
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Password Baru</label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                      required
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Konfirmasi Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                      required
                      style={fieldStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    style={{
                      background: '#655040',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 10,
                      padding: '11px 22px',
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: savingPassword ? 'not-allowed' : 'pointer',
                      opacity: savingPassword ? 0.7 : 1,
                      fontFamily: "'Noto Sans', sans-serif",
                    }}
                  >
                    {savingPassword ? 'Menyimpan...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </SidebarLayout>
  )
}
