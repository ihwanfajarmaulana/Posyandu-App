import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api'
import { SharedSidebar } from '../components/SidebarLayout'
import useRefreshOnFocus from '../hooks/useRefreshOnFocus'

export default function PilihAnakImunisasi() {
  const [balita, setBalita] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'
  const refresh = useRefreshOnFocus()

  useEffect(() => {
    API.get('/balita')
      .then(res => setBalita(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [refresh])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const filtered = balita.filter(b =>
    b.nama.toLowerCase().includes(search.toLowerCase()) ||
    b.orang_tua?.nama?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      fontFamily: "'Noto Sans', sans-serif",
      display: 'flex',
    }}>
      <SharedSidebar activePath="/imunisasi" onLogout={handleLogout} />

      {/* KONTEN UTAMA */}
      <div style={{ flex: 1, background: '#FFF5F8', padding: '40px 50px' }}>

        <div style={{
          fontWeight: 700,
          fontSize: 28,
          color: '#4E724C',
          marginBottom: 8,
        }}>
          {isAdmin ? 'Pilih Data Anak' : 'Pilih Anak Anda'}
        </div>

        <div style={{
          fontSize: 14,
          color: '#655040',
          marginBottom: 24,
        }}>
          {isAdmin
            ? 'Pilih anak yang ingin dilihat riwayat imunisasinya'
            : 'Pilih salah satu anak Anda untuk melihat riwayat imunisasinya'}
        </div>

        {isAdmin && (
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Cari nama anak atau nama orang tua..."
            style={{
              width: '100%',
              maxWidth: 500,
              padding: '12px 18px',
              borderRadius: 12,
              border: '1px solid #ddd',
              fontSize: 14,
              fontFamily: "'Noto Sans', sans-serif",
              marginBottom: 24,
              outline: 'none',
            }}
          />
        )}

        {loading ? (
          <div style={{ color: '#655040' }}>Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            padding: 40,
            borderRadius: 15,
            textAlign: 'center',
            color: '#655040',
          }}>
            {balita.length === 0 ? 'Belum ada data balita.' : 'Tidak ada hasil pencarian.'}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {filtered.map((b) => (
              <Link
                key={b.id}
                to={`/imunisasi/${b.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: 15,
                  padding: 20,
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    background: '#E9EFEF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    flexShrink: 0,
                  }}>
                    {b.jenis_kelamin === 'L' ? '👦' : '👧'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 17, color: '#4E724C', marginBottom: 4 }}>
                      {b.nama}
                    </div>
                    <div style={{ fontSize: 12, color: '#655040', marginBottom: 2 }}>
                      {b.jenis_kelamin === 'L' ? '♂ Laki-laki' : '♀ Perempuan'} • {b.usia_bulan} bulan
                    </div>
                    {isAdmin && b.orang_tua && (
                      <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                        Orang tua: {b.orang_tua.nama}
                      </div>
                    )}
                  </div>

                  <div style={{ color: '#4E724C', fontSize: 18 }}>→</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}