import { useState, useMemo } from "react"
import { Search, Eye } from "lucide-react"
import {
  PageHeader,
  DataTable,
  StatusBadge,
  WarningBanner,
  DetailDrawer,
  DrawerSection,
  DrawerSummaryCard,
  DrawerKeyValueGrid,
  Button,
  Input,
  type ColumnDef,
} from "./components"
import {
  daftarPegawai,
  unitKerja,
  akunPenggunaInitial,
} from "@/types/upt"
import { Badge } from "@/components/ui/badge"

type PegawaiItem = (typeof daftarPegawai)[number]

export default function DataPegawaiPage() {
  const [search, setSearch] = useState("")
  const [unitFilter, setUnitFilter] = useState("semua")
  const [statusPegawaiFilter, setStatusPegawaiFilter] = useState("semua")
  const [gradeFilter, setGradeFilter] = useState("semua")
  const [aktifFilter, setAktifFilter] = useState("semua")

  const [selectedPegawai, setSelectedPegawai] = useState<PegawaiItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const gradeOptions = useMemo(
    () => Array.from(new Set(daftarPegawai.map((p) => p.grade))).sort((a, b) => a - b),
    []
  )

  const filtered = useMemo(() => {
    return daftarPegawai.filter((p) => {
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        p.nama.toLowerCase().includes(q) ||
        p.nip.includes(q) ||
        p.unit.toLowerCase().includes(q) ||
        p.jabatan.toLowerCase().includes(q)
      const matchUnit = unitFilter === "semua" || p.unit === unitFilter
      const matchStatusPegawai =
        statusPegawaiFilter === "semua" || p.statusPegawai === statusPegawaiFilter
      const matchGrade = gradeFilter === "semua" || String(p.grade) === gradeFilter
      const matchAktif = aktifFilter === "semua" || p.statusAktif === aktifFilter
      return matchSearch && matchUnit && matchStatusPegawai && matchGrade && matchAktif
    })
  }, [search, unitFilter, statusPegawaiFilter, gradeFilter, aktifFilter])

  const relatedAkun = useMemo(() => {
    if (!selectedPegawai) return null
    return akunPenggunaInitial.find((a) => a.pegawaiId === selectedPegawai.id || a.nip === selectedPegawai.nip) ?? null
  }, [selectedPegawai])

  const columns: ColumnDef<PegawaiItem>[] = [
    { header: "NIP", accessorKey: "nip", className: "w-40 font-mono text-xs" },
    {
      header: "Nama",
      cell: (item) => <span className="font-semibold text-sm text-foreground">{item.nama}</span>,
    },
    { header: "Unit", accessorKey: "unit", className: "text-xs text-muted-foreground" },
    {
      header: "Status Kepegawaian",
      cell: (item) => (
        <Badge variant="outline" className="text-[11px]">
          {item.statusPegawai}
        </Badge>
      ),
      className: "w-32",
    },
    { header: "Jabatan Saat Ini", accessorKey: "jabatan", className: "text-xs" },
    {
      header: "Grade",
      cell: (item) => <Badge variant="secondary" className="font-mono text-xs">G{item.grade}</Badge>,
      className: "w-20",
    },
    {
      header: "Berlaku Sejak",
      cell: () => <span className="text-xs text-muted-foreground">01 Jan 2025</span>,
      className: "w-28",
    },
    {
      header: "Status Aktif",
      cell: (item) => <StatusBadge status={item.statusAktif} />,
      className: "w-24",
    },
    {
      header: "Detail",
      cell: (item) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-primary gap-1"
          onClick={() => {
            setSelectedPegawai(item)
            setIsDrawerOpen(true)
          }}
        >
          <Eye className="size-3.5" /> Detail
        </Button>
      ),
      className: "w-24",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Direktori Pegawai (Hanya Baca)"
        subtitle="Daftar seluruh pegawai Universitas Andalas beserta jabatan, grade, dan akun akses terkait."
      />

      <WarningBanner variant="info" title="Data Dikelola Bidang Kepegawaian">
        Direktori ini bersifat <strong>hanya-baca</strong> bagi UPT Remunerasi. Pemutakhiran data induk pegawai
        dilakukan oleh Bidang Kepegawaian Unit atau melalui mekanisme Usulan Perubahan Jabatan/Grade.
      </WarningBanner>

      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, NIP, jabatan..."
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
            value={statusPegawaiFilter}
            onChange={(e) => setStatusPegawaiFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="semua">Semua Status Kepegawaian</option>
            <option value="PNS">PNS</option>
            <option value="CPNS">CPNS</option>
            <option value="CPT-PTNBH">CPT-PTNBH</option>
          </select>

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="semua">Semua Grade</option>
            {gradeOptions.map((g) => (
              <option key={g} value={String(g)}>
                Grade {g}
              </option>
            ))}
          </select>

          <select
            value={aktifFilter}
            onChange={(e) => setAktifFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="semua">Semua Status Aktif</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyText="Tidak ada pegawai yang sesuai dengan filter."
      />

      <DetailDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Detail Informasi Pegawai"
        subtitle="Tampilan hanya-baca (dikelola Bidang Kepegawaian)"
        size="md"
        footer={
          <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
            Tutup
          </Button>
        }
      >
        {selectedPegawai && (
          <>
            <DrawerSummaryCard
              items={[
                { label: "Nama Lengkap", value: selectedPegawai.nama },
                { label: "NIP", value: selectedPegawai.nip, mono: true },
                { label: "Unit Kerja", value: selectedPegawai.unit },
                { label: "Status Kepegawaian", value: selectedPegawai.statusPegawai },
                { label: "Jabatan Saat Ini", value: selectedPegawai.jabatan },
                { label: "Grade & Status", value: (
                  <span className="inline-flex items-center gap-2">
                    <span className="font-mono font-semibold text-emerald-700">Grade {selectedPegawai.grade}</span>
                    <StatusBadge status={selectedPegawai.statusAktif} />
                  </span>
                ) },
              ]}
            />

            <DrawerSection title="Riwayat Jabatan / Grade">
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Jabatan</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Berlaku Mulai - Sampai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3 font-semibold text-foreground">{selectedPegawai.jabatan}</td>
                      <td className="p-3 font-mono">G{selectedPegawai.grade}</td>
                      <td className="p-3 whitespace-nowrap">01 Jan 2025 - Sekarang</td>
                    </tr>
                    <tr className="text-muted-foreground">
                      <td className="p-3">Jabatan Sebelumnya</td>
                      <td className="p-3 font-mono">G{Math.max(1, selectedPegawai.grade - 1)}</td>
                      <td className="p-3 whitespace-nowrap">01 Jan 2021 - 31 Des 2024</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </DrawerSection>

            <DrawerSection title="Akun Terkait & Penugasan Peran">
              {relatedAkun ? (
                <div className="rounded-xl border bg-card p-4">
                  <DrawerKeyValueGrid
                    items={[
                      { label: "Email Institusi", value: relatedAkun.email, mono: true },
                      { label: "Status Akun", value: <StatusBadge status={relatedAkun.status} /> },
                      { label: "Peran Dasar", value: <Badge variant="outline" className="text-xs">{relatedAkun.peranDasar}</Badge> },
                      { label: "Peran Tambahan", value: <span className="text-emerald-700">{relatedAkun.peranTambahan || "Tidak ada"}</span> },
                    ]}
                  />
                </div>
              ) : (
                <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground italic">
                  Pegawai ini menggunakan akun standar Pegawai.
                </p>
              )}
            </DrawerSection>
          </>
        )}
      </DetailDrawer>
    </div>
  )
}
