import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  Search,
  Layers,
  Info,
} from "lucide-react"
import { toast } from "sonner"
import {
  PageHeader,
  WarningBanner,
  ConfirmDialog,
  FormDialog,
  Button,
  Input,
  usePeriode,
  Status,
  Table,
  Row,
  Cell,
} from "./components"
import {
  pengajuanUPT,
  periodeUPT,
  unitKerja,
  rupiah,
  type UPTPengajuan,
} from "@/data/dummy-upt"
import { Badge } from "@/components/ui/badge"

type AmprahRecord = {
  pengajuan: UPTPengajuan
  nomorAmprah: string
  amprahStatus: "Tersedia" | "Belum Disusun"
  jenisAmprah: "Reguler" | "Insentif Bulan ke-13" | "THR Kinerja"
}

export default function AmprahPage() {
  const { periode: activePeriode } = usePeriode()
  const [records, setRecords] = useState<AmprahRecord[]>(() =>
    pengajuanUPT.map((p, idx) => {
      const tersedia = p.status === "amprah_tersedia"
      return {
        pengajuan: p,
        nomorAmprah: tersedia
          ? `AMP/P1/2026/10/${String(idx + 1).padStart(3, "0")}`
          : `AMP/2026/${String(idx + 1).padStart(3, "0")}`,
        amprahStatus: tersedia ? "Tersedia" : "Belum Disusun",
        jenisAmprah: "Reguler",
      }
    })
  )

  const [unitFilter, setUnitFilter] = useState("semua")
  const [periodeFilter, setPeriodeFilter] = useState(activePeriode || "semua")
  const [statusFilter, setStatusFilter] = useState("semua")
  const [search, setSearch] = useState("")

  const [isSusunOpen, setIsSusunOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(pengajuanUPT[0].unit)
  const [selectedPeriode, setSelectedPeriode] = useState(activePeriode || "Oktober 2026")
  const [selectedJenis, setSelectedJenis] = useState<"Reguler" | "Insentif Bulan ke-13" | "THR Kinerja">("Reguler")

  const [isSusunSemuaOpen, setIsSusunSemuaOpen] = useState(false)

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchUnit = unitFilter === "semua" || rec.pengajuan.unit === unitFilter
      const matchPeriode = periodeFilter === "semua" || rec.pengajuan.periode === periodeFilter
      const matchStatus =
        statusFilter === "semua" || rec.amprahStatus === statusFilter
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        rec.nomorAmprah.toLowerCase().includes(q) ||
        rec.pengajuan.unit.toLowerCase().includes(q)
      return matchUnit && matchPeriode && matchStatus && matchSearch
    })
  }, [records, unitFilter, periodeFilter, statusFilter, search])

  const readyUnits = useMemo(
    () =>
      records.filter(
        (r) =>
          r.pengajuan.status === "netto_ditetapkan" &&
          r.amprahStatus === "Belum Disusun"
      ),
    [records]
  )

  const targetRecord = useMemo(
    () =>
      records.find(
        (r) =>
          r.pengajuan.unit === selectedUnit &&
          r.pengajuan.periode === selectedPeriode
      ),
    [records, selectedUnit, selectedPeriode]
  )

  const isAlreadyExist = targetRecord?.amprahStatus === "Tersedia"
  const isNettoReady =
    targetRecord?.pengajuan.status === "netto_ditetapkan" ||
    targetRecord?.pengajuan.status === "amprah_tersedia"

  const missingNettoPegawai = useMemo(() => {
    if (!targetRecord || isNettoReady) return []
    return [
      { nama: "Tim Pengajuan Unit (Draft/Verifikasi)", nip: targetRecord.pengajuan.id, ket: `Status: ${targetRecord.pengajuan.status}` },
    ]
  }, [targetRecord, isNettoReady])

  const handleSusunSingle = () => {
    if (!targetRecord || !isNettoReady || isAlreadyExist) return
    setRecords((prev) =>
      prev.map((r) =>
        r.pengajuan.id === targetRecord.pengajuan.id
          ? {
              ...r,
              amprahStatus: "Tersedia",
              jenisAmprah: selectedJenis,
              pengajuan: { ...r.pengajuan, status: "amprah_tersedia" },
            }
          : r
      )
    )
    setIsSusunOpen(false)
    toast.success(`Amprah ${targetRecord.nomorAmprah} (${selectedUnit}) berhasil disusun.`)
  }

  const handleSusunSemua = () => {
    const count = readyUnits.length
    setRecords((prev) =>
      prev.map((r) =>
        r.pengajuan.status === "netto_ditetapkan" && r.amprahStatus === "Belum Disusun"
          ? {
              ...r,
              amprahStatus: "Tersedia",
              pengajuan: { ...r.pengajuan, status: "amprah_tersedia" },
            }
          : r
      )
    )
    setIsSusunSemuaOpen(false)
    toast.success(`${count} amprah unit yang siap berhasil disusun secara massal.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Amprah Pembayaran P1"
        subtitle="Daftar amprah per unit dan periode. Amprah dapat disusun setelah P1 Netto ditetapkan."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={readyUnits.length === 0}
              onClick={() => setIsSusunSemuaOpen(true)}
            >
              <Layers className="size-4" /> Susun Semua yang Siap ({readyUnits.length})
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setIsSusunOpen(true)}>
              <Plus className="size-4" /> Susun Amprah
            </Button>
          </div>
        }
      />

      <WarningBanner variant="info" title="Catatan Pencairan Dana (SAKU)">
        Unggah amprah ke <strong>SAKU</strong> dilakukan di luar SIREMUN. Sistem tidak mentransfer dana.
      </WarningBanner>

      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor amprah atau unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="semua">Semua Unit Kerja</option>
            {unitKerja.map((u) => (
              <option key={u.kode} value={u.nama}>
                {u.nama}
              </option>
            ))}
          </select>

          <select
            value={periodeFilter}
            onChange={(e) => setPeriodeFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="semua">Semua Periode</option>
            {periodeUPT.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="semua">Semua Status</option>
            <option value="Tersedia">Tersedia</option>
            <option value="Belum Disusun">Belum Disusun</option>
          </select>
        </div>
      </div>

      <Table
        headers={[
          "Nomor Amprah",
          "Unit",
          "Periode",
          "Jumlah Pegawai",
          "Total Netto",
          "Status",
          "Aksi",
        ]}
      >
        {filteredRecords.map((rec) => (
          <Row key={rec.pengajuan.id}>
            <Cell className="font-semibold">
              {rec.nomorAmprah}
              {rec.jenisAmprah !== "Reguler" && (
                <Badge variant="outline" className="ml-2 text-[10px]">
                  {rec.jenisAmprah}
                </Badge>
              )}
            </Cell>
            <Cell>{rec.pengajuan.unit}</Cell>
            <Cell>{rec.pengajuan.periode}</Cell>
            <Cell>{rec.pengajuan.pegawai}</Cell>
            <Cell className="font-semibold">{rupiah(rec.pengajuan.netto)}</Cell>
            <Cell>
              <Status>{rec.amprahStatus === "Tersedia" ? "Selesai" : "Menunggu"}</Status>
            </Cell>
            <Cell>
              <Button asChild variant="link" size="sm" className="px-0 font-medium text-primary">
                <Link to={`/upt-remunerasi/amprah/${encodeURIComponent(rec.pengajuan.id)}`}>
                  {rec.amprahStatus === "Tersedia" ? "Buka" : "Susun"}
                </Link>
              </Button>
            </Cell>
          </Row>
        ))}
      </Table>

      <FormDialog
        open={isSusunOpen}
        onOpenChange={setIsSusunOpen}
        title="Susun Amprah Pembayaran P1"
        description="Pilih unit kerja dan periode untuk memeriksa kesiapan P1 Netto sebelum menyusun amprah."
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsSusunOpen(false)}>
              Batal
            </Button>
            {isAlreadyExist && targetRecord ? (
              <Button asChild size="sm">
                <Link to={`/upt-remunerasi/amprah/${encodeURIComponent(targetRecord.pengajuan.id)}`}>
                  Buka Amprah yang Ada
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={!isNettoReady || !targetRecord}
                onClick={handleSusunSingle}
              >
                Susun Amprah
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground">Unit Kerja</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                {pengajuanUPT.map((p) => (
                  <option key={p.id} value={p.unit}>
                    {p.unit}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-foreground">Periode</label>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                {periodeUPT.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground">Jenis Amprah</label>
            <select
              value={selectedJenis}
              onChange={(e) =>
                setSelectedJenis(e.target.value as "Reguler" | "Insentif Bulan ke-13" | "THR Kinerja")
              }
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="Reguler">Reguler</option>
              <option value="Insentif Bulan ke-13">Insentif Bulan ke-13</option>
              <option value="THR Kinerja">THR Kinerja</option>
            </select>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4 space-y-2.5">
            <h4 className="font-semibold text-foreground">Panel Kesiapan Netto</h4>
            {!targetRecord ? (
              <p className="text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="size-4 shrink-0" /> Tidak ada pengajuan pada unit dan periode ini.
              </p>
            ) : isAlreadyExist ? (
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sky-900 flex items-start gap-2">
                <Info className="size-4 shrink-0 text-sky-600 mt-0.5" />
                <span>
                  Amprah untuk <strong>{selectedUnit}</strong> periode <strong>{selectedPeriode}</strong> sudah tersedia
                  ({targetRecord.nomorAmprah}). Sistem tidak membuat duplikat.
                </span>
              </div>
            ) : isNettoReady ? (
              <ul className="space-y-1.5 text-emerald-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" /> P1 Netto unit sudah ditetapkan ({rupiah(targetRecord.pengajuan.netto)})
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" /> Seluruh {targetRecord.pengajuan.pegawai} pegawai memiliki nilai Netto valid
                </li>
              </ul>
            ) : (
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-rose-700 font-medium">
                  <AlertCircle className="size-4 shrink-0" /> Belum memenuhi syarat penyusunan amprah:
                </p>
                <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-2.5 space-y-1">
                  {missingNettoPegawai.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-rose-800">
                      <span>{m.nama} ({m.nip})</span>
                      <span className="font-medium">{m.ket}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={isSusunSemuaOpen}
        onOpenChange={setIsSusunSemuaOpen}
        title="Susun Semua Amprah yang Siap"
        description={`Terdapat ${readyUnits.length} unit yang sudah berstatus Netto Ditetapkan dan siap disusun amprahnya.`}
        summary={
          <ul className="space-y-1 text-xs">
            {readyUnits.map((r) => (
              <li key={r.pengajuan.id} className="flex justify-between">
                <span>{r.pengajuan.unit}</span>
                <span className="font-semibold">{rupiah(r.pengajuan.netto)}</span>
              </li>
            ))}
          </ul>
        }
        confirmText={`Susun ${readyUnits.length} Amprah`}
        onConfirm={handleSusunSemua}
      />
    </div>
  )
}
