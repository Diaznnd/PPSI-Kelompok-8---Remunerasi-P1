import { useState, useMemo, useEffect } from "react"
import {
  Edit2,
  History,
  FileCheck2,
  Calendar,
  AlertTriangle,
  Receipt,
  UserCheck,
  Clock,
  ShieldAlert,
  Percent,
  Loader2,
} from "lucide-react"
import {
  PageHeader,
  DataTable,
  Button,
  Input,
  FormDialog,
  DetailDrawer,
  DrawerSection,
  DrawerSummaryCard,
  DrawerTimeline,
  WarningBanner,
  type ColumnDef,
} from "./components"
import { rupiah } from "@/lib/format"
import {
  type ParameterItem,
} from "@/types/upt"
import { Label } from "@/components/ui/label"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { toast } from "sonner"

interface TarifPajakItem {
  id: number
  kategori: string
  brutoMin: number
  brutoMax: number
  tarif: string
  tarifDecimal: number
}

const KELOMPOK_LIST = [
  { id: "Umum", nama: "Umum (PIR & % P1)", icon: Percent },
  { id: "Status Kepegawaian & Pengali", nama: "Status Kepegawaian & Pengali", icon: UserCheck },
  { id: "Ketidakhadiran", nama: "Ketidakhadiran (% per hari)", icon: Calendar },
  { id: "Keterlambatan & Pulang Cepat", nama: "Keterlambatan & Pulang Cepat", icon: Clock },
  { id: "Hukuman Disiplin", nama: "Hukuman Disiplin", icon: ShieldAlert },
  { id: "Ambang & Syarat Bayar", nama: "Ambang & Syarat Bayar", icon: AlertTriangle },
  { id: "Aturan Perubahan Jabatan", nama: "Aturan Perubahan Jabatan", icon: FileCheck2 },
  { id: "Pajak", nama: "Pajak Penghasilan (PPh)", icon: Receipt },
  { id: "Jadwal Bulanan", nama: "Jadwal Bulanan (Tabel 5.1)", icon: Calendar },
] as const

type KelompokKey = (typeof KELOMPOK_LIST)[number]["id"]

export default function ParameterRemunerasiPage() {
  const [loading, setLoading] = useState(true)
  const [selectedKelompok, setSelectedKelompok] = useState<KelompokKey>("Umum")
  const [parameters, setParameters] = useState<ParameterItem[]>([])
  const [tarifPajakList, setTarifPajakList] = useState<TarifPajakItem[]>([])
  const [loadingTarifPajak, setLoadingTarifPajak] = useState(false)

  const [historyParam, setHistoryParam] = useState<ParameterItem | null>(null)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingParam, setEditingParam] = useState<ParameterItem | null>(null)
  const [formNilai, setFormNilai] = useState("")
  const [formTanggal, setFormTanggal] = useState("")
  const [formDasarHukum, setFormDasarHukum] = useState("")
  const [formAlasan, setFormAlasan] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ nilai?: string; tanggal?: string; dasarHukum?: string }>({})

  useEffect(() => {
    loadParameters()
  }, [])
  
  useEffect(() => {
    if (selectedKelompok === "Pajak") {
      loadTarifPajak()
    }
  }, [selectedKelompok])

  const loadParameters = async () => {
    try {
      setLoading(true)
      const res = await uptRemunerasiService.getMasterParameters()
      
      // Map API response
      const mapped: ParameterItem[] = (res.data || []).map((item: any) => ({
        id: item.id?.toString() || `param-${Date.now()}`,
        kode: item.kode || item.key || "-",
        nama: item.nama || item.name || "-",
        nilai: item.nilai?.toString() || "0",
        satuan: item.satuan || item.unit || "",
        kelompok: item.kelompok || item.group || "Umum",
        keterangan: item.keterangan || item.description || "",
        berlakuMulai: item.berlaku_sejak || "2026-01-01",
        dasarHukum: item.dasar_hukum || "Peraturan Rektor",
        status: item.status || "Berlaku",
        catatanKhusus: item.catatan_khusus || null,
        dihitungAmbang: item.dihitung_ambang || false,
        berhakP1: item.berhak_p1 !== false,
        pengaliPersen: item.pengali_persen || null,
        riwayat: item.riwayat || [],
      }))
      
      setParameters(mapped)
    } catch (error: any) {
      console.error("Error loading parameters:", error)
      toast.error("Gagal memuat data parameter")
      setParameters([])
    } finally {
      setLoading(false)
    }
  }

  const loadTarifPajak = async () => {
    try {
      setLoadingTarifPajak(true)
      const res = await uptRemunerasiService.getTarifPajak()
      setTarifPajakList(res.data || [])
    } catch (error) {
      console.error("Failed to load tarif pajak:", error)
      toast.error("Gagal memuat data tarif pajak")
    } finally {
      setLoadingTarifPajak(false)
    }
  }

  const currentGroupParams = useMemo(() => {
    return parameters.filter((p) => p.kelompok === selectedKelompok)
  }, [parameters, selectedKelompok])

  const handleOpenEdit = (param: ParameterItem) => {
    setEditingParam(param)
    setFormNilai(param.nilai)
    setFormTanggal(new Date().toISOString().split("T")[0])
    setFormDasarHukum(param.dasarHukum)
    setFormAlasan("")
    setFieldErrors({})
    setEditDialogOpen(true)
  }

  const handleSaveParam = async () => {
    if (!editingParam) return
    const errors: typeof fieldErrors = {}

    if (!formNilai.trim()) {
      errors.nilai = "Nilai parameter tidak boleh kosong."
    } else if (editingParam.satuan.includes("%") || editingParam.satuan === "Persen") {
      const num = parseFloat(formNilai)
      if (isNaN(num) || num < 0 || num > 100) {
        errors.nilai = "Persentase harus berupa angka valid antara 0% hingga 100%."
      }
    } else if (editingParam.kode === "PIR" || editingParam.kode === "AMBANG_KETIDAKHADIRAN" || editingParam.kode === "BATAS_WAKTU_TUBEL" || editingParam.kode === "CUTOFF_TANGGAL_JABATAN") {
      const num = parseFloat(formNilai)
      if (isNaN(num) || num <= 0) {
        errors.nilai = "Nilai harus berupa angka positif."
      }
    }

    if (!formTanggal) {
      errors.tanggal = "Tanggal berlaku mulai wajib diisi."
    } else if (editingParam.riwayat.length > 0) {
      const lastDate = editingParam.riwayat[0].tanggal
      if (formTanggal < lastDate) {
        errors.tanggal = `Tanggal berlaku tidak boleh lebih awal dari versi sebelumnya (${lastDate}).`
      }
    }

    if (!formDasarHukum.trim()) {
      errors.dasarHukum = "Dasar hukum / nomor SK wajib diisi."
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      const numericValue = parseFloat(formNilai)
      await uptRemunerasiService.updateParameter(editingParam.id, numericValue)
      
      toast.success(`Parameter "${editingParam.nama}" berhasil diperbarui sebagai versi baru.`)
      setEditDialogOpen(false)
      
      // Reload data
      await loadParameters()
    } catch (error: any) {
      console.error("Error updating parameter:", error)
      toast.error(error.response?.data?.message || "Gagal memperbarui parameter")
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnDef<ParameterItem>[] = [
    {
      header: "Nama Parameter",
      cell: (item) => (
        <div>
          <p className="font-semibold text-xs">{item.nama}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{item.kode}</p>
        </div>
      ),
      className: "w-52",
    },
    {
      header: "Nilai Berlaku",
      cell: (item) => (
        <div>
          <span className="font-bold text-sm text-primary">
            {item.kode === "PIR" ? rupiah(Number(item.nilai)) : `${item.nilai} ${item.satuan}`}
          </span>
          {item.catatanKhusus && (
            <p className="text-[10px] text-amber-700 italic">{item.catatanKhusus}</p>
          )}
        </div>
      ),
      className: "w-44",
    },
    ...(selectedKelompok === "Ketidakhadiran"
      ? [
        {
          header: "Dihitung ke Ambang 50%",
          cell: (item: ParameterItem) => (
            <span
              className={`text-xs font-semibold ${item.dihitungAmbang ? "text-rose-600" : "text-emerald-600"
                }`}
            >
              {item.dihitungAmbang ? "Ya" : "Tidak"}
            </span>
          ),
          className: "w-36",
        },
      ]
      : []),
    ...(selectedKelompok === "Status Kepegawaian & Pengali"
      ? [
        {
          header: "Berhak P1",
          cell: (item: ParameterItem) => (
            <span className="text-xs font-semibold text-emerald-600">
              {item.berhakP1 ? "Ya" : "Tidak"}
            </span>
          ),
          className: "w-28",
        },
        {
          header: "Pengali %",
          cell: (item: ParameterItem) => (
            <span className="text-xs font-bold">{item.pengaliPersen ?? item.nilai}%</span>
          ),
          className: "w-28",
        },
      ]
      : []),
    {
      header: "Berlaku Mulai",
      accessorKey: "berlakuMulai",
      className: "w-28 text-xs text-muted-foreground",
    },
    {
      header: "Status",
      cell: (item) => (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.status === "Berlaku"
            ? "bg-emerald-100 text-emerald-800"
            : item.status === "Terjadwal"
              ? "bg-amber-100 text-amber-800"
              : "bg-muted text-muted-foreground"
            }`}
        >
          {item.status}
        </span>
      ),
      className: "w-24",
    },
    {
      header: "Keterangan",
      accessorKey: "keterangan",
      className: "text-xs text-muted-foreground",
    },
    {
      header: "Aksi",
      cell: (item) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-primary"
            onClick={() => handleOpenEdit(item)}
          >
            <Edit2 className="size-3.5" /> Ubah
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-muted-foreground"
            onClick={() => setHistoryParam(item)}
          >
            <History className="size-3.5" /> Riwayat
          </Button>
        </div>
      ),
      className: "w-36 text-right",
    },
  ]

  const pajakColumns: ColumnDef<TarifPajakItem>[] = [
    { header: "Kategori TER PPh 21", accessorKey: "kategori", className: "font-semibold text-xs" },
    {
      header: "Rentang Penghasilan Bruto",
      cell: (item) => (
        <span className="text-xs">
          {rupiah(item.brutoMin)} s.d. {rupiah(item.brutoMax)}
        </span>
      ),
    },
    {
      header: "Tarif Efektif",
      cell: (item) => <span className="font-bold text-xs text-primary">{item.tarif}</span>,
      className: "w-28",
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parameter Remunerasi"
        subtitle="Konfigurasi rumus perhitungan, persentase potongan presensi, pengali status, dan jadwal siklus bulanan P1."
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-2 shadow-none lg:col-span-1 space-y-1">
          <p className="px-3 py-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            Kelompok Parameter
          </p>
          {KELOMPOK_LIST.map(({ id, nama, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedKelompok(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-colors ${selectedKelompok === id
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <Icon className="size-4 shrink-0" />
              <span className="leading-tight">{nama}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-foreground">{selectedKelompok}</h3>
              <p className="text-xs text-muted-foreground">
                Setiap perubahan nilai akan dicatat sebagai versi riwayat baru.
              </p>
            </div>
          </div>

          {selectedKelompok === "Pajak" && (
            <WarningBanner variant="warning" title="Konfirmasi Kebijakan Pajak">
              Aturan pajak menunggu konfirmasi UPT. Angka dan rentang tarif di bawah ini merupakan
              skema acuan TER (Tarif Efektif Rata-Rata) simulasi mock sampai peraturan definitif
              diterbitkan.
            </WarningBanner>
          )}

          {selectedKelompok === "Ketidakhadiran" && (
            <WarningBanner variant="info" title="Ketentuan Ambang Kehadiran 50%">
              Ketidakhadiran yang dihitung ke ambang (Sakit, Bersalin, Alpa, Cuti Alasan Penting) jika
              secara total melebihi 50% hari kerja dalam satu periode akan menyebabkan hak P1 periode
              tersebut menjadi <strong>Rp 0 (hangus)</strong>. Cuti tahunan dan tugas dinas resmi tidak
              mengurangi P1.
            </WarningBanner>
          )}

          {selectedKelompok === "Keterlambatan & Pulang Cepat" && (
            <WarningBanner variant="info" title="Tabel 2.2 Keterlambatan / Pulang Cepat">
              Kekurangan jam kerja rentang 1 (1 s.d. 60 menit) tidak dikenakan potongan (0%) apabila
              kekurangan jam tersebut diganti pada hari kerja yang sama.
            </WarningBanner>
          )}

          <DataTable columns={columns} data={currentGroupParams} pageSize={10} />

          {selectedKelompok === "Pajak" && (
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-xs text-muted-foreground uppercase">
                Simulasi Matriks Tarif Efektif Rata-Rata (TER 2024)
              </h4>
              {loadingTarifPajak ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : tarifPajakList.length > 0 ? (
                <DataTable columns={pajakColumns} data={tarifPajakList} pageSize={10} />
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Data tarif pajak belum tersedia
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <FormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title={`Ubah Parameter: ${editingParam?.nama}`}
        description="Perubahan akan dicatat sebagai revisi baru. Nilai sebelumnya tidak akan terhapus dari audit histori."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleSaveParam} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" /> Menyimpan...
                </>
              ) : (
                "Simpan Versi Baru"
              )}
            </Button>
          </div>
        }
      >
        {editingParam && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">Kode Parameter</Label>
              <Input disabled value={editingParam.kode} className="bg-muted font-mono" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">
                Nilai Baru ({editingParam.satuan}) *
              </Label>
              <Input
                value={formNilai}
                onChange={(e) => setFormNilai(e.target.value)}
                placeholder={`Contoh: ${editingParam.nilai}`}
              />
              {fieldErrors.nilai && (
                <p className="text-xs text-rose-600 font-medium">{fieldErrors.nilai}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Tanggal Mulai Berlaku *</Label>
                <Input
                  type="date"
                  value={formTanggal}
                  onChange={(e) => setFormTanggal(e.target.value)}
                />
                {fieldErrors.tanggal && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.tanggal}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Dasar Hukum (SK Rektor) *</Label>
                <Input
                  value={formDasarHukum}
                  onChange={(e) => setFormDasarHukum(e.target.value)}
                  placeholder="Contoh: SK/R/02/2026"
                />
                {fieldErrors.dasarHukum && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.dasarHukum}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Alasan Perubahan / Catatan Revisi</Label>
              <Input
                value={formAlasan}
                onChange={(e) => setFormAlasan(e.target.value)}
                placeholder="Jelaskan latar belakang penyesuaian parameter..."
              />
            </div>
          </div>
        )}
      </FormDialog>

      <DetailDrawer
        open={!!historyParam}
        onClose={() => setHistoryParam(null)}
        title={`Riwayat Parameter: ${historyParam?.nama ?? ""}`}
        subtitle={historyParam ? `Histori versi perubahan nilai parameter [${historyParam.kode}].` : undefined}
        size="md"
        footer={
          <Button variant="outline" onClick={() => setHistoryParam(null)}>
            Tutup
          </Button>
        }
      >
        {historyParam && (
          <>
            <DrawerSummaryCard
              items={[
                { label: "Kode Parameter", value: historyParam.kode, mono: true },
                { label: "Nilai Berlaku", value: `${historyParam.nilai} ${historyParam.satuan}` },
                { label: "Berlaku Sejak", value: historyParam.berlakuMulai },
                { label: "Dasar Hukum", value: historyParam.dasarHukum },
              ]}
            />

            <DrawerSection title="Histori Versi Parameter">
              <DrawerTimeline
                items={historyParam.riwayat.map((hist, idx) => ({
                  tahap: `${hist.versi} — ${hist.nilai} ${historyParam.satuan}`,
                  status: idx === 0 ? "berjalan" : "selesai",
                  tanggal: hist.tanggal,
                  pelaku: hist.dasarHukum,
                  catatan: hist.alasan,
                }))}
              />
            </DrawerSection>
          </>
        )}
      </DetailDrawer>
    </div>
  )
}
