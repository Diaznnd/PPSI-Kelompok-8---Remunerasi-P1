import { useState, useMemo } from "react"
import {
  Users,
  ShieldCheck,
  Building2,
  History,
  Search,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  UserPlus,
  UserCog,
} from "lucide-react"
import { toast } from "sonner"
import AnggotaUptTab from "./AnggotaUptTab"
import {
  PageHeader,
  WarningBanner,
  DataTable,
  StatusBadge,
  FormDialog,
  DetailDrawer,
  DrawerSection,
  DrawerTimeline,
  Button,
  Input,
  Card,
  type ColumnDef,
} from "./components"
import {
  penugasanUnitListInitial,
  personilNonUnitList,
  daftarPegawai,
  anggotaUptInitial,
  auditUPT,
  type PenugasanUnitDetail,
  type PenugasanPejabat,
  type PersonilNonUnit,
  type StatusEntitas,
} from "@/types/upt"
import { Badge } from "@/components/ui/badge"

export function PenugasanPeranSection() {
  const [activeTab, setActiveTab] = useState<"unit" | "verifikator" | "anggota_upt">("unit")
  const [unitList, setUnitList] = useState<PenugasanUnitDetail[]>(penugasanUnitListInitial)
  const [nonUnitList, setNonUnitList] = useState<PersonilNonUnit[]>(personilNonUnitList)
  const [searchUnit, setSearchUnit] = useState("")

  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false)
  const [selectedUnitForHistory, setSelectedUnitForHistory] = useState<PenugasanUnitDetail | null>(null)

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedUnitForAssign, setSelectedUnitForAssign] = useState<PenugasanUnitDetail | null>(null)
  const [selectedRoleForAssign, setSelectedRoleForAssign] = useState<"bendahara" | "kepegawaian" | "penanggungJawab">("bendahara")
  const [currentOfficial, setCurrentOfficial] = useState<PenugasanPejabat | null>(null)
  
  const [newPegawaiNip, setNewPegawaiNip] = useState("")
  const [newTanggalMulai, setNewTanggalMulai] = useState("2026-11-01")
  const [newNomorSk, setNewNomorSk] = useState("")
  const [newCatatan, setNewCatatan] = useState("")
  const [assignError, setAssignError] = useState("")

  const [isNonUnitDialogOpen, setIsNonUnitDialogOpen] = useState(false)
  const [nonUnitPegawaiNip, setNonUnitPegawaiNip] = useState("")
  const [nonUnitNomorSk, setNonUnitNomorSk] = useState("")
  const [nonUnitTanggalMulai, setNonUnitTanggalMulai] = useState("2026-11-01")
  const [nonUnitLingkup, setNonUnitLingkup] = useState("")
  const [nonUnitError, setNonUnitError] = useState("")

  const filteredUnitList = useMemo(() => {
    return unitList.filter((u) =>
      u.unitNama.toLowerCase().includes(searchUnit.toLowerCase()) ||
      u.unitKode.toLowerCase().includes(searchUnit.toLowerCase()) ||
      u.bendahara?.nama.toLowerCase().includes(searchUnit.toLowerCase()) ||
      u.kepegawaian?.nama.toLowerCase().includes(searchUnit.toLowerCase()) ||
      u.penanggungJawab?.nama.toLowerCase().includes(searchUnit.toLowerCase())
    )
  }, [unitList, searchUnit])

  const handleOpenAssign = (
    unit: PenugasanUnitDetail,
    roleKey: "bendahara" | "kepegawaian" | "penanggungJawab"
  ) => {
    setSelectedUnitForAssign(unit)
    setSelectedRoleForAssign(roleKey)
    setCurrentOfficial(unit[roleKey])
    setNewPegawaiNip("")
    setNewTanggalMulai(new Date().toISOString().split("T")[0])
    setNewNomorSk(`SK/R/${Math.floor(100 + Math.random() * 900)}/2026`)
    setNewCatatan("")
    setAssignError("")
    setIsAssignDialogOpen(true)
  }

  const handleSaveUnitAssignment = () => {
    if (!selectedUnitForAssign) return

    if (!newPegawaiNip) {
      setAssignError("Pilih salah satu pegawai dari daftar.")
      return
    }

    if (!newNomorSk.trim()) {
      setAssignError("Nomor SK penugasan wajib diisi.")
      return
    }

    if (!newTanggalMulai) {
      setAssignError("Tanggal mulai penugasan wajib diisi.")
      return
    }

    const selectedPegawai = daftarPegawai.find((p) => p.nip === newPegawaiNip)
    if (!selectedPegawai) {
      setAssignError("Data pegawai tidak valid.")
      return
    }

    if (selectedRoleForAssign === "bendahara") {
      const isVerifikator = nonUnitList.some(
        (nu) => nu.peran === "Verifikator" && nu.nip === selectedPegawai.nip && nu.status === "aktif"
      )
      if (isVerifikator) {
        setAssignError(
          "Bendahara dan Verifikator tidak boleh orang yang sama. Pegawai ini saat ini berstatus Verifikator aktif di tingkat universitas."
        )
        return
      }
    }

    const roleName =
      selectedRoleForAssign === "bendahara"
        ? "Bendahara Unit"
        : selectedRoleForAssign === "kepegawaian"
        ? "Bidang Kepegawaian Unit"
        : "Penanggung Jawab Remunerasi Unit"

    const newPejabat: PenugasanPejabat = {
      nama: selectedPegawai.nama,
      nip: selectedPegawai.nip,
      sejak: newTanggalMulai,
      nomorSk: newNomorSk.trim(),
    }

    setUnitList((prev) =>
      prev.map((u) => {
        if (u.id === selectedUnitForAssign.id) {
          const oldPejabat = u[selectedRoleForAssign]
          const updatedRiwayat = [...u.riwayat]

          if (oldPejabat) {
            updatedRiwayat.unshift({
              peran: roleName,
              namaLama: oldPejabat.nama,
              namaBaru: newPejabat.nama,
              tanggalMulai: newPejabat.sejak,
              tanggalSelesai: "Kemarin",
              nomorSk: newPejabat.nomorSk,
              catatan: newCatatan.trim() || "Pergantian pejabat unit kerja",
            })
          }

          return {
            ...u,
            [selectedRoleForAssign]: newPejabat,
            riwayat: updatedRiwayat,
          }
        }
        return u
      })
    )

    auditUPT.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      waktu: "15 Nov 2026, 22:15",
      tanggal: "2026-11-15",
      pelaku: "Dewi Anggraini, S.Kom., M.T.",
      peran: "UPT Remunerasi",
      unit: selectedUnitForAssign.unitNama,
      aksi: "Ubah Peran",
      objek: newPejabat.nama,
      detail: `Penugasan ${roleName} pada ${selectedUnitForAssign.unitNama} kepada ${newPejabat.nama} (${newPejabat.nomorSk})`,
      hasil: "Berhasil",
      alasan: newCatatan.trim() || undefined,
    })

    setIsAssignDialogOpen(false)
    toast.success(
      `Penugasan ${roleName} untuk ${selectedUnitForAssign.unitNama} berhasil disimpan atas nama ${newPejabat.nama}.`
    )
  }

  const handleSaveNonUnit = () => {
    if (!nonUnitPegawaiNip) {
      setNonUnitError("Pilih pegawai terlebih dahulu.")
      return
    }
    if (!nonUnitNomorSk.trim()) {
      setNonUnitError("Nomor SK wajib diisi.")
      return
    }

    const selectedPeg = daftarPegawai.find((p) => p.nip === nonUnitPegawaiNip)
    if (!selectedPeg) {
      setNonUnitError("Pegawai tidak ditemukan.")
      return
    }

    const isBendahara = unitList.some((u) => u.bendahara?.nip === selectedPeg.nip)
    if (isBendahara) {
      setNonUnitError(
        "Bendahara dan Verifikator tidak boleh orang yang sama. Pegawai ini saat ini menjabat sebagai Bendahara di unit kerja."
      )
      return
    }
    const isUptAdmin = anggotaUptInitial.some((u) => u.nip === selectedPeg.nip && u.status === "aktif")
    if (isUptAdmin) {
      setNonUnitError(
        "Anggota Admin UPT Remunerasi tidak boleh merangkap sebagai Verifikator demi pemisahan tugas."
      )
      return
    }

    const newPersonil: PersonilNonUnit = {
      id: `V-${String(nonUnitList.length + 1).padStart(2, "0")}`,
      nama: selectedPeg.nama,
      nip: selectedPeg.nip,
      peran: "Verifikator",
      nomorSk: nonUnitNomorSk.trim(),
      sejak: nonUnitTanggalMulai,
      status: "aktif",
      lingkup: nonUnitLingkup.trim() || "Seluruh Unit Universitas",
    }

    setNonUnitList((prev) => [newPersonil, ...prev])
    auditUPT.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      waktu: "15 Nov 2026, 22:15",
      tanggal: "2026-11-15",
      pelaku: "Dewi Anggraini, S.Kom., M.T.",
      peran: "UPT Remunerasi",
      unit: "Universitas",
      aksi: "Ubah Peran",
      objek: newPersonil.nama,
      detail: `Penugasan Tim Verifikator (${newPersonil.lingkup}) kepada ${newPersonil.nama} (${newPersonil.nomorSk})`,
      hasil: "Berhasil",
    })
    setIsNonUnitDialogOpen(false)
    toast.success(`Personil Verifikator (${newPersonil.nama}) berhasil ditugaskan.`)
  }

  const nonUnitColumns: ColumnDef<PersonilNonUnit>[] = [
    {
      header: "Nama Personil & NIP",
      cell: (item) => (
        <div>
          <span className="font-semibold text-foreground text-sm">{item.nama}</span>
          <p className="text-xs text-muted-foreground font-mono">NIP: {item.nip}</p>
        </div>
      ),
    },
    {
      header: "Peran Otoritas",
      cell: (item) => (
        <Badge className="text-xs bg-sky-100 text-sky-800 border-sky-200">
          {item.peran}
        </Badge>
      ),
      className: "w-36",
    },
    {
      header: "Nomor SK Penugasan",
      accessorKey: "nomorSk",
      className: "text-xs font-mono text-muted-foreground w-44",
    },
    {
      header: "Sejak",
      accessorKey: "sejak",
      className: "text-xs text-muted-foreground w-28",
    },
    {
      header: "Cakupan Unit Kerja / Tim",
      accessorKey: "lingkup",
      className: "text-xs text-foreground",
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
      className: "w-24",
    },
    {
      header: "Aksi",
      cell: (item) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-rose-600 hover:bg-rose-50"
          onClick={() => {
            setNonUnitList((prev) =>
              prev.map((nu) =>
                nu.id === item.id
                  ? { ...nu, status: (nu.status === "aktif" ? "nonaktif" : "aktif") as StatusEntitas }
                  : nu
              )
            )
            auditUPT.unshift({
              id: `AUD-${Date.now().toString().slice(-4)}`,
              waktu: "15 Nov 2026, 22:15",
              tanggal: "2026-11-15",
              pelaku: "Dewi Anggraini, S.Kom., M.T.",
              peran: "UPT Remunerasi",
              unit: "Universitas",
              aksi: "Ubah Peran",
              objek: item.nama,
              detail: `${item.status === "aktif" ? "Menonaktifkan" : "Mengaktifkan"} penugasan Verifikator ${item.nama}`,
              hasil: "Berhasil",
            })
            toast.success(`Status penugasan ${item.nama} telah diubah.`)
          }}
        >
          {item.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-xl border bg-muted/30 p-1.5 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("unit")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "unit"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="size-3.5" /> Pejabat Operasional Unit Kerja ({unitList.length} Unit)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("verifikator")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "verifikator"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="size-3.5" /> Tim Verifikator Universitas ({nonUnitList.length} Personil)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("anggota_upt")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "anggota_upt"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCog className="size-3.5" /> Anggota Admin UPT Remunerasi
        </button>
      </div>

      {activeTab === "unit" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WarningBanner variant="info" title="Penanggung Jawab Ex-Officio (Pedoman Pasal 5.1)">
              Penanggung Jawab Remunerasi Unit dijabat oleh <strong>Wakil Dekan II</strong> pada Fakultas atau{" "}
              <strong>Wakil Direktur II</strong> pada Pascasarjana / Sekolah secara <em>ex-officio</em>.
            </WarningBanner>
            <WarningBanner variant="info" title="Kontinuitas Pengajuan P1 Unit">
              Pengajuan P1 adalah milik unit kerja. Apabila terjadi pergantian Bendahara, status dan draf pengajuan lama{" "}
              <strong>dapat langsung dilanjutkan</strong> oleh Bendahara baru tanpa kehilangan data.
            </WarningBanner>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari unit kerja, kode, atau nama pejabat..."
                value={searchUnit}
                onChange={(e) => setSearchUnit(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUnitList.map((unit) => (
              <Card key={unit.id} className="flex flex-col justify-between border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10 mr-2">
                        {unit.unitKode}
                      </span>
                      <span className="font-semibold text-sm text-foreground">{unit.unitNama}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="rounded-lg border p-3 bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Users className="size-3.5 text-emerald-600" /> Bendahara Pengeluaran
                        </span>
                        {unit.bendahara ? (
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">
                            Belum ada
                          </Badge>
                        )}
                      </div>

                      {unit.bendahara ? (
                        <div className="text-xs space-y-0.5">
                          <p className="font-semibold text-foreground">{unit.bendahara.nama}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">NIP: {unit.bendahara.nip}</p>
                          <p className="text-[11px] text-muted-foreground">SK: {unit.bendahara.nomorSk}</p>
                          <p className="text-[10px] text-muted-foreground">Sejak: {unit.bendahara.sejak}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Belum ada bendahara ditugaskan untuk unit ini.
                        </p>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs mt-1"
                        onClick={() => handleOpenAssign(unit, "bendahara")}
                      >
                        {unit.bendahara ? "Ganti Bendahara" : "Tugaskan Bendahara"}
                      </Button>
                    </div>

                    <div className="rounded-lg border p-3 bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Users className="size-3.5 text-sky-600" /> Bidang Kepegawaian
                        </span>
                        {unit.kepegawaian ? (
                          <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-700 border-sky-200">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">
                            Belum ada
                          </Badge>
                        )}
                      </div>

                      {unit.kepegawaian ? (
                        <div className="text-xs space-y-0.5">
                          <p className="font-semibold text-foreground">{unit.kepegawaian.nama}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">NIP: {unit.kepegawaian.nip}</p>
                          <p className="text-[11px] text-muted-foreground">SK: {unit.kepegawaian.nomorSk}</p>
                          <p className="text-[10px] text-muted-foreground">Sejak: {unit.kepegawaian.sejak}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Belum ada staf kepegawaian ditugaskan.
                        </p>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs mt-1"
                        onClick={() => handleOpenAssign(unit, "kepegawaian")}
                      >
                        {unit.kepegawaian ? "Ganti Petugas" : "Tugaskan Kepegawaian"}
                      </Button>
                    </div>

                    <div className="rounded-lg border p-3 bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Users className="size-3.5 text-amber-600" /> Penanggung Jawab (PJ)
                        </span>
                        {unit.penanggungJawab ? (
                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">
                            Belum ada
                          </Badge>
                        )}
                      </div>

                      {unit.penanggungJawab ? (
                        <div className="text-xs space-y-0.5">
                          <p className="font-semibold text-foreground">{unit.penanggungJawab.nama}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">NIP: {unit.penanggungJawab.nip}</p>
                          <p className="text-[11px] text-muted-foreground">SK: {unit.penanggungJawab.nomorSk}</p>
                          <p className="text-[10px] text-muted-foreground">Sejak: {unit.penanggungJawab.sejak}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Penanggung jawab unit belum ditentukan.
                        </p>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs mt-1"
                        onClick={() => handleOpenAssign(unit, "penanggungJawab")}
                      >
                        {unit.penanggungJawab ? "Ganti PJ Unit" : "Tugaskan PJ Unit"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/20 border-t flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Riwayat: {unit.riwayat.length} catatan rotasi
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary gap-1.5"
                    onClick={() => {
                      setSelectedUnitForHistory(unit)
                      setIsHistoryDrawerOpen(true)
                    }}
                  >
                    <History className="size-3.5" /> Riwayat Penugasan
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "verifikator" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <WarningBanner variant="info" title="Pemetaan Personil Tim Verifikator & Cakupan Unit Kerja">
              Sub-bagian ini memetakan personil <strong>Tim Verifikator</strong> berdasarkan SK beserta cakupan unit
              kerja yang diverifikasi (mis. Tim 1: FTI, FT, FEB; Tim 2: FH, FK, FMIPA). Verifikator tidak boleh
              merangkap sebagai <strong>Bendahara</strong> maupun <strong>Admin UPT Remunerasi</strong>.
            </WarningBanner>
            <Button
              className="gap-2 shrink-0 mb-4"
              onClick={() => {
                setNonUnitPegawaiNip("")
                setNonUnitNomorSk(`SK/R/${Math.floor(100 + Math.random() * 900)}/2026`)
                setNonUnitTanggalMulai(new Date().toISOString().split("T")[0])
                setNonUnitLingkup("")
                setNonUnitError("")
                setIsNonUnitDialogOpen(true)
              }}
            >
              <UserPlus className="size-4" /> Tambah Verifikator
            </Button>
          </div>

          <DataTable columns={nonUnitColumns} data={nonUnitList} />
        </div>
      )}

      {activeTab === "anggota_upt" && <AnggotaUptTab />}

      <FormDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        title={currentOfficial ? `Ganti Pejabat: ${selectedUnitForAssign?.unitNama}` : `Tugaskan Pejabat: ${selectedUnitForAssign?.unitNama}`}
        description="Pilih pegawai dan masukkan data SK pengangkatan resmi."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAssignDialogOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveUnitAssignment}>
              Simpan Penugasan
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {assignError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span>{assignError}</span>
            </div>
          )}

          {currentOfficial && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-900">
                <RefreshCw className="size-4 text-amber-600" />
                <span>Ringkasan Pergantian Pejabat</span>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-800">
                <div>
                  <p className="text-[11px] text-amber-700">Pejabat Saat Ini:</p>
                  <p className="font-semibold">{currentOfficial.nama}</p>
                  <p className="text-[10px] font-mono">NIP: {currentOfficial.nip}</p>
                </div>
                <ArrowRight className="size-4 text-amber-600" />
                <div>
                  <p className="text-[11px] text-amber-700">Akan Digantikan Oleh:</p>
                  <p className="font-semibold">
                    {daftarPegawai.find((p) => p.nip === newPegawaiNip)?.nama || "(Pilih pegawai di bawah)"}
                  </p>
                  <p className="text-[10px] font-mono">{newPegawaiNip || "-"}</p>
                </div>
              </div>
              <p className="text-[10px] text-amber-700 pt-1 border-t border-amber-200">
                Penugasan pejabat lama akan otomatis diarsipkan ke dalam Buku Riwayat Unit dengan status berakhir pada{" "}
                {newTanggalMulai}.
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-foreground">
              Pilih Pegawai Baru <span className="text-rose-500">*</span>
            </label>
            <select
              value={newPegawaiNip}
              onChange={(e) => {
                setNewPegawaiNip(e.target.value)
                setAssignError("")
              }}
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="">-- Pilih Pegawai dari Direktori --</option>
              {daftarPegawai
                .filter((p) => p.statusAktif === "aktif")
                .map((p) => (
                  <option key={p.id} value={p.nip}>
                    {p.nama} ({p.nip}) - {p.unit}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Nomor SK Penugasan <span className="text-rose-500">*</span>
              </label>
              <Input
                value={newNomorSk}
                onChange={(e) => setNewNomorSk(e.target.value)}
                className="mt-1 h-9 text-xs font-mono"
                placeholder="SK/R/015/2026"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">
                Tanggal Mulai Berlaku <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={newTanggalMulai}
                onChange={(e) => setNewTanggalMulai(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Catatan / Alasan Penugasan</label>
            <Input
              value={newCatatan}
              onChange={(e) => setNewCatatan(e.target.value)}
              className="mt-1 h-9 text-xs"
              placeholder="Contoh: Rotasi pejabat berkala tahun anggaran 2026"
            />
          </div>
        </div>
      </FormDialog>

      <FormDialog
        open={isNonUnitDialogOpen}
        onOpenChange={setIsNonUnitDialogOpen}
        title="Penugasan Personil Tim Verifikator"
        description="Tambahkan anggota Tim Verifikator beserta cakupan unit kerja yang diverifikasi berdasarkan SK."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsNonUnitDialogOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveNonUnit}>
              Simpan Verifikator
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {nonUnitError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span>{nonUnitError}</span>
            </div>
          )}

          <div className="rounded-lg border bg-sky-50/70 border-sky-200 px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-sky-900">Peran Otoritas</span>
            <Badge className="text-xs bg-sky-100 text-sky-800 border-sky-200">Verifikator</Badge>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">
              Pilih Pegawai <span className="text-rose-500">*</span>
            </label>
            <select
              value={nonUnitPegawaiNip}
              onChange={(e) => {
                setNonUnitPegawaiNip(e.target.value)
                setNonUnitError("")
              }}
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="">-- Pilih Pegawai --</option>
              {daftarPegawai
                .filter((p) => p.statusAktif === "aktif")
                .map((p) => (
                  <option key={p.id} value={p.nip}>
                    {p.nama} ({p.nip}) - {p.unit}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Nomor SK <span className="text-rose-500">*</span>
              </label>
              <Input
                value={nonUnitNomorSk}
                onChange={(e) => setNonUnitNomorSk(e.target.value)}
                className="mt-1 h-9 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Tanggal Mulai</label>
              <Input
                type="date"
                value={nonUnitTanggalMulai}
                onChange={(e) => setNonUnitTanggalMulai(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Cakupan Unit Kerja / Tim</label>
            <Input
              value={nonUnitLingkup}
              onChange={(e) => setNonUnitLingkup(e.target.value)}
              className="mt-1 h-9 text-xs"
              placeholder="Contoh: Tim 1: FTI, FT, FEB"
            />
          </div>
        </div>
      </FormDialog>

      <DetailDrawer
        open={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        title={`Riwayat Penugasan: ${selectedUnitForHistory?.unitNama ?? ""}`}
        subtitle="Catatan rotasi dan histori penetapan pejabat penanggung jawab remunerasi unit."
        size="md"
        empty={!selectedUnitForHistory?.riwayat || selectedUnitForHistory.riwayat.length === 0}
        emptyText="Belum ada riwayat pergantian pejabat tercatat untuk unit ini."
        footer={
          <Button variant="outline" onClick={() => setIsHistoryDrawerOpen(false)}>
            Tutup
          </Button>
        }
      >
        {selectedUnitForHistory?.riwayat && selectedUnitForHistory.riwayat.length > 0 && (
          <DrawerSection title="Linimasa Rotasi & Penugasan">
            <DrawerTimeline
              items={selectedUnitForHistory.riwayat.map((hist, idx) => ({
                tahap: `${hist.peran}: ${hist.namaLama} → ${hist.namaBaru}`,
                status: idx === 0 ? "berjalan" : "selesai",
                tanggal: hist.tanggalMulai,
                pelaku: `SK ${hist.nomorSk}`,
                catatan: hist.catatan,
              }))}
            />
          </DrawerSection>
        )}
      </DetailDrawer>
    </div>
  )
}

export default function PenugasanUnitPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Penugasan Peran & Pejabat"
        subtitle="Pemetaan pejabat operasional unit kerja, Tim Verifikator universitas, dan Anggota Admin UPT Remunerasi."
      />
      <PenugasanPeranSection />
    </div>
  )
}
