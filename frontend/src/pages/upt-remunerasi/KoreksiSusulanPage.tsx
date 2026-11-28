import { useMemo, useState, useEffect } from "react"
import { FilePlus2, Lock, Eye, CheckCircle2, AlertTriangle } from "lucide-react"
import {
  PageHeader,
  StatCard,
  StatusBadge,
  RupiahText,
  WarningBanner,
  FormDialog,
  ConfirmDialog,
  DetailDrawer,
  DrawerSection,
  DrawerSummaryCard,
  FilterBar,
  DataTable,
  Toast,
  Button,
  Input,
  Card,
  CardContent,
  type ColumnDef,
} from "./components"
import {
  FEATURES,
} from "@/types/upt"
import { rupiah, generatePeriodeList } from "@/lib/format"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"

// Generate period list dynamically
const periodeUPT = generatePeriodeList(12)

type JenisKoreksi = "kekurangan_bayar" | "kelebihan_bayar"
type DasarKoreksi = "penetapan_jabatan" | "pengaduan" | "koreksi_absensi"
type StatusKoreksi = "draf" | "siap_amprah" | "amprah_susulan_terbit"

interface KoreksiSusulanItem {
  id: string
  nomorKoreksi: string
  pegawaiId: string
  nama: string
  nip: string
  unitKode: string
  unitNama: string
  periode: string
  jenis: JenisKoreksi
  dasar: DasarKoreksi
  nomorDasar: string
  alasan: string
  selisih: number
  status: StatusKoreksi
  nomorAmprahSusulan?: string
  dibuatOleh: string
  tanggalBuat: string
}

const initialKoreksiList: KoreksiSusulanItem[] = [
  {
    id: "kor-1",
    nomorKoreksi: "KOR/2026/08/001",
    pegawaiId: "peg-004",
    nama: "Dr. Ir. Hendra Wijaya, M.T.",
    nip: "197408192000031002",
    unitKode: "FT",
    unitNama: "Fakultas Teknik",
    periode: periodeUPT[1] ?? "September 2026",
    jenis: "kekurangan_bayar",
    dasar: "penetapan_jabatan",
    nomorDasar: "SK/REK/2026/0412",
    alasan: "Penetapan kenaikan Grade 11 efektif bulan berjalan setelah periode tersebut selesai diproses.",
    selisih: 1450000,
    status: "amprah_susulan_terbit",
    nomorAmprahSusulan: "AMP-SUS/2026/08/001",
    dibuatOleh: "Dewi Anggraini",
    tanggalBuat: "2026-08-03",
  },
  {
    id: "kor-2",
    nomorKoreksi: "KOR/2026/08/002",
    pegawaiId: "peg-007",
    nama: "Rina Marlina, S.E., M.M.",
    nip: "198503142010122003",
    unitKode: "FEB",
    unitNama: "Fakultas Ekonomi dan Bisnis",
    periode: periodeUPT[1] ?? "September 2026",
    jenis: "kelebihan_bayar",
    dasar: "pengaduan",
    nomorDasar: "PGD/2026/07/019",
    alasan: "Koreksi hari ketidakhadiran tanpa keterangan yang baru tercatat setelah Netto ditetapkan.",
    selisih: -420000,
    status: "siap_amprah",
    dibuatOleh: "Dewi Anggraini",
    tanggalBuat: "2026-08-06",
  },
  {
    id: "kor-3",
    nomorKoreksi: "KOR/2026/08/003",
    pegawaiId: "peg-010",
    nama: "Dr. Ahmad Fauzi, M.Kes.",
    nip: "197911022006041001",
    unitKode: "FK",
    unitNama: "Fakultas Kedokteran",
    periode: periodeUPT[1] ?? "September 2026",
    jenis: "kekurangan_bayar",
    dasar: "koreksi_absensi",
    nomorDasar: "ND/FK/2026/118",
    alasan: "Pembatalan potongan dinas luar karena surat tugas terlambat diunggah oleh Kepegawaian Unit.",
    selisih: 680000,
    status: "draf",
    dibuatOleh: "Dewi Anggraini",
    tanggalBuat: "2026-08-09",
  },
]

const labelJenis: Record<JenisKoreksi, string> = {
  kekurangan_bayar: "Kekurangan Bayar (+)",
  kelebihan_bayar: "Kelebihan Bayar (-)",
}

const labelDasar: Record<DasarKoreksi, string> = {
  penetapan_jabatan: "Penetapan Jabatan/Grade",
  pengaduan: "Pengaduan Eskalasi",
  koreksi_absensi: "Koreksi Kehadiran/Disiplin",
}

const statusLabelMap: Record<StatusKoreksi, string> = {
  draf: "draft",
  siap_amprah: "diajukan",
  amprah_susulan_terbit: "amprah_tersedia",
}

export default function KoreksiSusulanPage() {
  const isEnabled = FEATURES.koreksiSusulan

  const [items, setItems] = useState<KoreksiSusulanItem[]>(initialKoreksiList)
  const [search, setSearch] = useState("")
  const [filterJenis, setFilterJenis] = useState<string>("semua")
  const [filterStatus, setFilterStatus] = useState<string>("semua")

  const [formOpen, setFormOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<KoreksiSusulanItem | null>(null)
  const [confirmTerbit, setConfirmTerbit] = useState<KoreksiSusulanItem | null>(null)
  const [unitList, setUnitList] = useState<any[]>([])
  const [pegawaiList, setPegawaiList] = useState<any[]>([])

  const [formUnit, setFormUnit] = useState("")
  const [formPeriode, setFormPeriode] = useState(periodeUPT[1] ?? periodeUPT[0] ?? "Oktober 2026")
  const [formPegawaiId, setFormPegawaiId] = useState("")
  const [formJenis, setFormJenis] = useState<JenisKoreksi>("kekurangan_bayar")
  const [formDasar, setFormDasar] = useState<DasarKoreksi>("penetapan_jabatan")
  const [formNomorDasar, setFormNomorDasar] = useState("")
  const [formNominal, setFormNominal] = useState("")
  const [formAlasan, setFormAlasan] = useState("")
  const [formError, setFormError] = useState("")

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const [res, pegRes] = await Promise.all([
          uptRemunerasiService.getMasterUnits(),
          uptRemunerasiService.getPegawaiList().catch(() => ({ data: [] })),
        ])
        if (res?.data && Array.isArray(res.data)) {
          setUnitList(res.data)
          if (res.data.length > 0) {
            setFormUnit(res.data[0].kode || res.data[0].nama)
          }
        }
        if (pegRes?.data && Array.isArray(pegRes.data)) {
          setPegawaiList(pegRes.data)
        }
      } catch (err) {
        console.error("Gagal memuat unit:", err)
      }
    }
    fetchUnits()
  }, [])

  const pegawaiDiUnit = useMemo(() => {
    const unitObj = unitList.find((u) => u.kode === formUnit || u.nama === formUnit)
    return pegawaiList.filter(
      (p) => p.unit === unitObj?.nama || p.unit === formUnit
    )
  }, [unitList, pegawaiList, formUnit])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = search.trim().toLowerCase()
      const matchQuery =
        !q ||
        item.nama.toLowerCase().includes(q) ||
        item.nip.toLowerCase().includes(q) ||
        item.nomorKoreksi.toLowerCase().includes(q) ||
        item.unitNama.toLowerCase().includes(q)
      const matchJenis = filterJenis === "semua" || item.jenis === filterJenis
      const matchStatus = filterStatus === "semua" || item.status === filterStatus
      return matchQuery && matchJenis && matchStatus
    })
  }, [items, search, filterJenis, filterStatus])

  const ringkasan = useMemo(() => {
    const totalKekurangan = items
      .filter((i) => i.selisih > 0)
      .reduce((acc, i) => acc + i.selisih, 0)
    const totalKelebihan = items
      .filter((i) => i.selisih < 0)
      .reduce((acc, i) => acc + Math.abs(i.selisih), 0)
    const siapAmprah = items.filter((i) => i.status === "siap_amprah").length
    const sudahTerbit = items.filter((i) => i.status === "amprah_susulan_terbit").length
    return { totalKekurangan, totalKelebihan, siapAmprah, sudahTerbit }
  }, [items])

  const handleOpenForm = () => {
    if (!isEnabled) {
      Toast.info("Fitur koreksi susulan masih dinonaktifkan sambil menunggu konfirmasi Pasal 20.")
      return
    }
    setFormError("")
    setFormPegawaiId(pegawaiDiUnit[0]?.id ?? "")
    setFormNomorDasar("")
    setFormNominal("")
    setFormAlasan("")
    setFormOpen(true)
  }

  const handleSimpanKoreksi = () => {
    const nominalNum = Number(formNominal.replace(/[^0-9]/g, ""))
    if (!formPegawaiId) {
      setFormError("Pegawai wajib dipilih.")
      return
    }
    if (!formNomorDasar.trim()) {
      setFormError("Nomor dasar pengaduan/penetapan wajib diisi.")
      return
    }
    if (!nominalNum || nominalNum <= 0) {
      setFormError("Nominal selisih harus lebih dari Rp 0.")
      return
    }
    if (formAlasan.trim().length < 10) {
      setFormError("Alasan koreksi minimal 10 karakter.")
      return
    }

    const peg = pegawaiList.find((p) => p.id === formPegawaiId)
    const unitObj = unitList.find((u) => u.kode === formUnit || u.nama === formUnit)
    const nextIdx = items.length + 1
    const newItem: KoreksiSusulanItem = {
      id: `kor-${Date.now()}`,
      nomorKoreksi: `KOR/2026/08/${String(nextIdx).padStart(3, "0")}`,
      pegawaiId: formPegawaiId,
      nama: peg?.nama ?? "Pegawai Terpilih",
      nip: peg?.nip ?? "-",
      unitKode: formUnit,
      unitNama: unitObj?.nama ?? formUnit,
      periode: formPeriode,
      jenis: formJenis,
      dasar: formDasar,
      nomorDasar: formNomorDasar.trim(),
      alasan: formAlasan.trim(),
      selisih: formJenis === "kekurangan_bayar" ? nominalNum : -nominalNum,
      status: "siap_amprah",
      dibuatOleh: "Dewi Anggraini",
      tanggalBuat: "2026-08-10",
    }

    setItems((prev) => [newItem, ...prev])
    setFormOpen(false)
    Toast.success(`Koreksi ${newItem.nomorKoreksi} berhasil disimpan dan siap dibuatkan Amprah Susulan.`)
  }

  const handleTerbitkanAmprahSusulan = () => {
    if (!confirmTerbit) return
    const nomorAmprah = `AMP-SUS/2026/08/${String(items.length + 10).padStart(3, "0")}`
    setItems((prev) =>
      prev.map((item) =>
        item.id === confirmTerbit.id
          ? {
              ...item,
              status: "amprah_susulan_terbit",
              nomorAmprahSusulan: nomorAmprah,
            }
          : item
      )
    )
    setConfirmTerbit(null)
    Toast.success(`Amprah Susulan ${nomorAmprah} berhasil diterbitkan.`)
  }

  const columns: ColumnDef<KoreksiSusulanItem>[] = [
    {
      header: "No. Koreksi & Pegawai",
      cell: (row) => (
        <div>
          <p className="font-mono text-xs text-muted-foreground">{row.nomorKoreksi}</p>
          <p className="font-medium text-foreground">{row.nama}</p>
          <p className="text-xs text-muted-foreground">
            {row.nip} • {row.unitNama}
          </p>
        </div>
      ),
    },
    {
      header: "Periode Terdampak",
      cell: (row) => <span className="text-sm">{row.periode}</span>,
    },
    {
      header: "Jenis & Dasar",
      cell: (row) => (
        <div className="space-y-1">
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
              row.jenis === "kekurangan_bayar"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {labelJenis[row.jenis]}
          </span>
          <p className="text-xs text-muted-foreground">
            {labelDasar[row.dasar]} ({row.nomorDasar})
          </p>
        </div>
      ),
    },
    {
      header: "Selisih (+/-)",
      cell: (row) => (
        <span
          className={`font-semibold tabular-nums ${
            row.selisih >= 0 ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {row.selisih >= 0 ? "+" : "-"}
          <RupiahText value={Math.abs(row.selisih)} />
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={statusLabelMap[row.status]} />,
    },
    {
      header: "Aksi",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDetailItem(row)}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Detail
          </Button>
          {row.status === "siap_amprah" && (
            <Button
              size="sm"
              disabled={!isEnabled}
              onClick={() => setConfirmTerbit(row)}
            >
              Terbitkan Amprah
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Koreksi Susulan P1"
        subtitle="Penyesuaian kekurangan atau kelebihan bayar untuk periode yang telah ditetapkan Netto-nya."
        actions={
          <Button onClick={handleOpenForm} disabled={!isEnabled}>
            {isEnabled ? (
              <FilePlus2 className="mr-2 h-4 w-4" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            Buat Koreksi Susulan
          </Button>
        }
      />

      {!isEnabled && (
        <WarningBanner variant="warning" title="Fitur menunggu konfirmasi (Pasal 20)">
          Mekanisme koreksi susulan dan penerbitan Amprah Susulan saat ini dalam mode pratinjau hanya-baca
          (<code>FEATURES.koreksiSusulan = false</code>) sambil menunggu penetapan SOP teknis Pasal 20 oleh pimpinan.
        </WarningBanner>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Kekurangan Bayar"
          value={rupiah(ringkasan.totalKekurangan)}
          subtitle="Penambahan pada Amprah Susulan"
          icon={CheckCircle2}
        />
        <StatCard
          title="Total Kelebihan Bayar"
          value={rupiah(ringkasan.totalKelebihan)}
          subtitle="Pemotongan/pengembalian saldo"
          icon={AlertTriangle}
        />
        <StatCard
          title="Siap Amprah Susulan"
          value={String(ringkasan.siapAmprah)}
          subtitle="Menunggu penerbitan daftar bayar"
        />
        <StatCard
          title="Amprah Susulan Terbit"
          value={String(ringkasan.sudahTerbit)}
          subtitle="Sudah diteruskan ke pembayaran"
        />
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            placeholder="Cari nomor koreksi, nama, NIP, atau unit..."
          >
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="semua">Semua Jenis</option>
              <option value="kekurangan_bayar">Kekurangan Bayar (+)</option>
              <option value="kelebihan_bayar">Kelebihan Bayar (-)</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="semua">Semua Status</option>
              <option value="draf">Draf</option>
              <option value="siap_amprah">Siap Amprah Susulan</option>
              <option value="amprah_susulan_terbit">Amprah Susulan Terbit</option>
            </select>
          </FilterBar>

          <DataTable
            columns={columns}
            data={filteredItems}
            emptyText="Belum ada catatan koreksi susulan yang sesuai filter."
            pageSize={8}
          />
        </CardContent>
      </Card>

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Buat Koreksi Susulan P1"
        description="Pilih unit, periode terdampak, pegawai, dan dasar koreksi untuk menghasilkan Amprah Susulan."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSimpanKoreksi}>Simpan Koreksi</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {formError && (
            <WarningBanner variant="error" title="Validasi Gagal">
              {formError}
            </WarningBanner>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Unit Kerja</label>
              <select
                value={formUnit}
                onChange={(e) => {
                  setFormUnit(e.target.value)
                  setFormPegawaiId("")
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {unitList.map((u) => (
                  <option key={u.kode || u.nama} value={u.kode || u.nama}>
                    {u.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Periode Terdampak</label>
              <select
                value={formPeriode}
                onChange={(e) => setFormPeriode(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            <label className="mb-1 block text-xs font-medium text-foreground">Pegawai</label>
            <select
              value={formPegawaiId}
              onChange={(e) => setFormPegawaiId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">-- Pilih Pegawai --</option>
              {pegawaiDiUnit.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({p.nip})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Jenis Koreksi</label>
              <select
                value={formJenis}
                onChange={(e) => setFormJenis(e.target.value as JenisKoreksi)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="kekurangan_bayar">Kekurangan Bayar (+)</option>
                <option value="kelebihan_bayar">Kelebihan Bayar (-)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Dasar Koreksi</label>
              <select
                value={formDasar}
                onChange={(e) => setFormDasar(e.target.value as DasarKoreksi)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="penetapan_jabatan">Penetapan Jabatan/Grade</option>
                <option value="pengaduan">Pengaduan Eskalasi</option>
                <option value="koreksi_absensi">Koreksi Kehadiran/Disiplin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Nomor Dokumen Dasar
              </label>
              <Input
                value={formNomorDasar}
                onChange={(e) => setFormNomorDasar(e.target.value)}
                placeholder="Contoh: SK/REK/2026/0510"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Nominal Selisih (Rp)
              </label>
              <Input
                value={formNominal}
                onChange={(e) => setFormNominal(e.target.value)}
                placeholder="Contoh: 1250000"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Alasan Koreksi</label>
            <textarea
              rows={3}
              value={formAlasan}
              onChange={(e) => setFormAlasan(e.target.value)}
              placeholder="Jelaskan kronologi dan dasar perhitungan selisih P1..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </FormDialog>

      <DetailDrawer
        open={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        title={detailItem ? `Detail Koreksi ${detailItem.nomorKoreksi}` : "Detail Koreksi"}
        subtitle="Rincian penyesuaian P1 dan referensi Amprah Susulan."
        size="md"
        footer={
          <Button variant="outline" onClick={() => setDetailItem(null)}>
            Tutup
          </Button>
        }
      >
        {detailItem && (
          <>
            <DrawerSummaryCard
              items={[
                { label: "Pegawai", value: detailItem.nama },
                { label: "NIP", value: detailItem.nip, mono: true },
                { label: "Unit Kerja", value: detailItem.unitNama },
                { label: "Jenis Koreksi", value: labelJenis[detailItem.jenis] },
                {
                  label: "Dasar Koreksi",
                  value: `${labelDasar[detailItem.dasar]} (${detailItem.nomorDasar})`,
                  fullWidth: true,
                },
              ]}
              totalLabel="Nominal Selisih"
              totalValue={
                <span className={detailItem.selisih >= 0 ? "text-emerald-700" : "text-rose-700"}>
                  {detailItem.selisih >= 0 ? "+" : "-"}
                  <RupiahText value={Math.abs(detailItem.selisih)} />
                </span>
              }
            />

            <DrawerSection title="Alasan Koreksi">
              <div className="rounded-xl border p-4 text-sm text-foreground leading-relaxed">
                {detailItem.alasan}
              </div>
            </DrawerSection>

            {detailItem.nomorAmprahSusulan && (
              <DrawerSection title="Amprah Susulan">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <p className="text-xs font-semibold uppercase">Amprah Susulan Terbit</p>
                  <p className="mt-1 font-mono font-medium break-all">{detailItem.nomorAmprahSusulan}</p>
                </div>
              </DrawerSection>
            )}

            <p className="text-xs text-muted-foreground">
              Dibuat oleh {detailItem.dibuatOleh} pada {detailItem.tanggalBuat}.
            </p>
          </>
        )}
      </DetailDrawer>

      <ConfirmDialog
        open={Boolean(confirmTerbit)}
        onOpenChange={(open) => !open && setConfirmTerbit(null)}
        title="Terbitkan Amprah Susulan"
        description={
          confirmTerbit
            ? `Terbitkan Amprah Susulan untuk ${confirmTerbit.nama} (${confirmTerbit.nomorKoreksi}) sebesar ${rupiah(Math.abs(confirmTerbit.selisih))}?`
            : ""
        }
        confirmText="Ya, Terbitkan"
        onConfirm={handleTerbitkanAmprahSusulan}
      />
    </div>
  )
}
