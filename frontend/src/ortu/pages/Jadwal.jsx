import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'
import { SharedSidebar, Icon, ProfilePopup } from '../components/SidebarLayout'
import { GreenHeaderDecorations, GreenContentDecorations } from '../components/Decorations'
import useRefreshOnFocus from '../hooks/useRefreshOnFocus'

// ─── Warna yang dipakai di seluruh halaman ini ───────────────────────────────
const colors = {
  green: '#4E724C',
  greenSoft: '#CFEBD2',
  cream: '#FFF5F8',
  tan: '#F2DFD1',
  brown: '#655040',
  mutedBrown: '#876D5D',
  white: '#FFFFFF',
}

// ─── Konfigurasi tiap jenis kegiatan (warna, ikon, label) ────────────────────
const jenisConfig = {
  penimbangan: {
    label: 'Posyandu Rutin',
    color: '#4E724C',
    bg: '#CFEBD2',
    dot: '#4E724C',
  },
  imunisasi: {
    label: 'Imunisasi',
    color: '#8B5CF6',
    bg: '#EDE9FE',
    dot: '#8B5CF6',
  },
  makanan_tambahan: {
    label: 'Pemberian Makanan Tambahan',
    color: '#EF4444',
    bg: '#FEE2E2',
    dot: '#EF4444',
  },
  penyuluhan: {
    label: 'Penyuluhan Kesehatan',
    color: '#F59E0B',
    bg: '#FEF3C7',
    dot: '#F59E0B',
  },
  lainnya: {
    label: 'Lainnya',
    color: '#876D5D',
    bg: '#F2DFD1',
    dot: '#876D5D',
  },
}

// ─── Tab filter ──────────────────────────────────────────────────────────────
const filterTabs = [
  { key: 'semua', label: 'Semua Kegiatan' },
  { key: 'penimbangan', label: 'Posyandu Rutin' },
  { key: 'imunisasi', label: 'Imunisasi' },
  { key: 'makanan_tambahan', label: 'Makanan Tambah' },
  { key: 'penyuluhan', label: 'Penyuluhan Kesehatan' },
]

// ─── Data demo (dipakai kalau API tidak bisa diakses) ────────────────────────
const demoJadwal = [
  {
    id: 1, judul: 'Posyandu Rutin', jenis: 'penimbangan',
    deskripsi: 'Penimbangan, Pengukuran, Konseling',
    lokasi: 'Posyandu Mawar', tanggal: '2026-08-01',
    waktu_mulai: '08:00', waktu_selesai: '10:00',
  },
  {
    id: 2, judul: 'Imunisasi', jenis: 'imunisasi',
    deskripsi: 'Imunisasi untuk balita',
    lokasi: 'Posyandu Mawar', tanggal: '2026-08-09',
    waktu_mulai: '08:00', waktu_selesai: '12:00',
  },
  {
    id: 3, judul: 'Pemberian Makanan Tambahan', jenis: 'makanan_tambahan',
    deskripsi: 'Pemberian makanan tambahan untuk balita',
    lokasi: 'Posyandu Mawar', tanggal: '2026-08-21',
    waktu_mulai: '12:00', waktu_selesai: '16:00',
  },
  {
    id: 4, judul: 'Posyandu Rutin', jenis: 'penimbangan',
    deskripsi: 'Penimbangan, Pengukuran, Konseling',
    lokasi: 'Posyandu Mawar', tanggal: '2026-08-22',
    waktu_mulai: '08:00', waktu_selesai: '10:00',
  },
  {
    id: 5, judul: 'Penyuluhan Kesehatan', jenis: 'penyuluhan',
    deskripsi: 'Penyuluhan gizi seimbang untuk ibu balita',
    lokasi: 'Posyandu Mawar', tanggal: '2026-08-23',
    waktu_mulai: '08:00', waktu_selesai: '12:00',
  },
]

// ─── Nama hari & bulan dalam bahasa Indonesia ────────────────────────────────
const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

// ─── Helper: buat array sel kalender (Senin = kolom pertama) ─────────────────
function buatSelKalender(tahun, bulan) {
  const hariPertama = new Date(tahun, bulan, 1).getDay() // 0=Minggu
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()
  const jumlahHariBulanLalu = new Date(tahun, bulan, 0).getDate()
  // Offset: Senin jadi kolom 0
  const offset = hariPertama === 0 ? 6 : hariPertama - 1

  const sel = []
  for (let i = offset - 1; i >= 0; i--) {
    sel.push({ hari: jumlahHariBulanLalu - i, bulanIni: false })
  }
  for (let d = 1; d <= jumlahHari; d++) {
    sel.push({ hari: d, bulanIni: true })
  }
  const sisa = 42 - sel.length
  for (let d = 1; d <= sisa; d++) {
    sel.push({ hari: d, bulanIni: false })
  }
  return sel
}

// ─── Helper: format tanggal jadi "1 Agustus 2026" ───────────────────────────
function formatTanggal(tgl) {
  if (!tgl) return '-'
  const d = new Date(tgl)
  if (isNaN(d)) return '-'
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

// ─── Helper: format jam jadi "08:00" ────────────────────────────────────────
function formatJam(waktu) {
  return waktu ? waktu.substring(0, 5) : '--:--'
}

// ════════════════════════════════════════════════════════════════════════════
//  KOMPONEN UTAMA
// ════════════════════════════════════════════════════════════════════════════
export default function Jadwal() {
  const [jadwal, setJadwal] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('semua')
  const [calDate, setCalDate] = useState(new Date())
  const [notifOn, setNotifOn] = useState(
    () => localStorage.getItem('notif_jadwal') === 'true'
  )
  const [showProfile, setShowProfile] = useState(false)

  // State untuk modal admin (tambah/edit)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    judul: '', jenis: 'penimbangan', tanggal: '',
    waktu_mulai: '08:00', waktu_selesai: '11:00',
    lokasi: '', deskripsi: '',
  })

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'
  const refresh = useRefreshOnFocus()

  // ── Ambil data jadwal dari API ─────────────────────────────────────────
  const loadJadwal = async () => {
    setLoading(true)
    try {
      const res = await API.get('/jadwal')
      const list = Array.isArray(res.data) ? res.data : (res.data.data || [])
      setJadwal(list.length > 0 ? list : demoJadwal)
    } catch {
      setJadwal(demoJadwal)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    API.get('/jadwal')
      .then((res) => {
        if (cancelled) return
        const list = Array.isArray(res.data) ? res.data : (res.data.data || [])
        setJadwal(list.length > 0 ? list : demoJadwal)
      })
      .catch(() => { if (!cancelled) setJadwal(demoJadwal) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [refresh])

  // ── Filter kegiatan berdasarkan tab aktif ──────────────────────────────
  const tampilJadwal = activeFilter === 'semua'
    ? jadwal
    : jadwal.filter((j) => j.jenis === activeFilter)

  // ── Tentukan status badge ──────────────────────────────────────────────
  // Event paling dekat ke depan = "Terjadwal", sisanya = "Akan Datang"
  const hari_ini = new Date()
  hari_ini.setHours(0, 0, 0, 0)
  const urutanMendatang = [...tampilJadwal]
    .filter((j) => j.tanggal && new Date(j.tanggal) >= hari_ini)
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
  const idTerdekat = urutanMendatang[0]?.id

  function getStatus(j) {
    if (!j.tanggal) return null
    const d = new Date(j.tanggal)
    d.setHours(0, 0, 0, 0)
    if (d < hari_ini) return null
    return j.id === idTerdekat ? 'terjadwal' : 'akan_datang'
  }

  // ── Kalender ───────────────────────────────────────────────────────────
  const calTahun = calDate.getFullYear()
  const calBulan = calDate.getMonth()
  const selKalender = buatSelKalender(calTahun, calBulan)
  const hariIniDate = new Date()

  function getDotsUntukHari(hari) {
    return jadwal
      .filter((j) => {
        if (!j.tanggal) return false
        const d = new Date(j.tanggal)
        return (
          d.getFullYear() === calTahun &&
          d.getMonth() === calBulan &&
          d.getDate() === hari
        )
      })
      .map((j) => (jenisConfig[j.jenis] || jenisConfig.lainnya).dot)
  }

  // ── Toggle notifikasi ──────────────────────────────────────────────────
  function handleNotifToggle() {
    if (!notifOn) {
      if ('Notification' in window) {
        Notification.requestPermission().then((p) => {
          if (p === 'granted') {
            setNotifOn(true)
            localStorage.setItem('notif_jadwal', 'true')
          } else {
            alert('Izin notifikasi ditolak. Aktifkan di pengaturan browser Anda.')
          }
        })
      } else {
        alert('Browser Anda tidak mendukung notifikasi.')
      }
    } else {
      setNotifOn(false)
      localStorage.setItem('notif_jadwal', 'false')
    }
  }

  // ── Admin: submit form tambah/edit ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await API.put(`/jadwal/${editId}`, form)
      } else {
        await API.post('/jadwal', form)
      }
      setShowForm(false)
      setEditId(null)
      setForm({ judul: '', jenis: 'penimbangan', tanggal: '', waktu_mulai: '08:00', waktu_selesai: '11:00', lokasi: '', deskripsi: '' })
      loadJadwal()
    } catch (err) {
      alert('Gagal menyimpan jadwal: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleEdit = (j) => {
    setEditId(j.id)
    setForm({
      judul: j.judul || '', jenis: j.jenis || 'penimbangan',
      tanggal: j.tanggal || '', waktu_mulai: j.waktu_mulai || '08:00',
      waktu_selesai: j.waktu_selesai || '11:00',
      lokasi: j.lokasi || '', deskripsi: j.deskripsi || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin hapus jadwal ini?')) return
    try {
      await API.delete(`/jadwal/${id}`)
      loadJadwal()
    } catch (err) {
      alert('Gagal hapus: ' + (err.response?.data?.message || err.message))
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={s.page}>
      <SharedSidebar activePath="/jadwal" />

      <main style={s.main}>
        {/* ── Header hijau ── */}
        <header style={{ ...s.header, position: 'relative', overflow: 'hidden' }}>
          <GreenHeaderDecorations />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={s.headerTitle}>Agenda Posyandu</div>
            <div style={s.headerSubtitle}>
              Lihat Semua agenda posyandu untuk balita anada!
            </div>
          </div>
          <div style={{ ...s.headerRight, position: 'relative', zIndex: 1 }}>
            <Link to="/notifikasi" style={s.bellBtn} aria-label="Notifikasi" className="pc-btn pc-bell">
              <Icon name="bell" size={20} color={colors.brown} />
            </Link>
            <button
              type="button"
              onClick={() => setShowProfile(true)}
              style={{ ...s.userPill, border: 'none', cursor: 'pointer' }}
              className="pc-btn"
            >
              <div style={s.userAvatar}>
                {(user.nama || 'U').slice(0, 1).toUpperCase()}
              </div>
              <span style={s.userName}>{user.nama || 'User'}</span>
            </button>
          </div>
        </header>

        {/* ── Area konten (background hijau) ── */}
        <section style={{ ...s.contentArea, position: 'relative', overflow: 'hidden' }}>
          <GreenContentDecorations />

          {/* ── Filter tabs ── */}
          <div style={{ ...s.filterWrap, position: 'relative', zIndex: 1 }}>
            <div style={s.filterRow}>
              {filterTabs.map((tab, i) => {
                const aktif = activeFilter === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`pc-hover-scale pc-press pc-slide-down pc-delay-${i + 1}`}
                    style={{
                      ...s.filterTab,
                      background: colors.white,
                      border: aktif
                        ? '2px solid ' + colors.green
                        : '2px solid transparent',
                      color: aktif ? colors.green : colors.mutedBrown,
                      fontWeight: aktif ? 700 : 600,
                      boxShadow: aktif
                        ? '0 4px 12px rgba(78,114,76,0.18)'
                        : '0 3px 8px rgba(0,0,0,0.08)',
                    }}
                  >
                    <TabIcon tabKey={tab.key} aktif={aktif} />
                    {tab.label}
                  </button>
                )
              })}
              {/* Tombol tambah hanya untuk admin */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setEditId(null)
                    setForm({ judul: '', jenis: 'penimbangan', tanggal: '', waktu_mulai: '08:00', waktu_selesai: '11:00', lokasi: '', deskripsi: '' })
                    setShowForm(true)
                  }}
                  style={s.addBtn}
                >
                  + Tambah
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div style={s.loadingText}>Memuat data...</div>
          ) : (
            /* ── Dua kolom: kalender (kiri) + daftar kegiatan (kanan) ── */
            <div style={{ ...s.twoCol, position: 'relative', zIndex: 1 }}>

              {/* ── KIRI: Kalender ── */}
              <div style={s.calCard} className="pc-slide-up pc-delay-1">
                <div style={s.calJudul}>Kalender Kegiatan</div>

                {/* Navigasi bulan */}
                <div style={s.calNav}>
                  <button
                    onClick={() => setCalDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                    style={s.calNavBtn}
                  >
                    ‹
                  </button>
                  <span style={s.calBulanLabel}>
                    {BULAN[calBulan]} {calTahun}
                  </span>
                  <button
                    onClick={() => setCalDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                    style={s.calNavBtn}
                  >
                    ›
                  </button>
                </div>

                {/* Grid kalender */}
                <div style={s.calGrid}>
                  {HARI.map((h) => (
                    <div key={h} style={s.calHariHeader}>{h}</div>
                  ))}
                  {selKalender.map((sel, i) => {
                    const dots = sel.bulanIni ? getDotsUntukHari(sel.hari) : []
                    const isHariIni =
                      sel.bulanIni &&
                      sel.hari === hariIniDate.getDate() &&
                      calBulan === hariIniDate.getMonth() &&
                      calTahun === hariIniDate.getFullYear()
                    return (
                      <div key={i} style={{ ...s.calSel, opacity: sel.bulanIni ? 1 : 0.3 }}>
                        <div
                          style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: isHariIni ? colors.green : 'transparent',
                            color: isHariIni ? colors.white : colors.brown,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: isHariIni ? 700 : 500,
                          }}
                        >
                          {sel.hari}
                        </div>
                        {dots.length > 0 && (
                          <div style={s.dotRow}>
                            {dots.slice(0, 3).map((c, di) => (
                              <div key={di} style={{ ...s.dot, background: c }} />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Legenda warna */}
                <div style={s.legenda}>
                  <div style={s.legendaJudul}>Detail Kegiatan</div>
                  {Object.entries(jenisConfig)
                    .filter(([k]) => k !== 'lainnya')
                    .map(([k, cfg]) => (
                      <div key={k} style={s.legendaItem}>
                        <div style={{ ...s.legendaDot, background: cfg.dot }} />
                        <span style={s.legendaLabel}>{cfg.label}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* ── KANAN: Daftar kegiatan ── */}
              <div style={s.eventCard} className="pc-slide-up pc-delay-2">
                <div style={s.eventJudul}>
                  {activeFilter === 'semua'
                    ? 'Semua Kegiatan Posyandu'
                    : (jenisConfig[activeFilter]?.label || 'Kegiatan')}
                </div>

                {tampilJadwal.length === 0 ? (
                  <div style={s.kosong}>
                    Belum ada kegiatan untuk kategori ini.
                  </div>
                ) : (
                  <div style={s.eventList}>
                    {tampilJadwal.map((j, idx) => {
                      const cfg = jenisConfig[j.jenis] || jenisConfig.lainnya
                      const status = getStatus(j)
                      return (
                        <div
                          key={j.id}
                          style={s.eventItem}
                          className={`pc-slide-up pc-hover-lift pc-delay-${(idx % 6) + 1}`}
                        >
                          {/* Ikon kegiatan */}
                          <div style={{ ...s.eventIkon, background: cfg.bg }}>
                            <IkonKegiatan jenis={j.jenis} color={cfg.color} />
                          </div>

                          {/* Info kegiatan */}
                          <div style={s.eventInfo}>
                            <div style={s.eventNama}>{j.judul}</div>
                            {j.deskripsi && (
                              <div style={s.eventDeskripsi}>{j.deskripsi}</div>
                            )}
                            <div style={s.eventMeta}>
                              <span style={s.metaItem}>
                                <IkonPin /> {j.lokasi || '-'}
                              </span>
                              <span style={s.metaItem}>
                                <IkonKalender /> {formatTanggal(j.tanggal)}
                              </span>
                              <span style={s.metaItem}>
                                {formatJam(j.waktu_mulai)} – {formatJam(j.waktu_selesai)}
                              </span>
                            </div>
                          </div>

                          {/* Badge status + tombol admin */}
                          <div style={s.eventKanan}>
                            {status === 'terjadwal' && (
                              <span style={s.badgeTerjadwal}>Terjadwal</span>
                            )}
                            {status === 'akan_datang' && (
                              <span style={s.badgeAkanDatang}>Akan Datang</span>
                            )}
                            {isAdmin && (
                              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                <button onClick={() => handleEdit(j)} style={s.editBtn}>
                                  ✏️ Edit
                                </button>
                                <button onClick={() => handleDelete(j.id)} style={s.deleteBtn}>
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Bar notifikasi di bawah (hanya untuk orang tua) ── */}
        {!isAdmin && (
          <div style={s.notifBar} className="pc-slide-up pc-delay-3">
            <div style={s.notifBarInner}>
              <div style={s.notifBarIkon} className={notifOn ? 'pc-bell' : ''}>
                <Icon
                  name="bell"
                  size={20}
                  color={notifOn ? colors.green : colors.mutedBrown}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.notifBarJudul}>Peringatan Notifikasi</div>
                <div style={s.notifBarSub}>
                  Pastikan anda datang sesuai jadwal agenda posyandu!
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={handleNotifToggle}
                aria-label={notifOn ? 'Matikan notifikasi' : 'Aktifkan notifikasi'}
                className="pc-press pc-focusable"
                style={{
                  ...s.toggle,
                  background: notifOn ? colors.green : '#CBD5E1',
                  transition: 'background 0.3s ease',
                }}
              >
                <div
                  style={{
                    ...s.toggleThumb,
                    transform: notifOn ? 'translateX(20px)' : 'translateX(2px)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Modal form admin (tambah / edit jadwal) ── */}
      {showForm && (
        <div style={s.modalOverlay}>
          <div style={s.modalBox}>
            <h2 style={{ color: colors.green, marginBottom: 20, fontSize: 18, fontWeight: 800 }}>
              {editId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
            </h2>
            <form onSubmit={handleSubmit}>
              {[
                { label: 'Judul Kegiatan', key: 'judul', type: 'text', required: true },
                { label: 'Tanggal', key: 'tanggal', type: 'date', required: true },
                { label: 'Waktu Mulai', key: 'waktu_mulai', type: 'time' },
                { label: 'Waktu Selesai', key: 'waktu_selesai', type: 'time' },
                { label: 'Lokasi', key: 'lokasi', type: 'text' },
              ].map((f) => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={s.formLabel}>{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                    style={s.formInput}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={s.formLabel}>Jenis Kegiatan</label>
                <select
                  value={form.jenis}
                  onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                  style={s.formInput}
                >
                  <option value="penimbangan">Penimbangan / Posyandu Rutin</option>
                  <option value="imunisasi">Imunisasi</option>
                  <option value="makanan_tambahan">Makanan Tambahan</option>
                  <option value="penyuluhan">Penyuluhan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={s.formLabel}>Deskripsi (opsional)</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={3}
                  style={{ ...s.formInput, resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditId(null) }}
                  style={s.cancelBtn}
                >
                  Batal
                </button>
                <button type="submit" style={s.submitBtn}>
                  {editId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-in profile drawer */}
      <ProfilePopup open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}

// ─── Ikon kecil untuk tab filter ─────────────────────────────────────────────
function TabIcon({ tabKey, aktif }) {
  const c = aktif ? colors.green : colors.mutedBrown
  const p = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (tabKey) {
    case 'semua':
      return <svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
    case 'penimbangan':
      return <svg {...p}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M7 3v3M17 3v3M4 8h16" /></svg>
    case 'imunisasi':
      return <svg {...p}><path d="m18 2 4 4M17 7l2-2M6 18 18 6M8 8l8 8M5 19l-3 3M9 15 5 11" /></svg>
    case 'makanan_tambahan':
      return <svg {...p}><path d="M9 3v6M9 9a3 3 0 0 0 6 0V3M12 12v9" /><path d="M3 3v4a3 3 0 0 0 6 0V3" /></svg>
    case 'penyuluhan':
      return <svg {...p}><circle cx="9" cy="7" r="3" /><path d="M3 21c1-3.5 10-3.5 11 0" /><circle cx="18" cy="8" r="2" /><path d="M21 21c-.5-2-3-3.5-5-3" /></svg>
    default:
      return null
  }
}

// ─── Ikon besar di dalam kartu kegiatan ──────────────────────────────────────
function IkonKegiatan({ jenis, color }) {
  const p = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (jenis) {
    case 'imunisasi':
      return <svg {...p}><path d="m18 2 4 4M17 7l2-2M6 18 18 6M8 8l8 8M5 19l-3 3M9 15 5 11" /></svg>
    case 'makanan_tambahan':
      return <svg {...p}><path d="M9 3v6M9 9a3 3 0 0 0 6 0V3M12 12v9" /><path d="M3 3v4a3 3 0 0 0 6 0V3" /></svg>
    case 'penyuluhan':
      return <svg {...p}><circle cx="9" cy="7" r="3" /><path d="M3 21c1-3.5 10-3.5 11 0" /><circle cx="18" cy="8" r="2" /><path d="M21 21c-.5-2-3-3.5-5-3" /></svg>
    default: // penimbangan & lainnya
      return <svg {...p}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M7 3v3M17 3v3M4 8h16" /></svg>
  }
}

// ─── Ikon pin lokasi (kecil) ──────────────────────────────────────────────────
function IkonPin() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

// ─── Ikon kalender (kecil) ────────────────────────────────────────────────────
function IkonKalender() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M7 3v3M17 3v3M4 8h16" />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════════════════════════════════════════
const s = {
  // Layout utama
  page: {
    width: '100%', minHeight: '100vh',
    fontFamily: "'Noto Sans', sans-serif",
    display: 'flex', background: colors.cream,
  },
  main: {
    flex: 1, minWidth: 0,
    display: 'flex', flexDirection: 'column',
  },

  // Header
  header: {
    background: 'linear-gradient(135deg, #5C8259 0%, #4E724C 50%, #3F633E 100%)',
    padding: '24px 30px',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 20, flexWrap: 'wrap',
    boxShadow: '0 4px 18px rgba(63, 99, 62, 0.18)',
  },
  headerTitle: { fontWeight: 800, fontSize: 26, color: colors.cream },
  headerSubtitle: { color: colors.cream, opacity: 0.88, fontSize: 13, marginTop: 4, maxWidth: 400 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  bellBtn: {
    width: 38, height: 38, borderRadius: '50%', background: colors.tan,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none', flexShrink: 0,
  },
  userPill: {
    background: colors.tan, borderRadius: 30, padding: '4px 14px 4px 4px',
    display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
  },
  userAvatar: {
    width: 30, height: 30, borderRadius: '50%', background: colors.brown,
    color: colors.white, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 13, fontWeight: 800,
  },
  userName: { fontWeight: 700, fontSize: 13, color: colors.brown },

  // Area konten
  contentArea: {
    flex: 1, padding: '22px 28px',
    background: 'linear-gradient(180deg, #4E724C 0%, #3F633E 100%)',
  },
  loadingText: { color: colors.cream, textAlign: 'center', padding: 48, fontSize: 15 },

  // Filter tabs
  filterWrap: {
    background: colors.cream, borderRadius: 16,
    padding: '10px 12px', marginBottom: 20,
  },
  filterRow: {
    display: 'flex', gap: 6, alignItems: 'center',
    overflowX: 'auto', paddingBottom: 2,
  },
  filterTab: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 15px', borderRadius: 12, cursor: 'pointer',
    fontSize: 13, whiteSpace: 'nowrap',
    fontFamily: "'Noto Sans', sans-serif",
    boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  addBtn: {
    marginLeft: 'auto',
    background: 'linear-gradient(135deg, #5C8259 0%, #4E724C 100%)',
    color: colors.white,
    border: 'none', borderRadius: 10, padding: '8px 16px',
    fontWeight: 700, fontSize: 13, cursor: 'pointer',
    fontFamily: "'Noto Sans', sans-serif", whiteSpace: 'nowrap',
    boxShadow: '0 3px 8px rgba(78, 114, 76, 0.3)',
  },

  // Dua kolom
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'minmax(240px, 320px) 1fr',
    gap: 18, alignItems: 'start',
  },

  // Kalender
  calCard: {
    background: colors.white, borderRadius: 16, padding: '18px 16px',
  },
  calJudul: { fontWeight: 800, fontSize: 15, color: colors.brown, marginBottom: 14 },
  calNav: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  calNavBtn: {
    width: 28, height: 28, background: 'transparent',
    border: '1px solid #E0D4CC', borderRadius: 8,
    cursor: 'pointer', fontSize: 17, fontWeight: 700,
    color: colors.brown, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Noto Sans', sans-serif",
  },
  calBulanLabel: { fontWeight: 700, fontSize: 14, color: colors.brown },
  calGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '3px 1px',
  },
  calHariHeader: {
    fontSize: 10, fontWeight: 700, color: colors.mutedBrown,
    textAlign: 'center', padding: '4px 0',
  },
  calSel: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', minHeight: 30, padding: '1px 0',
  },
  dotRow: { display: 'flex', gap: 2, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: '50%' },

  // Legenda
  legenda: {
    marginTop: 14, paddingTop: 12,
    borderTop: '1px solid #F0E8E0',
  },
  legendaJudul: { fontWeight: 800, fontSize: 12, color: colors.brown, marginBottom: 8 },
  legendaItem: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 },
  legendaDot: { width: 9, height: 9, borderRadius: '50%', flexShrink: 0 },
  legendaLabel: { fontSize: 11, color: colors.mutedBrown, fontWeight: 500 },

  // Daftar kegiatan
  eventCard: {
    background: colors.cream, borderRadius: 16,
    padding: '18px 18px', minHeight: 400,
  },
  eventJudul: { fontWeight: 800, fontSize: 15, color: colors.brown, marginBottom: 14 },
  kosong: { color: colors.mutedBrown, textAlign: 'center', padding: '48px 0', fontSize: 14 },
  eventList: { display: 'flex', flexDirection: 'column', gap: 12 },
  eventItem: {
    display: 'flex', alignItems: 'flex-start', gap: 13,
    padding: '14px 16px', background: colors.white,
    borderRadius: 14,
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
  },
  eventIkon: {
    width: 50, height: 50, borderRadius: 13, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  eventInfo: { flex: 1, minWidth: 0 },
  eventNama: { fontWeight: 800, fontSize: 15, color: colors.brown },
  eventDeskripsi: {
    fontSize: 12, color: colors.mutedBrown,
    margin: '3px 0 6px', lineHeight: 1.4,
  },
  eventMeta: {
    display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
  },
  metaItem: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 11.5, color: colors.mutedBrown, fontWeight: 500,
  },
  eventKanan: { flexShrink: 0, textAlign: 'right' },
  badgeTerjadwal: {
    display: 'inline-block', padding: '4px 11px',
    background: '#DBEAFE', color: '#1D4ED8',
    borderRadius: 999, fontSize: 12, fontWeight: 700,
  },
  badgeAkanDatang: {
    display: 'inline-block', padding: '4px 11px',
    background: colors.greenSoft, color: colors.green,
    borderRadius: 999, fontSize: 12, fontWeight: 700,
  },
  editBtn: {
    background: '#FFE9AE', border: 'none', borderRadius: 6,
    padding: '4px 10px', cursor: 'pointer', fontSize: 11,
    fontWeight: 700, color: colors.brown,
    fontFamily: "'Noto Sans', sans-serif",
  },
  deleteBtn: {
    background: '#FEE2E2', border: 'none', borderRadius: 6,
    padding: '4px 8px', cursor: 'pointer', fontSize: 11,
    color: '#DC2626', fontFamily: "'Noto Sans', sans-serif",
  },

  // Bar notifikasi
  notifBar: {
    background: 'linear-gradient(180deg, #FFF5F8 0%, #FFEBF1 100%)',
    padding: '14px 28px',
    borderTop: '1px solid #E8DDD5',
  },
  notifBarInner: {
    background: 'linear-gradient(135deg, #FFFDF5 0%, #FFF6D8 100%)',
    borderRadius: 14,
    padding: '13px 18px', display: 'flex',
    alignItems: 'center', gap: 14,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    maxWidth: 900,
  },
  notifBarIkon: {
    width: 38, height: 38, borderRadius: '50%',
    background: colors.tan, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  notifBarJudul: { fontWeight: 800, fontSize: 14, color: colors.brown },
  notifBarSub: { fontSize: 12, color: colors.mutedBrown, marginTop: 2 },
  toggle: {
    width: 44, height: 24, borderRadius: 999,
    border: 'none', cursor: 'pointer', padding: 0,
    position: 'relative', flexShrink: 0,
    transition: 'background 0.2s',
  },
  toggleThumb: {
    width: 20, height: 20, borderRadius: '50%',
    background: colors.white, position: 'absolute', top: 2,
    transition: 'transform 0.2s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
  },

  // Modal admin
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
  },
  modalBox: {
    background: colors.white, borderRadius: 16,
    padding: 28, width: 500,
    maxHeight: '90vh', overflowY: 'auto',
  },
  formLabel: {
    display: 'block', fontWeight: 700, fontSize: 13,
    color: colors.brown, marginBottom: 6,
  },
  formInput: {
    width: '100%', padding: '10px 12px',
    border: '1px solid #E0D4CC', borderRadius: 8,
    fontSize: 14, fontFamily: "'Noto Sans', sans-serif",
    boxSizing: 'border-box', color: colors.brown,
  },
  cancelBtn: {
    padding: '10px 20px', background: '#F3F4F6',
    border: 'none', borderRadius: 8, cursor: 'pointer',
    fontWeight: 700, fontFamily: "'Noto Sans', sans-serif",
    color: colors.brown,
  },
  submitBtn: {
    padding: '10px 20px', background: colors.green,
    color: colors.white, border: 'none', borderRadius: 8,
    cursor: 'pointer', fontWeight: 700,
    fontFamily: "'Noto Sans', sans-serif",
  },
}
