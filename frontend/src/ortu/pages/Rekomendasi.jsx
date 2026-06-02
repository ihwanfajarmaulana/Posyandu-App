import { useEffect, useState } from 'react'
import API from '../api'
import { SharedSidebar, Icon, ProfilePopup } from '../components/SidebarLayout'
import { GreenHeaderDecorations, CreamSectionDecorations } from '../components/Decorations'

const colors = {
  green: '#4E724C',
  greenDark: '#3F633E',
  greenSoft: '#CFEBD2',
  cream: '#FFF5F8',
  pink: '#FFE0F0',
  pinkSoft: '#FFEBF1',
  tan: '#F2DFD1',
  tanLight: '#F8E8DA',
  brown: '#655040',
  mutedBrown: '#876D5D',
  white: '#FFFFFF',
  red: '#E63946',
  redSoft: '#FFD4D4',
  redPale: '#FFE7E7',
  yellowSoft: '#FFF1B8',
  blue: '#3B82F6',
  blueSoft: '#DBEAFE',
}

const fontFamily = '"Segoe UI", Arial, sans-serif'

const rekomendasiFallback = [
  {
    icon: '🍗',
    title: 'Perbanyak konsumsi protein hewani',
    desc: 'Perbanyak konsumsi telur, ikan, daging, tempe, dan tahu sebanyak 2-3 kali sehari untuk membantu pertumbuhan anak.',
  },
  {
    icon: '🍩',
    title: 'Mengurangi Jajanan Manis dan Instan',
    desc: 'Batasi konsumsi makanan manis dan instan, maksimal 1-2 kali seminggu, agar kebutuhan gizi anak tetap terjaga.',
  },
  {
    icon: '💧',
    title: 'Mencukupi Kebutuhan Air Putih',
    desc: 'Pastikan anak minum air putih 6-8 gelas sehari agar tubuh tetap sehat dan terhidrasi.',
  },
  {
    icon: '🍳',
    title: 'Membiasakan Sarapan Sehat',
    desc: 'Biasakan anak sarapan seperti nasi, telur, susu, atau buah setiap pagi agar energi dan kebutuhan nutrisinya terpenuhi.',
  },
]

const penangananFallback = [
  {
    icon: '🍽️',
    title: 'Meningkatkan porsi makan',
    desc: 'Memberi anak makan dengan porsi yang lebih banyak daripada biasanya.',
  },
  {
    icon: '🥛',
    title: 'Rutin Memberikan Susu',
    desc: 'Berikan susu secara rutin sesuai usia dan kebutuhan anak.',
  },
  {
    icon: '🏥',
    title: 'Rutin Mengikuti Kegiatan Posyandu',
    desc: 'Ikuti pemeriksaan rutin di posyandu guna memantau kesehatan dan pertumbuhan anak.',
  },
]

function calcUsia(tanggalLahir) {
  if (!tanggalLahir) return '-'

  const lahir = new Date(tanggalLahir)
  const sekarang = new Date()

  if (Number.isNaN(lahir.getTime())) return '-'

  let bulan =
    (sekarang.getFullYear() - lahir.getFullYear()) * 12 +
    (sekarang.getMonth() - lahir.getMonth())

  if (sekarang.getDate() < lahir.getDate()) bulan -= 1
  bulan = Math.max(bulan, 0)

  if (bulan < 12) return `${bulan} Bulan`

  const tahun = Math.floor(bulan / 12)
  const sisa = bulan % 12

  return sisa === 0 ? `${tahun} Tahun` : `${tahun} Tahun ${sisa} Bulan`
}

function formatTanggal(tgl) {
  if (!tgl) return '-'

  const d = new Date(tgl)

  if (Number.isNaN(d.getTime())) return '-'

  const bln = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  return `${d.getDate()} ${bln[d.getMonth()]} ${d.getFullYear()}`
}

function ensureArray(value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function isFilled(value) {
  const text = String(value || '').trim()

  return (
    text &&
    text !== '-' &&
    text !== '✓' &&
    text !== '[object Object]' &&
    text !== 'null' &&
    text !== 'undefined'
  )
}

function isJsonText(value) {
  const text = String(value || '').trim()
  return text.startsWith('{') || text.startsWith('[')
}

function parseJsonMaybe(value) {
  if (!value) return null

  if (typeof value === 'object') return value

  if (typeof value !== 'string') return null

  const text = value.trim()

  if (!isJsonText(text)) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function toArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  return [value]
}

function cleanText(value) {
  if (!value) return ''

  if (typeof value === 'object') {
    return String(
      value.title ||
        value.judul ||
        value.nama ||
        value.nama_penanganan ||
        value.nama_rekomendasi ||
        value.tindakan ||
        value.penanganan ||
        value.kegiatan ||
        value.desc ||
        value.deskripsi ||
        value.keterangan ||
        value.detail ||
        value.description ||
        ''
    ).trim()
  }

  return String(value).trim()
}

function shortTitle(text, max = 80) {
  const clean = String(text || '').trim()

  if (clean.length <= max) return clean

  return `${clean.slice(0, max)}...`
}

function uniqueByTitle(list) {
  const seen = new Set()

  return list.filter((item) => {
    const key = String(item.title || '').toLowerCase().trim()

    if (!key || seen.has(key)) return false

    seen.add(key)
    return true
  })
}

function getPenangananIcon(title) {
  const text = String(title || '').toLowerCase()

  if (text.includes('susu') || text.includes('formula') || text.includes('uht')) return '🥛'
  if (text.includes('posyandu') || text.includes('pemeriksaan')) return '🏥'
  if (text.includes('puskesmas') || text.includes('rujuk') || text.includes('rujukan')) return '🏥'
  if (text.includes('pmt') || text.includes('biskuit') || text.includes('makanan tambahan')) return '🍪'
  if (text.includes('makan') || text.includes('gizi') || text.includes('protein')) return '🍽️'
  if (text.includes('tidur')) return '😴'
  if (text.includes('air') || text.includes('minum')) return '💧'
  if (text.includes('imunisasi') || text.includes('vaksin')) return '💉'

  return '✅'
}

function getPenangananDesc(title) {
  const text = String(title || '').toLowerCase()

  if (text.includes('susu')) {
    return 'Berikan susu secara rutin sesuai usia dan kebutuhan anak.'
  }

  if (text.includes('posyandu') || text.includes('pemeriksaan')) {
    return 'Ikuti pemeriksaan rutin di posyandu untuk memantau kesehatan dan pertumbuhan anak.'
  }

  if (text.includes('puskesmas') || text.includes('rujuk') || text.includes('rujukan')) {
    return 'Lakukan pemeriksaan lebih lanjut ke puskesmas sesuai arahan pegawai posyandu.'
  }

  if (text.includes('pmt') || text.includes('biskuit') || text.includes('makanan tambahan')) {
    return 'Berikan makanan tambahan sesuai arahan posyandu untuk membantu pemenuhan gizi anak.'
  }

  if (text.includes('makan') || text.includes('gizi') || text.includes('protein')) {
    return 'Berikan makanan bergizi seimbang untuk membantu mendukung pertumbuhan anak.'
  }

  if (text.includes('tidur')) {
    return 'Pastikan anak mendapatkan waktu tidur yang cukup dan teratur setiap hari.'
  }

  if (text.includes('air') || text.includes('minum')) {
    return 'Pastikan anak mendapatkan cairan yang cukup setiap hari.'
  }

  return 'Penanganan ini tercatat dari arahan pegawai posyandu.'
}

function extractRekomendasiList(list) {
  const source = ensureArray(list)
  const hasil = []

  source.forEach((item) => {
    const tindakan = parseJsonMaybe(item?.tindakan)

    const rekomendasiFromTindakan = [
      ...toArray(tindakan?.rekomendasi_orang_tua),
      ...toArray(tindakan?.rekomendasi),
      ...toArray(tindakan?.recommendations),
      ...toArray(tindakan?.rekomendasiOrtu),
      ...toArray(tindakan?.rekomendasi_ortu),
    ]

    if (rekomendasiFromTindakan.length > 0) {
      rekomendasiFromTindakan.forEach((rec, index) => {
        const fallback = rekomendasiFallback[index % rekomendasiFallback.length]
        const text = cleanText(rec)

        if (!isFilled(text) || isJsonText(text)) return

        hasil.push({
          icon: rec?.icon || rec?.emoji || fallback.icon,
          title: rec?.title || rec?.judul || rec?.nama || shortTitle(text, 70),
          desc:
            rec?.desc ||
            rec?.deskripsi ||
            rec?.keterangan ||
            rec?.detail ||
            rec?.description ||
            text,
        })
      })

      return
    }

    const fallback = rekomendasiFallback[hasil.length % rekomendasiFallback.length]

    const title =
      item?.title ||
      item?.judul ||
      item?.nama ||
      item?.nama_rekomendasi ||
      item?.rekomendasi ||
      ''

    const desc =
      item?.desc ||
      item?.deskripsi ||
      item?.keterangan ||
      item?.catatan ||
      item?.detail ||
      item?.description ||
      ''

    if (!isFilled(title) || isJsonText(title)) return

    hasil.push({
      icon: item?.icon || item?.emoji || fallback.icon,
      title,
      desc: isFilled(desc) && !isJsonText(desc) ? desc : fallback.desc,
    })
  })

  return uniqueByTitle(hasil)
}

function extractPenangananList(list) {
  const source = ensureArray(list)
  const hasil = []

  source.forEach((item) => {
    const tindakan = parseJsonMaybe(item?.tindakan)

    const checklistFromTindakan = [
      ...toArray(tindakan?.checklist_orang_tua),
      ...toArray(tindakan?.penanganan_ortu),
      ...toArray(tindakan?.penangananOrtu),
      ...toArray(tindakan?.tindakan_orang_tua),
      ...toArray(tindakan?.tindakanOrtu),
      ...toArray(tindakan?.checklistOrtu),
      ...toArray(tindakan?.checklist),
    ]

    if (checklistFromTindakan.length > 0) {
      checklistFromTindakan.forEach((action) => {
        const title = cleanText(action)

        if (!isFilled(title) || isJsonText(title)) return

        hasil.push({
          icon: action?.icon || action?.emoji || getPenangananIcon(title),
          title,
          desc:
            action?.desc ||
            action?.deskripsi ||
            action?.keterangan ||
            action?.detail ||
            action?.description ||
            getPenangananDesc(title),
        })
      })

      return
    }

    const rawTindakan = item?.tindakan
    const rawTindakanParsed = parseJsonMaybe(rawTindakan)

    const title =
      item?.title ||
      item?.judul ||
      item?.nama ||
      item?.nama_penanganan ||
      item?.penanganan ||
      item?.kegiatan ||
      (!rawTindakanParsed ? rawTindakan : '') ||
      ''

    if (!isFilled(title) || isJsonText(title)) return

    hasil.push({
      icon: item?.icon || item?.emoji || getPenangananIcon(title),
      title,
      desc:
        item?.desc ||
        item?.deskripsi ||
        item?.keterangan ||
        item?.catatan ||
        item?.detail ||
        item?.description ||
        getPenangananDesc(title),
    })
  })

  return uniqueByTitle(hasil)
}

function normalizeRekomendasiList(list) {
  const extracted = extractRekomendasiList(list)
  return extracted.length > 0 ? extracted : rekomendasiFallback
}

function normalizePenangananList(list) {
  const extracted = extractPenangananList(list)
  return extracted.length > 0 ? extracted : penangananFallback
}

export default function Rekomendasi() {
  const [anak, setAnak] = useState(null)
  const [rekomendasi, setRekomendasi] = useState(rekomendasiFallback)
  const [penanganan, setPenanganan] = useState(penangananFallback)
  const [loading, setLoading] = useState(true)
  const [showProfile, setShowProfile] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)

      try {
        const res = await API.get('/balita')
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : []

        if (cancelled) return

        if (list.length === 0) {
          setAnak(null)
          setRekomendasi(rekomendasiFallback)
          setPenanganan(penangananFallback)
          return
        }

        const firstAnak = list[0]
        let penangananApiList = []
        let rekomendasiApiList = []

        try {
          const ringkasan = await API.get(`/balita/${firstAnak.id}/ringkasan`)
          const p = ringkasan.data?.data?.pertumbuhan_terakhir || {}

          if (!cancelled) {
            setAnak({
              ...firstAnak,
              berat_badan: p.berat_badan ?? firstAnak.berat_badan ?? null,
              tinggi_badan: p.tinggi_badan ?? firstAnak.tinggi_badan ?? null,
              lingkar_kepala: p.lingkar_kepala ?? firstAnak.lingkar_kepala ?? null,
              tanggal_ukur: p.tanggal_ukur ?? firstAnak.tanggal_ukur ?? null,
              status_gizi: p.status_gizi || firstAnak.status_gizi || 'gizi_baik',
              z_score_bb: p.z_score_bb ?? firstAnak.z_score_bb ?? -2.6,
              z_score_tb: p.z_score_tb ?? firstAnak.z_score_tb ?? -2.3,
              z_score_bb_tb: p.z_score_bb_tb ?? firstAnak.z_score_bb_tb ?? -2.1,
            })
          }
        } catch {
          if (!cancelled) {
            setAnak({
              ...firstAnak,
              status_gizi: firstAnak.status_gizi || 'gizi_baik',
              z_score_bb: firstAnak.z_score_bb ?? -2.6,
              z_score_tb: firstAnak.z_score_tb ?? -2.3,
              z_score_bb_tb: firstAnak.z_score_bb_tb ?? -2.1,
            })
          }
        }

        try {
          const pen = await API.get(`/penanganan/anak/${firstAnak.id}`)
          const rawPen = pen.data?.data || pen.data || []
          penangananApiList = ensureArray(rawPen)

          if (!cancelled) {
            setPenanganan(normalizePenangananList(penangananApiList))
          }
        } catch {
          if (!cancelled) setPenanganan(penangananFallback)
        }

        try {
          const rek = await API.get(`/rekomendasi/anak/${firstAnak.id}`)
          const rawRek = rek.data?.data || rek.data || []
          rekomendasiApiList = ensureArray(rawRek)
        } catch {
          rekomendasiApiList = []
        }

        if (!cancelled) {
          const rekomendasiDariPenanganan = extractRekomendasiList(penangananApiList)
          const rekomendasiDariApi = extractRekomendasiList(rekomendasiApiList)

          const gabunganRekomendasi = uniqueByTitle([
            ...rekomendasiDariPenanganan,
            ...rekomendasiDariApi,
          ])

          setRekomendasi(
            gabunganRekomendasi.length > 0 ? gabunganRekomendasi : rekomendasiFallback
          )
        }
      } catch {
        if (!cancelled) {
          setAnak(null)
          setRekomendasi(rekomendasiFallback)
          setPenanganan(penangananFallback)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div style={s.page}>
      <SharedSidebar activePath="/rekomendasi" />

      <main style={s.main}>
        <section style={s.greenSection}>
          <GreenHeaderDecorations />

          <header style={s.headerRow}>
            <h1 style={s.headerTitle}>Tumbuh Kembang</h1>

            <div style={s.headerRight}>
              <button type="button" style={s.bellBtn} aria-label="Notifikasi">
                <Icon name="bell" size={20} color={colors.brown} />
              </button>

              <button
                type="button"
                onClick={() => setShowProfile(true)}
                style={s.userPill}
              >
                <div style={s.userAvatar}>
                  {(user.nama || 'U').slice(0, 1).toUpperCase()}
                </div>

                <span style={s.userName}>{user.nama || 'User'}</span>
              </button>
            </div>
          </header>

          <h2 style={s.sectionTitleWhite}>Data Anak</h2>

          {loading ? (
            <div style={s.loadingBox}>Memuat data anak...</div>
          ) : !anak ? (
            <div style={s.emptyBox}>
              Belum ada data anak. Hubungi kader posyandu untuk mendaftarkan anak.
            </div>
          ) : (
            <DataAnakCard child={anak} />
          )}
        </section>

        <section style={s.pinkContent}>
          <CreamSectionDecorations />

          <h2 style={s.sectionTitle}>Grafik Tumbuh Kembang</h2>

          <div style={s.chartGrid}>
            <GrafikCard
              chartId="bbu"
              title="Berat Badan per Usia (BB/U)"
              zScore={anak?.z_score_bb ?? -2.6}
              yLabel="Berat (kg)"
              xLabel="Usia (bulan)"
              maxY={20}
            />

            <GrafikCard
              chartId="tbu"
              title="Tinggi Badan per Usia (TB/U)"
              zScore={anak?.z_score_tb ?? -2.3}
              yLabel="Tinggi (cm)"
              xLabel="Usia (bulan)"
              maxY={120}
            />

            <GrafikCard
              chartId="bbtb"
              title="Berat Badan per Tinggi Badan (BB/TB)"
              zScore={anak?.z_score_bb_tb ?? -2.1}
              yLabel="Berat (kg)"
              xLabel="Tinggi (cm)"
              maxY={20}
              xMin={45}
              xMax={120}
            />
          </div>

          <div style={s.tentangGrafikCard}>
            <div style={s.tentangLeft}>
              <div style={s.tentangIconBox}>
                <ClipboardIcon />
              </div>

              <div>
                <div style={s.tentangTitle}>Tentang Grafik Tumbuh Kembang</div>

                <p style={s.tentangDesc}>
                  Grafik ini menunjukkan status pertumbuhan anak berdasarkan standar WHO.
                  Z-Score adalah indikator yang digunakan untuk menilai apakah pertumbuhan
                  anak sesuai, kurang, atau lebih dari standar.
                </p>
              </div>
            </div>

            <div style={s.tentangRight}>
              <div style={s.legendTitle}>Keterangan Z-Score WHO</div>

              <div style={s.legendList}>
                <LegendRow color="#E94B4B" label="< -3 SD" right="→ Stunting / Sangat Kurang" />
                <LegendRow color="#FFD966" label="-3 SD s/d -2 SD" right="→ Risiko" />
                <LegendRow color="#A8E0B0" label="-2 SD s/d +2 SD" right="→ Normal" />
              </div>
            </div>
          </div>

          <section style={s.rekomendasiSection}>
            <h2 style={s.sectionTitle}>Rekomendasi untuk Mendukung Tumbuh Kembang Anak</h2>

            <div style={s.rekomendasiList}>
              {rekomendasi.map((item, index) => (
                <RekomendasiItem
                  key={`${item.title}-${index}`}
                  icon={item.icon}
                  title={item.title}
                  desc={item.desc}
                />
              ))}
            </div>
          </section>

          <section style={s.penangananSection}>
            <h2 style={s.sectionTitle}>Penanganan yang Sudah Dilakukan Orang Tua</h2>

            <div style={s.penangananGrid}>
              {penanganan.map((item, index) => (
                <PenangananCard
                  key={`${item.title}-${index}`}
                  icon={item.icon}
                  title={item.title}
                  desc={item.desc}
                />
              ))}
            </div>
          </section>
        </section>
      </main>

      <ProfilePopup open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}

function DataAnakCard({ child }) {
  const isLakiLaki = child.jenis_kelamin === 'L'
  const usia = calcUsia(child.tanggal_lahir)
  const statusLabel = mapStatusGizi(child.status_gizi)
  const statusKey = String(child.status_gizi || '').toLowerCase()

  const isWarning = ['stunting', 'gizi_buruk', 'gizi_kurang'].includes(statusKey)

  return (
    <div style={s.dataAnakCard}>
      <div style={s.dataAnakLeft}>
        <div style={s.childPhoto}>
          <Icon name="user" size={64} color={colors.green} />
        </div>

        <div style={s.childInfo}>
          <h3 style={s.childName}>{child.nama || '-'}</h3>

          <div style={s.childTagsRow}>
            <span style={s.tagGender}>
              <span style={{ fontSize: 14 }}>{isLakiLaki ? '♂' : '♀'}</span>
              {isLakiLaki ? 'Laki-laki' : 'Perempuan'}
            </span>

            <span style={s.childAge}>{usia}</span>
          </div>

          <div style={s.detailGrid}>
            <DetailRow icon="📅" label="Tanggal Lahir" value={formatTanggal(child.tanggal_lahir)} />
            <DetailRow icon="🪪" label="ID Anak" value={child.nik || '-'} />
            <DetailRow icon="👩" label="Nama Ibu" value={child.nama_ibu || child.orang_tua?.nama || '-'} />
            <DetailRow icon="📍" label="Posyandu" value={child.posyandu || 'Posyandu Ceria'} />
            <DetailRow icon="🗓" label="Kunjungan Terakhir" value={formatTanggal(child.kunjungan_terakhir || child.tanggal_ukur)} />
          </div>
        </div>
      </div>

      <div
        style={{
          ...s.statusGiziCard,
          background: isWarning ? '#FFE7E7' : '#E6F5E9',
        }}
      >
        <div style={s.statusGiziTitle}>Status Gizi Terakhir</div>

        <div
          style={{
            ...s.statusGiziPill,
            background: isWarning ? '#FFD4D4' : '#CFEBD2',
            color: isWarning ? '#E63946' : '#3F633E',
          }}
        >
          <span style={{ fontSize: 18 }}>{isWarning ? '⚠️' : '✓'}</span>
          {statusLabel}
        </div>

        <div style={s.statusGiziNote}>
          Berdasarkan pengukuran
          <br />
          {formatTanggal(child.tanggal_ukur)}
        </div>

        <button type="button" style={s.catatBtn}>
          + Catat Penanganan
        </button>
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={s.detailRow}>
      <span style={s.detailLabel}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span>{label}</span>
      </span>

      <span style={s.detailValue}>{value}</span>
    </div>
  )
}

function GrafikCard({
  title,
  zScore,
  yLabel,
  xLabel,
  maxY = 20,
  xMin = 0,
  xMax = 30,
  chartId = 'chart',
}) {
  const isStunting = zScore <= -2

  const points = [
    { x: xMin, y: maxY * 0.1 },
    { x: xMin + (xMax - xMin) * 0.2, y: maxY * 0.18 },
    { x: xMin + (xMax - xMin) * 0.4, y: maxY * 0.24 },
    { x: xMin + (xMax - xMin) * 0.6, y: maxY * 0.28 },
    { x: xMin + (xMax - xMin) * 0.8, y: maxY * 0.32 },
    { x: xMax, y: maxY * 0.35 },
  ]

  const W = 200
  const H = 110
  const PADL = 28
  const PADB = 24

  const toX = (x) => PADL + ((x - xMin) / (xMax - xMin)) * (W - PADL - 6)
  const toY = (y) => H - PADB - (y / maxY) * (H - PADB - 8)

  const gradId = `gradZones-${chartId}`

  return (
    <div style={s.chartCard}>
      <div style={s.chartCardHeader}>
        <span style={s.chartCardTitle}>{title}</span>
        <span style={s.chartInfoIcon}>ⓘ</span>
      </div>

      <div
        style={{
          ...s.chartZScoreBadge,
          background: isStunting ? '#FFD4D4' : '#CFEBD2',
          color: isStunting ? '#E63946' : '#3F633E',
        }}
      >
        {isStunting ? 'Stunting' : 'Normal'} (Z-Score {zScore?.toFixed?.(1) || zScore})
      </div>

      <div style={s.chartYLabel}>{yLabel}</div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          marginTop: 4,
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F8B7B7" />
            <stop offset="0.15" stopColor="#F8B7B7" />
            <stop offset="0.15" stopColor="#FFE08A" />
            <stop offset="0.3" stopColor="#FFE08A" />
            <stop offset="0.3" stopColor="#B5E0BC" />
            <stop offset="0.7" stopColor="#B5E0BC" />
            <stop offset="0.7" stopColor="#FFE08A" />
            <stop offset="0.85" stopColor="#FFE08A" />
            <stop offset="0.85" stopColor="#F8B7B7" />
            <stop offset="1" stopColor="#F8B7B7" />
          </linearGradient>
        </defs>

        <rect
          x={PADL}
          y="4"
          width={W - PADL - 6}
          height={H - PADB - 4}
          fill={`url(#${gradId})`}
          rx="4"
        />

        {[0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY].map((v, i) => (
          <text
            key={i}
            x={PADL - 4}
            y={toY(v) + 3}
            fontSize="7"
            textAnchor="end"
            fill="#876D5D"
          >
            {Math.round(v)}
          </text>
        ))}

        {[xMin, xMin + (xMax - xMin) * 0.2, xMin + (xMax - xMin) * 0.4, xMin + (xMax - xMin) * 0.6, xMin + (xMax - xMin) * 0.8, xMax].map((v, i) => (
          <text
            key={i}
            x={toX(v)}
            y={H - PADB + 10}
            fontSize="7"
            textAnchor="middle"
            fill="#876D5D"
          >
            {Math.round(v)}
          </text>
        ))}

        {[
          { label: '+3', color: '#E94B4B', y: maxY * 0.95 },
          { label: '+2', color: '#C99B1F', y: maxY * 0.78 },
          { label: '0', color: '#4E724C', y: maxY * 0.5 },
          { label: '-2', color: '#C99B1F', y: maxY * 0.2 },
          { label: '-3', color: '#E94B4B', y: maxY * 0.08 },
        ].map((z, i) => (
          <text
            key={i}
            x={W - 2}
            y={toY(z.y) + 3}
            fontSize="7"
            fontWeight="700"
            textAnchor="end"
            fill={z.color}
          >
            {z.label}
          </text>
        ))}

        <polyline
          points={points.map((p) => `${toX(p.x)},${toY(p.y)}`).join(' ')}
          fill="none"
          stroke="#E63946"
          strokeWidth="1.3"
        />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={toX(p.x)}
            cy={toY(p.y)}
            r="1.6"
            fill="#FFFFFF"
            stroke="#E63946"
            strokeWidth="1.2"
          />
        ))}
      </svg>

      <div style={s.chartXLabel}>{xLabel}</div>

      <div style={s.chartLegend}>
        <span style={s.chartLegendInner}>
          <span style={s.chartLegendLine} />
          <span style={s.chartLegendDot} />
          Hasil Pengukuran Anak
        </span>
      </div>
    </div>
  )
}

function LegendRow({ color, label, right }) {
  return (
    <div style={s.legendRow}>
      <div style={{ ...s.legendSwatch, background: color }} />
      <span style={s.legendLabel}>{label}</span>
      <span style={s.legendRight}>{right}</span>
    </div>
  )
}

function ClipboardIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#876D5D"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </svg>
  )
}

function RekomendasiItem({ icon, title, desc }) {
  return (
    <div style={s.rekomItem}>
      <div style={s.rekomIcon}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>

      <div style={s.rekomText}>
        <div style={s.rekomTitle}>{title}</div>
        <p style={s.rekomDesc}>{desc}</p>
      </div>
    </div>
  )
}

function PenangananCard({ icon, title, desc }) {
  return (
    <div style={s.penangananCard}>
      <div style={s.penangananCheck}>✓</div>

      <h3 style={s.penangananTitle}>{title}</h3>

      <div style={s.penangananIconBig}>
        <span style={{ fontSize: 34 }}>{icon}</span>
      </div>

      <p style={s.penangananDesc}>{desc}</p>
    </div>
  )
}

function mapStatusGizi(status) {
  const map = {
    gizi_baik: 'Normal',
    normal: 'Normal',
    gizi_kurang: 'Gizi Kurang',
    gizi_lebih: 'Gizi Lebih',
    gizi_buruk: 'Gizi Buruk',
    obesitas: 'Obesitas',
    stunting: 'Stunting',
  }

  return map[String(status || '').toLowerCase()] || 'Normal'
}

const s = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: colors.cream,
    fontFamily,
  },

  main: {
    flex: 1,
    minWidth: 0,
  },

  greenSection: {
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #5C8259 0%, #4E724C 45%, #3F633E 100%)',
    padding: '24px 30px 32px',
    boxShadow: '0 4px 18px rgba(63, 99, 62, 0.18)',
  },

  headerRow: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
    marginBottom: 18,
  },

  headerTitle: {
    margin: 0,
    fontWeight: 700,
    fontSize: 26,
    color: colors.cream,
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: colors.tan,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  userPill: {
    border: 'none',
    background: colors.tan,
    borderRadius: 30,
    padding: '4px 14px 4px 4px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    fontFamily,
  },

  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: colors.brown,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
  },

  userName: {
    fontWeight: 600,
    fontSize: 13,
    color: colors.brown,
  },

  sectionTitleWhite: {
    position: 'relative',
    zIndex: 1,
    margin: '0 0 14px',
    fontSize: 16,
    fontWeight: 700,
    color: colors.cream,
  },

  loadingBox: {
    position: 'relative',
    zIndex: 1,
    background: colors.cream,
    borderRadius: 14,
    padding: 24,
    textAlign: 'center',
    color: colors.mutedBrown,
    fontWeight: 500,
  },

  emptyBox: {
    position: 'relative',
    zIndex: 1,
    background: colors.cream,
    borderRadius: 14,
    padding: 24,
    textAlign: 'center',
    color: colors.mutedBrown,
    fontWeight: 500,
  },

  dataAnakCard: {
    position: 'relative',
    zIndex: 1,
    background: colors.cream,
    borderRadius: 22,
    padding: '34px 32px',
    display: 'flex',
    alignItems: 'stretch',
    gap: 28,
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    flexWrap: 'wrap',
  },

  dataAnakLeft: {
    flex: '1 1 440px',
    display: 'flex',
    gap: 28,
    alignItems: 'center',
  },

  childPhoto: {
    width: 170,
    height: 170,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #DEEED8 0%, #CFEBD2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '4px solid #FFFFFF',
    boxShadow: '0 6px 16px rgba(101, 80, 64, 0.14)',
    flexShrink: 0,
  },

  childInfo: {
    flex: 1,
    minWidth: 0,
  },

  childName: {
    margin: '0 0 6px',
    fontSize: 28,
    fontWeight: 700,
    color: colors.brown,
  },

  childTagsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },

  tagGender: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    color: colors.blue,
    fontWeight: 500,
    fontSize: 14,
    textDecoration: 'underline',
  },

  childAge: {
    fontSize: 14,
    color: colors.brown,
    fontWeight: 500,
  },

  detailGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },

  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 14,
    color: colors.brown,
  },

  detailLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 170,
    color: colors.mutedBrown,
    fontWeight: 500,
  },

  detailValue: {
    color: colors.brown,
    fontWeight: 500,
  },

  statusGiziCard: {
    flex: '0 1 250px',
    borderRadius: 18,
    padding: '22px 22px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    border: '1px solid rgba(0,0,0,0.06)',
  },

  statusGiziTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: colors.brown,
    textAlign: 'center',
  },

  statusGiziPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 18px',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 17,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  },

  statusGiziNote: {
    fontSize: 12,
    color: colors.mutedBrown,
    textAlign: 'center',
    lineHeight: 1.4,
  },

  catatBtn: {
    marginTop: 6,
    padding: '9px 18px',
    background: '#CFEBD2',
    color: colors.green,
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily,
  },

  pinkContent: {
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #FFF5F8 0%, #FFEBF1 100%)',
    padding: '28px 30px 40px',
  },

  sectionTitle: {
    position: 'relative',
    zIndex: 1,
    margin: '0 0 14px',
    fontSize: 17,
    fontWeight: 700,
    color: colors.brown,
  },

  chartGrid: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },

  chartCard: {
    background: colors.white,
    borderRadius: 14,
    padding: 14,
    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
  },

  chartCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  chartCardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.brown,
  },

  chartInfoIcon: {
    fontSize: 14,
    color: colors.mutedBrown,
  },

  chartZScoreBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
  },

  chartYLabel: {
    fontSize: 10,
    color: colors.mutedBrown,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: 500,
  },

  chartXLabel: {
    fontSize: 10,
    color: colors.mutedBrown,
    fontWeight: 500,
    marginLeft: 28,
    marginTop: 4,
  },

  chartLegend: {
    fontSize: 10,
    color: colors.mutedBrown,
    fontWeight: 500,
    marginTop: 6,
    textAlign: 'left',
  },

  chartLegendInner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  },

  chartLegendLine: {
    width: 14,
    height: 1.5,
    background: '#E63946',
    display: 'inline-block',
  },

  chartLegendDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#FFFFFF',
    border: '1.5px solid #E63946',
    display: 'inline-block',
  },

  tentangGrafikCard: {
    position: 'relative',
    zIndex: 1,
    background: '#F8DCDC',
    borderRadius: 14,
    padding: 18,
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap',
    marginBottom: 24,
  },

  tentangLeft: {
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start',
    flex: '1 1 320px',
  },

  tentangIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  tentangTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.brown,
    marginBottom: 6,
  },

  tentangDesc: {
    margin: 0,
    fontSize: 12.5,
    color: colors.mutedBrown,
    lineHeight: 1.55,
  },

  tentangRight: {
    flex: '0 1 320px',
    borderLeft: '1px dashed rgba(101, 80, 64, 0.3)',
    paddingLeft: 18,
  },

  legendTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.brown,
    marginBottom: 8,
  },

  legendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },

  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
  },

  legendSwatch: {
    width: 18,
    height: 12,
    borderRadius: 3,
    flexShrink: 0,
  },

  legendLabel: {
    fontWeight: 500,
    color: colors.brown,
  },

  legendRight: {
    color: colors.mutedBrown,
    fontWeight: 400,
  },

  rekomendasiSection: {
    position: 'relative',
    zIndex: 1,
    background: '#D9E5FF',
    borderRadius: 18,
    padding: '18px 18px 14px',
    marginBottom: 24,
  },

  rekomendasiList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },

  rekomItem: {
    background: colors.white,
    borderRadius: 12,
    padding: '12px 14px',
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },

  rekomIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: '#F8E8DA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  rekomText: {
    flex: 1,
    minWidth: 0,
  },

  rekomTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    color: colors.brown,
    marginBottom: 4,
  },

  rekomDesc: {
    margin: 0,
    fontSize: 12,
    color: colors.mutedBrown,
    lineHeight: 1.55,
  },

  penangananSection: {
    position: 'relative',
    zIndex: 1,
    background: '#D9E5FF',
    borderRadius: 18,
    padding: '18px 18px',
  },

  penangananGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
  },

  penangananCard: {
    position: 'relative',
    minHeight: 150,
    background: colors.white,
    borderRadius: 14,
    padding: '18px 16px 18px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },

  penangananCheck: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 24,
    height: 24,
    borderRadius: 6,
    background: '#58D68D',
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 700,
  },

  penangananTitle: {
    margin: '8px 0 4px',
    color: colors.brown,
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.35,
    maxWidth: 300,
  },

  penangananIconBig: {
    margin: '4px 0 4px',
    lineHeight: 1,
    minHeight: 38,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  penangananDesc: {
    margin: 0,
    color: colors.mutedBrown,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.5,
    maxWidth: 260,
  },
}