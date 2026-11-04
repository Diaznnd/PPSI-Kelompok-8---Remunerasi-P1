import type { Peran } from "@/lib/peran"

export const menuByRole: Record<Peran, { label: string; to: string }[]> = {
  pegawai: [
    { label: "Dashboard", to: "/pegawai/dashboard" },
    { label: "Slip P1", to: "/pegawai/slip" },
    { label: "Pengaduan", to: "/pegawai/pengaduan" },
  ],
  kepegawaian: [
    { label: "Dashboard", to: "/kepegawaian/dashboard" },
    { label: "Data Pegawai", to: "/kepegawaian/pegawai" },
    { label: "Usulan Jabatan", to: "/kepegawaian/usulan" },
  ],
  bendahara: [
    { label: "Dashboard", to: "/bendahara/dashboard" },
    { label: "Impor Presensi", to: "/bendahara/presensi" },
    { label: "Amprah", to: "/bendahara/amprah" },
  ],
  verifikator: [
    { label: "Dashboard", to: "/verifikator/dashboard" },
    { label: "Verifikasi Pengajuan", to: "/verifikator/pengajuan" },
  ],
  pj_unit: [
    { label: "Dashboard", to: "/pj-unit/dashboard" },
    { label: "Pengajuan Unit", to: "/pj-unit/pengajuan" },
  ],
  upt_remunerasi: [
    { label: "Dashboard", to: "/upt-remunerasi/dashboard" },
    { label: "Parameter", to: "/upt-remunerasi/parameter" },
    { label: "Jejak Audit", to: "/upt-remunerasi/audit" },
  ],
}