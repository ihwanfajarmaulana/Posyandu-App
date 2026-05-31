import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import API from '../api'
import { Icon, SharedSidebar } from '../components/SidebarLayout'

const colors = {
  green: '#4E724C',
  cream: '#FFF5F8',
  brown: '#655040',
  tan: '#F2DFD1',
  active: '#CFEBD2',
  white: '#FFFFFF',
  yellow: '#FFE9AE',
  red: '#FF7C7C',
  blue: '#3287EF',
  pink: '#D65FFA',
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

const demoChildren = {
  'demo-1': { id: 'demo-1', nama: 'Archio Baskara', usia_bulan: 28, jenis_kelamin: 'L', tanggal_lahir: '2024-03-24', nik: 'AN-10081', nama_ibu: 'Agatha Theresia' },
  'demo-2': { id: 'demo-2', nama: 'Christy Tan', usia_bulan: 29, jenis_kelamin: 'P', tanggal_lahir: '2024-03-24', nik: 'AN-10132', nama_ibu: 'Agatha Theresia' },
  'demo-3': { id: 'demo-3', nama: 'Ethan Noah', usia_bulan: 31, jenis_kelamin: 'L', tanggal_lahir: '2023-12-18', nik: 'AN-10082', nama_ibu: 'Agatha Theresia' },
  'demo-9': { id: 'demo-9', nama: 'Ryan Nathan', usia_bulan: 26, jenis_kelamin: 'L', tanggal_lahir: '2024-05-14', nik: 'AN-10089', nama_ibu: 'Agatha Theresia' },
  'demo-10': { id: 'demo-10', nama: 'Daniel Ezra', usia_bulan: 32, jenis_kelamin: 'L', tanggal_lahir: '2023-11-11', nik: 'AN-10090', nama_ibu: 'Agatha Theresia' },
}

const demoHistory = [
  { id: 'h1', tanggal_ukur: '2026-05-05', berat_badan: 12.5, tinggi_badan: 88, status_gizi: 'gizi_baik', catatan: 'Balita dalam kondisi sehat, nafsu makan baik.' },
  { id: 'h2', tanggal_ukur: '2026-04-05', berat_badan: 11.5, tinggi_badan: 86, status_gizi: 'gizi_baik', catatan: 'Perkembangan baik.' },
  { id: 'h3', tanggal_ukur: '2026-03-05', berat_badan: 11, tinggi_badan: 82, status_gizi: 'gizi_baik', catatan: 'Pertumbuhan stabil.' },
  { id: 'h4', tanggal_ukur: '2026-02-05', berat_badan: 10.5, tinggi_badan: 80, status_gizi: 'gizi_kurang', catatan: 'Disarankan konsumsi makanan bergizi dan seimbang.' },
  { id: 'h5', tanggal_ukur: '2026-01-05', berat_badan: 10.2, tinggi_badan: 78, status_gizi: 'gizi_kurang', catatan: 'Pantau makan harian.' },
]

function getList(response) {
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  return []
}

function getData(response) {
  return response?.data?.data || response?.data || null
}

function formatAge(months) {
  if (months !== 0 && !months) return '-'
  const years = Math.floor(Number(months) / 12)
  const rest = Number(months) % 12
  return `${years} th ${rest} bln`
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return `${String(date.getDate()).padStart(2, '0')} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

function formatDecimal(value) {
  if (value === null || value === undefined || value === '') return '-'
  const number = Number(value)
  if (Number.isNaN(number)) return value
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(number)
}

function childCode(child) {
  if (!child) return 'AN-00000'
  return child.nik || `AN-${String(child.id).replace(/\D/g, '').padStart(5, '0')}`
}

function initials(name) {
  if (!name) return 'AN'
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('')
}

function normalizeStatus(growth) {
  if (!growth) return 'Normal'
  if (growth.status_gizi === 'gizi_kurang') return 'Gizi Kurang'
  if (growth.status_gizi === 'gizi_buruk') return 'Gizi Buruk'
  if (growth.is_stunting) return 'Stunting'
  return 'Normal'
}

function statusClass(status) {
  const text = String(status || '').toLowerCase()
  if (text.includes('stunting') || text.includes('buruk')) return 'danger'
  if (text.includes('kurang')) return 'warning'
  return 'normal'
}

function buildDetailHtml(child, history) {
  const rows = history.map((row) => `
    <tr>
      <td>${formatDate(row.tanggal_ukur)}</td>
      <td>${formatAge(child.usia_bulan)}</td>
      <td>${formatDecimal(row.berat_badan)}</td>
      <td>${formatDecimal(row.tinggi_badan)}</td>
      <td>${normalizeStatus(row)}</td>
      <td>${row.catatan || '-'}</td>
    </tr>
  `).join('')

  return `
    <h2>DETAIL REKAP PENIMBANGAN</h2>
    <p>${child.nama} - ${childCode(child)}</p>
    <table>
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Usia</th>
          <th>Berat Badan (Kg)</th>
          <th>Tinggi Badan (Cm)</th>
          <th>Status Gizi</th>
          <th>Catatan</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

function openPrintWindow(title, html) {
  const win = window.open('', '_blank', 'width=1000,height=720')
  if (!win) return

  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #655040; padding: 32px; }
          h2 { text-align: center; margin: 0 0 8px; color: #111; }
          p { text-align: center; margin: 0 0 26px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th, td { border-bottom: 1px solid #c9b8ae; padding: 12px; text-align: center; }
          th { color: #655040; font-weight: 800; }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 250)
}

function StatusBadge({ status }) {
  return <span className={`detail-status ${statusClass(status)}`}>{status}</span>
}

function TopUser() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const name = user.nama || 'Agatha Theresia'

  return (
    <div className="detail-user">
      <button type="button" className="detail-circle-button" aria-label="Notifikasi">
        <Icon name="bell" size={16} color={colors.brown} strokeWidth={1.8} />
      </button>
      <div className="detail-user-pill">
        <span>{name.slice(0, 1).toUpperCase()}</span>
        {name}
      </div>
    </div>
  )
}

function MiniChart({ title, type, history }) {
  const points = history.slice().reverse().slice(0, 5)
  const values = points.map((row) => Number(type === 'height' ? row.tinggi_badan : row.berat_badan)).filter((value) => !Number.isNaN(value))
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 1
  const range = Math.max(1, max - min)

  return (
    <div className="mini-chart">
      <h3>{title}</h3>
      <StatusBadge status="Normal" />
      <div className="chart-stage">
        <svg viewBox="0 0 260 132" preserveAspectRatio="none">
          <path d="M0 20 C70 42 130 46 260 28 L260 0 L0 0Z" fill="rgba(255, 16, 16, 0.14)" />
          <path d="M0 40 C80 60 140 62 260 45 L260 78 C150 84 70 74 0 64Z" fill="#FFE9AE" opacity="0.75" />
          <path d="M0 62 C75 80 145 82 260 68 L260 100 C150 108 70 98 0 88Z" fill="#DDF4E0" />
          <path d="M0 92 C75 110 150 112 260 96 L260 132 L0 132Z" fill="rgba(255, 16, 16, 0.12)" />
          {values.length > 0 && (
            <polyline
              points={values.map((value, index) => {
                const x = 22 + index * 52
                const y = 105 - ((value - min) / range) * 62
                return `${x},${y}`
              }).join(' ')}
              fill="none"
              stroke="#2FC46D"
              strokeWidth="3"
            />
          )}
          {values.map((value, index) => {
            const x = 22 + index * 52
            const y = 105 - ((value - min) / range) * 62
            return <circle key={`${value}-${index}`} cx={x} cy={y} r="4" fill="#2FC46D" />
          })}
        </svg>
      </div>
      <p>Hasil Pengukuran Anak</p>
    </div>
  )
}

export default function TumbuhKembang() {
  const { id } = useParams()
  const [child, setChild] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    async function loadDetail() {
      if (!id) {
        navigate('/tumbuh-kembang')
        return
      }

      if (String(id).startsWith('demo-')) {
        if (!cancelled) {
          setChild(demoChildren[id] || demoChildren['demo-2'])
          setHistory(demoHistory)
          setLoading(false)
        }
        return
      }

      try {
        const [childResponse, historyResponse] = await Promise.all([
          API.get(`/balita/${id}`),
          API.get(`/balita/${id}/pertumbuhan`).catch(() => ({ data: { data: [] } })),
        ])

        if (!cancelled) {
          setChild(getData(childResponse))
          setHistory(getList(historyResponse))
        }
      } catch {
        if (!cancelled) navigate('/tumbuh-kembang')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDetail()

    return () => {
      cancelled = true
    }
  }, [id, navigate])

  const newestHistory = useMemo(() => [...history].sort((a, b) => new Date(b.tanggal_ukur || 0) - new Date(a.tanggal_ukur || 0)), [history])
  const latest = newestHistory[0]
  const latestStatus = normalizeStatus(latest)
  const latestNote = latest?.catatan || 'Balita dalam kondisi sehat, nafsu makan baik. Disarankan tetap konsumsi makanan bergizi dan seimbang.'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const printDetail = () => {
    if (!child) return
    openPrintWindow(`Detail Rekap Penimbangan ${child.nama}`, buildDetailHtml(child, newestHistory))
  }

  return (
    <div className="detail-page">
      <SharedSidebar activePath="/tumbuh-kembang" onLogout={handleLogout} />

      <main className="detail-main">
        <TopUser />

        <section className="detail-hero">
          <div className="detail-title-row">
            <Link to="/tumbuh-kembang" aria-label="Kembali">←</Link>
            <div>
              <h1>Detail Rekap Penimbangan</h1>
              <p>Detail rekap penimbangan {child?.nama || 'balita'}</p>
            </div>
          </div>

          {loading ? (
            <div className="detail-loading">Memuat data...</div>
          ) : child && (
            <>
              <h2>Data Anak</h2>
              <section className="child-card">
                <div className="child-photo">
                  {child.foto ? <img src={child.foto} alt={child.nama} /> : initials(child.nama)}
                </div>

                <div className="child-data">
                  <h3>{child.nama}</h3>
                  <div className="child-meta">
                    <span className={child.jenis_kelamin === 'L' ? 'boy' : 'girl'}>
                      {child.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                    <strong>{formatAge(child.usia_bulan)}</strong>
                  </div>

                  <dl>
                    <div><dt>Tanggal Lahir</dt><dd>{formatDate(child.tanggal_lahir)}</dd></div>
                    <div><dt>ID Anak</dt><dd>{childCode(child)}</dd></div>
                    <div><dt>Nama Ibu</dt><dd>{child.nama_ibu || child.orang_tua?.nama || 'Agatha Theresia'}</dd></div>
                    <div><dt>Posyandu</dt><dd>Posyandu Ceria</dd></div>
                    <div><dt>Kunjungan Terakhir</dt><dd>{latest ? formatDate(latest.tanggal_ukur) : '-'}</dd></div>
                  </dl>
                </div>

                <aside className="latest-card">
                  <h3>Status Gizi Terakhir</h3>
                  <StatusBadge status={latestStatus} />
                  <p>Berdasarkan pengukuran<br />{latest ? formatDate(latest.tanggal_ukur) : '-'}</p>
                </aside>
              </section>
            </>
          )}
        </section>

        <section className="detail-content">
          <h2>Riwayat Pemeriksaan</h2>
          <div className="history-table">
            <div className="history-head">
              <span>Tanggal</span>
              <span>Usia</span>
              <span>Berat Badan (Kg)</span>
              <span>Tinggi Badan (Cm)</span>
              <span>Status Gizi</span>
              <span>Catatan</span>
            </div>

            {newestHistory.length === 0 ? (
              <div className="empty-history">Belum ada data pemeriksaan.</div>
            ) : (
              newestHistory.map((row) => (
                <div className="history-row" key={row.id || row.tanggal_ukur}>
                  <span>{formatDate(row.tanggal_ukur)}</span>
                  <span>{formatAge(child?.usia_bulan)}</span>
                  <span>{formatDecimal(row.berat_badan)}</span>
                  <span>{formatDecimal(row.tinggi_badan)}</span>
                  <span><StatusBadge status={normalizeStatus(row)} /></span>
                  <span className="note-icon">▤</span>
                </div>
              ))
            )}
          </div>

          <h2>Grafik Pertumbuhan</h2>
          <div className="chart-grid">
            <MiniChart title="Berat Badan per Usia (BB/U)" type="weight" history={newestHistory} />
            <MiniChart title="Tinggi Badan per Usia (TB/U)" type="height" history={newestHistory} />
            <MiniChart title="Berat Badan per Tinggi Badan (BB/TB)" type="weight" history={newestHistory} />
          </div>

          <div className="detail-bottom">
            <div className="latest-note">
              <span>▤</span>
              <div>
                <h3>Catatan Pemeriksaan Terakhir</h3>
                <p>{latestNote}</p>
              </div>
            </div>

            <button type="button" onClick={printDetail}>
              ▣ Cetak Data
            </button>
          </div>
        </section>
      </main>

      <style>{`
        .detail-page {
          width: 100%;
          min-height: 100vh;
          display: flex;
          font-family: 'Noto Sans', Arial, sans-serif;
          color: ${colors.brown};
          background: ${colors.cream};
        }

        .detail-main {
          position: relative;
          flex: 1;
          min-width: 0;
          background: ${colors.cream};
        }

        .detail-user {
          position: absolute;
          top: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 3;
        }

        .detail-circle-button {
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 50%;
          background: ${colors.tan};
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .detail-user-pill {
          height: 30px;
          min-width: 130px;
          border-radius: 999px;
          background: ${colors.tan};
          color: ${colors.brown};
          padding: 0 12px 0 4px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 900;
        }

        .detail-user-pill span {
          width: 23px;
          height: 23px;
          border-radius: 50%;
          background: ${colors.brown};
          color: ${colors.cream};
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .detail-hero {
          background: ${colors.green};
          min-height: 290px;
          padding: 28px clamp(38px, 5.8vw, 62px) 18px;
          box-sizing: border-box;
        }

        .detail-title-row {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          color: ${colors.cream};
          margin-bottom: 22px;
        }

        .detail-title-row a {
          color: ${colors.cream};
          text-decoration: none;
          font-size: 29px;
          line-height: 1;
        }

        .detail-title-row h1 {
          margin: 0 0 8px;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 0;
        }

        .detail-title-row p {
          margin: 0;
          font-size: 12px;
          font-weight: 700;
        }

        .detail-hero h2 {
          margin: 0 0 8px;
          color: ${colors.cream};
          font-size: 18px;
          font-weight: 900;
        }

        .detail-loading {
          background: ${colors.cream};
          border-radius: 14px;
          padding: 28px;
          font-weight: 900;
        }

        .child-card {
          width: auto;
          min-height: 190px;
          background: ${colors.cream};
          border-radius: 14px;
          display: grid;
          grid-template-columns: 170px minmax(0, 1fr) 215px;
          gap: 20px;
          align-items: center;
          padding: 18px 22px;
          box-sizing: border-box;
        }

        .child-photo {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: ${colors.tan};
          color: ${colors.green};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: 900;
          overflow: hidden;
        }

        .child-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .child-data h3 {
          margin: 0 0 4px;
          font-size: 24px;
          font-weight: 900;
        }

        .child-meta {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 12px;
          font-size: 12px;
          font-weight: 900;
        }

        .child-meta .boy { color: ${colors.blue}; }
        .child-meta .girl { color: ${colors.pink}; }

        .child-data dl {
          display: grid;
          gap: 7px;
          margin: 0;
        }

        .child-data dl div {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 10px;
          font-size: 12px;
          font-weight: 800;
        }

        .child-data dt,
        .child-data dd {
          margin: 0;
        }

        .latest-card {
          min-height: 140px;
          border-radius: 14px;
          background: rgba(207, 235, 210, 0.85);
          display: grid;
          align-content: center;
          justify-items: center;
          gap: 12px;
          text-align: center;
          padding: 18px;
          box-sizing: border-box;
        }

        .latest-card h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          color: ${colors.green};
        }

        .latest-card p {
          margin: 0;
          font-size: 11px;
          font-weight: 800;
          color: #6A6A6A;
        }

        .detail-content {
          padding: 24px clamp(38px, 5.8vw, 62px) 40px;
        }

        .detail-content h2 {
          margin: 0 0 16px;
          font-size: 18px;
          font-weight: 900;
        }

        .history-table {
          width: auto;
          margin-bottom: 30px;
        }

        .history-head,
        .history-row {
          display: grid;
          grid-template-columns: 1fr 0.9fr 1fr 1fr 1fr 0.7fr;
          gap: 8px;
          align-items: center;
          text-align: center;
        }

        .history-head {
          min-height: 42px;
          border-bottom: 1px solid rgba(101, 80, 64, 0.45);
          font-size: 12px;
          font-weight: 900;
        }

        .history-row {
          min-height: 42px;
          margin-top: 9px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.72);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.13);
          font-size: 12px;
        }

        .empty-history {
          padding: 22px;
          text-align: center;
          font-weight: 900;
        }

        .detail-status {
          min-width: 72px;
          min-height: 22px;
          padding: 2px 12px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 900;
        }

        .detail-status.normal {
          background: #CEFCBD;
          color: ${colors.green};
        }

        .detail-status.warning {
          background: ${colors.yellow};
          color: #D99000;
        }

        .detail-status.danger {
          background: #FFD0D0;
          color: #FF1010;
        }

        .note-icon {
          color: ${colors.green};
          font-size: 20px;
        }

        .chart-grid {
          width: auto;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px;
          margin-bottom: 28px;
        }

        .mini-chart {
          min-height: 205px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.78);
          padding: 12px;
          box-sizing: border-box;
        }

        .mini-chart h3 {
          margin: 0 0 5px;
          font-size: 11px;
          font-weight: 900;
        }

        .chart-stage {
          height: 132px;
          margin-top: 8px;
          border-left: 1px solid rgba(101, 80, 64, 0.2);
          border-bottom: 1px solid rgba(101, 80, 64, 0.2);
        }

        .chart-stage svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .mini-chart p {
          margin: 6px 0 0;
          color: #2FC46D;
          font-size: 10px;
          font-weight: 800;
          text-align: center;
        }

        .detail-bottom {
          width: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .latest-note {
          width: 380px;
          min-height: 76px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 18px;
          box-sizing: border-box;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.13);
        }

        .latest-note span {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: ${colors.yellow};
          color: #D99000;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .latest-note h3 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 900;
        }

        .latest-note p {
          margin: 0;
          font-size: 12px;
          line-height: 1.35;
        }

        .detail-bottom button {
          min-height: 42px;
          min-width: 150px;
          border: 0;
          border-radius: 999px;
          background: ${colors.white};
          color: ${colors.brown};
          font-family: inherit;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.16);
        }

        @media (max-width: 1050px) {
          .child-card,
          .history-table,
          .chart-grid,
          .detail-bottom {
            width: 100%;
          }

          .child-card {
            grid-template-columns: 1fr;
          }

          .chart-grid {
            grid-template-columns: 1fr;
          }

          .detail-bottom {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
