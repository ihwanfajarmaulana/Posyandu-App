import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SidebarLayout from '../components/SidebarLayout'
import { CreamSectionDecorations } from '../components/Decorations'

const defaultSettings = {
  browserNotification: false,
  compactMode: false,
  language: 'id',
}

export default function Pengaturan() {
  const [settings, setSettings] = useState(() => {
    try {
      return {
        ...defaultSettings,
        ...JSON.parse(localStorage.getItem('posyandu_settings') || '{}'),
      }
    } catch {
      return defaultSettings
    }
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    localStorage.setItem('posyandu_settings', JSON.stringify(settings))
  }, [settings])

  const updateSetting = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }))
    setMessage('Pengaturan tersimpan di browser.')
  }

  const handleNotificationRequest = async () => {
    if (!('Notification' in window)) {
      setMessage('Browser ini belum mendukung notifikasi.')
      return
    }

    const permission = await Notification.requestPermission()
    updateSetting('browserNotification', permission === 'granted')
    setMessage(permission === 'granted'
      ? 'Notifikasi browser berhasil diaktifkan.'
      : 'Notifikasi browser tidak diaktifkan.')
  }

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: 15,
    padding: 22,
    boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
  }

  const labelStyle = {
    fontWeight: 800,
    color: '#655040',
    fontSize: 16,
    marginBottom: 6,
  }

  const helperStyle = {
    color: '#93735C',
    fontSize: 13,
    lineHeight: '20px',
    marginBottom: 16,
  }

  return (
    <SidebarLayout
      title="Pengaturan"
      subtitle="Atur preferensi sederhana untuk pengalaman memakai aplikasi PosyanduCeria."
      activePath="/pengaturan"
    >
      {/* Aesthetic floating decorations behind the content */}
      <div style={{ position: 'relative' }}>
      <CreamSectionDecorations />
      <div style={{ position: 'relative', zIndex: 1 }}>
      {message && (
        <div style={{
          background: '#E9EFEF',
          color: '#4E724C',
          padding: '12px 16px',
          borderRadius: 10,
          marginBottom: 20,
          fontWeight: 800,
          fontSize: 14,
        }}>
          {message}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 18,
      }}>
        <section style={cardStyle} className="pc-slide-up pc-delay-1 pc-hover-lift">
          <div style={labelStyle}>Notifikasi</div>
          <div style={helperStyle}>
            Aktifkan pengingat browser untuk membantu mengingat jadwal Posyandu.
          </div>
          <button
            onClick={handleNotificationRequest}
            className="pc-btn pc-focusable"
            style={{
              background: settings.browserNotification
                ? 'linear-gradient(135deg, #DEEED8 0%, #CFEBD2 100%)'
                : 'linear-gradient(135deg, #5C8259 0%, #4E724C 100%)',
              color: settings.browserNotification ? '#4E724C' : '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '11px 18px',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: "'Noto Sans', sans-serif",
              boxShadow: '0 3px 10px rgba(78, 114, 76, 0.25)',
            }}
          >
            {settings.browserNotification ? 'Notifikasi Aktif' : 'Aktifkan Notifikasi'}
          </button>
        </section>

        <section style={cardStyle} className="pc-slide-up pc-delay-2 pc-hover-lift">
          <div style={labelStyle}>Tampilan</div>
          <div style={helperStyle}>
            Mode ringkas menyimpan preferensi lokal. Struktur ini siap dikembangkan untuk dashboard yang lebih padat.
          </div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#655040',
            fontWeight: 800,
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={settings.compactMode}
              onChange={(e) => updateSetting('compactMode', e.target.checked)}
              className="pc-focusable"
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            Mode ringkas
          </label>
        </section>

        <section style={cardStyle} className="pc-slide-up pc-delay-3 pc-hover-lift">
          <div style={labelStyle}>Bahasa</div>
          <div style={helperStyle}>
            Saat ini UI memakai Bahasa Indonesia. Pilihan ini disiapkan jika nanti ingin menambah bahasa lain.
          </div>
          <select
            value={settings.language}
            onChange={(e) => updateSetting('language', e.target.value)}
            className="pc-input"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid #E0D4CC',
              color: '#655040',
              background: '#FFF5F8',
              fontWeight: 700,
              fontFamily: "'Noto Sans', sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English - belum diterapkan</option>
          </select>
        </section>

        <section style={cardStyle} className="pc-slide-up pc-delay-4 pc-hover-lift">
          <div style={labelStyle}>Akun</div>
          <div style={helperStyle}>
            Ubah nama, nomor telepon, alamat, dan password melalui halaman profil.
          </div>
          <Link
            to="/profil"
            className="pc-btn"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #5C8259 0%, #4E724C 100%)',
              color: '#FFFFFF',
              borderRadius: 10,
              padding: '11px 18px',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: 14,
              boxShadow: '0 3px 10px rgba(78, 114, 76, 0.3)',
            }}
          >
            Buka Profil
          </Link>
        </section>
      </div>
      </div>{/* end zIndex:1 wrapper */}
      </div>{/* end relative wrapper around decorations */}
    </SidebarLayout>
  )
}
