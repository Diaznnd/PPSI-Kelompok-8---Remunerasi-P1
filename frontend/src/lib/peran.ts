export type Peran =
  | "pegawai"
  | "kepegawaian"
  | "bendahara"
  | "verifikator"
  | "penanggung_jawab"
  | "upt_remunerasi"

export const labelPeran: Record<Peran, string> = {
  pegawai: "Pegawai",
  kepegawaian: "Kepegawaian",
  bendahara: "Bendahara",
  verifikator: "Verifikator",
  penanggung_jawab: "Penanggung Jawab Unit",
  upt_remunerasi: "UPT Remunerasi",
}

export const prefixPeran: Record<Peran, string> = {
  pegawai: "/pegawai",
  kepegawaian: "/kepegawaian",
  bendahara: "/bendahara",
  verifikator: "/verifikator",
  penanggung_jawab: "/pj-unit",
  upt_remunerasi: "/upt-remunerasi",
}