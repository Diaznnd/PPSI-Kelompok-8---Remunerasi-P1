import type { ReactElement } from "react"
import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom"
import AppShell from "@/layouts/AppShell"
import PegawaiShell from "@/layouts/PegawaiShell"
import BendaharaShell from "@/layouts/BendaharaShell"
import PjUnitShell from "@/layouts/PjUnitShell"
import VerifikatorShell from "@/layouts/VerifikatorShell"
import UptRemunerasiShell from "@/layouts/UptRemunerasiShell"
import { RoleGuard } from "./RoleGuard"
import LoginPage from "@/pages/login/LoginPage"
import Dashboard from "@/pages/Dashboard"
import ExampleRBACPage from "@/pages/ExampleRBACPage"
import UnauthorizedPage from "@/pages/UnauthorizedPage"
import SystemErrorPage from "@/pages/SystemErrorPage"
import { ProtectedRoute } from "@/components/rbac"
import BerandaPage from "@/pages/pegawai/BerandaPage"
import SlipListPage from "@/pages/pegawai/SlipListPage"
import SlipDetailPage from "@/pages/pegawai/SlipDetailPage"
import PengaduanListPage from "@/pages/pegawai/PengaduanListPage"
import PengaduanBaruPage from "@/pages/pegawai/PengaduanBaruPage"
import PengaduanDetailPage from "@/pages/pegawai/PengaduanDetailPage"
import BerandaBendaharaPage from "@/pages/bendahara/BerandaBendaharaPage"
import PersiapanPerhitunganPage from "@/pages/bendahara/PersiapanPerhitunganPage"
import HasilPratinjauPage from "@/pages/bendahara/HasilPratinjauPage"
import KonfirmasiPengajuanPage from "@/pages/bendahara/KonfirmasiPengajuanPage"
import PengajuanBerhasilPage from "@/pages/bendahara/PengajuanBerhasilPage"
import StatusPengajuanPage from "@/pages/bendahara/StatusPengajuanPage"
import AmprahListPage from "@/pages/bendahara/AmprahListPage"
import AmprahDetailPage from "@/pages/bendahara/AmprahDetailPage"
import RekapitulasiPage from "@/pages/bendahara/RekapitulasiPage"
import BerandaPjUnitPage from "@/pages/pj-unit/BerandaPjUnitPage"
import DataPegawaiPage from "@/pages/pj-unit/DataPegawaiPage"
import StatusPengajuanUnitPage from "@/pages/pj-unit/StatusPengajuanUnitPage"
import BerandaVerifikatorPage from "@/pages/verifikator/BerandaVerifikatorPage"
import VerifikasiPengajuanListPage from "@/pages/verifikator/VerifikasiPengajuanListPage"
import PemeriksaanPengajuanPage from "@/pages/verifikator/PemeriksaanPengajuanPage"
import PerubahanJabatanListPage from "@/pages/verifikator/PerubahanJabatanListPage"
import DetailUsulanJabatanPage from "@/pages/verifikator/DetailUsulanJabatanPage"
import PantauStatusPage from "@/pages/verifikator/PantauStatusPage"
import JejakAuditPage from "@/pages/verifikator/JejakAuditPage"
import KepegawaianShell from "@/layouts/KepegawaianShell"
import BerandaKepegawaianPage from "@/pages/kepegawaian/BerandaKepegawaianPage"
import PegawaiKepegawaianPage from "@/pages/kepegawaian/PegawaiKepegawaianPage"
import UsulanJabatanListPage from "@/pages/kepegawaian/UsulanJabatanListPage"
import BuatUsulanPage from "@/pages/kepegawaian/BuatUsulanPage"
import DetailUsulanPage from "@/pages/kepegawaian/DetailUsulanPage"
import PresensiCutiPage from "@/pages/kepegawaian/PresensiCutiPage"
import HukumanDisiplinPage from "@/pages/kepegawaian/HukumanDisiplinPage"
import PengaduanKepegawaianPage from "@/pages/kepegawaian/PengaduanKepegawaianPage"
import TanggapiPengaduanPage from "@/pages/kepegawaian/TanggapiPengaduanPage"
import type { Peran } from "@/lib/peran"
import BerandaUptRemunerasiPage from "@/pages/upt-remunerasi/BerandaPage"
import HitungPajakPage from "@/pages/upt-remunerasi/HitungPajakPage"
import HitungPajakDetailPage from "@/pages/upt-remunerasi/HitungPajakDetailPage"
import AmprahPage from "@/pages/upt-remunerasi/AmprahPage"
import UptAmprahDetailPage from "@/pages/upt-remunerasi/AmprahDetailPage"
import UptSlipP1Page from "@/pages/upt-remunerasi/SlipP1Page"
import UptSlipDetailPage from "@/pages/upt-remunerasi/SlipDetailPage"
import RekapitulasiUPTPage from "@/pages/upt-remunerasi/RekapitulasiPage"
import PantauStatusUPTPage from "@/pages/upt-remunerasi/PantauStatusPage"
import PengaduanEskalasiPage from "@/pages/upt-remunerasi/PengaduanEskalasiPage"
import PenetapanJabatanPage from "@/pages/upt-remunerasi/PenetapanJabatanPage"
import MasterGradePage from "@/pages/upt-remunerasi/MasterGradePage"
import ParameterRemunerasiPage from "@/pages/upt-remunerasi/ParameterRemunerasiPage"
import UnitKerjaPage from "@/pages/upt-remunerasi/UnitKerjaPage"
import AkunHakAksesPage from "@/pages/upt-remunerasi/AkunHakAksesPage"
import AkunHakAksesDetailPage from "@/pages/upt-remunerasi/AkunHakAksesDetailPage"
import JejakAuditUPTPage from "@/pages/upt-remunerasi/JejakAuditPage"
import PeriodePembayaranPage from "@/pages/upt-remunerasi/PeriodePembayaranPage"
import DokumenTemplatePage from "@/pages/upt-remunerasi/DokumenTemplatePage"
import DataPegawaiUPTPage from "@/pages/upt-remunerasi/DataPegawaiPage"
import AkunSayaPage from "@/pages/upt-remunerasi/AkunSayaPage"
import PenetapanJabatanDetailPage from "@/pages/upt-remunerasi/PenetapanJabatanDetailPage"
import UptPengaduanDetailPage from "@/pages/upt-remunerasi/PengaduanDetailPage"
import KoreksiSusulanPage from "@/pages/upt-remunerasi/KoreksiSusulanPage"
import MonitoringStatusPage from "@/pages/upt-remunerasi/MonitoringStatusPage"
import LaporanPage from "@/pages/upt-remunerasi/LaporanPage"
import EksporDataPage from "@/pages/upt-remunerasi/EksporDataPage"
import ProfilUPTPage from "@/pages/upt-remunerasi/ProfilUPTPage"
import PengaturanSistemPage from "@/pages/upt-remunerasi/PengaturanSistemPage"
import NotifikasiPage from "@/pages/upt-remunerasi/NotifikasiPage"
import BerandaSayaPage from "@/pages/upt-remunerasi/saya/BerandaSayaPage"
import SlipSayaPage from "@/pages/upt-remunerasi/saya/SlipSayaPage"
import SlipSayaDetailPage from "@/pages/upt-remunerasi/saya/SlipSayaDetailPage"
import PengaduanSayaPage from "@/pages/upt-remunerasi/saya/PengaduanSayaPage"
import PengaduanSayaBaruPage from "@/pages/upt-remunerasi/saya/PengaduanSayaBaruPage"
import PengaduanSayaDetailPage from "@/pages/upt-remunerasi/saya/PengaduanSayaDetailPage"
import ApprovalPresensiPage from "@/pages/pj-unit/ApprovalPresensiPage"

type Opsi = { shell?: ReactElement; dashboard?: ReactElement; halaman?: RouteObject[] }

const grup = (path: string, peran: Peran, { shell = <AppShell />, dashboard = <Dashboard />, halaman = [] }: Opsi = {}) => ({
  element: <RoleGuard allow={[peran]} />,
  children: [
    {
      element: shell,
      children: [
        { path: `${path}/dashboard`, element: dashboard },
        ...halaman,
      ],
    },
  ],
})

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "/pj_unit/*", element: <Navigate to="/pj-unit/dashboard" replace /> },
  { path: "/penanggung_jawab/*", element: <Navigate to="/pj-unit/dashboard" replace /> },
  { path: "/upt_remunerasi/*", element: <Navigate to="/upt-remunerasi/dashboard" replace /> },
  {
    path: "/rbac-demo",
    element: (
      <ProtectedRoute anyRole={["pegawai", "kepegawaian", "bendahara", "verifikator", "penanggung_jawab", "upt_remunerasi"]}>
        <ExampleRBACPage />
      </ProtectedRoute>
    ),
  },
  grup("pegawai", "pegawai", {
    shell: <PegawaiShell />,
    dashboard: <BerandaPage />,
    halaman: [
      { path: "pegawai/slip", element: <SlipListPage /> },
      { path: "pegawai/slip/:id", element: <SlipDetailPage /> },
      { path: "pegawai/pengaduan", element: <PengaduanListPage /> },
      { path: "pegawai/pengaduan/baru", element: <PengaduanBaruPage /> },
      { path: "pegawai/pengaduan/:id", element: <PengaduanDetailPage /> },
    ],
  }),
  grup("kepegawaian", "kepegawaian", {
    shell: <KepegawaianShell />,
    dashboard: <BerandaKepegawaianPage />,
    halaman: [
      { path: "kepegawaian/pegawai", element: <PegawaiKepegawaianPage /> },
      { path: "kepegawaian/usulan", element: <UsulanJabatanListPage /> },
      { path: "kepegawaian/usulan/baru", element: <BuatUsulanPage /> },
      { path: "kepegawaian/usulan/:id", element: <DetailUsulanPage /> },
      { path: "kepegawaian/presensi", element: <PresensiCutiPage /> },
      { path: "kepegawaian/hukuman", element: <HukumanDisiplinPage /> },
      { path: "kepegawaian/pengaduan", element: <PengaduanKepegawaianPage /> },
      { path: "kepegawaian/pengaduan/:id", element: <TanggapiPengaduanPage /> },
    ],
  }),
  grup("bendahara", "bendahara", {
    shell: <BendaharaShell />,
    dashboard: <BerandaBendaharaPage />,
    halaman: [
      { path: "bendahara/perhitungan", element: <PersiapanPerhitunganPage /> },
      { path: "bendahara/perhitungan/hasil", element: <HasilPratinjauPage /> },
      { path: "bendahara/perhitungan/konfirmasi", element: <KonfirmasiPengajuanPage /> },
      { path: "bendahara/perhitungan/berhasil", element: <PengajuanBerhasilPage /> },
      { path: "bendahara/status", element: <StatusPengajuanPage /> },
      { path: "bendahara/amprah", element: <AmprahListPage /> },
      { path: "bendahara/amprah/:id", element: <AmprahDetailPage /> },
      { path: "bendahara/rekapitulasi", element: <RekapitulasiPage /> },
    ],
  }),
  grup("verifikator", "verifikator", {
    shell: <VerifikatorShell />,
    dashboard: <BerandaVerifikatorPage />,
    halaman: [
      { path: "verifikator/pengajuan", element: <VerifikasiPengajuanListPage /> },
      { path: "verifikator/pengajuan/:id", element: <PemeriksaanPengajuanPage /> },
      { path: "verifikator/jabatan", element: <PerubahanJabatanListPage /> },
      { path: "verifikator/jabatan/:id", element: <DetailUsulanJabatanPage /> },
      { path: "verifikator/status", element: <PantauStatusPage /> },
      { path: "verifikator/audit", element: <JejakAuditPage /> },
    ],
  }),
  grup("pj-unit", "penanggung_jawab", {
    shell: <PjUnitShell />,
    dashboard: <BerandaPjUnitPage />,
    halaman: [
      { path: "pj-unit/approval-presensi", element: <ApprovalPresensiPage /> },
      { path: "pj-unit/pegawai", element: <DataPegawaiPage /> },
      { path: "pj-unit/status", element: <StatusPengajuanUnitPage /> },
      { path: "pj-unit/rekapitulasi", element: <RekapitulasiPage /> },
    ],
  }),
  grup("upt-remunerasi", "upt_remunerasi", {
    shell: <UptRemunerasiShell />,
    dashboard: <BerandaUptRemunerasiPage />,
    halaman: [
      { path: "upt-remunerasi/status", element: <PantauStatusUPTPage /> },
      { path: "upt-remunerasi/monitoring", element: <MonitoringStatusPage /> },
      { path: "upt-remunerasi/laporan", element: <LaporanPage /> },
      { path: "upt-remunerasi/ekspor", element: <EksporDataPage /> },
      { path: "upt-remunerasi/rekapitulasi", element: <RekapitulasiUPTPage /> },
      { path: "upt-remunerasi/hitung", element: <HitungPajakPage /> },
      { path: "upt-remunerasi/hitung/:id", element: <HitungPajakDetailPage /> },
      { path: "upt-remunerasi/amprah", element: <AmprahPage /> },
      { path: "upt-remunerasi/amprah/:id", element: <UptAmprahDetailPage /> },
      { path: "upt-remunerasi/slip", element: <UptSlipP1Page /> },
      { path: "upt-remunerasi/slip/:id", element: <UptSlipDetailPage /> },
      { path: "upt-remunerasi/pengaduan", element: <PengaduanEskalasiPage /> },
      { path: "upt-remunerasi/pengaduan/:id", element: <UptPengaduanDetailPage /> },
      { path: "upt-remunerasi/penetapan", element: <PenetapanJabatanPage /> },
      { path: "upt-remunerasi/penetapan/:id", element: <PenetapanJabatanDetailPage /> },
      { path: "upt-remunerasi/master-grade", element: <MasterGradePage /> },
      { path: "upt-remunerasi/parameter", element: <ParameterRemunerasiPage /> },
      { path: "upt-remunerasi/periode", element: <PeriodePembayaranPage /> },
      { path: "upt-remunerasi/unit", element: <UnitKerjaPage /> },
      { path: "upt-remunerasi/dokumen", element: <DokumenTemplatePage /> },
      { path: "upt-remunerasi/pegawai", element: <DataPegawaiUPTPage /> },
      { path: "upt-remunerasi/akun", element: <AkunHakAksesPage /> },
      { path: "upt-remunerasi/akun/:id", element: <AkunHakAksesDetailPage /> },
      { path: "upt-remunerasi/penugasan", element: <Navigate to="/upt-remunerasi/akun" replace /> },
      { path: "upt-remunerasi/hak-akses", element: <Navigate to="/upt-remunerasi/akun" replace /> },
      { path: "upt-remunerasi/audit", element: <JejakAuditUPTPage /> },
      { path: "upt-remunerasi/notifikasi", element: <NotifikasiPage /> },
      { path: "upt-remunerasi/profil", element: <ProfilUPTPage /> },
      { path: "upt-remunerasi/pengaturan", element: <PengaturanSistemPage /> },
      { path: "upt-remunerasi/akun-saya", element: <AkunSayaPage /> },
      { path: "upt-remunerasi/koreksi", element: <KoreksiSusulanPage /> },
      { path: "upt-remunerasi/beranda-saya", element: <BerandaSayaPage /> },
      { path: "upt-remunerasi/slip-saya", element: <SlipSayaPage /> },
      { path: "upt-remunerasi/slip-saya/:id", element: <SlipSayaDetailPage /> },
      { path: "upt-remunerasi/pengaduan-saya", element: <PengaduanSayaPage /> },
      { path: "upt-remunerasi/pengaduan-saya/baru", element: <PengaduanSayaBaruPage /> },
      { path: "upt-remunerasi/pengaduan-saya/:id", element: <PengaduanSayaDetailPage /> },
    ],
  }),
  { path: "*", element: <SystemErrorPage />, errorElement: <SystemErrorPage /> },
])
