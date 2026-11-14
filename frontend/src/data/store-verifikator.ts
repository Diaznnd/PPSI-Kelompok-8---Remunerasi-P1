import { useMemo, useSyncExternalStore } from "react"
import {
  AUDIT_AWAL, PENGAJUAN_AWAL, USULAN_AWAL,
  type Audit, type PengajuanP1, type StatusVerif, type UsulanJabatan,
} from "./dummy-verifikator"

// Penyimpanan keputusan verifikator untuk DEMO (tanpa backend).
// Semua halaman membaca dari sini, jadi keputusan di satu halaman langsung terlihat di halaman lain.
// Data tersimpan di localStorage; hapus dengan resetDemo(). Ganti dengan panggilan api saat backend siap.

type Putusan = { status: StatusVerif; waktu: string; catatan?: string }
type State = { pengajuan: Record<string, Putusan>; usulan: Record<string, Putusan>; audit: Audit[] }

const KEY = "siremun_verifikator_v1"
const KOSONG: State = { pengajuan: {}, usulan: {}, audit: [] }
const PELAKU = { nama: "Rizki Maulana", peran: "Verifikator" }

function muat(): State {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...KOSONG, ...JSON.parse(raw) } : KOSONG
  } catch {
    return KOSONG
  }
}

let state: State = muat()
const pendengar = new Set<() => void>()
const beritahu = () => pendengar.forEach((l) => l())

function simpan(next: State) {
  state = next
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* penyimpanan penuh/dinonaktifkan: tetap jalan di memori */ }
  beritahu()
}

// sinkron antar tab browser
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => { if (e.key === KEY) { state = muat(); beritahu() } })
}

const subscribe = (l: () => void) => { pendengar.add(l); return () => { pendengar.delete(l) } }
const useStore = () => useSyncExternalStore(subscribe, () => state)

const dua = (n: number) => String(n).padStart(2, "0")
function sekarang() {
  const d = new Date()
  const tgl = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  return { teks: `${tgl}, ${dua(d.getHours())}.${dua(d.getMinutes())}`, iso: `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}` }
}

export function putuskan(a: { jenis: "pengajuan" | "usulan"; id: string; status: "Diverifikasi" | "Dikembalikan"; alasan?: string }) {
  const { teks, iso } = sekarang()
  const setuju = a.status === "Diverifikasi"
  const p = a.jenis === "pengajuan" ? PENGAJUAN_AWAL.find((x) => x.id === a.id) : undefined
  const u = a.jenis === "usulan" ? USULAN_AWAL.find((x) => x.id === a.id) : undefined
  if (!p && !u) return

  const entri: Audit = {
    id: `u${Date.now()}`, tanggal: iso, waktu: teks, pelaku: PELAKU.nama, peran: PELAKU.peran,
    aksi: p ? (setuju ? "Menyetujui pengajuan" : "Mengembalikan pengajuan") : (setuju ? "Menyetujui usulan jabatan" : "Mengembalikan usulan jabatan"),
    objek: p ? p.id : u!.nama,
    judul: p ? (setuju ? "Persetujuan Pengajuan P1" : "Pengembalian Pengajuan P1") : (setuju ? "Persetujuan Usulan Jabatan" : "Pengembalian Usulan Jabatan"),
    sebelum: { judul: "Status: Diajukan", ket: p ? `Pengajuan ke-${p.ke}` : u!.jenis },
    sesudah: setuju
      ? { judul: "Status: Diverifikasi", ket: "Diteruskan ke UPT Remunerasi" }
      : { judul: "Status: Dikembalikan", ket: p ? "Dikembalikan kepada Bendahara" : "Dikembalikan kepada Bidang Kepegawaian" },
    alasan: setuju ? "Seluruh validasi otomatis telah diperiksa dan sesuai." : (a.alasan ?? "-"),
  }
  const putusan: Putusan = { status: a.status, waktu: teks, catatan: a.alasan }
  simpan({
    ...state,
    pengajuan: p ? { ...state.pengajuan, [p.id]: putusan } : state.pengajuan,
    usulan: u ? { ...state.usulan, [u.id]: putusan } : state.usulan,
    audit: [entri, ...state.audit],
  })
}

export function resetDemo() {
  simpan(KOSONG)
}

// ---------- Penggabungan data awal + keputusan (fungsi murni) ----------
const kejadian = (o: Putusan, ke: number, penerima: string) => ({
  ke,
  judul: o.status === "Diverifikasi" ? "Disetujui dan Diteruskan" : `Dikembalikan ${penerima === "Bendahara" ? "Verifikator" : "Kepegawaian"}`,
  waktu: `${o.waktu} WIB`,
  oleh: `${PELAKU.nama} • ${PELAKU.peran}`,
  catatan: o.catatan,
  selesai: o.status === "Diverifikasi",
})

export function gabungPengajuan(s: State): PengajuanP1[] {
  return PENGAJUAN_AWAL.map((p) => {
    const o = s.pengajuan[p.id]
    return o ? { ...p, status: o.status, diperbarui: `${o.waktu} WIB`, riwayat: [...p.riwayat, kejadian(o, p.ke, "Bendahara")] } : p
  })
}

export function gabungUsulan(s: State): UsulanJabatan[] {
  return USULAN_AWAL.map((u) => {
    const o = s.usulan[u.id]
    return o ? { ...u, status: o.status, diperbarui: `${o.waktu} WIB`, riwayat: [...u.riwayat, kejadian(o, 1, "Kepegawaian")] } : u
  })
}

export const usePengajuan = () => { const s = useStore(); return useMemo(() => gabungPengajuan(s), [s]) }
export const useUsulan = () => { const s = useStore(); return useMemo(() => gabungUsulan(s), [s]) }
export const useAudit = () => { const s = useStore(); return useMemo(() => [...s.audit, ...AUDIT_AWAL], [s]) }

// Selisih angka kartu di beranda akibat keputusan yang sudah diambil
export function useStatistik() {
  const s = useStore()
  return useMemo(() => {
    const semua = [...Object.values(s.pengajuan), ...Object.values(s.usulan)]
    return {
      pengajuan: Object.keys(s.pengajuan).length,
      usulan: Object.keys(s.usulan).length,
      dikembalikan: semua.filter((x) => x.status === "Dikembalikan").length,
      disetujui: semua.filter((x) => x.status === "Diverifikasi").length,
    }
  }, [s])
}
