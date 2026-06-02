import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
}

const fallbackRows = [
  { id: 'demo-1', nama: 'Archio Baskara', usia_bulan: 28, berat_badan: 12.5, tinggi_badan: 88, tanggal: '2026-07-05', status: 'Normal' },
  { id: 'demo-2', nama: 'Christy Tan', usia_bulan: 29, berat_badan: 12.5, tinggi_badan: 88, tanggal: '2026-07-05', status: 'Normal' },
  { id: 'demo-3', nama: 'Ethan Noah', usia_bulan: 31, berat_badan: 10.5, tinggi_badan: 78, tanggal: '2026-07-05', status: 'Gizi Kurang' },
  { id: 'demo-4', nama: 'Liam Adrian', usia_bulan: 30, berat_badan: 12.5, tinggi_badan: 88, tanggal: '2026-07-05', status: 'Normal' },
  { id: 'demo-5', nama: 'Caleb James', usia_bulan: 30, berat_badan: 11.2, tinggi_badan: 76, tanggal: '2026-07-05', status: 'Gizi Kurang' },
  { id: 'demo-6', nama: 'Noah Alexander', usia_bulan: 28, berat_badan: 12.5, tinggi_badan: 88, tanggal: '2026-07-05', status: 'Normal' },
  { id: 'demo-7', nama: 'Ethan Gabriel', usia_bulan: 29, berat_badan: 12.5, tinggi_badan: 88, tanggal: '2026-07-05', status: 'Normal' },
  { id: 'demo-8', nama: 'Adrian Lucas', usia_bulan: 26, berat_badan: 12.5, tinggi_badan: 88, tanggal: '2026-07-05', status: 'Normal' },
  { id: 'demo-9', nama: 'Ryan Nathan', usia_bulan: 26, berat_badan: 9.5, tinggi_badan: 60, tanggal: '2026-07-05', status: 'Stunting' },
  { id: 'demo-10', nama: 'Daniel Ezra', usia_bulan: 32, berat_badan: 10.2, tinggi_badan: 58, tanggal: '2026-07-05', status: 'Stunting' },
]

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

function getList(response) {
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  return []
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

function getLatestGrowth(history) {
  if (!Array.isArray(history) || history.length === 0) return null
  return [...history].sort((a, b) => new Date(b.tanggal_ukur || 0) - new Date(a.tanggal_ukur || 0))[0]
}

function makeRow(child, history = []) {
  const latest = getLatestGrowth(history)

  return {
    id: child.id,
    nama: child.nama || '-',
    usia_bulan: child.usia_bulan,
    berat_badan: latest?.berat_badan ?? child.berat_badan ?? '',
    tinggi_badan: latest?.tinggi_badan ?? child.tinggi_badan ?? '',
    tanggal: latest?.tanggal_ukur || child.updatedAt || child.createdAt,
    status: normalizeStatus(latest),
    raw: child,
  }
}

function buildReportHtml(rows) {
  const bodyRows = rows.map((row) => `
    <tr>
      <td>${row.nama}</td>
      <td>${formatAge(row.usia_bulan)}</td>
      <td>${formatDecimal(row.berat_badan)}</td>
      <td>${formatDecimal(row.tinggi_badan)}</td>
      <td>${formatDate(row.tanggal)}</td>
      <td>${row.status}</td>
    </tr>
  `).join('')

  return `
    <h2>LAPORAN HASIL PENIMBANGAN BALITA</h2>
    <p>Periode Laporan: Juli 2026</p>
    <h3>Rincian Hasil Pemeriksaan</h3>
    <table>
      <thead>
        <tr>
          <th>Nama Balita</th>
          <th>Usia</th>
          <th>Berat Badan (Kg)</th>
          <th>Tinggi Badan (Cm)</th>
          <th>Tanggal</th>
          <th>Status Gizi</th>
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
    <div class="sign">TTD</div>
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
          h3 { margin: 20px 0 12px; font-size: 16px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th, td { border-bottom: 1px solid #c9b8ae; padding: 12px; text-align: center; }
          th { color: #655040; font-weight: 800; }
          .sign { margin-top: 80px; text-align: right; padding-right: 80px; font-weight: 800; }
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
  return <span className={`tk-status ${statusClass(status)}`}>{status}</span>
}

function TopUser() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const name = user.nama || 'Agatha Theresia'

  return (
    <div className="tk-user">
      <button type="button" className="tk-circle-button" aria-label="Notifikasi">
        <Icon name="bell" size={16} color={colors.brown} strokeWidth={1.8} />
      </button>
      <div className="tk-user-pill">
        <span>{name.slice(0, 1).toUpperCase()}</span>
        {name}
      </div>
    </div>
  )
}

export default function PilihAnak() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [checkedIds, setCheckedIds] = useState(() => new Set(['demo-2', 'demo-3', 'demo-9', 'demo-10']))
  const [screen, setScreen] = useState('rekap')
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    async function loadRows() {
      try {
        const balitaResponse = await API.get('/balita', { params: { limit: 100 } })
        const children = getList(balitaResponse)

        if (children.length === 0) {
          if (!cancelled) setRows(fallbackRows)
          return
        }

        const histories = await Promise.all(
          children.map((child) =>
            API.get(`/balita/${child.id}/pertumbuhan`)
              .then((res) => getList(res))
              .catch(() => [])
          )
        )

        if (!cancelled) {
          setRows(children.map((child, index) => makeRow(child, histories[index])))
        }
      } catch {
        if (!cancelled) setRows(fallbackRows)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadRows()

    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) => row.nama.toLowerCase().includes(query))
  }, [rows, search])

  const checkedRows = useMemo(
    () => rows.filter((row) => checkedIds.has(row.id)),
    [rows, checkedIds]
  )

  const reportRows = checkedRows.length ? checkedRows : rows.filter((row) => statusClass(row.status) !== 'normal').slice(0, 5)

  const toggleRow = (id) => {
    setCheckedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openReport = () => {
    if (checkedRows.length === 0) {
      setMessage('Pilih minimal satu balita dulu sebelum membuat laporan.')
      return
    }

    setMessage('')
    setScreen('laporan')
  }

  const printReport = () => {
    openPrintWindow('Laporan Hasil Penimbangan Balita', buildReportHtml(reportRows))
  }

  const sendReport = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2200)
  }

  return (
    <div className="tk-page">
      <SharedSidebar activePath="/tumbuh-kembang" onLogout={handleLogout} />

      {screen === 'rekap' ? (
        <main className="tk-main tk-green-main">
          <TopUser />

          <section className="tk-rekap-header">
            <h1>Rekap Penimbangan</h1>
            <p>Berikut adalah rekap penimbangan semua balita</p>
            <label>Nama Balita</label>
            <div className="tk-search">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ..." />
              <span>⌕</span>
            </div>
          </section>

          <section className="tk-rekap-table-zone">
            <div className="tk-table-actions">
              <button type="button" onClick={() => checkedRows[0] && navigate(`/tumbuh-kembang/${checkedRows[0].id}`)}>
                <span>+</span>
                Catat Rekap Penimbangan
              </button>
            </div>

            {message && <div className="tk-message">{message}</div>}

            <div className="tk-rekap-table">
              <div className="tk-rekap-head">
                <span>Nama Balita</span>
                <span>Usia</span>
                <span>Berat Badan (Kg)</span>
                <span>Tinggi Badan (Cm)</span>
                <span>Tanggal</span>
                <span>Status Gizi</span>
                <span></span>
              </div>

              {loading ? (
                <div className="tk-empty-row">Memuat data balita...</div>
              ) : (
                filteredRows.map((row) => (
                  <button type="button" className="tk-rekap-row" key={row.id} onClick={() => navigate(`/tumbuh-kembang/${row.id}`)}>
                    <span>{row.nama}</span>
                    <span>{formatAge(row.usia_bulan)}</span>
                    <span>{formatDecimal(row.berat_badan)}</span>
                    <span>{formatDecimal(row.tinggi_badan)}</span>
                    <span>{formatDate(row.tanggal)}</span>
                    <span><StatusBadge status={row.status} /></span>
                    <span>
                      <input
                        type="checkbox"
                        checked={checkedIds.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Pilih ${row.nama}`}
                      />
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="tk-bottom-action">
              <button type="button" onClick={openReport}>
                <span>+</span>
                Buat Laporan
              </button>
            </div>
          </section>
        </main>
      ) : (
        <main className="tk-main tk-report-main">
          <TopUser />

          <section className="tk-report-header">
            <button type="button" onClick={() => setScreen('rekap')} aria-label="Kembali">←</button>
            <div>
              <h1>Laporan Puskesmas</h1>
              <p>Buat dan unduh laporan hasil penimbangan balita</p>
            </div>
          </section>

          <section className="tk-report-content">
            <div className="tk-filter-group">
              <label>Periode Laporan</label>
              <button type="button"><span>□</span> Juli 2026 <span>⌄</span></button>
              <button type="button"><span>♧</span> Posyandu Mawar</button>
            </div>

            <h2>Preview Laporan</h2>

            <div className="tk-paper">
              <div className="tk-paper-title">
                <strong>LAPORAN HASIL PENIMBANGAN BALITA</strong>
                <span>Periode Laporan: Juli 2026</span>
              </div>

              <div className="tk-paper-subtitle">Rincian Hasil Pemeriksaan</div>
              <div className="tk-paper-head">
                <span>Nama Balita</span>
                <span>Usia</span>
                <span>Berat Badan (Kg)</span>
                <span>Tinggi Badan (Cm)</span>
                <span>Tanggal</span>
                <span>Status Gizi</span>
              </div>

              {reportRows.map((row) => (
                <button type="button" className="tk-paper-row" key={row.id} onClick={() => navigate(`/tumbuh-kembang/${row.id}`)}>
                  <span>{row.nama}</span>
                  <span>{formatAge(row.usia_bulan)}</span>
                  <span>{formatDecimal(row.berat_badan)}</span>
                  <span>{formatDecimal(row.tinggi_badan)}</span>
                  <span>{formatDate(row.tanggal)}</span>
                  <span><StatusBadge status={row.status} /></span>
                </button>
              ))}

              <div className="tk-sign">TTD</div>
            </div>

            <div className="tk-report-buttons">
              <button type="button" onClick={printReport}>⇩ Unduh PDF</button>
              <button type="button" onClick={printReport}>▣ Cetak Laporan</button>
              <button type="button" onClick={sendReport}>➤ Kirim ke Puskesmas</button>
            </div>
          </section>

          {showSuccess && (
            <div className="tk-success" onClick={() => setShowSuccess(false)}>
              <div>
                <span>✓</span>
                <strong>Laporan<br />Berhasil Dikirim</strong>
              </div>
            </div>
          )}
        </main>
      )}

      <style>{`
        .tk-page {
          width: 100%;
          min-height: 100vh;
          display: flex;
          font-family: 'Noto Sans', Arial, sans-serif;
          color: ${colors.brown};
        }

        .tk-main {
          position: relative;
          flex: 1;
          min-width: 0;
        }

        .tk-green-main,
        .tk-report-main {
          background: ${colors.green};
        }

        .tk-user {
          position: absolute;
          top: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 3;
        }

        .tk-circle-button {
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 50%;
          background: ${colors.tan};
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .tk-user-pill {
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

        .tk-user-pill span {
          width: 23px;
          height: 23px;
          border-radius: 50%;
          background: ${colors.brown};
          color: ${colors.cream};
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .tk-rekap-header {
          min-height: 185px;
          padding: clamp(24px, 3.2vw, 34px) clamp(44px, 6.6vw, 72px) 24px;
          color: ${colors.cream};
          box-sizing: border-box;
        }

        .tk-rekap-header h1,
        .tk-report-header h1 {
          margin: 0 0 8px;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 0;
        }

        .tk-rekap-header p,
        .tk-report-header p {
          margin: 0 0 22px;
          font-size: 13px;
          font-weight: 700;
        }

        .tk-rekap-header label,
        .tk-filter-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 16px;
          font-weight: 900;
        }

        .tk-search {
          width: 225px;
          height: 39px;
          border-radius: 999px;
          background: ${colors.cream};
          display: flex;
          align-items: center;
          overflow: hidden;
          box-shadow: 0 3px 7px rgba(0, 0, 0, 0.18);
        }

        .tk-search input {
          flex: 1;
          border: 0;
          outline: none;
          background: transparent;
          padding: 0 15px;
          font-family: inherit;
          color: ${colors.brown};
          font-weight: 700;
        }

        .tk-search span {
          width: 46px;
          text-align: center;
          font-size: 24px;
        }

        .tk-rekap-table-zone {
          width: auto;
          padding: 0 0 52px;
          margin: 0 clamp(36px, 2.8vw, 44px) 0 clamp(44px, 6.6vw, 72px);
          box-sizing: border-box;
        }

        .tk-table-actions {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 18px;
        }

        .tk-table-actions button,
        .tk-bottom-action button,
        .tk-report-buttons button,
        .tk-filter-group button {
          min-height: 30px;
          border: 0;
          border-radius: 9px;
          background: ${colors.cream};
          color: ${colors.brown};
          padding: 0 17px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
        }

        .tk-message {
          background: ${colors.yellow};
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 12px;
          font-weight: 900;
        }

        .tk-rekap-head,
        .tk-rekap-row {
          display: grid;
          grid-template-columns: 1.15fr 0.72fr 1fr 1.05fr 0.92fr 0.8fr 38px;
          align-items: center;
          gap: 8px;
        }

        .tk-rekap-head {
          min-height: 50px;
          background: ${colors.cream};
          padding: 0 22px;
          font-size: 14px;
          font-weight: 900;
          text-align: center;
        }

        .tk-rekap-row {
          width: 100%;
          min-height: 48px;
          margin-top: 13px;
          border: 0;
          border-radius: 9px;
          background: rgba(255, 245, 248, 0.96);
          padding: 0 22px;
          color: ${colors.brown};
          font-family: inherit;
          font-size: 13px;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .tk-rekap-row:hover,
        .tk-paper-row:hover {
          filter: brightness(0.98);
        }

        .tk-rekap-row input {
          width: 18px;
          height: 18px;
          accent-color: ${colors.green};
          cursor: pointer;
        }

        .tk-status {
          min-width: 72px;
          min-height: 22px;
          padding: 2px 12px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
        }

        .tk-status.normal {
          background: #CEFCBD;
          color: ${colors.green};
        }

        .tk-status.warning {
          background: ${colors.yellow};
          color: #D99000;
        }

        .tk-status.danger {
          background: #FFD0D0;
          color: #FF1010;
        }

        .tk-empty-row {
          background: ${colors.cream};
          border-radius: 9px;
          margin-top: 13px;
          padding: 20px;
          text-align: center;
          font-weight: 900;
        }

        .tk-bottom-action {
          display: flex;
          justify-content: flex-end;
          margin-top: 25px;
        }

        .tk-report-header {
          min-height: 132px;
          padding: 33px clamp(44px, 6.6vw, 72px);
          color: ${colors.cream};
          display: flex;
          gap: 18px;
          align-items: flex-start;
          box-sizing: border-box;
        }

        .tk-report-header button {
          width: 28px;
          height: 28px;
          border: 0;
          background: transparent;
          color: ${colors.cream};
          font-size: 28px;
          cursor: pointer;
          line-height: 1;
        }

        .tk-report-content {
          min-height: calc(100vh - 132px);
          background: ${colors.cream};
          padding: 28px clamp(44px, 6.6vw, 72px) 48px;
        }

        .tk-filter-group {
          display: grid;
          gap: 8px;
          justify-items: start;
          margin-bottom: 28px;
        }

        .tk-filter-group button {
          min-width: 235px;
          justify-content: space-between;
          background: ${colors.tan};
        }

        .tk-report-content h2 {
          margin: 0 0 24px;
          font-size: 18px;
          font-weight: 900;
        }

        .tk-paper {
          width: auto;
          min-height: 535px;
          border: 2px solid ${colors.brown};
          background: rgba(255, 255, 255, 0.35);
          padding: 26px 14px;
          box-sizing: border-box;
        }

        .tk-paper-title {
          min-height: 72px;
          border-bottom: 1px solid ${colors.brown};
          display: grid;
          align-content: center;
          text-align: center;
          color: #111;
          font-size: 17px;
        }

        .tk-paper-title span {
          margin-top: 8px;
          font-weight: 500;
        }

        .tk-paper-subtitle {
          margin: 20px 0 18px;
          color: #111;
          font-size: 16px;
        }

        .tk-paper-head,
        .tk-paper-row {
          display: grid;
          grid-template-columns: 1.2fr 0.7fr 1fr 1fr 0.95fr 0.8fr;
          align-items: center;
          text-align: center;
          gap: 8px;
        }

        .tk-paper-head {
          min-height: 44px;
          border-bottom: 1px solid rgba(101, 80, 64, 0.5);
          font-size: 13px;
          font-weight: 900;
        }

        .tk-paper-row {
          width: 100%;
          min-height: 48px;
          border: 0;
          border-radius: 8px;
          margin-top: 13px;
          background: rgba(255, 245, 248, 0.86);
          color: ${colors.brown};
          font-family: inherit;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
        }

        .tk-sign {
          text-align: right;
          padding: 70px 70px 0 0;
          color: #111;
          font-size: 16px;
          font-weight: 900;
        }

        .tk-report-buttons {
          width: auto;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 32px;
          margin-top: 22px;
        }

        .tk-report-buttons button {
          justify-content: center;
          min-height: 42px;
          border-radius: 999px;
        }

        .tk-success {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.36);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
        }

        .tk-success div {
          width: 300px;
          height: 260px;
          border-radius: 18px;
          background: rgba(101, 80, 64, 0.94);
          color: ${colors.cream};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-weight: 900;
        }

        .tk-success span {
          display: block;
          font-size: 120px;
          line-height: 0.65;
          margin-bottom: 28px;
          font-weight: 300;
        }

        .tk-success strong {
          font-size: 30px;
          line-height: 1.18;
        }

        @media (max-width: 980px) {
          .tk-rekap-header,
          .tk-report-header,
          .tk-report-content {
            padding-left: 24px;
            padding-right: 24px;
          }

          .tk-rekap-table-zone {
            width: auto;
            margin-left: 24px;
            margin-right: 24px;
          }

          .tk-paper,
          .tk-report-buttons {
            width: 100%;
          }

          .tk-rekap-head,
          .tk-rekap-row {
            grid-template-columns: 1.2fr 0.7fr 0.9fr 0.9fr 0.9fr 0.8fr 40px;
            min-width: 780px;
          }

          .tk-rekap-table,
          .tk-paper {
            overflow-x: auto;
          }

          .tk-report-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
