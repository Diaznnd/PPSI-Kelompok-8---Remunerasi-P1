export type Peran =
  | "pegawai"
  | "kepegawaian"
  | "bendahara"
  | "verifikator"
  | "pj_unit"
  | "upt_remunerasi"

export const labelPeran: Record<Peran, string> = {
  pegawai: "Pegawai",
  kepegawaian: "Kepegawaian",
  bendahara: "Bendahara",
  verifikator: "Verifikator",
  pj_unit: "Penanggung Jawab Unit",
  upt_remunerasi: "UPT Remunerasi",
}

export const prefixPeran: Record<Peran, string> = {
  pegawai: "/pegawai",
  kepegawaian: "/kepegawaian",
  bendahara: "/bendahara",
  verifikator: "/verifikator",
  pj_unit: "/pj-unit",
  upt_remunerasi: "/upt-remunerasi",
}