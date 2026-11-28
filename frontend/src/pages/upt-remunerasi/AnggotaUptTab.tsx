import { useMemo, useState } from "react"
import {
  AlertCircle,
  History,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldPlus,
  UserCheck,
  UserMinus,
} from "lucide-react"
import { toast } from "sonner"
import {
  StatCard,
  DataTable,
  WarningBanner,
  ConfirmDialog,
  FormDialog,
  DetailDrawer,
  DrawerSection,
  DrawerTimeline,
  Button,
  Input,
  type ColumnDef,
} from "./components"
import {
  anggotaUptInitial,
  akunPenggunaInitial,
  auditUPT,
  daftarPegawai,
  type AnggotaUPTItem,
  type StatusAnggotaUPT,
} from "@/types/upt"
import { Badge } from "@/components/ui/badge"

const STATUS_BADGE_MAP: Record<StatusAnggotaUPT, { label: string; className: string }> = {
  aktif: {
    label: "Aktif",
    className: "border-emerald-200 bg-emerald-100 text-emerald-800",
  },
  peran_dicabut: {
    label: "Peran Dicabut",
    className: "border-amber-200 bg-amber-100 text-amber-800",
  },
}

export default function AnggotaUptTab() {
  const currentEmail = "dewi.anggraini@unand.ac.id"
  const currentActorName = "Dewi Anggraini"

  const [anggotaList, setAnggotaList] = useState<AnggotaUPTItem[]>(anggotaUptInitial)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("semua")

  const [isPromoteOpen, setIsPromoteOpen] = useState(false)
  const [isConfirmPromoteOpen, setIsConfirmPromoteOpen] = useState(false)
  const [pegawaiQuery, setPegawaiQuery] = useState("")
  const [selectedPegawaiId, setSelectedPegawaiId] = useState("")
  const [promoteSk, setPromoteSk] = useState("")
  const [promoteTanggal, setPromoteTanggal] = useState("2026-11-15")
  const [promoteAlasan, setPromoteAlasan] = useState("")
  const [promoteError, setPromoteError] = useState("")

  const [cabutTarget, setCabutTarget] = useState<AnggotaUPTItem | null>(null)
  const [isCabutOpen, setIsCabutOpen] = useState(false)
  const [isConfirmCabutOpen, setIsConfirmCabutOpen] = useState(false)
  const [cabutKeterangan, setCabutKeterangan] = useState("")
  const [cabutSk, setCabutSk] = useState("")
  const [cabutError, setCabutError] = useState("")

  const [repromoteTarget, setRepromoteTarget] = useState<AnggotaUPTItem | null>(null)
  const [repromoteSk, setRepromoteSk] = useState("")
  const [repromoteAlasan, setRepromoteAlasan] = useState("")
  const [repromoteError, setRepromoteError] = useState("")

  const [riwayatTarget, setRiwayatTarget] = useState<AnggotaUPTItem | null>(null)

  const currentUserAnggota = anggotaList.find((a) => a.email === currentEmail)
  const isCurrentUserActiveUpt = currentUserAnggota?.status === "aktif"

  const counts = useMemo(() => {
    const aktif = anggotaList.filter((a) => a.status === "aktif").length
    const dicabut = anggotaList.filter((a) => a.status === "peran_dicabut").length
    return { aktif, dicabut }
  }, [anggotaList])

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    return anggotaList.filter((item) => {
      const matchStatus = statusFilter === "semua" || item.status === statusFilter
      const matchSearch =
        !q ||
        item.nama.toLowerCase().includes(q) ||
        item.nip.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [anggotaList, search, statusFilter])

  const kandidatPegawai = useMemo(() => {
    const q = pegawaiQuery.trim().toLowerCase()
    return daftarPegawai
      .map((peg) => {
        const akun = akunPenggunaInitial.find(
          (a) => a.pegawaiId === peg.id || a.nip === peg.nip
        )
        const existingUpt = anggotaList.find(
          (u) => u.nip === peg.nip && u.status === "aktif"
        )
        return { peg, akun, isAlreadyActiveUpt: Boolean(existingUpt) }
      })
      .filter(({ akun, isAlreadyActiveUpt }) => {
        if (isAlreadyActiveUpt) return false
        return Boolean(akun && akun.status === "aktif")
      })
      .filter(({ peg, akun }) => {
        if (!q) return true
        return (
          peg.nama.toLowerCase().includes(q) ||
          peg.nip.includes(q) ||
          (akun?.email.toLowerCase().includes(q) ?? false)
        )
      })
      .sort((a, b) => {
        const aVerif = a.akun?.peranTambahan === "Verifikator" ? 1 : 0
        const bVerif = b.akun?.peranTambahan === "Verifikator" ? 1 : 0
        return aVerif - bVerif
      })
  }, [pegawaiQuery, anggotaList])

  const catatAudit = (objek: string, detail: string, alasan?: string) => {
    auditUPT.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      waktu: "15 Nov 2026, 21:40",
      tanggal: "2026-11-15",
      pelaku: currentActorName,
      peran: "UPT Remunerasi",
      unit: "UPT Remunerasi",
      aksi: "Ubah Peran",
      objek,
      detail,
      hasil: "Berhasil",
      alasan,
    })
  }

  const handleOpenPromote = () => {
    setSelectedPegawaiId("")
    setPegawaiQuery("")
    setPromoteSk("")
    setPromoteTanggal("2026-11-15")
    setPromoteAlasan("")
    setPromoteError("")
    setIsPromoteOpen(true)
  }

  const handleValidatePromote = () => {
    if (!selectedPegawaiId) {
      setPromoteError("Pilih pegawai terlebih dahulu.")
      return
    }
    const candidate = kandidatPegawai.find((k) => k.peg.id === selectedPegawaiId)
    if (!candidate?.akun || candidate.akun.status !== "aktif") {
      setPromoteError("Pegawai wajib memiliki akun institusi yang berstatus aktif.")
      return
    }
    if (candidate.akun.peranTambahan === "Verifikator") {
      setPromoteError(
        "Verifikator tidak boleh merangkap UPT Remunerasi untuk menjaga pemisahan tugas"
      )
      return
    }
    if (!promoteSk.trim()) {
      setPromoteError("Nomor SK/ST penugasan wajib diisi.")
      return
    }
    setPromoteError("")
    setIsConfirmPromoteOpen(true)
  }

  const handleConfirmPromote = () => {
    const candidate = kandidatPegawai.find((k) => k.peg.id === selectedPegawaiId)
    if (!candidate?.akun) return

    const existing = anggotaList.find((u) => u.nip === candidate.peg.nip)
    if (existing) {
      setAnggotaList((prev) =>
        prev.map((a) =>
          a.id === existing.id
            ? {
                ...a,
                status: "aktif",
                riwayat: [
                  {
                    aksi: "Beri Peran UPT",
                    tanggal: promoteTanggal,
                    pelaku: currentActorName,
                    alasan: promoteAlasan.trim() || "Penambahan anggota admin UPT Remunerasi.",
                    nomorSk: promoteSk.trim(),
                  },
                  ...a.riwayat,
                ],
              }
            : a
        )
      )
    } else {
      const newItem: AnggotaUPTItem = {
        id: `upt-${Date.now()}`,
        akunId: candidate.akun.id,
        nama: candidate.peg.nama,
        nip: candidate.peg.nip,
        email: candidate.akun.email,
        unitAsal: candidate.peg.unit,
        anggotaSejak: "15 Nov 2026",
        status: "aktif",
        riwayat: [
          {
            aksi: "Beri Peran UPT",
            tanggal: promoteTanggal,
            pelaku: currentActorName,
            alasan: promoteAlasan.trim() || "Penambahan anggota admin UPT Remunerasi.",
            nomorSk: promoteSk.trim(),
          },
        ],
      }
      setAnggotaList((prev) => [newItem, ...prev])
    }

    catatAudit(
      candidate.peg.nama,
      `Beri Peran UPT kepada ${candidate.peg.nama} (${promoteSk.trim()})`,
      promoteAlasan.trim() || "Penugasan admin UPT Remunerasi"
    )
    setIsConfirmPromoteOpen(false)
    setIsPromoteOpen(false)
    toast.success(`Peran UPT Remunerasi berhasil diberikan kepada ${candidate.peg.nama}.`)
  }

  const handleOpenCabut = (item: AnggotaUPTItem) => {
    setCabutTarget(item)
    setCabutKeterangan("")
    setCabutSk("")
    setCabutError("")
    setIsCabutOpen(true)
  }

  const handleValidateCabut = () => {
    if (!cabutKeterangan.trim()) {
      setCabutError("Alasan pencabutan peran wajib diisi.")
      return
    }
    setCabutError("")
    setIsConfirmCabutOpen(true)
  }

  const handleConfirmCabut = () => {
    if (!cabutTarget) return
    const alasan = cabutKeterangan.trim()

    setAnggotaList((prev) =>
      prev.map((a) =>
        a.id === cabutTarget.id
          ? {
              ...a,
              status: "peran_dicabut",
              alasanCabut: alasan,
              riwayat: [
                {
                  aksi: "Cabut Peran UPT",
                  tanggal: "15 Nov 2026",
                  pelaku: currentActorName,
                  alasan,
                  nomorSk: cabutSk.trim() || undefined,
                },
                ...a.riwayat,
              ],
            }
          : a
      )
    )

    catatAudit(
      cabutTarget.nama,
      `Cabut Peran UPT dari ${cabutTarget.nama} (status -> Peran Dicabut)`,
      alasan
    )

    setIsConfirmCabutOpen(false)
    setIsCabutOpen(false)
    toast.success(`Peran UPT ${cabutTarget.nama} dicabut. Akun tetap normal sebagai Pegawai.`)
    setCabutTarget(null)
  }

  const handleConfirmRepromote = () => {
    if (!repromoteTarget) return
    if (!repromoteSk.trim()) {
      setRepromoteError("Nomor SK/ST penugasan wajib diisi.")
      return
    }
    if (!repromoteAlasan.trim()) {
      setRepromoteError("Alasan pemberian peran kembali wajib diisi.")
      return
    }

    setAnggotaList((prev) =>
      prev.map((a) =>
        a.id === repromoteTarget.id
          ? {
              ...a,
              status: "aktif",
              riwayat: [
                {
                  aksi: "Beri Peran Kembali",
                  tanggal: "15 Nov 2026",
                  pelaku: currentActorName,
                  alasan: repromoteAlasan.trim(),
                  nomorSk: repromoteSk.trim(),
                },
                ...a.riwayat,
              ],
            }
          : a
      )
    )
    catatAudit(
      repromoteTarget.nama,
      `Beri Peran Kembali UPT kepada ${repromoteTarget.nama} (${repromoteSk.trim()})`,
      repromoteAlasan.trim()
    )
    toast.success(`Peran UPT ${repromoteTarget.nama} berhasil diaktifkan kembali.`)
    setRepromoteTarget(null)
    setRepromoteSk("")
    setRepromoteAlasan("")
    setRepromoteError("")
  }

  const columns: ColumnDef<AnggotaUPTItem>[] = [
    {
      header: "Nama Anggota",
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-foreground">{row.nama}</span>
            {row.email === currentEmail && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">
                Anda
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{row.unitAsal}</p>
        </div>
      ),
    },
    {
      header: "NIP",
      cell: (row) => <span className="font-mono text-xs">{row.nip}</span>,
    },
    {
      header: "Email Institusi",
      cell: (row) => <span className="font-mono text-xs">{row.email}</span>,
    },
    {
      header: "Anggota Sejak",
      accessorKey: "anggotaSejak",
      className: "text-xs whitespace-nowrap",
    },
    {
      header: "Status",
      cell: (row) => {
        const badge = STATUS_BADGE_MAP[row.status]
        return (
          <Badge variant="outline" className={`text-[11px] font-medium ${badge.className}`}>
            {badge.label}
          </Badge>
        )
      },
    },
    {
      header: "Aksi",
      cell: (row) => {
        const isSelf = row.email === currentEmail
        const minimalDuaAktif = counts.aktif <= 2
        const cabutDisabled = !isCurrentUserActiveUpt || isSelf || minimalDuaAktif
        const cabutTooltip = !isCurrentUserActiveUpt
          ? "Hanya anggota UPT aktif yang dapat mencabut peran"
          : isSelf
          ? "Tidak dapat mencabut peran sendiri"
          : minimalDuaAktif
          ? "Tidak dapat mencabut: minimal 2 anggota UPT aktif harus tersisa"
          : "Cabut Peran UPT"

        return (
          <div className="flex flex-wrap items-center gap-1.5">
            {row.status === "aktif" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={cabutDisabled}
                title={cabutTooltip}
                onClick={() => handleOpenCabut(row)}
                className="h-7 gap-1 px-2 text-[11px] text-rose-700 border-rose-200 hover:bg-rose-50 disabled:opacity-50"
              >
                <UserMinus className="size-3.5" />
                Cabut Peran UPT
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={!isCurrentUserActiveUpt}
                onClick={() => {
                  setRepromoteTarget(row)
                  setRepromoteSk("")
                  setRepromoteAlasan("")
                  setRepromoteError("")
                }}
                className="h-7 gap-1 px-2 text-[11px] text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                <RotateCcw className="size-3.5" />
                Beri Peran Kembali
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRiwayatTarget(row)}
              className="h-7 gap-1 px-2 text-[11px]"
            >
              <History className="size-3.5" />
              Riwayat
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {counts.aktif <= 2 && (
        <WarningBanner variant="error" title="Batas Minimal Anggota UPT Aktif">
          Sistem harus memiliki minimal 2 anggota Admin UPT Remunerasi aktif. Pencabutan peran dinonaktifkan agar operasional dan kontrol berimbang tetap terjaga.
        </WarningBanner>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title="Anggota UPT Aktif"
          value={String(counts.aktif)}
          subtitle="Memiliki akses penuh admin UPT Remunerasi"
          icon={UserCheck}
        />
        <StatCard
          title="Riwayat Peran Dicabut"
          value={String(counts.dicabut)}
          subtitle="Akses admin dicabut; akun tetap aktif sebagai Pegawai"
          icon={ShieldAlert}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, NIP, atau email..."
              className="h-9 pl-9 text-xs"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="peran_dicabut">Peran Dicabut</option>
          </select>
        </div>

        <Button
          onClick={handleOpenPromote}
          disabled={!isCurrentUserActiveUpt}
          className="gap-1.5"
        >
          <ShieldPlus className="size-4" />
          Beri Peran UPT
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        emptyText="Tidak ada anggota UPT yang sesuai dengan filter."
        pageSize={8}
      />

      <FormDialog
        open={isPromoteOpen}
        onOpenChange={setIsPromoteOpen}
        title="Beri Peran UPT Remunerasi"
        description="Pilih pegawai berakun aktif untuk memperoleh akses admin UPT Remunerasi."
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setIsPromoteOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleValidatePromote}>Simpan &amp; Beri Peran</Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {promoteError && (
            <WarningBanner variant="error" title="Tidak Dapat Diproses">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{promoteError}</span>
              </div>
            </WarningBanner>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">
                Pilih Pegawai <span className="text-rose-600">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                {kandidatPegawai.length} kandidat tersedia
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={pegawaiQuery}
                onChange={(e) => setPegawaiQuery(e.target.value)}
                placeholder="Cari nama, NIP, atau email institusi..."
                className="h-9 pl-9 text-xs"
              />
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Hanya menampilkan pegawai yang sudah memiliki akun aktif. Buat akun terlebih dahulu di tab{" "}
              <span className="font-medium text-foreground">Semua Akun</span> bila pegawai belum terdaftar.
            </p>

            <div className="max-h-[190px] overflow-y-auto rounded-xl border divide-y bg-card">
              {kandidatPegawai.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Tidak ada pegawai berakun aktif yang sesuai pencarian.
                </div>
              ) : (
                kandidatPegawai.map(({ peg, akun }) => {
                  const isSelected = selectedPegawaiId === peg.id
                  const isVerifikator = akun?.peranTambahan === "Verifikator"
                  return (
                    <button
                      key={peg.id}
                      type="button"
                      disabled={isVerifikator}
                      title={
                        isVerifikator
                          ? "Verifikator tidak boleh merangkap UPT Remunerasi untuk menjaga pemisahan tugas"
                          : undefined
                      }
                      onClick={() => {
                        setSelectedPegawaiId(peg.id)
                        setPromoteError("")
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors ${
                        isVerifikator
                          ? "cursor-not-allowed bg-muted/30 opacity-65"
                          : isSelected
                          ? "bg-primary/10"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">{peg.nama}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          <span className="font-mono">{peg.nip}</span> · {akun?.email}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {isVerifikator ? (
                          <Badge
                            variant="outline"
                            className="border-rose-200 bg-rose-50 text-rose-700 text-[10px]"
                          >
                            Verifikator
                          </Badge>
                        ) : isSelected ? (
                          <Badge className="bg-primary text-primary-foreground text-[10px]">
                            Terpilih
                          </Badge>
                        ) : (
                          <span className="text-[11px] font-medium text-primary">Pilih</span>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border bg-muted/20 p-3.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Nomor SK / ST Penugasan <span className="text-rose-600">*</span>
                </label>
                <Input
                  value={promoteSk}
                  onChange={(e) => setPromoteSk(e.target.value)}
                  placeholder="Contoh: SK/REK/2026/0912"
                  className="h-9 bg-background text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Tanggal Mulai</label>
                <Input
                  type="date"
                  value={promoteTanggal}
                  onChange={(e) => setPromoteTanggal(e.target.value)}
                  className="h-9 bg-background text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Alasan / Keterangan</label>
              <textarea
                rows={2}
                value={promoteAlasan}
                onChange={(e) => setPromoteAlasan(e.target.value)}
                placeholder="Contoh: Penambahan admin untuk verifikasi pajak dan amprah..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50/70 px-3 py-2 text-[11px] text-sky-900">
            <AlertCircle className="size-4 shrink-0 text-sky-600" />
            <span>Pegawai terpilih akan memperoleh akses admin UPT penuh dan tercatat di Jejak Audit.</span>
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={isConfirmPromoteOpen}
        onOpenChange={setIsConfirmPromoteOpen}
        title="Konfirmasi Pemberian Peran UPT"
        description="Pegawai ini akan memperoleh akses admin UPT penuh yang setara dengan admin UPT lainnya."
        confirmText="Ya, Beri Peran UPT"
        onConfirm={handleConfirmPromote}
      />

      <FormDialog
        open={isCabutOpen}
        onOpenChange={setIsCabutOpen}
        title={`Cabut Peran UPT — ${cabutTarget?.nama ?? ""}`}
        description="Mencabut akses admin UPT. Akun tetap berjalan normal sebagai akun Pegawai."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCabutOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleValidateCabut}>
              Cabut Peran UPT
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {cabutError && (
            <WarningBanner variant="error" title="Validasi Gagal">
              {cabutError}
            </WarningBanner>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Nomor SK / ST (Opsional)</label>
            <Input
              value={cabutSk}
              onChange={(e) => setCabutSk(e.target.value)}
              placeholder="Contoh: ST/REK/2026/0920"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Alasan Pencabutan <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              value={cabutKeterangan}
              onChange={(e) => setCabutKeterangan(e.target.value)}
              placeholder="Tuliskan alasan pencabutan peran admin UPT..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
            />
          </div>

          <WarningBanner variant="warning" title="Ringkasan Dampak">
            Akses admin UPT dicabut saat ini juga. Akun pegawai tetap aktif normal untuk melihat slip dan pengaduan pribadi.
          </WarningBanner>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={isConfirmCabutOpen}
        onOpenChange={setIsConfirmCabutOpen}
        title="Konfirmasi Cabut Peran UPT"
        description={`Akses admin UPT milik ${cabutTarget?.nama ?? ""} akan dicabut. Akun tetap aktif sebagai Pegawai.`}
        confirmText="Ya, Cabut Peran"
        danger
        onConfirm={handleConfirmCabut}
      />

      <FormDialog
        open={Boolean(repromoteTarget)}
        onOpenChange={(open) => !open && setRepromoteTarget(null)}
        title={`Beri Peran Kembali — ${repromoteTarget?.nama ?? ""}`}
        description="Akun akan memperoleh kembali akses penuh sebagai admin UPT Remunerasi."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRepromoteTarget(null)}>
              Batal
            </Button>
            <Button onClick={handleConfirmRepromote}>Beri Peran Kembali</Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          {repromoteError && (
            <WarningBanner variant="error" title="Validasi Gagal">
              {repromoteError}
            </WarningBanner>
          )}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Nomor SK / ST Penugasan <span className="text-rose-600">*</span>
            </label>
            <Input
              value={repromoteSk}
              onChange={(e) => setRepromoteSk(e.target.value)}
              placeholder="Contoh: SK/REK/2026/0930"
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Alasan Pemberian Peran Kembali <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              value={repromoteAlasan}
              onChange={(e) => setRepromoteAlasan(e.target.value)}
              placeholder="Tuliskan alasan dan dasar penugasan kembali..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
            />
          </div>
        </div>
      </FormDialog>

      <DetailDrawer
        open={Boolean(riwayatTarget)}
        onClose={() => setRiwayatTarget(null)}
        title={`Riwayat Peran — ${riwayatTarget?.nama ?? ""}`}
        subtitle={riwayatTarget ? `${riwayatTarget.nip} • ${riwayatTarget.email}` : undefined}
        size="md"
        footer={
          <Button variant="outline" onClick={() => setRiwayatTarget(null)}>
            Tutup
          </Button>
        }
      >
        {riwayatTarget && (
          <DrawerSection title="Linimasa Perubahan Peran UPT">
            <DrawerTimeline
              items={riwayatTarget.riwayat.map((r, idx) => ({
                tahap: r.aksi,
                status: idx === 0 ? "berjalan" : "selesai",
                tanggal: r.tanggal,
                pelaku: r.nomorSk ? `${r.pelaku} (SK: ${r.nomorSk})` : r.pelaku,
                catatan: r.alasan,
              }))}
            />
          </DrawerSection>
        )}
      </DetailDrawer>
    </div>
  )
}
