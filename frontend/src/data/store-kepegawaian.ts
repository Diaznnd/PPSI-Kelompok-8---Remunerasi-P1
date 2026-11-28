import { useEffect, useState } from "react"
import { kepegawaianService } from "@/services/kepegawaianService"
import type {
  AduanKep,
  BarisPresensi,
  Hukuman,
  PegawaiKep,
  RiwayatImpor,
  StatusImpor,
  UsulanKep,
} from "@/types/kepegawaian"

export const resetKepegawaian = () => {
  // No-op for real database
}

export function useKepeg() {
  const [pegawai, setPegawai] = useState<PegawaiKep[]>([])
  const [usulan, setUsulan] = useState<UsulanKep[]>([])
  const [presensi, setPresensi] = useState<BarisPresensi[]>([])
  const [hukuman, setHukuman] = useState<Hukuman[]>([])
  const [pengaduan, setPengaduan] = useState<AduanKep[]>([])
  const [riwayatImpor] = useState<RiwayatImpor[]>([])
  const [statusImpor] = useState<StatusImpor>({
    periode: "Oktober 2026",
    pegawai: 0,
    error: 0,
    waktu: "-",
  })

  useEffect(() => {
    kepegawaianService
      .getPegawaiList()
      .then((res) => {
        if (res?.data) {
          setPegawai(
            res.data.map((p: any) => ({
              nip: p.NIP || p.nip,
              nama: p.nama,
              email: p.email || "",
              jenis: p.jenis,
              status: p.status_kepegawaian || p.status,
              golongan: p.pangkat_golongan || p.golongan,
              jabatan: p.jabatan?.nama_jabatan || p.jabatan || "",
              grade: p.jabatan?.grade?.kode_grade || p.grade || 0,
              tmt: p.tmt || "",
              aktif: Boolean(p.aktif),
              alasanNonaktif: p.alasan_nonaktif,
            }))
          )
        }
      })
      .catch(() => setPegawai([]))

    kepegawaianService
      .getUsulanList()
      .then((res) => {
        if (res?.data) {
          setUsulan(
            res.data.map((u: any) => ({
              id: u.nomor_usulan || `USL-${u.id}`,
              nip: u.pegawai?.NIP || u.NIP || "",
              nama: u.pegawai?.nama || "",
              lama: {
                jabatan: u.jabatanLama?.nama_jabatan || u.jabatan_lama || "",
                grade: u.jabatanLama?.grade?.kode_grade || u.grade_lama || "",
              },
              baru: {
                jabatan: u.jabatanBaru?.nama_jabatan || u.jabatan_baru || "",
                grade: u.jabatanBaru?.grade?.kode_grade || u.grade_baru || "",
              },
              jenis: u.jenis_usulan || u.jenis || "Promosi",
              mulai: u.tanggal_berlaku || "",
              alasan: u.alasan || "",
              status: u.status || "Diajukan",
              sk: u.dokumen_sk,
              spmt: u.dokumen_spmt,
              jejak: [],
              catatanKembali: u.catatan_verifikator,
            }))
          )
        }
      })
      .catch(() => setUsulan([]))

    kepegawaianService
      .getHukumanList()
      .then((res) => {
        if (res?.data) {
          setHukuman(
            res.data.map((h: any) => ({
              id: `HKD-${h.id}`,
              nip: h.pegawai?.NIP || h.NIP || "",
              nama: h.pegawai?.nama || "",
              tingkat: h.tingkat,
              jenis: h.jenis || "",
              sk: h.nomor_sk || "",
              nomor_sk: h.nomor_sk || "",
              mulai: h.tanggal_mulai || "",
              berakhir: h.tanggal_berakhir || "",
              uraian: h.uraian || "",
            }))
          )
        }
      })
      .catch(() => setHukuman([]))

    kepegawaianService
      .getPresensiList()
      .then((res) => {
        if (res?.data) {
          setPresensi(
            res.data.map((r: any) => ({
              nip: r.NIP || r.nip,
              nama: r.pegawai?.nama || r.nama || "",
              hariKerja: Number(r.hari_kerja || 22),
              hadir: Number(r.hadir || 0),
              tidakHadir: Number(r.tidak_hadir || 0),
              cuti: Number(r.cuti_tahunan || 0),
            }))
          )
        }
      })
      .catch(() => setPresensi([]))

    kepegawaianService
      .getPengaduanList()
      .then((res) => {
        if (res?.data) {
          setPengaduan(
            res.data.map((a: any) => ({
              id: String(a.id),
              nip: a.pegawai?.NIP || a.NIP || "",
              nama: a.pegawai?.nama || a.nama || "",
              kategori: a.kategori,
              deskripsi: a.deskripsi || a.isi || "",
              tglDiajukan: a.created_at || "",
              status: a.status || "Menunggu",
              tanggapan: a.tanggapan_kepegawaian,
            }))
          )
        }
      })
      .catch(() => setPengaduan([]))
  }, [])

  return {
    pegawai,
    usulan,
    presensi,
    hukuman,
    pengaduan,
    riwayatImpor,
    statusImpor,
  }
}

export const tambahPegawai = (p: PegawaiKep) => {
  return kepegawaianService.createPegawai({
    NIP: p.nip,
    nama: p.nama,
    email: p.email,
    jenis: p.jenis,
    status_kepegawaian: p.status,
    pangkat_golongan: p.golongan,
    tmt: p.tmt,
  })
}

export const ubahPegawai = (nip: string, patch: Partial<PegawaiKep>) => {
  return kepegawaianService.updatePegawai(nip, {
    nama: patch.nama,
    email: patch.email,
    jenis: patch.jenis,
    status_kepegawaian: patch.status,
    pangkat_golongan: patch.golongan,
    tmt: patch.tmt,
  })
}

export const nonaktifkanPegawai = (nip: string, alasan: string, ket: string) => {
  return kepegawaianService.nonaktifkanPegawai(nip, {
    alasan: ket ? `${alasan} — ${ket}` : alasan,
  })
}

export const aktifkanPegawai = (nip: string) => {
  return kepegawaianService.aktifkanPegawai(nip)
}

export function tambahUsulan(a: {
  nip: string
  jenis: string
  mulaiIso: string
  jabatanBaru: string
  gradeBaru: number
  alasan: string
  sk: string
  spmt: string
}) {
  const formData = new FormData()
  formData.append("NIP", a.nip)
  formData.append("jenis_usulan", a.jenis)
  formData.append("tanggal_berlaku", a.mulaiIso)
  formData.append("alasan", a.alasan)
  formData.append("jabatan_baru", a.jabatanBaru)
  return kepegawaianService.buatUsulan(formData)
}

export const ajukanUlang = (id: string, mulaiIso: string, catatan: string) => {
  const formData = new FormData()
  formData.append("tanggal_berlaku", mulaiIso)
  formData.append("catatan", catatan)
  return kepegawaianService.ajukanUlangUsulan(id, formData)
}

export const koreksiPresensi = (nip: string, patch: Partial<BarisPresensi> & { alasan?: string }) => {
  return kepegawaianService.koreksiPresensi(nip, {
    hariKerja: patch.hariKerja ?? 22,
    hadir: patch.hadir ?? 0,
    tidakHadir: patch.tidakHadir ?? 0,
    cuti: patch.cuti ?? 0,
    alasan: patch.alasan ?? "Koreksi manual presensi",
  })
}

export function imporPresensi(_periode?: string, _file?: string) {
  // handled via kepegawaianService.importPresensi
}

export function catatHukuman(h: Omit<Hukuman, "id">) {
  return kepegawaianService.tambahHukuman(h)
}

export const ubahHukuman = (id: string, patch: Partial<Hukuman>) => {
  return kepegawaianService.updateHukuman(id, patch)
}

export const tanggapiPengaduan = (
  id: string,
  tindakan: "selesai" | "teruskan",
  tanggapan: string
) => {
  return kepegawaianService.tanggapiPengaduan(id, { tindakan, tanggapan })
}
