import { Link, useLocation, useNavigate } from 'react-router-dom'

const sidebarSections = [
  {
    title: null,
    items: [
      { icon: '🏠', label: 'Beranda', to: '/dashboard', activePaths: ['/dashboard'] },
    ],
  },
  {
    title: 'DATA BALITA',
    items: [
      { icon: '👶', label: 'Daftar Balita', to: '/daftar-balita', activePaths: ['/daftar-balita'] },
      { icon: '➕', label: 'Tambah Balita', to: '/tambah-balita', activePaths: ['/tambah-balita'] },
    ],
  },
  {
    title: 'KUNJUNGAN',
    items: [
      { icon: '📅', label: 'Jadwal Posyandu', to: '/jadwal', activePaths: ['/jadwal'] },
      { icon: '📋', label: 'Riwayat Kunjungan', to: '/riwayatkunjungan', activePaths: ['/riwayatkunjungan', '/riwayat-kunjungan', '/pilih-anak-kunjungan'] },
      { icon: '➕', label: 'Catat Kunjungan Baru', to: '/catatkunjungan', activePaths: ['/catatkunjungan'] },
    ],
  },
  {
    title: 'TUMBUH KEMBANG',
    items: [
      { icon: '📈', label: 'Riwayat Pertumbuhan', to: '/tumbuh-kembang', activePaths: ['/tumbuh-kembang'] },
      { icon: '📝', label: 'Penanganan & Rekomendasi', to: '/penanganan-rekomendasi', activePaths: ['/penanganan-rekomendasi', '/catat-penanganan'] },
      { icon: '🤖', label: 'Rekomendasi Balita (AI)', to: '/rekomendasi-balita', activePaths: ['/rekomendasi-balita'] },
    ],
  },
  {
    title: 'IMUNISASI',
    items: [
      { icon: '💉', label: 'Riwayat Imunisasi', to: '/imunisasi', activePaths: ['/imunisasi'] },
    ],
  },
  {
    title: 'LAPORAN & MONITORING',
    items: [
      { icon: '📊', label: 'Monitoring Status Balita', to: '/monitoring-status-balita', activePaths: ['/monitoring-status-balita'] },
      { icon: '📊', label: 'Laporan Penimbangan', to: '/rekap-penimbangan', activePaths: ['/rekap-penimbangan'] },
      { icon: '📄', label: 'Laporan Puskesmas', to: '/laporan-puskesmas/daftar', activePaths: ['/laporan-puskesmas'] },
    ],
  },
]

export default function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (menu) => {
    return menu.activePaths?.some((path) => location.pathname.startsWith(path))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <aside className="app-sidebar">
      <div>
        <button type="button" className="app-sidebar-brand" onClick={() => navigate('/dashboard')}>
          PosyanduCeria
        </button>

        <p className="app-sidebar-subtitle">
          Bersama posyandu, wujudkan generasi sehat dan cerdas sejak dini
        </p>

        <nav className="app-sidebar-nav">
          {sidebarSections.map((section, sectionIndex) => (
            <div key={section.title || `main-${sectionIndex}`} className="app-sidebar-section">
              {section.title ? <p className="app-sidebar-section-title">{section.title}</p> : null}

              {section.items.map((menu) => (
                <Link
                  key={menu.label}
                  to={menu.to}
                  className={`app-sidebar-link ${isActive(menu) ? 'active' : ''}`}
                >
                  <span className="app-sidebar-icon">{menu.icon}</span>
                  <span>{menu.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="app-sidebar-bottom">
        <Link to="/profil" className={`app-sidebar-link ${location.pathname.startsWith('/profil') ? 'active' : ''}`}>
          <span className="app-sidebar-icon">👤</span>
          <span>Profil</span>
        </Link>

        <button type="button" className="app-sidebar-link app-sidebar-logout" onClick={handleLogout}>
          <span className="app-sidebar-icon">🚪</span>
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
