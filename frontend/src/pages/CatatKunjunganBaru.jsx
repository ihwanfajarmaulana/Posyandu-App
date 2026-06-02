import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import API from '../api'

const fontFamily = '"Segoe UI", Arial, Helvetica, sans-serif'

const menuItems = [
  {
    icon: '🏠',
    label: 'Beranda',
    to: '/dashboard',
    activePaths: ['/dashboard'],
  },
  {
    icon: '📈',
    label: 'Tumbuh Kembang',
    to: '/tumbuh-kembang',
    activePaths: ['/tumbuh-kembang', '/tumbuhkembang'],
  },
  {
    icon: '💉',
    label: 'Imunisasi',
    to: '/imunisasi',
    activePaths: ['/imunisasi'],
  },
  {
    icon: '📅',
    label: 'Jadwal Posyandu',
    to: '/jadwal',
    activePaths: ['/jadwal'],
  },
  {
    icon: '🏥',
    label: 'Kunjungan',
    activePaths: ['/riwayatkunjungan', '/catatkunjungan'],
    children: [
      {
        icon: '📋',
        label: 'Riwayat Kunjungan',
        to: '/riwayatkunjungan',
        activePaths: ['/riwayatkunjungan'],
      },
      {
        icon: '➕',
        label: 'Catat Kunjungan Baru',
        to: '/catatkunjungan',
        activePaths: ['/catatkunjungan'],
      },
    ],
  },
  {
    icon: '📝',
    label: 'Penanganan & Rekomendasi',
    to: '/penanganan-rekomendasi',
    activePaths: ['/penanganan-rekomendasi', '/rekomendasi-balita'],
  },
  {
    icon: '👶',
    label: 'Daftar Balita',
    to: '/daftar-balita',
    activePaths: ['/daftar-balita'],
  },
  {
    icon: '➕',
    label: 'Tambah Balita',
    to: '/tambah-balita',
    activePaths: ['/tambah-balita'],
  },
  {
    icon: '📋',
    label: 'Laporan Penimbangan',
    to: '/rekap-penimbangan',
    activePaths: ['/rekap-penimbangan'],
  },
  {
    icon: '👤',
    label: 'Profil',
    to: '/profil',
    activePaths: ['/profil'],
  },
  {
    icon: '⚙️',
    label: 'Pengaturan',
    to: '/pengaturan',
    activePaths: ['/pengaturan'],
  },
]

const konsultasiOptions = [
  'Gizi & pola makan',
  'Tumbuh kembang',
  'Perilaku anak',
  'MPASI',
  'Pola tidur anak',
  'Keterlambatan bicara',
  'Berat badan sulit naik',
  'Imunisasi',
  'Obesitas',
  'Anak susah makan',
  'Kesehatan umum',
]

const kondisiOptions = [
  'Anak aktif',
  'Tidak demam',
  'Nafsu makan baik',
  'Berat badan sesuai',
  'Suhu tubuh normal',
]

const getToday = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const getCurrentTime = () => {
  const date = new Date()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${hour}:${minute}`
}

const addOneMonth = () => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatUsia = (bulan) => {
  if (bulan === undefined || bulan === null || Number.isNaN(Number(bulan))) {
    return '-'
  }

  const total = Number(bulan)
  const tahun = Math.floor(total / 12)
  const sisaBulan = total % 12

  if (tahun <= 0) return `${sisaBulan} bulan`
  if (sisaBulan === 0) return `${tahun} tahun`

  return `${tahun} tahun ${sisaBulan} bulan`
}

const getJenisKelamin = (value) => {
  if (value === 'L') return 'Laki-laki'
  if (value === 'P') return 'Perempuan'
  return value || '-'
}

const getAvatar = (value) => {
  return value === 'P' ? '👧' : '👦'
}

const initialForm = (userName = '') => ({
  tanggal_kunjungan: getToday(),
  jam_kunjungan: getCurrentTime(),
  petugas: userName,
  jenis_kunjungan: 'Imunisasi',

  berat_badan: '',
  tinggi_badan: '',
  lingkar_kepala: '',
  status_gizi: 'Normal',
  suhu_tubuh: '',

  konsultasi: [],
  kondisi_anak: [],

  jadwal_berikutnya: addOneMonth(),
  tindakan_berikutnya: 'Observasi Lanjut',
  lokasi_posyandu: 'Posyandu Ceria',

  keluhan_utama: '',
  durasi_keluhan: '',
  penanganan_awal: '',
  petugas_bekerja: '',

  catatan: '',
})

function Sidebar({
  location,
  navigate,
  kunjunganOpen,
  setKunjunganOpen,
  handleLogout,
}) {
  const isActiveMenu = (item) => {
    return item.activePaths?.some((path) => location.pathname.startsWith(path))
  }

  const isActiveChild = (child) => {
    return child.activePaths?.some((path) => location.pathname.startsWith(path))
  }

  return (
    <aside style={styles.sidebar}>
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        style={styles.brand}
      >
        PosyanduCeria
      </button>

      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const active = isActiveMenu(item)

          if (item.children) {
            return (
              <div key={item.label} style={styles.dropdownGroup}>
                <button
                  type="button"
                  onClick={() => setKunjunganOpen((prev) => !prev)}
                  style={{
                    ...styles.navButton,
                    ...(active ? styles.navActive : {}),
                  }}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  <span style={styles.navText}>{item.label}</span>
                  <span style={styles.chevron}>
                    {kunjunganOpen ? '▾' : '▸'}
                  </span>
                </button>

                {kunjunganOpen && (
                  <div style={styles.dropdownMenu}>
                    {item.children.map((child) => {
                      const childActive = isActiveChild(child)

                      return (
                        <Link
                          key={child.label}
                          to={child.to}
                          style={{
                            ...styles.dropdownLink,
                            ...(childActive ? styles.dropdownLinkActive : {}),
                          }}
                        >
                          <span style={styles.dropdownIcon}>{child.icon}</span>
                          <span>{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.label}
              to={item.to}
              style={{
                ...styles.navLink,
                ...(active ? styles.navActive : {}),
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <button type="button" onClick={handleLogout} style={styles.logoutBtn}>
        Logout
      </button>
    </aside>
  )
}

function SectionCard({ number, title, style, children }) {
  return (
    <section style={{ ...styles.card, ...style }}>
      <h2 style={styles.cardTitle}>
        <span style={styles.numberBadge}>{number}</span>
        {title}
      </h2>

      {children}
    </section>
  )
}

function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  step,
}) {
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

function FormSelect({ label, value, onChange, children }) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.select}>
        {children}
      </select>
    </div>
  )
}

export default function CatatKunjunganBaru() {
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

  const [balitaList, setBalitaList] = useState([])
  const [selectedBalitaId, setSelectedBalitaId] = useState(id || '')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [form, setForm] = useState(() => initialForm(user.nama || ''))

  const [kunjunganOpen, setKunjunganOpen] = useState(
    location.pathname.startsWith('/riwayatkunjungan') ||
      location.pathname.startsWith('/catatkunjungan')
  )

  useEffect(() => {
    if (
      location.pathname.startsWith('/riwayatkunjungan') ||
      location.pathname.startsWith('/catatkunjungan')
    ) {
      setKunjunganOpen(true)
    }
  }, [location.pathname])

  useEffect(() => {
    if (id) {
      setSelectedBalitaId(id)
    }
  }, [id])

  useEffect(() => {
    let mounted = true

    const loadBalita = async () => {
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

        setBalitaList(list)

        if (!selectedBalitaId && list.length > 0) {
          setSelectedBalitaId(String(list[0].id))
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || 'Gagal memuat data anak.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadBalita()

    return () => {
      mounted = false
    }
  }, [])

  const selectedBalita = balitaList.find(
    (item) => String(item.id) === String(selectedBalitaId)
  )

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const toggleArrayValue = (field, value) => {
    setForm((prev) => {
      const current = prev[field] || []
      const exists = current.includes(value)

      return {
        ...prev,
        [field]: exists
          ? current.filter((item) => item !== value)
          : [...current, value],
      }
    })
  }

  const handleReminderToggle = async () => {
    const nextValue = !reminderEnabled

    if (nextValue && !('Notification' in window)) {
      alert('Browser tidak mendukung notifikasi.')
      return
    }

    if (nextValue && Notification.permission === 'denied') {
      alert('Izin notifikasi diblokir. Aktifkan izin notifikasi dari pengaturan browser.')
      return
    }

    if (nextValue && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()

      if (permission !== 'granted') {
        alert('Izin notifikasi tidak diberikan.')
        return
      }
    }

    setReminderEnabled(nextValue)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedBalitaId) {
      alert('Pilih anak terlebih dahulu.')
      return
    }

    setSaving(true)

    const payload = {
      balita_id: Number(selectedBalitaId),
      tanggal_kunjungan: form.tanggal_kunjungan,
      jam_kunjungan: form.jam_kunjungan,
      petugas: form.petugas,
      jenis_kunjungan: form.jenis_kunjungan,

      berat_badan: form.berat_badan ? Number(form.berat_badan) : null,
      tinggi_badan: form.tinggi_badan ? Number(form.tinggi_badan) : null,
      lingkar_kepala: form.lingkar_kepala ? Number(form.lingkar_kepala) : null,
      status_gizi: form.status_gizi,
      suhu_tubuh: form.suhu_tubuh ? Number(form.suhu_tubuh) : null,

      konsultasi: form.konsultasi,
      kondisi_anak: form.kondisi_anak,

      jadwal_berikutnya: form.jadwal_berikutnya || null,
      tindakan_berikutnya: form.tindakan_berikutnya || null,
      lokasi_posyandu: form.lokasi_posyandu || null,

      keluhan_utama: form.keluhan_utama,
      durasi_keluhan: form.durasi_keluhan,
      penanganan_awal: form.penanganan_awal,
      petugas_bekerja: form.petugas_bekerja,

      catatan: form.catatan,
      pengingat_ortu: reminderEnabled,
    }

    try {
      await API.post('/kunjungan', payload)

      if (reminderEnabled) {
        localStorage.setItem(
          `pengingat_kunjungan_${selectedBalitaId}`,
          JSON.stringify({
            balita_id: Number(selectedBalitaId),
            nama_anak: selectedBalita?.nama || '',
            jadwal_berikutnya: form.jadwal_berikutnya || '',
            tindakan_berikutnya: form.tindakan_berikutnya || '',
            dibuat_pada: new Date().toISOString(),
          })
        )

        if ('Notification' in window) {
          if (Notification.permission === 'default') {
            await Notification.requestPermission()
          }

          if (Notification.permission === 'granted') {
            new Notification('Pengingat kunjungan aktif', {
              body: `${selectedBalita?.nama || 'Anak'} dijadwalkan kunjungan berikutnya pada ${
                form.jadwal_berikutnya || '-'
              }.`,
            })
          }
        }
      } else {
        localStorage.removeItem(`pengingat_kunjungan_${selectedBalitaId}`)
      }

      alert('Data kunjungan berhasil disimpan.')
      navigate(`/riwayatkunjungan/${selectedBalitaId}`)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data kunjungan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.page}>
      <Sidebar
        location={location}
        navigate={navigate}
        kunjunganOpen={kunjunganOpen}
        setKunjunganOpen={setKunjunganOpen}
        handleLogout={handleLogout}
      />

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <button
              type="button"
              onClick={() => navigate('/riwayatkunjungan')}
              style={styles.backBtn}
            >
              ←
            </button>

            <h1 style={styles.title}>Catat Kunjungan Baru</h1>
            <p style={styles.subtitle}>
              Lengkapi data kunjungan {selectedBalita?.nama || 'anak'} hari ini.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/profil')}
            style={styles.userPill}
          >
            👤 {user?.nama || 'User'}
          </button>
        </header>

        <form onSubmit={handleSubmit} style={styles.content}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <section style={styles.childStrip}>
            <div style={styles.childAvatar}>
              {getAvatar(selectedBalita?.jenis_kelamin)}
            </div>

            <div style={styles.childDetail}>
              <h2 style={styles.childName}>
                {loading
                  ? 'Memuat data anak...'
                  : selectedBalita?.nama || 'Pilih anak'}
              </h2>

              <div style={styles.childMetaRow}>
                <span
                  style={{
                    ...styles.genderBadge,
                    color:
                      selectedBalita?.jenis_kelamin === 'P'
                        ? '#D45DFF'
                        : '#3287EF',
                  }}
                >
                  {selectedBalita?.jenis_kelamin === 'P' ? '♀' : '♂'}{' '}
                  {getJenisKelamin(selectedBalita?.jenis_kelamin)}
                </span>

                <span style={styles.childMetaText}>
                  {formatUsia(selectedBalita?.usia_bulan)}
                </span>

                <span style={styles.idBadge}>
                  🆔 {selectedBalita?.nik || selectedBalita?.id || '-'}
                </span>
              </div>
            </div>

            <div style={styles.childSelectWrap}>
              <label style={styles.label}>Pilih Anak</label>
              <select
                value={selectedBalitaId}
                onChange={(e) => setSelectedBalitaId(e.target.value)}
                style={styles.childSelect}
                required
              >
                <option value="">Pilih anak</option>
                {balitaList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section style={styles.formGrid}>
            <SectionCard number="1" title="Informasi Kunjungan" style={styles.infoCard}>
              <div style={styles.gridThree}>
                <FormInput
                  label="Tanggal Kunjungan"
                  type="date"
                  value={form.tanggal_kunjungan}
                  onChange={(value) => handleChange('tanggal_kunjungan', value)}
                  required
                />

                <FormInput
                  label="Jam Kunjungan"
                  type="time"
                  value={form.jam_kunjungan}
                  onChange={(value) => handleChange('jam_kunjungan', value)}
                  required
                />

                <FormInput
                  label="Petugas"
                  value={form.petugas}
                  onChange={(value) => handleChange('petugas', value)}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Jenis Kunjungan</label>

                <div style={styles.visitTypeGrid}>
                  {['Imunisasi', 'Kunjungan Rutin', 'Konsultasi'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleChange('jenis_kunjungan', item)}
                      style={{
                        ...styles.visitTypeBtn,
                        ...(form.jenis_kunjungan === item
                          ? styles.visitTypeActive
                          : {}),
                      }}
                    >
                      {item === 'Imunisasi' && '💉 '}
                      {item === 'Kunjungan Rutin' && '🩺 '}
                      {item === 'Konsultasi' && '👨‍⚕️ '}
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard number="4" title="Catatan Petugas" style={styles.noteCard}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Catatan</label>
                <textarea
                  value={form.catatan}
                  onChange={(e) => handleChange('catatan', e.target.value)}
                  placeholder="Tulis catatan tentang kondisi anak, keluhan, saran, atau tindak lanjut..."
                  rows={5}
                  style={styles.textarea}
                />
              </div>
            </SectionCard>

            <SectionCard number="2" title="Pemeriksaan Fisik" style={styles.physicalCard}>
              <div style={styles.gridThree}>
                <FormInput
                  label="Berat Badan (kg)"
                  type="number"
                  step="0.1"
                  value={form.berat_badan}
                  onChange={(value) => handleChange('berat_badan', value)}
                />

                <FormInput
                  label="Tinggi Badan (cm)"
                  type="number"
                  step="0.1"
                  value={form.tinggi_badan}
                  onChange={(value) => handleChange('tinggi_badan', value)}
                />

                <FormInput
                  label="Lingkar Kepala (cm)"
                  type="number"
                  step="0.1"
                  value={form.lingkar_kepala}
                  onChange={(value) => handleChange('lingkar_kepala', value)}
                />
              </div>

              <div style={styles.physicalGrid}>
                <div style={styles.progressBox}>
                  <p style={styles.progressTitle}>
                    Perubahan dari kunjungan terakhir
                  </p>

                  <p style={styles.progressDate}>14 Apr 2026</p>

                  <div style={styles.progressStats}>
                    <div>
                      <strong style={styles.progressPositive}>+0,3 kg</strong>
                      <span style={styles.progressLabel}>Berat badan</span>
                    </div>

                    <div>
                      <strong style={styles.progressPositive}>+1 cm</strong>
                      <span style={styles.progressLabel}>Tinggi badan</span>
                    </div>
                  </div>
                </div>

                <div style={styles.nutritionBox}>
                  <p style={styles.progressTitle}>Status Gizi (BB/U)</p>

                  <div style={styles.statusBadge}>Normal</div>

                  <p style={styles.nutritionText}>
                    Berat badan anak berada pada rentang normal.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              number="5"
              title="Tindak Lanjut & Pengingat"
              style={styles.followUpCard}
            >
              <FormInput
                label="Jadwal Kunjungan Berikutnya"
                type="date"
                value={form.jadwal_berikutnya}
                onChange={(value) => handleChange('jadwal_berikutnya', value)}
              />

              <p style={styles.helperText}>
                Disarankan 1 bulan dari tanggal kunjungan.
              </p>

              <div style={styles.gridTwo}>
                <FormSelect
                  label="Tindakan Berikutnya"
                  value={form.tindakan_berikutnya}
                  onChange={(value) => handleChange('tindakan_berikutnya', value)}
                >
                  <option value="Observasi Lanjut">Observasi Lanjut</option>
                  <option value="Imunisasi Lanjutan">Imunisasi Lanjutan</option>
                  <option value="Konsultasi Gizi">Konsultasi Gizi</option>
                  <option value="Rujukan">Rujukan</option>
                </FormSelect>

                <FormInput
                  label="Lokasi Posyandu"
                  value={form.lokasi_posyandu}
                  onChange={(value) => handleChange('lokasi_posyandu', value)}
                />
              </div>

              <div style={styles.reminderPanel}>
                <div>
                  <h3 style={styles.reminderTitle}>
                    Aktifkan pengingat untuk orang tua
                  </h3>
                  <p style={styles.reminderDesc}>
                    Orang tua akan mendapat pengingat jadwal kunjungan berikutnya.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReminderToggle}
                  style={{
                    ...styles.switchButton,
                    ...(reminderEnabled ? styles.switchButtonActive : {}),
                  }}
                  aria-label="Aktifkan pengingat untuk orang tua"
                  aria-pressed={reminderEnabled}
                >
                  <span style={styles.switchKnob} />
                </button>
              </div>
            </SectionCard>

            <SectionCard number="3" title="Konsultasi" style={styles.consultationCard}>
              <div style={styles.consultGrid}>
                <div>
                  <label style={styles.label}>Jenis Konsultasi</label>

                  <div style={styles.consultOptions}>
                    {konsultasiOptions.map((item) => (
                      <label key={item} style={styles.checkboxBox}>
                        <input
                          type="checkbox"
                          checked={form.konsultasi.includes(item)}
                          onChange={() => toggleArrayValue('konsultasi', item)}
                        />
                        <span>{item}</span>
                      </label>
                    ))}

                    <div style={styles.otherInputBox}>
                      <span>Lainnya</span>
                      <input
                        type="text"
                        placeholder="Isi di sini"
                        style={styles.smallInput}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div style={styles.gridTwo}>
                    <FormInput
                      label="Keluhan Utama"
                      value={form.keluhan_utama}
                      onChange={(value) => handleChange('keluhan_utama', value)}
                    />

                    <FormInput
                      label="Durasi Keluhan"
                      value={form.durasi_keluhan}
                      onChange={(value) => handleChange('durasi_keluhan', value)}
                    />
                  </div>

                  <div style={styles.gridTwo}>
                    <FormInput
                      label="Penanganan Awal"
                      value={form.penanganan_awal}
                      onChange={(value) => handleChange('penanganan_awal', value)}
                    />

                    <FormInput
                      label="Petugas yang bekerja"
                      value={form.petugas_bekerja}
                      onChange={(value) => handleChange('petugas_bekerja', value)}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Kondisi saat konsultasi</label>

                    <div style={styles.conditionGrid}>
                      {kondisiOptions.map((item) => (
                        <label key={item} style={styles.inlineCheckbox}>
                          <input
                            type="checkbox"
                            checked={form.kondisi_anak.includes(item)}
                            onChange={() => toggleArrayValue('kondisi_anak', item)}
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </section>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate('/riwayatkunjungan')}
              style={styles.cancelBtn}
            >
              Batal
            </button>

            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? 'Menyimpan...' : 'Simpan Kunjungan'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    background: '#4E724C',
    color: '#243424',
    fontFamily,
  },

  sidebar: {
    width: 250,
    minHeight: '100vh',
    background: '#EAF1F0',
    padding: '28px 16px 24px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid rgba(78, 114, 76, 0.1)',
    flexShrink: 0,
    fontFamily,
  },

  brand: {
    border: 'none',
    background: 'transparent',
    color: '#3F6B47',
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: '-0.7px',
    textAlign: 'left',
    padding: '0 4px',
    marginBottom: 32,
    cursor: 'pointer',
    fontFamily,
  },

  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },

  navLink: {
    minHeight: 46,
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    padding: '0 14px',
    borderRadius: 12,
    color: '#365D3D',
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: '-0.2px',
    fontFamily,
  },

  navButton: {
    width: '100%',
    minHeight: 46,
    border: 'none',
    background: 'transparent',
    color: '#365D3D',
    borderRadius: 12,
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: '-0.2px',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily,
  },

  navActive: {
    background: '#CFEFD2',
    color: '#285331',
    fontWeight: 600,
  },

  navIcon: {
    width: 20,
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    flexShrink: 0,
  },

  navText: {
    flex: 1,
  },

  chevron: {
    marginLeft: 'auto',
    color: '#365D3D',
    fontSize: 14,
    fontWeight: 700,
  },

  dropdownGroup: {
    width: '100%',
  },

  dropdownMenu: {
    marginTop: 6,
    marginLeft: 22,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },

  dropdownLink: {
    width: '100%',
    minHeight: 40,
    borderRadius: 10,
    padding: '0 12px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#365D3D',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '-0.2px',
    fontFamily,
  },

  dropdownLinkActive: {
    background: '#CFEFD2',
    color: '#285331',
    fontWeight: 600,
  },

  dropdownIcon: {
    width: 18,
    height: 18,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    flexShrink: 0,
  },

  logoutBtn: {
    width: '100%',
    minHeight: 46,
    border: '1px solid rgba(78, 114, 76, 0.26)',
    background: 'transparent',
    borderRadius: 11,
    color: '#365D3D',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily,
  },

  main: {
    flex: 1,
    minWidth: 0,
    background: '#4E724C',
    fontFamily,
  },

  header: {
    minHeight: 118,
    background: '#4E724C',
    color: '#FFFFFF',
    padding: '24px 34px 20px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    fontFamily,
  },

  backBtn: {
    border: 'none',
    background: 'transparent',
    color: '#FFFFFF',
    fontSize: 23,
    cursor: 'pointer',
    marginBottom: 4,
    padding: 0,
    fontFamily,
  },

  title: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.2,
    fontWeight: 700,
    letterSpacing: '-0.7px',
    fontFamily,
  },

  subtitle: {
    margin: '6px 0 0',
    color: 'rgba(255, 255, 255, 0.86)',
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 400,
    fontFamily,
  },

  userPill: {
    border: 'none',
    background: '#F2DFD1',
    color: '#655040',
    borderRadius: 999,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily,
    whiteSpace: 'nowrap',
  },

  content: {
    padding: '0 34px 40px',
    fontFamily,
  },

  errorBox: {
    background: '#FEE2E2',
    color: '#991B1B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    fontSize: 14,
    fontWeight: 500,
    fontFamily,
  },

  childStrip: {
    background: '#FFF6F7',
    padding: '18px 22px',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    marginBottom: 22,
    border: '1px solid #EACDCD',
    boxShadow: '0 10px 24px rgba(30, 50, 30, 0.12)',
    fontFamily,
  },

  childAvatar: {
    width: 76,
    height: 76,
    background: '#EAF1F0',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 38,
    flexShrink: 0,
  },

  childDetail: {
    flex: 1,
    fontFamily,
  },

  childName: {
    margin: '0 0 6px',
    color: '#655040',
    fontSize: 23,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    fontFamily,
  },

  childMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 5,
    fontFamily,
  },

  genderBadge: {
    fontSize: 13,
    fontWeight: 700,
    fontFamily,
  },

  childMetaText: {
    color: '#655040',
    fontSize: 13,
    fontWeight: 700,
    fontFamily,
  },

  idBadge: {
    color: '#655040',
    fontSize: 13,
    fontWeight: 700,
    fontFamily,
  },

  childSelectWrap: {
    width: 260,
    flexShrink: 0,
    fontFamily,
  },

  childSelect: {
    width: '100%',
    height: 38,
    border: '1px solid #E8CDBD',
    borderRadius: 9,
    background: '#F2DFD1',
    color: '#655040',
    padding: '0 10px',
    fontSize: 13,
    fontWeight: 600,
    outline: 'none',
    fontFamily,
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
    gap: 22,
    alignItems: 'stretch',
    fontFamily,
  },

  card: {
    background: '#FFF6F7',
    border: '1px solid #EACDCD',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 10px 24px rgba(30, 50, 30, 0.12)',
    boxSizing: 'border-box',
    fontFamily,
  },

  infoCard: {
    gridColumn: '1 / span 7',
  },

  noteCard: {
    gridColumn: '8 / span 5',
  },

  physicalCard: {
    gridColumn: '1 / span 7',
  },

  followUpCard: {
    gridColumn: '8 / span 5',
  },

  consultationCard: {
    gridColumn: '1 / -1',
  },

  cardTitle: {
    margin: '0 0 17px',
    color: '#655040',
    fontSize: 19,
    fontWeight: 700,
    letterSpacing: '-0.4px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily,
  },

  numberBadge: {
    width: 23,
    height: 23,
    borderRadius: '50%',
    background: '#4E724C',
    color: '#FFFFFF',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },

  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 13,
    marginBottom: 14,
    fontFamily,
  },

  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 13,
    fontFamily,
  },

  formGroup: {
    marginBottom: 13,
    fontFamily,
  },

  label: {
    display: 'block',
    marginBottom: 7,
    color: '#655040',
    fontSize: 12,
    fontWeight: 700,
    fontFamily,
  },

  input: {
    width: '100%',
    height: 40,
    boxSizing: 'border-box',
    border: '1px solid #E8CDBD',
    borderRadius: 9,
    padding: '0 11px',
    color: '#655040',
    background: '#F2DFD1',
    outline: 'none',
    fontSize: 13,
    fontWeight: 500,
    fontFamily,
  },

  select: {
    width: '100%',
    height: 40,
    boxSizing: 'border-box',
    border: '1px solid #E8CDBD',
    borderRadius: 9,
    padding: '0 11px',
    color: '#655040',
    background: '#F2DFD1',
    outline: 'none',
    fontSize: 13,
    fontWeight: 500,
    fontFamily,
  },

  smallInput: {
    width: '100%',
    height: 30,
    boxSizing: 'border-box',
    border: '1px solid #E8CDBD',
    borderRadius: 7,
    padding: '0 8px',
    color: '#655040',
    background: '#FFF6F7',
    outline: 'none',
    fontSize: 12,
    fontWeight: 500,
    fontFamily,
  },

  textarea: {
    width: '100%',
    minHeight: 135,
    boxSizing: 'border-box',
    border: '1px solid #E8CDBD',
    borderRadius: 9,
    padding: 12,
    color: '#655040',
    background: '#F2DFD1',
    outline: 'none',
    fontSize: 13,
    fontWeight: 500,
    resize: 'vertical',
    fontFamily,
  },

  visitTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
    fontFamily,
  },

  visitTypeBtn: {
    minHeight: 43,
    border: '1px solid #E8CDBD',
    borderRadius: 9,
    background: '#F2DFD1',
    color: '#655040',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily,
  },

  visitTypeActive: {
    borderColor: '#655040',
    boxShadow: 'inset 0 0 0 1px #655040',
    background: '#F7E6DA',
  },

  physicalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 13,
    fontFamily,
  },

  progressBox: {
    background: '#F2DFD1',
    borderRadius: 12,
    padding: 15,
    minHeight: 118,
    fontFamily,
  },

  progressTitle: {
    margin: '0 0 8px',
    color: '#655040',
    fontSize: 12,
    fontWeight: 700,
    fontFamily,
  },

  progressDate: {
    margin: '0 0 10px',
    color: '#655040',
    fontSize: 12,
    fontWeight: 600,
    fontFamily,
  },

  progressStats: {
    display: 'flex',
    gap: 26,
    fontFamily,
  },

  progressPositive: {
    display: 'block',
    color: '#27994B',
    fontSize: 15,
    fontWeight: 800,
    fontFamily,
  },

  progressLabel: {
    display: 'block',
    color: '#655040',
    fontSize: 11,
    fontWeight: 600,
    marginTop: 2,
    fontFamily,
  },

  nutritionBox: {
    background: '#F2DFD1',
    borderRadius: 12,
    padding: 15,
    minHeight: 118,
    fontFamily,
  },

  statusBadge: {
    width: 'fit-content',
    background: '#CEFCBD',
    color: '#4E724C',
    borderRadius: 999,
    padding: '6px 18px',
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 9,
    fontFamily,
  },

  nutritionText: {
    margin: 0,
    color: '#8A7468',
    fontSize: 11,
    lineHeight: 1.5,
    fontWeight: 600,
    fontFamily,
  },

  helperText: {
    margin: '-6px 0 14px',
    color: '#9A7E70',
    fontSize: 11,
    fontWeight: 600,
    fontFamily,
  },

  reminderPanel: {
    marginTop: 10,
    background: '#F2DFD1',
    border: '1px solid #E8CDBD',
    borderRadius: 12,
    padding: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    fontFamily,
  },

  reminderTitle: {
    margin: '0 0 4px',
    color: '#655040',
    fontSize: 13,
    fontWeight: 800,
    fontFamily,
  },

  reminderDesc: {
    margin: 0,
    color: '#7B6A5E',
    fontSize: 11,
    lineHeight: 1.4,
    fontWeight: 600,
    fontFamily,
  },

  switchButton: {
    width: 42,
    height: 24,
    border: 'none',
    borderRadius: 999,
    background: '#CDB9AD',
    padding: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    cursor: 'pointer',
    transition: '0.2s ease',
    flexShrink: 0,
  },

  switchButtonActive: {
    background: '#4E724C',
    justifyContent: 'flex-end',
  },

  switchKnob: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#FFFFFF',
    display: 'block',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.18)',
  },

  consultGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.1fr',
    gap: 24,
    fontFamily,
  },

  consultOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 10,
    fontFamily,
  },

  checkboxBox: {
    minHeight: 39,
    background: '#F2DFD1',
    border: '1px solid #E8CDBD',
    borderRadius: 9,
    padding: '8px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#655040',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily,
  },

  otherInputBox: {
    minHeight: 39,
    background: '#F2DFD1',
    border: '1px solid #E8CDBD',
    borderRadius: 9,
    padding: '8px 10px',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
    gap: 8,
    color: '#655040',
    fontSize: 12,
    fontWeight: 600,
    fontFamily,
  },

  conditionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
    fontFamily,
  },

  inlineCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    color: '#655040',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily,
  },

  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 22,
    fontFamily,
  },

  cancelBtn: {
    minHeight: 38,
    border: 'none',
    background: '#FFF6F7',
    color: '#655040',
    borderRadius: 999,
    padding: '0 24px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily,
  },

  saveBtn: {
    minHeight: 38,
    border: 'none',
    background: '#FFF6F7',
    color: '#4E724C',
    borderRadius: 999,
    padding: '0 24px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily,
  },
}
