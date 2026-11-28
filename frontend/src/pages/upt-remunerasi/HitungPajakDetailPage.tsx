import { useState, useMemo, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Info,
  Eye,
  Edit3,
  ShieldAlert,
  Lock,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react"
import { toast } from "sonner"
import {
  PageHeader,
  StatusBadge,
  Stepper,
  Button,
  WarningBanner,
  ConfirmDialog,
  FormDialog,
  DetailDrawer,
  DrawerSection,
  DrawerSummaryCard,
  Input,
  RupiahText,
  DataTable,
  EmptyHint,
  type ColumnDef,
} from "./components"
import {
  type PegawaiHitungP1Item,
  type UPTStatus,
} from "@/types/upt"
import { rupiah } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { LembarVerifikasiModal } from "@/components/upt-remunerasi/LembarVerifikasiModal"

type ValidationFilterKey =
  | "semua"
  | "ketidakhadiranLebih50"
  | "hukumanDisiplinAktif"
  | "jabatanBerubah"
  | "tidakMemenuhiSyaratBayar"
  | "dikoreksiBendahara"

export default function HitungPajakDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const decodedId = decodeURIComponent(id ?? "")
  const [pengajuan, setPengajuan] = useState<any>(null)

  const [status, setStatus] = useState<UPTStatus>("terverifikasi")
  const isAlreadyFinal = status === "netto_ditetapkan" || status === "amprah_tersedia"
  const isReadyToProcess = status === "terverifikasi"

  const [loading, setLoading] = useState(true)
  const [isCalculated, setIsCalculated] = useState<boolean>(isAlreadyFinal)
  const [hitungError, setHitungError] = useState<string | null>(null)

  const [pegawaiList, setPegawaiList] = useState<PegawaiHitungP1Item[]>([])
  const [activeFilter, setActiveFilter] = useState<ValidationFilterKey>("semua")

  const [selectedPegawai, setSelectedPegawai] = useState<PegawaiHitungP1Item | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [isConfirmTetapkanOpen, setIsConfirmTetapkanOpen] = useState(false)
  const [isLembarVerifOpen, setIsLembarVerifOpen] = useState(false)

  const [isKoreksiOpen, setIsKoreksiOpen] = useState(false)
  const [koreksiTarget, setKoreksiTarget] = useState<PegawaiHitungP1Item | null>(null)
  const [koreksiNominal, setKoreksiNominal] = useState("")
  const [koreksiAlasan, setKoreksiAlasan] = useState("")
  const [koreksiError, setKoreksiError] = useState("")

  // Fetch detail data from API
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true)
        const response = await uptRemunerasiService.getHitungPajakDetail(decodedId)
        const pengajuanData = response.data?.pengajuan || response.pengajuan || response.data
        const pegawaiRaw = response.data?.pegawai || response.pegawai || []
        
        if (pengajuanData) {
          setPengajuan(pengajuanData)
          setStatus(pengajuanData.status || "terverifikasi")
          const mappedPegawai: PegawaiHitungP1Item[] = (Array.isArray(pegawaiRaw) ? pegawaiRaw : []).map((p: any) => ({
            id: String(p.id || p.nip),
            nama: p.nama,
            nip: p.nip,
            grade: p.grade,
            jabatan: p.jabatan || "Pegawai",
            statusKepegawaian: p.status_kepegawaian || p.statusKepegawaian || "PNS",
            p1Gross: p.bruto || p.p1_gross || 0,
            pengaliStatus: p.pengali_status || 100,
            potonganKehadiran: p.potongan_kehadiran || 0,
            rincianKehadiran: p.rincian_kehadiran || [],
            potonganHukdis: p.potongan_hukdis || 0,
            rincianHukdis: p.rincian_hukdis || "",
            totalPotongan: p.total_potongan || 0,
            persenKetidakhadiran: p.persen_ketidakhadiran || 0,
            p1SetelahPotongan: p.p1_setelah_potongan || p.bruto || 0,
            tarifPajakPersen: p.tarif_pajak ? parseFloat(p.tarif_pajak) : (p.tarifPajakPersen || 5),
            pajak: p.pajak || 0,
            netto: p.netto || 0,
            melebihiAmbang50: p.melebihi_ambang_50 || false,
            catatan: p.catatan || "",
            flags: {
              ketidakhadiranLebih50: p.flags?.ketidakhadiran_lebih_50 || false,
              hukumanDisiplinAktif: p.flags?.hukuman_disiplin_aktif || false,
              jabatanBerubah: p.flags?.jabatan_berubah || false,
              tidakMemenuhiSyaratBayar: p.flags?.tidak_memenuhi_syarat_bayar || false,
              dikoreksiBendahara: p.flags?.dikoreksi_bendahara || false,
            },
            riwayatKoreksiPajak: p.riwayat_koreksi_pajak || [],
          }))
          setPegawaiList(mappedPegawai)
        }
      } catch (error) {
        console.error("Error fetching detail:", error)
        toast.error("Gagal memuat detail pengajuan dari database.")
        setPengajuan(null)
        setPegawaiList([])
      } finally {
        setLoading(false)
      }
    }

    if (decodedId) {
      fetchDetail()
    }
  }, [decodedId])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!pengajuan) {
    return <EmptyHint text="Pengajuan tidak ditemukan di database." />
  }

  const currentStep =
    status === "amprah_tersedia"
      ? 4
      : status === "netto_ditetapkan"
      ? 3
      : status === "terverifikasi"
      ? 2
      : 1

  const totals = useMemo(() => {
    const gross = pegawaiList.reduce((s, p) => s + p.p1Gross, 0)
    const potongan = pegawaiList.reduce((s, p) => s + p.totalPotongan, 0)
    const setelahPotongan = pegawaiList.reduce((s, p) => s + p.p1SetelahPotongan, 0)
    const pajak = pegawaiList.reduce((s, p) => s + p.pajak, 0)
    const netto = pegawaiList.reduce((s, p) => s + p.netto, 0)
    return { gross, potongan, setelahPotongan, pajak, netto }
  }, [pegawaiList])

  const flagCounts = useMemo(
    () => ({
      ketidakhadiranLebih50: pegawaiList.filter((p) => p.flags.ketidakhadiranLebih50).length,
      hukumanDisiplinAktif: pegawaiList.filter((p) => p.flags.hukumanDisiplinAktif).length,
      jabatanBerubah: pegawaiList.filter((p) => p.flags.jabatanBerubah).length,
      tidakMemenuhiSyaratBayar: pegawaiList.filter((p) => p.flags.tidakMemenuhiSyaratBayar).length,
      dikoreksiBendahara: pegawaiList.filter((p) => p.flags.dikoreksiBendahara).length,
    }),
    [pegawaiList]
  )

  const filteredPegawai = useMemo(() => {
    if (activeFilter === "semua") return pegawaiList
    return pegawaiList.filter((p) => p.flags[activeFilter])
  }, [pegawaiList, activeFilter])

  const handleHitungPreview = () => {
    setHitungError(null)
    setIsCalculated(true)
    toast.success("Pratinjau perhitungan pajak PPh 21 TER dan P1 Netto berhasil dihitung (belum disimpan).")
  }

  const handleConfirmTetapkanNetto = async () => {
    try {
      setLoading(true)
      const response = await uptRemunerasiService.tetapkanNetto(decodedId, {
        catatan: "P1 Netto ditetapkan oleh UPT Remunerasi"
      })

      if (response.success || response.message) {
        setStatus("netto_ditetapkan")
        setIsConfirmTetapkanOpen(false)
        setIsLembarVerifOpen(true)
        toast.success("Pengajuan P1 disahkan! Lembar Verifikasi resmi diterbitkan dan Slip P1 Netto otomatis dirilis ke pegawai.")
      } else {
        toast.error(response.message || "Gagal menetapkan netto.")
      }
    } catch (error: any) {
      console.error("Error tetapkan netto:", error)
      toast.error(error.response?.data?.message || "Gagal menetapkan netto.")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenKoreksi = (item: PegawaiHitungP1Item) => {
    setKoreksiTarget(item)
    setKoreksiNominal(String(item.pajak))
    setKoreksiAlasan("")
    setKoreksiError("")
    setIsKoreksiOpen(true)
  }

  const handleSaveKoreksi = () => {
    if (!koreksiTarget) return

    const nominalBaru = Number(koreksiNominal)
    if (Number.isNaN(nominalBaru) || nominalBaru < 0) {
      setKoreksiError("Nominal pajak tidak boleh negatif.")
      return
    }
    if (nominalBaru > koreksiTarget.p1SetelahPotongan) {
      setKoreksiError(
        `Nominal pajak tidak boleh melebihi P1 Setelah Potongan (${rupiah(koreksiTarget.p1SetelahPotongan)}).`
      )
      return
    }
    if (!koreksiAlasan.trim()) {
      setKoreksiError("Alasan koreksi pajak wajib diisi dan akan tercatat di jejak audit.")
      return
    }

    const updatedNetto = koreksiTarget.p1SetelahPotongan - nominalBaru
    const logEntry = {
      waktu: "Baru saja",
      oleh: "Dewi Anggraini (UPT)",
      nominalLama: koreksiTarget.pajak,
      nominalBaru,
      alasan: koreksiAlasan.trim(),
    }

    setPegawaiList((prev) =>
      prev.map((p) =>
        p.id === koreksiTarget.id
          ? {
              ...p,
              pajak: nominalBaru,
              netto: updatedNetto,
              riwayatKoreksiPajak: [logEntry, ...p.riwayatKoreksiPajak],
            }
          : p
      )
    )

    if (selectedPegawai?.id === koreksiTarget.id) {
      setSelectedPegawai((prev) =>
        prev
          ? {
              ...prev,
              pajak: nominalBaru,
              netto: updatedNetto,
              riwayatKoreksiPajak: [logEntry, ...prev.riwayatKoreksiPajak],
            }
          : null
      )
    }

    setIsKoreksiOpen(false)
    toast.success(`Koreksi pajak ${koreksiTarget.nama} diterapkan pada pratinjau dan dicatat di jejak audit.`)
  }

  const columns: ColumnDef<PegawaiHitungP1Item>[] = [
    {
      header: "Nama / NIP",
      cell: (item) => (
        <div>
          <p className="font-semibold text-xs text-foreground">{item.nama}</p>
          <p className="text-[11px] font-mono text-muted-foreground">{item.nip}</p>
        </div>
      ),
    },
    {
      header: "Grade",
      cell: (item) => <Badge variant="outline" className="text-[11px] font-mono">G{item.grade}</Badge>,
      className: "w-16",
    },
    {
      header: "P1 Gross",
      cell: (item) => <RupiahText value={item.p1Gross} className="text-xs" />,
    },
    {
      header: "Pengali",
      cell: (item) => <span className="text-xs font-medium">{item.pengaliStatus}%</span>,
      className: "w-20",
    },
    {
      header: "Pot. Kehadiran",
      cell: (item) => <RupiahText value={item.potonganKehadiran} className="text-xs text-rose-700" />,
    },
    {
      header: "Pot. Hukdis",
      cell: (item) => <RupiahText value={item.potonganHukdis} className="text-xs text-rose-700" />,
    },
    {
      header: "P1 Stlh Potongan",
      cell: (item) => <RupiahText value={item.p1SetelahPotongan} className="text-xs font-semibold" />,
    },
    {
      header: "Pajak",
      cell: (item) =>
        !isCalculated ? (
          <span className="text-[11px] italic text-muted-foreground">Belum dihitung</span>
        ) : (
          <div className="flex items-center gap-1">
            <RupiahText value={item.pajak} className="text-xs" />
            {item.riwayatKoreksiPajak.length > 0 && (
              <span title="Telah dikoreksi UPT" className="text-[10px] text-amber-700 font-semibold">
                *
              </span>
            )}
          </div>
        ),
    },
    {
      header: "Netto",
      cell: (item) =>
        !isCalculated ? (
          <span className="text-[11px] italic text-muted-foreground">Belum dihitung</span>
        ) : (
          <RupiahText
            value={item.netto}
            className={`text-xs font-bold ${item.melebihiAmbang50 ? "text-rose-600" : "text-emerald-700"}`}
          />
        ),
    },
    {
      header: "Catatan",
      cell: (item) => {
        const hasFlag = Object.values(item.flags).some(Boolean)
        return (
          <div title={item.catatan} className="flex justify-center">
            {item.melebihiAmbang50 ? (
              <AlertTriangle className="size-4 text-rose-600" />
            ) : hasFlag ? (
              <Info className="size-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="size-4 text-emerald-600" />
            )}
          </div>
        )
      },
      className: "w-16 text-center",
    },
    {
      header: "Aksi",
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-primary gap-1"
            onClick={() => {
              setSelectedPegawai(item)
              setIsDrawerOpen(true)
            }}
          >
            <Eye className="size-3.5" /> Rincian
          </Button>
          {isReadyToProcess && isCalculated && !item.melebihiAmbang50 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-amber-700 hover:bg-amber-50"
              onClick={() => handleOpenKoreksi(item)}
              title="Koreksi Pajak"
            >
              <Edit3 className="size-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const validationCards: { key: ValidationFilterKey; label: string; count: number }[] = [
    { key: "ketidakhadiranLebih50", label: "Ketidakhadiran > 50%", count: flagCounts.ketidakhadiranLebih50 },
    { key: "hukumanDisiplinAktif", label: "Hukuman Disiplin Aktif", count: flagCounts.hukumanDisiplinAktif },
    { key: "jabatanBerubah", label: "Jabatan / Grade Berubah", count: flagCounts.jabatanBerubah },
    { key: "tidakMemenuhiSyaratBayar", label: "Tidak Memenuhi Syarat Bayar", count: flagCounts.tidakMemenuhiSyaratBayar },
    { key: "dikoreksiBendahara", label: "Data Dikoreksi Bendahara", count: flagCounts.dikoreksiBendahara },
  ]

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="px-0 text-xs gap-1.5"
              onClick={() => navigate("/upt-remunerasi/hitung")}
            >
              <ArrowLeft className="size-4" /> Kembali ke Daftar Pengajuan
            </Button>
          </div>

      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-3">
            <span>{pengajuan.unit}</span>
            <StatusBadge status={status} />
          </div>
        }
        subtitle={`Kode: ${pengajuan.id || pengajuan.nomor} • Periode: ${pengajuan.periode} • Unit: ${pengajuan.unit}`}
        actions={
          isReadyToProcess ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleHitungPreview}
              >
                <Calculator className="size-4" /> {isCalculated ? "Hitung Ulang Pratinjau" : "Hitung"}
              </Button>
              <Button
                size="sm"
                disabled={!isCalculated}
                className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white"
                onClick={() => setIsConfirmTetapkanOpen(true)}
              >
                <CheckCircle2 className="size-4" /> Sahkan & Terbitkan Slip Netto
              </Button>
            </div>
          ) : isAlreadyFinal ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsLembarVerifOpen(true)}
              >
                <FileText className="size-4" /> Lembar Verifikasi Resmi
              </Button>
              <Badge variant="outline" className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-1">
                <Lock className="size-3.5" /> Disahkan UPT
              </Badge>
            </div>
          ) : undefined
        }
      />

      <Stepper
        steps={["Diajukan", "Terverifikasi", "Netto Ditetapkan", "Amprah Tersedia"]}
        currentStep={currentStep}
      />

      {hitungError && (
        <WarningBanner variant="error" title="Perhitungan Gagal">
          {hitungError} Tidak ada perubahan yang disimpan.
        </WarningBanner>
      )}

      {isAlreadyFinal && (
        <WarningBanner variant="info" title="Netto ditetapkan; slip terbit otomatis">
          Perhitungan P1 Netto telah ditetapkan secara final. Seluruh slip P1 pegawai unit{" "}
          <strong>{pengajuan.unit}</strong> telah diterbitkan otomatis dan data kini bersifat hanya-baca.
        </WarningBanner>
      )}

      {isReadyToProcess && isCalculated && (
        <WarningBanner variant="warning" title="Mode Pratinjau (Belum Disimpan)">
          Hasil perhitungan pajak dan P1 Netto di bawah ini masih berupa pratinjau sementara. Klik{" "}
          <strong>Tetapkan Netto</strong> untuk mengunci hasil dan menerbitkan slip P1 otomatis.
        </WarningBanner>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">Total P1 Gross</p>
          <p className="mt-1 text-base font-bold text-foreground">{rupiah(totals.gross)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">Total Potongan</p>
          <p className="mt-1 text-base font-bold text-rose-700">{rupiah(totals.potongan)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">P1 Setelah Potongan</p>
          <p className="mt-1 text-base font-bold text-foreground">{rupiah(totals.setelahPotongan)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">Total Pajak (PPh 21)</p>
          <p className="mt-1 text-base font-bold text-amber-700">
            {isCalculated ? rupiah(totals.pajak) : <span className="text-xs italic font-normal text-muted-foreground">Belum dihitung</span>}
          </p>
        </div>
        <div className="rounded-xl border bg-emerald-50/50 border-emerald-200 p-4">
          <p className="text-[11px] text-emerald-800 font-medium">Total P1 Netto</p>
          <p className="mt-1 text-base font-bold text-emerald-700">
            {isCalculated ? rupiah(totals.netto) : <span className="text-xs italic font-normal text-muted-foreground">Belum dihitung</span>}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ringkasan Validasi Otomatis (Klik untuk Menyaring Tabel)
          </h3>
          {activeFilter !== "semua" && (
            <Button
              variant="link"
              size="sm"
              className="h-6 p-0 text-xs"
              onClick={() => setActiveFilter("semua")}
            >
              Tampilkan Semua Pegawai
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {validationCards.map((card) => {
            const isSelected = activeFilter === card.key
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setActiveFilter(isSelected ? "semua" : card.key)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "bg-card hover:bg-muted/40"
                }`}
              >
                <p className="text-[11px] text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-lg font-bold text-foreground">{card.count} Pegawai</p>
              </button>
            )
          })}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPegawai}
        emptyText="Tidak ada pegawai pada kategori validasi ini."
      />

      <ConfirmDialog
        open={isConfirmTetapkanOpen}
        onOpenChange={setIsConfirmTetapkanOpen}
        title="Tetapkan P1 Netto"
        description="Hasil menjadi final dan slip terbit otomatis untuk semua pegawai unit."
        summary={
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unit Kerja:</span>
              <span className="font-semibold">{pengajuan.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Pajak PPh 21:</span>
              <span className="font-semibold">{rupiah(totals.pajak)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total P1 Netto:</span>
              <span className="font-bold text-emerald-700">{rupiah(totals.netto)}</span>
            </div>
          </div>
        }
        confirmText="Tetapkan Netto Final"
        onConfirm={handleConfirmTetapkanNetto}
      />

      <FormDialog
        open={isKoreksiOpen}
        onOpenChange={setIsKoreksiOpen}
        title="Koreksi Nominal Pajak (PPh 21)"
        description={koreksiTarget ? `${koreksiTarget.nama} (${koreksiTarget.nip})` : undefined}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsKoreksiOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveKoreksi}>
              Simpan Koreksi
            </Button>
          </div>
        }
      >
        {koreksiTarget && (
          <div className="space-y-4 text-xs">
            {koreksiError && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-800">
                <AlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>{koreksiError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
              <div>
                <p className="text-muted-foreground">P1 Setelah Potongan</p>
                <p className="font-semibold text-sm">{rupiah(koreksiTarget.p1SetelahPotongan)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pajak Saat Ini</p>
                <p className="font-semibold text-sm">{rupiah(koreksiTarget.pajak)}</p>
              </div>
            </div>

            <div>
              <label className="font-semibold text-foreground">
                Nominal Pajak Baru (Rp) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                value={koreksiNominal}
                onChange={(e) => {
                  setKoreksiNominal(e.target.value)
                  setKoreksiError("")
                }}
                className="mt-1 h-9 text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground">
                Alasan Koreksi Wajib <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={koreksiAlasan}
                onChange={(e) => {
                  setKoreksiAlasan(e.target.value)
                  setKoreksiError("")
                }}
                placeholder="Contoh: Penyesuaian status PTKP K/2 sesuai kartu keluarga terbaru"
                className="mt-1 w-full rounded-md border border-input p-2.5 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
              <ShieldAlert className="size-4 shrink-0 text-primary" />
              <span>Tercatat di jejak audit dan langsung memperbarui nilai Netto di pratinjau.</span>
            </div>
          </div>
        )}
      </FormDialog>

      <DetailDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Rincian Perhitungan 7 Langkah"
        subtitle={selectedPegawai ? `${selectedPegawai.nama} • NIP ${selectedPegawai.nip}` : undefined}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
            Tutup
          </Button>
        }
      >
        {selectedPegawai && (
          <>
            {selectedPegawai.melebihiAmbang50 && (
              <WarningBanner variant="error" title="Melebihi Ambang Ketidakhadiran 50%">
                Ketidakhadiran mencapai <strong>{selectedPegawai.persenKetidakhadiran}%</strong> (&gt;50%). Sesuai
                ketentuan, P1 Netto ditetapkan <strong>Rp 0</strong> dan pajak tidak dihitung.
              </WarningBanner>
            )}

            <DrawerSummaryCard
              items={[
                { label: "Nama Pegawai", value: selectedPegawai.nama },
                { label: "NIP", value: selectedPegawai.nip, mono: true },
                { label: "Jabatan & Grade", value: `Grade ${selectedPegawai.grade} (${selectedPegawai.jabatan})` },
                { label: "Status Kepegawaian", value: `${selectedPegawai.statusKepegawaian} (${selectedPegawai.pengaliStatus}%)` },
              ]}
              totalLabel="7. P1 Netto Diterima"
              totalValue={!isCalculated ? "Belum dihitung" : rupiah(selectedPegawai.netto)}
            />

            <DrawerSection title="Tahapan Perhitungan P1 & Pajak">
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border p-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">1. P1 Gross</p>
                    <p className="text-xs text-muted-foreground">Grade {selectedPegawai.grade} ({selectedPegawai.jabatan})</p>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">{rupiah(selectedPegawai.p1Gross)}</span>
                </div>

                <div className="rounded-xl border p-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">2. Pengali Status Kepegawaian</p>
                    <p className="text-xs text-muted-foreground">Status: {selectedPegawai.statusKepegawaian}</p>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">{selectedPegawai.pengaliStatus}%</span>
                </div>

                <div className="rounded-xl border p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-foreground">3. Total Potongan</span>
                    <span className="shrink-0 font-semibold tabular-nums text-rose-700">
                      - {rupiah(selectedPegawai.totalPotongan)}
                    </span>
                  </div>
                  <div className="border-t pt-2.5 space-y-1.5 text-xs">
                    <p className="font-medium text-muted-foreground">Rincian Kehadiran (TL/PSW &amp; Ketidakhadiran):</p>
                    {selectedPegawai.rincianKehadiran.length > 0 ? (
                      selectedPegawai.rincianKehadiran.map((rk, i) => (
                        <div key={i} className="flex justify-between gap-3 text-muted-foreground">
                          <span>• {rk.jenis} ({rk.jumlah}) [{rk.persenPotongan}%]</span>
                          <span className="shrink-0 tabular-nums">{rupiah(rk.nominal)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground italic">• Tidak ada potongan kehadiran</p>
                    )}
                    <p className="font-medium text-muted-foreground pt-1">Hukuman Disiplin:</p>
                    <div className="flex justify-between gap-3 text-muted-foreground">
                      <span>• {selectedPegawai.rincianHukdis}</span>
                      <span className="shrink-0 tabular-nums">{rupiah(selectedPegawai.potonganHukdis)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">4. Cek Ambang 50%</p>
                    <p className="text-xs text-muted-foreground">Ketidakhadiran: {selectedPegawai.persenKetidakhadiran}%</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      selectedPegawai.melebihiAmbang50
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }
                  >
                    {selectedPegawai.melebihiAmbang50 ? "Melebihi (>50%)" : "Memenuhi Syarat"}
                  </Badge>
                </div>

                <div className="rounded-xl border bg-muted/20 p-3.5 flex items-center justify-between gap-4">
                  <span className="font-semibold text-foreground">5. P1 Setelah Potongan</span>
                  <span className="shrink-0 font-semibold tabular-nums">{rupiah(selectedPegawai.p1SetelahPotongan)}</span>
                </div>

                <div className="rounded-xl border p-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">6. Pajak (PPh 21 TER)</p>
                    {selectedPegawai.melebihiAmbang50 && (
                      <p className="text-xs text-muted-foreground">Tidak dihitung (ambang &gt;50%)</p>
                    )}
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums text-amber-700">
                    {!isCalculated ? "Belum dihitung" : rupiah(selectedPegawai.pajak)}
                  </span>
                </div>
              </div>
            </DrawerSection>

            {selectedPegawai.riwayatKoreksiPajak.length > 0 && (
              <DrawerSection title="Riwayat Koreksi Pajak">
                <div className="space-y-2">
                  {selectedPegawai.riwayatKoreksiPajak.map((kr, idx) => (
                    <div key={idx} className="rounded-xl border bg-amber-50/50 p-3.5 text-xs space-y-1">
                      <div className="flex justify-between gap-2 font-semibold">
                        <span>{kr.oleh}</span>
                        <span className="text-muted-foreground whitespace-nowrap">{kr.waktu}</span>
                      </div>
                      <p className="text-sm">
                        {rupiah(kr.nominalLama)} → <strong>{rupiah(kr.nominalBaru)}</strong>
                      </p>
                      <p className="text-muted-foreground italic">Alasan: {kr.alasan}</p>
                    </div>
                  ))}
                </div>
              </DrawerSection>
            )}
          </>
        )}
      </DetailDrawer>

      <LembarVerifikasiModal
        open={isLembarVerifOpen}
        onOpenChange={setIsLembarVerifOpen}
        data={{
          pengajuan: {
            nomor_pengajuan: pengajuan.id || pengajuan.nomor,
            unit: pengajuan.unit,
            periode: pengajuan.periode,
            jumlah_penerima: pegawaiList.length,
            jumlah_kotor: totals.setelahPotongan || totals.gross,
            kelompok: "Tenaga Kependidikan",
          },
          pejabat: {
            nama: "Drs. Imrizal, MM",
            nip: "196303071985031009",
            jabatan: "Ketua UPT Remunerasi",
          },
        }}
      />
        </>
      )}
    </div>
  )
}
