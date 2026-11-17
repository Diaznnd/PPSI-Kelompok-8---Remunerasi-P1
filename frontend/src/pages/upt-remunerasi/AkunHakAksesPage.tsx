import { useState, useMemo, useEffect } from "react"
import {
  UserPlus,
  UploadCloud,
  KeyRound,
  ShieldAlert,
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  AlertCircle,
  Building2,
  Mail,
  Edit3,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import {
  PageHeader,
  DataTable,
  StatusBadge,
  WarningBanner,
  ConfirmDialog,
  FormDialog,
  Stepper,
  Button,
  Input,
  type ColumnDef,
} from "./components"
import {
  akunPenggunaInitial,
  daftarPegawai,
  unitKerja,
  auditUPT,
  type AkunUserItem,
  type PeranTambahan,
  type StatusEntitas,
} from "@/data/dummy-upt"
import { Badge } from "@/components/ui/badge"
import { PenugasanPeranSection } from "./PenugasanUnitPage"
import { MatriksHakAksesSection } from "./HakAksesPage"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"

const PERAN_LIST: PeranTambahan[] = [
  "Bendahara Unit",
  "Bidang Kepegawaian Unit",
  "Penanggung Jawab Remunerasi Unit",
  "Verifikator",
  "UPT Remunerasi",
]

const PERAN_TERIKAT_UNIT: PeranTambahan[] = [
  "Bendahara Unit",
  "Bidang Kepegawaian Unit",
  "Penanggung Jawab Remunerasi Unit",
]

const mockImportPreview = [
  { baris: 1, nama: "Dr. Henny Rahmi, S.E., M.M.", nip: "197305141999032020", email: "henny.rahmi@unand.ac.id", peran: "Pegawai", unit: "Rektorat - Bidang II", status: "valid", keterangan: "Valid untuk diimpor" },
  { baris: 2, nama: "Dr. Hefrizal Handra, M.Soc.Sc.", nip: "197402122000031024", email: "hefrizal.handra@unand.ac.id", peran: "Pegawai", unit: "Rektorat - Bidang IV", status: "valid", keterangan: "Valid untuk diimpor" },
  { baris: 3, nama: "Dewi Anggraini, S.Kom., M.T.", nip: "198405122008122001", email: "dewi.anggraini@unand.ac.id", peran: "UPT Remunerasi", unit: "UPT Remunerasi", status: "gagal", keterangan: "Email institusi sudah terdaftar" },
  { baris: 4, nama: "Pegawai Uji Non-PNS", nip: "199999999999999999", email: "uji.pegawai@unand.ac.id", peran: "Pegawai", unit: "Fakultas Teknik", status: "gagal", keterangan: "NIP tidak ditemukan dalam direktori master kepegawaian" },
]

export default function AkunHakAksesPage() {
  const { akun } = useAuth() // Get logged-in user from AuthContext
  const [activeMainTab, setActiveMainTab] = useState<"semua" | "penugasan" | "matriks">("semua")
  const [data, setData] = useState<AkunUserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [peranFilter, setPeranFilter] = useState("semua")
  const [unitFilter, setUnitFilter] = useState("semua")
  const [statusFilter, setStatusFilter] = useState("semua")

  // Use logged-in user's email instead of hardcoded
  const currentEmail = akun?.email || ""

  // Fetch akun list from API
  useEffect(() => {
    const fetchAkunList = async () => {
      try {
        setLoading(true)
        const response = await uptRemunerasiService.getAkunList()
        
        if (response.success && response.data) {
          // Map API response to AkunUserItem format
          const mappedData: AkunUserItem[] = response.data.map((item: any) => ({
            id: item.id.toString(),
            pegawaiId: item.pegawai_id?.toString() || item.id.toString(),
            nama: item.nama || item.username,
            nip: item.NIP || "-",
            email: item.username,
            peranDasar: "Pegawai",
            peranTambahan: item.peran as PeranTambahan | undefined,
            unit: item.unit?.nama || undefined,
            status: (item.aktif ? "aktif" : "nonaktif") as StatusEntitas,
            terakhirMasuk: item.last_login || "Belum pernah",
            pegawaiStatusAktif: item.pegawai?.aktif ? "aktif" : "nonaktif",
            tanggalDibuat: item.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
          }))
          setData(mappedData)
        } else {
          // Fallback to dummy data if API fails
          console.warn("API returned no data, using dummy fallback")
          setData(akunPenggunaInitial)
        }
      } catch (error) {
        console.error("Error fetching akun list:", error)
        toast.error("Gagal memuat daftar akun. Menggunakan data dummy.")
        setData(akunPenggunaInitial)
      } finally {
        setLoading(false)
      }
    }

    fetchAkunList()
  }, [])

  const [addStep, setAddStep] = useState(1)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [isToggleStatusOpen, setIsToggleStatusOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)

  const [selectedAkun, setSelectedAkun] = useState<AkunUserItem | null>(null)

  const [newSelectedPegawaiId, setNewSelectedPegawaiId] = useState("")
  const [newPegawaiSearch, setNewPegawaiSearch] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newKirimUndangan, setNewKirimUndangan] = useState(true)
  const [newPeranTambahan, setNewPeranTambahan] = useState<string>("none")
  const [newUnit, setNewUnit] = useState("")
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})

  const [editPeranTambahan, setEditPeranTambahan] = useState<string>("none")
  const [editUnit, setEditUnit] = useState("")
  const [editError, setEditError] = useState("")

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.nip.includes(search)
      const matchPeran =
        peranFilter === "semua" ||
        (peranFilter === "Pegawai" && !item.peranTambahan) ||
        item.peranTambahan === peranFilter
      const matchUnit = unitFilter === "semua" || item.unit === unitFilter
      const matchStatus = statusFilter === "semua" || item.status === statusFilter
      return matchSearch && matchPeran && matchUnit && matchStatus
    })
  }, [data, search, peranFilter, unitFilter, statusFilter])

  const activeUptAdminCount = useMemo(() => {
    return data.filter((u) => u.peranTambahan === "UPT Remunerasi" && u.status === "aktif").length
  }, [data])

  const resetAddForm = () => {
    setAddStep(1)
    setNewSelectedPegawaiId("")
    setNewPegawaiSearch("")
    setNewEmail("")
    setNewKirimUndangan(true)
    setNewPeranTambahan("none")
    setNewUnit("")
    setAddErrors({})
  }

  const handleSelectPegawai = (pegId: string) => {
    const peg = daftarPegawai.find((p) => p.id === pegId)
    if (!peg) return

    const existing = data.find((a) => a.pegawaiId === pegId)
    if (existing) {
      setAddErrors({ pegawai: `Pegawai ${peg.nama} sudah memiliki akun aktif (${existing.email}).` })
      return
    }

    setAddErrors({})
    setNewSelectedPegawaiId(pegId)
    const cleanName = peg.nama
      .toLowerCase()
      .replace(/^(prof\.|dr\.|drg\.|ir\.)\s*/g, "")
      .replace(/,\s*.*$/g, "")
      .replace(/[^a-z0-9]/g, ".")
      .replace(/\.+/g, ".")
      .replace(/^\.|\.$/g, "")
    setNewEmail(`${cleanName}@unand.ac.id`)
    setNewUnit(peg.unit)
  }

  const handleNextStep = () => {
    const errs: Record<string, string> = {}

    if (addStep === 1) {
      if (!newSelectedPegawaiId) {
        errs.pegawai = "Pilih satu pegawai dari direktori master kepegawaian."
        setAddErrors(errs)
        return
      }
      setAddErrors({})
      setAddStep(2)
      return
    }

    if (addStep === 2) {
      if (!newEmail.trim()) {
        errs.email = "Email institusi wajib diisi."
      } else if (!newEmail.endsWith("@unand.ac.id")) {
        errs.email = "Email wajib menggunakan domain institusi (@unand.ac.id)."
      } else if (data.some((a) => a.email.toLowerCase() === newEmail.trim().toLowerCase())) {
        errs.email = "Email institusi sudah terdaftar pada akun lain."
      }

      if (Object.keys(errs).length > 0) {
        setAddErrors(errs)
        return
      }
      setAddErrors({})
      setAddStep(3)
      return
    }

    if (addStep === 3) {
      if (newPeranTambahan !== "none" && PERAN_TERIKAT_UNIT.includes(newPeranTambahan as PeranTambahan)) {
        if (!newUnit) {
          errs.unit = "Unit kerja wajib dipilih untuk peran Bendahara, Kepegawaian, dan PJ Unit."
          setAddErrors(errs)
          return
        }
      }
      setAddErrors({})
      setAddStep(4)
      return
    }
  }

  const handleSaveNewAccount = async () => {
    const peg = daftarPegawai.find((p) => p.id === newSelectedPegawaiId)
    if (!peg) return

    try {
      setLoading(true)
      
      // Call API to create new account
      const payload = {
        username: newEmail.trim().toLowerCase(),
        NIP: peg.nip,
        password: undefined, // System will send activation email
        peran: newPeranTambahan === "none" ? "Pegawai" : newPeranTambahan,
        unit_id: newPeranTambahan !== "none" && PERAN_TERIKAT_UNIT.includes(newPeranTambahan as PeranTambahan) 
          ? parseInt(newUnit) 
          : null,
      }

      const response = await uptRemunerasiService.storeAkun(payload)

      if (response.success) {
        // Add to local state
        const newAccount: AkunUserItem = {
          id: response.data.id.toString(),
          pegawaiId: peg.id,
          nama: peg.nama,
          nip: peg.nip,
          email: newEmail.trim().toLowerCase(),
          peranDasar: "Pegawai",
          peranTambahan: newPeranTambahan === "none" ? undefined : (newPeranTambahan as PeranTambahan),
          unit: newPeranTambahan !== "none" && PERAN_TERIKAT_UNIT.includes(newPeranTambahan as PeranTambahan) ? newUnit : undefined,
          status: "aktif",
          terakhirMasuk: "Belum pernah",
          pegawaiStatusAktif: peg.statusAktif,
          tanggalDibuat: new Date().toISOString().split("T")[0],
        }

        setData((prev) => [newAccount, ...prev])
        setIsAddOpen(false)
        resetAddForm()
        toast.success(`Akun ${newAccount.nama} berhasil dibuat. Undangan aktivasi telah dikirim ke ${newAccount.email}.`)
      } else {
        toast.error(response.message || "Gagal membuat akun baru.")
      }
    } catch (error: any) {
      console.error("Error creating account:", error)
      toast.error(error.response?.data?.message || "Gagal membuat akun baru.")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEdit = (akun: AkunUserItem) => {
    setSelectedAkun(akun)
    setEditPeranTambahan(akun.peranTambahan || "none")
    setEditUnit(akun.unit || "")
    setEditError("")
    setIsEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedAkun) return

    if (selectedAkun.email === currentEmail && editPeranTambahan !== "UPT Remunerasi") {
      setEditError("Anda tidak dapat menurunkan atau mencabut peran UPT dari akun Anda sendiri.")
      return
    }

    if (
      selectedAkun.peranTambahan === "UPT Remunerasi" &&
      editPeranTambahan !== "UPT Remunerasi" &&
      activeUptAdminCount <= 1
    ) {
      setEditError("Sistem wajib memiliki minimal satu akun administrator UPT Remunerasi yang aktif.")
      return
    }

    if (editPeranTambahan !== "none" && PERAN_TERIKAT_UNIT.includes(editPeranTambahan as PeranTambahan)) {
      if (!editUnit) {
        setEditError("Unit kerja wajib dipilih untuk peran Bendahara, Kepegawaian, dan PJ Unit.")
        return
      }
    }

    try {
      setLoading(true)
      
      const payload = {
        peran: editPeranTambahan === "none" ? "Pegawai" : editPeranTambahan,
        unit_id: editPeranTambahan !== "none" && PERAN_TERIKAT_UNIT.includes(editPeranTambahan as PeranTambahan)
          ? parseInt(editUnit)
          : null,
      }

      const response = await uptRemunerasiService.updateAkun(selectedAkun.id, payload)

      if (response.success) {
        // Update local state
        setData((prev) =>
          prev.map((item) => {
            if (item.id === selectedAkun.id) {
              return {
                ...item,
                peranTambahan: editPeranTambahan === "none" ? undefined : (editPeranTambahan as PeranTambahan),
                unit:
                  editPeranTambahan !== "none" && PERAN_TERIKAT_UNIT.includes(editPeranTambahan as PeranTambahan)
                    ? editUnit
                    : undefined,
              }
            }
            return item
          })
        )

        setIsEditOpen(false)
        toast.success(`Hak akses akun ${selectedAkun.nama} berhasil diperbarui. Menu pengguna akan berubah langsung.`)
      } else {
        setEditError(response.message || "Gagal memperbarui akun.")
      }
    } catch (error: any) {
      console.error("Error updating account:", error)
      setEditError(error.response?.data?.message || "Gagal memperbarui akun.")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmResetPassword = async () => {
    if (!selectedAkun) return
    
    try {
      setLoading(true)
      const response = await uptRemunerasiService.resetPasswordAkun(selectedAkun.id)
      
      if (response.success) {
        setIsResetOpen(false)
        toast.success(`Tautan pembaruan kata sandi telah dikirim ke ${selectedAkun.email}. Kata sandi lama tetap berlaku sampai diganti.`)
      } else {
        toast.error(response.message || "Gagal mengirim tautan reset password.")
      }
    } catch (error: any) {
      console.error("Error resetting password:", error)
      toast.error(error.response?.data?.message || "Gagal mengirim tautan reset password.")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmToggleStatus = async () => {
    if (!selectedAkun) return

    if (selectedAkun.email === currentEmail && selectedAkun.status === "aktif") {
      toast.error("Anda tidak dapat menonaktifkan akun Anda sendiri.")
      setIsToggleStatusOpen(false)
      return
    }

    if (selectedAkun.peranTambahan === "UPT Remunerasi" && selectedAkun.status === "aktif" && activeUptAdminCount <= 1) {
      toast.error("Sistem wajib memiliki minimal satu akun administrator UPT Remunerasi yang aktif.")
      setIsToggleStatusOpen(false)
      return
    }

    try {
      setLoading(true)
      const response = await uptRemunerasiService.toggleAkunStatus(selectedAkun.id)
      
      if (response.success) {
        const nextStatus: StatusEntitas = selectedAkun.status === "aktif" ? "nonaktif" : "aktif"
        
        // Update local state
        setData((prev) =>
          prev.map((a) => (a.id === selectedAkun.id ? { ...a, status: nextStatus } : a))
        )

        setIsToggleStatusOpen(false)
        toast.success(`Status akun ${selectedAkun.nama} berhasil diubah menjadi ${nextStatus.toUpperCase()}.`)
      } else {
        toast.error(response.message || "Gagal mengubah status akun.")
        setIsToggleStatusOpen(false)
      }
    } catch (error: any) {
      console.error("Error toggling account status:", error)
      toast.error(error.response?.data?.message || "Gagal mengubah status akun.")
      setIsToggleStatusOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnDef<AkunUserItem>[] = [
    {
      header: "Nama Pengguna & Status Kepegawaian",
      cell: (item) => {
        const isSelf = item.email === currentEmail
        const isPegawaiInactive = item.pegawaiStatusAktif === "nonaktif"

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm">{item.nama}</span>
              {isSelf && (
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                  Akun Anda
                </Badge>
              )}
            </div>
            {isPegawaiInactive && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                <AlertTriangle className="size-3 shrink-0" />
                <span>Pegawai berstatus Nonaktif di kepegawaian</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      header: "Email Institusi",
      accessorKey: "email",
      cell: (item) => (
        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
          <Mail className="size-3 text-muted-foreground/70" />
          {item.email}
        </span>
      ),
    },
    {
      header: "NIP",
      accessorKey: "nip",
      className: "text-xs font-mono text-muted-foreground w-40",
    },
    {
      header: "Peran Akses",
      cell: (item) => (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700 text-[11px]">
            Pegawai
          </Badge>
          {item.peranTambahan && (
            <Badge
              className={`text-[11px] ${
                item.peranTambahan === "UPT Remunerasi"
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : item.peranTambahan === "Verifikator"
                  ? "bg-sky-100 text-sky-800 border border-sky-200"
                  : item.peranTambahan === "Bendahara Unit"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              {item.peranTambahan}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Unit Penugasan",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.unit ? (
            <span className="flex items-center gap-1">
              <Building2 className="size-3 shrink-0" />
              {item.unit}
            </span>
          ) : (
            <span className="italic text-muted-foreground/60">Tingkat Universitas (Non-Unit)</span>
          )}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
      className: "w-24",
    },
    {
      header: "Login Terakhir",
      accessorKey: "terakhirMasuk",
      className: "text-xs text-muted-foreground w-36",
    },
    {
      header: "Aksi",
      cell: (item) => {
        const isSelf = item.email === currentEmail
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-primary"
              onClick={() => handleOpenEdit(item)}
              title="Ubah Hak Akses & Peran"
            >
              <Edit3 className="size-3.5 mr-1" />
              Ubah
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-slate-600 hover:text-foreground"
              onClick={() => {
                setSelectedAkun(item)
                setIsResetOpen(true)
              }}
              title="Reset Kata Sandi"
            >
              <KeyRound className="size-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 text-xs ${
                item.status === "aktif"
                  ? isSelf
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : "text-rose-600 hover:bg-rose-50"
                  : "text-emerald-600 hover:bg-emerald-50"
              }`}
              disabled={isSelf && item.status === "aktif"}
              onClick={() => {
                setSelectedAkun(item)
                setIsToggleStatusOpen(true)
              }}
              title={
                isSelf && item.status === "aktif"
                  ? "Tidak dapat menonaktifkan akun sendiri"
                  : item.status === "aktif"
                  ? "Nonaktifkan Akun"
                  : "Aktifkan Akun"
              }
            >
              {item.status === "aktif" ? <UserX className="size-3.5" /> : <UserCheck className="size-3.5" />}
            </Button>
          </div>
        )
      },
    },
  ]

  const filteredPegawaiList = useMemo(() => {
    return daftarPegawai.filter(
      (p) =>
        p.nama.toLowerCase().includes(newPegawaiSearch.toLowerCase()) ||
        p.nip.includes(newPegawaiSearch) ||
        p.unit.toLowerCase().includes(newPegawaiSearch.toLowerCase())
    )
  }, [newPegawaiSearch])

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}
      
      {!loading && (
        <>
      <PageHeader
        title="Akun & Hak Akses"
        subtitle="Kelola kredensial akun pengguna, penugasan peran pejabat unit & tim universitas, serta matriks hak akses sistem SIREMUN-P1."
        actions={
          activeMainTab === "semua" ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsImportOpen(true)}
              >
                <UploadCloud className="size-4" /> Impor Massal
              </Button>
              <Button
                className="gap-2"
                onClick={() => {
                  resetAddForm()
                  setIsAddOpen(true)
                }}
              >
                <UserPlus className="size-4" /> Tambah Akun
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="flex border-b overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveMainTab("semua")}
          className={`border-b-2 px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeMainTab === "semua"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Semua Akun Pengguna
        </button>
        <button
          type="button"
          onClick={() => setActiveMainTab("penugasan")}
          className={`border-b-2 px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeMainTab === "penugasan"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Penugasan Peran & Pejabat
        </button>
        <button
          type="button"
          onClick={() => setActiveMainTab("matriks")}
          className={`border-b-2 px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeMainTab === "matriks"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Matriks Hak Akses
        </button>
      </div>

      {activeMainTab === "penugasan" ? (
        <PenugasanPeranSection />
      ) : activeMainTab === "matriks" ? (
        <MatriksHakAksesSection />
      ) : (
        <>

      <WarningBanner variant="info" title="Kredensial Login & Status Akun Pegawai">
        Tab ini berfokus pada <strong>identitas login akun pengguna</strong> (pembuatan akun dari master pegawai,
        ubah peran/unit, reset kata sandi via tautan email, serta aktivasi/penonaktifan akun). Untuk pemetaan pejabat
        operasional unit, Tim Verifikator, dan Anggota Admin UPT berdasarkan SK, gunakan tab{" "}
        <strong>Penugasan Peran & Pejabat</strong>.
      </WarningBanner>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, email, NIP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div>
            <select
              value={peranFilter}
              onChange={(e) => setPeranFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
            >
              <option value="semua">Semua Peran</option>
              <option value="Pegawai">Hanya Pegawai (Dasar)</option>
              {PERAN_LIST.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
            >
              <option value="semua">Semua Unit Kerja</option>
              {unitKerja.map((u) => (
                <option key={u.kode} value={u.nama}>
                  {u.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring"
            >
              <option value="semua">Semua Status Akun</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        {(search || peranFilter !== "semua" || unitFilter !== "semua" || statusFilter !== "semua") && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
            <span>
              Menampilkan {filteredData.length} dari {data.length} akun pengguna
            </span>
            <Button
              variant="link"
              size="sm"
              className="h-6 p-0 text-xs text-primary"
              onClick={() => {
                setSearch("")
                setPeranFilter("semua")
                setUnitFilter("semua")
                setStatusFilter("semua")
              }}
            >
              Reset Filter
            </Button>
          </div>
        )}
      </div>

      <DataTable columns={columns} data={filteredData} emptyText="Tidak ada akun pengguna yang sesuai kriteria pencarian." />
        </>
      )}

      <FormDialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open)
          if (!open) resetAddForm()
        }}
        title="Tambah Akun Pengguna Baru"
        description="Lengkapi tahapan pendaftaran akun untuk pegawai universitas."
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={addStep > 1 ? () => setAddStep((s) => s - 1) : () => setIsAddOpen(false)}
            >
              {addStep > 1 ? "Kembali" : "Batal"}
            </Button>
            <Button
              size="sm"
              onClick={addStep === 4 ? handleSaveNewAccount : handleNextStep}
            >
              {addStep === 4 ? "Simpan & Buat Akun" : "Lanjutkan"}
            </Button>
          </div>
        }
      >
        <Stepper
          steps={["Cari Pegawai", "Email & Aktivasi", "Peran Tambahan", "Ringkasan"]}
          currentStep={addStep}
        />

        {addStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Cari Pegawai di Direktori Master</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Ketik nama, NIP, atau unit..."
                  value={newPegawaiSearch}
                  onChange={(e) => setNewPegawaiSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            {addErrors.pegawai && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <AlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>{addErrors.pegawai}</span>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto rounded-lg border divide-y bg-card text-xs">
              {filteredPegawaiList.map((p) => {
                const isSelected = newSelectedPegawaiId === p.id
                const hasAccount = data.some((a) => a.pegawaiId === p.id)
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPegawai(p.id)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/10 border-l-4 border-l-primary"
                        : hasAccount
                        ? "bg-muted/30 opacity-60"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-foreground">{p.nama}</p>
                      <p className="text-muted-foreground text-[11px]">
                        NIP: {p.nip} • {p.unit}
                      </p>
                      <p className="text-muted-foreground text-[11px]">{p.jabatan} (Grade {p.grade})</p>
                    </div>
                    <div>
                      {hasAccount ? (
                        <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600">
                          Sudah ada akun
                        </Badge>
                      ) : isSelected ? (
                        <Badge className="text-[10px] bg-primary text-primary-foreground">
                          Terpilih
                        </Badge>
                      ) : (
                        <span className="text-xs text-primary font-medium">Pilih</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {addStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Email Institusi (@unand.ac.id) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value)
                  if (addErrors.email) setAddErrors({})
                }}
                className={`mt-1 h-9 text-xs font-mono ${addErrors.email ? "border-rose-500" : ""}`}
                placeholder="nama.pegawai@unand.ac.id"
              />
              {addErrors.email && <p className="mt-1 text-xs text-rose-600">{addErrors.email}</p>}
              <p className="mt-1 text-[11px] text-muted-foreground">
                Email institusi digunakan sebagai ID login resmi dan penerima tautan aktivasi.
              </p>
            </div>

            <div className="rounded-lg border p-4 bg-muted/20 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newKirimUndangan}
                  onChange={(e) => setNewKirimUndangan(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary size-4"
                />
                <div>
                  <span className="text-xs font-semibold text-foreground">Kirim Undangan Aktivasi Langsung</span>
                  <p className="text-[11px] text-muted-foreground">
                    Sistem akan mengirim email berisi tautan pembuatan kata sandi baru.
                  </p>
                </div>
              </label>

              <div className="border-t pt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Ketentuan Keamanan:</strong> Tidak ada pembuatan kata sandi manual oleh admin. Pengguna wajib
                  membuat kata sandi pribadi saat login pertama kali melalui tautan aktivasi.
                </span>
              </div>
            </div>
          </div>
        )}

        {addStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Peran Tambahan (Opsional)</label>
              <select
                value={newPeranTambahan}
                onChange={(e) => {
                  setNewPeranTambahan(e.target.value)
                  if (addErrors.unit) setAddErrors({})
                }}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="none">Hanya Peran Dasar (Pegawai Saja)</option>
                {PERAN_LIST.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Setiap pengguna secara default otomatis memiliki wewenang peran Pegawai.
              </p>
            </div>

            {newPeranTambahan !== "none" && PERAN_TERIKAT_UNIT.includes(newPeranTambahan as PeranTambahan) && (
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Unit Kerja Penugasan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newUnit}
                  onChange={(e) => {
                    setNewUnit(e.target.value)
                    if (addErrors.unit) setAddErrors({})
                  }}
                  className={`mt-1 w-full h-9 rounded-md border bg-background px-3 text-xs ${
                    addErrors.unit ? "border-rose-500" : "border-input"
                  }`}
                >
                  <option value="">-- Pilih Unit Kerja --</option>
                  {unitKerja.map((u) => (
                    <option key={u.kode} value={u.nama}>
                      {u.nama} ({u.tipe})
                    </option>
                  ))}
                </select>
                {addErrors.unit && <p className="mt-1 text-xs text-rose-600">{addErrors.unit}</p>}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Peran {newPeranTambahan} dibatasi hanya dapat mengakses data pada unit kerja ini.
                </p>
              </div>
            )}
          </div>
        )}

        {addStep === 4 && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Konfirmasi Pembuatan Akun</h4>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <span>Nama Pegawai:</span>
                <span className="font-medium text-foreground">
                  {daftarPegawai.find((p) => p.id === newSelectedPegawaiId)?.nama}
                </span>

                <span>NIP:</span>
                <span className="font-mono text-foreground">
                  {daftarPegawai.find((p) => p.id === newSelectedPegawaiId)?.nip}
                </span>

                <span>Email Institusi:</span>
                <span className="font-mono text-foreground">{newEmail}</span>

                <span>Peran Dasar:</span>
                <span className="font-medium text-foreground">Pegawai (Otomatis Aktif)</span>

                <span>Peran Tambahan:</span>
                <span className="font-semibold text-primary">
                  {newPeranTambahan === "none" ? "Tidak Ada (Hanya Pegawai)" : newPeranTambahan}
                </span>

                {newPeranTambahan !== "none" && PERAN_TERIKAT_UNIT.includes(newPeranTambahan as PeranTambahan) && (
                  <>
                    <span>Unit Penugasan:</span>
                    <span className="font-medium text-foreground">{newUnit}</span>
                  </>
                )}

                <span>Status Aktivasi:</span>
                <span className="text-emerald-700 font-medium">
                  {newKirimUndangan ? "Undangan Aktivasi akan dikirim" : "Aktivasi Manual"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Dengan mengklik <strong>Simpan & Buat Akun</strong>, akun akan langsung terdaftar di sistem dengan status
              Aktif.
            </p>
          </div>
        )}
      </FormDialog>

      <FormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Ubah Hak Akses & Peran Akun"
        description="Perbarui peran penugasan atau unit kerja pengguna."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveEdit}>
              Simpan Perubahan
            </Button>
          </div>
        }
      >
        {selectedAkun && (
          <div className="space-y-4 text-xs">
            {editError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
              <p className="font-semibold text-sm text-foreground">{selectedAkun.nama}</p>
              <p className="text-muted-foreground">NIP: {selectedAkun.nip}</p>
              <p className="text-muted-foreground font-mono">Email: {selectedAkun.email}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Peran Tambahan</label>
              <select
                value={editPeranTambahan}
                onChange={(e) => {
                  setEditPeranTambahan(e.target.value)
                  setEditError("")
                }}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="none">Hanya Peran Dasar (Pegawai)</option>
                {PERAN_LIST.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {editPeranTambahan !== "none" && PERAN_TERIKAT_UNIT.includes(editPeranTambahan as PeranTambahan) && (
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Unit Kerja Penugasan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editUnit}
                  onChange={(e) => {
                    setEditUnit(e.target.value)
                    setEditError("")
                  }}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="">-- Pilih Unit Kerja --</option>
                  {unitKerja.map((u) => (
                    <option key={u.kode} value={u.nama}>
                      {u.nama} ({u.tipe})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-amber-900 text-[11px] flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Dampak Perubahan:</strong> Menu sidebar dan wewenang pengguna akan berubah secara instan pada
                sesi aktif berikutnya.
              </span>
            </div>
          </div>
        )}
      </FormDialog>

      <ConfirmDialog
        open={isResetOpen}
        onOpenChange={setIsResetOpen}
        title="Reset Kata Sandi Akun"
        description={`Tautan pembaruan kata sandi akan dikirim ke email institusi (${selectedAkun?.email}). Kata sandi lama tetap berlaku sampai pengguna menyelesaikan proses penggantian kata sandi.`}
        confirmText="Kirim Tautan Reset"
        onConfirm={handleConfirmResetPassword}
      />

      <ConfirmDialog
        open={isToggleStatusOpen}
        onOpenChange={setIsToggleStatusOpen}
        title={selectedAkun?.status === "aktif" ? "Nonaktifkan Akun Pengguna" : "Aktifkan Kembali Akun"}
        description={
          selectedAkun?.status === "aktif"
            ? `Apakah Anda yakin ingin menonaktifkan akun ${selectedAkun?.nama}? Akun nonaktif tidak dapat masuk ke sistem. Seluruh data riwayat pengajuan dan aktivitas audit tetap tersimpan utuh.`
            : `Apakah Anda yakin ingin mengaktifkan kembali akun ${selectedAkun?.nama}? Pengguna akan dapat login kembali menggunakan kredensial sebelumnya.`
        }
        confirmText={selectedAkun?.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
        danger={selectedAkun?.status === "aktif"}
        onConfirm={handleConfirmToggleStatus}
      />

      <FormDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        title="Impor Massal Akun Pengguna"
        description="Unggah berkas CSV atau XLSX untuk mendaftarkan akun pegawai dalam jumlah banyak."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsImportOpen(false)}>
              Batal
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setIsImportOpen(false)
                toast.success("Impor massal berhasil! 2 akun baru ditambahkan ke sistem.")
              }}
            >
              Proses Impor (2 Akun Valid)
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center hover:bg-primary/10 transition-colors cursor-pointer">
            <FileSpreadsheet className="size-10 text-primary mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-sm text-foreground">Tarik & Letakkan Berkas di Sini</p>
            <p className="text-muted-foreground text-[11px] mt-0.5">Mendukung format .csv dan .xlsx (Maksimal 5MB)</p>
            <Button variant="outline" size="sm" className="mt-3 text-xs gap-1.5">
              <UploadCloud className="size-3.5" /> Pilih Berkas dari Komputer
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Hasil Pra-Validasi Berkas (Contoh 4 Baris)</span>
              <span className="text-[11px] text-muted-foreground">2 Valid • 2 Gagal</span>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-muted/50 text-muted-foreground font-medium">
                  <tr>
                    <th className="p-2 w-12 text-center">Baris</th>
                    <th className="p-2">Nama Pegawai / NIP</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Peran</th>
                    <th className="p-2">Status & Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockImportPreview.map((row) => (
                    <tr key={row.baris} className={row.status === "valid" ? "bg-emerald-50/30" : "bg-rose-50/30"}>
                      <td className="p-2 text-center font-mono">{row.baris}</td>
                      <td className="p-2 font-medium">
                        {row.nama}
                        <p className="text-[10px] text-muted-foreground font-mono">{row.nip}</p>
                      </td>
                      <td className="p-2 font-mono text-muted-foreground">{row.email}</td>
                      <td className="p-2">{row.peran}</td>
                      <td className="p-2">
                        {row.status === "valid" ? (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="size-3" /> Siap Impor
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-700 font-semibold" title={row.keterangan}>
                            <AlertCircle className="size-3" /> {row.keterangan}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
            <ShieldAlert className="size-4 shrink-0 text-primary mt-0.5" />
            <span>
              Format berkas harus memuat kolom wajib: <code>NIP</code>, <code>Email</code>, <code>Peran</code>, dan{" "}
              <code>Unit</code>. Baris yang gagal validasi akan dilewati dan dapat diunduh laporannya.
            </span>
          </div>
        </div>
      </FormDialog>
        </>
      )}
    </div>
  )
}
