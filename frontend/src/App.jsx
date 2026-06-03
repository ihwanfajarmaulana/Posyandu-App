import { Routes, Route, Navigate } from 'react-router-dom'

import './ortu/index.css'

import Login from './ortu/pages/Login'
import Landing from './pages/Landing'

// POV PEGAWAI / ADMIN
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
import MonitoringStatusBalita from './pages/MonitoringStatusBalita'
import AppSidebar from './components/AppSidebar'

// POV ORANG TUA
import OrtuHome from './ortu/pages/Home'
import OrtuDashboard from './ortu/pages/Dashboard'
import OrtuPilihAnak from './ortu/pages/PilihAnak'
import OrtuTumbuhKembang from './ortu/pages/TumbuhKembang'
import OrtuPilihAnakImunisasi from './ortu/pages/PilihAnakImunisasi'
import OrtuImunisasi from './ortu/pages/Imunisasi'
import OrtuJadwal from './ortu/pages/Jadwal'
import OrtuNotifikasi from './ortu/pages/Notifikasi'
import OrtuKunjungan from './ortu/pages/Kunjungan'
import OrtuProfil from './ortu/pages/Profil'
import OrtuPengaturan from './ortu/pages/Pengaturan'
import OrtuRekomendasi from './ortu/pages/Rekomendasi'
import OrtuPilihAnakRekomendasi from './ortu/pages/PilihAnakRekomendasi'
import OrtuChatKonsultasi from './ortu/pages/ChatKonsultasi'

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

const getRole = () => {
  const user = getUser()
  return String(user?.role || '').toLowerCase()
}

const isPegawaiRole = (role) => ['admin', 'pegawai'].includes(String(role || '').toLowerCase())
const isOrtuRole = (role) => String(role || '').toLowerCase() === 'orang_tua'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

const LoginRoute = () => {
  const token = localStorage.getItem('token')
  return token ? <Navigate to="/dashboard" replace /> : <Login />
}

const DefaultRedirect = () => {
  const token = localStorage.getItem('token')
  return <Navigate to={token ? '/dashboard' : '/'} replace />
}

const PegawaiShell = ({ children }) => (
  <div className="app-shell">
    <AppSidebar />
    <main className="app-shell-content">{children}</main>
  </div>
)

// Pages that already include their OWN sidebar (teammate's foundation) opt-out
// of the global PegawaiShell by passing noShell — fixes the "two sidebars" bug.
const PegawaiPage = ({ children, noShell = false }) => {
  const role = getRole()

  return (
    <PrivateRoute>
      {isPegawaiRole(role) ? (
        noShell ? children : <PegawaiShell>{children}</PegawaiShell>
      ) : (
        <Navigate to="/dashboard" replace />
      )}
    </PrivateRoute>
  )
}

const OrtuPage = ({ children }) => {
  const role = getRole()

  return (
    <PrivateRoute>
      {isOrtuRole(role) ? children : <Navigate to="/dashboard" replace />}
    </PrivateRoute>
  )
}

const RoleBasedPage = ({ pegawai, ortu, pegawaiSidebar = true }) => {
  const role = getRole()

  return (
    <PrivateRoute>
      {isPegawaiRole(role)
        ? pegawaiSidebar
          ? <PegawaiShell>{pegawai}</PegawaiShell>
          : pegawai
        : isOrtuRole(role)
          ? ortu
          : <Navigate to="/login" replace />}
    </PrivateRoute>
  )
}

function App() {
  return (
    <Routes>
      {/* HALAMAN PUBLIC */}
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<OrtuHome />} />
      <Route path="/login" element={<LoginRoute />} />

      {/* DASHBOARD SESUAI ROLE */}
      <Route
        path="/dashboard"
        element={
          <RoleBasedPage
            pegawai={<Dashboard />}
            ortu={<OrtuDashboard />}
            pegawaiSidebar={false}
          />
        }
      />

      {/* ROUTE YANG DIPAKAI OLEH DUA POV */}
      <Route
        path="/profil"
        element={<RoleBasedPage pegawai={<Profil />} ortu={<OrtuProfil />} />}
      />

      <Route
        path="/tumbuh-kembang"
        element={<RoleBasedPage pegawai={<PilihAnak />} ortu={<OrtuPilihAnak />} />}
      />
      <Route
        path="/tumbuh-kembang/:id"
        element={<RoleBasedPage pegawai={<TumbuhKembang />} ortu={<OrtuTumbuhKembang />} />}
      />

      <Route
        path="/imunisasi"
        element={<RoleBasedPage pegawai={<PilihAnakImunisasi />} ortu={<OrtuPilihAnakImunisasi />} />}
      />
      <Route
        path="/imunisasi/:id"
        element={<RoleBasedPage pegawai={<Imunisasi />} ortu={<OrtuImunisasi />} />}
      />

      <Route
        path="/jadwal"
        element={<RoleBasedPage pegawai={<Jadwal />} ortu={<OrtuJadwal />} />}
      />

      <Route
        path="/kunjungan"
        element={
          <RoleBasedPage
            pegawai={<Navigate to="/riwayatkunjungan" replace />}
            ortu={<OrtuKunjungan />}
            pegawaiSidebar={false}
          />
        }
      />

      {/* ROUTE KHUSUS ORANG TUA */}
      <Route path="/notifikasi" element={<OrtuPage><OrtuNotifikasi /></OrtuPage>} />
      <Route path="/pengaturan" element={<OrtuPage><OrtuPengaturan /></OrtuPage>} />
      <Route path="/rekomendasi" element={<OrtuPage><OrtuPilihAnakRekomendasi /></OrtuPage>} />
      <Route path="/rekomendasi/:id" element={<OrtuPage><OrtuRekomendasi /></OrtuPage>} />
      <Route path="/chat" element={<OrtuPage><OrtuChatKonsultasi /></OrtuPage>} />
      <Route path="/chat/:id" element={<OrtuPage><OrtuChatKonsultasi /></OrtuPage>} />

      {/* ROUTE KHUSUS PEGAWAI / ADMIN */}
      <Route path="/riwayatkunjungan" element={<PegawaiPage><PilihAnakKunjungan /></PegawaiPage>} />
      <Route path="/riwayatkunjungan/:id" element={<PegawaiPage><RiwayatKunjungan /></PegawaiPage>} />

      <Route path="/catatkunjungan" element={<PegawaiPage><CatatKunjunganBaru /></PegawaiPage>} />
      <Route path="/catatkunjungan/:id" element={<PegawaiPage><CatatKunjunganBaru /></PegawaiPage>} />

      <Route path="/riwayat-kunjungan" element={<Navigate to="/riwayatkunjungan" replace />} />
      <Route path="/pilih-anak-kunjungan" element={<Navigate to="/riwayatkunjungan" replace />} />

      <Route path="/rekomendasi-balita" element={<PegawaiPage><RekomendasiBalita /></PegawaiPage>} />
      <Route path="/penanganan-rekomendasi" element={<PegawaiPage><PenangananRekomendasi /></PegawaiPage>} />
      <Route path="/penanganan-rekomendasi/:id" element={<PegawaiPage><PenangananRekomendasi /></PegawaiPage>} />
      <Route path="/catat-penanganan/:id" element={<PegawaiPage><CatatPenanganan /></PegawaiPage>} />
      <Route path="/penanganan-rekomendasi/:id/catat" element={<PegawaiPage><CatatPenanganan /></PegawaiPage>} />

      <Route path="/daftar-balita" element={<PegawaiPage><DaftarBalita /></PegawaiPage>} />
      <Route path="/tambah-balita" element={<PegawaiPage><TambahBalita /></PegawaiPage>} />
      <Route path="/tambah-balita/:id" element={<PegawaiPage><TambahBalita /></PegawaiPage>} />

      <Route path="/monitoring-status-balita" element={<PegawaiPage><MonitoringStatusBalita /></PegawaiPage>} />

      <Route path="/rekap-penimbangan" element={<PegawaiPage><RekapPenimbangan /></PegawaiPage>} />
      <Route path="/rekap-penimbangan/:id" element={<PegawaiPage><DetailRekapPenimbangan /></PegawaiPage>} />

      <Route path="/laporan-puskesmas/buat" element={<PegawaiPage><LaporanPuskesmas /></PegawaiPage>} />
      <Route path="/laporan-puskesmas/daftar" element={<PegawaiPage><DaftarLaporan /></PegawaiPage>} />

      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  )
}

export default App
