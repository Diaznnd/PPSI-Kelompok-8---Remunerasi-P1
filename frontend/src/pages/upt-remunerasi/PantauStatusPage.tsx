import { useState, useMemo, useEffect } from "react"
import { ArrowRight, History, Info } from "lucide-react"
import {
  PageHeader,
  StatusBadge,
  Stepper,
  DetailDrawer,
  DrawerSection,
  DrawerSummaryCard,
  DrawerTimeline,
  Button,
  WarningBanner,
  RupiahText,
  usePeriode,
  type ColumnDef,
  DataTable,
} from "./components"
import {
  type UPTPengajuan,
  type UsulanJabatanDetailItem,
} from "@/types/upt"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { Badge } from "@/components/ui/badge"
import { generatePeriodeList } from "@/lib/format"

function getStepIndex(status: UPTPengajuan["status"]): number {
  switch (status) {
    case "amprah_tersedia":
      return 4
    case "netto_ditetapkan":
      return 3
    case "terverifikasi":
      return 2
    default:
      return 1
  }
}

export default function PantauStatusUPTPage() {
  const { periode: activePeriode } = usePeriode()
  const [activeTab, setActiveTab] = useState<"pengajuan" | "jabatan">("pengajuan")
  const [periodeFilter, setPeriodeFilter] = useState("semua")
  const [unitFilter, setUnitFilter] = useState("semua")
  const [statusFilter, setStatusFilter] = useState("semua")
  
  // Generate period list dynamically
  const periodeUPT = useMemo(() => generatePeriodeList(12), [])

  const [pengajuanList, setPengajuanList] = useState<UPTPengajuan[]>([])
  const [usulanList, setUsulanList] = useState<UsulanJabatanDetailItem[]>([])

  const [selectedPengajuan, setSelectedPengajuan] = useState<UPTPengajuan | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [selectedUsulan, setSelectedUsulan] = useState<UsulanJabatanDetailItem | null>(null)
  const [isUsulanDrawerOpen, setIsUsulanDrawerOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [monitoringRes, usulanRes] = await Promise.all([
          uptRemunerasiService.getMonitoringStatus(periodeFilter),
          uptRemunerasiService.getPenetapanJabatanList(),
        ])
        if (monitoringRes?.data && Array.isArray(monitoringRes.data)) {
          setPengajuanList(monitoringRes.data)
        }
        if (usulanRes?.data && Array.isArray(usulanRes.data)) {
          setUsulanList(usulanRes.data)
        }
      } catch (err) {
        console.error("Gagal memuat monitoring:", err)
      }
    }
    fetchData()
  }, [periodeFilter])

  const filteredPengajuan = useMemo(() => {
    return pengajuanList.filter((item) => {
      const matchPeriode = periodeFilter === "semua" || item.periode === periodeFilter
      const matchUnit = unitFilter === "semua" || item.unit === unitFilter
      const matchStatus = statusFilter === "semua" || item.status === statusFilter
      return matchPeriode && matchUnit && matchStatus
    })
  }, [pengajuanList, periodeFilter, unitFilter, statusFilter])

  const filteredUsulan = useMemo(() => {
    return usulanList.filter((item) => {
      const matchUnit = unitFilter === "semua" || item.unit === unitFilter
      const matchStatus = statusFilter === "semua" || item.status === statusFilter
      return matchUnit && matchStatus
    })
  }, [usulanList, unitFilter, statusFilter])

  const pengajuanColumns: ColumnDef<UPTPengajuan>[] = [
    {
      header: "Unit Kerja",
      cell: (item) => (
        <div>
          <p className="font-semibold text-sm text-foreground">{item.unit}</p>
          <p className="text-[11px] font-mono text-muted-foreground">{item.id}</p>
        </div>
      ),
    },
    {
      header: "Periode",
      accessorKey: "periode",
      className: "text-xs whitespace-nowrap",
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
      className: "w-36",
    },
    {
      header: "Terakhir Diperbarui",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.diajukanPada ? `${item.diajukanPada}, 16.05` : "Belum diajukan"}
        </span>
      ),
    },
    {
      header: "Aksi",
      cell: (item) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => {
            setSelectedPengajuan(item)
            setIsDrawerOpen(true)
          }}
        >
          <History className="size-3.5" /> Lihat Riwayat
        </Button>
      ),
      className: "w-36 text-right",
    },
  ]

  const usulanColumns: ColumnDef<UsulanJabatanDetailItem>[] = [
    {
      header: "Nama & NIP",
      cell: (item) => (
        <div>
          <p className="font-semibold text-sm text-foreground">{item.pegawai}</p>
          <p className="text-[11px] font-mono text-muted-foreground">{item.nip}</p>
        </div>
      ),
    },
    {
      header: "Unit",
      accessorKey: "unit",
      className: "text-xs text-muted-foreground",
    },
    {
      header: "Jabatan Lama → Baru",
      cell: (item) => (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">{item.lama}</span>
          <ArrowRight className="size-3.5 text-muted-foreground" />
          <span className="font-semibold text-foreground">{item.baru}</span>
        </div>
      ),
    },
    {
      header: "Jenis",
      cell: (item) => (
        <Badge variant="outline" className="text-[10px] capitalize">
          {item.jenisPerubahan}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: "Terakhir Diperbarui",
      accessorKey: "tanggalPengajuan",
      className: "text-xs text-muted-foreground",
    },
    {
      header: "Linimasa",
      cell: (item) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-primary gap-1"
          onClick={() => {
            setSelectedUsulan(item)
            setIsUsulanDrawerOpen(true)
          }}
        >
          <History className="size-3.5" /> Detail
        </Button>
      ),
    },
  ]

  const stepIdx = getStepIndex(selectedPengajuan.status)
  const timelineRounds = useMemo(() => {
    const isReturnedOrResubmitted =
      selectedPengajuan.status === "dikembalikan" || selectedPengajuan.unit.includes("Kedokteran")

    const rounds: {
      judul: string
      steps: { tahap: string; tanggal: string; jam: string; pelaku: string; catatan: string; done: boolean }[]
    }[] = []

    if (isReturnedOrResubmitted) {
      rounds.push({
        judul: "Pengajuan ke-1",
        steps: [
          { tahap: "Diajukan", tanggal: "18 Okt 2026", jam: "10.15", pelaku: selectedPengajuan.bendahara, catatan: "Pengajuan awal P1 Oktober 2026.", done: true },
          { tahap: "Dikembalikan", tanggal: "19 Okt 2026", jam: "14.20", pelaku: selectedPengajuan.diverifikasiOleh || "Verifikator", catatan: selectedPengajuan.catatan || "Perlu perbaikan data presensi.", done: true },
        ],
      })
    }

    rounds.push({
      judul: isReturnedOrResubmitted ? "Pengajuan ke-2 (Saat Ini)" : "Pengajuan ke-1",
      steps: [
        {
          tahap: "Diajukan",
          tanggal: selectedPengajuan.diajukanPada || "-",
          jam: selectedPengajuan.diajukanPada ? "16.05" : "-",
          pelaku: selectedPengajuan.bendahara,
          catatan: "Pengajuan dikirim oleh Bendahara unit.",
          done: selectedPengajuan.status !== "draft",
        },
        {
          tahap: "Terverifikasi",
          tanggal: stepIdx >= 2 ? "21 Okt 2026" : "-",
          jam: stepIdx >= 2 ? "11.20" : "-",
          pelaku: selectedPengajuan.diverifikasiOleh || "Verifikator Universitas",
          catatan: stepIdx >= 2 ? "Pemeriksaan kelengkapan dokumen selesai." : "Menunggu proses verifikasi.",
          done: stepIdx >= 2,
        },
        {
          tahap: "Netto Ditetapkan",
          tanggal: stepIdx >= 3 ? "23 Okt 2026" : "-",
          jam: stepIdx >= 3 ? "10.42" : "-",
          pelaku: selectedPengajuan.ditetapkanOleh || "UPT Remunerasi",
          catatan: stepIdx >= 3 ? "Pajak & P1 Netto ditetapkan; slip terbit otomatis." : "Menunggu penetapan Netto UPT.",
          done: stepIdx >= 3,
        },
        {
          tahap: "Amprah Tersedia",
          tanggal: stepIdx >= 4 ? "24 Okt 2026" : "-",
          jam: stepIdx >= 4 ? "09.00" : "-",
          pelaku: "UPT Remunerasi",
          catatan: stepIdx >= 4 ? "Dokumen amprah siap diunduh Bendahara untuk SAKU." : "Belum disusun.",
          done: stepIdx >= 4,
        },
      ],
    })

    return rounds
  }, [selectedPengajuan, stepIdx])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pantau Status Pengajuan"
        subtitle="Pemantauan progres pengajuan P1 unit dan perubahan jabatan/grade secara menyeluruh (hanya-baca)."
      />

      <div className="flex border-b">
        <button
          onClick={() => {
            setActiveTab("pengajuan")
            setStatusFilter("semua")
          }}
          className={`border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
            activeTab === "pengajuan"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pengajuan P1 ({filteredPengajuan.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("jabatan")
            setStatusFilter("semua")
          }}
          className={`border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
            activeTab === "jabatan"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Perubahan Jabatan/Grade ({filteredUsulan.length})
        </button>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="semua">Semua Unit Kerja</option>
            {Array.from(new Set(pengajuanList.map((p) => p.unit).concat(usulanList.map((u) => u.unit)).filter(Boolean))).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="semua">Semua Status</option>
            {activeTab === "pengajuan" ? (
              <>
                <option value="draft">Draft</option>
                <option value="diajukan">Menunggu Verifikasi</option>
                <option value="dikembalikan">Dikembalikan</option>
                <option value="terverifikasi">Terverifikasi</option>
                <option value="netto_ditetapkan">Netto Ditetapkan</option>
                <option value="amprah_tersedia">Amprah Tersedia</option>
              </>
            ) : (
              <>
                <option value="diajukan">Menunggu Verifikasi</option>
                <option value="terverifikasi">Terverifikasi</option>
                <option value="ditetapkan">Ditetapkan</option>
                <option value="dikembalikan">Dikembalikan</option>
                <option value="ditolak">Ditolak</option>
              </>
            )}
          </select>
        </div>
      </div>

      {activeTab === "pengajuan" ? (
        <div className="space-y-4">
          {filteredPengajuan.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Tahapan Pengajuan Terpilih: <span className="text-foreground">{selectedPengajuan.unit} ({selectedPengajuan.id})</span>
              </p>
              <Stepper
                steps={["Diajukan", "Terverifikasi", "Netto Ditetapkan", "Amprah Tersedia"]}
                currentStep={stepIdx}
              />
            </div>
          )}

          <DataTable
            columns={pengajuanColumns}
            data={filteredPengajuan}
            emptyText="Belum ada pengajuan pada periode ini."
          />
        </div>
      ) : (
        <DataTable
          columns={usulanColumns}
          data={filteredUsulan}
          emptyText="Belum ada pengajuan pada periode ini."
        />
      )}

      <DetailDrawer
        open={isDrawerOpen && !!selectedPengajuan}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedPengajuan ? `Riwayat Pengajuan ${selectedPengajuan.id}` : "Riwayat Pengajuan"}
        subtitle={selectedPengajuan ? `${selectedPengajuan.unit} • ${selectedPengajuan.periode}` : ""}
        size="md"
        footer={
          <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
            Tutup
          </Button>
        }
      >
        {selectedPengajuan && (
          <>
            <DrawerSummaryCard
              items={[
                { label: "Nomor Pengajuan", value: selectedPengajuan.id, mono: true },
                { label: "Unit Kerja", value: selectedPengajuan.unit },
                { label: "Periode", value: selectedPengajuan.periode },
                { label: "Jumlah Pegawai", value: `${selectedPengajuan.pegawai} orang` },
              ]}
              totalLabel="Total Bruto"
              totalValue={<RupiahText value={selectedPengajuan.total} className="font-semibold text-emerald-700" />}
            />

            {selectedPengajuan.catatan && (
              <WarningBanner variant="info" title="Catatan / Alasan Pengembalian">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  <span>{selectedPengajuan.catatan}</span>
                </div>
              </WarningBanner>
            )}
          </>
        )}

        {[...timelineRounds].reverse().map((round, revIdx) => {
          const putaranKe = timelineRounds.length - revIdx
          const isLatest = revIdx === 0
          return (
            <DrawerSection
              key={round.judul}
              title={round.judul}
              badge={`Putaran ${putaranKe}`}
              collapsible={timelineRounds.length > 1 && !isLatest}
              defaultOpen={isLatest}
            >
              <DrawerTimeline
                items={round.steps.map((st, idx) => {
                  const prevDone = idx === 0 ? true : round.steps[idx - 1].done
                  return {
                    tahap: st.tahap,
                    status: st.done ? "selesai" : prevDone ? "berjalan" : "belum",
                    tanggal: st.done ? st.tanggal : "-",
                    jam: st.done && st.jam !== "-" ? st.jam : undefined,
                    pelaku: st.pelaku,
                    catatan: st.catatan,
                  }
                })}
              />
            </DrawerSection>
          )
        })}
      </DetailDrawer>

      <DetailDrawer
        open={isUsulanDrawerOpen}
        onClose={() => setIsUsulanDrawerOpen(false)}
        title={`Linimasa Usulan ${selectedUsulan?.id ?? ""}`}
        subtitle={selectedUsulan ? `${selectedUsulan.pegawai} • ${selectedUsulan.unit}` : undefined}
        size="md"
        footer={
          <Button variant="outline" onClick={() => setIsUsulanDrawerOpen(false)}>
            Tutup
          </Button>
        }
      >
        {selectedUsulan && (
          <>
            <DrawerSummaryCard
              items={[
                { label: "Perubahan Jabatan/Grade", value: `${selectedUsulan.lama} → ${selectedUsulan.baru}`, fullWidth: true },
                { label: "Jenis Perubahan", value: <span className="capitalize">{selectedUsulan.jenisPerubahan}</span> },
                { label: "Berlaku Mulai", value: selectedUsulan.mulai },
              ]}
            />
            <DrawerSection title="Linimasa Penetapan">
              <DrawerTimeline
                items={[
                  {
                    tahap: "Diajukan",
                    status: "selesai",
                    pelaku: selectedUsulan.diajukanOleh,
                    tanggal: selectedUsulan.tanggalPengajuan,
                  },
                  {
                    tahap: "Terverifikasi",
                    status:
                      selectedUsulan.status === "terverifikasi" || selectedUsulan.status === "ditetapkan"
                        ? "selesai"
                        : "berjalan",
                    pelaku: "Verifikator Universitas",
                    tanggal: selectedUsulan.tanggalSK || "-",
                  },
                  {
                    tahap: "Ditetapkan",
                    status:
                      selectedUsulan.status === "ditetapkan"
                        ? "selesai"
                        : selectedUsulan.status === "terverifikasi"
                        ? "berjalan"
                        : "belum",
                    pelaku: "UPT Remunerasi",
                    tanggal: selectedUsulan.status === "ditetapkan" ? selectedUsulan.mulai : "-",
                  },
                ]}
              />
            </DrawerSection>
          </>
        )}
      </DetailDrawer>
    </div>
  )
}
