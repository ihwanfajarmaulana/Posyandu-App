import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import API from '../api'
import { SharedSidebar } from '../components/SidebarLayout'

// Daftar lengkap vaksin standar
const VAKSIN_STANDAR = [
  { nama: 'Hepatitis B', usia: '0-7 hari', warna: '#779BFE' },
  { nama: 'BCG', usia: '0-1 Bulan', warna: '#89D1C9' },
  { nama: 'DPT-HB-Hib1', usia: '2 Bulan', warna: '#FFE9AE' },
  { nama: 'Polio 1', usia: '2 Bulan', warna: '#F6CB9F' },
  { nama: 'DPT-HB-Hib2', usia: '3 Bulan', warna: '#FFE9AE' },
  { nama: 'Polio 2', usia: '3 Bulan', warna: '#F6CB9F' },
  { nama: 'DPT-HB-Hib3', usia: '4 Bulan', warna: '#FFE9AE' },
  { nama: 'Polio 3', usia: '4 Bulan', warna: '#ECAEFF' },
  { nama: 'Campak Rubella', usia: '9 Bulan', warna: '#FFAFAE' },
  { nama: 'DPT Booster', usia: '18 Bulan', warna: '#AEE0FF' },
  { nama: 'Campak Rubella 2', usia: '24 Bulan', warna: '#FFAFAE' },
]

export default function Imunisasi() {
  const { id } = useParams()
  const [balita, setBalita] = useState(null)
  const [riwayat, setRiwayat] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) {
      navigate('/imunisasi')
      return
    }

    API.get(`/balita/${id}`)
      .then(res => setBalita(res.data.data))
      .catch(() => navigate('/imunisasi'))

    API.get(`/balita/${id}/imunisasi`)
      .then(res => setRiwayat(res.data.data))
      .catch(() => {})
  }, [id, navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const formatUsia = (bulan) => {
    if (!bulan && bulan !== 0) return '-'
    const th = Math.floor(bulan / 12)
    const bln = bulan % 12
    return `${th} Tahun ${bln} Bulan`
  }

  const formatTanggal = (tgl) => {
    if (!tgl) return '-'
    const d = new Date(tgl)
    const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`
  }

  // Mapping riwayat ke daftar vaksin standar
  const getDataVaksin = (namaVaksin) => {
    return riwayat.find(r => r.nama_vaksin?.toLowerCase().includes(namaVaksin.toLowerCase().split(' ')[0]))
  }

  // Statistik
  const totalDiberikan = riwayat.length
  const totalTerjadwal = VAKSIN_STANDAR.filter(v => !getDataVaksin(v.nama)).length

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      fontFamily: "'Noto Sans', sans-serif",
      display: 'flex',
    }}>
      <SharedSidebar activePath="/imunisasi" onLogout={handleLogout} />

      {/* KONTEN UTAMA */}
      <div style={{ flex: 1 }}>

        {/* HEADER HIJAU */}
        <div style={{
          background: '#4E724C',
          padding: '24px 30px 30px',
        }}>

          {/* Header Title + Profile */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}>
            <div>
              <Link
                to="/imunisasi"
                style={{
                  color: '#FFF5F8',
                  textDecoration: 'none',
                  fontSize: 13,
                  display: 'block',
                  marginBottom: 4,
                  opacity: 0.8,
                }}
              >
                ← Kembali ke daftar anak
              </Link>
              <div style={{
                fontWeight: 700,
                fontSize: 26,
                color: '#FFF5F8',
              }}>
                Riwayat Imunisasi
              </div>
              <div style={{
                fontSize: 13,
                color: '#FFFFFF',
                marginTop: 4,
                opacity: 0.9,
              }}>
                Pantau riwayat imunisasi {balita?.nama || 'anak'} agar tidak ada vaksin yang terlewat
              </div>
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
                  {JSON.parse(localStorage.getItem('user') || '{}').nama || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD INFO ANAK */}
        {balita && (
          <div style={{
            background: '#FFF5F8',
            padding: '20px 30px',
            display: 'flex',
            alignItems: 'center',
            gap: 30,
          }}>
            <div style={{
              width: 88,
              height: 88,
              background: '#E9EFEF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              flexShrink: 0,
            }}>
              {balita.jenis_kelamin === 'L' ? '👦' : '👧'}
            </div>

            <div>
              <div style={{
                fontWeight: 800,
                fontSize: 22,
                color: '#655040',
                marginBottom: 6,
              }}>
                {balita.nama}
              </div>

              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 4 }}>
                <span style={{
                  color: '#3287EF',
                  fontWeight: 700,
                  fontSize: 13,
                }}>
                  {balita.jenis_kelamin === 'L' ? '♂ Laki-laki' : '♀ Perempuan'}
                </span>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#655040' }}>
                  {formatUsia(balita.usia_bulan)}
                </span>
              </div>

              <div style={{ fontWeight: 700, fontSize: 13, color: '#655040' }}>
                🆔 {balita.nik || `AN-${balita.id.toString().padStart(5, '0')}`}
              </div>
            </div>
          </div>
        )}

        {/* SECTION HIJAU - STATISTIK + TABEL */}
        <div style={{
          background: '#4E724C',
          padding: '30px',
        }}>

          {/* 4 CARD STATISTIK */}
          <div style={{
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
            marginBottom: 30,
          }}>
            {[
              { icon: '🛡️', bg: '#779BFE', title: 'Total Imunisasi', value: VAKSIN_STANDAR.length },
              { icon: '✅', bg: '#86E491', title: 'Imunisasi Lengkap', value: totalDiberikan },
              { icon: '🕐', bg: '#FFE9AE', title: 'Imunisasi Terjadwal', value: totalTerjadwal },
              { icon: '⚠️', bg: '#F2D1D1', title: 'Imunisasi Terlambat', value: 0 },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#FFF5F8',
                borderRadius: 15,
                padding: 20,
                flex: '1 1 200px',
                minWidth: 175,
              }}>
                <div style={{
                  width: 41,
                  height: 41,
                  borderRadius: '50%',
                  background: s.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  marginBottom: 14,
                }}>
                  {s.icon}
                </div>
                <div style={{
                  fontWeight: 800,
                  fontSize: 18,
                  color: '#655040',
                  lineHeight: '1.2',
                  marginBottom: 8,
                }}>
                  {s.title}
                </div>
                <div style={{
                  fontWeight: 800,
                  fontSize: 25,
                  color: '#655040',
                  marginBottom: 6,
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: '#655040',
                }}>
                  Jenis
                </div>
              </div>
            ))}
          </div>

          {/* JUDUL JADWAL */}
          <div style={{
            fontWeight: 800,
            fontSize: 18,
            color: '#FFF5F8',
            marginBottom: 14,
          }}>
            Jadwal Imunisasi
          </div>

          {/* TABEL VAKSIN */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 10,
            padding: 24,
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #655040' }}>
                  {['', 'Vaksin', 'Usia Ideal', 'Status', 'Tanggal Pemberian', 'BB (Kg)', 'TB (Cm)'].map((h, i) => (
                    <th key={i} style={{
                      padding: '10px 8px',
                      fontWeight: 700,
                      fontSize: 14,
                      color: '#655040',
                      textAlign: 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VAKSIN_STANDAR.map((v, i) => {
                  const data = getDataVaksin(v.nama)
                  const sudah = !!data
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #E5E5E5' }}>
                      <td style={{ padding: '10px 8px', width: 50 }}>
                        <div style={{
                          width: 35,
                          height: 35,
                          borderRadius: '50%',
                          background: v.warna,
                        }}></div>
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: 12, color: '#655040', fontWeight: 500 }}>
                        {v.nama}
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: 12, color: '#655040', fontWeight: 500 }}>
                        {v.usia}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{
                          background: sudah ? '#CEFCBD' : '#E4ECF8',
                          color: '#4E724C',
                          fontWeight: 700,
                          fontSize: 12,
                          padding: '4px 14px',
                          borderRadius: 30,
                          display: 'inline-block',
                        }}>
                          {sudah ? 'Sudah Diberikan' : 'Terjadwal'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: 12, color: '#655040', fontWeight: 500 }}>
                        {sudah ? formatTanggal(data.tanggal_pemberian) : '-'}
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: 12, color: '#655040' }}>
                        {sudah && data.berat_badan ? data.berat_badan : '-'}
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: 12, color: '#655040' }}>
                        {sudah && data.tinggi_badan ? data.tinggi_badan : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}