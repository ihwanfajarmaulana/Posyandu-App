import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import API from '../api'
import { GreenHeaderDecorations } from './Decorations'

const colors = {
  green: '#4E724C',
  greenDark: '#3F633E',
  sidebar: '#E9EFEF',
  active: '#CFEBD2',
  cream: '#FFF5F8',
  brown: '#655040',
  tan: '#F2DFD1',
  white: '#FFFFFF',
  logoutRed: '#E63946',
}

const menuItems = [
  { icon: 'home', label: 'Beranda', to: '/dashboard' },
  { icon: 'calendar', label: 'Agenda Posyandu', to: '/jadwal' },
  { icon: 'bell', label: 'Notifikasi', to: '/notifikasi' },
  { icon: 'chat', label: 'Chat & Konsultasi', to: '/chat' },
  { icon: 'bookmark', label: 'Rekomendasi', to: '/rekomendasi' },
]

export function Icon({ name, size = 22, color = colors.green, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10.5V20h5v-5h4v5h5v-9.5" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h17" />
          <path d="m7 14 3-3 3 2 5-6" />
        </svg>
      )
    case 'syringe':
      return (
        <svg {...common}>
          <path d="m18 2 4 4" />
          <path d="m17 7 2-2" />
          <path d="M6 18 18 6" />
          <path d="m8 8 8 8" />
          <path d="m5 19-3 3" />
          <path d="M9 15 5 11" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <path d="M7 3v3" />
          <path d="M17 3v3" />
          <path d="M4 8h16" />
          <rect x="4" y="5" width="16" height="16" rx="2" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.6-4 14.4-4 16 0" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
        </svg>
      )
    case 'bell':
      return (
        <svg {...common}>
          <path d="M6 9a6 6 0 1 1 12 0c0 7 2 6 2 8H4c0-2 2-1 2-8" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      )
    case 'chat':
      return (
        <svg {...common}>
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
        </svg>
      )
    case 'bookmark':
      return (
        <svg {...common}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      )
    case 'arrow-right':
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      )
    case 'arrow-left':
      return (
        <svg {...common}>
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      )
    default:
      return null
  }
}

function isActiveMenuItem(activePath, itemPath) {
  if (activePath === itemPath) return true
  if (itemPath !== '/' && activePath.startsWith(itemPath + '/')) return true
  return false
}

/* ──────────────────────────────────────────────────────────────────────────
   BackButton — reusable chip-style button that takes the user back to /home.
   Designed to sit on top of the green header bands. Glassy/translucent look.
   ────────────────────────────────────────────────────────────────────────── */
export function BackButton({ to = '/home', label = 'Beranda' }) {
  return (
    <Link
      to={to}
      aria-label="Kembali ke beranda"
      className="pc-btn pc-focusable"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(255, 255, 255, 0.18)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.35)',
        borderRadius: 30,
        padding: '8px 16px 8px 12px',
        color: colors.white,
        textDecoration: 'none',
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "'Noto Sans', sans-serif",
        whiteSpace: 'nowrap',
      }}
    >
      <Icon name="arrow-left" size={16} color={colors.white} strokeWidth={2.4} />
      <span>{label}</span>
    </Link>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   ProfilePopup — slide-in drawer from the right showing user info + children.
   Open it by setting open=true. Closes via the X button or backdrop click.
   ────────────────────────────────────────────────────────────────────────── */

function calcUsia(tanggalLahir) {
  if (!tanggalLahir) return '-'
  const lahir = new Date(tanggalLahir)
  const sekarang = new Date()
  const bulan = (sekarang.getFullYear() - lahir.getFullYear()) * 12
    + (sekarang.getMonth() - lahir.getMonth())
  if (bulan < 12) return bulan + ' Bulan'
  const tahun = Math.floor(bulan / 12)
  const sisa = bulan % 12
  return sisa === 0 ? tahun + ' Tahun' : tahun + ' Tahun ' + sisa + ' Bulan'
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '5px 0',
      fontSize: 11.5,
      gap: 10,
    }}>
      <span style={{ color: '#876D5D', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{
        color: '#3F633E', fontWeight: 700, textAlign: 'right',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {value}
      </span>
    </div>
  )
}

function InfoCard({ title, iconName, onEdit, children }) {
  return (
    <div style={{
      margin: '0 18px 12px',
      padding: 14,
      background: '#FFFFFF',
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottom: '1px solid #F0E6DC',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12.5, fontWeight: 800, color: '#3F633E',
        }}>
          <Icon name={iconName} size={14} color="#4E724C" strokeWidth={2.2} />
          {title}
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="pc-btn pc-focusable"
            style={{
              background: 'none', border: 'none',
              color: '#876D5D', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif",
              padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z"/>
            </svg>
            Ubah
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function ChildRow({ child }) {
  const usia = calcUsia(child.tanggal_lahir)
  const isLakiLaki = child.jenis_kelamin === 'L'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 0',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'linear-gradient(135deg, #F8E8DA 0%, #F2DFD1 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon name="user" size={18} color="#876D5D" strokeWidth={2.2} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 12, color: '#3F633E' }}>
          {child.nama || 'Anak'}
        </div>
        <div style={{
          fontSize: 10.5, marginTop: 2,
          color: isLakiLaki ? '#3B82F6' : '#EC4899', fontWeight: 700,
        }}>
          {isLakiLaki ? '♂ Laki-laki' : '♀ Perempuan'}
        </div>
        <div style={{ fontSize: 10.5, color: '#876D5D', marginTop: 1 }}>
          {usia}
        </div>
      </div>
    </div>
  )
}

export function ProfilePopup({ open, onClose }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))
  const [children, setChildren] = useState([])

  // Re-fetch every time the popup opens so info is always fresh
  useEffect(() => {
    if (!open) return

    API.get('/auth/me')
      .then((res) => {
        const data = res.data?.data || {}
        setUser(data)
        // Refresh localStorage cache too
        localStorage.setItem('user', JSON.stringify({
          id: data.id, nama: data.nama, email: data.email, role: data.role,
        }))
      })
      .catch(() => {})

    API.get('/balita')
      .then((res) => setChildren(res.data?.data || []))
      .catch(() => setChildren([]))
  }, [open])

  function handleLogout() {
    const ok = window.confirm('Anda yakin ingin keluar?')
    if (!ok) return
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  function goAndClose(path) {
    onClose()
    navigate(path)
  }

  const childNames = children.map(c => c.nama).filter(Boolean).join(', ')

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0,
          background: open ? 'rgba(0,0,0,0.32)' : 'rgba(0,0,0,0)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'background 0.3s ease',
          zIndex: 9998,
        }}
      />

      {/* Drawer */}
      <aside
        aria-hidden={!open}
        style={{
          position: 'fixed', top: 0, right: 0,
          width: 'min(360px, 92vw)', height: '100vh',
          // Light cream gradient — warm, soft, easier on the eye than the pink
          background: 'linear-gradient(180deg, #FFF8E8 0%, #F8E8DA 100%)',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.18)',
          transform: open ? 'translateX(0)' : 'translateX(105%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          fontFamily: "'Noto Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#3F633E' }}>
            Profil Saya
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="pc-btn pc-focusable"
            style={{
              background: 'transparent', border: 'none',
              fontSize: 22, lineHeight: 1, cursor: 'pointer',
              color: '#876D5D', padding: 0,
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6,
            }}
          >
            ×
          </button>
        </div>

        {/* Identity card */}
        <div style={{
          margin: '0 18px 14px',
          padding: 14,
          background: '#FFFFFF',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'linear-gradient(135deg, #DEEED8 0%, #CFEBD2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon name="user" size={26} color="#4E724C" strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#3F633E' }}>
              {user.nama || 'User'}
            </div>
            {childNames && (
              <div style={{ fontSize: 11, color: '#876D5D', marginTop: 2, lineHeight: 1.4 }}>
                Orang tua dari {childNames}
              </div>
            )}
          </div>
        </div>

        {/* Informasi Pribadi */}
        <InfoCard
          title="Informasi Pribadi"
          iconName="user"
          onEdit={() => goAndClose('/profil')}
        >
          <InfoRow label="Nama Lengkap" value={user.nama || '-'} />
          <InfoRow label="No. Telepon" value={user.no_telepon || '-'} />
          <InfoRow label="Email" value={user.email || '-'} />
          <InfoRow label="Alamat" value={user.alamat || '-'} />
        </InfoCard>

        {/* Informasi Anak */}
        <InfoCard
          title="Informasi Anak"
          iconName="user"
          onEdit={() => goAndClose('/tumbuh-kembang')}
        >
          {children.length === 0 ? (
            <div style={{ fontSize: 12, color: '#876D5D', padding: '6px 0', fontStyle: 'italic' }}>
              Belum ada data anak terdaftar.
            </div>
          ) : (
            children.map(child => <ChildRow key={child.id} child={child} />)
          )}
        </InfoCard>

        {/* Keamanan Akun */}
        <InfoCard
          title="Keamanan Akun"
          iconName="settings"
          onEdit={() => goAndClose('/profil')}
        >
          <InfoRow label="Password" value="••••••••" />
        </InfoCard>

        {/* Spacer pushes the logout button to the bottom */}
        <div style={{ flex: 1 }} />

        {/* Logout button */}
        <div style={{ padding: '12px 18px 20px' }}>
          <button
            onClick={handleLogout}
            className="pc-btn pc-focusable"
            style={{
              width: '100%', padding: '11px 16px',
              background: '#FFFFFF', color: '#E63946',
              border: '2px solid #E63946', borderRadius: 10,
              fontWeight: 800, fontSize: 13,
              fontFamily: "'Noto Sans', sans-serif",
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Icon name="logout" size={16} color="#E63946" strokeWidth={2.4} />
            Keluar Akun
          </button>
        </div>
      </aside>
    </>
  )
}

export function SharedSidebar({ activePath }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = activePath || location.pathname

  // Functional logout: wipe the session and bounce to /login
  function handleLogout() {
    const ok = window.confirm('Anda yakin ingin keluar?')
    if (!ok) return
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <aside style={sidebarStyles.aside}>
      {/* Top: brand + single tagline */}
      <div style={{ padding: '0 20px' }}>
        <div style={sidebarStyles.brand}>PosyanduCeria</div>
        <p style={sidebarStyles.subtagline}>
          Bersama posyandu, wujudkan generasi sehat dan cerdas sejak dini
        </p>
      </div>

      {/* Middle: main menu — flex:1 pushes the footer down */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }} aria-label="Menu utama">
        {menuItems.map((item) => {
          const isActive = isActiveMenuItem(currentPath, item.to)
          return (
            <Link
              key={item.label}
              to={item.to}
              style={{
                ...sidebarStyles.menuItem,
                fontWeight: isActive ? 700 : 600,
                background: isActive ? colors.active : 'transparent',
              }}
            >
              <Icon name={item.icon} size={20} color={colors.green} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Pengaturan + Keluar */}
      <div style={sidebarStyles.footer}>
        <Link
          to="/pengaturan"
          style={{
            ...sidebarStyles.menuItem,
            fontWeight: currentPath === '/pengaturan' ? 700 : 600,
            background: currentPath === '/pengaturan' ? colors.active : 'transparent',
          }}
        >
          <Icon name="settings" size={20} color={colors.green} strokeWidth={1.8} />
          <span>Pengaturan</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          style={sidebarStyles.logoutBtn}
          aria-label="Keluar dari akun"
        >
          <Icon name="logout" size={20} color={colors.logoutRed} strokeWidth={1.8} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}

const sidebarStyles = {
  aside: {
    width: 'clamp(190px, 21vw, 260px)',
    minHeight: '100vh',
    background: colors.sidebar,
    padding: 'clamp(20px, 2.8vw, 28px) 0',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  brand: {
    color: colors.green,
    fontSize: 'clamp(20px, 2.2vw, 28px)',
    fontWeight: 800,
    lineHeight: '1.1',
    marginBottom: 14,
  },
  subtagline: {
    color: colors.green,
    fontSize: 'clamp(11px, 1.0vw, 13px)',
    fontWeight: 500,
    lineHeight: '1.35',
    margin: '0 0 28px',
    maxWidth: 200,
    opacity: 0.9,
  },
  menuItem: {
    minHeight: 38,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 14px 0 22px',
    marginRight: 14,
    color: colors.green,
    textDecoration: 'none',
    fontSize: 'clamp(13px, 1.05vw, 15px)',
    borderRadius: '0 12px 12px 0',
    boxSizing: 'border-box',
  },
  footer: {
    display: 'grid',
    gap: 4,
    paddingTop: 12,
    borderTop: '1px solid rgba(78,114,76,0.12)',
    marginTop: 'auto',
  },
  logoutBtn: {
    minHeight: 38,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 14px 0 22px',
    marginRight: 14,
    color: colors.logoutRed,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'clamp(13px, 1.05vw, 15px)',
    fontWeight: 700,
    borderRadius: '0 12px 12px 0',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
}

export default function SidebarLayout({ title, subtitle, activePath, actions, children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [showProfile, setShowProfile] = useState(false)

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      fontFamily: "'Noto Sans', sans-serif",
      display: 'flex',
      background: colors.cream,
    }}>
      <SharedSidebar activePath={activePath} />
      <main style={{ flex: 1, minWidth: 0 }}>
        <header style={{
          background: 'linear-gradient(135deg, #5C8259 0%, #4E724C 50%, #3F633E 100%)',
          padding: '24px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
          boxShadow: '0 4px 18px rgba(63, 99, 62, 0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <GreenHeaderDecorations />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 26, color: colors.cream }}>{title}</div>
            {subtitle && (
              <div style={{ color: colors.cream, opacity: 0.9, fontSize: 13, marginTop: 6, maxWidth: 520 }}>
                {subtitle}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
            {actions}
            <button
              onClick={() => setShowProfile(true)}
              type="button"
              className="pc-btn pc-focusable"
              style={{
                background: colors.tan,
                borderRadius: 30,
                padding: '4px 16px 4px 4px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: colors.brown, color: colors.white,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
              }}>
                {user.nama?.slice(0, 1).toUpperCase() || 'U'}
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: colors.brown }}>
                {user.nama || 'User'}
              </span>
            </button>
          </div>
        </header>
        <section className="pc-fade-in" style={{ background: colors.cream, padding: '30px' }}>
          {children}
        </section>
      </main>

      {/* Slide-in profile drawer */}
      <ProfilePopup open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}