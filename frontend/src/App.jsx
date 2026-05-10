import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PilihAnak from './pages/PilihAnak'
import TumbuhKembang from './pages/TumbuhKembang'
import PilihAnakImunisasi from './pages/PilihAnakImunisasi'
import Imunisasi from './pages/Imunisasi'
import Jadwal from './pages/Jadwal'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/tumbuh-kembang" element={<PrivateRoute><PilihAnak /></PrivateRoute>} />
      <Route path="/tumbuh-kembang/:id" element={<PrivateRoute><TumbuhKembang /></PrivateRoute>} />
      <Route path="/imunisasi" element={<PrivateRoute><PilihAnakImunisasi /></PrivateRoute>} />
      <Route path="/imunisasi/:id" element={<PrivateRoute><Imunisasi /></PrivateRoute>} />
      <Route path="/jadwal" element={<PrivateRoute><Jadwal /></PrivateRoute>} />
    </Routes>
  )
}

export default App