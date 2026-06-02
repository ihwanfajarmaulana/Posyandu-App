import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profil from './pages/Profil'
import PilihAnak from './pages/PilihAnak'
import TumbuhKembang from './pages/TumbuhKembang'
import PilihAnakImunisasi from './pages/PilihAnakImunisasi'
import Imunisasi from './pages/Imunisasi'
import Jadwal from './pages/Jadwal'
import RiwayatKunjungan from './pages/RiwayatKunjungan'
import PilihAnakKunjungan from './pages/PilihAnakKunjungan'
import CatatKunjunganBaru from './pages/CatatKunjunganBaru'
import RekomendasiBalita from './pages/RekomendasiBalita'
import PenangananRekomendasi from './pages/PenangananRekomendasi'
import CatatPenanganan from './pages/CatatPenanganan'
import DaftarBalita from './pages/DaftarBalita'
import TambahBalita from './pages/TambahBalita'
import RekapPenimbangan from './pages/RekapPenimbangan'
import DetailRekapPenimbangan from './pages/DetailRekapPenimbangan'
import LaporanPuskesmas from './pages/LaporanPuskesmas'
import DaftarLaporan from './pages/DaftarLaporan'
import AppSidebar from './components/AppSidebar'
import Landing from './pages/Landing'
import MonitoringStatusBalita from './pages/MonitoringStatusBalita'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

const DefaultRedirect = () => {
  const token = localStorage.getItem('token')
  return <Navigate to={token ? '/dashboard' : '/'} replace />
}

const ProtectedPage = ({ children }) => (
  <PrivateRoute>
    <div className="app-shell">
      <AppSidebar />
      <main className="app-shell-content">
        {children}
      </main>
    </div>
  </PrivateRoute>
)

function App() {
  return (
    <Routes>
      {/* HALAMAN AWAL USER UMUM */}
      <Route path="/" element={<Landing />} />

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* DASHBOARD PEGAWAI TANPA SIDEBAR */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

      {/* HALAMAN FITUR DENGAN SIDEBAR */}
      <Route path="/profil" element={<ProtectedPage><Profil /></ProtectedPage>} />

      <Route path="/tumbuh-kembang" element={<ProtectedPage><PilihAnak /></ProtectedPage>} />
      <Route path="/tumbuh-kembang/:id" element={<ProtectedPage><TumbuhKembang /></ProtectedPage>} />

      <Route path="/imunisasi" element={<ProtectedPage><PilihAnakImunisasi /></ProtectedPage>} />
      <Route path="/imunisasi/:id" element={<ProtectedPage><Imunisasi /></ProtectedPage>} />

      <Route path="/jadwal" element={<ProtectedPage><Jadwal /></ProtectedPage>} />

      <Route path="/riwayatkunjungan" element={<ProtectedPage><PilihAnakKunjungan /></ProtectedPage>} />
      <Route path="/riwayatkunjungan/:id" element={<ProtectedPage><RiwayatKunjungan /></ProtectedPage>} />

      <Route path="/catatkunjungan" element={<ProtectedPage><CatatKunjunganBaru /></ProtectedPage>} />
      <Route path="/catatkunjungan/:id" element={<ProtectedPage><CatatKunjunganBaru /></ProtectedPage>} />

      <Route path="/kunjungan" element={<Navigate to="/riwayatkunjungan" replace />} />
      <Route path="/riwayat-kunjungan" element={<Navigate to="/riwayatkunjungan" replace />} />
      <Route path="/pilih-anak-kunjungan" element={<Navigate to="/riwayatkunjungan" replace />} />

      <Route path="/rekomendasi-balita" element={<ProtectedPage><RekomendasiBalita /></ProtectedPage>} />
      <Route path="/penanganan-rekomendasi" element={<ProtectedPage><PenangananRekomendasi /></ProtectedPage>} />
      <Route path="/penanganan-rekomendasi/:id" element={<ProtectedPage><PenangananRekomendasi /></ProtectedPage>} />
      <Route path="/catat-penanganan/:id" element={<ProtectedPage><CatatPenanganan /></ProtectedPage>} />
      <Route path="/penanganan-rekomendasi/:id/catat" element={<ProtectedPage><CatatPenanganan /></ProtectedPage>} />

      <Route path="/daftar-balita" element={<ProtectedPage><DaftarBalita /></ProtectedPage>} />
      <Route path="/tambah-balita" element={<ProtectedPage><TambahBalita /></ProtectedPage>} />
      <Route path="/tambah-balita/:id" element={<ProtectedPage><TambahBalita /></ProtectedPage>} />

      <Route path="/monitoring-status-balita" element={<ProtectedPage><MonitoringStatusBalita /></ProtectedPage>} />

      <Route path="/rekap-penimbangan" element={<ProtectedPage><RekapPenimbangan /></ProtectedPage>} />
      <Route path="/rekap-penimbangan/:id" element={<ProtectedPage><DetailRekapPenimbangan /></ProtectedPage>} />

      <Route path="/laporan-puskesmas/buat" element={<ProtectedPage><LaporanPuskesmas /></ProtectedPage>} />
      <Route path="/laporan-puskesmas/daftar" element={<ProtectedPage><DaftarLaporan /></ProtectedPage>} />

      {/* Kalau route tidak ditemukan */}
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  )
}

export default App