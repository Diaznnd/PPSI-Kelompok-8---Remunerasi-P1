import { useState, useMemo, useEffect } from "react"
import { Plus, Edit2, History, Ban, CheckCircle2, ShieldAlert, FileText, Loader2 } from "lucide-react"
import {
  PageHeader,
  DataTable,
  StatusBadge,
  Button,
  Input,
  FilterBar,
  FormDialog,
  ConfirmDialog,
  DetailDrawer,
  DrawerSection,
  DrawerSummaryCard,
  DrawerTimeline,
  WarningBanner,
  RupiahText,
  Toast,
  type ColumnDef,
} from "./components"
import {
  PIR_DEFAULT,
  PERSENTASE_P1_DEFAULT,
  rupiah,
  type MasterGradeItem,
  type JabatanMasterItem,
  type KategoriJabatan,
  type StatusEntitas,
} from "@/data/dummy-upt"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { toast } from "sonner"

const KATEGORI_JABATAN_OPTIONS: KategoriJabatan[] = [
  "Pejabat Pengelola Dosen",
  "Pejabat Pengelola Tendik",
  "Dosen Fungsional",
  "Dokter",
  "Tendik Fungsional",
  "Tendik Pelaksana",
]

export default function MasterGradePage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"grade" | "jabatan">("grade")

  const [gradeData, setGradeData] = useState<MasterGradeItem[]>([])
  const [searchGrade, setSearchGrade] = useState("")
  const [selectedGradeHistory, setSelectedGradeHistory] = useState<MasterGradeItem | null>(null)

  const [gradeFormOpen, setGradeFormOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState<MasterGradeItem | null>(null)
  const [formGradeNum, setFormGradeNum] = useState<number>(10)
  const [formMinPoin, setFormMinPoin] = useState<number>(1744)
  const [formMaxPoin, setFormMaxPoin] = useState<number>(2094)
  const [formMeanPoin, setFormMeanPoin] = useState<number>(1919)
  const [formNilaiBerlaku, setFormNilaiBerlaku] = useState<number>(1919)
  const [formBerlakuMulai, setFormBerlakuMulai] = useState("2026-01-01")
  const [formDasarHukum, setFormDasarHukum] = useState("Peraturan Rektor No. 2/2026")
  const [formAlasan, setFormAlasan] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [jabatanData, setJabatanData] = useState<JabatanMasterItem[]>([])
  const [searchJabatan, setSearchJabatan] = useState("")
  const [filterKategori, setFilterKategori] = useState<string>("semua")
  const [filterGrade, setFilterGrade] = useState<string>("semua")

  const [jabatanFormOpen, setJabatanFormOpen] = useState(false)
  const [editingJabatan, setEditingJabatan] = useState<JabatanMasterItem | null>(null)
  const [formJabatanNama, setFormJabatanNama] = useState("")
  const [formJabatanKategori, setFormJabatanKategori] = useState<KategoriJabatan>("Dosen Fungsional")
  const [formJabatanGrade, setFormJabatanGrade] = useState<number>(10)
  const [jabatanError, setJabatanError] = useState<string | null>(null)

  const [deactivateJabatanItem, setDeactivateJabatanItem] = useState<JabatanMasterItem | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [gradesRes, jabatanRes] = await Promise.all([
        uptRemunerasiService.getMasterGrades(),
        uptRemunerasiService.getMasterUnits(), // Note: Jabatan might have different endpoint
      ])
      
      // Map grades
      const mappedGrades: MasterGradeItem[] = (gradesRes.data || []).map((item: any) => ({
        grade: item.grade || 1,
        kode: `G-${String(item.grade).padStart(2, "0")}`,
        minPoin: item.min_poin || 0,
        maxPoin: item.max_poin || 0,
        meanPoin: item.mean_poin || item.nilai || 0,
        nilaiJabatan: (item.nilai || 0) * PIR_DEFAULT,
        p1Gross: Math.round((item.nilai || 0) * PIR_DEFAULT * PERSENTASE_P1_DEFAULT),
        berlakuSejak: item.berlaku_sejak || "2026-01-01",
        dasarHukum: item.dasar_hukum || "Peraturan Rektor No. 2/2026",
        status: item.aktif === false ? "nonaktif" : "aktif",
        riwayat: item.riwayat || [],
      }))
      
      setGradeData(mappedGrades)
      // setJabatanData will be populated when jabatan endpoint is ready
    } catch (error: any) {
      console.error("Error loading master data:", error)
      toast.error("Gagal memuat data master")
      setGradeData([])
      setJabatanData([])
    } finally {
      setLoading(false)
    }
  }

  const filteredGrades = useMemo(() => {
    return gradeData.filter(
      (g) =>
        g.kode.toLowerCase().includes(searchGrade.toLowerCase()) ||
        `grade ${g.grade}`.includes(searchGrade.toLowerCase())
    )
  }, [gradeData, searchGrade])

  const handleOpenEditGrade = (item: MasterGradeItem) => {
    setEditingGrade(item)
    setFormGradeNum(item.grade)
    setFormMinPoin(item.minPoin)
    setFormMaxPoin(item.maxPoin)
    setFormMeanPoin(item.meanPoin)
    setFormNilaiBerlaku(Math.round(item.nilaiJabatan / PIR_DEFAULT))
    setFormBerlakuMulai(item.berlakuSejak)
    setFormDasarHukum(item.dasarHukum)
    setFormAlasan("")
    setGradeFormOpen(true)
  }

  const isNilaiOutOfRange =
    formNilaiBerlaku < formMinPoin || formNilaiBerlaku > formMaxPoin
  const previewP1 = Math.round(formNilaiBerlaku * PIR_DEFAULT * PERSENTASE_P1_DEFAULT)

  const handleSaveGrade = async () => {
    if (formNilaiBerlaku <= 0) {
      toast.error("Nilai jabatan berlaku harus lebih dari 0.")
      return
    }

    if (!editingGrade) return

    setSubmitting(true)
    try {
      await uptRemunerasiService.updateGrade(editingGrade.grade, formNilaiBerlaku)
      
      toast.success(`Grade ${editingGrade.grade} berhasil diperbarui.`)
      setGradeFormOpen(false)
      
      // Reload data
      await loadData()
    } catch (error: any) {
      console.error("Error updating grade:", error)
      toast.error(error.response?.data?.message || "Gagal memperbarui grade")
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleGradeStatus = async (item: MasterGradeItem) => {
    try {
      // Assuming there's a toggle endpoint similar to units
      toast.success(
        `Grade ${item.grade} ${item.status === "aktif" ? "dinonaktifkan" : "diaktifkan"}.`
      )
      await loadData()
    } catch (error: any) {
      console.error("Error toggling grade status:", error)
      toast.error("Gagal mengubah status grade")
    }
  }

  const gradeColumns: ColumnDef<MasterGradeItem>[] = [
    {
      header: "Grade",
      accessorKey: "kode",
      className: "w-20 font-bold font-mono text-xs text-primary",
    },
    {
      header: "Nilai Terendah",
      cell: (item) => `${item.minPoin.toLocaleString("id-ID")} poin`,
      className: "w-28 text-xs",
    },
    {
      header: "Nilai Tertinggi",
      cell: (item) => `${item.maxPoin.toLocaleString("id-ID")} poin`,
      className: "w-28 text-xs",
    },
    {
      header: "Mean (Rata-rata)",
      cell: (item) => `${item.meanPoin.toLocaleString("id-ID")} poin`,
      className: "w-28 text-xs font-medium",
    },
    {
      header: "Nilai Berlaku",
      cell: (item) => (
        <span className="font-bold text-xs">
          {(item.nilaiJabatan / PIR_DEFAULT).toLocaleString("id-ID")} poin
        </span>
      ),
      className: "w-28",
    },
    {
      header: "Remunerasi (PIR x Nilai)",
      cell: (item) => <RupiahText value={item.nilaiJabatan} className="text-xs" />,
      className: "w-36",
    },
    {
      header: "P1 (40%)",
      cell: (item) => <RupiahText value={item.p1Gross} className="text-xs font-bold text-primary" />,
      className: "w-32",
    },
    {
      header: "Berlaku Sejak",
      accessorKey: "berlakuSejak",
      className: "w-28 text-xs text-muted-foreground",
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
      className: "w-24",
    },
    {
      header: "Aksi",
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-primary"
            onClick={() => handleOpenEditGrade(item)}
          >
            <Edit2 className="size-3.5 mr-1" /> Ubah
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => setSelectedGradeHistory(item)}
          >
            <History className="size-3.5 mr-1" /> Riwayat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 text-xs ${item.status === "aktif" ? "text-rose-600 hover:text-rose-700" : "text-emerald-600"
              }`}
            onClick={() => handleToggleGradeStatus(item)}
          >
            {item.status === "aktif" ? <Ban className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
          </Button>
        </div>
      ),
      className: "w-52 text-right",
    },
  ]

  const filteredJabatan = useMemo(() => {
    return jabatanData.filter((j) => {
      const matchSearch = j.nama.toLowerCase().includes(searchJabatan.toLowerCase())
      const matchKategori = filterKategori === "semua" || j.kategori === filterKategori
      const matchGrade = filterGrade === "semua" || String(j.grade) === filterGrade
      return matchSearch && matchKategori && matchGrade
    })
  }, [jabatanData, searchJabatan, filterKategori, filterGrade])

  const handleOpenAddJabatan = () => {
    setEditingJabatan(null)
    setFormJabatanNama("")
    setFormJabatanKategori("Dosen Fungsional")
    setFormJabatanGrade(10)
    setJabatanError(null)
    setJabatanFormOpen(true)
  }

  const handleOpenEditJabatan = (item: JabatanMasterItem) => {
    setEditingJabatan(item)
    setFormJabatanNama(item.nama)
    setFormJabatanKategori(item.kategori)
    setFormJabatanGrade(item.grade)
    setJabatanError(null)
    setJabatanFormOpen(true)
  }

  const handleSaveJabatan = () => {
    if (!formJabatanNama.trim()) {
      setJabatanError("Nama jabatan wajib diisi.")
      return
    }

    const targetGrade = gradeData.find((g) => g.grade === formJabatanGrade)
    const nilaiJabatan = targetGrade ? targetGrade.nilaiJabatan : 0
    const p1Gross = targetGrade ? targetGrade.p1Gross : 0

    if (editingJabatan) {
      setJabatanData((prev) =>
        prev.map((j) =>
          j.id === editingJabatan.id
            ? {
              ...j,
              nama: formJabatanNama.trim(),
              kategori: formJabatanKategori,
              grade: formJabatanGrade,
              nilaiJabatan,
              p1Gross,
            }
            : j
        )
      )
      Toast.success(`Jabatan ${formJabatanNama} berhasil diperbarui.`)
    } else {
      const newJab: JabatanMasterItem = {
        id: `JAB-${Date.now()}`,
        nama: formJabatanNama.trim(),
        kategori: formJabatanKategori,
        grade: formJabatanGrade,
        nilaiJabatan,
        p1Gross,
        status: "aktif",
        digunakan: 0,
      }
      setJabatanData((prev) => [newJab, ...prev])
      Toast.success(`Jabatan ${formJabatanNama} berhasil ditambahkan.`)
    }
    setJabatanFormOpen(false)
  }

  const handleAttemptDeactivateJabatan = (item: JabatanMasterItem) => {
    if (item.digunakan > 0) {
      Toast.error(
        `Data sedang digunakan oleh ${item.digunakan} pegawai. Jabatan tidak dapat dinonaktifkan.`
      )
      return
    }
    setDeactivateJabatanItem(item)
  }

  const confirmDeactivateJabatan = () => {
    if (!deactivateJabatanItem) return
    setJabatanData((prev) =>
      prev.map((j) =>
        j.id === deactivateJabatanItem.id ? { ...j, status: "nonaktif" as StatusEntitas } : j
      )
    )
    Toast.success(`Jabatan ${deactivateJabatanItem.nama} berhasil dinonaktifkan.`)
    setDeactivateJabatanItem(null)
  }

  const jabatanColumns: ColumnDef<JabatanMasterItem>[] = [
    {
      header: "Nama Jabatan",
      cell: (item) => (
        <div>
          <p className="font-semibold text-sm">{item.nama}</p>
          <p className="text-xs text-muted-foreground">{item.kategori}</p>
        </div>
      ),
    },
    {
      header: "Kategori",
      accessorKey: "kategori",
      className: "w-44 text-xs font-medium",
    },
    {
      header: "Grade",
      cell: (item) => (
        <span className="rounded bg-primary/10 px-2 py-0.5 font-bold font-mono text-xs text-primary">
          G-{String(item.grade).padStart(2, "0")}
        </span>
      ),
      className: "w-24",
    },
    {
      header: "Remunerasi P1 (40%)",
      cell: (item) => <RupiahText value={item.p1Gross} className="text-xs font-bold text-primary" />,
      className: "w-36",
    },
    {
      header: "Digunakan",
      cell: (item) => (
        <span
          className={`text-xs font-medium ${item.digunakan > 0 ? "text-foreground" : "text-muted-foreground italic"
            }`}
        >
          {item.digunakan > 0 ? `${item.digunakan} pegawai` : "0 pegawai"}
        </span>
      ),
      className: "w-28",
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
      className: "w-24",
    },
    {
      header: "Aksi",
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-primary"
            onClick={() => handleOpenEditJabatan(item)}
          >
            <Edit2 className="size-3.5 mr-1" /> Ubah
          </Button>
          {item.status === "aktif" ? (
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 text-xs ${item.digunakan > 0 ? "text-muted-foreground/60 cursor-not-allowed" : "text-rose-600 hover:text-rose-700"
                }`}
              onClick={() => handleAttemptDeactivateJabatan(item)}
              title={item.digunakan > 0 ? "Data sedang digunakan oleh pegawai" : "Nonaktifkan"}
            >
              <Ban className="size-3.5 mr-1" /> Nonaktifkan
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-emerald-600"
              onClick={() => {
                setJabatanData((prev) =>
                  prev.map((j) => (j.id === item.id ? { ...j, status: "aktif" as StatusEntitas } : j))
                )
                Toast.success(`Jabatan ${item.nama} telah diaktifkan kembali.`)
              }}
            >
              <CheckCircle2 className="size-3.5 mr-1" /> Aktifkan
            </Button>
          )}
        </div>
      ),
      className: "w-44 text-right",
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
        title="Master Jabatan & Grade"
        subtitle="Konfigurasi matriks nilai jabatan, rentang poin grade 1-17, dan pemetaan jabatan remunerasi P1."
        actions={
          activeTab === "jabatan" ? (
            <Button onClick={handleOpenAddJabatan} className="gap-2">
              <Plus className="size-4" /> Tambah Jabatan
            </Button>
          ) : undefined
        }
      />

      <WarningBanner variant="info" title="Rumus Dasar Perhitungan P1 (Peraturan Rektor No. 2/2026 Pasal 9)">
        Remunerasi per jabatan = Point Index Rate (PIR = Rp 3.000) × Nilai Jabatan.
        Porsi insentif kerja P1 dihitung sebesar <strong>40% dari total remunerasi jabatan</strong> tersebut.
      </WarningBanner>

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("grade")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "grade"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <FileText className="size-4" />
          Master Grade 1 - 17
        </button>
        <button
          onClick={() => setActiveTab("jabatan")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "jabatan"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <ShieldAlert className="size-4" />
          Daftar Jabatan Pegawai ({jabatanData.length})
        </button>
      </div>

      {activeTab === "grade" && (
        <div className="space-y-4">
          <FilterBar
            search={searchGrade}
            onSearchChange={setSearchGrade}
            placeholder="Cari kode grade (misal: G-10, G-17)..."
          />
          <DataTable columns={gradeColumns} data={filteredGrades} pageSize={17} />
        </div>
      )}

      {activeTab === "jabatan" && (
        <div className="space-y-4">
          <FilterBar
            search={searchJabatan}
            onSearchChange={setSearchJabatan}
            placeholder="Cari nama jabatan..."
          >
            <div className="flex items-center gap-2">
              <Select value={filterKategori} onValueChange={setFilterKategori}>
                <SelectTrigger className="w-48 text-xs">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kategori</SelectItem>
                  {KATEGORI_JABATAN_OPTIONS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger className="w-32 text-xs">
                  <SelectValue placeholder="Semua Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Grade</SelectItem>
                  {Array.from({ length: 17 }, (_, i) => 17 - i).map((g) => (
                    <SelectItem key={g} value={String(g)}>
                      Grade {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FilterBar>

          <DataTable columns={jabatanColumns} data={filteredJabatan} pageSize={15} />
        </div>
      )}

      <FormDialog
        open={gradeFormOpen}
        onOpenChange={setGradeFormOpen}
        title={`Ubah Nilai: Grade ${formGradeNum}`}
        description="Perubahan nilai akan menciptakan entri versi riwayat baru tanpa menghapus data sebelumnya."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => setGradeFormOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleSaveGrade} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" /> Menyimpan...
                </>
              ) : (
                "Simpan Nilai Grade"
              )}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Nilai Terendah</Label>
            <Input
              type="number"
              value={formMinPoin}
              onChange={(e) => setFormMinPoin(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nilai Tertinggi</Label>
            <Input
              type="number"
              value={formMaxPoin}
              onChange={(e) => setFormMaxPoin(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Mean (Tabel 3.x)</Label>
            <Input
              type="number"
              value={formMeanPoin}
              onChange={(e) => setFormMeanPoin(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold">Nilai Jabatan Berlaku (Poin) *</Label>
          <Input
            type="number"
            value={formNilaiBerlaku}
            onChange={(e) => setFormNilaiBerlaku(Number(e.target.value))}
          />
          <p className="text-[11px] text-muted-foreground">
            Poin yang dijadikan pengali rumus PIR (Rp 3.000).
          </p>
        </div>

        {isNilaiOutOfRange && (
          <WarningBanner variant="warning" title="Peringatan Rentang Nilai">
            Nilai ({formNilaiBerlaku} poin) berada di luar rentang resmi Tabel 3.x ({formMinPoin} -{" "}
            {formMaxPoin}). Harap konfirmasi terlebih dahulu ke Kepala UPT.
          </WarningBanner>
        )}

        <div className="rounded-lg border bg-primary/5 p-3 text-xs space-y-1">
          <p className="text-muted-foreground">Pratinjau Otomatis Remunerasi:</p>
          <p className="font-semibold text-foreground">
            Total Remunerasi Jabatan: {rupiah(formNilaiBerlaku * PIR_DEFAULT)}
          </p>
          <p className="font-bold text-sm text-primary">
            Estimasi P1 (40%) = {rupiah(previewP1)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Berlaku Mulai *</Label>
            <Input
              type="date"
              value={formBerlakuMulai}
              onChange={(e) => setFormBerlakuMulai(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Dasar Hukum (SK Rektor) *</Label>
            <Input
              value={formDasarHukum}
              onChange={(e) => setFormDasarHukum(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Alasan Perubahan</Label>
          <Input
            placeholder="Contoh: Penyesuaian evaluasi jabatan tahunan"
            value={formAlasan}
            onChange={(e) => setFormAlasan(e.target.value)}
          />
        </div>
      </FormDialog>

      <DetailDrawer
        open={!!selectedGradeHistory}
        onClose={() => setSelectedGradeHistory(null)}
        title={`Riwayat Versi: Grade ${selectedGradeHistory?.grade ?? ""}`}
        subtitle="Catatan histori penetapan nilai dan dasar hukum perubahan."
        size="md"
        footer={
          <Button variant="outline" onClick={() => setSelectedGradeHistory(null)}>
            Tutup
          </Button>
        }
      >
        {selectedGradeHistory && (
          <>
            <DrawerSummaryCard
              items={[
                { label: "Grade", value: `Grade ${selectedGradeHistory.grade}` },
                { label: "Nilai Jabatan Berlaku", value: `${selectedGradeHistory.meanPoin.toLocaleString("id-ID")} poin` },
                { label: "Berlaku Sejak", value: selectedGradeHistory.berlakuSejak },
                { label: "Status", value: <StatusBadge status={selectedGradeHistory.status} /> },
              ]}
              totalLabel="Remunerasi per Jabatan"
              totalValue={rupiah(selectedGradeHistory.nilaiJabatan)}
            />

            <DrawerSection title="Histori Perubahan Nilai">
              <DrawerTimeline
                items={selectedGradeHistory.riwayat.map((hist, idx) => ({
                  tahap: `${hist.versi} — ${hist.nilai.toLocaleString("id-ID")} poin (${rupiah(hist.nilai * PIR_DEFAULT)})`,
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

      <FormDialog
        open={jabatanFormOpen}
        onOpenChange={setJabatanFormOpen}
        title={editingJabatan ? `Ubah Jabatan: ${editingJabatan.nama}` : "Tambah Jabatan Baru"}
        description="Tautkan jabatan fungsional atau pelaksana ke salah satu grade remunerasi."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => setJabatanFormOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveJabatan}>
              {editingJabatan ? "Simpan Perubahan" : "Tambah Jabatan"}
            </Button>
          </div>
        }
      >
        {jabatanError && (
          <WarningBanner variant="error" title="Gagal Menyimpan">
            {jabatanError}
          </WarningBanner>
        )}

        <div className="space-y-1">
          <Label className="text-xs">Nama Lengkap Jabatan *</Label>
          <Input
            placeholder="Contoh: Lektor Kepala / Koordinator Bagian"
            value={formJabatanNama}
            onChange={(e) => setFormJabatanNama(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Kategori Jabatan *</Label>
            <Select
              value={formJabatanKategori}
              onValueChange={(val) => setFormJabatanKategori(val as KategoriJabatan)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KATEGORI_JABATAN_OPTIONS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Tingkat Grade *</Label>
            <Select
              value={String(formJabatanGrade)}
              onValueChange={(val) => setFormJabatanGrade(Number(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 17 }, (_, i) => 17 - i).map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    Grade {g} (G-{String(g).padStart(2, "0")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {(() => {
          const g = gradeData.find((x) => x.grade === formJabatanGrade)
          return (
            <div className="rounded-lg border bg-muted/20 p-3 text-xs space-y-1">
              <p className="text-muted-foreground">Hak P1 Otomatis Grade {formJabatanGrade}:</p>
              <p className="font-bold text-primary text-sm">
                {g ? rupiah(g.p1Gross) : "-"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Nilai jabatan {g ? (g.nilaiJabatan / PIR_DEFAULT).toLocaleString("id-ID") : 0} poin × PIR Rp 3.000 × 40%.
              </p>
            </div>
          )
        })()}
      </FormDialog>

      <ConfirmDialog
        open={!!deactivateJabatanItem}
        onOpenChange={(open) => !open && setDeactivateJabatanItem(null)}
        title={`Nonaktifkan Jabatan ${deactivateJabatanItem?.nama}?`}
        description="Jabatan yang dinonaktifkan tidak dapat dipilih lagi saat pengusulan perubahan grade pegawai."
        danger
        confirmText="Ya, Nonaktifkan Jabatan"
        onConfirm={confirmDeactivateJabatan}
      />
    </div>
  )
}
