import { useEffect, useState } from 'react'
import API from './api'

function App() {
  const [status, setStatus] = useState('Mengecek koneksi ke backend...')
  const [warna, setWarna] = useState('orange')

  useEffect(() => {
    fetch('http://localhost:3000/health')
      .then(res => res.json())
      .then(data => {
        setStatus('✅ Backend terhubung! Server OK')
        setWarna('green')
      })
      .catch(() => {
        setStatus('❌ Backend tidak bisa diakses. Pastikan npm run dev sudah jalan di folder backend')
        setWarna('red')
      })
  }, [])

  return (
    <div style={{ padding: 40, fontFamily: 'Arial' }}>
      <h1>🏥 Posyandu App</h1>
      <p style={{ color: warna, fontSize: 18 }}>{status}</p>
    </div>
  )
}

export default App