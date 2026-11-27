import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  Paperclip,
  ExternalLink,
  AlertCircle,
  Lock,
  Send,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import {
  PageHeader,
  StatusBadge,
  WarningBanner,
  ConfirmDialog,
  Button,
  Timeline,
  Card,
  CardContent,
} from "./components"
import { type PengaduanStatus } from "@/types/upt"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { useAuth } from "@/context/AuthContext"

export default function PengaduanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { akun } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [pengaduan, setPengaduan] = useState<any>(null)
  const [status, setStatus] = useState<PengaduanStatus>("diteruskan")
  const [savedTanggapan, setSavedTanggapan] = useState<string>("")
  const [tanggapanInput, setTanggapanInput] = useState("")
  const [inputError, setInputError] = useState("")
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      loadPengaduanDetail()
    }
  }, [id])

  const loadPengaduanDetail = async () => {
    try {
      setLoading(true)
      const res = await uptRemunerasiService.getPengaduanEskalasiDetail(id!)
      
      setPengaduan(res.data)
      setStatus(res.data.status || "diteruskan")
      setSavedTanggapan(res.data.tanggapan || "")
    } catch (error: any) {
      console.error("Error loading pengaduan detail:", error)
      toast.error("Gagal memuat detail pengaduan")
      // Data gagal dimuat dari server, tampilkan error
    } finally {
      setLoading(false)
    }
  }

  const isSelesai = status === "selesai" || status === "Selesai"
  const isOwnPengaduan = pengaduan && akun && (
    pengaduan.pegawai_nama === akun.nama || 
    pengaduan.nip === akun.NIP
  )

  const handleKlikSelesaikan = () => {
    if (!tanggapanInput.trim()) {
      setInputError("Tanggapan wajib diisi")
      return
    }
    setInputError("")
    setIsConfirmOpen(true)
  }

  const handleConfirmSelesaikan = async () => {
    if (!pengaduan) return
    
    setSubmitting(true)
    try {
      await uptRemunerasiService.tanggapiPengaduan(pengaduan.id, {
        isi: tanggapanInput.trim(),
        status: "selesai",
      })
      
      setSavedTanggapan(tanggapanInput.trim())
      setStatus("selesai")
      setIsConfirmOpen(false)
      toast.success("Tanggapan resmi disimpan dan status pengaduan ditandai Selesai.")
      
      // Reload data
      await loadPengaduanDetail()
    } catch (error: any) {
      console.error("Error tanggapi pengaduan:", error)
      toast.error(error.response?.data?.message || "Gagal menyimpan tanggapan")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!pengaduan) {
    return (
      <div className="flex min-h-[400px] items-center justify-center flex-col gap-3">
        <AlertCircle className="size-12 text-muted-foreground" />
        <p className="text-muted-foreground">Pengaduan tidak ditemukan</p>
        <Button asChild variant="outline">
          <Link to="/upt-remunerasi/pengaduan">Kembali ke Daftar</Link>
        </Button>
      </div>
    )
  }

  const baseData = {
    id: pengaduan.id?.toString() || "-",
    tiket: pengaduan.tiket || pengaduan.nomor_tiket || "-",
    pegawai: pengaduan.pegawai_nama || pengaduan.nama || "-",
    nip: pengaduan.nip || pengaduan.NIP || "-",
    unit: pengaduan.unit || pengaduan.unit_nama || "-",
    kategori: pengaduan.kategori || "Umum",
    tanggal: pengaduan.tanggal || pengaduan.created_at || "-",
    judul: pengaduan.judul || "Detail Pengaduan",
    keterangan: pengaduan.isi || pengaduan.keterangan || "Tidak ada keterangan",
    tanggapan: pengaduan.tanggapan || null,
    status: pengaduan.status || "diteruskan",
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs px-0">
          <Link to="/upt-remunerasi/pengaduan">
            <ArrowLeft className="size-4" /> Kembali ke Daftar Pengaduan
          </Link>
        </Button>
      </div>

      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-3">
            <span>Tiket Pengaduan {baseData.tiket || baseData.id}</span>
            <StatusBadge status={status} />
          </div>
        }
        subtitle={`Kategori: ${baseData.kategori} • ${baseData.pegawai} (${baseData.unit})`}
      />

      <WarningBanner variant="info" title="Batas Wewenang Penanganan UPT">
        Koreksi data presensi/absensi <strong>bukan wewenang UPT</strong> (arahkan ke Bendahara atau Bidang Kepegawaian Unit).
        UPT Remunerasi menangani koreksi jabatan/grade, parameter perhitungan, dan penyesuaian pajak melalui pintasan di bawah.
      </WarningBanner>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h3 className="font-semibold text-lg">{baseData.judul || "Detail Pengaduan"}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Diajukan pada {baseData.tanggal} • Periode Oktober 2026
                </p>
              </div>

              <div className="rounded-lg border p-4 bg-muted/20 text-sm leading-relaxed">
                <p className="font-semibold text-xs text-muted-foreground uppercase mb-1">
                  Isi Pengaduan Pegawai
                </p>
                {baseData.keterangan ||
                  "Mohon peninjauan kembali pada komponen perhitungan remunerasi P1 bulan ini."}
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 text-xs space-y-1">
                <p className="font-semibold text-amber-900">Catatan Eskalasi dari Bidang Kepegawaian / Unit:</p>
                <p className="text-amber-800 leading-relaxed">
                  Dokumen pendukung telah diperiksa oleh unit. Diteruskan ke UPT Remunerasi untuk konfirmasi aturan
                  perhitungan pajak / penetapan grade atau validasi parameter pusat.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Lampiran Bukti Pendukung</p>
                <div className="flex items-center justify-between rounded-lg border p-3 text-xs bg-card">
                  <span className="flex items-center gap-2 font-medium">
                    <Paperclip className="size-4 text-primary" />
                    Lampiran_{baseData.id}_Bukti_Pendukung.pdf
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => toast.info(`Membuka pratinjau Lampiran_${baseData.id}_Bukti_Pendukung.pdf`)}
                  >
                    Lihat Berkas
                  </Button>
                </div>
              </div>

              {isSelesai ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>Tanggapan Resmi UPT Remunerasi (Selesai • Hanya-Baca)</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    {savedTanggapan || "Telah ditindaklanjuti dan disesuaikan pada periode berjalan."}
                  </p>
                </div>
              ) : isOwnPengaduan ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                    <Lock className="size-4 text-amber-700" />
                    <span>Akses Tanggapan Terkunci</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Pengaduan ini diajukan oleh akun Anda sendiri sehingga form tanggapan disembunyikan. Ditangani admin UPT lain.
                  </p>
                </div>
              ) : (
                <div className="border-t pt-4 space-y-3">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Tanggapan Tindak Lanjut UPT Remunerasi <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    className={`w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      inputError ? "border-rose-500" : "border-input"
                    }`}
                    rows={4}
                    placeholder="Tuliskan penjelasan tindak lanjut atau koreksi yang telah dilakukan..."
                    value={tanggapanInput}
                    onChange={(e) => {
                      setTanggapanInput(e.target.value)
                      if (inputError) setInputError("")
                    }}
                  />
                  {inputError && (
                    <p className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                      <AlertCircle className="size-3.5" /> {inputError}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button size="sm" className="gap-1.5" onClick={handleKlikSelesaikan}>
                      <Send className="size-3.5" /> Selesaikan Pengaduan
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm border-b pb-2">Pintasan Data Terkait (Oktober 2026)</h3>
              <div className="flex flex-col gap-2 text-xs">
                {[
                  { label: "Pantau Status Pengajuan", to: "/upt-remunerasi/status" },
                  { label: "Hitung Pajak & P1 Netto", to: "/upt-remunerasi/hitung" },
                  { label: "Penetapan Jabatan / Grade", to: "/upt-remunerasi/penetapan" },
                  { label: "Parameter Remunerasi", to: "/upt-remunerasi/parameter" },
                  { label: "Slip P1 Pegawai", to: "/upt-remunerasi/slip" },
                ].map((link) => (
                  <Button
                    key={link.to}
                    asChild
                    variant="outline"
                    size="sm"
                    className="justify-between h-8 text-xs"
                  >
                    <Link to={link.to}>
                      <span>{link.label}</span>
                      <ExternalLink className="size-3.5 text-muted-foreground" />
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Informasi Pelapor</h3>
              <div className="text-xs space-y-2">
                <div>
                  <p className="text-muted-foreground">Nama Pegawai</p>
                  <p className="font-semibold">{baseData.pegawai}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">NIP</p>
                  <p className="font-mono">{baseData.nip || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unit Kerja</p>
                  <p className="font-semibold">{baseData.unit}</p>
                </div>
              </div>

              <h3 className="font-semibold text-sm border-b pb-2 pt-2">Linimasa Tiket</h3>
              <Timeline
                items={[
                  {
                    pelaku: baseData.pegawai,
                    peran: "Pegawai",
                    waktu: baseData.tanggal,
                    catatan: "Pengaduan diajukan melalui portal pegawai.",
                    status: "diajukan",
                  },
                  {
                    pelaku: "Kepegawaian / Bendahara Unit",
                    peran: "Tindak Lanjut",
                    waktu: baseData.tanggal,
                    catatan: "Pemeriksaan awal di tingkat unit kerja.",
                    status: "ditindaklanjuti",
                  },
                  {
                    pelaku: "Kepegawaian Unit",
                    peran: "Eskalasi",
                    waktu: baseData.tanggal,
                    catatan: "Diteruskan ke UPT Remunerasi.",
                    status: "diteruskan",
                  },
                  ...(isSelesai
                    ? [
                        {
                          pelaku: "Dewi Anggraini",
                          peran: "UPT Remunerasi",
                          waktu: "Baru saja",
                          catatan: savedTanggapan || "Pengaduan diselesaikan oleh UPT.",
                          status: "selesai",
                        },
                      ]
                    : []),
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Selesaikan Pengaduan Eskalasi"
        description="Setelah diselesaikan, tanggapan akan dikirim ke pegawai dan tiket menjadi hanya-baca."
        summary={
          <div className="space-y-1 text-xs">
            <p className="font-semibold">{baseData.tiket || baseData.id} — {baseData.pegawai}</p>
            <p className="text-muted-foreground line-clamp-2">{tanggapanInput}</p>
          </div>
        }
        confirmText="Selesaikan Tiket"
        onConfirm={handleConfirmSelesaikan}
        disabled={submitting}
      />
    </div>
  )
}
