import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import PilihAnak from './pages/PilihAnak'
import TumbuhKembang from './pages/TumbuhKembang'
import PilihAnakImunisasi from './pages/PilihAnakImunisasi'
import Imunisasi from './pages/Imunisasi'
import Jadwal from './pages/Jadwal'
import Notifikasi from './pages/Notifikasi'
import Kunjungan from './pages/Kunjungan'
import Profil from './pages/Profil'
import Pengaturan from './pages/Pengaturan'
import Rekomendasi from './pages/Rekomendasi'
import PilihAnakRekomendasi from './pages/PilihAnakRekomendasi'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Routes>
      {/* "/" → Home is now the public landing page. Login is reached
          via the "Masuk / Daftar" button in the top-right of Home. */}
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/tumbuh-kembang" element={<PrivateRoute><PilihAnak /></PrivateRoute>} />
      <Route path="/tumbuh-kembang/:id" element={<PrivateRoute><TumbuhKembang /></PrivateRoute>} />
      <Route path="/imunisasi" element={<PrivateRoute><PilihAnakImunisasi /></PrivateRoute>} />
      <Route path="/imunisasi/:id" element={<PrivateRoute><Imunisasi /></PrivateRoute>} />
      <Route path="/jadwal" element={<PrivateRoute><Jadwal /></PrivateRoute>} />
      <Route path="/notifikasi" element={<PrivateRoute><Notifikasi /></PrivateRoute>} />
      <Route path="/kunjungan" element={<PrivateRoute><Kunjungan /></PrivateRoute>} />
      <Route path="/profil" element={<PrivateRoute><Profil /></PrivateRoute>} />
      <Route path="/pengaturan" element={<PrivateRoute><Pengaturan /></PrivateRoute>} />
      <Route path="/rekomendasi" element={<PrivateRoute><PilihAnakRekomendasi /></PrivateRoute>} />
      <Route path="/rekomendasi/:id" element={<PrivateRoute><Rekomendasi /></PrivateRoute>} />
    </Routes>
  )
}

export default App
