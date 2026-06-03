import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import API from '../api'

const fontFamily = '"Segoe UI", Arial, Helvetica, sans-serif'

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

const pageSize = 7

function formatUsia(usiaBulan) {
  if (usiaBulan === undefined || usiaBulan === null || Number.isNaN(Number(usiaBulan))) {
    return '-'
  }

  const total = Number(usiaBulan)
  const tahun = Math.floor(total / 12)
  const bulan = total % 12

  if (tahun <= 0) return `${bulan} Bulan`
  if (bulan === 0) return `${tahun} Tahun`
  return `${tahun} Tahun ${bulan} Bulan`
}

function formatJenisKelamin(jenisKelamin) {
  if (jenisKelamin === 'L') return 'Laki-laki'
  if (jenisKelamin === 'P') return 'Perempuan'
  return jenisKelamin || '-'
}

function formatTanggal(tanggal) {
  if (!tanggal) return '-'

  const date = new Date(tanggal)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getAvatar(jenisKelamin) {
  return jenisKelamin === 'P' ? '👧' : '👦'
}

function getGenderColor(jenisKelamin) {
  return jenisKelamin === 'P' ? '#D364F7' : '#2F88F0'
}

function getAgeFilterValue(usiaBulan) {
  const umur = Number(usiaBulan || 0)

  if (umur <= 12) return '0-12'
  if (umur <= 24) return '13-24'
  if (umur <= 36) return '25-36'
  if (umur <= 60) return '37-60'
  return '60+'
}

function buildTindakanText(item) {
  if (item?.tindakan_terakhir) return item.tindakan_terakhir
  if (item?.catatan_tindakan) return item.catatan_tindakan
  return 'Pengukuran (BB, TB, Lingkar Kepala) dan Imunisasi'
}

function getLastMeasureDate(item) {
  return (
    item?.tanggal_ukur_terakhir ||
    item?.pertumbuhan_terakhir?.tanggal_ukur ||
    item?.riwayat_pertumbuhan?.[0]?.tanggal_ukur ||
    null
  )
}

export default function PilihAnak() {
  const navigate = useNavigate()
  const location = useLocation()

  const [balitaList, setBalitaList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [ageFilter, setAgeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchBalita = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await API.get('/balita?limit=100')

        if (!isMounted) return

        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : []

        setBalitaList(list)
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Gagal memuat data balita.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchBalita()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return balitaList.filter((item) => {
      const cocokSearch =
        !keyword ||
        item?.nama?.toLowerCase().includes(keyword) ||
        item?.nama_ibu?.toLowerCase().includes(keyword) ||
        item?.nik?.toLowerCase().includes(keyword) ||
        String(item?.id || '').toLowerCase().includes(keyword)

      const kategoriUsia = getAgeFilterValue(item?.usia_bulan)
      const cocokUsia = ageFilter === 'all' || kategoriUsia === ageFilter

      return cocokSearch && cocokUsia
    })
  }, [balitaList, search, ageFilter])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, ageFilter])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isActive = (to) => {
    if (to === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(to)
  }

  const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, filteredData.length)

  const visiblePages = useMemo(() => {
    const pages = []
    const maxVisible = 5

    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i += 1) {
      pages.push(i)
    }

    return pages
  }, [currentPage, totalPages])

  return (
    <div style={styles.page}>
      {/* Embedded sidebar removed — global AppSidebar from PegawaiShell takes over */}

      <main style={styles.main}>
        <header style={styles.hero}>
          <div style={styles.heroLeft}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={styles.backButton}
            >
              ←
            </button>

            <div>
              <h1 style={styles.heroTitle}>Pilih Balita</h1>
              <p style={styles.heroSubtitle}>
                Cari dan pilih balita untuk mengelola data balita
              </p>
            </div>
          </div>

          <div style={styles.heroRight}>
            <button type="button" style={styles.notificationButton}>
              🔔
            </button>

            <button
              type="button"
              onClick={() => navigate('/profil')}
              style={styles.userBadge}
            >
              👤 {user?.nama || 'User'}
            </button>
          </div>
        </header>

        <section style={styles.contentWrap}>
          <div style={styles.tableCard}>
            <div style={styles.topFilterBar}>
              <div style={styles.searchBox}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Cari nama anak / nama ibu / ID anak"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">Semua Usia</option>
                <option value="0-12">0 - 12 Bulan</option>
                <option value="13-24">13 - 24 Bulan</option>
                <option value="25-36">25 - 36 Bulan</option>
                <option value="37-60">37 - 60 Bulan</option>
                <option value="60+">&gt; 60 Bulan</option>
              </select>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '28%' }}>Nama Anak</th>
                    <th style={{ ...styles.th, width: '14%' }}>Usia</th>
                    <th style={{ ...styles.th, width: '18%' }}>Nama Ibu</th>
                    <th style={{ ...styles.th, width: '16%' }}>Terakhir Diukur</th>
                    <th style={{ ...styles.th, width: '24%' }}>Tindakan</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={styles.loadingCell}>
                        Memuat data...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={styles.loadingCell}>
                        Data tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => {
                      const lastMeasureDate = getLastMeasureDate(item)

                      return (
                        <tr
                          key={item.id}
                          style={styles.tr}
                          onClick={() => navigate(`/tumbuh-kembang/${item.id}`)}
                        >
                          <td style={styles.td}>
                            <div style={styles.nameCell}>
                              <div style={styles.avatarCircle}>
                                {item?.foto ? (
                                  <img
                                    src={item.foto}
                                    alt={item.nama}
                                    style={styles.avatarImage}
                                  />
                                ) : (
                                  <span>{getAvatar(item?.jenis_kelamin)}</span>
                                )}
                              </div>

                              <div>
                                <div style={styles.namaAnak}>{item?.nama || '-'}</div>
                                <div
                                  style={{
                                    ...styles.genderText,
                                    color: getGenderColor(item?.jenis_kelamin),
                                  }}
                                >
                                  {item?.jenis_kelamin === 'P' ? '♀' : '♂'}{' '}
                                  {formatJenisKelamin(item?.jenis_kelamin)}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={styles.td}>{formatUsia(item?.usia_bulan)}</td>
                          <td style={styles.td}>{item?.nama_ibu || '-'}</td>
                          <td style={styles.td}>
                            {lastMeasureDate ? formatTanggal(lastMeasureDate) : 'Belum diukur'}
                          </td>
                          <td style={styles.td}>
                            <div style={styles.tindakanText}>
                              {buildTindakanText(item)}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div style={styles.footerBar}>
              <div style={styles.resultText}>
                Menampilkan {startItem}-{endItem} dari {filteredData.length} anak
              </div>

              <div style={styles.pagination}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    ...styles.pageButton,
                    ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
                  }}
                >
                  ← Sebelumnya
                </button>

                {visiblePages[0] > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(1)}
                      style={styles.pageNumber}
                    >
                      1
                    </button>
                    {visiblePages[0] > 2 && <span style={styles.dotText}>...</span>}
                  </>
                )}

                {visiblePages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    style={{
                      ...styles.pageNumber,
                      ...(currentPage === page ? styles.pageNumberActive : {}),
                    }}
                  >
                    {page}
                  </button>
                ))}

                {visiblePages[visiblePages.length - 1] < totalPages && (
                  <>
                    {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                      <span style={styles.dotText}>...</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      style={styles.pageNumber}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    ...styles.pageButton,
                    ...(currentPage === totalPages ? styles.pageButtonDisabled : {}),
                  }}
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    background: '#4F724D',
    fontFamily,
  },

  sidebar: {
    width: 240,
    minHeight: '100vh',
    background: '#EAF0EF',
    borderRight: '1px solid rgba(0,0,0,0.05)',
    padding: '22px 14px 20px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    fontFamily,
  },

  brand: {
    border: 'none',
    background: 'transparent',
    color: '#3D6B43',
    fontSize: 27,
    fontWeight: 700,
    letterSpacing: '-0.6px',
    textAlign: 'left',
    cursor: 'pointer',
    padding: '0 6px',
    marginBottom: 28,
    fontFamily,
  },

  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },

  navLink: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 14px',
    borderRadius: 12,
    color: '#355C3C',
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 500,
    fontFamily,
  },

  navLinkActive: {
    background: '#CDEBCD',
    color: '#275031',
    fontWeight: 700,
  },

  navIcon: {
    width: 20,
    display: 'inline-flex',
    justifyContent: 'center',
    flexShrink: 0,
  },

  logoutButton: {
    minHeight: 46,
    borderRadius: 12,
    border: '1px solid rgba(61, 107, 67, 0.25)',
    background: 'transparent',
    color: '#355C3C',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily,
  },

  main: {
    flex: 1,
    minWidth: 0,
    background: '#4F724D',
    fontFamily,
  },

  hero: {
    padding: '24px 34px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
    color: '#fff',
    fontFamily,
  },

  heroLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
  },

  backButton: {
    border: 'none',
    background: 'transparent',
    color: '#fff',
    fontSize: 34,
    lineHeight: 1,
    cursor: 'pointer',
    padding: 0,
    marginTop: 2,
    fontFamily,
  },

  heroTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.4px',
    fontFamily,
  },

  heroSubtitle: {
    margin: '8px 0 0',
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontFamily,
  },

  heroRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  notificationButton: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: 'none',
    background: '#F7E5D8',
    cursor: 'pointer',
    fontSize: 16,
  },

  userBadge: {
    border: 'none',
    background: '#F7E5D8',
    color: '#6C5145',
    minHeight: 34,
    padding: '0 14px',
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily,
  },

  contentWrap: {
    padding: '10px 34px 34px',
  },

  tableCard: {
    background: '#FFF7F8',
    borderRadius: 16,
    border: '1px solid #E7CFCB',
    padding: 22,
    boxShadow: '0 12px 28px rgba(30, 45, 30, 0.12)',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },

  topFilterBar: {
    display: 'grid',
    gridTemplateColumns: '1fr 220px',
    gap: 16,
    alignItems: 'center',
    marginBottom: 18,
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    height: 44,
    background: '#F3DED2',
    border: '1px solid #E6C9B6',
    borderRadius: 10,
    padding: '0 14px',
    boxSizing: 'border-box',
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: '#6B5247',
    fontSize: 14,
    fontWeight: 500,
    fontFamily,
  },

  filterSelect: {
    height: 44,
    border: '1px solid #E6C9B6',
    borderRadius: 10,
    padding: '0 14px',
    background: '#F3DED2',
    color: '#6B5247',
    fontSize: 14,
    fontWeight: 600,
    outline: 'none',
    fontFamily,
  },

  errorBox: {
    background: '#FEE2E2',
    color: '#991B1B',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 14,
    fontWeight: 500,
  },

  tableWrap: {
    width: '100%',
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },

  th: {
    textAlign: 'left',
    padding: '14px 12px',
    color: '#6B5247',
    fontSize: 15,
    fontWeight: 700,
    borderTop: '1px solid #E7CFCB',
    borderBottom: '1px solid #E7CFCB',
    whiteSpace: 'nowrap',
    fontFamily,
  },

  tr: {
    cursor: 'pointer',
    transition: '0.2s ease',
  },

  td: {
    padding: '16px 12px',
    borderBottom: '1px solid #EFDADA',
    color: '#6B5247',
    fontSize: 14,
    verticalAlign: 'top',
    fontFamily,
  },

  loadingCell: {
    textAlign: 'center',
    padding: '26px 12px',
    color: '#8A6A5A',
    fontSize: 14,
    fontWeight: 500,
    fontFamily,
  },

  nameCell: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
  },

  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: '50%',
    background: '#EAEFF0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    overflow: 'hidden',
    flexShrink: 0,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  namaAnak: {
    fontSize: 15,
    fontWeight: 700,
    color: '#6B5247',
    marginBottom: 4,
    fontFamily,
  },

  genderText: {
    fontSize: 13,
    fontWeight: 700,
    fontFamily,
  },

  tindakanText: {
    lineHeight: 1.6,
    wordBreak: 'break-word',
    fontSize: 14,
    fontFamily,
  },

  footerBar: {
    marginTop: 18,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },

  resultText: {
    color: '#6B5247',
    fontSize: 14,
    fontWeight: 600,
    fontFamily,
  },

  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },

  pageButton: {
    minHeight: 34,
    padding: '0 12px',
    border: 'none',
    borderRadius: 8,
    background: '#F7B6B1',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily,
  },

  pageButtonDisabled: {
    background: '#F4D5D3',
    color: '#fff',
    cursor: 'not-allowed',
  },

  pageNumber: {
    width: 34,
    height: 34,
    border: 'none',
    borderRadius: 8,
    background: '#F7B6B1',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily,
  },

  pageNumberActive: {
    background: '#F38F8A',
  },

  dotText: {
    color: '#8A6A5A',
    padding: '0 4px',
    fontWeight: 700,
  },
}