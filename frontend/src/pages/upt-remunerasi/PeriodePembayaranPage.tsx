import { useState, useMemo } from "react"
import {
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  ChevronRight,
  Search,
} from "lucide-react"
import {
  PageHeader,
  StatusBadge,
  Button,
  Input,
  FormDialog,
  ConfirmDialog,
  WarningBanner,
  Toast,
} from "./components"
import {
  daftarPeriodeData,
  rupiah,
  type PeriodeDetailItem,
  type PeriodeStatus,
} from "@/data/dummy-upt"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

export default function PeriodePembayaranPage() {
  const [periodeList, setPeriodeList] = useState<PeriodeDetailItem[]>(daftarPeriodeData)
  const [selectedPeriode, setSelectedPeriode] = useState<PeriodeDetailItem>(daftarPeriodeData[0])
  const [search, setSearch] = useState("")

  const [openNewPeriodDialog, setOpenNewPeriodDialog] = useState(false)
  const [newBulan, setNewBulan] = useState<number>(11)
  const [newTahun, setNewTahun] = useState<number>(2026)

  const [lockDialogOpen, setLockDialogOpen] = useState(false)

  const [editingTahapanIndex, setEditingTahapanIndex] = useState<number | null>(null)
  const [editTglMulai, setEditTglMulai] = useState("")
  const [editTglSelesai, setEditTglSelesai] = useState("")

  const filteredPeriods = useMemo(() => {
    return periodeList.filter((p) => p.nama.toLowerCase().includes(search.toLowerCase()))
  }, [periodeList, search])

  const unitBelumSelesai = useMemo(() => {
    return selectedPeriode.unitStatusList.filter((u) => !u.amprahTersedia)
  }, [selectedPeriode])

  const canLockPeriod = unitBelumSelesai.length === 0 && selectedPeriode.unitStatusList.length > 0

  const handleCreatePeriod = () => {
    const namaBulan = NAMA_BULAN[newBulan - 1]
    const namaPeriode = `${namaBulan} ${newTahun}`
    const kodePeriode = `${newTahun}-${String(newBulan).padStart(2, "0")}`

    if (periodeList.some((p) => p.kode === kodePeriode)) {
      Toast.error(`Periode ${namaPeriode} sudah terdaftar dalam sistem.`)
      return
    }

    const nextMonthNum = newBulan === 12 ? 1 : newBulan + 1
    const nextYearNum = newBulan === 12 ? newTahun + 1 : newTahun
    const nextBulanNama = NAMA_BULAN[nextMonthNum - 1].slice(0, 3)

    const newPeriodItem: PeriodeDetailItem = {
      kode: kodePeriode,
      nama: namaPeriode,
      tahun: newTahun,
      bulan: newBulan,
      hariKalender: 30,
      hariKerja: 21,
      status: "terbuka",
      unitSelesai: 0,
      unitTotal: 12,
      tahapan: [
        {
          nama: "Tahap 1: Rekap Absensi & Pengajuan Unit",
          jadwalDefault: `1 - 5 ${nextBulanNama} ${nextYearNum}`,
          tanggalMulai: `${nextYearNum}-${String(nextMonthNum).padStart(2, "0")}-01`,
          tanggalSelesai: `${nextYearNum}-${String(nextMonthNum).padStart(2, "0")}-05`,
          status: "berjalan",
          penanggungJawab: "Bendahara & Kepegawaian Unit",
        },
        {
          nama: "Tahap 2: Verifikasi & SK Penetapan Rektor",
          jadwalDefault: `6 - 8 ${nextBulanNama} ${nextYearNum}`,
          tanggalMulai: `${nextYearNum}-${String(nextMonthNum).padStart(2, "0")}-06`,
          tanggalSelesai: `${nextYearNum}-${String(nextMonthNum).padStart(2, "0")}-08`,
          status: "menunggu",
          penanggungJawab: "Verifikator & Rektorat",
        },
        {
          nama: "Tahap 3: Penetapan Netto, Amprah, & Pencairan",
          jadwalDefault: `9 - 13 ${nextBulanNama} ${nextYearNum}`,
          tanggalMulai: `${nextYearNum}-${String(nextMonthNum).padStart(2, "0")}-09`,
          tanggalSelesai: `${nextYearNum}-${String(nextMonthNum).padStart(2, "0")}-13`,
          status: "menunggu",
          penanggungJawab: "UPT Remunerasi & Bendahara (SAKU)",
        },
      ],
      unitStatusList: [
        { unit: "Fakultas Teknologi Informasi", statusPengajuan: "draft", amprahTersedia: false, nominalNetto: 0 },
        { unit: "Fakultas Teknik", statusPengajuan: "draft", amprahTersedia: false, nominalNetto: 0 },
        { unit: "Fakultas Ekonomi dan Bisnis", statusPengajuan: "draft", amprahTersedia: false, nominalNetto: 0 },
      ],
    }

    setPeriodeList((prev) => [newPeriodItem, ...prev])
    setSelectedPeriode(newPeriodItem)
    setOpenNewPeriodDialog(false)
    Toast.success(`Periode ${namaPeriode} berhasil dibuka!`)
  }

  const handleConfirmLock = () => {
    setPeriodeList((prev) =>
      prev.map((p) => (p.kode === selectedPeriode.kode ? { ...p, status: "terkunci" as PeriodeStatus } : p))
    )
    setSelectedPeriode((prev) => ({ ...prev, status: "terkunci" }))
    setLockDialogOpen(false)
    Toast.success(`Periode ${selectedPeriode.nama} berhasil dikunci menjadi Hanya-Baca.`)
  }

  const handleUnlockPeriod = () => {
    setPeriodeList((prev) =>
      prev.map((p) => (p.kode === selectedPeriode.kode ? { ...p, status: "terkunci" as PeriodeStatus } : p))
    )
    setSelectedPeriode((prev) => ({ ...prev, status: "terbuka" }))
    Toast.success(`Kunci periode ${selectedPeriode.nama} dibuka kembali.`)
  }

  const handleSaveTahapanDate = (index: number) => {
    const updated = { ...selectedPeriode }
    updated.tahapan[index].tanggalMulai = editTglMulai
    updated.tahapan[index].tanggalSelesai = editTglSelesai
    setSelectedPeriode(updated)
    setPeriodeList((prev) => prev.map((p) => (p.kode === updated.kode ? updated : p)))
    setEditingTahapanIndex(null)
    Toast.success("Jadwal tahapan berhasil diperbarui.")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Periode & Jadwal Siklus Remunerasi"
        subtitle="Kelola pembukaan periode bulanan, batas waktu tahapan siklus (Tabel 5.1), dan penguncian data remunerasi."
        actions={
          <Button onClick={() => setOpenNewPeriodDialog(true)} className="gap-2">
            <Plus className="size-4" /> Buka Periode Baru
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-none lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-sm">Daftar Periode</h3>
            <span className="text-xs text-muted-foreground">{periodeList.length} Periode</span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter periode..."
              className="pl-8 text-xs h-8"
            />
          </div>

          <div className="space-y-2">
            {filteredPeriods.map((p) => {
              const isSelected = p.kode === selectedPeriode.kode
              return (
                <div
                  key={p.kode}
                  onClick={() => setSelectedPeriode(p)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{p.nama}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Progres: {p.unitSelesai} / {p.unitTotal} Unit Selesai
                    </p>
                  </div>
                  <ChevronRight className={`size-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-none lg:col-span-2 space-y-6">
          <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold">{selectedPeriode.nama}</h3>
                <StatusBadge status={selectedPeriode.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedPeriode.hariKalender} Hari Kalender • {selectedPeriode.hariKerja} Hari Kerja
              </p>
            </div>

            <div>
              {selectedPeriode.status === "terbuka" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                  onClick={() => setLockDialogOpen(true)}
                >
                  <Lock className="size-3.5" /> Kunci Periode
                </Button>
              )}
              {selectedPeriode.status === "terkunci" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-primary"
                  onClick={handleUnlockPeriod}
                >
                  <Unlock className="size-3.5" /> Buka Kunci
                </Button>
              )}
            </div>
          </div>

          {selectedPeriode.status === "terkunci" && (
            <WarningBanner variant="info" title="Periode Terkunci (Hanya-Baca)">
              Data perhitungan P1 dan amprah pada periode ini telah dikunci permanen. Seluruh unit
              dan bendahara hanya dapat mengunduh dokumen tanpa dapat melakukan pengajuan susulan.
            </WarningBanner>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              Jadwal Tahapan Siklus Bulanan (Tabel 5.1)
            </h4>

            <div className="space-y-3">
              {selectedPeriode.tahapan.map((tahap, idx) => {
                const isEditing = editingTahapanIndex === idx

                return (
                  <div key={idx} className="rounded-lg border p-4 bg-muted/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-sm text-foreground">{tahap.nama}</span>
                      </div>
                      <span className="font-mono text-muted-foreground">Default: {tahap.jadwalDefault}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-muted-foreground">
                      <span>Penanggung Jawab: <strong className="text-foreground">{tahap.penanggungJawab}</strong></span>

                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={editTglMulai}
                            onChange={(e) => setEditTglMulai(e.target.value)}
                            className="h-7 w-32 text-xs"
                          />
                          <span>s.d.</span>
                          <Input
                            type="date"
                            value={editTglSelesai}
                            onChange={(e) => setEditTglSelesai(e.target.value)}
                            className="h-7 w-32 text-xs"
                          />
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleSaveTahapanDate(idx)}
                          >
                            Simpan
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setEditingTahapanIndex(null)}
                          >
                            Batal
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {tahap.tanggalMulai} s.d. {tahap.tanggalSelesai}
                          </span>
                          {selectedPeriode.status !== "terkunci" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-xs text-primary"
                              onClick={() => {
                                setEditingTahapanIndex(idx)
                                setEditTglMulai(tahap.tanggalMulai)
                                setEditTglSelesai(tahap.tanggalSelesai)
                              }}
                            >
                              Sesuaikan
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              Status & Progres Unit Kerja ({selectedPeriode.unitStatusList.length} Unit)
            </h4>

            {selectedPeriode.unitStatusList.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Belum ada pengajuan unit pada periode ini.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 text-left text-muted-foreground border-b">
                    <tr>
                      <th className="px-3 py-2 font-medium">Unit Kerja</th>
                      <th className="px-3 py-2 font-medium">Status Pengajuan</th>
                      <th className="px-3 py-2 font-medium">Amprah</th>
                      <th className="px-3 py-2 font-medium text-right">Nominal P1 Netto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedPeriode.unitStatusList.map((u, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{u.unit}</td>
                        <td className="px-3 py-2">
                          <StatusBadge status={u.statusPengajuan} />
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`font-semibold ${
                              u.amprahTersedia ? "text-emerald-600" : "text-amber-600"
                            }`}
                          >
                            {u.amprahTersedia ? "Tersedia" : "Belum Siap"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-foreground">
                          {u.nominalNetto > 0 ? rupiah(u.nominalNetto) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <FormDialog
        open={openNewPeriodDialog}
        onOpenChange={setOpenNewPeriodDialog}
        title="Buka Periode Pembayaran Baru"
        description="Pilih bulan dan tahun remunerasi. Sistem otomatis mengisi jadwal default siklus Tabel 5.1."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenNewPeriodDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleCreatePeriod}>Buka Periode</Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Bulan Remunerasi *</Label>
            <Select value={String(newBulan)} onValueChange={(val) => setNewBulan(Number(val))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NAMA_BULAN.map((bln, idx) => (
                  <SelectItem key={idx + 1} value={String(idx + 1)}>
                    {bln}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Tahun *</Label>
            <Select value={String(newTahun)} onValueChange={(val) => setNewTahun(Number(val))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/20 p-3 text-xs space-y-1">
          <p className="font-semibold text-foreground">Jadwal Siklus Default Otomatis:</p>
          <p className="text-muted-foreground">• Rekap Absensi: Tanggal 1 - 5 bulan berikutnya</p>
          <p className="text-muted-foreground">• SK Penetapan Rektor: Tanggal 6 - 8 bulan berikutnya</p>
          <p className="text-muted-foreground">• Pencairan Amprah: Tanggal 9 - 13 bulan berikutnya</p>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={lockDialogOpen}
        onOpenChange={setLockDialogOpen}
        title={`Kunci Periode ${selectedPeriode.nama}?`}
        description="Periode yang dikunci akan menjadi Hanya-Baca. Tidak ada unit yang dapat melakukan perbaikan atau pengajuan ulang."
        danger
        confirmText="Ya, Kunci Periode"
        summary={
          <div className="space-y-2">
            <p className="font-semibold text-xs text-foreground">Daftar Periksa Kesiapan Penguncian:</p>
            {unitBelumSelesai.length > 0 ? (
              <WarningBanner variant="error" title="Unit Belum Selesai Ditemukan!">
                Terdapat <strong>{unitBelumSelesai.length} unit</strong> yang amprah pembayarannya belum tersedia:
                <ul className="mt-1 list-disc pl-4 text-xs">
                  {unitBelumSelesai.map((u, idx) => (
                    <li key={idx}>
                      {u.unit} (<StatusBadge status={u.statusPengajuan} />)
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-bold text-rose-700">
                  Tombol kunci dinonaktifkan sampai seluruh unit menyelesaikan amprah.
                </p>
              </WarningBanner>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded">
                <CheckCircle2 className="size-4" />
                Seluruh 12 unit telah selesai dan amprah tersedia. Periode aman untuk dikunci.
              </div>
            )}
          </div>
        }
        loading={false}
        onConfirm={canLockPeriod ? handleConfirmLock : () => Toast.error("Tidak dapat mengunci: masih ada unit yang belum selesai.")}
      />
    </div>
  )
}
