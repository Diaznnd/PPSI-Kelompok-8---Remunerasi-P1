import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Check,
  X,
  CheckCircle2,
  FileText,
  Download,
  Eye,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"
import {
  PageHeader,
  StatusBadge,
  Button,
  WarningBanner,
  ConfirmDialog,
  FormDialog,
  RupiahText,
  Card,
  CardContent,
} from "./components"
import {
  usulanJabatanDetailList,
  rupiah,
  type UsulanJabatanDetailItem,
} from "@/data/dummy-upt"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function PenetapanJabatanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const initialItem =
    usulanJabatanDetailList.find((u) => u.id === id) || usulanJabatanDetailList[0]

  const [data, setData] = useState<UsulanJabatanDetailItem>(initialItem)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [rejectMode, setRejectMode] = useState<"dikembalikan" | "ditolak">("dikembalikan")
  const [rejectReason, setRejectReason] = useState("")
  const [rejectError, setRejectError] = useState("")

  const selisihP1 = data.p1Baru - data.p1Lama
  const isActionable = data.status === "terverifikasi"

  const handleConfirmTetapkan = () => {
    setSaveError(null)
    if (!data.pemeriksaanOtomatis.tidakTumpangTindih) {
      setSaveError("Gagal menyimpan: terdeteksi periode jabatan yang tumpang tindih pada riwayat resmi pegawai.")
      setIsApproveOpen(false)
      return
    }

    const updatedRiwayat = data.riwayatJabatanResmi.map((r, idx) =>
      idx === 0 && r.status === "Berlaku"
        ? { ...r, selesai: "H-1 sebelum efektif", status: "Berakhir" as const }
        : r
    )

    updatedRiwayat.unshift({
      jabatan: data.jabatanBaru,
      grade: data.gradeBaru,
      nilaiJabatan: data.nilaiJabatanBaru,
      mulai: data.mulai,
      selesai: "-",
      sk: data.sk,
      status: "Berlaku",
    })

    setData((prev) => ({
      ...prev,
      status: "ditetapkan",
      riwayatJabatanResmi: updatedRiwayat,
    }))

    setIsApproveOpen(false)
    toast.success(`Jabatan ${data.pegawai} (${data.baru}) berhasil ditetapkan ke riwayat resmi.`)
  }

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectError("Catatan / alasan pengembalian atau penolakan wajib diisi.")
      return
    }

    setData((prev) => ({
      ...prev,
      status: rejectMode,
      catatan: rejectReason.trim(),
    }))
    setIsRejectOpen(false)
    toast.success(
      rejectMode === "dikembalikan"
        ? "Usulan dikembalikan ke Verifikator untuk perbaikan."
        : "Usulan jabatan ditolak."
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs px-0">
          <Link to="/upt-remunerasi/penetapan">
            <ArrowLeft className="size-4" /> Kembali ke Daftar Usulan
          </Link>
        </Button>
      </div>

      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-3">
            <span>Detail Usulan Jabatan {data.id}</span>
            <StatusBadge status={data.status} />
          </div>
        }
        subtitle={`Pemeriksaan dan penetapan penyesuaian jabatan/grade pegawai • ${data.pegawai}`}
        actions={
          isActionable ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                onClick={() => {
                  setRejectMode("dikembalikan")
                  setRejectReason("")
                  setRejectError("")
                  setIsRejectOpen(true)
                }}
              >
                <X className="size-4" /> Kembalikan / Tolak
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setIsApproveOpen(true)}
              >
                <Check className="size-4" /> Tetapkan ke Riwayat Resmi
              </Button>
            </div>
          ) : (
            <Badge variant="outline" className="text-xs px-3 py-1 bg-muted/50">
              Usulan sudah diproses ({data.status})
            </Badge>
          )
        }
      />

      {saveError && (
        <WarningBanner variant="error" title="Gagal Menetapkan Jabatan">
          {saveError} Tidak ada perubahan yang disimpan.
        </WarningBanner>
      )}

      {data.periodeEfektifSudahDiproses && (
        <WarningBanner variant="warning" title="Periode Efektif Sudah Diproses">
          Periode <strong>{data.bulanEfektifP1}</strong> sudah berstatus Diajukan / Netto Ditetapkan.{" "}
          <strong>Periode ini sudah diproses; perubahan membutuhkan koreksi susulan.</strong>
        </WarningBanner>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-semibold text-base">Identitas Pegawai & Jenis Perubahan</h3>
                <Badge variant="secondary" className="capitalize text-xs">
                  {data.jenisPerubahan}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Nama Pegawai</p>
                  <p className="font-semibold text-sm mt-0.5">{data.pegawai}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">NIP</p>
                  <p className="font-mono mt-0.5">{data.nip}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unit Kerja</p>
                  <p className="font-semibold mt-0.5">{data.unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pengusul</p>
                  <p className="font-medium mt-0.5">{data.diajukanOleh}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tanggal SPMT / Mulai</p>
                  <p className="font-semibold text-primary mt-0.5">{data.mulai} (SPMT: {data.tanggalSpmt})</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nomor SK</p>
                  <p className="font-mono mt-0.5">{data.sk}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-base border-b pb-3">Perbandingan Jabatan, Grade & Remunerasi</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="p-3 text-left font-medium">Komponen</th>
                      <th className="p-3 text-left font-medium border-l">Kondisi Lama</th>
                      <th className="p-3 text-left font-medium border-l bg-primary/5 text-primary">Usulan Baru</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3 font-medium">Jabatan</td>
                      <td className="p-3 border-l text-muted-foreground">{data.jabatanLama}</td>
                      <td className="p-3 border-l font-semibold bg-primary/5">{data.jabatanBaru}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Grade</td>
                      <td className="p-3 border-l text-muted-foreground">Grade {data.gradeLama}</td>
                      <td className="p-3 border-l font-semibold bg-primary/5">Grade {data.gradeBaru}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Nilai Jabatan</td>
                      <td className="p-3 border-l font-mono text-muted-foreground">{data.nilaiJabatanLama}</td>
                      <td className="p-3 border-l font-mono font-semibold bg-primary/5">{data.nilaiJabatanBaru}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Remunerasi per Jabatan (PIR × Nilai)</td>
                      <td className="p-3 border-l text-muted-foreground"><RupiahText value={data.remunerasiLama} /></td>
                      <td className="p-3 border-l font-semibold bg-primary/5"><RupiahText value={data.remunerasiBaru} /></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">P1 (40%)</td>
                      <td className="p-3 border-l text-muted-foreground"><RupiahText value={data.p1Lama} /></td>
                      <td className="p-3 border-l font-bold text-primary bg-primary/5"><RupiahText value={data.p1Baru} /></td>
                    </tr>
                    <tr className="bg-emerald-50/50">
                      <td className="p-3 font-semibold text-emerald-900">Selisih P1 per Bulan</td>
                      <td colSpan={2} className="p-3 border-l font-bold text-emerald-700">
                        {selisihP1 >= 0 ? `+ ${rupiah(selisihP1)}` : rupiah(selisihP1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-base border-b pb-3">Riwayat Jabatan / Grade Resmi Pegawai</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="p-3 text-left font-medium">Jabatan</th>
                      <th className="p-3 text-left font-medium">Grade / Nilai</th>
                      <th className="p-3 text-left font-medium">Mulai</th>
                      <th className="p-3 text-left font-medium">Selesai</th>
                      <th className="p-3 text-left font-medium">Nomor SK</th>
                      <th className="p-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.riwayatJabatanResmi.map((rw, idx) => (
                      <tr key={idx} className={rw.status === "Berlaku" ? "bg-emerald-50/40" : ""}>
                        <td className="p-3 font-semibold">{rw.jabatan}</td>
                        <td className="p-3 font-mono">G{rw.grade} ({rw.nilaiJabatan})</td>
                        <td className="p-3">{rw.mulai}</td>
                        <td className="p-3">{rw.selesai}</td>
                        <td className="p-3 font-mono text-muted-foreground">{rw.sk}</td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={
                              rw.status === "Berlaku"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }
                          >
                            {rw.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-sky-200 bg-sky-50/40">
            <CardContent className="p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-sky-900 font-semibold text-sm">
                <Calendar className="size-4 text-sky-600" />
                <span>Bulan Efektif P1</span>
              </div>
              <p className="text-base font-bold text-primary">
                Berlaku P1 bulan {data.bulanEfektifP1}
              </p>
              <p className="text-xs text-sky-800 leading-relaxed">
                Dihitung berdasarkan tanggal SPMT (<strong>{data.tanggalSpmt}</strong>) terhadap batas tanggal 15
                (Pasal 16 ayat 4).
              </p>
              <p className="text-[11px] italic text-sky-700 border-t border-sky-200 pt-2">
                Catatan: interpretasi perlu dikonfirmasi UPT.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Hasil Pemeriksaan Otomatis</h3>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>Tanggal SPMT terhadap batas tanggal 15 valid</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>Jabatan & grade terdaftar di Master Jabatan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>Tidak tumpang tindih dengan riwayat resmi</span>
                </li>
              </ul>

              <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-primary" /> Estimasi Dampak pada P1
                </p>
                <p className="text-sm font-bold text-emerald-700">
                  {selisihP1 >= 0 ? `+ ${rupiah(selisihP1)}` : rupiah(selisihP1)} / bulan
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm border-b pb-2 flex items-center gap-2">
                <FileText className="size-4 text-primary" /> Dokumen SK & SPMT
              </h3>
              <p className="text-xs text-muted-foreground">
                SK Nomor <span className="font-mono text-foreground">{data.sk}</span> • Tanggal {data.tanggalSK}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => setIsPdfPreviewOpen(true)}
                >
                  <Eye className="size-3.5" /> Pratinjau PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => toast.success(`Mengunduh berkas SK_${data.id}.pdf`)}
                >
                  <Download className="size-3.5" /> Unduh PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-2">
              <h3 className="font-semibold text-sm border-b pb-2">Catatan Verifikator</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {data.catatanVerifikator || data.catatan || "Tidak ada catatan tambahan."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={isApproveOpen}
        onOpenChange={setIsApproveOpen}
        title="Tetapkan ke Riwayat Resmi"
        description="Pastikan seluruh data usulan dan bulan efektif P1 sudah sesuai."
        summary={
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pegawai:</span>
              <span className="font-semibold">{data.pegawai}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Perubahan:</span>
              <span className="font-semibold">{data.lama} → {data.baru}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mulai Berlaku / Efektif P1:</span>
              <span className="font-semibold text-primary">{data.mulai} ({data.bulanEfektifP1})</span>
            </div>
            <p className="pt-2 border-t text-[11px] text-muted-foreground">
              Jabatan/grade baru dipakai pada perhitungan sesuai bulan efektif; riwayat lama tidak dihapus.
            </p>
          </div>
        }
        confirmText="Tetapkan Sekarang"
        onConfirm={handleConfirmTetapkan}
      />

      <FormDialog
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        title="Kembalikan atau Tolak Usulan"
        description="Berikan alasan atau catatan resmi yang akan dikirimkan ke pengusul dan verifikator."
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsRejectOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmReject}>
              {rejectMode === "dikembalikan" ? "Kembalikan Usulan" : "Tolak Usulan"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-foreground">Tindakan</label>
            <select
              value={rejectMode}
              onChange={(e) => setRejectMode(e.target.value as "dikembalikan" | "ditolak")}
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="dikembalikan">Kembalikan untuk Perbaikan</option>
              <option value="ditolak">Tolak Permanen</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-foreground">
              Alasan / Catatan Wajib <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value)
                setRejectError("")
              }}
              placeholder="Tuliskan alasan pengembalian atau penolakan..."
              className={`mt-1 w-full rounded-md border p-2.5 text-xs ${
                rejectError ? "border-rose-500" : "border-input"
              }`}
            />
            {rejectError && (
              <p className="mt-1 flex items-center gap-1 text-rose-600">
                <AlertCircle className="size-3.5" /> {rejectError}
              </p>
            )}
          </div>
        </div>
      </FormDialog>

      <Dialog open={isPdfPreviewOpen} onOpenChange={setIsPdfPreviewOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Pratinjau Dokumen SK & SPMT ({data.sk})</DialogTitle>
            <DialogDescription>Dokumen pendukung usulan perubahan jabatan {data.pegawai}</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/30 p-8 text-center space-y-3">
            <FileText className="mx-auto size-12 text-muted-foreground/60" />
            <p className="text-sm font-semibold">Pratinjau Berkas PDF: {data.sk}.pdf</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Placeholder pratinjau dokumen SK Rektor / SPMT resmi untuk {data.pegawai} ({data.lama} menjadi{" "}
              {data.baru}, efektif {data.mulai}).
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
