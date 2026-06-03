import PilihBalitaPage from '../components/PilihBalitaPage'

/* Pilih Balita for the REKOMENDASI flow — same shared design as the Riwayat
   picker. Picking a child opens /rekomendasi/:id (their recommendations). */
export default function PilihAnakRekomendasi() {
  return (
    <PilihBalitaPage
      title="Pilih Balita"
      subtitle="Cari dan pilih balita untuk melihat rekomendasi tumbuh kembang balita"
      basePath="/rekomendasi"
      activePath="/rekomendasi"
      backTo="/dashboard"
    />
  )
}
