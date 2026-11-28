import { useState, useMemo, useEffect } from "react"
import { Plus, Edit2, Ban, CheckCircle2, Network, Table as TableIcon, Building2, Loader2 } from "lucide-react"
import {
  PageHeader,
  DataTable,
  StatusBadge,
  Button,
  Input,
  FilterBar,
  FormDialog,
  ConfirmDialog,
  WarningBanner,
  type ColumnDef,
} from "./components"
import {
  type UnitKerjaItem,
  type TipeUnit,
} from "@/types/upt"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { toast } from "sonner"

const TIPE_OPTIONS: TipeUnit[] = [
  "Fakultas",
  "Pascasarjana",
  "Bidang Rektorat",
  "UPT",
  "Lembaga",
  "SPI",
]

export default function UnitKerjaPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<UnitKerjaItem[]>([])
  const [search, setSearch] = useState("")
  const [filterTipe, setFilterTipe] = useState<string>("semua")
  const [filterStatus, setFilterStatus] = useState<string>("semua")
  const [viewMode, setViewMode] = useState<"tabel" | "hierarki">("tabel")

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<UnitKerjaItem | null>(null)
  const [formKode, setFormKode] = useState("")
  const [formNama, setFormNama] = useState("")
  const [formTipe, setFormTipe] = useState<TipeUnit>("Fakultas")
  const [formInduk, setFormInduk] = useState("-")
  const [formPimpinan, setFormPimpinan] = useState("")
  const [formBendahara, setFormBendahara] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deactivateItem, setDeactivateItem] = useState<UnitKerjaItem | null>(null)

  useEffect(() => {
    loadUnits()
  }, [])

  const loadUnits = async () => {
    try {
      setLoading(true)
      const res = await uptRemunerasiService.getMasterUnits()
      
      // Map API response
      const mapped: UnitKerjaItem[] = (res.data || []).map((item: any) => ({
        id: item.id?.toString() || `unit-${Date.now()}`,
        kode: item.kode || item.kode_unit || "-",
        nama: item.nama || item.nama_unit || "-",
        tipe: item.tipe || item.jenis || "Fakultas",
        induk: item.induk || item.unit_induk || "-",
        pimpinan: item.pimpinan || "Belum Ditugaskan",
        bendahara: item.bendahara || "Belum Ditugaskan",
        aktif: item.aktif || item.jumlah_pegawai || 0,
        status: item.aktif === false || item.status === "nonaktif" ? "nonaktif" : "aktif",
      }))
      
      setData(mapped)
    } catch (error: any) {
      console.error("Error loading units:", error)
      toast.error("Gagal memuat data unit kerja")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.kode.toLowerCase().includes(search.toLowerCase()) ||
        item.pimpinan.toLowerCase().includes(search.toLowerCase())
      const matchTipe = filterTipe === "semua" || item.tipe === filterTipe
      const matchStatus = filterStatus === "semua" || item.status === filterStatus
      return matchSearch && matchTipe && matchStatus
    })
  }, [data, search, filterTipe, filterStatus])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormKode("")
    setFormNama("")
    setFormTipe("Fakultas")
    setFormInduk("-")
    setFormPimpinan("")
    setFormBendahara("")
    setFormError(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (item: UnitKerjaItem) => {
    setEditingItem(item)
    setFormKode(item.kode)
    setFormNama(item.nama)
    setFormTipe(item.tipe)
    setFormInduk(item.induk)
    setFormPimpinan(item.pimpinan)
    setFormBendahara(item.bendahara)
    setFormError(null)
    setFormOpen(true)
  }

  const handleSave = async () => {
    setFormError(null)
    if (!formKode.trim() || !formNama.trim() || !formPimpinan.trim()) {
      setFormError("Semua kolom bertanda bintang (*) wajib diisi.")
      return
    }

    const duplicateKode = data.find(
      (u) => u.kode.toLowerCase() === formKode.trim().toLowerCase() && u.id !== editingItem?.id
    )
    if (duplicateKode) {
      setFormError(`Kode unit "${formKode}" sudah terdaftar pada ${duplicateKode.nama}.`)
      return
    }

    const duplicateNama = data.find(
      (u) => u.nama.toLowerCase() === formNama.trim().toLowerCase() && u.id !== editingItem?.id
    )
    if (duplicateNama) {
      setFormError(`Nama unit "${formNama}" sudah terdaftar.`)
      return
    }

    setSubmitting(true)
    try {
      if (editingItem) {
        await uptRemunerasiService.updateUnit(editingItem.id, {
          nama: formNama.trim(),
          jenis: formTipe,
          aktif: true,
        })
        toast.success(`Unit kerja ${formNama} berhasil diperbarui.`)
      } else {
        await uptRemunerasiService.storeUnit({
          nama: formNama.trim(),
          jenis: formTipe,
          aktif: true,
        })
        toast.success(`Unit kerja ${formNama} berhasil ditambahkan.`)
      }

      setFormOpen(false)
      await loadUnits()
    } catch (error: any) {
      console.error("Error saving unit:", error)
      setFormError(error.response?.data?.message || "Gagal menyimpan data unit")
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (item: UnitKerjaItem) => {
    if (item.status === "aktif") {
      setDeactivateItem(item)
    } else {
      try {
        await uptRemunerasiService.toggleUnitStatus(item.id)
        toast.success(`Unit ${item.nama} telah diaktifkan kembali.`)
        await loadUnits()
      } catch (error: any) {
        console.error("Error toggling status:", error)
        toast.error(error.response?.data?.message || "Gagal mengaktifkan unit")
      }
    }
  }

  const confirmDeactivate = async () => {
    if (!deactivateItem) return
    
    try {
      await uptRemunerasiService.toggleUnitStatus(deactivateItem.id)
      toast.success(`Unit ${deactivateItem.nama} berhasil dinonaktifkan.`)
      setDeactivateItem(null)
      await loadUnits()
    } catch (error: any) {
      console.error("Error deactivating unit:", error)
      toast.error(error.response?.data?.message || "Gagal menonaktifkan unit")
    }
  }

  const columns: ColumnDef<UnitKerjaItem>[] = [
    {
      header: "Kode",
      accessorKey: "kode",
      className: "w-24 font-mono font-bold text-xs",
    },
    {
      header: "Nama Unit Kerja",
      cell: (item) => (
        <div>
          <p className="font-semibold">{item.nama}</p>
          <p className="text-xs text-muted-foreground">Pimpinan: {item.pimpinan}</p>
        </div>
      ),
    },
    {
      header: "Tipe Unit",
      accessorKey: "tipe",
      className: "w-36 text-xs font-medium",
    },
    {
      header: "Induk Unit",
      accessorKey: "induk",
      className: "w-28 text-xs text-muted-foreground",
    },
    {
      header: "Pegawai Aktif",
      cell: (item) => (
        <span className="font-medium text-xs">
          {Number(item.aktif) > 0 ? `${item.aktif} pegawai` : "0 pegawai"}
        </span>
      ),
      className: "w-32",
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
      className: "w-28",
    },
    {
      header: "Aksi",
      cell: (item) => (
        <div className="flex items-center gap-1.5">
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
            className={`h-8 gap-1 text-xs ${item.status === "aktif" ? "text-rose-600 hover:text-rose-700" : "text-emerald-600 hover:text-emerald-700"
              }`}
            onClick={() => handleToggleStatus(item)}
          >
            {item.status === "aktif" ? <Ban className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
            {item.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
          </Button>
        </div>
      ),
      className: "w-44 text-right",
    },
  ]

  const hierarchyGroups = useMemo(() => {
    const rootUnits = data.filter((u) => u.induk === "-")
    const childUnits = data.filter((u) => u.induk !== "-")
    return { rootUnits, childUnits }
  }, [data])

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
        title="Struktur Unit Kerja"
        subtitle="Kelola struktur organisasi fakultas, lembaga, UPT, dan bidang rektorat pengusul remunerasi P1."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border bg-card p-0.5">
              <Button
                variant={viewMode === "tabel" ? "default" : "ghost"}
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setViewMode("tabel")}
              >
                <TableIcon className="size-3.5" /> Tabel
              </Button>
              <Button
                variant={viewMode === "hierarki" ? "default" : "ghost"}
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setViewMode("hierarki")}
              >
                <Network className="size-3.5" /> Hierarki
              </Button>
            </div>
            <Button onClick={handleOpenAdd} className="gap-2">
              <Plus className="size-4" /> Tambah Unit
            </Button>
          </div>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Cari kode, nama unit, atau pimpinan..."
      >
        <div className="flex items-center gap-2">
          <Select value={filterTipe} onValueChange={setFilterTipe}>
            <SelectTrigger className="w-40 text-xs">
              <SelectValue placeholder="Semua Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Tipe</SelectItem>
              {TIPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 text-xs">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      {viewMode === "tabel" ? (
        <DataTable columns={columns} data={filtered} emptyText="Tidak ada unit kerja yang sesuai filter." />
      ) : (
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2 border-b pb-3 text-sm font-semibold text-muted-foreground">
            <Building2 className="size-4 text-primary" />
            Struktur Hierarki Organisasi Universitas Andalas
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                    UNAND
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Rektorat Universitas Andalas (Induk)</h4>
                    <p className="text-xs text-muted-foreground">Pusat Administrasi & Bidang Rektorat</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-primary">
                  {data.filter((u) => u.induk === "Rektorat").length} Bidang Bawahan
                </span>
              </div>

              <div className="mt-4 grid gap-3 pl-6 border-l-2 border-primary/30 sm:grid-cols-2">
                {data
                  .filter((u) => u.induk === "Rektorat")
                  .map((bidang) => (
                    <div
                      key={bidang.id}
                      className="flex items-center justify-between rounded-lg border bg-background p-3 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold">
                            {bidang.kode}
                          </span>
                          <span className="font-semibold text-xs">{bidang.nama}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">Pimpinan: {bidang.pimpinan}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={bidang.status} />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleOpenEdit(bidang)}
                        >
                          Ubah
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hierarchyGroups.rootUnits
                .filter((u) => u.tipe !== "Bidang Rektorat")
                .map((unit) => (
                  <div
                    key={unit.id}
                    className="flex flex-col justify-between rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 shadow-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                          {unit.kode}
                        </span>
                        <StatusBadge status={unit.status} />
                      </div>
                      <h4 className="mt-2 font-semibold text-sm leading-tight">{unit.nama}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">Pimpinan: {unit.pimpinan}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t pt-2 text-xs">
                      <span className="text-muted-foreground">{unit.aktif} Pegawai Aktif</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs font-medium text-primary"
                        onClick={() => handleOpenEdit(unit)}
                      >
                        Ubah Detail
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingItem ? `Ubah Unit Kerja: ${editingItem.nama}` : "Tambah Unit Kerja Baru"}
        description="Pastikan kode unit dan nama unit kerja unik serta sesuai nomenklatur resmi."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" /> Menyimpan...
                </>
              ) : editingItem ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Unit"
              )}
            </Button>
          </div>
        }
      >
        {formError && (
          <WarningBanner variant="error" title="Gagal Menyimpan">
            {formError}
          </WarningBanner>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="kode" className="text-xs">
              Kode Unit *
            </Label>
            <Input
              id="kode"
              placeholder="Contoh: FTI, FT, REK-1"
              value={formKode}
              onChange={(e) => setFormKode(e.target.value.toUpperCase())}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tipe" className="text-xs">
              Tipe Unit *
            </Label>
            <Select value={formTipe} onValueChange={(val) => setFormTipe(val as TipeUnit)}>
              <SelectTrigger id="tipe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nama" className="text-xs">
            Nama Lengkap Unit Kerja *
          </Label>
          <Input
            id="nama"
            placeholder="Contoh: Fakultas Teknologi Informasi"
            value={formNama}
            onChange={(e) => setFormNama(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="induk" className="text-xs">
              Induk Unit
            </Label>
            <Select value={formInduk} onValueChange={setFormInduk}>
              <SelectTrigger id="induk">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-">- (Tingkat Universitas Langsung)</SelectItem>
                <SelectItem value="Rektorat">Rektorat Universitas Andalas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pimpinan" className="text-xs">
              Nama & Gelar Pimpinan *
            </Label>
            <Input
              id="pimpinan"
              placeholder="Contoh: Dr. Rina Maharani, M.T."
              value={formPimpinan}
              onChange={(e) => setFormPimpinan(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bendahara" className="text-xs">
            Bendahara Pengeluaran Pembantu
          </Label>
          <Input
            id="bendahara"
            placeholder="Contoh: Siti Rahma, S.E."
            value={formBendahara}
            onChange={(e) => setFormBendahara(e.target.value)}
          />
        </div>
      </FormDialog>

      <ConfirmDialog
        open={!!deactivateItem}
        onOpenChange={(open) => !open && setDeactivateItem(null)}
        title={`Nonaktifkan Unit Kerja ${deactivateItem?.nama}?`}
        description="Unit tidak dapat membuat pengajuan P1 baru; pengajuan lama tetap berjalan."
        danger
        confirmText="Ya, Nonaktifkan Unit"
        summary={
          deactivateItem && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Kode Unit: <span className="font-mono font-bold text-foreground">{deactivateItem.kode}</span>
              </p>
              {Number(deactivateItem.aktif) > 0 && (
                <WarningBanner variant="warning" title="Peringatan Pegawai Aktif">
                  Masih terdapat <strong>{deactivateItem.aktif} pegawai aktif</strong> yang terdaftar pada unit ini.
                  Pastikan mutasi atau penyesuaian unit kerja pegawai telah diatur di Kepegawaian.
                </WarningBanner>
              )}
            </div>
          )
        }
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
