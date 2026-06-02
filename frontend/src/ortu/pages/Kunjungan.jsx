import { useEffect, useState } from 'react'
import API from '../api'
import { SharedSidebar, Icon } from '../components/SidebarLayout'

const colors = {
  green: '#4E724C',
  sidebar: '#E9EFEF',
  cream: '#FFF5F8',
  brown: '#655040',
  mutedBrown: '#876D5D',
  tan: '#F2DFD1',
  active: '#CFEBD2',
  white: '#FFFFFF',
}

const jenisLabel = {
  rutin: 'Kunjungan Rutin',
  imunisasi: 'Imunisasi',
  konsultasi: 'Konsultasi',
  lainnya: 'Lainnya',
}

const jenisColor = {
  rutin: '#3287EF',
  imunisasi: '#34C759',
  konsultasi: '#D65FFA',
  lainnya: '#876D5D',
}

function formatTanggal(date) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function Kunjungan() {
  const [kunjungan, setKunjungan] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    API.get('/kunjungan')
      .then((res) => {
        if (cancelled) return
        const list = res.data?.data || []
        setKunjungan(list)
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          'Gagal memuat data kunjungan: ' +
            (err.response?.data?.message || err.message)
        )
        setKunjungan([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div style={styles.page}>
      <SharedSidebar />

      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Riwayat Kunjungan</h1>
            <p style={styles.subtitle}>
              Daftar kunjungan posyandu anak Anda yang telah tercatat
            </p>
          </div>
          <div style={styles.headerIcon}>
            <Icon name="calendar" size={36} color={colors.white} />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>Memuat riwayat kunjungan...</p>
          </div>
        ) : error ? (
          <div style={styles.errorCard}>
            <p style={styles.errorText}>{error}</p>
          </div>
        ) : kunjungan.length === 0 ? (
          <div style={styles.emptyCard}>
            <Icon name="calendar" size={48} color={colors.mutedBrown} />
            <h3 style={styles.emptyTitle}>Belum Ada Riwayat Kunjungan</h3>
            <p style={styles.emptyText}>
              Riwayat akan muncul setelah kader posyandu mencatat kunjungan
              anak Anda.
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {kunjungan.map((k) => (
              <KunjunganCard key={k.id} kunjungan={k} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function KunjunganCard({ kunjungan }) {
  const jenis = kunjungan.jenis_kunjungan || 'rutin'
  const color = jenisColor[jenis] || colors.mutedBrown

  return (
    <article style={styles.card}>
      <div style={{ ...styles.cardAccent, background: color }} />
      <div style={styles.cardContent}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.cardTitle}>
              {kunjungan.balita?.nama || 'Anak'}
            </h3>
            <p style={styles.cardDate}>
              {formatTanggal(kunjungan.tanggal_kunjungan)}
            </p>
          </div>
          <span style={{ ...styles.badge, background: color }}>
            {jenisLabel[jenis] || jenis}
          </span>
        </div>

        {kunjungan.catatan && (
          <div style={styles.notesBox}>
            <strong style={styles.notesLabel}>Catatan: </strong>
            <span style={styles.notesText}>{kunjungan.catatan}</span>
          </div>
        )}

        {kunjungan.admin?.nama && (
          <p style={styles.officer}>
            Dicatat oleh: <strong>{kunjungan.admin.nama}</strong>
          </p>
        )}
      </div>
    </article>
  )
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: colors.cream,
    fontFamily: "'Noto Sans', sans-serif",
  },
  main: {
    flex: 1,
    padding: '32px 40px',
    overflowY: 'auto',
  },
  header: {
    background: colors.green,
    borderRadius: 20,
    padding: '24px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: colors.white,
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
  },
  subtitle: {
    margin: '6px 0 0',
    fontSize: 14,
    opacity: 0.9,
  },
  headerIcon: {
    background: 'rgba(255,255,255,0.15)',
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  card: {
    background: colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
  },
  cardAccent: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: '18px 22px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  cardTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    color: colors.brown,
  },
  cardDate: {
    margin: '4px 0 0',
    fontSize: 13,
    color: colors.mutedBrown,
  },
  badge: {
    padding: '5px 12px',
    borderRadius: 999,
    color: colors.white,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  notesBox: {
    padding: '10px 14px',
    background: colors.cream,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 14,
    color: colors.brown,
  },
  notesLabel: {
    color: colors.green,
  },
  notesText: {
    color: colors.brown,
  },
  officer: {
    margin: '4px 0 0',
    fontSize: 12,
    color: colors.mutedBrown,
  },
  emptyCard: {
    background: colors.white,
    borderRadius: 16,
    padding: '60px 32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  emptyTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: colors.brown,
  },
  emptyText: {
    margin: 0,
    color: colors.mutedBrown,
    fontSize: 14,
    maxWidth: 400,
    lineHeight: 1.5,
  },
  errorCard: {
    background: '#FFE5E5',
    borderRadius: 12,
    padding: '20px 24px',
    border: '1px solid #FFB8B8',
  },
  errorText: {
    margin: 0,
    color: '#C0392B',
    fontSize: 14,
  },
}
