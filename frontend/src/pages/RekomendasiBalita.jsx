import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const fontFamily = '"Segoe UI", Arial, Helvetica, sans-serif'

// Sama persis dengan buildRecommendation di TumbuhKembang.jsx
const buildRecommendation = (statusGizi, usiaBulan) => {
  const status = (statusGizi || 'gizi_baik').toLowerCase()
  const usia = Number(usiaBulan || 0)

  const nutrisi =
    status === 'gizi_kurang'
      ? [
          'Tingkatkan konsumsi protein seperti telur, ikan, ayam, dan tahu.',
          'Tambahkan sumber kalori sehat seperti alpukat, kentang, dan susu.',
          'Berikan makan utama 3 kali sehari dan selingan 2 kali sehari.',
          'Kurangi minuman manis yang dapat menurunkan nafsu makan.',
        ]
      : status === 'gizi_lebih' || status === 'obesitas'
      ? [
          'Atur porsi makan anak agar tetap seimbang.',
          'Kurangi makanan tinggi gula, gorengan, dan snack kemasan.',
          'Perbanyak sayur, buah, dan air putih.',
          'Biasakan pola makan teratur tanpa ngemil berlebihan.',
        ]
      : [
          'Pertahankan pola makan seimbang dengan protein, sayur, dan buah.',
          'Berikan variasi menu agar anak tetap semangat makan.',
          'Pastikan asupan cairan cukup setiap hari.',
          'Batasi makanan instan dan minuman tinggi gula.',
        ]

  const aktivitas =
    usia < 24
      ? [
          'Ajak anak bermain aktif sesuai usia, misalnya merangkak, berjalan, atau memindahkan benda.',
          'Latih motorik halus melalui bermain balok, menyusun mainan, atau menggenggam benda aman.',
          'Batasi screen time sebisa mungkin.',
        ]
      : [
          'Ajak anak bermain aktif minimal 60 menit setiap hari.',
          'Latih motorik halus melalui menggambar, menyusun balok, atau mewarnai.',
          'Kurangi penggunaan gadget berlebihan.',
          'Pastikan anak cukup tidur dan punya jam istirahat yang teratur.',
        ]

  const imunisasi =
    usia < 24
      ? [
          'Pastikan imunisasi dasar lengkap sesuai usia.',
          'Cek buku KIA untuk memastikan jadwal imunisasi berikutnya.',
          'Datang ke posyandu/layanan kesehatan sesuai jadwal.',
        ]
      : [
          'Pastikan imunisasi lanjutan tetap diikuti sesuai jadwal.',
          'Simpan buku KIA untuk monitoring imunisasi.',
          'Konsultasikan ke petugas bila ada imunisasi yang terlewat.',
        ]

  const pantauan = [
    'Lakukan penimbangan berat badan secara berkala setiap bulan.',
    'Pantau tinggi badan dan lingkar kepala sesuai jadwal.',
    'Perhatikan perubahan nafsu makan, aktivitas, dan kualitas tidur anak.',
    'Bila ada penurunan kondisi, segera konsultasikan ke petugas kesehatan.',
  ]

  return { nutrisi, aktivitas, imunisasi, pantauan }
}

const sidebarMenus = [
  { icon: '🏠', label: 'Beranda', to: '/dashboard' },
  { icon: '📈', label: 'Tumbuh Kembang', to: '/tumbuh-kembang' },
  { icon: '💉', label: 'Imunisasi', to: '/imunisasi' },
  { icon: '📅', label: 'Jadwal Posyandu', to: '/jadwal' },
  { icon: '🏥', label: 'Kunjungan', to: '/riwayatkunjungan' },
  { icon: '📝', label: 'Penanganan & Rekomendasi', to: '/penanganan-rekomendasi' },
  { icon: '👶', label: 'Daftar Balita', to: '/daftar-balita' },
  { icon: '➕', label: 'Tambah Balita', to: '/tambah-balita' },
  { icon: '📋', label: 'Laporan Penimbangan', to: '/rekap-penimbangan' },
  { icon: '👤', label: 'Profil', to: '/profil' },
  { icon: '⚙️', label: 'Pengaturan', to: '/pengaturan' },
]

function Sidebar({ location, navigate }) {
  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <aside style={styles.sidebar}>
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        style={styles.brand}
      >
        PosyanduCeria
      </button>
      <nav style={styles.nav}>
        {sidebarMenus.map((menu) => (
          <Link
            key={menu.label}
            to={menu.to}
            style={{
              ...styles.navLink,
              ...(isActive(menu.to) ? styles.navLinkActive : {}),
            }}
          >
            <span>{menu.icon}</span>
            <span>{menu.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

function DetailModal({ item, onClose }) {
  if (!item) return null

  const rec = item.recommendation || {}

  const statusColor =
    item.status_gizi === 'Normal' || item.status_gizi === 'Gizi Baik'
      ? { bg: '#D4EDDA', text: '#1E7E34', icon: '✅' }
      : item.status_gizi === 'Gizi Kurang' || item.status_gizi === 'Stunting'
      ? { bg: '#FFF3CD', text: '#856404', icon: '⚠️' }
      : { bg: '#F8D7DA', text: '#721C24', icon: '🔴' }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalAvatarWrap}>
            <div style={styles.modalAvatar}>
              {item.jenis_kelamin === 'P' ? '👧' : '👦'}
            </div>
            <div>
              <div style={styles.modalNama}>{item.nama_anak}</div>
              <div style={{
                ...styles.modalGender,
                color: item.jenis_kelamin === 'P' ? '#D364F7' : '#2F88F0',
              }}>
                {item.jenis_kelamin === 'P' ? '♀ Perempuan' : '♂ Laki-laki'}
              </div>
              <div style={styles.modalUsia}>🎂 {item.usia}</div>
            </div>
          </div>

          <div style={styles.statusBox}>
            <div style={styles.statusTitle}>Status Gizi Terakhir</div>
            <div style={{
              ...styles.statusBadge,
              background: statusColor.bg,
              color: statusColor.text,
            }}>
              {statusColor.icon} {item.status_gizi || 'Normal'}
            </div>
            <div style={styles.statusSub}>
              Berdasarkan pengukuran<br />
              {item.tanggal}
            </div>
          </div>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoItem}><span>👩</span> Nama Ibu: <b>{item.ibu}</b></div>
          <div style={styles.infoItem}><span>👤</span> Dibuat Oleh: <b>{item.dibuat_oleh}</b></div>
        </div>

        <div style={styles.recSections}>
          <div style={styles.recCard}>
            <div style={styles.recCardHeader}>
              <div style={{ ...styles.recIcon, background: '#D4EDDA', color: '#2E7D32' }}>🥗</div>
              <span style={styles.recCardTitle}>Nutrisi</span>
            </div>
            <ul style={styles.recList}>
              {(rec.nutrisi || []).map((p, i) => <li key={i} style={styles.recItem}>{p}</li>)}
            </ul>
          </div>

          <div style={styles.recCard}>
            <div style={styles.recCardHeader}>
              <div style={{ ...styles.recIcon, background: '#FFF9C4', color: '#F57F17' }}>🏃</div>
              <span style={styles.recCardTitle}>Aktivitas</span>
            </div>
            <ul style={styles.recList}>
              {(rec.aktivitas || []).map((p, i) => <li key={i} style={styles.recItem}>{p}</li>)}
            </ul>
          </div>

          <div style={styles.recCard}>
            <div style={styles.recCardHeader}>
              <div style={{ ...styles.recIcon, background: '#EDE7F6', color: '#7B1FA2' }}>💉</div>
              <span style={styles.recCardTitle}>Imunisasi</span>
            </div>
            <ul style={styles.recList}>
              {(rec.imunisasi || []).map((p, i) => <li key={i} style={styles.recItem}>{p}</li>)}
            </ul>
          </div>

          <div style={styles.recCard}>
            <div style={styles.recCardHeader}>
              <div style={{ ...styles.recIcon, background: '#FFEBEE', color: '#C62828' }}>📊</div>
              <span style={styles.recCardTitle}>Pantauan</span>
            </div>
            <ul style={styles.recList}>
              {(rec.pantauan || []).map((p, i) => <li key={i} style={styles.recItem}>{p}</li>)}
            </ul>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.closeBtn} onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  )
}

export default function RekomendasiBalita() {
  const navigate = useNavigate()
  const location = useLocation()

  const [data, setData] = useState([])
  const [search, setSearch] = useState('')
  const [viewItem, setViewItem] = useState(null)

  const loadData = () => {
    const saved = JSON.parse(
      localStorage.getItem('rekomendasi_balita') || '[]'
    )
    setData(saved)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Hapus rekomendasi ini?')
    if (!confirmDelete) return

    const filtered = data.filter((item) => item.id !== id)
    localStorage.setItem('rekomendasi_balita', JSON.stringify(filtered))
    setData(filtered)

    if (viewItem?.id === id) setViewItem(null)
  }

  // Tombol pensil: navigate ke TumbuhKembang dengan mode edit rekomendasi
  const handleUpdate = (item) => {
    const childId = item.childId
    if (childId) {
      navigate(`/tumbuh-kembang/${childId}`, {
        state: { isEditMode: true, rekomendasiId: item.id },
      })
    } else {
      navigate('/tumbuh-kembang')
    }
  }

  const [namaUser, setNamaUser] = useState('')

  useEffect(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setNamaUser(user.nama || user.name || user.username || 'User')
  } catch {
    setNamaUser('User')
  }
  }, [])

  const filteredData = data.filter((item) =>
    item.nama_anak?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={styles.page}>
      <Sidebar location={location} navigate={navigate} />

      <main style={styles.main}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button
              onClick={() => navigate('/tumbuh-kembang')}
              style={styles.backButton}
            >
              ←
            </button>
            <div>
              <h1 style={styles.title}>Rekomendasi Balita</h1>
              <p style={styles.subtitle}>
                Daftar rekomendasi berdasarkan riwayat tumbuh kembang
              </p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <button style={styles.notification}>🔔</button>
            <div style={styles.userBadge}>👤 {namaUser}</div>
          </div>
        </header>

        <div style={styles.content}>
          <div style={styles.card}>
            <div style={styles.topBar}>
              <div style={styles.searchBox}>
                🔍
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama anak / nama ibu / ID anak"
                  style={styles.searchInput}
                />
              </div>
              <select style={styles.select}>
                <option>Semua Usia</option>
              </select>
            </div>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nama Anak</th>
                  <th style={styles.th}>Terakhir Diperbarui</th>
                  <th style={styles.th}>Dibuat Oleh</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>
                      <div style={styles.childCell}>
                        <div style={styles.avatar}>
                          {item.jenis_kelamin === 'P' ? '👧' : '👦'}
                        </div>
                        <div>
                          <div style={styles.childName}>{item.nama_anak}</div>
                          <div style={{
                            ...styles.gender,
                            color: item.jenis_kelamin === 'P' ? '#D364F7' : '#2F88F0',
                          }}>
                            {item.jenis_kelamin === 'P' ? '♀ Perempuan' : '♂ Laki-laki'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{item.tanggal}</td>
                    <td style={styles.td}>{item.dibuat_oleh}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          style={styles.actionBtn}
                          title="Lihat Rekomendasi"
                          onClick={() => setViewItem(item)}
                        >
                          👁
                        </button>
                        <button
                          style={styles.actionBtn}
                          title="Generate Ulang Rekomendasi"
                          onClick={() => handleUpdate(item)}
                        >
                          ✏️
                        </button>
                        <button
                          style={styles.actionBtn}
                          title="Hapus"
                          onClick={() => handleDelete(item.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ ...styles.td, color: '#aaa', textAlign: 'center', padding: 32 }}>
                      Belum ada data rekomendasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={styles.generateWrap}>
              <button
                style={styles.generateButton}
                onClick={() => navigate('/tumbuh-kembang')}
              >
                ✨ Generate Baru
              </button>
            </div>
          </div>
        </div>
      </main>

      {viewItem && (
        <DetailModal item={viewItem} onClose={() => setViewItem(null)} />
      )}
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#4F724D',
    fontFamily,
  },
  sidebar: {
    width: 240,
    background: '#EAF0EF',
    padding: 20,
  },
  brand: {
    border: 'none',
    background: 'transparent',
    fontSize: 28,
    fontWeight: 700,
    color: '#3D6B43',
    marginBottom: 30,
    cursor: 'pointer',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  navLink: {
    textDecoration: 'none',
    color: '#355C3C',
    padding: 14,
    borderRadius: 12,
    display: 'flex',
    gap: 12,
    fontWeight: 600,
  },
  navLinkActive: {
    background: '#CDEBCD',
  },
  main: {
    flex: 1,
    padding: 26,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    display: 'flex',
    gap: 14,
    alignItems: 'center',
  },
  backButton: {
    border: 'none',
    background: 'transparent',
    color: '#fff',
    fontSize: 34,
    cursor: 'pointer',
  },
  title: {
    margin: 0,
    color: '#fff',
    fontSize: 34,
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    color: '#E7F2E6',
  },
  headerRight: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  notification: {
    border: 'none',
    borderRadius: '50%',
    width: 38,
    height: 38,
    cursor: 'pointer',
  },
  userBadge: {
    background: '#F7E5D8',
    padding: '10px 16px',
    borderRadius: 30,
    fontWeight: 700,
    color: '#6B5247',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  card: {
    background: '#FFF7F8',
    borderRadius: 20,
    padding: 24,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  searchBox: {
    background: '#F3DED2',
    borderRadius: 10,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: 420,
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
  },
  select: {
    border: 'none',
    background: '#F3DED2',
    borderRadius: 8,
    padding: '10px 16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: 14,
    color: '#6B5247',
    borderBottom: '1px solid #E7CFCB',
  },
  td: {
    padding: 14,
    textAlign: 'center',
    borderBottom: '1px solid #F0DCDC',
  },
  childCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: '#EAF0EF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
  },
  childName: {
    fontWeight: 700,
    color: '#6B5247',
  },
  gender: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: 600,
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtn: {
    border: 'none',
    width: 36,
    height: 36,
    borderRadius: 10,
    background: '#EEF2FF',
    cursor: 'pointer',
  },
  generateWrap: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  generateButton: {
    border: 'none',
    background: '#E9D5FF',
    color: '#9333EA',
    borderRadius: 16,
    padding: '14px 22px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(147,51,234,0.25)',
  },

  // Modal styles
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalBox: {
    background: '#FFF7F8',
    borderRadius: 20,
    padding: 28,
    width: '90%',
    maxWidth: 620,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    background: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  modalAvatarWrap: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
  },
  modalAvatar: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: '#EAF0EF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 38,
    border: '2px solid #CDEBCD',
  },
  modalNama: {
    fontWeight: 700,
    fontSize: 20,
    color: '#3D4A3E',
    marginBottom: 4,
  },
  modalGender: {
    fontWeight: 600,
    fontSize: 13,
    marginBottom: 4,
  },
  modalUsia: {
    fontSize: 13,
    color: '#6B5247',
  },
  statusBox: {
    background: '#F4FAF4',
    border: '1px solid #C8E6C9',
    borderRadius: 14,
    padding: '14px 20px',
    textAlign: 'center',
    minWidth: 160,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#4B7A4E',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    borderRadius: 30,
    padding: '6px 18px',
    fontWeight: 700,
    fontSize: 15,
    display: 'inline-block',
    marginBottom: 8,
  },
  statusSub: {
    fontSize: 11,
    color: '#6B8C6E',
    lineHeight: 1.5,
  },
  infoGrid: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  infoItem: {
    background: '#fff',
    borderRadius: 10,
    padding: '8px 16px',
    fontSize: 13,
    color: '#6B5247',
    flex: 1,
    minWidth: 160,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  recSections: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  recCard: {
    background: '#fff',
    borderRadius: 14,
    padding: '14px 18px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  recCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  recIcon: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  recCardTitle: {
    fontWeight: 700,
    fontSize: 15,
    color: '#3D4A3E',
  },
  recList: {
    margin: 0,
    paddingLeft: 20,
  },
  recItem: {
    color: '#4A4A4A',
    fontSize: 13,
    lineHeight: 1.8,
  },
  modalFooter: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  closeBtn: {
    border: 'none',
    background: '#E9D5FF',
    color: '#9333EA',
    borderRadius: 12,
    padding: '10px 24px',
    fontWeight: 700,
    cursor: 'pointer',
  },
}
