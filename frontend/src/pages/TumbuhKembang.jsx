import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import API from '../api'

const fontFamily = '"Segoe UI", Arial, Helvetica, sans-serif'

const sidebarMenus = [
  { icon: '🏠', label: 'Beranda', to: '/dashboard', activePaths: ['/dashboard'] },
  { icon: '📈', label: 'Tumbuh Kembang', to: '/tumbuh-kembang', activePaths: ['/tumbuh-kembang'] },
  { icon: '💉', label: 'Imunisasi', to: '/imunisasi', activePaths: ['/imunisasi'] },
  { icon: '📅', label: 'Jadwal Posyandu', to: '/jadwal', activePaths: ['/jadwal'] },
  { icon: '🏥', label: 'Kunjungan', to: '/riwayatkunjungan', activePaths: ['/riwayatkunjungan', '/catatkunjungan'] },
  { icon: '📝', label: 'Penanganan & Rekomendasi', to: '/penanganan-rekomendasi', activePaths: ['/penanganan-rekomendasi', '/rekomendasi-balita'] },
  { icon: '👶', label: 'Daftar Balita', to: '/daftar-balita', activePaths: ['/daftar-balita'] },
  { icon: '➕', label: 'Tambah Balita', to: '/tambah-balita', activePaths: ['/tambah-balita'] },
  { icon: '📋', label: 'Laporan Penimbangan', to: '/rekap-penimbangan', activePaths: ['/rekap-penimbangan'] },
  { icon: '👤', label: 'Profil', to: '/profil', activePaths: ['/profil'] },
  { icon: '⚙️', label: 'Pengaturan', to: '/pengaturan', activePaths: ['/pengaturan'] },
]

const getToday = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatUsia = (usiaBulan) => {
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

const formatJenisKelamin = (value) => {
  if (value === 'L') return 'Laki-laki'
  if (value === 'P') return 'Perempuan'
  return value || '-'
}

const formatTanggal = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const getAvatar = (jenisKelamin) => {
  return jenisKelamin === 'P' ? '👧' : '👦'
}

const labelStatusGizi = (value) => {
  const map = {
    gizi_buruk: 'Gizi Buruk',
    gizi_kurang: 'Gizi Kurang',
    gizi_baik: 'Gizi Baik',
    gizi_lebih: 'Gizi Lebih',
    obesitas: 'Obesitas',
    Normal: 'Gizi Baik',
    Kurang: 'Gizi Kurang',
    Berlebih: 'Gizi Lebih',
    'Perlu Pemeriksaan': 'Perlu Pemeriksaan',
  }
  return map[value] || value || 'Gizi Baik'
}

const statusGiziBadgeStyle = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'gizi_buruk':
      return { background: '#FDDEDE', color: '#B91C1C' } // merah
    case 'gizi_kurang':
      return { background: '#FEF3C7', color: '#bdad37' } // kuning/oranye
    case 'gizi_lebih':
      return { background: '#FFEDD5', color: '#C2410C' } // oranye
    case 'gizi_baik':
    default:
      return { background: '#C8FDB6', color: '#4E724D' } // hijau
  }
}

const getStatusGizi = (beratBadan, tinggiBadan, usiaBulan) => {
  const bb = Number(beratBadan)
  const tb = Number(tinggiBadan)
  const usia = Number(usiaBulan) || 0

  if (!bb || !tb) return 'gizi_baik'

  const isStunting = tb < (45 + usia * 0.7)
  const bbKurang = bb < (3.5 + usia * 0.18)
  const bbLebih = bb > (5 + usia * 0.4)

  if (isStunting && bbKurang) return 'gizi_kurang'
  if (isStunting) return 'gizi_kurang'
  if (bbKurang) return 'gizi_kurang'
  if (bbLebih) return 'gizi_lebih'
  return 'gizi_baik'
}

const getZScoreStatus = (value) => {
  const z = Number(value)
  if (Number.isNaN(z)) return 'Normal'
  if (z < -3) return 'Sangat Kurang'
  if (z < -2) return 'Risiko'
  if (z <= 2) return 'Normal'
  return 'Berlebih'
}

const safeNumber = (value) => {
  const number = Number(value)
  return Number.isNaN(number) ? 0 : number
}

const normalizeRiwayat = (data) => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.riwayat)
    ? data.riwayat
    : []

  return list.map((item, index) => ({
    id: item.id || `local-${index}`,
    tanggal_pengukuran:
      item.tanggal_pengukuran ||
      item.tanggal_ukur ||
      item.tanggal_kunjungan ||
      item.created_at ||
      getToday(),
    usia_bulan: item.usia_bulan,
    berat_badan: item.berat_badan || item.bb || item.berat || '',
    tinggi_badan: item.tinggi_badan || item.tb || item.tinggi || '',
    lingkar_kepala: item.lingkar_kepala || item.lk || '',
    bb_u: item.bb_u ?? item.zscore_bb_u ?? item.z_score_bb_u ?? 0,
    tb_u: item.tb_u ?? item.zscore_tb_u ?? item.z_score_tb_u ?? 0,
    bb_tb: item.bb_tb ?? item.zscore_bb_tb ?? item.z_score_bb_tb ?? 0,
    status_berat: item.status_berat || '',
    status_tinggi: item.status_tinggi || '',
    status_gizi: item.status_gizi || 'gizi_baik',
    catatan: item.catatan || '',
  }))
}

const buildRecommendation = (item, balita) => {
  const status = (item?.status_gizi || 'gizi_baik').toLowerCase()
  const usia = Number(item?.usia_bulan || balita?.usia_bulan || 0)

  const nutrisi =
    status === 'gizi_buruk'
      ? [
          '⚠️ Segera bawa anak ke puskesmas atau dokter — gizi buruk memerlukan penanganan medis segera.',
          'Jangan berikan suplemen atau obat apapun tanpa arahan dokter.',
          'Sementara menunggu penanganan: berikan makanan yang mudah dicerna seperti bubur, telur, atau ASI (jika masih menyusu).',
          'Pastikan anak terhidrasi dengan baik — berikan air putih atau oralit jika ada tanda dehidrasi.',
        ]
      : status === 'gizi_kurang'
      ? [
          'Tingkatkan konsumsi protein seperti telur, ikan, ayam, tahu, dan tempe setiap hari.',
          'Tambahkan sumber kalori sehat seperti alpukat, kentang, keju, dan susu full cream.',
          'Berikan makan utama 3 kali sehari ditambah selingan bergizi 2 kali sehari.',
          'Kurangi minuman manis yang dapat menurunkan nafsu makan anak.',
          'Tanyakan ke petugas posyandu tentang program PMT (Pemberian Makanan Tambahan).',
        ]
      : status === 'gizi_lebih' || status === 'obesitas'
      ? [
          'Atur porsi makan anak agar tetap seimbang — jangan kurangi drastis, cukup sesuaikan.',
          'Kurangi makanan tinggi gula, gorengan, dan snack kemasan.',
          'Perbanyak sayur, buah, dan air putih setiap hari.',
          'Biasakan pola makan teratur tanpa ngemil berlebihan di luar jam makan.',
          'Jangan terapkan diet ketat pada balita — konsultasikan ke dokter atau ahli gizi.',
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

  const pantauan =
    status === 'gizi_buruk'
      ? [
          '🔴 Pantau kondisi anak setiap hari — perhatikan tanda edema (bengkak), kelesuan, atau tidak mau makan.',
          'Timbang berat badan minimal seminggu sekali selama masa pemulihan.',
          'Ikuti program pemulihan gizi di puskesmas secara rutin.',
          'Segera kembali ke dokter jika kondisi anak memburuk.',
        ]
      : status === 'gizi_kurang'
      ? [
          'Timbang berat badan setiap 2 minggu untuk memantau perkembangan.',
          'Catat asupan makan harian anak agar mudah dilaporkan ke petugas.',
          'Pantau tinggi badan dan lingkar kepala sesuai jadwal posyandu.',
          'Bila berat badan tidak naik dalam 1 bulan, segera konsultasi ke dokter.',
        ]
      : [
          'Lakukan penimbangan berat badan secara berkala setiap bulan.',
          'Pantau tinggi badan dan lingkar kepala sesuai jadwal.',
          'Perhatikan perubahan nafsu makan, aktivitas, dan kualitas tidur anak.',
          'Bila ada penurunan kondisi, segera konsultasikan ke petugas kesehatan.',
        ]

  return { nutrisi, aktivitas, imunisasi, pantauan }
}

function Sidebar({ location, navigate, handleLogout }) {
  const isActive = (menu) => {
    return menu.activePaths.some((path) => location.pathname.startsWith(path))
  }

  return (
    <aside style={styles.sidebar}>
      <button type="button" onClick={() => navigate('/dashboard')} style={styles.brand}>
        PosyanduCeria
      </button>

      <nav style={styles.nav}>
        {sidebarMenus.map((menu) => (
          <Link
            key={menu.label}
            to={menu.to}
            style={{
              ...styles.navLink,
              ...(isActive(menu) ? styles.navLinkActive : {}),
            }}
          >
            <span style={styles.navIcon}>{menu.icon}</span>
            <span>{menu.label}</span>
          </Link>
        ))}
      </nav>

      <button type="button" onClick={handleLogout} style={styles.logoutButton}>
        Logout
      </button>
    </aside>
  )
}

function GrowthChart({ title, label, unit, dataKey, history }) {
  const data = [...history]
    .sort((a, b) => new Date(a.tanggal_pengukuran) - new Date(b.tanggal_pengukuran))
    .slice(-6)

  const values = data.map((item) => safeNumber(item[dataKey])).filter((value) => value > 0)

  const minValue = values.length ? Math.min(...values) : 0
  const maxValue = values.length ? Math.max(...values) : 10
  const range = maxValue - minValue || 1

  const points = data.map((item, index) => {
    const value = safeNumber(item[dataKey])
    const x = 38 + index * (220 / Math.max(data.length - 1, 1))
    const y = 150 - ((value - minValue) / range) * 85
    return { x, y, value }
  })

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  return (
    <div style={styles.chartCard}>
      <div style={styles.chartHeader}>
        <h3 style={styles.chartTitle}>{title}</h3>
        <span style={styles.smallInfo}>ⓘ</span>
      </div>

      <span style={styles.chartStatus}>Normal</span>

      <svg viewBox="0 0 300 185" style={styles.chartSvg}>
        <defs>
          <linearGradient id={`${dataKey}-zone`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FAD7D7" />
            <stop offset="45%" stopColor="#FFE6B8" />
            <stop offset="62%" stopColor="#DDF4D7" />
            <stop offset="100%" stopColor="#FFE6B8" />
          </linearGradient>
        </defs>

        <rect x="32" y="28" width="230" height="126" rx="8" fill={`url(#${dataKey}-zone)`} />

        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1="32"
            y1={42 + line * 31}
            x2="262"
            y2={42 + line * 31}
            stroke="#ffffff"
            strokeWidth="1"
            opacity="0.9"
          />
        ))}

        {[0, 1, 2, 3, 4].map((line) => (
          <line
            key={line}
            x1={38 + line * 56}
            y1="28"
            x2={38 + line * 56}
            y2="154"
            stroke="#ffffff"
            strokeWidth="1"
            opacity="0.9"
          />
        ))}

        <text x="42" y="24" fontSize="9" fill="#6B5247">
          {label} ({unit})
        </text>

        <text x="130" y="174" fontSize="9" fill="#6B5247">
          Usia (bulan)
        </text>

        {path && <path d={path} fill="none" stroke="#4DBA7A" strokeWidth="3" />}

        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#ffffff"
            stroke="#4DBA7A"
            strokeWidth="2"
          />
        ))}

        <text x="266" y="52" fontSize="9" fill="#E85A5A">
          +3
        </text>
        <text x="266" y="80" fontSize="9" fill="#E85A5A">
          +2
        </text>
        <text x="266" y="108" fontSize="9" fill="#4DBA7A">
          0
        </text>
        <text x="266" y="136" fontSize="9" fill="#E85A5A">
          -2
        </text>
      </svg>

      <div style={styles.chartLegend}>
        <span style={styles.legendLine} />
        Hasil Pengukuran Anak
      </div>
    </div>
  )
}

function FormInput({ label, type = 'text', value, onChange, required = false, step, placeholder }) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        step={step}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </div>
  )
}

function RecommendationSection({
  title,
  items,
  icon,
  iconBg,
  onEdit,
}) { {
  return (
    <div style={styles.recommendationItem}>
      <div style={styles.recommendationIconWrap}>
        <div style={{ ...styles.recommendationIcon, background: iconBg }}>{icon}</div>
      </div>

      <div style={styles.recommendationContent}>
        <h3 style={styles.recommendationItemTitle}>{title}</h3>
        {onEdit && (
          <button type="button" onClick={onEdit} style={styles.recommendationEditButton}>✏️</button>
        )}
        <ul style={styles.recommendationList}>
          {items.map((text, index) => (
            <li key={index} style={styles.recommendationListItem}>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
}

const emptyForm = {
  tanggal_pengukuran: getToday(),
  berat_badan: '',
  tinggi_badan: '',
  lingkar_kepala: '',
  status_gizi: 'gizi_baik',
  catatan: '',
}

export default function TumbuhKembang() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const [balita, setBalita] = useState(null)
  const [history, setHistory] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)

  const [selectedMeasurement, setSelectedMeasurement] = useState(null)
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [isEditRecommendation, setIsEditRecommendation] = useState(false)

  // Cek apakah datang dari RekomendasiBalita dengan mode edit
  const isEditMode = location.state?.isEditMode === true

  const [form, setForm] = useState({ ...emptyForm })

  const latest = history[0]
  const statusGizi = latest?.status_gizi || form.status_gizi || balita?.status_gizi || 'Normal'

  useEffect(() => {
    const status = getStatusGizi(form.berat_badan, form.tinggi_badan, balita?.usia_bulan)
    setForm((prev) => ({ ...prev, status_gizi: status }))
  }, [form.berat_badan, form.tinggi_badan, balita?.usia_bulan])

  useEffect(() => {
    loadPageData()
  }, [id])

  const loadPageData = async () => {
    setLoading(true)
    setError('')

    try {
      let selectedBalita = null

      try {
        const detailRes = await API.get(`/balita/${id}`)
        selectedBalita = detailRes.data?.data || detailRes.data
      } catch {
        const listRes = await API.get('/balita?limit=100')
        const list = Array.isArray(listRes.data)
          ? listRes.data
          : Array.isArray(listRes.data?.data)
          ? listRes.data.data
          : []
        selectedBalita = list.find((item) => String(item.id) === String(id))
      }

      if (!selectedBalita) {
        setError('Data balita tidak ditemukan.')
        return
      }

      setBalita(selectedBalita)

      let apiHistory = []
      try {
        const historyRes = await API.get(`/balita/${id}/pertumbuhan`)
        apiHistory = normalizeRiwayat(historyRes.data)
      } catch {
        apiHistory = []
      }

      const mergedHistory = [...apiHistory]
        .filter((item) => item.tanggal_pengukuran)
        .sort((a, b) => new Date(b.tanggal_pengukuran) - new Date(a.tanggal_pengukuran))

      setHistory(mergedHistory)

      // Jika datang dari RekomendasiBalita dengan mode edit, langsung tampilkan rekomendasi
      if (location.state?.isEditMode && mergedHistory.length > 0) {
        setSelectedMeasurement(mergedHistory[0])
        setShowRecommendation(true)
        setIsEditRecommendation(true)
      }

      if (mergedHistory.length > 0) {
        setForm((prev) => ({
          ...prev,
          berat_badan: mergedHistory[0].berat_badan || '',
          tinggi_badan: mergedHistory[0].tinggi_badan || '',
          lingkar_kepala: mergedHistory[0].lingkar_kepala || '',
          status_gizi: mergedHistory[0].status_gizi || 'gizi_baik',
        }))
      } else {
        setForm((prev) => ({
          ...prev,
          berat_badan: selectedBalita.berat_badan || selectedBalita.bb_terakhir || '',
          tinggi_badan: selectedBalita.tinggi_badan || selectedBalita.tb_terakhir || '',
          lingkar_kepala: selectedBalita.lingkar_kepala || selectedBalita.lk_terakhir || '',
          status_gizi: selectedBalita.status_gizi || 'gizi_baik',
        }))
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data tumbuh kembang.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const openFormTambah = () => {
    setEditId(null)
    setForm({ ...emptyForm, tanggal_pengukuran: getToday() })
    setShowForm(true)
  }

  const openFormEdit = (item) => {
    setEditId(item.id)
    setForm({
      tanggal_pengukuran: item.tanggal_pengukuran || getToday(),
      berat_badan: item.berat_badan || '',
      tinggi_badan: item.tinggi_badan || '',
      lingkar_kepala: item.lingkar_kepala || '',
      status_gizi: item.status_gizi || 'gizi_baik',
      catatan: item.catatan || '',
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm({ ...emptyForm, tanggal_pengukuran: getToday() })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.berat_badan || !form.tinggi_badan) {
      alert('Berat badan dan tinggi badan wajib diisi.')
      return
    }

    setSaving(true)

    const payload = {
      tanggal_ukur: form.tanggal_pengukuran,
      berat_badan: Number(form.berat_badan),
      tinggi_badan: Number(form.tinggi_badan),
      lingkar_kepala: form.lingkar_kepala ? Number(form.lingkar_kepala) : null,
      catatan: form.catatan,
    }

    try {
      if (editId) {
        const res = await API.put(`/pertumbuhan/${editId}`, payload)
        const updated = normalizeRiwayat([
          res.data?.data || {
            ...payload,
            id: editId,
            tanggal_pengukuran: form.tanggal_pengukuran,
            status_gizi: form.status_gizi,
          },
        ])[0]

        setHistory((prev) =>
          prev
            .map((item) => (String(item.id) === String(editId) ? updated : item))
            .sort((a, b) => new Date(b.tanggal_pengukuran) - new Date(a.tanggal_pengukuran))
        )

        alert('Data tumbuh kembang berhasil diperbarui.')
      } else {
        const res = await API.post(`/balita/${id}/pertumbuhan`, payload)
        const newRecord = normalizeRiwayat([
          res.data?.data || {
            ...payload,
            id: Date.now(),
            tanggal_pengukuran: form.tanggal_pengukuran,
            status_gizi: form.status_gizi,
          },
        ])[0]

        setHistory((prev) =>
          [newRecord, ...prev].sort(
            (a, b) => new Date(b.tanggal_pengukuran) - new Date(a.tanggal_pengukuran)
          )
        )

        alert('Data tumbuh kembang berhasil disimpan.')
      }

      handleCloseForm()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data tumbuh kembang.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    const konfirmasi = window.confirm(
      `Hapus data pengukuran tanggal ${formatTanggal(item.tanggal_pengukuran)}?\nTindakan ini tidak bisa dibatalkan.`
    )
    if (!konfirmasi) return

    try {
      await API.delete(`/pertumbuhan/${item.id}`)
      setHistory((prev) => prev.filter((h) => String(h.id) !== String(item.id)))
      alert('Data berhasil dihapus.')
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus data.')
    }
  }

  const handleSelectMeasurement = (item) => {
    setSelectedMeasurement(item)
  }

  const handleGenerateRecommendation = () => {
  if (!selectedMeasurement) return

  setIsEditRecommendation(false)
  setShowRecommendation(true)

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

  const handleEditRecommendation = () => {
  setIsEditRecommendation(true)
}

  const handleBackToHistory = () => {
    setShowRecommendation(false)
  }

  const handleSaveRecommendation = () => {
  if (!selectedMeasurement) return

  const recommendation = buildRecommendation(selectedMeasurement, balita)

  const existing =
    JSON.parse(localStorage.getItem('rekomendasi_balita') || '[]')

  const newRecommendation = {
    id: Date.now(),
    childId: balita?.id || id,
    nama_anak: balita?.nama || '-',
    jenis_kelamin: balita?.jenis_kelamin || 'L',
    usia: formatUsia(balita?.usia_bulan),
    ibu: balita?.nama_ibu || '-',
    tanggal: selectedMeasurement.tanggal_pengukuran,
    status_gizi: labelStatusGizi(selectedMeasurement.status_gizi),
    dibuat_oleh: user?.nama || 'Petugas',
    recommendation,
  }

  if (isEditRecommendation) {
    const updated = existing.map((item) =>
      item.childId === (balita?.id || id)
        ? {
            ...item,
            recommendation,
            tanggal: selectedMeasurement.tanggal_pengukuran,
            status_gizi: labelStatusGizi(selectedMeasurement.status_gizi),
          }
        : item
    )

    localStorage.setItem(
      'rekomendasi_balita',
      JSON.stringify(updated)
    )

    alert('Rekomendasi berhasil diperbarui.')
  } else {
    existing.unshift(newRecommendation)

    localStorage.setItem(
      'rekomendasi_balita',
      JSON.stringify(existing)
    )

    alert('Rekomendasi berhasil disimpan.')
  }

  navigate('/rekomendasi-balita')
}

  const recommendation = selectedMeasurement
    ? buildRecommendation(selectedMeasurement, balita)
    : null

  if (showRecommendation && selectedMeasurement && recommendation) {
    return (
      <div style={styles.page}>
        <Sidebar location={location} navigate={navigate} handleLogout={handleLogout} />

        <main style={styles.main}>
          <header style={styles.header}>
            <div style={styles.headerLeft}>
              <button type="button" onClick={handleBackToHistory} style={styles.backButton}>
                ←
              </button>
              <div>
                <h1 style={styles.title}>Rekomendasi Balita</h1>
                <p style={styles.subtitle}>Daftar rekomendasi berdasarkan riwayat tumbuh kembang</p>
              </div>
            </div>

            <div style={styles.headerRight}>
              <button type="button" style={styles.notificationButton}>
                🔔
              </button>
              <button type="button" onClick={() => navigate('/profil')} style={styles.userBadge}>
                👤 {user?.nama || 'User'}
              </button>
            </div>
          </header>

          <section style={styles.content}>
            <section style={styles.profileCard}>
              <div style={styles.photoBox}>
                {balita?.foto ? (
                  <img src={balita.foto} alt={balita.nama} style={styles.photo} />
                ) : (
                  <div style={styles.avatarFallback}>{getAvatar(balita?.jenis_kelamin)}</div>
                )}
              </div>

              <div style={styles.childInfo}>
                <h2 style={styles.childName}>{balita?.nama || '-'}</h2>

                <div style={styles.childMeta}>
                  <span
                    style={{
                      ...styles.genderText,
                      color: balita?.jenis_kelamin === 'P' ? '#D364F7' : '#2F88F0',
                    }}
                  >
                    {balita?.jenis_kelamin === 'P' ? '♀' : '♂'}{' '}
                    {formatJenisKelamin(balita?.jenis_kelamin)}
                  </span>

                  <span style={styles.ageText}>{formatUsia(balita?.usia_bulan)}</span>
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoRow}>
                    <span>📅</span>
                    <span>Tanggal Lahir</span>
                    <strong>{formatTanggal(balita?.tanggal_lahir)}</strong>
                  </div>

                  <div style={styles.infoRow}>
                    <span>🆔</span>
                    <span>ID Anak</span>
                    <strong>{balita?.nik || balita?.id || '-'}</strong>
                  </div>

                  <div style={styles.infoRow}>
                    <span>👩</span>
                    <span>Nama Ibu</span>
                    <strong>{balita?.nama_ibu || '-'}</strong>
                  </div>

                  <div style={styles.infoRow}>
                    <span>🏥</span>
                    <span>Posyandu</span>
                    <strong>{balita?.posyandu || 'Posyandu Ceria'}</strong>
                  </div>

                  <div style={styles.infoRow}>
                    <span>📌</span>
                    <span>Kunjungan Terakhir</span>
                    <strong>{formatTanggal(selectedMeasurement.tanggal_pengukuran)}</strong>
                  </div>
                </div>
              </div>

              <div style={styles.statusCard}>
                <h3 style={styles.statusTitle}>Status Gizi Terakhir</h3>
                <div style={{ ...styles.statusBadge, ...statusGiziBadgeStyle(selectedMeasurement.status_gizi) }}>◎ {labelStatusGizi(selectedMeasurement.status_gizi)}</div>
                <p style={styles.statusDesc}>
                  Berdasarkan pengukuran
                  <br />
                  {formatTanggal(selectedMeasurement.tanggal_pengukuran)}
                </p>
              </div>
            </section>

            <div style={styles.recommendationGrid}>
              <RecommendationSection
                title="Nutrisi"
                icon="🥗"
                iconBg="#BBF7D0"
                items={recommendation.nutrisi}
                onEdit={isEditMode ? handleEditRecommendation : null}
              />

              <RecommendationSection
                title="Aktivitas"
                icon="⏱"
                iconBg="#FEF08A"
                items={recommendation.aktivitas}
                onEdit={isEditMode ? handleEditRecommendation : null}
              />

              <RecommendationSection
                title="Imunisasi"
                icon="💉"
                iconBg="#E9D5FF"
                items={recommendation.imunisasi}
                onEdit={isEditMode ? handleEditRecommendation : null}
              />

              <RecommendationSection
                title="Pantauan"
                icon="📈"
                iconBg="#FECACA"
                items={recommendation.pantauan}
                onEdit={isEditMode ? handleEditRecommendation : null}
              />
            </div>

            <div style={styles.saveRecommendationContainer}>
              <button type="button" onClick={handleSaveRecommendation} style={styles.saveRecommendationButton}>
                ✨ Simpan Rekomendasi
              </button>
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <Sidebar location={location} navigate={navigate} handleLogout={handleLogout} />

      <main style={styles.main}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button
              type="button"
              onClick={() => navigate('/tumbuh-kembang')}
              style={styles.backButton}
            >
              ←
            </button>
            <div>
              <h1 style={styles.title}>Tumbuh Kembang</h1>
              <p style={styles.subtitle}>Riwayat pengukuran dan rekomendasi balita</p>
            </div>
          </div>

          <div style={styles.headerRight}>
            <button type="button" style={styles.notificationButton}>
              🔔
            </button>
            <button type="button" onClick={() => navigate('/profil')} style={styles.userBadge}>
              👤 {user?.nama || 'User'}
            </button>
          </div>
        </header>

        <section style={styles.content}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <h2 style={styles.sectionTitle}>Data Anak</h2>

          <section style={styles.profileCard}>
            {loading ? (
              <div style={styles.loadingBox}>Memuat data anak...</div>
            ) : (
              <>
                <div style={styles.photoBox}>
                  {balita?.foto ? (
                    <img src={balita.foto} alt={balita.nama} style={styles.photo} />
                  ) : (
                    <div style={styles.avatarFallback}>{getAvatar(balita?.jenis_kelamin)}</div>
                  )}
                </div>

                <div style={styles.childInfo}>
                  <h2 style={styles.childName}>{balita?.nama || '-'}</h2>

                  <div style={styles.childMeta}>
                    <span
                      style={{
                        ...styles.genderText,
                        color: balita?.jenis_kelamin === 'P' ? '#D364F7' : '#2F88F0',
                      }}
                    >
                      {balita?.jenis_kelamin === 'P' ? '♀' : '♂'}{' '}
                      {formatJenisKelamin(balita?.jenis_kelamin)}
                    </span>
                    <span style={styles.ageText}>{formatUsia(balita?.usia_bulan)}</span>
                  </div>

                  <div style={styles.infoGrid}>
                    <div style={styles.infoRow}>
                      <span>📅</span>
                      <span>Tanggal Lahir</span>
                      <strong>{formatTanggal(balita?.tanggal_lahir)}</strong>
                    </div>
                    <div style={styles.infoRow}>
                      <span>🆔</span>
                      <span>ID Anak</span>
                      <strong>{balita?.nik || balita?.id || '-'}</strong>
                    </div>
                    <div style={styles.infoRow}>
                      <span>👩</span>
                      <span>Nama Ibu</span>
                      <strong>{balita?.nama_ibu || '-'}</strong>
                    </div>
                    <div style={styles.infoRow}>
                      <span>🏥</span>
                      <span>Posyandu</span>
                      <strong>{balita?.posyandu || 'Posyandu Ceria'}</strong>
                    </div>
                    <div style={styles.infoRow}>
                      <span>📌</span>
                      <span>Kunjungan Terakhir</span>
                      <strong>
                        {formatTanggal(
                          latest?.tanggal_pengukuran ||
                            balita?.kunjungan_terakhir ||
                            balita?.updated_at
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={styles.statusCard}>
                  <h3 style={styles.statusTitle}>Status Gizi Terakhir</h3>
                  <div style={{ ...styles.statusBadge, ...statusGiziBadgeStyle(statusGizi) }}>◎ {labelStatusGizi(statusGizi)}</div>
                  <p style={styles.statusDesc}>
                    Berdasarkan pengukuran
                    <br />
                    {formatTanggal(latest?.tanggal_pengukuran || getToday())}
                  </p>
                  <button type="button" onClick={openFormTambah} style={styles.addButton}>
                    + Catat Tumbuh Kembang
                  </button>
                </div>
              </>
            )}
          </section>

          {showForm && (
            <form onSubmit={handleSubmit} style={styles.formCard}>
              <h2 style={styles.formTitle}>
                {editId ? '✏️ Edit Data Tumbuh Kembang' : 'Catat Tumbuh Kembang Baru'}
              </h2>

              <div style={styles.formGrid}>
                <FormInput
                  label="Tanggal Pengukuran"
                  type="date"
                  value={form.tanggal_pengukuran}
                  onChange={(value) => handleChange('tanggal_pengukuran', value)}
                  required
                />

                <FormInput
                  label="Berat Badan (kg)"
                  type="number"
                  step="0.1"
                  value={form.berat_badan}
                  onChange={(value) => handleChange('berat_badan', value)}
                  placeholder="Contoh: 12.5"
                  required
                />

                <FormInput
                  label="Tinggi Badan (cm)"
                  type="number"
                  step="0.1"
                  value={form.tinggi_badan}
                  onChange={(value) => handleChange('tinggi_badan', value)}
                  placeholder="Contoh: 88"
                  required
                />

                <FormInput
                  label="Lingkar Kepala (cm)"
                  type="number"
                  step="0.1"
                  value={form.lingkar_kepala}
                  onChange={(value) => handleChange('lingkar_kepala', value)}
                  placeholder="Contoh: 47"
                />

                <div style={styles.formGroup}>
                  <label style={styles.label}>Status Gizi</label>
                  <div
                    style={{
                      ...styles.input,
                      display: 'flex',
                      alignItems: 'center',
                      background: '#E8F5E8',
                      color: '#2D6A2D',
                      fontWeight: 700,
                      cursor: 'default',
                    }}
                  >
                    {labelStatusGizi(form.status_gizi)}
                  </div>
                </div>

                <div style={styles.fullColumn}>
                  <label style={styles.label}>Catatan Petugas</label>
                  <textarea
                    value={form.catatan}
                    onChange={(e) => handleChange('catatan', e.target.value)}
                    placeholder="Contoh: Nafsu makan baik, aktif bermain, dll"
                    style={styles.textarea}
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={handleCloseForm} style={styles.cancelButton}>
                  Batal
                </button>
                <button type="submit" disabled={saving} style={styles.saveButton}>
                  {saving ? 'Menyimpan...' : editId ? 'Perbarui Data' : 'Simpan Data'}
                </button>
              </div>
            </form>
          )}

          <section style={styles.chartSection}>
            <h2 style={styles.contentTitle}>Grafik Tumbuh Kembang</h2>

            <div style={styles.chartGrid}>
              <GrowthChart
                title="Berat Badan per Usia (BB/U)"
                label="Berat"
                unit="kg"
                dataKey="berat_badan"
                history={history}
              />
              <GrowthChart
                title="Tinggi Badan per Usia (TB/U)"
                label="Tinggi"
                unit="cm"
                dataKey="tinggi_badan"
                history={history}
              />
              <GrowthChart
                title="Berat Badan per Tinggi Badan (BB/TB)"
                label="Berat"
                unit="kg"
                dataKey="berat_badan"
                history={history}
              />
            </div>

            <div style={styles.infoBoxGrid}>
              <div style={styles.graphInfoBox}>
                <div style={styles.graphInfoIcon}>📋</div>
                <div>
                  <h3 style={styles.infoBoxTitle}>Tentang Grafik Tumbuh Kembang</h3>
                  <p style={styles.infoBoxText}>
                    Grafik ini menunjukkan status pertumbuhan anak berdasarkan standar WHO.
                    Z-Score adalah indikator yang digunakan untuk menilai apakah pertumbuhan anak
                    sesuai, kurang, atau lebih dari standar.
                  </p>
                </div>
              </div>

              <div style={styles.zscoreBox}>
                <h3 style={styles.infoBoxTitle}>Keterangan Z-Score WHO</h3>
                <div style={styles.zscoreItem}>
                  <span style={{ ...styles.zscoreColor, background: '#F36A6A' }} />
                  &lt; -3 SD: Stunting / Sangat Kurang
                </div>
                <div style={styles.zscoreItem}>
                  <span style={{ ...styles.zscoreColor, background: '#FFD37A' }} />
                  -3 SD s/d -2 SD: Risiko
                </div>
                <div style={styles.zscoreItem}>
                  <span style={{ ...styles.zscoreColor, background: '#DDF4D7' }} />
                  -2 SD s/d +2 SD: Normal
                </div>
              </div>
            </div>
          </section>

          <section style={styles.historySection}>
            <h2 style={styles.contentTitle}>Riwayat Pengukuran</h2>

            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Tanggal</th>
                    <th style={styles.th}>Usia</th>
                    <th style={styles.th}>Berat Badan (Kg)</th>
                    <th style={styles.th}>Tinggi Badan (Cm)</th>
                    <th style={styles.th}>BB/U</th>
                    <th style={styles.th}>TB/U</th>
                    <th style={styles.th}>BB/TB</th>
                    <th style={styles.th}>Status Gizi</th>
                    <th style={styles.th}>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={styles.emptyTd}>
                        Belum ada riwayat pengukuran.
                      </td>
                    </tr>
                  ) : (
                    history.map((item) => {
                      const isSelected = selectedMeasurement?.id === item.id

                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleSelectMeasurement(item)}
                          style={{
                            ...styles.clickableRow,
                            background: isSelected ? '#F3E8FF' : 'transparent',
                          }}
                        >
                          <td style={styles.td}>{formatTanggal(item.tanggal_pengukuran)}</td>
                          <td style={styles.td}>{formatUsia(item.usia_bulan || balita?.usia_bulan)}</td>
                          <td style={styles.td}>{item.berat_badan || '-'}</td>
                          <td style={styles.td}>{item.tinggi_badan || '-'}</td>
                          <td style={styles.td}>
                            {item.bb_u ?? 0} ({getZScoreStatus(item.bb_u)})
                          </td>
                          <td style={styles.td}>
                            {item.tb_u ?? 0} ({getZScoreStatus(item.tb_u)})
                          </td>
                          <td style={styles.td}>
                            {item.bb_tb ?? 0} ({getZScoreStatus(item.bb_tb)})
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.tableStatus,
                                background: ['gizi_buruk', 'gizi_kurang', 'Kurang'].includes(item.status_gizi)
                                  ? '#FECACA'
                                  : ['gizi_lebih', 'obesitas', 'Berlebih'].includes(item.status_gizi)
                                  ? '#FED7AA'
                                  : '#C8FDB6',
                                color: ['gizi_buruk', 'gizi_kurang', 'Kurang'].includes(item.status_gizi)
                                  ? '#991B1B'
                                  : ['gizi_lebih', 'obesitas', 'Berlebih'].includes(item.status_gizi)
                                  ? '#92400E'
                                  : '#4E724D',
                              }}
                            >
                              {labelStatusGizi(item.status_gizi)}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.actionButtons}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSelectMeasurement(item)
                                  handleGenerateRecommendation()
                                }}
                                style={styles.recommendButton}
                              >
                                ✨ Generate
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openFormEdit(item)
                                }}
                                style={styles.editButton}
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(item)
                                }}
                                style={styles.deleteButton}
                              >
                                🗑️
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

            {selectedMeasurement && !showRecommendation && (
              <div style={styles.generateBar}>
                <button type="button" onClick={handleGenerateRecommendation} style={styles.generateButton}>
                  ✨ Generate Rekomendasi
                </button>
              </div>
            )}
          </section>
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
    flexShrink: 0,
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
  header: {
    padding: '28px 34px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
    color: '#FFFFFF',
    fontFamily,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    border: 'none',
    background: 'transparent',
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 1,
    cursor: 'pointer',
    padding: 0,
    fontFamily,
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    fontFamily,
  },
  subtitle: {
    margin: '4px 0 0',
    color: '#E7F2E6',
    fontSize: 13,
    fontWeight: 500,
    fontFamily,
  },
  headerRight: {
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
  content: {
    padding: '0 34px 36px',
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
  sectionTitle: {
    margin: '4px 0 10px',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 700,
    fontFamily,
  },
  contentTitle: {
    margin: '0 0 16px',
    color: '#6B5247',
    fontSize: 20,
    fontWeight: 700,
    fontFamily,
  },
  profileCard: {
    minHeight: 215,
    background: '#FFF7F8',
    borderRadius: 16,
    border: '1px solid #E7CFCB',
    padding: '20px 26px',
    display: 'grid',
    gridTemplateColumns: '180px 1fr 300px',
    alignItems: 'center',
    gap: 28,
    boxShadow: '0 12px 28px rgba(30,45,30,0.12)',
    boxSizing: 'border-box',
    marginBottom: 26,
    fontFamily,
  },
  loadingBox: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: '#6B5247',
    fontSize: 15,
    fontWeight: 600,
    fontFamily,
  },
  photoBox: {
    width: 170,
    height: 170,
    borderRadius: '50%',
    background: '#EAF0EF',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    justifySelf: 'center',
    fontFamily,
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: '#EAF0EF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 78,
  },
  childInfo: {
    minWidth: 0,
    fontFamily,
  },
  childName: {
    margin: '0 0 8px',
    color: '#6B5247',
    fontSize: 27,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    fontFamily,
  },
  childMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
    fontFamily,
  },
  genderText: {
    fontSize: 14,
    fontWeight: 700,
    fontFamily,
  },
  ageText: {
    color: '#6B5247',
    fontSize: 14,
    fontWeight: 700,
    fontFamily,
  },
  infoGrid: {
    display: 'grid',
    gap: 8,
    fontFamily,
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '24px 135px 1fr',
    alignItems: 'center',
    gap: 8,
    color: '#6B5247',
    fontSize: 14,
    fontFamily,
  },
  statusCard: {
    background: '#D5EFD2',
    borderRadius: 16,
    padding: '18px 18px',
    minHeight: 155,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontFamily,
  },
  statusTitle: {
    margin: '0 0 13px',
    color: '#4E724D',
    fontSize: 20,
    fontWeight: 700,
    fontFamily,
  },
  statusBadge: {
    borderRadius: 999,
    padding: '9px 24px',
    fontSize: 19,
    fontWeight: 800,
    marginBottom: 13,
    fontFamily,
  },
  statusDesc: {
    margin: '0 0 12px',
    color: '#6B5247',
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.5,
    fontFamily,
  },
  addButton: {
    minHeight: 32,
    border: 'none',
    borderRadius: 8,
    background: '#FFFFFF',
    color: '#4E724D',
    padding: '0 16px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily,
  },
  formCard: {
    background: '#FFF7F8',
    borderRadius: 16,
    border: '1px solid #E7CFCB',
    padding: 22,
    boxShadow: '0 12px 28px rgba(30,45,30,0.12)',
    marginBottom: 26,
    fontFamily,
  },
  formTitle: {
    margin: '0 0 18px',
    color: '#6B5247',
    fontSize: 20,
    fontWeight: 700,
    fontFamily,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '18px 26px',
    fontFamily,
  },
  formGroup: {
    fontFamily,
  },
  fullColumn: {
    gridColumn: '1 / -1',
    fontFamily,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    color: '#6B5247',
    fontSize: 13,
    fontWeight: 700,
    fontFamily,
  },
  input: {
    width: '100%',
    height: 42,
    border: '1px solid #E6C9B6',
    borderRadius: 8,
    background: '#F3DED2',
    color: '#6B5247',
    outline: 'none',
    padding: '0 12px',
    fontSize: 14,
    fontWeight: 500,
    boxSizing: 'border-box',
    fontFamily,
  },
  textarea: {
    width: '100%',
    minHeight: 90,
    border: '1px solid #E6C9B6',
    borderRadius: 8,
    background: '#F3DED2',
    color: '#6B5247',
    outline: 'none',
    padding: 12,
    fontSize: 14,
    fontWeight: 500,
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily,
  },
  formActions: {
    marginTop: 18,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    fontFamily,
  },
  cancelButton: {
    minHeight: 36,
    minWidth: 100,
    border: 'none',
    borderRadius: 999,
    background: '#FFFFFF',
    color: '#6B5247',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily,
  },
  saveButton: {
    minHeight: 36,
    minWidth: 120,
    border: 'none',
    borderRadius: 999,
    background: '#FFFFFF',
    color: '#4E724D',
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily,
  },
  chartSection: {
    background: '#F6F0EF',
    margin: '0 -34px',
    padding: '26px 34px',
    fontFamily,
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 22,
    marginBottom: 22,
    fontFamily,
  },
  chartCard: {
    background: '#FFF7F8',
    border: '1px solid #E7CFCB',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 8px 18px rgba(30,45,30,0.08)',
    fontFamily,
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    fontFamily,
  },
  chartTitle: {
    margin: 0,
    color: '#6B5247',
    fontSize: 14,
    fontWeight: 800,
    fontFamily,
  },
  smallInfo: {
    color: '#91A49A',
    fontSize: 13,
    fontFamily,
  },
  chartStatus: {
    display: 'inline-flex',
    marginTop: 8,
    background: '#C8FDB6',
    color: '#4E724D',
    borderRadius: 999,
    padding: '4px 16px',
    fontSize: 12,
    fontWeight: 800,
    fontFamily,
  },
  chartSvg: {
    width: '100%',
    height: 190,
    display: 'block',
    marginTop: 10,
  },
  chartLegend: {
    color: '#4E724D',
    fontSize: 11,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily,
  },
  legendLine: {
    width: 20,
    height: 2,
    background: '#4DBA7A',
    display: 'inline-block',
  },
  infoBoxGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 22,
    fontFamily,
  },
  graphInfoBox: {
    display: 'flex',
    gap: 16,
    color: '#6B5247',
    fontFamily,
  },
  graphInfoIcon: {
    fontSize: 48,
    color: '#6B5247',
    flexShrink: 0,
  },
  zscoreBox: {
    color: '#6B5247',
    fontFamily,
  },
  infoBoxTitle: {
    margin: '0 0 6px',
    color: '#6B5247',
    fontSize: 15,
    fontWeight: 800,
    fontFamily,
  },
  infoBoxText: {
    margin: 0,
    color: '#6B5247',
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 500,
    fontFamily,
  },
  zscoreItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 7,
    color: '#6B5247',
    fontSize: 13,
    fontWeight: 600,
    fontFamily,
  },
  zscoreColor: {
    width: 18,
    height: 12,
    borderRadius: 3,
    display: 'inline-block',
  },
  historySection: {
    background: '#F6F0EF',
    margin: '0 -34px',
    padding: '4px 34px 36px',
    fontFamily,
  },
  tableCard: {
    background: '#FFF7F8',
    border: '1px solid #E7CFCB',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 8px 18px rgba(30,45,30,0.08)',
    overflowX: 'auto',
    fontFamily,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    fontFamily,
  },
  th: {
    textAlign: 'center',
    color: '#6B5247',
    fontSize: 13,
    fontWeight: 800,
    padding: '12px 8px',
    borderBottom: '1px solid #E7CFCB',
    fontFamily,
  },
  td: {
    textAlign: 'center',
    color: '#6B5247',
    fontSize: 13,
    fontWeight: 500,
    padding: '11px 8px',
    borderBottom: '1px solid #F0DCDC',
    fontFamily,
  },
  emptyTd: {
    textAlign: 'center',
    color: '#6B5247',
    fontSize: 14,
    fontWeight: 600,
    padding: 24,
    fontFamily,
  },
  clickableRow: {
    cursor: 'pointer',
  },
  tableStatus: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 24,
    padding: '0 14px',
    borderRadius: 999,
    background: '#C8FDB6',
    color: '#4E724D',
    fontSize: 12,
    fontWeight: 800,
    fontFamily,
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  recommendButton: {
    border: 'none',
    background: '#E9D5FF',
    color: '#7C3AED',
    borderRadius: 8,
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
  },
  editButton: {
    border: 'none',
    background: '#EAF4EA',
    borderRadius: 6,
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1,
  },
  deleteButton: {
    border: 'none',
    background: '#FEE2E2',
    borderRadius: 6,
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1,
  },
  generateBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  generateButton: {
    border: 'none',
    background: '#E9D5FF',
    color: '#7C3AED',
    borderRadius: 16,
    padding: '14px 22px',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 800,
    boxShadow: '0 8px 18px rgba(124,58,237,0.18)',
  },

  recommendationGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 14,
    marginBottom: 20,
  },
  recommendationItem: {
    display: 'grid',
    gridTemplateColumns: '72px 1fr',
    gap: 18,
    alignItems: 'flex-start',
    background: '#FFFFFF',
    border: '1px solid #E7CFCB',
    borderRadius: 18,
    padding: 18,
    boxShadow: '0 6px 16px rgba(30,45,30,0.06)',
  },
  recommendationIconWrap: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  recommendationIcon: {
    width: 54,
    height: 54,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    flexShrink: 0,
  },
  recommendationContent: {
    minWidth: 0,
  },
  recommendationItemTitle: {
    margin: '0 0 8px',
    color: '#6B5247',
    fontSize: 18,
    fontWeight: 800,
    fontFamily,
  },
  recommendationList: {
    margin: 0,
    paddingLeft: 18,
    color: '#6B5247',
    fontSize: 14,
    lineHeight: 1.65,
    fontWeight: 500,
    fontFamily,
  },
  recommendationListItem: {
    marginBottom: 4,
  },
  saveRecommendationContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 30,
  },
  saveRecommendationButton: {
    border: 'none',
    background: '#E9D5FF',
    color: '#9333EA',
    borderRadius: 16,
    padding: '16px 28px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(147,51,234,0.25)',
  },

  recommendationHeader: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},

recommendationEditButton: {
  border: 'none',
  background: '#F3E8FF',
  color: '#7C3AED',
  width: 34,
  height: 34,
  borderRadius: 10,
  cursor: 'pointer',
  fontSize: 16,
},
}