import PilihBalitaPage from '../components/PilihBalitaPage'

/* Pilih Balita for the RIWAYAT PERTUMBUHAN flow.
   Picking a child opens /tumbuh-kembang/:id (their growth history). */
export default function PilihAnak() {
  return (
    <PilihBalitaPage
      title="Pilih Balita"
      subtitle="Cari dan pilih balita untuk melihat riwayat tumbuh kembang balita"
      basePath="/tumbuh-kembang"
      activePath="/tumbuh-kembang"
      backTo="/dashboard"
    />
  )
}
