import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

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

function formatJenisKelamin(jenisKelamin) {
  if (jenisKelamin === 'L') return 'Laki-laki'
  if (jenisKelamin === 'P') return 'Perempuan'
  return jenisKelamin || '-'
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

function getTerakhirDiukur(item) {
  return (
    item?.tanggal_ukur_terakhir ||
    item?.pertumbuhan_terakhir?.tanggal_ukur ||
    item?.riwayat_pertumbuhan?.[0]?.tanggal_ukur ||
    item?.tanggal_kunjungan_terakhir ||
    item?.kunjungan_terakhir?.tanggal_kunjungan ||
    item?.kunjungan?.[0]?.tanggal_kunjungan ||
    null
  )
}

function getTindakanText(item) {
  if (item?.pertumbuhan_terakhir) {
    const p = item.pertumbuhan_terakhir
    const detail = []

    if (p.berat_badan) detail.push(`BB ${p.berat_badan} kg`)
    if (p.tinggi_badan) detail.push(`TB ${p.tinggi_badan} cm`)
    if (p.lingkar_kepala) detail.push(`LK ${p.lingkar_kepala} cm`)

    return detail.length > 0
      ? `Pengukuran (${detail.join(', ')}) dan Imunisasi`
      : 'Pengukuran (BB, TB, Lingkar Kepala) dan Imunisasi'
  }

  return 'Pengukuran (BB, TB, Lingkar Kepala) dan Imunisasi'
}

export default function PilihAnakKunjungan() {
  const navigate = useNavigate()

  const [anakData, setAnakData] = useState([])
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
    let mounted = true

    const loadAnak = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await API.get('/balita?limit=100')

        if (!mounted) return

        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : []

        setAnakData(list)
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || 'Gagal memuat data anak.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadAnak()

    return () => {
      mounted = false
    }
  }, [])

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return anakData.filter((item) => {
      const cocokSearch =
        !keyword ||
        item?.nama?.toLowerCase().includes(keyword) ||
        item?.nama_ibu?.toLowerCase().includes(keyword) ||
        item?.nik?.toLowerCase().includes(keyword) ||
        item?.orang_tua?.nama?.toLowerCase().includes(keyword) ||
        String(item?.id || '').toLowerCase().includes(keyword)

      const kategoriUsia = getAgeFilterValue(item?.usia_bulan)
      const cocokUsia = ageFilter === 'all' || kategoriUsia === ageFilter

      return cocokSearch && cocokUsia
    })
  }, [anakData, search, ageFilter])

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

  const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, filteredData.length)

  return (
    <div className="page-wrap">
      <header className="page-header">
        <div>
          <h1>Pilih Data Anak</h1>
          <p>Pilih anak untuk melihat riwayat kunjungan posyandu.</p>
        </div>

        <button type="button" className="user-pill" onClick={() => navigate('/profil')}>
          👤 {user?.nama || user?.name || 'User'}
        </button>
      </header>

      <main className="content-wrap">
        <section className="table-card">
          <div className="toolbar">
            <div className="search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Cari nama anak / nama ibu / ID anak"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
              <option value="all">Semua Usia</option>
              <option value="0-12">0 - 12 Bulan</option>
              <option value="13-24">13 - 24 Bulan</option>
              <option value="25-36">25 - 36 Bulan</option>
              <option value="37-60">37 - 60 Bulan</option>
              <option value="60+">&gt; 60 Bulan</option>
            </select>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nama Anak</th>
                  <th>Usia</th>
                  <th>Nama Ibu</th>
                  <th>Terakhir Diukur</th>
                  <th>Tindakan</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      Memuat data anak...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      Data anak tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => {
                    const lastMeasureDate = getTerakhirDiukur(item)

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="child-cell">
                            <div className="avatar">
                              {item?.foto ? (
                                <img src={item.foto} alt={item.nama} />
                              ) : (
                                <span>{getAvatar(item?.jenis_kelamin)}</span>
                              )}
                            </div>

                            <div>
                              <b>{item?.nama || '-'}</b>
                              <small style={{ color: getGenderColor(item?.jenis_kelamin) }}>
                                {item?.jenis_kelamin === 'P' ? '♀' : '♂'}{' '}
                                {formatJenisKelamin(item?.jenis_kelamin)}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>{formatUsia(item?.usia_bulan)}</td>
                        <td>{item?.nama_ibu || item?.orang_tua?.nama || '-'}</td>
                        <td>
                          {lastMeasureDate ? formatTanggal(lastMeasureDate) : 'Belum diukur'}
                        </td>
                        <td>{getTindakanText(item)}</td>
                        <td>
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => navigate(`/riwayatkunjungan/${item.id}`)}
                          >
                            Riwayat
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="footer-bar">
            <p>
              Menampilkan {startItem}-{endItem} dari {filteredData.length} anak
            </p>

            <div className="pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                ← Sebelumnya
              </button>

              <button type="button" className="active-page">
                {currentPage}
              </button>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .page-wrap {
          min-height: 100vh;
          background: #4F724D;
          color: #fff;
          font-family: "Segoe UI", Arial, Helvetica, sans-serif;
        }

        .page-header {
          padding: 38px 42px 24px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .page-header h1 {
          margin: 0;
          font-size: 34px;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .page-header p {
          margin: 10px 0 0;
          color: rgba(255,255,255,0.92);
          font-size: 15px;
        }

        .user-pill {
          border: none;
          min-height: 40px;
          padding: 0 18px;
          border-radius: 999px;
          background: rgba(234, 241, 239, 0.24);
          color: white;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
        }

        .content-wrap {
          padding: 10px 42px 42px;
        }

        .table-card {
          background: #fff7f8;
          color: #6b5247;
          border-radius: 16px;
          border: 1px solid #e7cfcb;
          padding: 22px;
          box-shadow: 0 12px 28px rgba(30,45,30,0.12);
        }

        .toolbar {
          display: grid;
          grid-template-columns: 1fr 220px;
          gap: 16px;
          margin-bottom: 18px;
        }

        .search-box {
          height: 44px;
          border-radius: 10px;
          background: #f3ded2;
          border: 1px solid #e6c9b6;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
        }

        .search-box input {
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #6b5247;
          font-family: inherit;
          font-weight: 600;
        }

        .toolbar select {
          height: 44px;
          border: 1px solid #e6c9b6;
          border-radius: 10px;
          background: #f3ded2;
          color: #6b5247;
          padding: 0 14px;
          font-family: inherit;
          font-weight: 700;
          outline: none;
        }

        .alert-error {
          background: #fee2e2;
          color: #991b1b;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 14px;
          font-weight: 600;
        }

        .table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        th {
          text-align: left;
          padding: 14px 12px;
          border-top: 1px solid #e7cfcb;
          border-bottom: 1px solid #e7cfcb;
          color: #6b5247;
          font-size: 14px;
          font-weight: 800;
          white-space: nowrap;
        }

        td {
          padding: 16px 12px;
          border-bottom: 1px solid #efdada;
          color: #6b5247;
          font-size: 14px;
          vertical-align: middle;
        }

        .child-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #eaeff0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .child-cell b {
          display: block;
          color: #6b5247;
          font-size: 15px;
          margin-bottom: 4px;
        }

        .child-cell small {
          display: block;
          font-weight: 800;
          font-size: 13px;
        }

        .action-btn {
          border: none;
          min-height: 34px;
          padding: 0 18px;
          border-radius: 9px;
          background: #3f6b47;
          color: white;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .empty-cell {
          text-align: center;
          padding: 30px 12px;
          color: #8a6a5a;
          font-weight: 600;
        }

        .footer-bar {
          margin-top: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .footer-bar p {
          margin: 0;
          color: #6b5247;
          font-weight: 700;
        }

        .pagination {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pagination button {
          border: none;
          min-height: 34px;
          padding: 0 14px;
          border-radius: 8px;
          background: #f7b6b1;
          color: white;
          font-family: inherit;
          font-weight: 800;
          cursor: pointer;
        }

        .pagination button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .pagination .active-page {
          width: 34px;
          padding: 0;
          background: #f38f8a;
        }

        @media (max-width: 900px) {
          .page-header,
          .content-wrap {
            padding-left: 20px;
            padding-right: 20px;
          }

          .toolbar {
            grid-template-columns: 1fr;
          }

          table {
            min-width: 980px;
          }
        }
      `}</style>
    </div>
  )
}