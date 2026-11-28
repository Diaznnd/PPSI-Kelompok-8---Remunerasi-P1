import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, BarChart3, CheckCircle2, Clock, FileSpreadsheet, Loader2, Search, ShieldAlert, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { bendaharaService } from "@/services/bendaharaService"
import { rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  CUTI_TARIF,
  GRADE_PARAM,
  PERSEN_P1,
  PIR,
  TL_TIER,
} from "@/types/bendahara"

interface TlItem {
  kode: string
  rentang: string
  tarif: string
}

interface CutiItem {
  nama: string
  tarif: string
}

interface GradeItem {
  grade: string
  nilai: number
  p1: number
}

export default function PersiapanPerhitunganPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState("Oktober 2026")
  const [jalan, setJalan] = useState(false)
  const [kesiapanData, setKesiapanData] = useState<any>(null)
  const [cariAbsensi, setCariAbsensi] = useState("")
  const [periodeList] = useState(["Oktober 2026", "September 2026", "Agustus 2026"])

  const periodeId = periode === "Oktober 2026" ? "2026-10" : periode === "September 2026" ? "2026-09" : "2026-08"

  useEffect(() => {
    const fetchKesiapan = async () => {
      try {
        setLoading(true)
        const res = await bendaharaService.getKesiapan(periodeId)
        if (res) setKesiapanData(res)
      } catch (error) {
        console.error("Error fetching kesiapan:", error)
        toast.error("Gagal memuat data kesiapan")
      } finally {
        setLoading(false)
      }
    }
    fetchKesiapan()
  }, [periodeId])

  const presensiStatus = kesiapanData?.presensi_status
  const statusApproval: string = presensiStatus?.status_approval || (kesiapanData?.kesiapan?.find((c: any) => c.label?.includes("PJ Unit"))?.siap ? "disetujui" : "belum_ada")
  const siapHitung: boolean = Boolean(presensiStatus?.siap_perhitungan ?? kesiapanData?.kesiapan?.every((c: any) => c.siap))
  const presensiList: any[] = Array.isArray(kesiapanData?.presensi_list) ? kesiapanData.presensi_list : []
  const filteredPresensi = useMemo(() => {
    const q = cariAbsensi.trim().toLowerCase()
    if (!q) return presensiList
    return presensiList.filter(
      (item) =>
        String(item.nama || "").toLowerCase().includes(q) ||
        String(item.nip || "").toLowerCase().includes(q)
    )
  }, [presensiList, cariAbsensi])

  async function jalankan() {
    if (!siapHitung) {
      toast.error("Rekap absensi belum disetujui oleh Penanggung Jawab Unit. Perhitungan tidak dapat dilanjutkan.")
      return
    }
    setJalan(true)
    try {
      await bendaharaService.hitung(periodeId)
      toast.success("Perhitungan P1 berhasil diproses dari basis data.")
      setTimeout(() => navigate("/bendahara/perhitungan/hasil"), 500)
    } catch (error: any) {
      console.error("Error running hitung:", error)
      toast.error(error?.response?.data?.message || "Gagal menjalankan perhitungan")
      setJalan(false)
    }
  }

  // Daftar cek kesiapan
  const cekItems = useMemo(() => {
    const raw = kesiapanData?.kesiapan
    if (Array.isArray(raw)) {
      return raw.map((c: any) => ({
        label: typeof c === "object" && c !== null ? c.label || "" : String(c),
        siap: typeof c === "object" && c !== null ? Boolean(c.siap) : true,
      }))
    }
    return [
      { label: "Presensi lengkap terimpor", siap: false },
      { label: "Persetujuan Rekap Absensi oleh PJ Unit", siap: false },
      { label: "Pegawai aktif unit terdaftar", siap: true },
      { label: "Parameter remunerasi berlaku", siap: true },
      { label: "Jabatan dan grade sesuai riwayat resmi", siap: true },
    ]
  }, [kesiapanData])

  const pirValue = Number(kesiapanData?.parameter?.pir) || PIR
  const persenP1Value = Number(kesiapanData?.parameter?.persen_p1) || PERSEN_P1

  // Normalisasi Parameter Grade (mendukung array of object maupun array of tuple)
  const gradeParam: GradeItem[] = useMemo(() => {
    let raw = kesiapanData?.parameter?.grades || kesiapanData?.parameter?.grade || GRADE_PARAM
    if (raw && typeof raw === "object" && !Array.isArray(raw)) raw = Object.values(raw)
    if (!Array.isArray(raw)) return []

    return raw.map((item: any) => {
      let grade = ""
      let nilai = 0
      if (Array.isArray(item)) {
        grade = String(item[0] || "")
        nilai = Number(item[1]) || 0
      } else if (typeof item === "object" && item !== null) {
        grade = String(item.grade || item.kode_grade || item.nama || "")
        nilai = Number(item.nilai || item.nominal || item.besaran) || 0
      } else {
        grade = String(item || "")
      }
      return {
        grade,
        nilai,
        p1: Math.round((nilai * persenP1Value) / 100),
      }
    })
  }, [kesiapanData, persenP1Value])

  // Normalisasi TL.1 s.d TL.6 (mencegah [object Object])
  const tlTier: TlItem[] = useMemo(() => {
    let raw = kesiapanData?.parameter?.tl_tier || TL_TIER
    if (raw && typeof raw === "object" && !Array.isArray(raw)) raw = Object.values(raw)
    if (!Array.isArray(raw)) return []

    return raw.map((item: any) => {
      if (Array.isArray(item)) {
        return {
          kode: String(item[0] || ""),
          rentang: String(item[1] || ""),
          tarif: String(item[2] || ""),
        }
      }
      if (typeof item === "object" && item !== null) {
        return {
          kode: String(item.kode || item.label || item.nama || ""),
          rentang: String(item.rentang || item.range || ""),
          tarif: String(item.tarif || (item.persen != null ? `${item.persen}%` : "")),
        }
      }
      return { kode: String(item || ""), rentang: "", tarif: "" }
    })
  }, [kesiapanData])

  // Normalisasi Tarif Cuti & Alfa (mencegah [object Object])
  const cutiTarif: CutiItem[] = useMemo(() => {
    let raw = kesiapanData?.parameter?.cuti_tarif || CUTI_TARIF
    if (raw && typeof raw === "object" && !Array.isArray(raw)) raw = Object.values(raw)
    if (!Array.isArray(raw)) return []

    return raw.map((item: any) => {
      if (Array.isArray(item)) {
        return {
          nama: String(item[0] || ""),
          tarif: String(item[1] || ""),
        }
      }
      if (typeof item === "object" && item !== null) {
        return {
          nama: String(item.jenis || item.nama || item.label || ""),
          tarif: String(item.tarif || (item.persen != null ? `${item.persen}%` : "")),
        }
      }
      return { nama: String(item || ""), tarif: "" }
    })
  }, [kesiapanData])

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Memuat data kesiapan...</span>
        </div>
      )}

      {!loading && (
        <>
          <PageHeading
            title="Persiapan Perhitungan P1"
            desc="Periksa kesiapan data presensi, pegawai, dan parameter sebelum menjalankan perhitungan P1."
          />

          <div className="space-y-6 pb-12">
            {/* Banner Status Approval PJ Unit & Blocking Notifier */}
            {statusApproval === "menunggu_approval" && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/30">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-200">
                        Perhitungan P1 Terkunci: Menunggu Persetujuan PJ Unit
                      </h4>
                      <Badge variant="outline" className="border-amber-300 bg-amber-100 text-amber-800 font-semibold">
                        Menunggu Approval
                      </Badge>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Rekap absensi periode <strong>{periode}</strong> telah diunggah oleh Kepegawaian namun <strong>belum disetujui</strong> oleh Penanggung Jawab Unit. Sesuai regulasi tata kelola remunerasi P1, tombol perhitungan dinonaktifkan hingga persetujuan diterbitkan.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {statusApproval === "ditolak" && (
              <div className="rounded-xl border border-red-300 bg-red-50/80 p-4 shadow-xs dark:border-red-900/60 dark:bg-red-950/30">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-red-900 dark:text-red-200">
                        Perhitungan P1 Diblokir: Rekap Presensi Ditolak
                      </h4>
                      <Badge variant="outline" className="border-red-300 bg-red-100 text-red-800 font-semibold">
                        Ditolak PJ Unit
                      </Badge>
                    </div>
                    <p className="text-xs text-red-800 dark:text-red-300">
                      Penanggung Jawab Unit menolak rekap absensi periode <strong>{periode}</strong>. Silakan hubungi bagian Kepegawaian untuk memperbaiki data dan mengunggah ulang rekapitulasi presensi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {statusApproval === "disetujui" && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-emerald-900 dark:text-emerald-200">
                        Rekap Presensi Telah Disetujui PJ Unit (Siap Hitung)
                      </h4>
                      <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-800 font-semibold">
                        Disetujui
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300">
                      Seluruh data kehadiran pegawai telah diverifikasi dan disahkan oleh Penanggung Jawab Unit. Bendahara dapat melanjutkan proses kalkulasi remunerasi P1 periode {periode}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {statusApproval === "belum_ada" && (
              <div className="rounded-xl border border-slate-300 bg-slate-50/80 p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-slate-500" />
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        Presensi Belum Tersedia
                      </h4>
                      <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-800 font-semibold">
                        Belum Diunggah
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Berkas rekap presensi periode <strong>{periode}</strong> belum diimpor oleh Bidang Kepegawaian.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Panel>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Periode Perhitungan</p>
              <Select value={periode} onValueChange={setPeriode}>
                <SelectTrigger className="w-52 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodeList.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Panel>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel className="p-0">
                <div className="border-b p-5">
                  <h2 className="font-semibold text-sm">Daftar Periksa Kesiapan Data</h2>
                  <p className="text-xs text-muted-foreground">Validasi otomatis data sumber unit kerja.</p>
                </div>
                <ul className="divide-y text-xs sm:text-sm">
                  {cekItems.map((c) => (
                    <li key={c.label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                      <span className="flex items-center gap-2">
                        {c.siap ? (
                          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="size-4 text-rose-500 shrink-0" />
                        )}
                        <span className={c.siap ? "text-foreground font-medium" : "text-muted-foreground"}>{c.label}</span>
                      </span>
                      <span className={cn(
                        "rounded px-2.5 py-0.5 text-xs font-semibold",
                        c.siap
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300"
                      )}>
                        {c.siap ? "Siap" : "Belum Siap"}
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel className="p-0">
                <div className="border-b p-5">
                  <h2 className="font-semibold text-sm">Parameter Pokok Remunerasi</h2>
                  <p className="text-xs text-muted-foreground">Parameter acuan resmi peraturan rektor.</p>
                </div>
                <div className="divide-y text-sm">
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-muted-foreground">Poin Indeks Rupiah (PIR)</span>
                    <b className="font-mono">{rupiah(pirValue)}</b>
                  </div>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-muted-foreground">Persentase P1 (Kehadiran)</span>
                    <b>{persenP1Value}%</b>
                  </div>
                </div>
                <div className="border-t px-5 py-2 bg-muted/20 flex justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>Grade Jabatan</span>
                  <span>Remun 100% | Hak P1 ({persenP1Value}%)</span>
                </div>
                <div className="grid grid-cols-1 gap-y-1.5 px-5 py-3 text-[11px] max-h-56 overflow-y-auto">
                  {gradeParam.map((item, idx) => (
                    <div key={`${item.grade}-${idx}`} className="flex justify-between py-1 border-b border-border/40">
                      <span className="font-medium text-foreground">{item.grade}</span>
                      <div className="text-right font-mono">
                        <span className="text-muted-foreground text-[10px] mr-2">100%: {rupiah(item.nilai)}</span>
                        <b className="text-primary font-semibold">P1: {rupiah(item.p1)}</b>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            {/* Rekap Absensi yang Diunggah Kepegawaian */}
            <Panel className="p-0">
              <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="size-4 text-primary" />
                    <h2 className="font-semibold text-sm">Rekap Absensi Pegawai (Unggahan Kepegawaian)</h2>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Data kehadiran periode <strong>{periode}</strong> yang menjadi dasar perhitungan P1
                    {presensiStatus?.file_nama ? ` • Berkas: ${presensiStatus.file_nama}` : ""}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {presensiList.length} Pegawai
                  </Badge>
                  <div className="relative w-56">
                    <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                    <Input
                      value={cariAbsensi}
                      onChange={(e) => setCariAbsensi(e.target.value)}
                      placeholder="Cari NIP atau nama..."
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {presensiList.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Belum ada data absensi pegawai yang diunggah oleh Bidang Kepegawaian untuk periode {periode}.
                </div>
              ) : (
                <div className="max-h-80 overflow-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-muted/70 text-[11px] font-semibold text-muted-foreground backdrop-blur">
                      <tr>
                        <th className="px-4 py-2.5">NIP</th>
                        <th className="px-4 py-2.5">Nama Pegawai</th>
                        <th className="px-3 py-2.5 text-center">Hari Kerja</th>
                        <th className="px-3 py-2.5 text-center">Hadir</th>
                        <th className="px-3 py-2.5 text-center">Cuti/Izin</th>
                        <th className="px-3 py-2.5 text-center">Alfa</th>
                        <th className="px-3 py-2.5 text-center">TL / PSW</th>
                        <th className="px-4 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredPresensi.map((row) => (
                        <tr key={row.id || row.nip} className="hover:bg-muted/30">
                          <td className="px-4 py-2 font-mono text-[11px] text-muted-foreground">{row.nip}</td>
                          <td className="px-4 py-2 font-medium text-foreground">{row.nama}</td>
                          <td className="px-3 py-2 text-center">{row.hari_kerja}</td>
                          <td className="px-3 py-2 text-center font-medium text-emerald-700 dark:text-emerald-400">{row.hadir}</td>
                          <td className="px-3 py-2 text-center">{row.cuti_izin}</td>
                          <td className="px-3 py-2 text-center text-rose-600 dark:text-rose-400">{row.tidak_hadir}</td>
                          <td className="px-3 py-2 text-center">{row.tl} / {row.psw}</td>
                          <td className="px-4 py-2 text-center">
                            <span
                              className={cn(
                                "inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase",
                                row.status_validasi === "valid"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                              )}
                            >
                              {row.status_validasi || "valid"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            <Panel>
              <h2 className="font-semibold text-sm">Parameter Keterlambatan dan Pulang Sebelum Waktunya</h2>
              <p className="text-xs text-muted-foreground">
                PSW.1–PSW.6 memakai rentang dan tarif yang sama dengan TL.1–TL.6.
              </p>
              
              {/* Grid TL.1 s.d TL.6 */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {tlTier.map((item, index) => (
                  <div key={`${item.kode}-${index}`} className="rounded-lg bg-primary/5 p-3 text-center border border-primary/10">
                    <p className="text-xs font-bold text-primary">{item.kode}</p>
                    <p className="text-[10px] text-muted-foreground">{item.rentang} menit</p>
                    <p className="mt-1 text-sm font-bold text-foreground">{item.tarif}</p>
                  </div>
                ))}
              </div>

              {/* Grid Tarif Cuti & Alfa */}
              <div className="mt-4 grid gap-x-8 rounded-lg border sm:grid-cols-2 bg-muted/5">
                {cutiTarif.map((item, index) => (
                  <div
                    key={`${item.nama}-${index}`}
                    className="flex justify-between border-b px-3.5 py-2 text-xs last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0"
                  >
                    <span className="text-muted-foreground">{item.nama}</span>
                    <b className="font-medium text-foreground">{item.tarif}</b>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-1 text-[11px] text-muted-foreground">
                <p>• Tarif sesuai parameter resmi Universitas Andalas yang berlaku pada periode ini.</p>
                <p>
                  • Remunerasi P1 menjadi Rp 0 untuk ketidakhadiran fisik lebih dari 50%, hukuman disiplin berat, belum
                  memiliki SKP (nilai &lt; 50), CLTN, masa persiapan pensiun, Tugas Belajar 6 bulan atau lebih, atau
                  penugasan pada instansi lain.
                </p>
                <p>
                  • Pengurangan Kehadiran (Rp) dihitung dari Remunerasi P1 × Total Persentase Pengurangan dan dibulatkan
                  ke rupiah terdekat.
                </p>
              </div>
            </Panel>

            <div className="flex flex-col items-end gap-2 pt-2">
              {!siapHitung && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-md border border-rose-200 dark:border-rose-900/50">
                  <ShieldAlert className="size-4 shrink-0" />
                  <span>
                    {statusApproval === "menunggu_approval"
                      ? "Perhitungan dinonaktifkan: Rekap absensi menunggu persetujuan Penanggung Jawab Unit."
                      : statusApproval === "ditolak"
                      ? "Perhitungan dinonaktifkan: Rekap absensi ditolak oleh Penanggung Jawab Unit."
                      : "Perhitungan dinonaktifkan: Rekap absensi belum siap atau belum diimpor."}
                  </span>
                </div>
              )}
              <Button onClick={jalankan} disabled={jalan || !siapHitung} className={cn("gap-2", !siapHitung && "opacity-60 cursor-not-allowed")}>
                {jalan ? <Loader2 className="size-4 animate-spin" /> : <BarChart3 className="size-4" />}
                {jalan ? "Memproses Perhitungan P1..." : "Jalankan Perhitungan P1"}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
