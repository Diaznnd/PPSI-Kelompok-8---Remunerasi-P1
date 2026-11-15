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
    { label: "Perubahan Jabatan/Grade", to: "/verifikator/jabatan" },
    { label: "Pantau Status", to: "/verifikator/status" },
    { label: "Jejak Audit", to: "/verifikator/audit" },
  ],
  pj_unit: [
    { label: "Dashboard", to: "/pj-unit/dashboard" },
    { label: "Pengajuan Unit", to: "/pj-unit/pengajuan" },
  ],
  upt_remunerasi: [
    { label: "Beranda", to: "/upt-remunerasi/dashboard" },
    { label: "Hitung Pajak & P1 Netto", to: "/upt-remunerasi/hitung" },
    { label: "Amprah", to: "/upt-remunerasi/amprah" },
    { label: "Slip P1", to: "/upt-remunerasi/slip" },
    { label: "Rekapitulasi P1", to: "/upt-remunerasi/rekapitulasi" },
    { label: "Pantau Status Pengajuan", to: "/upt-remunerasi/status" },
    { label: "Pengaduan Eskalasi", to: "/upt-remunerasi/pengaduan" },
    { label: "Penetapan Jabatan/Grade", to: "/upt-remunerasi/penetapan" },
    { label: "Master Jabatan & Grade", to: "/upt-remunerasi/master-grade" },
    { label: "Parameter Remunerasi", to: "/upt-remunerasi/parameter" },
    { label: "Struktur Unit Kerja", to: "/upt-remunerasi/unit" },
    { label: "Akun & Hak Akses", to: "/upt-remunerasi/akun" },
    { label: "Jejak Audit", to: "/upt-remunerasi/audit" },
  ],
}