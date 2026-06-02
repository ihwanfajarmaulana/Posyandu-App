import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function normalizeStatus(value = '') {
  return String(value).toLowerCase().replaceAll(' ', '_')
}

function DonutChart({ total = 0, segments = [], centerLabel = 'Total Anak' }) {
  const size = 230
  const stroke = 46
  const radius = 82
  const center = size / 2
  const circumference = 2 * Math.PI * radius

  let cumulative = 0

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#EEF1EC"
          strokeWidth={stroke}
        />

        {segments.map((item) => {
          const value = Number(item.value || 0)
          const percent = total > 0 ? value / total : 0
          const dash = percent * circumference
          const offset = circumference * 0.25 - cumulative * circumference

          cumulative += percent

          return (
            <circle
              key={item.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            />
          )
        })}

        <circle cx={center} cy={center} r="48" fill="#FFF7F3" />

        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          className="donut-total"
        >
          {total}
        </text>

        <text
          x={center}
          y={center + 18}
          textAnchor="middle"
          className="donut-label"
        >
          {centerLabel}
        </text>
      </svg>
    </div>
  )
}

function LineChart({ data = [], series = [] }) {
  const width = 860
  const height = 230
  const padding = { top: 24, right: 28, bottom: 42, left: 44 }

  const values = data.flatMap((item) => series.map((s) => Number(item[s.key] || 0)))
  const maxValue = Math.max(...values, 10)

  const getX = (index) => {
    if (data.length <= 1) return padding.left
    return padding.left + ((width - padding.left - padding.right) / (data.length - 1)) * index
  }

  const getY = (value) => {
    const chartHeight = height - padding.top - padding.bottom
    return padding.top + chartHeight - (Number(value || 0) / maxValue) * chartHeight
  }

  return (
    <div className="line-scroll">
      <svg viewBox={`0 0 ${width} ${height}`} className="line-chart">
        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const y = padding.top + (height - padding.top - padding.bottom) * step

          return (
            <line
              key={step}
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="#E5E8E0"
              strokeWidth="1"
            />
          )
        })}

        {series.map((line) => {
          const points = data
            .map((item, index) => `${getX(index)},${getY(item[line.key])}`)
            .join(' ')

          return (
            <polyline
              key={line.key}
              points={points}
              fill="none"
              stroke={line.color}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )
        })}

        {series.map((line) =>
          data.map((item, index) => (
            <g key={`${line.key}-${index}`}>
              <circle
                cx={getX(index)}
                cy={getY(item[line.key])}
                r="4"
                fill={line.color}
              />

              <text
                x={getX(index)}
                y={getY(item[line.key]) - 10}
                textAnchor="middle"
                className="point-label"
                fill={line.color}
              >
                {item[line.key]}
              </text>
            </g>
          ))
        )}

        {data.map((item, index) => (
          <text
            key={item.label}
            x={getX(index)}
            y={height - 12}
            textAnchor="middle"
            className="month-label"
          >
            {item.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default function MonitoringStatusBalita() {
  const navigate = useNavigate()
  const now = new Date()

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear] = useState(now.getFullYear())
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_balita: 0,
    stunting: 0,
    sudah_imunisasi: 0,
    status_gizi: [],
    tren_pertumbuhan: [],
  })

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        const response = await API.get('/dashboard/statistik')
        if (!mounted) return

        setStats(response?.data?.data || {
          total_balita: 0,
          stunting: 0,
          sudah_imunisasi: 0,
          status_gizi: [],
          tren_pertumbuhan: [],
        })
      } catch (error) {
        console.error('Gagal memuat monitoring:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  const totalBalita = Number(stats.total_balita || 0)
  const stunting = Number(stats.stunting || 0)
  const sudahImunisasi = Number(stats.sudah_imunisasi || 0)
  const belumImunisasi = Math.max(totalBalita - sudahImunisasi, 0)

  const giziMap = {}

  ;(stats.status_gizi || []).forEach((item) => {
    const key = normalizeStatus(item.status_gizi)
    giziMap[key] = Number(item.jumlah || 0)
  })

  const normal =
    giziMap.normal ||
    giziMap.gizi_baik ||
    giziMap.baik ||
    0

  const kurangGizi =
    giziMap.gizi_kurang ||
    giziMap.kurang_gizi ||
    giziMap.kurang ||
    0

  const giziBuruk =
    giziMap.gizi_buruk ||
    giziMap.buruk ||
    0

  const kurangTotal = kurangGizi + giziBuruk

  const pct = (value) => {
    if (!totalBalita) return '0%'
    return `${((Number(value || 0) / totalBalita) * 100).toFixed(1)}%`
  }

  const giziSegments = [
    { label: 'Normal', value: normal, color: '#19B96D' },
    { label: 'Gizi Kurang', value: kurangTotal, color: '#F5B942' },
    { label: 'Stunting', value: stunting, color: '#F05A5A' },
  ].filter((item) => item.value > 0)

  const imunisasiSegments = [
    { label: 'Sudah Imunisasi', value: sudahImunisasi, color: '#268BFF' },
    { label: 'Belum Imunisasi', value: belumImunisasi, color: '#8D99A6' },
  ].filter((item) => item.value > 0)

  const currentYear = selectedYear

  const pertumbuhanLine = Array.from({ length: 12 }).map((_, index) => {
    const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`
    const found = (stats.tren_pertumbuhan || []).find((item) => item.bulan === monthKey)

    const jumlah = Number(found?.jumlah_pengukuran || 0)
    const jumlahStunting = Number(found?.jumlah_stunting || 0)

    return {
      label: monthShort[index],
      normal: Math.max(jumlah - jumlahStunting, 0),
      kurang: kurangTotal,
      stunting: jumlahStunting,
    }
  })

  const imunisasiLine = Array.from({ length: 12 }).map((_, index) => ({
    label: monthShort[index],
    sudah: index <= selectedMonth ? sudahImunisasi : 0,
    belum: index <= selectedMonth ? belumImunisasi : 0,
  }))

  return (
    <div className="monitoring-page">
      <header className="monitoring-header">
        <div>
          <p>Dashboard Monitoring</p>
          <h1>Monitoring Status Balita</h1>
          <span>Memantau status gizi balita serta perkembangan imunisasi</span>
        </div>

        <div className="header-actions">
          <label className="month-picker">
            <span>Bulan</span>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>
                  {month} {selectedYear}
                </option>
              ))}
            </select>
          </label>

          <button type="button" className="user-chip" onClick={() => navigate('/profil')}>
            👤 {user?.nama || user?.name || 'Admin'}
          </button>
        </div>
      </header>

      <section className="stat-grid">
        <div className="stat-card cream">
          <div className="stat-icon">👶</div>
          <div>
            <h2>{loading ? '...' : totalBalita}</h2>
            <p>Total Balita</p>
            <span>Anak Terdaftar</span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">🌱</div>
          <div>
            <h2>{loading ? '...' : normal}</h2>
            <p>Normal</p>
            <span>{pct(normal)}</span>
          </div>
        </div>

        <div className="stat-card yellow">
          <div className="stat-icon">⚠️</div>
          <div>
            <h2>{loading ? '...' : kurangTotal}</h2>
            <p>Kurang Gizi</p>
            <span>{pct(kurangTotal)}</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">📏</div>
          <div>
            <h2>{loading ? '...' : stunting}</h2>
            <p>Stunting</p>
            <span>{pct(stunting)}</span>
          </div>
        </div>
      </section>

      <section className="imunisasi-grid">
        <div className="wide-stat blue">
          <div className="stat-icon">💉</div>
          <div>
            <h2>{loading ? '...' : sudahImunisasi}</h2>
            <p>Sudah diimunisasi</p>
            <span>{pct(sudahImunisasi)}</span>
          </div>
        </div>

        <div className="wide-stat red">
          <div className="stat-icon">🩺</div>
          <div>
            <h2>{loading ? '...' : belumImunisasi}</h2>
            <p>Belum diimunisasi</p>
            <span>{pct(belumImunisasi)}</span>
          </div>
        </div>
      </section>

      <section className="chart-heading">
        <div>
          <h2>Grafik Perkembangan</h2>
          <p>Distribusi status gizi dan imunisasi balita</p>
        </div>
      </section>

      <section className="chart-grid">
        <div className="chart-card">
          <div className="chart-title">
            <h3>Distribusi Status Gizi</h3>
            <span>Total {totalBalita} Anak</span>
          </div>

          <DonutChart total={totalBalita} segments={giziSegments} />

          <div className="legend-list">
            {[
              { label: 'Normal', value: normal, color: '#19B96D' },
              { label: 'Gizi Kurang', value: kurangTotal, color: '#F5B942' },
              { label: 'Stunting', value: stunting, color: '#F05A5A' },
            ].map((item) => (
              <div key={item.label} className="legend-item">
                <span style={{ background: item.color }} />
                <p>{item.label}</p>
                <b>{item.value} anak</b>
                <em>{pct(item.value)}</em>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">
            <h3>Distribusi Status Imunisasi</h3>
            <span>Total {totalBalita} Anak</span>
          </div>

          <DonutChart total={totalBalita} segments={imunisasiSegments} />

          <div className="legend-list">
            {[
              { label: 'Sudah Imunisasi', value: sudahImunisasi, color: '#268BFF' },
              { label: 'Belum Imunisasi', value: belumImunisasi, color: '#8D99A6' },
            ].map((item) => (
              <div key={item.label} className="legend-item">
                <span style={{ background: item.color }} />
                <p>{item.label}</p>
                <b>{item.value} anak</b>
                <em>{pct(item.value)}</em>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="line-card">
        <div className="chart-title">
          <h3>Perkembangan Status Gizi per Bulan</h3>
          <span>Tahun {selectedYear}</span>
        </div>

        <LineChart
          data={pertumbuhanLine}
          series={[
            { key: 'normal', label: 'Normal', color: '#20B86F' },
            { key: 'kurang', label: 'Gizi Kurang', color: '#F5B942' },
            { key: 'stunting', label: 'Stunting', color: '#F05A5A' },
          ]}
        />

        <div className="line-legend">
          <span><b className="dot green-dot" /> Normal</span>
          <span><b className="dot yellow-dot" /> Gizi Kurang</span>
          <span><b className="dot red-dot" /> Stunting</span>
        </div>
      </section>

      <section className="line-card">
        <div className="chart-title">
          <h3>Perkembangan Status Imunisasi per Bulan</h3>
          <span>Tahun {selectedYear}</span>
        </div>

        <LineChart
          data={imunisasiLine}
          series={[
            { key: 'sudah', label: 'Sudah Imunisasi', color: '#268BFF' },
            { key: 'belum', label: 'Belum Imunisasi', color: '#8D99A6' },
          ]}
        />

        <div className="line-legend">
          <span><b className="dot blue-dot" /> Sudah Imunisasi</span>
          <span><b className="dot gray-dot" /> Belum Imunisasi</span>
        </div>
      </section>

      <div className="bottom-action">
        <button type="button" onClick={() => navigate('/rekap-penimbangan')}>
          Lihat Laporan Penimbangan →
        </button>
      </div>

      <style>{`
        .monitoring-page {
          min-height: 100vh;
          padding: 28px 34px 52px;
          box-sizing: border-box;
          background:
            linear-gradient(rgba(255, 120, 120, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 120, 120, 0.08) 1px, transparent 1px),
            #4F724D;
          background-size: 24px 24px;
          color: #FFFFFF;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .monitoring-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
        }

        .monitoring-header p {
          margin: 0 0 8px;
          color: #F5E2D6;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .monitoring-header h1 {
          margin: 0;
          font-size: 34px;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .monitoring-header span {
          display: block;
          margin-top: 8px;
          color: #E4F0E1;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .month-picker {
          min-width: 220px;
          padding: 8px 14px;
          border-radius: 14px;
          background: #FFF4F6;
          color: #754E53;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .month-picker span {
          margin: 0;
          color: #754E53;
          font-size: 12px;
          font-weight: 700;
        }

        .month-picker select {
          border: none;
          background: transparent;
          outline: none;
          color: #754E53;
          font-family: inherit;
          font-weight: 600;
          cursor: pointer;
        }

        .user-chip {
          min-height: 42px;
          border: none;
          border-radius: 999px;
          padding: 0 16px;
          background: #F2D8CB;
          color: #67493B;
          font-family: inherit;
          font-weight: 700;
          cursor: pointer;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 18px;
        }

        .stat-card,
        .wide-stat {
          min-height: 132px;
          border-radius: 18px;
          padding: 22px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 16px;
          color: #26362A;
          box-shadow: 0 12px 26px rgba(22, 42, 25, 0.16);
        }

        .cream { background: #FFEAC7; }
        .green { background: #E2F5D8; }
        .yellow { background: #FFE8A8; }
        .orange { background: #FFD59B; }
        .blue { background: #EAF5FF; border-left: 7px solid #268BFF; }
        .red { background: #FFD5D5; border-left: 7px solid #F05A5A; }

        .stat-icon {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.52);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          flex-shrink: 0;
        }

        .stat-card h2,
        .wide-stat h2 {
          margin: 0;
          font-size: 42px;
          line-height: 1;
          font-weight: 850;
          letter-spacing: -1.2px;
        }

        .stat-card p,
        .wide-stat p {
          margin: 6px 0 0;
          color: #243427;
          font-size: 15px;
          font-weight: 800;
        }

        .stat-card span,
        .wide-stat span {
          margin-top: 4px;
          color: #6C5946;
          font-size: 13px;
          font-weight: 650;
        }

        .imunisasi-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 22px;
        }

        .wide-stat {
          min-height: 128px;
        }

        .chart-heading {
          margin: 8px 0 12px;
        }

        .chart-heading h2 {
          margin: 0;
          font-size: 22px;
          letter-spacing: -0.3px;
        }

        .chart-heading p {
          margin: 4px 0 0;
          color: #E1EFE0;
          font-size: 14px;
        }

        .chart-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 18px;
        }

        .chart-card,
        .line-card {
          border-radius: 20px;
          padding: 22px;
          background: #FFF7F8;
          color: #223126;
          box-shadow: 0 14px 30px rgba(22, 42, 25, 0.16);
          box-sizing: border-box;
        }

        .chart-title {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 14px;
        }

        .chart-title h3 {
          margin: 0;
          color: #243427;
          font-size: 17px;
          font-weight: 800;
        }

        .chart-title span {
          color: #7D8B7B;
          font-size: 13px;
          font-weight: 650;
        }

        .donut-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .donut-total {
          font-size: 34px;
          font-weight: 850;
          fill: #26362A;
        }

        .donut-label {
          font-size: 12px;
          font-weight: 650;
          fill: #7D8B7B;
        }

        .legend-list {
          display: grid;
          gap: 9px;
          margin-top: 12px;
        }

        .legend-item {
          display: grid;
          grid-template-columns: 14px 1fr auto 54px;
          align-items: center;
          gap: 10px;
          color: #26362A;
        }

        .legend-item > span {
          width: 11px;
          height: 11px;
          border-radius: 999px;
        }

        .legend-item p {
          margin: 0;
          font-size: 13px;
          color: #4B5F4C;
          font-weight: 650;
        }

        .legend-item b {
          font-size: 13px;
          color: #26362A;
        }

        .legend-item em {
          font-style: normal;
          font-size: 12px;
          color: #7D8B7B;
          text-align: right;
        }

        .line-card {
          margin-top: 18px;
        }

        .line-scroll {
          width: 100%;
          overflow-x: auto;
        }

        .line-chart {
          width: 100%;
          min-width: 760px;
          display: block;
        }

        .point-label {
          font-size: 10px;
          font-weight: 700;
        }

        .month-label {
          font-size: 11px;
          fill: #7D8B7B;
          font-weight: 650;
        }

        .line-legend {
          display: flex;
          justify-content: center;
          gap: 22px;
          flex-wrap: wrap;
          margin-top: 12px;
          color: #4B5F4C;
          font-size: 13px;
          font-weight: 650;
        }

        .line-legend span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          display: inline-block;
        }

        .green-dot { background: #20B86F; }
        .yellow-dot { background: #F5B942; }
        .red-dot { background: #F05A5A; }
        .blue-dot { background: #268BFF; }
        .gray-dot { background: #8D99A6; }

        .bottom-action {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
        }

        .bottom-action button {
          border: none;
          border-radius: 16px;
          padding: 13px 20px;
          background: #F3DCCF;
          color: #6D4C3D;
          font-family: inherit;
          font-weight: 750;
          cursor: pointer;
          box-shadow: 0 12px 24px rgba(22, 42, 25, 0.12);
        }

        @media (max-width: 1200px) {
          .stat-grid,
          .chart-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .monitoring-header {
            flex-direction: column;
          }

          .header-actions {
            justify-content: flex-start;
          }
        }

        @media (max-width: 760px) {
          .monitoring-page {
            padding: 22px 16px 40px;
          }

          .stat-grid,
          .imunisasi-grid,
          .chart-grid {
            grid-template-columns: 1fr;
          }

          .monitoring-header h1 {
            font-size: 28px;
          }

          .month-picker {
            width: 100%;
          }

          .user-chip {
            width: 100%;
          }

          .stat-card,
          .wide-stat {
            padding: 18px;
          }
        }
      `}</style>
    </div>
  )
}