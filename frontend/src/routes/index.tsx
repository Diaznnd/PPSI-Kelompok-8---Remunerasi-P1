import type { ReactElement } from "react"
import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom"
import AppShell from "@/layouts/AppShell"
import PegawaiShell from "@/layouts/PegawaiShell"
import BendaharaShell from "@/layouts/BendaharaShell"
import PjUnitShell from "@/layouts/PjUnitShell"
import { RoleGuard } from "./RoleGuard"
import LoginPage from "@/pages/login/LoginPage"
import Dashboard from "@/pages/Dashboard"
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
import type { Peran } from "@/lib/peran"

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
  grup("kepegawaian", "kepegawaian"),
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
  grup("verifikator", "verifikator"),
  grup("pj-unit", "pj_unit", {
    shell: <PjUnitShell />,
    dashboard: <BerandaPjUnitPage />,
    halaman: [
      { path: "pj-unit/pegawai", element: <DataPegawaiPage /> },
      { path: "pj-unit/status", element: <StatusPengajuanUnitPage /> },
      { path: "pj-unit/rekapitulasi", element: <RekapitulasiPage /> },
    ],
  }),
  grup("upt-remunerasi", "upt_remunerasi"),
])
