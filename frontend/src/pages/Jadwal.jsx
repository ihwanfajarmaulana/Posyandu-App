import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api'

export default function Jadwal() {
  const [jadwal, setJadwal] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    judul: '',
    jenis: 'penimbangan',
    tanggal: '',
    waktu_mulai: '08:00',
    waktu_selesai: '11:00',
    lokasi: '',
    deskripsi: '',
  })
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'

  useEffect(() => { loadJadwal() }, [])

  const loadJadwal = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await API.get('/jadwal')
      // Backend mungkin return data di .data atau .data.data
      const list = Array.isArray(res.data) ? res.data : (res.data.data || [])
      setJadwal(list)
    } catch (err) {
      setError('Gagal memuat jadwal: ' + (err.response?.data?.message || err.message))
      setJadwal([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleAktifkanPengingat = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(p => {
        if (p === 'granted') {
          alert('✅ Pengingat berhasil diaktifkan! Anda akan mendapat notifikasi saat jadwal posyandu mendekat.')
        } else {
          alert('Pengingat tidak diaktifkan.')
        }
      })
    } else {
      alert('Browser Anda tidak mendukung notifikasi.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await API.put(`/jadwal/${editId}`, form)
      } else {
        await API.post('/jadwal', form)
      }
      setShowForm(false)
      setEditId(null)
      setForm({ judul: '', jenis: 'penimbangan', tanggal: '', waktu_mulai: '08:00', waktu_selesai: '11:00', lokasi: '', deskripsi: '' })
      loadJadwal()
    } catch (err) {
      alert('Gagal menyimpan jadwal: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleEdit = (j) => {
    setEditId(j.id)
    setForm({
      judul: j.judul || '',
      jenis: j.jenis || 'penimbangan',
      tanggal: j.tanggal || '',
      waktu_mulai: j.waktu_mulai || '08:00',
      waktu_selesai: j.waktu_selesai || '11:00',
      lokasi: j.lokasi || '',
      deskripsi: j.deskripsi || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin hapus jadwal ini?')) return
    try {
      await API.delete(`/jadwal/${id}`)
      loadJadwal()
    } catch (err) {
      alert('Gagal hapus: ' + (err.response?.data?.message || err.message))
    }
  }

  const formatTanggal = (tgl) => {
    if (!tgl) return '-'
    const d = new Date(tgl)
    if (isNaN(d.getTime())) return '-'
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`
  }

  const formatJam = (waktu) => waktu ? waktu.substring(0, 5) + ' WIB' : '-'

  const menuItems = [
    { icon: '🏠', label: 'Beranda', to: '/dashboard' },
    { icon: '📈', label: 'Tumbuh Kembang', to: '/tumbuh-kembang' },
    { icon: '💉', label: 'Imunisasi', to: '/imunisasi' },
    { icon: '📅', label: 'Jadwal Posyandu', to: '/jadwal', active: true },
    { icon: '🏥', label: 'Riwayat Kunjungan', to: '/kunjungan' },
    { icon: '👤', label: 'Profil', to: '/profil' },
    { icon: '⚙️', label: 'Pengaturan', to: '/pengaturan' },
  ]

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      fontFamily: "'Noto Sans', sans-serif",
      display: 'flex',
    }}>

      {/* SIDEBAR */}
      <div style={{
        width: 258,
        minHeight: '100vh',
        background: '#E9EFEF',
        padding: '24px 14px',
        flexShrink: 0,
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: 28,
          color: '#4E724C',
          marginBottom: 30,
          paddingLeft: 10,
        }}>
          PosyanduCeria
        </div>

        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              fontSize: 16,
              fontWeight: 500,
              color: '#4E724C',
              textDecoration: 'none',
              borderRadius: 10,
              background: item.active ? '#CFEBD2' : 'transparent',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <button
          onClick={handleLogout}
          style={{
            marginTop: 30,
            width: '100%',
            padding: '10px 14px',
            background: 'none',
            border: '1px solid #4E724C',
            borderRadius: 10,
            color: '#4E724C',
            fontWeight: 500,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: "'Noto Sans', sans-serif",
          }}
        >
          Logout
        </button>
      </div>

      {/* KONTEN UTAMA */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>

        {/* HEADER HIJAU */}
        <div style={{
          background: '#4E724C',
          padding: '24px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap',
          }}>
            <div style={{
              fontWeight: 700,
              fontSize: 26,
              color: '#FFF5F8',
            }}>
              Jadwal Posyandu
            </div>

            {/* Tombol Tambah Jadwal di samping judul (Admin Only) */}
            {isAdmin && (
              <button
                onClick={() => {
                  setEditId(null)
                  setForm({ judul: '', jenis: 'penimbangan', tanggal: '', waktu_mulai: '08:00', waktu_selesai: '11:00', lokasi: '', deskripsi: '' })
                  setShowForm(true)
                }}
                style={{
                  background: '#FFF5F8',
                  color: '#4E724C',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: "'Noto Sans', sans-serif",
                }}
              >
                + Tambah Jadwal
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{
              background: '#F2DFD1',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              cursor: 'pointer',
              fontSize: 16,
            }}>🔔</button>
            <div style={{
              background: '#F2DFD1',
              borderRadius: 30,
              padding: '4px 16px 4px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#655040',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}>👤</div>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#655040' }}>
                {user.nama || 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* CARDS JADWAL - SECTION HIJAU */}
        <div style={{
          background: '#4E724C',
          padding: '20px 30px 40px',
          flex: 1,
        }}>
          {error && (
            <div style={{
              background: '#fdecea',
              color: '#c0392b',
              padding: '12px 18px',
              borderRadius: 10,
              marginBottom: 20,
              fontSize: 14,
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ color: '#FFF5F8', textAlign: 'center', padding: 30 }}>
              Memuat data...
            </div>
          ) : jadwal.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              padding: 40,
              borderRadius: 15,
              textAlign: 'center',
              color: '#655040',
            }}>
              Belum ada jadwal posyandu.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(367px, 1fr))',
              gap: 20,
            }}>
              {jadwal.map((j) => (
                <div key={j.id} style={{
                  background: '#FFFFFF',
                  borderRadius: 15,
                  padding: 24,
                  position: 'relative',
                }}>
                  {isAdmin && (
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      display: 'flex',
                      gap: 8,
                    }}>
                      <button
                        onClick={() => handleEdit(j)}
                        style={{
                          background: '#FFE9AE',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 10px',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#655040',
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(j.id)}
                        style={{
                          background: '#F2D1D1',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 10px',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#c0392b',
                        }}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  )}

                  <div style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: '#655040',
                    textAlign: 'center',
                    marginBottom: 16,
                    paddingRight: isAdmin ? 130 : 0,
                  }}>
                    {j.judul}
                  </div>

                  <div style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#655040',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                  }}>
                    📅 Tanggal Kegiatan : {formatTanggal(j.tanggal)}
                  </div>

                  <div style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#655040',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                  }}>
                    🕐 Jam : {formatJam(j.waktu_mulai)}
                  </div>

                  <div style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#655040',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    📍 Lokasi : {j.lokasi || '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION PINK - TOMBOL AKTIFKAN PENGINGAT (selalu di bawah) */}
        {!isAdmin && (
          <div style={{
            background: '#FFF5F8',
            padding: '40px 30px',
            display: 'flex',
            alignItems: 'center',
            marginTop: 'auto',
          }}>
            <button
              onClick={handleAktifkanPengingat}
              style={{
                background: '#4E724C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 15,
                padding: '14px 36px',
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer',
                fontFamily: "'Noto Sans', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              🔔 Aktifkan Pengingat
            </button>
          </div>
        )}
      </div>

      {/* MODAL FORM TAMBAH/EDIT */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 15,
            padding: 30,
            width: 500,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ color: '#4E724C', marginBottom: 20 }}>
              {editId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
            </h2>

            <form onSubmit={handleSubmit}>
              {[
                { label: 'Judul Kegiatan', key: 'judul', type: 'text', required: true },
                { label: 'Tanggal', key: 'tanggal', type: 'date', required: true },
                { label: 'Waktu Mulai', key: 'waktu_mulai', type: 'time' },
                { label: 'Waktu Selesai', key: 'waktu_selesai', type: 'time' },
                { label: 'Lokasi', key: 'lokasi', type: 'text' },
              ].map((f) => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: '#655040', marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                    style={{
                      width: '100%',
                      padding: 10,
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: "'Noto Sans', sans-serif",
                    }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: '#655040', marginBottom: 6 }}>
                  Jenis Kegiatan
                </label>
                <select
                  value={form.jenis}
                  onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "'Noto Sans', sans-serif",
                  }}
                >
                  <option value="penimbangan">Penimbangan</option>
                  <option value="imunisasi">Imunisasi</option>
                  <option value="makanan_tambahan">Makanan Tambahan</option>
                  <option value="penyuluhan">Penyuluhan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: '#655040', marginBottom: 6 }}>
                  Deskripsi (opsional)
                </label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "'Noto Sans', sans-serif",
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditId(null); }}
                  style={{
                    padding: '10px 20px',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontFamily: "'Noto Sans', sans-serif",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#4E724C',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontFamily: "'Noto Sans', sans-serif",
                  }}
                >
                  {editId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}