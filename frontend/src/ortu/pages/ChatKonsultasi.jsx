import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../api'
import { SharedSidebar, Icon } from '../components/SidebarLayout'

const colors = {
  green: '#4E724C',
  greenDark: '#3F633E',
  cream: '#FFF5F8',
  white: '#FFFFFF',
  brown: '#655040',
  mutedBrown: '#876D5D',
  tan: '#F2DFD1',
  softGreen: '#DFF2DD',
  red: '#E63946',
  border: '#F0E2DA',
}

const fontFamily = '"Segoe UI", Arial, sans-serif'

const quickQuestions = [
  'Anak saya susah makan, harus bagaimana?',
  'Berat badan anak saya normal atau belum?',
  'Apa menu makanan yang baik untuk anak saya?',
  'Kapan anak perlu dibawa ke puskesmas?',
]

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

function formatUsia(tanggalLahir) {
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
  const sisaBulan = bulan % 12

  if (sisaBulan === 0) return `${tahun} Tahun`
  return `${tahun} Tahun ${sisaBulan} Bulan`
}

function formatTanggalJam(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTanggalHistory(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getLatestGrowth(child) {
  return child?.pertumbuhan_terakhir || child?.riwayat_pertumbuhan?.[0] || null
}

function formatNumber(value, suffix = '') {
  if (value === undefined || value === null || value === '') return '-'

  const number = Number(value)
  if (Number.isNaN(number)) return '-'

  return `${number.toLocaleString('id-ID', { maximumFractionDigits: 1 })}${suffix}`
}

function makeShortTitle(text) {
  const clean = String(text || '').trim()
  if (!clean) return 'Konsultasi Baru'
  if (clean.length <= 42) return clean
  return `${clean.slice(0, 42)}...`
}

function getLatestSessionId(messages) {
  const sessionMap = new Map()

  messages.forEach((message) => {
    if (!message.session_id) return
    sessionMap.set(message.session_id, message.createdAt)
  })

  return Array.from(sessionMap.entries()).sort((a, b) => {
    return new Date(b[1] || 0) - new Date(a[1] || 0)
  })[0]?.[0] || ''
}

function MessageBubble({ item }) {
  const isUser = item.role === 'user'

  return (
    <div style={{ ...styles.messageRow, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && (
        <div style={styles.botAvatar}>
          <span style={styles.botAvatarText}>AI</span>
        </div>
      )}

      <div style={{ ...styles.bubble, ...(isUser ? styles.userBubble : styles.botBubble) }}>
        {!isUser && <div style={styles.assistantLabel}>Asisten Posyandu</div>}

        <div style={styles.bubbleText}>{item.pesan}</div>

        <div style={{ ...styles.timeText, textAlign: isUser ? 'right' : 'left' }}>
          {formatTanggalJam(item.createdAt)}
        </div>
      </div>
    </div>
  )
}

function ChildCard({ child, active, onClick }) {
  const growth = getLatestGrowth(child)

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.childCard,
        ...(active ? styles.childCardActive : {}),
      }}
    >
      <div style={styles.childAvatar}>
        {child?.jenis_kelamin === 'P' ? '👧' : '👦'}
      </div>

      <div style={styles.childInfo}>
        <strong style={styles.childName}>{child?.nama || 'Anak'}</strong>

        <span style={styles.childMeta}>
          {child?.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'} •{' '}
          {formatUsia(child?.tanggal_lahir)}
        </span>

        <span style={styles.childGrowth}>
          BB {formatNumber(growth?.berat_badan, ' kg')} • TB{' '}
          {formatNumber(growth?.tinggi_badan, ' cm')}
        </span>
      </div>
    </button>
  )
}

function HistoryItem({ item, active, onClick, onDelete }) {
  return (
    <div
      style={{
        ...styles.historyItem,
        ...(active ? styles.historyItemActive : {}),
      }}
    >
      <button
        type="button"
        onClick={onClick}
        style={styles.historyMainBtn}
      >
        <div
          style={{
            ...styles.historyIcon,
            ...(active ? styles.historyIconActive : {}),
          }}
        >
          <Icon name="chat" size={15} color={colors.green} />
        </div>

        <div style={styles.historyContent}>
          <strong style={styles.historyTitle}>{item.title}</strong>

          <span style={styles.historyMeta}>
            {formatTanggalHistory(item.updatedAt)} • {item.total} pesan
          </span>
        </div>
      </button>

      <button
        type="button"
        title="Hapus riwayat"
        onClick={(event) => {
          event.stopPropagation()
          onDelete(item.sessionId)
        }}
        style={{
          ...styles.historyDeleteBtn,
          ...(active ? styles.historyDeleteBtnActive : {}),
        }}
      >
        🗑
      </button>
    </div>
  )
}

export default function ChatKonsultasi() {
  const navigate = useNavigate()
  const { id } = useParams()
  const user = useMemo(() => getCurrentUser(), [])

  const [children, setChildren] = useState([])
  const [selectedChildId, setSelectedChildId] = useState(id || '')
  const [allMessages, setAllMessages] = useState([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [input, setInput] = useState('')
  const [loadingChildren, setLoadingChildren] = useState(true)
  const [loadingChat, setLoadingChat] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const chatEndRef = useRef(null)

  const selectedChild = useMemo(
    () => children.find((child) => String(child.id) === String(selectedChildId)),
    [children, selectedChildId]
  )

  const histories = useMemo(() => {
    const map = new Map()

    allMessages.forEach((message) => {
      const sessionId = message.session_id || `session-${message.id}`
      const existing = map.get(sessionId)

      if (!existing) {
        map.set(sessionId, {
          sessionId,
          title: message.role === 'user' ? makeShortTitle(message.pesan) : 'Konsultasi Baru',
          updatedAt: message.createdAt,
          total: 1,
        })
      } else {
        existing.total += 1
        existing.updatedAt = message.createdAt || existing.updatedAt

        if (existing.title === 'Konsultasi Baru' && message.role === 'user') {
          existing.title = makeShortTitle(message.pesan)
        }
      }
    })

    return Array.from(map.values()).sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0).getTime()
      const dateB = new Date(b.updatedAt || 0).getTime()
      return dateB - dateA
    })
  }, [allMessages])

  const currentMessages = useMemo(() => {
    if (!activeSessionId) return []

    return allMessages
      .filter((message) => String(message.session_id) === String(activeSessionId))
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
  }, [allMessages, activeSessionId])

  useEffect(() => {
    let cancelled = false

    setLoadingChildren(true)
    setError('')

    API.get('/balita?limit=100')
      .then((res) => {
        if (cancelled) return

        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : []

        setChildren(list)

        if (!selectedChildId && list.length > 0) {
          setSelectedChildId(String(list[0].id))
          navigate('/chat', { replace: true })
        }
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.response?.data?.message || 'Gagal memuat data anak.')
      })
      .finally(() => {
        if (!cancelled) setLoadingChildren(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedChildId) return

    let cancelled = false

    setLoadingChat(true)
    setError('')
    setActiveSessionId('')
    setAllMessages([])

    API.get(`/chat/${selectedChildId}`)
      .then((res) => {
        if (cancelled) return

        const list = Array.isArray(res.data?.data) ? res.data.data : []
        setAllMessages(list)
        setActiveSessionId(getLatestSessionId(list))
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.response?.data?.message || 'Gagal memuat riwayat chat.')
        setAllMessages([])
      })
      .finally(() => {
        if (!cancelled) setLoadingChat(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedChildId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages, sending])

  function handleSelectChild(childId) {
    setSelectedChildId(String(childId))
    setInput('')
    navigate('/chat', { replace: true })
  }

  function handleNewChat() {
    setActiveSessionId('')
    setInput('')
    setError('')
  }

  function handleSelectHistory(sessionId) {
    setActiveSessionId(sessionId)
    setInput('')
    setError('')
  }

  async function handleDeleteHistory(sessionId) {
    if (!selectedChildId || !sessionId) return

    const yakin = window.confirm('Hapus riwayat chat ini?')
    if (!yakin) return

    setError('')

    try {
      await API.delete(`/chat/${selectedChildId}/session/${encodeURIComponent(sessionId)}`)

      const remainingMessages = allMessages.filter(
        (message) => String(message.session_id) !== String(sessionId)
      )

      setAllMessages(remainingMessages)

      if (String(activeSessionId) === String(sessionId)) {
        setActiveSessionId(getLatestSessionId(remainingMessages))
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus riwayat chat.')
    }
  }

  async function handleSend(customText) {
    const text = String(customText || input).trim()

    if (!text || !selectedChildId || sending) return

    const now = new Date().toISOString()

    const tempUserMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      pesan: text,
      session_id: activeSessionId || `new-${Date.now()}`,
      createdAt: now,
    }

    setInput('')
    setSending(true)
    setError('')

    try {
      const res = await API.post(`/chat/${selectedChildId}`, {
        pesan: text,
        session_id: activeSessionId || undefined,
      })

      const data = res.data?.data || {}
      const nextSessionId = data.session_id || activeSessionId || tempUserMessage.session_id

      const userMessage = {
        ...(data.user_message || tempUserMessage),
        session_id: nextSessionId,
      }

      const assistantMessage = {
        id: data.assistant_message?.id || data.id || `assistant-${Date.now()}`,
        role: 'assistant',
        pesan: data.assistant_message?.pesan || data.pesan || 'Maaf, belum ada balasan dari sistem.',
        session_id: nextSessionId,
        createdAt: data.assistant_message?.createdAt || data.createdAt || new Date().toISOString(),
      }

      setActiveSessionId(nextSessionId)
      setAllMessages((prev) => [...prev, userMessage, assistantMessage])
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim pesan. Coba lagi nanti.')
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.page}>
      <SharedSidebar activePath="/chat" />

      <main style={styles.main}>
        <section style={styles.header}>
          <div>
            <p style={styles.headerBadge}>AI Assistant Posyandu</p>

            <h1 style={styles.title}>Chat & Konsultasi</h1>

            <p style={styles.subtitle}>
              Konsultasi seputar tumbuh kembang, gizi, imunisasi, dan perawatan anak.
            </p>
          </div>

          <div style={styles.userPill}>
            <div style={styles.userAvatar}>
              {(user?.nama || 'U').slice(0, 1).toUpperCase()}
            </div>

            <span>{user?.nama || 'Orang Tua'}</span>
          </div>
        </section>

        <section style={styles.contentGrid}>
          <aside style={styles.leftPanel}>
            <div style={styles.panelBox}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>Pilih Anak</h2>
                  <p style={styles.panelDesc}>
                    Jawaban AI akan menyesuaikan data anak yang dipilih.
                  </p>
                </div>
              </div>

              {loadingChildren ? (
                <div style={styles.stateBox}>Memuat data anak...</div>
              ) : children.length === 0 ? (
                <div style={styles.stateBox}>
                  Belum ada data anak. Hubungi kader posyandu untuk mendaftarkan anak.
                </div>
              ) : (
                <div style={styles.childList}>
                  {children.map((child) => (
                    <ChildCard
                      key={child.id}
                      child={child}
                      active={String(child.id) === String(selectedChildId)}
                      onClick={() => handleSelectChild(child.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={styles.panelBox}>
              <div style={styles.historyHeader}>
                <div>
                  <h2 style={styles.panelTitle}>Riwayat Chat</h2>
                  <p style={styles.panelDesc}>Percakapan tersimpan seperti AI assistant.</p>
                </div>

                <button
                  type="button"
                  style={styles.newChatBtn}
                  onClick={handleNewChat}
                  disabled={!selectedChildId}
                >
                  + Baru
                </button>
              </div>

              {loadingChat ? (
                <div style={styles.stateBox}>Memuat riwayat...</div>
              ) : histories.length === 0 ? (
                <div style={styles.emptyHistory}>
                  <strong>Belum ada riwayat</strong>
                  <span>Mulai chat pertama untuk menyimpan konsultasi.</span>
                </div>
              ) : (
                <div style={styles.historyList}>
                  {histories.map((history) => (
                    <HistoryItem
                      key={history.sessionId}
                      item={history}
                      active={String(history.sessionId) === String(activeSessionId)}
                      onClick={() => handleSelectHistory(history.sessionId)}
                      onDelete={handleDeleteHistory}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={styles.noticeCard}>
              <strong style={styles.noticeTitle}>Catatan penting</strong>

              <p style={styles.noticeText}>
                Chat ini hanya membantu memberi informasi awal. Jika anak mengalami
                demam tinggi, sesak, kejang, muntah terus-menerus, diare berat,
                atau sangat lemas, segera hubungi tenaga kesehatan.
              </p>
            </div>
          </aside>

          <section style={styles.chatPanel}>
            <div style={styles.chatHeader}>
              <div style={styles.chatHeaderLeft}>
                <div style={styles.chatAvatar}>
                  {selectedChild?.jenis_kelamin === 'P' ? '👧' : '👦'}
                </div>

                <div>
                  <h2 style={styles.chatTitle}>
                    {selectedChild ? `Konsultasi untuk ${selectedChild.nama}` : 'Pilih anak dulu'}
                  </h2>

                  <p style={styles.chatSubtitle}>
                    {selectedChild
                      ? `${formatUsia(selectedChild.tanggal_lahir)} • ${
                          selectedChild.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'
                        }`
                      : 'Riwayat chat akan muncul setelah anak dipilih'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                style={styles.smallBtn}
                onClick={() => navigate('/rekomendasi')}
              >
                Lihat Rekomendasi
              </button>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.chatBody}>
              {!selectedChildId ? (
                <div style={styles.emptyChat}>
                  <Icon name="chat" size={42} color={colors.mutedBrown} />

                  <h3 style={styles.emptyTitle}>Pilih anak untuk mulai konsultasi</h3>

                  <p style={styles.emptyText}>
                    Setelah memilih anak, Anda bisa bertanya ke asisten posyandu.
                  </p>
                </div>
              ) : loadingChat ? (
                <div style={styles.emptyChat}>
                  <p style={styles.emptyText}>Memuat riwayat chat...</p>
                </div>
              ) : currentMessages.length === 0 ? (
                <div style={styles.welcomeBox}>
                  <div style={styles.welcomeIcon}>💬</div>

                  <h3 style={styles.welcomeTitle}>
                    Halo, ada yang ingin dikonsultasikan?
                  </h3>

                  <p style={styles.welcomeText}>
                    Tulis pertanyaan sendiri atau pilih contoh pertanyaan di bawah.
                  </p>

                  <div style={styles.quickGrid}>
                    {quickQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        style={styles.quickBtn}
                        onClick={() => handleSend(question)}
                        disabled={sending}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {currentMessages.map((item) => (
                    <MessageBubble
                      key={item.id || `${item.role}-${item.createdAt}-${item.pesan}`}
                      item={item}
                    />
                  ))}

                  {sending && (
                    <div style={styles.typingRow}>
                      <div style={styles.botAvatar}>
                        <span style={styles.botAvatarText}>AI</span>
                      </div>

                      <div style={styles.typingBubble}>Asisten sedang mengetik...</div>
                    </div>
                  )}
                </>
              )}

              <div ref={chatEndRef} />
            </div>

            <div style={styles.inputArea}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedChildId
                    ? 'Tulis pertanyaan konsultasi di sini...'
                    : 'Pilih anak terlebih dahulu'
                }
                style={styles.textarea}
                disabled={!selectedChildId || sending}
                rows={1}
              />

              <button
                type="button"
                style={{
                  ...styles.sendBtn,
                  ...(!input.trim() || !selectedChildId || sending
                    ? styles.sendBtnDisabled
                    : {}),
                }}
                onClick={() => handleSend()}
                disabled={!input.trim() || !selectedChildId || sending}
              >
                Kirim
              </button>
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: colors.cream,
    fontFamily,
  },

  main: {
    flex: 1,
    padding: '28px 34px',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },

  header: {
    background: `linear-gradient(135deg, ${colors.green} 0%, ${colors.greenDark} 100%)`,
    borderRadius: 22,
    padding: '24px 30px',
    color: colors.white,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 18,
    marginBottom: 22,
    boxShadow: '0 12px 28px rgba(63, 99, 62, 0.22)',
  },

  headerBadge: {
    display: 'inline-flex',
    margin: '0 0 8px',
    padding: '5px 12px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.18)',
    fontSize: 12,
    fontWeight: 500,
  },

  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 600,
    letterSpacing: '-0.2px',
  },

  subtitle: {
    margin: '7px 0 0',
    fontSize: 14,
    fontWeight: 400,
    opacity: 0.92,
    lineHeight: 1.5,
  },

  userPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '8px 12px',
    borderRadius: 999,
    background: '#F7E5D8',
    color: colors.brown,
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },

  userAvatar: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: colors.green,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
  },

  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '330px minmax(0, 1fr)',
    gap: 18,
    alignItems: 'stretch',
  },

  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },

  panelBox: {
    background: colors.white,
    borderRadius: 18,
    padding: 16,
    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
    boxSizing: 'border-box',
  },

  panelHeader: {
    paddingBottom: 13,
    marginBottom: 13,
    borderBottom: `1px solid ${colors.border}`,
  },

  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 13,
    marginBottom: 13,
    borderBottom: `1px solid ${colors.border}`,
  },

  panelTitle: {
    margin: 0,
    color: colors.brown,
    fontSize: 17,
    fontWeight: 650,
  },

  panelDesc: {
    margin: '5px 0 0',
    color: colors.mutedBrown,
    fontSize: 12,
    fontWeight: 450,
    lineHeight: 1.5,
  },

  childList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },

  childCard: {
    width: '100%',
    border: `1px solid ${colors.border}`,
    background: '#FFFBFA',
    borderRadius: 14,
    padding: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily,
    transition: '0.18s ease',
  },

  childCardActive: {
    borderColor: colors.green,
    background: colors.softGreen,
    boxShadow: '0 0 0 3px rgba(78, 114, 76, 0.10)',
  },

  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: colors.tan,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
  },

  childInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },

  childName: {
    color: colors.brown,
    fontSize: 13.5,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  childMeta: {
    color: colors.mutedBrown,
    fontSize: 11,
    fontWeight: 400,
  },

  childGrowth: {
    color: colors.green,
    fontSize: 10.5,
    fontWeight: 500,
  },

  newChatBtn: {
    border: 'none',
    borderRadius: 999,
    background: colors.green,
    color: colors.white,
    padding: '8px 11px',
    fontFamily,
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 240,
    overflowY: 'auto',
    paddingRight: 2,
  },

  historyItem: {
    width: '100%',
    border: `1px solid ${colors.border}`,
    background: '#FFFBFA',
    borderRadius: 13,
    padding: 8,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 6,
    color: colors.brown,
  },

  historyItemActive: {
    background: colors.green,
    borderColor: colors.green,
    color: colors.white,
  },

  historyMainBtn: {
    border: 'none',
    background: 'transparent',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily,
    color: 'inherit',
    minWidth: 0,
  },

  historyIcon: {
    width: 31,
    height: 31,
    borderRadius: '50%',
    background: colors.softGreen,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  historyIconActive: {
    background: colors.white,
  },

  historyContent: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },

  historyTitle: {
    color: 'inherit',
    fontSize: 12.2,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  historyMeta: {
    color: 'inherit',
    opacity: 0.72,
    fontSize: 10.6,
    fontWeight: 400,
  },

  historyDeleteBtn: {
    width: 30,
    height: 30,
    border: 'none',
    borderRadius: 9,
    background: '#FFE5E5',
    color: '#C62828',
    cursor: 'pointer',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyDeleteBtnActive: {
    background: 'rgba(255,255,255,0.22)',
    color: colors.white,
  },

  emptyHistory: {
    padding: 13,
    borderRadius: 13,
    background: '#FFFBFA',
    border: `1px dashed ${colors.border}`,
    color: colors.mutedBrown,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 12,
    lineHeight: 1.4,
  },

  noticeCard: {
    padding: 14,
    borderRadius: 16,
    background: '#FFF8E8',
    border: '1px solid #F3DFC7',
  },

  noticeTitle: {
    display: 'block',
    marginBottom: 5,
    color: colors.brown,
    fontSize: 12.5,
    fontWeight: 800,
  },

  noticeText: {
    margin: 0,
    color: colors.mutedBrown,
    fontSize: 11.5,
    fontWeight: 400,
    lineHeight: 1.5,
  },

  stateBox: {
    padding: 14,
    borderRadius: 12,
    background: '#FFFBFA',
    color: colors.mutedBrown,
    fontSize: 12.5,
    lineHeight: 1.5,
    fontWeight: 400,
  },

  chatPanel: {
    background: colors.white,
    borderRadius: 18,
    minHeight: 660,
    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  chatHeader: {
    padding: '16px 18px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    background: '#FFFBFA',
  },

  chatHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },

  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: colors.softGreen,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    flexShrink: 0,
  },

  chatTitle: {
    margin: 0,
    color: colors.brown,
    fontSize: 17,
    fontWeight: 700,
  },

  chatSubtitle: {
    margin: '4px 0 0',
    color: colors.mutedBrown,
    fontSize: 12,
    fontWeight: 400,
  },

  smallBtn: {
    border: 'none',
    borderRadius: 999,
    background: colors.softGreen,
    color: colors.greenDark,
    padding: '9px 13px',
    fontFamily,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  errorBox: {
    margin: '12px 18px 0',
    padding: '10px 12px',
    borderRadius: 10,
    background: '#FEE2E2',
    color: '#991B1B',
    fontSize: 12,
    fontWeight: 500,
  },

  chatBody: {
    flex: 1,
    padding: 22,
    overflowY: 'auto',
    background: 'linear-gradient(180deg, #FFF8FA 0%, #FFFDFB 100%)',
  },

  emptyChat: {
    minHeight: 390,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: colors.mutedBrown,
  },

  emptyTitle: {
    margin: '12px 0 4px',
    color: colors.brown,
    fontSize: 17,
    fontWeight: 600,
  },

  emptyText: {
    margin: 0,
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.5,
  },

  welcomeBox: {
    maxWidth: 620,
    margin: '74px auto 0',
    textAlign: 'center',
  },

  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    margin: '0 auto 14px',
    background: colors.softGreen,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 30,
  },

  welcomeTitle: {
    margin: 0,
    color: colors.brown,
    fontSize: 21,
    fontWeight: 700,
  },

  welcomeText: {
    margin: '7px 0 18px',
    color: colors.mutedBrown,
    fontSize: 13,
    fontWeight: 450,
    lineHeight: 1.5,
  },

  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },

  quickBtn: {
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    background: colors.white,
    color: colors.brown,
    padding: '13px 14px',
    fontFamily,
    fontSize: 12.5,
    fontWeight: 450,
    cursor: 'pointer',
    textAlign: 'left',
    lineHeight: 1.45,
  },

  messageRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 14,
    alignItems: 'flex-end',
  },

  botAvatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: colors.softGreen,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  botAvatarText: {
    color: colors.green,
    fontSize: 11,
    fontWeight: 600,
  },

  bubble: {
    maxWidth: '74%',
    borderRadius: 17,
    padding: '11px 13px 8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },

  userBubble: {
    background: colors.green,
    color: colors.white,
    borderBottomRightRadius: 5,
  },

  botBubble: {
    background: colors.white,
    color: colors.brown,
    border: `1px solid ${colors.border}`,
    borderBottomLeftRadius: 5,
  },

  assistantLabel: {
    marginBottom: 5,
    color: colors.green,
    fontSize: 11,
    fontWeight: 600,
  },

  bubbleText: {
    fontSize: 14,
    lineHeight: 1.65,
    fontWeight: 400,
    whiteSpace: 'pre-wrap',
  },

  timeText: {
    marginTop: 6,
    fontSize: 10,
    opacity: 0.65,
    fontWeight: 400,
  },

  typingRow: {
    display: 'flex',
    gap: 9,
    marginBottom: 12,
    alignItems: 'center',
  },

  typingBubble: {
    background: colors.white,
    border: `1px solid ${colors.border}`,
    borderRadius: 999,
    padding: '9px 13px',
    color: colors.mutedBrown,
    fontSize: 12,
    fontWeight: 400,
  },

  inputArea: {
    padding: 14,
    borderTop: `1px solid ${colors.border}`,
    background: colors.white,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 10,
  },

  textarea: {
    width: '100%',
    minHeight: 44,
    maxHeight: 120,
    resize: 'vertical',
    border: '1px solid #E8D7C9',
    borderRadius: 14,
    outline: 'none',
    padding: '12px 13px',
    boxSizing: 'border-box',
    fontFamily,
    fontSize: 14,
    fontWeight: 400,
    color: colors.brown,
    background: '#FFFBFA',
  },

  sendBtn: {
    border: 'none',
    borderRadius: 14,
    background: colors.green,
    color: colors.white,
    padding: '0 22px',
    minWidth: 86,
    fontFamily,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },

  sendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}