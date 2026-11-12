import type { Peran } from "@/lib/peran"

// Akun PALSU untuk pengembangan frontend (dipakai kalau VITE_MOCK_AUTH=true).
// Menambah role/akun baru = tambah satu baris di sini. Hapus file ini kalau backend sudah siap.

export const AKUN_MOCK: { id: number; username: string; password: string; peran: Peran }[] = [
  { id: 1, username: "1", password: "1", peran: "pegawai" },
  { id: 2, username: "2", password: "2", peran: "bendahara" },
  { id: 3, username: "3", password: "3", peran: "kepegawaian" },
  { id: 4, username: "4", password: "4", peran: "verifikator" },
  { id: 5, username: "5", password: "5", peran: "pj_unit" },
  { id: 6, username: "6", password: "6", peran: "upt_remunerasi" },
]
