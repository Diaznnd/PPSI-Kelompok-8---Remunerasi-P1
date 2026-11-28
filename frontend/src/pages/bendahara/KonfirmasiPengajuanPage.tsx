import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldCheck,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeading, Panel } from "@/components/pegawai/shared"
import { bendaharaService } from "@/services/bendaharaService"
import { rupiah } from "@/lib/format"

export default function KonfirmasiPengajuanPage() {
  const { akun } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [setuju, setSetuju] = useState(false)
  const [modal, setModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPreviewTable, setShowPreviewTable] = useState(false)
  const [rows, setRows] = useState<any[]>([])
  const [ringkasan, setRingkasan] = useState<any>({
    pegawai: 0,
    remP1: 0,
    pengurangan: 0,
    bruto: 0,
    pajak: 0,
    netto: 0,
    nolCount: 0,
    disiplinCount: 0,
  })
  const [catatan, setCatatan] = useState("")

  const unitNama = akun?.unit_nama || "Unit Kerja"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await bendaharaService.getPratinjau("2026-10")

        if (res?.ringkasan) {
          setRingkasan(res.ringkasan)
        }
        if (Array.isArray(res?.data)) {
          setRows(res.data)
        } else if (Array.isArray(res?.pegawai)) {
          setRows(res.pegawai)
        }

        const statusRes = await bendaharaService.getStatus()
        if (statusRes?.data && statusRes.data.length > 0) {
          const latest = statusRes.data[0]
          if (latest.dikembalikan && latest.riwayat && latest.riwayat.length > 0) {
            setCatatan(latest.riwayat[0].catatan || "")
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Gagal memuat data ringkasan")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handleKonfirmasi() {
    setSubmitting(true)
    try {
      await bendaharaService.ajukan({
        periode: "2026-10",
        psk_nama: "Dekan " + unitNama,
        catatan: "Pengajuan perhitungan P1 unit diajukan oleh Bendahara.",
      })
      toast.success("Pengajuan P1 berhasil dikirimkan ke Verifikator.")
      navigate("/bendahara/perhitungan/berhasil")
    } catch (error) {
      console.error("Error submitting pengajuan:", error)
      toast.error("Gagal mengirim pengajuan")
    } finally {
      setSubmitting(false)
      setModal(false)
    }
  }

  const totalNetto = ringkasan.netto || Math.max(0, (ringkasan.bruto || 0) - (ringkasan.pajak || 0))

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Memuat data ringkasan pengajuan...</span>
        </div>
      )}

      {!loading && (
        <>
          <Link to="/bendahara/perhitungan/hasil" className="mb-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <ArrowLeft className="size-3" /> Kembali ke Pratinjau Perhitungan
          </Link>
          <PageHeading
            title="Konfirmasi & Pengajuan P1"
            desc={`Validasi akhir ringkasan anggaran dan daftar pegawai sebelum dikunci ke Verifikator • ${unitNama}`}
          />

          <div className="space-y-6 pb-10">
            {/* Value Proposition Banner */}
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 p-6 text-white shadow-lg">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <ShieldCheck className="size-5" />
                  Checkpoint Kepatuhan & Transparansi
                </div>
                <h2 className="mt-3 text-2xl font-bold">Validasi Terakhir Sebelum Pengajuan Resmi</h2>
                <p className="mt-2 text-sm text-emerald-100/90 max-w-2xl">
                  Tahap ini memastikan data perhitungan P1 sudah akurat, sesuai absensi, dan siap dikirim ke Verifikator untuk pemeriksaan compliance. 
                  Setelah diajukan, data akan terkunci hingga disetujui atau dikembalikan.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Badge className="bg-white/20 text-white hover:bg-white/25 border-white/30">
                    <CheckCircle2 className="mr-1 size-3" /> {ringkasan.pegawai} Pegawai Tervalidasi
                  </Badge>
                  <Badge className="bg-white/20 text-white hover:bg-white/25 border-white/30">
                    <Wallet className="mr-1 size-3" /> {rupiah(totalNetto)} Total Anggaran
                  </Badge>
                </div>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent"></div>
            </div>

            {catatan && (
              <Panel className="border-l-4 border-l-amber-500 bg-amber-50/60 dark:bg-amber-950/20">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">Catatan Pengembalian Sebelumnya</p>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">{catatan}</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link to="/bendahara/perhitungan/hasil">Tinjau Ulang Perhitungan</Link>
                </Button>
              </Panel>
            )}

            {/* Executive Summary Banner */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Panel className="border-l-4 border-l-primary">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Unit &amp; Periode</span>
                  <Users className="size-4 text-primary" />
                </div>
                <p className="mt-2 text-base font-bold truncate">{unitNama}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Oktober 2026 • <strong>{ringkasan.pegawai} Pegawai</strong>
                </p>
              </Panel>

              <Panel className="border-l-4 border-l-sky-500">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total P1 Awal (40%)</span>
                  <CheckCircle2 className="size-4 text-sky-600" />
                </div>
                <p className="mt-2 text-lg font-bold">{rupiah(ringkasan.remP1 || 0)}</p>
                <p className="mt-0.5 text-xs text-rose-600">
                  Potongan Hadir: - {rupiah(ringkasan.pengurangan || 0)}
                </p>
              </Panel>

              <Panel className="border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Bruto &amp; Pajak</span>
                  <ShieldCheck className="size-4 text-amber-600" />
                </div>
                <p className="mt-2 text-lg font-bold">{rupiah(ringkasan.bruto || 0)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  PPh 21: {rupiah(ringkasan.pajak || 0)}
                </p>
              </Panel>

              <Panel className="border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
                  <span className="font-semibold">Total P1 Netto Diajukan</span>
                  <Wallet className="size-4 text-emerald-600" />
                </div>
                <p className="mt-2 text-xl font-extrabold text-emerald-700 dark:text-emerald-300">{rupiah(totalNetto)}</p>
                <p className="mt-0.5 text-[11px] text-emerald-700/80 dark:text-emerald-400">Siap diajukan ke Verifikator</p>
              </Panel>
            </div>

            {/* Preview Rincian Pegawai (Collapsible) */}
            {rows.length > 0 && (
              <Panel className="p-0">
                <button
                  type="button"
                  onClick={() => setShowPreviewTable((v) => !v)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/30"
                >
                  <div>
                    <h3 className="text-sm font-semibold">Pratinjau Daftar Pegawai ({rows.length} orang)</h3>
                    <p className="text-xs text-muted-foreground">Klik untuk memeriksa rincian nominal per pegawai sebelum dikunci.</p>
                  </div>
                  {showPreviewTable ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
                {showPreviewTable && (
                  <div className="max-h-72 overflow-auto border-t">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-muted/70 text-left text-[11px] text-muted-foreground backdrop-blur">
                        <tr>
                          <th className="px-4 py-2">NIP / Nama</th>
                          <th className="px-4 py-2">Jabatan &amp; Grade</th>
                          <th className="px-4 py-2 text-right">P1 Awal</th>
                          <th className="px-4 py-2 text-right">Potongan</th>
                          <th className="px-4 py-2 text-right">PPh 21</th>
                          <th className="px-4 py-2 text-right">Netto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rows.map((r: any) => (
                          <tr key={r.nip || r.NIP} className="hover:bg-muted/20">
                            <td className="px-4 py-2">
                              <p className="font-medium">{r.nama}</p>
                              <p className="font-mono text-[10px] text-muted-foreground">{r.nip || r.NIP}</p>
                            </td>
                            <td className="px-4 py-2">{r.jabatan || "-"} ({r.grade || "-"})</td>
                            <td className="px-4 py-2 text-right">{rupiah(r.remP1 || r.p1_gross || 0)}</td>
                            <td className="px-4 py-2 text-right text-rose-600">{rupiah(r.pengurangan || r.pengurangan_rp || 0)}</td>
                            <td className="px-4 py-2 text-right">{rupiah(r.pajak || r.pajak_pph21 || 0)}</td>
                            <td className="px-4 py-2 text-right font-bold text-primary">{rupiah(r.netto || r.p1_netto || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            )}

            {/* Pemeriksaan Anomali & Pernyataan Kepatuhan */}
            <Panel className="p-0">
              <div className="flex items-center justify-between border-b p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <TriangleAlert className="size-4 text-orange-600" /> Pemeriksaan Kepatuhan &amp; Anomali
                </div>
                <Badge variant="outline" className="text-xs">Wajib Konfirmasi</Badge>
              </div>
              <div className="divide-y">
                {[
                  [`${ringkasan.nolCount} pegawai memiliki Remunerasi P1 Rp 0`, ringkasan.nolCount === 0 ? "Aman" : "Sudah Ditinjau"],
                  [`${ringkasan.disiplinCount} pegawai memiliki hukuman disiplin aktif`, ringkasan.disiplinCount === 0 ? "Aman" : "Sudah Ditinjau"],
                ].map(([t, status]) => (
                  <div key={t} className="flex items-center justify-between px-5 py-3 text-xs">
                    <span>{t}</span>
                    <Badge variant="secondary">{status}</Badge>
                  </div>
                ))}
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 bg-muted/20 px-5 py-4 text-xs font-medium">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={setuju}
                  onChange={(e) => setSetuju(e.target.checked)}
                />
                Saya menyatakan bahwa seluruh data perhitungan P1 {unitNama} telah diperiksa dan sesuai dengan dokumen absensi resmi.
              </label>
              <div className="flex justify-end gap-2 border-t p-4">
                <Button asChild variant="outline">
                  <Link to="/bendahara/perhitungan/hasil">Kembali ke Pratinjau</Link>
                </Button>
                <Button disabled={!setuju} onClick={() => setModal(true)}>
                  Kunci &amp; Ajukan ke Verifikator
                </Button>
              </div>
            </Panel>
          </div>

          <Dialog open={modal} onOpenChange={setModal}>
            <DialogContent showCloseButton={false} className="sm:max-w-lg">
              <DialogHeader className="items-center space-y-3 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg">
                  <ShieldCheck className="size-7" />
                </div>
                <DialogTitle className="text-xl">Konfirmasi Pengajuan Resmi P1</DialogTitle>
                <DialogDescription className="text-sm">
                  Anda akan mengajukan perhitungan P1 periode <strong>Oktober 2026</strong> dengan total anggaran <strong className="text-primary">{rupiah(totalNetto)}</strong> untuk <strong>{ringkasan.pegawai} pegawai</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
                  <TriangleAlert className="size-4" />
                  Perhatian: Data Akan Terkunci
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Setelah diajukan, data perhitungan akan <strong>terkunci</strong> selama proses verifikasi. 
                  Anda tidak dapat melakukan koreksi hingga pengajuan selesai diperiksa atau dikembalikan oleh Verifikator.
                </p>
              </div>

              <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-4 space-y-2">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">Tahap Selanjutnya:</p>
                <ol className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1 list-decimal list-inside">
                  <li>Verifikator memeriksa kelengkapan & kepatuhan data</li>
                  <li>Jika disetujui, lanjut ke UPT Remunerasi untuk penetapan pajak</li>
                  <li>Setelah ditetapkan, slip P1 otomatis terbit ke pegawai</li>
                </ol>
              </div>

              <DialogFooter className="mt-4 flex-col gap-2 sm:flex-row sm:justify-center">
                <Button variant="outline" onClick={() => setModal(false)} disabled={submitting} className="w-full sm:w-auto">
                  Tinjau Ulang
                </Button>
                <Button onClick={handleKonfirmasi} disabled={submitting} className="w-full sm:w-auto gap-2">
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Mengirim Pengajuan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Ya, Ajukan Sekarang
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  )
}
