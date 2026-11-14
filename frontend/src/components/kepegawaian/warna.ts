import type { StatusAduan, StatusUsulan } from "@/data/dummy-kepegawaian"

export const warnaUsulan: Record<StatusUsulan, string> = {
  Diajukan: "border-sky-200 bg-sky-100 text-sky-800",
  Dikembalikan: "border-red-200 bg-red-100 text-red-800",
  "Disetujui Verifikator": "border-emerald-200 bg-emerald-100 text-emerald-800",
  Ditetapkan: "border-primary/30 bg-primary/10 text-primary",
}

export const warnaAduan: Record<StatusAduan, string> = {
  Diajukan: "border-sky-200 bg-sky-100 text-sky-800",
  Diteruskan: "border-purple-200 bg-purple-100 text-purple-800",
  Selesai: "border-emerald-200 bg-emerald-100 text-emerald-800",
}
