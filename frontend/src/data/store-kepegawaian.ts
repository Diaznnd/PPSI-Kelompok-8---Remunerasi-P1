import { useSyncExternalStore } from "react"
import {
  ADUAN_SEED, HUKUMAN_SEED, IMPOR_SEED, PEGAWAI_SEED, PRESENSI_SEED, STATUS_IMPOR_SEED, USULAN_SEED, kepeg, tglID,
  type AduanKep, type BarisPresensi, type Hukuman, type PegawaiKep, type RiwayatImpor, type StatusImpor, type UsulanKep,
} from "./dummy-kepegawaian"

// Penyimpanan DEMO untuk role Kepegawaian (tanpa backend). Semua halaman membaca dari sini,
// jadi perubahan di satu halaman langsung terlihat di halaman lain. Disimpan di localStorage.
// Ganti dengan panggilan api saat backend siap.

type State = {
  pegawai: PegawaiKep[]; usulan: UsulanKep[]; presensi: BarisPresensi[]
  riwayatImpor: RiwayatImpor[]; statusImpor: StatusImpor; hukuman: Hukuman[]; pengaduan: AduanKep[]
}

const KEY = "siremun_kepegawaian_v1"
const awal = (): State => structuredClone({
  pegawai: PEGAWAI_SEED, usulan: USULAN_SEED, presensi: PRESENSI_SEED, riwayatImpor: IMPOR_SEED,
  statusImpor: STATUS_IMPOR_SEED, hukuman: HUKUMAN_SEED, pengaduan: ADUAN_SEED,
})
function muat(): State {
  try { const raw = localStorage.getItem(KEY); return raw ? { ...awal(), ...JSON.parse(raw) } : awal() } catch { return awal() }
}

let state: State = muat()
const pendengar = new Set<() => void>()
const beritahu = () => pendengar.forEach((l) => l())
function ubah(fn: (s: State) => State) {
  state = fn(state)
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* tetap jalan di memori */ }
  beritahu()
}
if (typeof window !== "undefined") window.addEventListener("storage", (e) => { if (e.key === KEY) { state = muat(); beritahu() } })
const subscribe = (l: () => void) => { pendengar.add(l); return () => { pendengar.delete(l) } }
export const useKepeg = () => useSyncExternalStore(subscribe, () => state)

const dua = (n: number) => String(n).padStart(2, "0")
const sekarang = () => {
  const d = new Date()
  const tgl = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  return { tgl, jam: `${dua(d.getHours())}.${dua(d.getMinutes())}` }
}
const stempel = () => { const { tgl, jam } = sekarang(); return `${tgl} pukul ${jam}` }
const OLEH = `${kepeg.nama.replace(/, S\.Sos\./, "")} (Bidang Kepegawaian)`

export const resetKepegawaian = () => ubah(() => awal())

/* Pegawai */
export const tambahPegawai = (p: PegawaiKep) => ubah((s) => ({ ...s, pegawai: [...s.pegawai, p] }))
export const ubahPegawai = (nip: string, patch: Partial<PegawaiKep>) => ubah((s) => ({ ...s, pegawai: s.pegawai.map((p) => (p.nip === nip ? { ...p, ...patch } : p)) }))
export const nonaktifkanPegawai = (nip: string, alasan: string, ket: string) =>
  ubahPegawai(nip, { aktif: false, alasanNonaktif: ket ? `${alasan} — ${ket}` : alasan })
export const aktifkanPegawai = (nip: string) => ubahPegawai(nip, { aktif: true, alasanNonaktif: undefined })

/* Usulan */
export function tambahUsulan(a: { nip: string; jenis: string; mulaiIso: string; jabatanBaru: string; gradeBaru: number; alasan: string; sk: string; spmt: string }) {
  const p = state.pegawai.find((x) => x.nip === a.nip)
  if (!p) return ""
  const id = `USL-2026-${String(40 + state.usulan.length).padStart(3, "0")}`
  const u: UsulanKep = {
    id, nip: p.nip, nama: p.nama, lama: { jabatan: p.jabatan, grade: p.grade }, baru: { jabatan: a.jabatanBaru, grade: a.gradeBaru },
    jenis: a.jenis, mulai: tglID(a.mulaiIso), alasan: a.alasan, status: "Diajukan", sk: a.sk, spmt: a.spmt,
    jejak: [{ label: "Diajukan", waktu: stempel(), oleh: OLEH }],
  }
  ubah((s) => ({ ...s, usulan: [u, ...s.usulan] }))
  return id
}
export const ajukanUlang = (id: string, mulaiIso: string, catatan: string) =>
  ubah((s) => ({
    ...s,
    usulan: s.usulan.map((u) => u.id !== id ? u : {
      ...u, status: "Diajukan", mulai: mulaiIso ? tglID(mulaiIso) : u.mulai, catatanKembali: undefined,
      jejak: [...u.jejak, { label: "Diajukan ulang", waktu: stempel(), oleh: OLEH, catatan: catatan || undefined }],
    }),
  }))

/* Presensi */
export const koreksiPresensi = (nip: string, patch: Partial<BarisPresensi>) =>
  ubah((s) => ({ ...s, presensi: s.presensi.map((r) => (r.nip === nip ? { ...r, ...patch } : r)) }))
export function imporPresensi(periode: string, file: string) {
  const { tgl, jam } = sekarang()
  const waktu = `${tgl.replace(/(\w{3})\w*/, "$1")}, ${jam} WIB`
  ubah((s) => ({
    ...s,
    statusImpor: { periode, pegawai: 84, error: 0, waktu },
    riwayatImpor: [{ periode, file, pegawai: 84, error: 0, oleh: kepeg.nama.replace(/, S\.Sos\./, ""), durasi: "2 detik", status: "Berhasil" }, ...s.riwayatImpor],
  }))
}

/* Hukuman */
export function catatHukuman(h: Omit<Hukuman, "id">) {
  ubah((s) => ({ ...s, hukuman: [{ ...h, id: `HKD-2026-${String(5 + s.hukuman.length).padStart(3, "0")}` }, ...s.hukuman] }))
}
export const ubahHukuman = (id: string, patch: Partial<Hukuman>) => ubah((s) => ({ ...s, hukuman: s.hukuman.map((h) => (h.id === id ? { ...h, ...patch } : h)) }))

/* Pengaduan */
export const tanggapiPengaduan = (id: string, tindakan: "selesai" | "teruskan", tanggapan: string) =>
  ubah((s) => ({
    ...s,
    pengaduan: s.pengaduan.map((a) => a.id !== id ? a : tindakan === "selesai"
      ? { ...a, status: "Selesai", penanganan: "Diselesaikan di unit", tanggapan }
      : { ...a, status: "Diteruskan", penanganan: "Diteruskan ke UPT Remunerasi", tanggapan }),
  }))
