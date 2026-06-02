import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../api'

const pageSize = 8

function formatTanggal(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTanggalPanjang(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function hitungUsiaBulan(tanggalLahir, tanggalAcuan = new Date()) {
  if (!tanggalLahir) return 0

  const lahir = new Date(tanggalLahir)
  const acuan = new Date(tanggalAcuan)

  if (Number.isNaN(lahir.getTime()) || Number.isNaN(acuan.getTime())) return 0

  let bulan =
    (acuan.getFullYear() - lahir.getFullYear()) * 12 +
    (acuan.getMonth() - lahir.getMonth())

  if (acuan.getDate() < lahir.getDate()) bulan -= 1

  return Math.max(bulan, 0)
}

function formatUsia(bulan) {
  if (bulan === undefined || bulan === null || Number.isNaN(Number(bulan))) return '-'

  const total = Number(bulan)
  const tahun = Math.floor(total / 12)
  const sisaBulan = total % 12

  if (tahun <= 0) return `${sisaBulan} Bulan`
  if (sisaBulan === 0) return `${tahun} Tahun`

  return `${tahun} Tahun ${sisaBulan} Bulan`
}

function formatNumber(value, suffix = '') {
  if (value === undefined || value === null || value === '') return '-'

  const number = Number(value)
  if (Number.isNaN(number)) return '-'

  return `${number.toLocaleString('id-ID', {
    maximumFractionDigits: 1,
  })}${suffix}`
}

function getLatestGrowth(item) {
  return item?.pertumbuhan_terakhir || item?.riwayat_pertumbuhan?.[0] || null
}

function getStatusGiziLabel(value) {
  if (!value) return '-'

  const cleaned = String(value).replace(/_/g, ' ').toLowerCase()

  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStatusClass(value) {
  const text = String(value || '').toLowerCase()

  if (text.includes('buruk') || text.includes('stunting')) return 'danger'

  if (
    text.includes('kurang') ||
    text.includes('risiko') ||
    text.includes('pendek') ||
    text.includes('lebih')
  ) {
    return 'warning'
  }

  return 'success'
}

function getTindakanText(item) {
  const growth = getLatestGrowth(item)
  const status = String(growth?.status_gizi || item?.status_gizi || '').toLowerCase()

  if (status.includes('stunting')) return 'Perlu penanganan stunting'
  if (status.includes('buruk')) return 'Perlu penanganan gizi buruk'
  if (status.includes('kurang')) return 'Rekomendasi perbaikan gizi'
  if (status.includes('lebih')) return 'Rekomendasi perbaikan gizi'

  return 'Pemantauan rutin'
}

function getIndicatorValue(item, keys, fallback = '-') {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null && item?.[key] !== '') {
      return item[key]
    }
  }

  return fallback
}

function getBbU(item) {
  return getIndicatorValue(
    item,
    ['bb_u', 'status_bb_u', 'zscore_bb_u', 'z_score_bb_u'],
    getStatusGiziLabel(item?.status_gizi)
  )
}

function getTbU(item) {
  return getIndicatorValue(
    item,
    ['tb_u', 'status_tb_u', 'zscore_tb_u', 'z_score_tb_u'],
    item?.is_stunting ? 'Pendek' : 'Normal'
  )
}

function getBbTb(item) {
  return getIndicatorValue(
    item,
    ['bb_tb', 'status_bb_tb', 'zscore_bb_tb', 'z_score_bb_tb'],
    getStatusGiziLabel(item?.status_gizi)
  )
}

function MiniGrowthChart({ title, value, suffix, danger }) {
  return (
    <div className="mini-chart">
      <div className="chart-title">
        <span>{title}</span>
        <small>{value ? formatNumber(value, suffix) : '-'}</small>
      </div>

      <div className="chart-box">
        <svg viewBox="0 0 260 120" preserveAspectRatio="none">
          <path
            d="M0 96 C50 76, 92 70, 135 58 C178 46, 214 36, 260 22"
            className="chart-area"
          />

          <path
            d="M0 90 C55 82, 95 74, 130 64 C175 52, 210 43, 260 34"
            className={danger ? 'chart-line danger' : 'chart-line'}
          />

          <circle cx="32" cy="84" r="3" className="chart-dot" />
          <circle cx="78" cy="76" r="3" className="chart-dot" />
          <circle cx="124" cy="66" r="3" className="chart-dot" />
          <circle cx="170" cy="54" r="3" className="chart-dot" />
          <circle cx="218" cy="42" r="3" className="chart-dot" />
        </svg>
      </div>
    </div>
  )
}

export default function PenangananRekomendasi() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [balitaList, setBalitaList] = useState([])
  const [balita, setBalita] = useState(null)
  const [riwayat, setRiwayat] = useState([])
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

    const loadList = async () => {
      if (id) return

      setLoading(true)
      setError('')

      try {
        const res = await API.get('/balita?limit=200')
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : []

        if (mounted) setBalitaList(list)
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || 'Gagal memuat data balita.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadList()

    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    let mounted = true

    const loadDetail = async () => {
      if (!id) return

      setLoading(true)
      setError('')

      try {
        const [balitaRes, pertumbuhanRes] = await Promise.allSettled([
          API.get(`/balita/${id}`),
          API.get(`/pertumbuhan?balita_id=${id}&limit=100`),
        ])

        if (balitaRes.status === 'fulfilled') {
          const data = balitaRes.value.data?.data || balitaRes.value.data || null
          if (mounted) setBalita(data)
        }

        if (pertumbuhanRes.status === 'fulfilled') {
          const payload = pertumbuhanRes.value.data
          const list = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : []

          const sorted = [...list].sort((a, b) => {
            const dateA = new Date(a?.tanggal_ukur || a?.createdAt || 0).getTime()
            const dateB = new Date(b?.tanggal_ukur || b?.createdAt || 0).getTime()
            return dateB - dateA
          })

          if (mounted) setRiwayat(sorted)
        } else if (balitaRes.status === 'fulfilled') {
          const data = balitaRes.value.data?.data || balitaRes.value.data || null
          const fallback = data?.riwayat_pertumbuhan || []
          if (mounted) setRiwayat(Array.isArray(fallback) ? fallback : [])
        }

        if (balitaRes.status === 'rejected') {
          throw balitaRes.reason
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || 'Gagal memuat detail balita.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadDetail()

    return () => {
      mounted = false
    }
  }, [id])

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return balitaList.filter((item) => {
      const usia = Number(item?.usia_bulan ?? hitungUsiaBulan(item?.tanggal_lahir))

      let ageCategory = '60+'
      if (usia <= 12) ageCategory = '0-12'
      else if (usia <= 24) ageCategory = '13-24'
      else if (usia <= 36) ageCategory = '25-36'
      else if (usia <= 60) ageCategory = '37-60'

      const cocokSearch =
        !keyword ||
        item?.nama?.toLowerCase().includes(keyword) ||
        item?.nama_ibu?.toLowerCase().includes(keyword) ||
        item?.orang_tua?.nama?.toLowerCase().includes(keyword) ||
        String(item?.nik || '').toLowerCase().includes(keyword) ||
        String(item?.id || '').includes(keyword)

      const cocokUsia = ageFilter === 'all' || ageCategory === ageFilter

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

  const latestGrowth = riwayat?.[0] || getLatestGrowth(balita)
  const usiaBulan = balita?.usia_bulan ?? hitungUsiaBulan(balita?.tanggal_lahir)
  const statusGizi = latestGrowth?.status_gizi || balita?.status_gizi || 'Belum ada data'
  const statusClass = getStatusClass(statusGizi)

  if (id) {
    return (
      <div className="pr-page detail-mode">
        <header className="pr-detail-header">
          <div className="title-row">
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate('/penanganan-rekomendasi')}
            >
              ←
            </button>

            <h1>Penanganan & Rekomendasi</h1>
          </div>

          <button type="button" className="user-pill" onClick={() => navigate('/profil')}>
            👤 {user?.nama || user?.name || 'Yuyun Handayani'}
          </button>
        </header>

        <main className="pr-detail-main">
          <section className="detail-green-area">
            <div className="detail-top-container">
              <p className="section-label">Data Anak</p>

              {error && <div className="error-box">{error}</div>}

              <section className="child-detail-card">
                <div className="detail-avatar">
                  {balita?.foto ? (
                    <img src={balita.foto} alt={balita?.nama || 'Balita'} />
                  ) : (
                    <span>{balita?.jenis_kelamin === 'P' ? '👧' : '👦'}</span>
                  )}
                </div>

                <div className="detail-anak-info">
                  <h2>{loading ? 'Memuat data...' : balita?.nama || 'Nama Anak'}</h2>

                  <div className="meta-row">
                    <span className={balita?.jenis_kelamin === 'P' ? 'girl' : 'boy'}>
                      {balita?.jenis_kelamin === 'P' ? '♀ Perempuan' : '♂ Laki-laki'}
                    </span>

                    <span>{formatUsia(usiaBulan)}</span>
                  </div>

                  <div className="info-list">
                    <div className="info-line">
                      <span className="line-icon">📅</span>
                      <b>Tanggal Lahir</b>
                      <strong>{formatTanggalPanjang(balita?.tanggal_lahir)}</strong>
                    </div>

                    <div className="info-line">
                      <span className="line-icon">🪪</span>
                      <b>ID Anak</b>
                      <strong>
                        {balita?.nik || `AN-${String(balita?.id || '').padStart(5, '0')}`}
                      </strong>
                    </div>

                    <div className="info-line">
                      <span className="line-icon">👩</span>
                      <b>Nama Ibu</b>
                      <strong>{balita?.nama_ibu || balita?.orang_tua?.nama || '-'}</strong>
                    </div>

                    <div className="info-line">
                      <span className="line-icon">📍</span>
                      <b>Posyandu</b>
                      <strong>{balita?.posyandu || balita?.lokasi_posyandu || 'Posyandu Ceria'}</strong>
                    </div>

                    <div className="info-line">
                      <span className="line-icon">📘</span>
                      <b>Kunjungan Terakhir</b>
                      <strong>
                        {formatTanggalPanjang(
                          latestGrowth?.tanggal_ukur || latestGrowth?.tanggal_kunjungan
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className={`detail-status-card ${statusClass}`}>
                  <p>Status Gizi Terakhir</p>

                  <h3>⚠ {getStatusGiziLabel(statusGizi)}</h3>

                  <span>
                    Berdasarkan pengukuran{' '}
                    {formatTanggalPanjang(latestGrowth?.tanggal_ukur)}
                  </span>

                  <button
                    type="button"
                    className="catat-btn"
                    onClick={() => navigate(`/catat-penanganan/${id}`)}
                  >
                    + Catat Penanganan
                  </button>
                </div>
              </section>
            </div>
          </section>

          <section className="chart-section">
            <h2>Grafik Tumbuh Kembang</h2>

            <div className="chart-grid">
              <MiniGrowthChart
                title="Berat Badan - Usia"
                value={latestGrowth?.berat_badan}
                suffix=" kg"
                danger={statusClass === 'danger'}
              />

              <MiniGrowthChart
                title="Tinggi Badan - Usia"
                value={latestGrowth?.tinggi_badan}
                suffix=" cm"
                danger={statusClass === 'danger'}
              />

              <MiniGrowthChart
                title="Berat Badan - Tinggi Badan"
                value={latestGrowth?.berat_badan}
                suffix=" kg"
                danger={statusClass === 'danger'}
              />
            </div>
          </section>

          <section className="info-section">
            <div className="info-card">
              <div className="info-icon">📋</div>

              <div>
                <h3>Tentang Grafik Tumbuh Kembang</h3>
                <p>
                  Grafik ini digunakan untuk melihat perkembangan anak berdasarkan standar WHO.
                  Jika grafik menunjukkan anak berada di luar rentang normal, maka anak perlu
                  mendapat pemantauan dan tindak lanjut.
                </p>
              </div>
            </div>

            <div className="legend-card">
              <h3>Keterangan Z-Score WHO</h3>
              <div><span className="danger-dot" /> &lt; -3 SD: Sangat kurang</div>
              <div><span className="warning-dot" /> -3 SD sampai -2 SD: Kurang</div>
              <div><span className="success-dot" /> -2 SD sampai +2 SD: Normal</div>
            </div>
          </section>

          <section className="table-section">
            <h2>Riwayat Pengukuran</h2>

            <div className="riwayat-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Usia</th>
                    <th>Berat Badan</th>
                    <th>Tinggi Badan</th>
                    <th>BB/U</th>
                    <th>TB/U</th>
                    <th>BB/TB</th>
                    <th>Status Gizi</th>
                  </tr>
                </thead>

                <tbody>
                  {riwayat.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-cell">
                        Belum ada riwayat pengukuran.
                      </td>
                    </tr>
                  ) : (
                    riwayat.slice(0, 8).map((item) => (
                      <tr key={item.id}>
                        <td>{formatTanggalPanjang(item.tanggal_ukur)}</td>
                        <td>
                          {formatUsia(
                            hitungUsiaBulan(balita?.tanggal_lahir, item.tanggal_ukur)
                          )}
                        </td>
                        <td>{formatNumber(item.berat_badan, ' Kg')}</td>
                        <td>{formatNumber(item.tinggi_badan, ' Cm')}</td>
                        <td>{getBbU(item)}</td>
                        <td>{getTbU(item)}</td>
                        <td>{getBbTb(item)}</td>
                        <td>
                          <span className={`status-table ${getStatusClass(item.status_gizi)}`}>
                            {getStatusGiziLabel(item.status_gizi)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <style>{styles}</style>
      </div>
    )
  }

  return (
    <div className="pr-page">
      <header className="pr-list-header">
        <div>
          <h1>Pilih Balita</h1>
          <p>Cari dan pilih balita untuk melihat penanganan dan rekomendasi tindak lanjut.</p>
        </div>

        <button type="button" className="user-pill" onClick={() => navigate('/profil')}>
          👤 {user?.nama || user?.name || 'Yuyun Handayani'}
        </button>
      </header>

      <main className="pr-list-main">
        <section className="list-card">
          <div className="filter-row">
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

          {error && <div className="error-box">{error}</div>}

          <div className="table-wrap">
            <table className="list-table">
              <colgroup>
                <col className="col-name" />
                <col className="col-age" />
                <col className="col-mother" />
                <col className="col-date" />
                <col className="col-action" />
              </colgroup>

              <thead>
                <tr>
                  <th>Nama Anak</th>
                  <th>Usia</th>
                  <th>Nama Ibu</th>
                  <th>Terakhir Diukur</th>
                  <th>Tindakan</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="empty-cell">Memuat data...</td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-cell">Data tidak ditemukan.</td>
                  </tr>
                ) : (
                  paginatedData.map((item) => {
                    const growth = getLatestGrowth(item)
                    const status = growth?.status_gizi || item?.status_gizi || ''
                    const statusBadgeClass = getStatusClass(status)

                    return (
                      <tr
                        key={item.id}
                        className="clickable-row"
                        onClick={() => navigate(`/penanganan-rekomendasi/${item.id}`)}
                      >
                        <td>
                          <div className="name-cell">
                            <div className="avatar-mini">
                              {item?.foto ? (
                                <img src={item.foto} alt={item.nama} />
                              ) : (
                                <span>{item?.jenis_kelamin === 'P' ? '👧' : '👦'}</span>
                              )}
                            </div>

                            <div>
                              <strong>{item?.nama || '-'}</strong>
                              <small className={item?.jenis_kelamin === 'P' ? 'girl' : 'boy'}>
                                {item?.jenis_kelamin === 'P' ? '♀ Perempuan' : '♂ Laki-laki'}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>{formatUsia(item?.usia_bulan ?? hitungUsiaBulan(item?.tanggal_lahir))}</td>
                        <td>{item?.nama_ibu || item?.orang_tua?.nama || '-'}</td>
                        <td>{formatTanggal(growth?.tanggal_ukur || item?.tanggal_ukur_terakhir)}</td>

                        <td>
                          <div className={`tindakan-badge ${statusBadgeClass}`}>
                            <div>
                              <strong>{getTindakanText(item)}</strong>
                              <span>
                                BB {formatNumber(growth?.berat_badan, ' kg')} • TB{' '}
                                {formatNumber(growth?.tinggi_badan, ' cm')} • LK{' '}
                                {formatNumber(growth?.lingkar_kepala, ' cm')}
                              </span>
                            </div>

                            <button
                              type="button"
                              className="lihat-detail-btn"
                              onClick={(event) => {
                                event.stopPropagation()
                                navigate(`/penanganan-rekomendasi/${item.id}`)
                              }}
                            >
                              Lihat Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-row">
            <span>
              Menampilkan {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              -
              {Math.min(currentPage * pageSize, filteredData.length)} dari {filteredData.length} anak
            </span>

            <div>
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

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .pr-page {
    min-height: 100vh;
    background: #4F724D;
    color: #5A463F;
    font-family: Inter, "Segoe UI", Arial, sans-serif;
    width: 100%;
  }

  .pr-list-header {
    background: #4F724D;
    color: #FFFFFF;
    width: 100%;
    box-sizing: border-box;
    padding: 34px 36px 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
  }

  .pr-list-header h1 {
    margin: 0;
    color: #FFFFFF;
    font-size: 30px;
    line-height: 1.15;
    font-weight: 700;
    letter-spacing: -0.4px;
  }

  .pr-list-header p {
    margin: 9px 0 0;
    color: rgba(255, 255, 255, 0.92);
    font-size: 14px;
    line-height: 1.55;
    font-weight: 500;
  }

  .pr-list-main {
    width: 100%;
    padding: 0 36px 56px;
    box-sizing: border-box;
  }

  .list-card {
    width: 100%;
    margin: 0;
    background: #FFF8F6;
    border: 1px solid #EAC9C4;
    border-radius: 18px;
    padding: 22px 24px;
    box-shadow: 0 18px 44px rgba(42, 64, 44, 0.13);
    box-sizing: border-box;
  }

  .filter-row {
    display: grid;
    grid-template-columns: 1fr 190px;
    gap: 14px;
    margin-bottom: 16px;
  }

  .search-box {
    height: 42px;
    border: 1px solid #E4C6BC;
    border-radius: 10px;
    background: #F4DED3;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
  }

  .search-box input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: #6B5247;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
  }

  .filter-row select {
    height: 42px;
    border: 1px solid #E4C6BC;
    border-radius: 10px;
    background: #F4DED3;
    color: #6B5247;
    padding: 0 14px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    outline: none;
  }

  .error-box {
    background: #FEE2E2;
    color: #991B1B;
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 600;
  }

  .table-wrap,
  .riwayat-table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  .list-table {
    table-layout: fixed;
  }

  .list-table .col-name {
    width: 24%;
  }

  .list-table .col-age {
    width: 13%;
  }

  .list-table .col-mother {
    width: 16%;
  }

  .list-table .col-date {
    width: 15%;
  }

  .list-table .col-action {
    width: 32%;
  }

  th {
    text-align: left;
    color: #5F443B;
    font-size: 13px;
    font-weight: 700;
    padding: 14px 10px;
    border-top: 1px solid #E8C9C9;
    border-bottom: 1px solid #E8C9C9;
    white-space: nowrap;
  }

  td {
    color: #6B5247;
    font-size: 13px;
    font-weight: 500;
    padding: 14px 10px;
    border-bottom: 1px solid #F0DCDC;
    vertical-align: middle;
  }

  .clickable-row {
    cursor: pointer;
    transition: 0.18s ease;
  }

  .clickable-row:hover {
    background: #FFF1EC;
  }

  .name-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .avatar-mini {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #EAF0EF;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-size: 21px;
    flex-shrink: 0;
  }

  .avatar-mini img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .name-cell strong {
    display: block;
    color: #5A3C34;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .name-cell small {
    display: block;
    font-size: 11px;
    font-weight: 600;
    margin-top: 2px;
  }

  .boy {
    color: #2F80ED;
  }

  .girl {
    color: #D364F7;
  }

  .tindakan-badge {
    width: 100%;
    min-height: 54px;
    border-radius: 13px;
    padding: 10px 12px 10px 14px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
  }

  .tindakan-badge strong {
    display: block;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.25;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tindakan-badge span {
    display: block;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tindakan-badge.success {
    background: #DFF4D8;
    color: #2F7D42;
  }

  .tindakan-badge.warning {
    background: #FFF0C8;
    color: #8A5A00;
  }

  .tindakan-badge.danger {
    background: #FFDCDC;
    color: #A82418;
  }

  .lihat-detail-btn {
    border: none;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.72);
    color: inherit;
    padding: 8px 12px;
    font-family: inherit;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: inset 0 0 0 1px rgba(90, 70, 63, 0.08);
  }

  .lihat-detail-btn:hover {
    background: #FFFFFF;
  }

  .empty-cell {
    text-align: center;
    padding: 28px 12px;
    color: #8A6A5A;
    font-weight: 600;
  }

  .pagination-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
    margin-top: 16px;
    color: #6B5247;
    font-size: 13px;
    font-weight: 500;
  }

  .pagination-row div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pagination-row button {
    min-height: 34px;
    border: 1px solid #E4C6BC;
    border-radius: 9px;
    background: #F3DED2;
    color: #6B5247;
    padding: 0 13px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }

  .pagination-row button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .pagination-row .active-page {
    background: #4F724D;
    color: #FFFFFF;
    border-color: #4F724D;
  }

  .pr-detail-header {
    background: #4F724D;
    color: #FFFFFF;
    width: 100%;
    box-sizing: border-box;
    padding: 24px 34px 18px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .back-btn {
    border: none;
    background: transparent;
    color: #FFFFFF;
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    font-weight: 500;
  }

  .pr-detail-header h1 {
    margin: 0;
    color: #FFFFFF;
    font-size: 30px;
    line-height: 1.2;
    font-weight: 600;
    letter-spacing: -0.2px;
  }

  .user-pill {
    border: none;
    border-radius: 999px;
    background: #F7E5D8;
    color: #7A4F43;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
  }

  .pr-detail-main {
    background: #FAF7F5;
    padding: 0 0 48px;
  }

  .detail-green-area {
    background: #4F724D;
    padding: 0 26px 30px;
  }

  .detail-top-container {
    width: min(1120px, 100%);
    margin: 0 auto;
  }

  .section-label {
    margin: 0 0 10px;
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 600;
  }

  .child-detail-card {
    width: 100%;
    background: #FFF7F7;
    border: 1px solid #EFD0CB;
    border-radius: 14px;
    padding: 22px 26px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 180px minmax(360px, 1fr) 280px;
    align-items: center;
    gap: 24px;
    box-shadow: 0 10px 24px rgba(34, 48, 34, 0.08);
  }

  .detail-avatar {
    width: 140px;
    height: 140px;
    border-radius: 999px;
    background: #E7F2E7;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 58px;
    overflow: hidden;
    margin: 0 auto;
    flex-shrink: 0;
  }

  .detail-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .detail-anak-info h2 {
    margin: 0 0 4px;
    color: #6C4439;
    font-size: 20px;
    line-height: 1.2;
    font-weight: 600;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 12px;
    color: #6B5247;
    font-size: 12px;
    font-weight: 500;
    flex-wrap: wrap;
  }

  .info-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(220px, 1fr));
    gap: 10px 22px;
  }

  .info-line {
    display: grid;
    grid-template-columns: 24px 110px 1fr;
    align-items: center;
    gap: 8px;
    color: #6B5247;
  }

  .line-icon {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    background: rgba(79, 114, 77, 0.10);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  .info-line b {
    font-size: 12px;
    font-weight: 600;
    color: #6B5247;
  }

  .info-line strong {
    font-size: 12px;
    font-weight: 500;
    color: #5A463F;
  }

  .detail-status-card {
    min-height: 150px;
    border-radius: 14px;
    padding: 18px;
    box-sizing: border-box;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .detail-status-card.danger {
    background: #F8A1A1;
    color: #9D1A2E;
  }

  .detail-status-card.warning {
    background: #FFE4A6;
    color: #8A5A00;
  }

  .detail-status-card.success {
    background: #DDF4D7;
    color: #2F7D42;
  }

  .detail-status-card p {
    margin: 0 0 10px;
    font-size: 14px;
    font-weight: 600;
  }

  .detail-status-card h3 {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
    padding: 8px 16px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.45);
    font-size: 16px;
    line-height: 1;
    font-weight: 700;
  }

  .detail-status-card span {
    display: block;
    font-size: 12px;
    line-height: 1.4;
    font-weight: 500;
  }

  .catat-btn {
    margin: 14px auto 0;
    width: 100%;
    max-width: 180px;
    border: none;
    border-radius: 10px;
    background: #EAF4FF;
    color: #2F80ED;
    padding: 10px 14px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .chart-section,
  .info-section,
  .table-section {
    width: min(1280px, calc(100% - 52px));
    margin-left: auto;
    margin-right: auto;
  }

  .chart-section {
    margin-top: 24px;
    margin-bottom: 20px;
  }

  .chart-section h2,
  .table-section h2 {
    margin: 0 0 12px;
    color: #5A3C34;
    font-size: 17px;
    font-weight: 600;
  }

  .chart-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .mini-chart {
    background: #FFFFFF;
    border: 1px solid #EADBD2;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 6px 16px rgba(50, 70, 50, 0.06);
  }

  .chart-title {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
  }

  .chart-title span {
    color: #5A3C34;
    font-size: 12px;
    font-weight: 600;
  }

  .chart-title small {
    color: #B42318;
    font-size: 11px;
    font-weight: 600;
  }

  .chart-box {
    height: 145px;
    background: linear-gradient(180deg, #FFF7F7, #FFFFFF);
    border-radius: 9px;
    border: 1px solid #F0D6D6;
    overflow: hidden;
  }

  .chart-box svg {
    width: 100%;
    height: 100%;
  }

  .chart-area {
    fill: none;
    stroke: #F8D5B7;
    stroke-width: 16;
    opacity: 0.5;
  }

  .chart-line {
    fill: none;
    stroke: #47B45A;
    stroke-width: 3;
  }

  .chart-line.danger {
    stroke: #FF5F5F;
  }

  .chart-dot {
    fill: #FF5F5F;
  }

  .info-section {
    display: grid;
    grid-template-columns: 1.45fr 1fr;
    gap: 16px;
    margin-bottom: 22px;
  }

  .info-card,
  .legend-card {
    background: #FFF7F7;
    border: 1px solid #EADBD2;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 6px 16px rgba(50, 70, 50, 0.06);
  }

  .info-card {
    display: flex;
    gap: 13px;
  }

  .info-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #F3DED2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .info-card h3,
  .legend-card h3 {
    margin: 0 0 6px;
    color: #5A3C34;
    font-size: 14px;
    font-weight: 600;
  }

  .info-card p,
  .legend-card div {
    margin: 0;
    color: #6B5247;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 500;
  }

  .legend-card div {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 6px;
  }

  .danger-dot,
  .warning-dot,
  .success-dot {
    width: 11px;
    height: 11px;
    border-radius: 3px;
    display: inline-block;
  }

  .danger-dot {
    background: #FF9F9F;
  }

  .warning-dot {
    background: #FFE4A6;
  }

  .success-dot {
    background: #DDF4D7;
  }

  .table-section {
    background: #FFFFFF;
    border: 1px solid #EADBD2;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 6px 16px rgba(50, 70, 50, 0.06);
  }

  .status-table {
    display: inline-flex;
    min-height: 22px;
    border-radius: 999px;
    padding: 0 10px;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
  }

  .status-table.danger {
    background: #FFDADA;
    color: #B42318;
  }

  .status-table.warning {
    background: #FFF0C8;
    color: #9A6505;
  }

  .status-table.success {
    background: #DDF4D7;
    color: #2F7D42;
  }

  @media (max-width: 1200px) {
    .list-table {
      min-width: 980px;
    }

    .child-detail-card {
      grid-template-columns: 150px 1fr;
    }

    .detail-status-card {
      grid-column: 1 / -1;
    }

    .info-list,
    .chart-grid,
    .info-section {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .pr-list-header,
    .pr-detail-header {
      flex-direction: column;
      align-items: flex-start;
      padding-left: 18px;
      padding-right: 18px;
    }

    .pr-list-main {
      padding: 0 18px 44px;
    }

    .list-card {
      padding: 18px;
    }

    .filter-row {
      grid-template-columns: 1fr;
    }

    .detail-green-area {
      padding-left: 18px;
      padding-right: 18px;
    }

    .child-detail-card {
      grid-template-columns: 1fr;
      padding: 18px;
    }

    .info-line {
      grid-template-columns: 24px 1fr;
    }

    .info-line strong {
      grid-column: 2 / -1;
    }

    .chart-section,
    .info-section,
    .table-section {
      width: calc(100% - 36px);
    }

    .pagination-row {
      flex-direction: column;
      align-items: stretch;
    }

    .pagination-row div {
      justify-content: space-between;
    }
  }
`