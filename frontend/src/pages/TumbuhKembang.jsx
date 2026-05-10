import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import API from '../api'

export default function TumbuhKembang() {
  const { id } = useParams()
  const [balita, setBalita] = useState(null)
  const [riwayat, setRiwayat] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) {
      navigate('/tumbuh-kembang')
      return
    }

    API.get(`/balita/${id}`)
      .then(res => setBalita(res.data.data))
      .catch(() => navigate('/tumbuh-kembang'))

    API.get(`/balita/${id}/pertumbuhan`)
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
    return `${th} th ${bln} bln`
  }

  const formatTanggal = (tgl) => {
    if (!tgl) return '-'
    const d = new Date(tgl)
    const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`
  }

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

        {[
            { icon: '🏠', label: 'Beranda', to: '/dashboard' },
            { icon: '📈', label: 'Tumbuh Kembang', to: '/tumbuh-kembang' },
            { icon: '💉', label: 'Imunisasi', to: '/imunisasi' },
            { icon: '📅', label: 'Jadwal Posyandu', to: '/jadwal' },
            { icon: '🏥', label: 'Riwayat Kunjungan', to: '/kunjungan' },
            { icon: '👤', label: 'Profil', to: '/profil' },
            { icon: '⚙️', label: 'Pengaturan', to: '/pengaturan' },
        ].map((item) => (
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
      <div style={{ flex: 1, position: 'relative' }}>

        {/* HEADER HIJAU */}
        <div style={{
          background: '#4E724C',
          padding: '24px 30px 40px',
        }}>

          {/* Header Title + Profile */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <div>
              <Link
                to="/tumbuh-kembang"
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
                Tumbuh Kembang
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

          {/* CARD DATA ANAK */}
          {balita && (
            <>
              <div style={{
                fontWeight: 800,
                fontSize: 18,
                color: '#FFFFFF',
                marginBottom: 12,
              }}>
                Data Anak
              </div>

              <div style={{
                background: '#FFF5F8',
                borderRadius: 15,
                padding: 24,
                display: 'flex',
                gap: 30,
                alignItems: 'center',
              }}>
                <div style={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: '#E9EFEF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 80,
                  flexShrink: 0,
                }}>
                  {balita.jenis_kelamin === 'L' ? '👦' : '👧'}
                </div>

                <div style={{ flex: 1, display: 'flex', gap: 60 }}>
                  <div>
                    <div style={{
                      fontWeight: 800,
                      fontSize: 22,
                      color: '#655040',
                      marginBottom: 8,
                    }}>
                      {balita.nama}
                    </div>

                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
                      <span style={{
                        background: '#E4ECF8',
                        color: '#3287EF',
                        fontWeight: 700,
                        fontSize: 13,
                        padding: '2px 10px',
                        borderRadius: 6,
                      }}>
                        {balita.jenis_kelamin === 'L' ? '♂ Laki-laki' : '♀ Perempuan'}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#655040' }}>
                        {formatUsia(balita.usia_bulan)}
                      </span>
                    </div>

                    {[
                      { icon: '📅', label: 'Tanggal Lahir', value: formatTanggal(balita.tanggal_lahir) },
                      { icon: '🆔', label: 'ID Anak', value: balita.nik || `AN-${balita.id.toString().padStart(5, '0')}` },
                      { icon: '👩', label: 'Nama Ibu', value: balita.nama_ibu || '-' },
                      { icon: '🏥', label: 'Posyandu', value: 'Posyandu Ceria' },
                      { icon: '📍', label: 'Kunjungan Terakhir', value: riwayat[0] ? formatTanggal(riwayat[0].tanggal_ukur) : '-' },
                    ].map((row, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        marginBottom: 6,
                      }}>
                        <span>{row.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#655040', width: 130 }}>
                          {row.label}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#655040' }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    background: '#CFEBD2',
                    borderRadius: 15,
                    padding: '20px 24px',
                    width: 260,
                    height: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'flex-start',
                  }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: 18,
                      color: '#4E724C',
                      marginBottom: 18,
                    }}>
                      Status Gizi Terakhir
                    </div>

                    <div style={{
                      background: '#CEFCBD',
                      borderRadius: 30,
                      padding: '8px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 14,
                    }}>
                      <span style={{ fontSize: 20 }}>✅</span>
                      <span style={{ fontWeight: 600, fontSize: 18, color: '#4E724C' }}>
                        {riwayat[0]?.is_stunting ? 'Stunting' : 'Normal'}
                      </span>
                    </div>

                    <div style={{
                      fontSize: 12,
                      color: '#6A6A6A',
                      textAlign: 'center',
                      fontWeight: 700,
                      lineHeight: '1.3',
                    }}>
                      Berdasarkan pengukuran<br />
                      {riwayat[0] ? formatTanggal(riwayat[0].tanggal_ukur) : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* SECTION PINK */}
        <div style={{ background: '#FFF5F8', padding: '30px' }}>

          <div style={{ fontWeight: 800, fontSize: 18, color: '#655040', marginBottom: 16 }}>
            Grafik Tumbuh Kembang
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { title: 'Berat Badan per Usia (BB/U)', label: 'Berat (kg)' },
              { title: 'Tinggi Badan per Usia (TB/U)', label: 'Tinggi (cm)' },
              { title: 'Berat Badan per Tinggi Badan (BB/TB)', label: 'Berat (kg)' },
            ].map((g, i) => (
              <div key={i} style={{
                background: '#FFFFFF',
                borderRadius: 10,
                padding: 16,
                flex: 1,
                minWidth: 280,
                minHeight: 250,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#655040', marginBottom: 8 }}>
                  {g.title}
                </div>
                <div style={{
                  display: 'inline-block',
                  background: '#CEFCBD',
                  color: '#4E724C',
                  fontWeight: 600,
                  fontSize: 12,
                  padding: '2px 14px',
                  borderRadius: 30,
                  marginBottom: 12,
                }}>
                  Normal
                </div>
                <div style={{
                  height: 180,
                  background: 'linear-gradient(to bottom, rgba(255,15,15,0.15) 0%, #FFE9AE 30%, #E4F8EB 50%, #FFE9AE 70%, rgba(255,15,15,0.15) 100%)',
                  borderRadius: 4,
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: '#999',
                    fontSize: 11,
                  }}>
                    {g.label}<br />(Grafik akan tampil)
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#4E724C', marginTop: 8, textAlign: 'center' }}>
                  Hasil Pengukuran Anak
                </div>
              </div>
            ))}
          </div>

          {/* INFO Z-SCORE */}
          <div style={{
            background: '#F2D1D1',
            borderRadius: 15,
            padding: '18px 24px',
            display: 'flex',
            gap: 30,
            marginBottom: 30,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>📋</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#655040', marginBottom: 6 }}>
                Tentang Grafik Tumbuh Kembang
              </div>
              <div style={{ fontSize: 12, color: '#655040', lineHeight: '15px' }}>
                Grafik ini menunjukkan status pertumbuhan anak berdasarkan standar WHO. Z-Score adalah indikator yang digunakan untuk menilai apakah pertumbuhan anak sesuai, kurang, atau lebih dari standar.
              </div>
            </div>

            <div style={{ borderLeft: '1px solid rgba(106,106,106,0.4)', paddingLeft: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#655040', marginBottom: 10 }}>
                Keterangan Z-Score WHO
              </div>
              {[
                { color: 'rgba(255,15,15,0.6)', text: '< -3 SD → Stunting / Sangat Kurang' },
                { color: '#FFE9AE', text: '-3 SD s/d -2 SD → Risiko' },
                { color: '#E4F8EB', text: '-2 SD s/d +2 SD → Normal' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 16, height: 15, background: row.color }}></div>
                  <span style={{ fontSize: 12, color: '#655040' }}>{row.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIWAYAT PENGUKURAN */}
          <div style={{
            fontWeight: 800,
            fontSize: 18,
            color: '#655040',
            marginBottom: 14,
          }}>
            Riwayat Pengukuran
          </div>

          <div style={{
            background: '#FFFFFF',
            borderRadius: 10,
            padding: '16px 24px',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#E4ECF8' }}>
                  {['Tanggal', 'Usia', 'Berat Badan (Kg)', 'Tinggi Badan (Cm)', 'BB/U', 'TB/U', 'BB/TB', 'Status Gizi'].map((h) => (
                    <th key={h} style={{
                      padding: '8px 10px',
                      fontWeight: 700,
                      fontSize: 13,
                      color: '#655040',
                      textAlign: 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riwayat.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 13 }}>
                      Belum ada data pengukuran
                    </td>
                  </tr>
                ) : (
                  riwayat.slice().reverse().map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px 10px', fontSize: 12, color: '#655040' }}>{formatTanggal(r.tanggal_ukur)}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, color: '#655040' }}>{formatUsia(balita?.usia_bulan)}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, color: '#655040' }}>{r.berat_badan}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, color: '#655040' }}>{r.tinggi_badan}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, color: '#655040' }}>0 (Normal)</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, color: '#655040' }}>0 (Normal)</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, color: '#655040' }}>0 (Normal)</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          background: '#CEFCBD',
                          color: '#4E724C',
                          fontWeight: 700,
                          fontSize: 12,
                          padding: '2px 14px',
                          borderRadius: 30,
                        }}>
                          {r.is_stunting ? 'Stunting' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}