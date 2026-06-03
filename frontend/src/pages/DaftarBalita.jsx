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

function formatJenisKelamin(jk) {
  if (jk === 'L') return 'Laki-laki'
  if (jk === 'P') return 'Perempuan'
  return jk || '-'
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

function getAvatar(jk) {
  return jk === 'P' ? '👧' : '👦'
}

function getGenderColor(jk) {
  return jk === 'P' ? '#D364F7' : '#2F88F0'
}

function getAgeFilterValue(usiaBulan) {
  const umur = Number(usiaBulan || 0)

  if (umur <= 12) return '0-12'
  if (umur <= 24) return '13-24'
  if (umur <= 36) return '25-36'
  if (umur <= 60) return '37-60'
  return '60+'
}

function toDateValue(date) {
  if (!date) return 0

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return 0

  return parsed.getTime()
}

function formatAngka(value, suffix = '') {
  if (value === undefined || value === null || value === '') return null
  return `${value}${suffix}`
}

function getPertumbuhanTerakhir(item) {
  return (
    item?.pertumbuhan_terakhir ||
    item?.riwayat_pertumbuhan?.[0] ||
    null
  )
}

function getKunjunganTerakhir(item) {
  return (
    item?.kunjungan_terakhir ||
    item?.kunjungan?.[0] ||
    null
  )
}

function getImunisasiTerakhir(item) {
  return (
    item?.imunisasi_terakhir ||
    item?.riwayat_imunisasi?.[0] ||
    null
  )
}

function getLastMeasureDate(item) {
  const pertumbuhan = getPertumbuhanTerakhir(item)
  const kunjungan = getKunjunganTerakhir(item)
  const imunisasi = getImunisasiTerakhir(item)

  const daftarTanggal = [
    item?.tanggal_ukur_terakhir,
    pertumbuhan?.tanggal_ukur,
    item?.tanggal_kunjungan_terakhir,
    kunjungan?.tanggal_kunjungan,
    item?.tanggal_imunisasi_terakhir,
    imunisasi?.tanggal_pemberian,
  ]
    .filter(Boolean)
    .sort((a, b) => toDateValue(b) - toDateValue(a))

  return daftarTanggal[0] || null
}

function getTindakanTerakhir(item) {
  const pertumbuhan = getPertumbuhanTerakhir(item)
  const kunjungan = getKunjunganTerakhir(item)
  const imunisasi = getImunisasiTerakhir(item)

  const daftarTindakan = []

  if (pertumbuhan) {
    daftarTindakan.push({
      jenis: 'pertumbuhan',
      tanggal: toDateValue(
        item?.tanggal_ukur_terakhir ||
        pertumbuhan?.tanggal_ukur
      ),
      data: pertumbuhan,
    })
  }

  if (kunjungan) {
    daftarTindakan.push({
      jenis: 'kunjungan',
      tanggal: toDateValue(
        item?.tanggal_kunjungan_terakhir ||
        kunjungan?.tanggal_kunjungan
      ),
      data: kunjungan,
    })
  }

  if (imunisasi) {
    daftarTindakan.push({
      jenis: 'imunisasi',
      tanggal: toDateValue(
        item?.tanggal_imunisasi_terakhir ||
        imunisasi?.tanggal_pemberian
      ),
      data: imunisasi,
    })
  }

  if (daftarTindakan.length === 0) {
    return 'Belum ada tindakan'
  }

  const terakhir = daftarTindakan.sort((a, b) => b.tanggal - a.tanggal)[0]

  if (terakhir.jenis === 'imunisasi') {
    return `Imunisasi ${terakhir.data?.nama_vaksin || 'balita'}`
  }

  if (terakhir.jenis === 'kunjungan') {
    const detail = []

    const bb = formatAngka(terakhir.data?.berat_badan, ' kg')
    const tb = formatAngka(terakhir.data?.tinggi_badan, ' cm')
    const lk = formatAngka(terakhir.data?.lingkar_kepala, ' cm')

    if (bb) detail.push(`BB ${bb}`)
    if (tb) detail.push(`TB ${tb}`)
    if (lk) detail.push(`LK ${lk}`)

    if (detail.length > 0) {
      return `Kunjungan dan pengukuran (${detail.join(', ')})`
    }

    return terakhir.data?.jenis_kunjungan
      ? `Kunjungan ${terakhir.data.jenis_kunjungan}`
      : 'Kunjungan posyandu'
  }

  if (terakhir.jenis === 'pertumbuhan') {
    const detail = []

    const bb = formatAngka(terakhir.data?.berat_badan, ' kg')
    const tb = formatAngka(terakhir.data?.tinggi_badan, ' cm')
    const lk = formatAngka(terakhir.data?.lingkar_kepala, ' cm')

    if (bb) detail.push(`BB ${bb}`)
    if (tb) detail.push(`TB ${tb}`)
    if (lk) detail.push(`LK ${lk}`)

    if (detail.length > 0) {
      return `Pengukuran ${detail.join(', ')}`
    }

    return 'Pengukuran tumbuh kembang'
  }

  return 'Belum ada tindakan'
}

export default function DaftarBalita() {
  const navigate = useNavigate()
  const location = useLocation()

  const [balitaList, setBalitaList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [ageFilter, setAgeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const fetchBalita = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await API.get('/balita?limit=200')

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : []

      setBalitaList(list)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data balita.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await API.get('/balita?limit=200')

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

    load()

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
        item?.orang_tua?.nama?.toLowerCase().includes(keyword) ||
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

  const handleDelete = async (id) => {
    setDeleteLoading(true)

    try {
      await API.delete(`/balita/${id}`)
      await fetchBalita()
      setDeleteConfirm(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus data balita.')
    } finally {
      setDeleteLoading(false)
    }
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
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>
              ←
            </button>

            <div>
              <h1 style={styles.heroTitle}>Daftar Balita</h1>
              <p style={styles.heroSubtitle}>Cari dan pilih balita untuk mengelola data balita</p>
            </div>
          </div>

          <div style={styles.heroRight}>
            <button type="button" style={styles.notificationButton}>
              🔔
            </button>

            <button type="button" onClick={() => navigate('/profil')} style={styles.userBadge}>
              👤 {user?.nama || user?.name || 'User'}
            </button>
          </div>
        </header>

        <section style={styles.contentWrap}>
          <div style={styles.actionBar}>
            <button
              type="button"
              onClick={() => navigate('/tambah-balita')}
              style={styles.addButton}
            >
              ＋ Tambah Balita Baru
            </button>
          </div>

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
                    <th style={{ ...styles.th, width: '24%' }}>Nama Anak</th>
                    <th style={{ ...styles.th, width: '12%' }}>Usia</th>
                    <th style={{ ...styles.th, width: '16%' }}>Nama Ibu</th>
                    <th style={{ ...styles.th, width: '14%' }}>Terakhir Diukur</th>
                    <th style={{ ...styles.th, width: '24%' }}>Tindakan Terakhir</th>
                    <th style={{ ...styles.th, width: '10%', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={styles.loadingCell}>
                        Memuat data...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={styles.loadingCell}>
                        Data tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => (
                      <tr key={item.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.nameCell}>
                            <div style={styles.avatarCircle}>
                              {item?.foto ? (
                                <img src={item.foto} alt={item.nama} style={styles.avatarImage} />
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

                        <td style={styles.td}>
                          {item?.nama_ibu || item?.orang_tua?.nama || '-'}
                        </td>

                        <td style={styles.td}>
                          {formatTanggal(getLastMeasureDate(item))}
                        </td>

                        <td style={styles.td}>
                          <div style={styles.tindakanText}>
                            {getTindakanTerakhir(item)}
                          </div>
                        </td>

                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <div style={styles.actionButtons}>
                            <button
                              type="button"
                              title="Edit"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/tambah-balita/${item.id}`)
                              }}
                              style={styles.editBtn}
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              title="Hapus"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm(item)
                              }}
                              style={styles.deleteBtn}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
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
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                    <button type="button" onClick={() => setCurrentPage(1)} style={styles.pageNumber}>
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
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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

      {deleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalIcon}>🗑️</div>

            <h3 style={styles.modalTitle}>Hapus Data Balita?</h3>

            <p style={styles.modalDesc}>
              Data <strong>{deleteConfirm.nama}</strong> akan dinonaktifkan. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                style={styles.modalCancelBtn}
                disabled={deleteLoading}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm.id)}
                style={styles.modalDeleteBtn}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
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
    gap: 4,
    flex: 1,
  },

  navLink: {
    minHeight: 42,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 14px',
    borderRadius: 12,
    color: '#355C3C',
    textDecoration: 'none',
    fontSize: 14,
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
    marginTop: 8,
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
  },

  heroTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.4px',
  },

  heroSubtitle: {
    margin: '8px 0 0',
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
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

  actionBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },

  addButton: {
    background: '#F7E5D8',
    color: '#6C5145',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily,
  },

  tableCard: {
    background: '#FFF7F8',
    borderRadius: 16,
    border: '1px solid #E7CFCB',
    padding: 22,
    boxShadow: '0 12px 28px rgba(30,45,30,0.12)',
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
    width: '100%',
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
    cursor: 'default',
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

  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid #E6C9B6',
    background: '#FFF3E0',
    cursor: 'pointer',
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid #FECACA',
    background: '#FEF2F2',
    cursor: 'pointer',
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: '0 14px',
    borderRadius: 8,
    border: '1px solid #E6C9B6',
    background: '#F3DED2',
    color: '#6B5247',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily,
  },

  pageButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },

  pageNumber: {
    minWidth: 34,
    minHeight: 34,
    padding: '0 8px',
    borderRadius: 8,
    border: '1px solid #E6C9B6',
    background: '#FFF7F8',
    color: '#6B5247',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily,
  },

  pageNumberActive: {
    background: '#4F724D',
    color: '#fff',
    border: '1px solid #4F724D',
  },

  dotText: {
    color: '#8A6A5A',
    fontSize: 14,
    padding: '0 2px',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },

  modalCard: {
    background: '#fff',
    borderRadius: 20,
    padding: '32px 36px',
    maxWidth: 380,
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },

  modalIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  modalTitle: {
    margin: '0 0 10px',
    color: '#3D1F1A',
    fontSize: 20,
    fontWeight: 700,
  },

  modalDesc: {
    margin: '0 0 24px',
    color: '#6B5247',
    fontSize: 14,
    lineHeight: 1.6,
  },

  modalActions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
  },

  modalCancelBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    border: '1px solid #E6C9B6',
    background: '#F3DED2',
    color: '#6B5247',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily,
  },

  modalDeleteBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    border: 'none',
    background: '#DC2626',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily,
  },
}