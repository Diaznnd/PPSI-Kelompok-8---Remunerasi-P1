import { createBrowserRouter, Navigate } from "react-router-dom"
import AppShell from "@/layouts/AppShell"
import { RoleGuard } from "./RoleGuard"
import LoginPage from "@/pages/login/LoginPage"
import Dashboard from "@/pages/Dashboard"
import type { Peran } from "@/lib/peran"

const grup = (path: string, peran: Peran) => ({
  element: <RoleGuard allow={[peran]} />,
  children: [
    {
      element: <AppShell />,
      children: [
        { path: `${path}/dashboard`, element: <Dashboard /> },
        // tambahkan halaman peran di sini
      ],
    },
  ],
})

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  grup("pegawai", "pegawai"),
  grup("kepegawaian", "kepegawaian"),
  grup("bendahara", "bendahara"),
  grup("verifikator", "verifikator"),
  grup("pj-unit", "pj_unit"),
  grup("upt-remunerasi", "upt_remunerasi"),
])