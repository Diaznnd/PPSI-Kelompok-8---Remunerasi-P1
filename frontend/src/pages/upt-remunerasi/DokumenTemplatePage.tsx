import { useState } from "react"
import {
  FileText,
  Download,
  Save,
  FileSignature,
  FileSpreadsheet,
  Building,
  Shield,
  Eye,
} from "lucide-react"
import {
  PageHeader,
  DataTable,
  Button,
  Input,
  PrintPreview,
  Toast,
  type ColumnDef,
} from "./components"
import {
  dokumenConfigInitial,
  dokumenTemplate,
  type PenandatanganConfig,
} from "@/data/dummy-upt"
import { Label } from "@/components/ui/label"

export default function DokumenTemplatePage() {
  const [config, setConfig] = useState<PenandatanganConfig>(dokumenConfigInitial)
  const [activeTab, setActiveTab] = useState<"penandatangan" | "template">("penandatangan")
  const [previewModalOpen, setPreviewModalOpen] = useState(false)

  const sampleYear = "2026"
  const sampleMonth = "10"
  const sampleUnit = "FTI"
  const sampleUrut = "001"

  const previewNomorAmprah = config.formatNomorAmprah
    .replace("{TAHUN}", sampleYear)
    .replace("{BULAN}", sampleMonth)
    .replace("{UNIT}", sampleUnit)
    .replace("{URUT}", sampleUrut)

  const previewNomorRekap = config.formatNomorRekap
    .replace("{TAHUN}", sampleYear)
    .replace("{BULAN}", sampleMonth)
    .replace("{URUT}", sampleUrut)

  const handleSaveConfig = () => {
    Toast.success("Pengaturan penandatangan & format nomor dokumen berhasil disimpan!")
  }

  const columnsTemplate: ColumnDef<(typeof dokumenTemplate)[0]>[] = [
    { header: "Kode", accessorKey: "kode", className: "w-32 font-mono text-xs font-semibold" },
    {
      header: "Nama Dokumen / Regulasi",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-primary shrink-0" />
          <span className="font-semibold text-xs">{item.nama}</span>
        </div>
      ),
    },
    { header: "Format", accessorKey: "tipe", className: "w-20 font-semibold text-xs" },
    { header: "Versi", accessorKey: "revisi", className: "w-20 text-xs text-muted-foreground" },
    { header: "Ukuran", accessorKey: "ukuran", className: "w-24 text-xs text-muted-foreground" },
    { header: "Tanggal", accessorKey: "tanggal", className: "w-28 text-xs text-muted-foreground" },
    {
      header: "Aksi",
      cell: (item) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs text-primary"
          onClick={() => Toast.success(`Mengunduh berkas: ${item.nama}`)}
        >
          <Download className="size-3.5" /> Unduh
        </Button>
      ),
      className: "w-28 text-right",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumen & Format Standar"
        subtitle="Pengaturan penandatangan resmi amprah, penomoran dokumen otomatis, dan repositori berkas regulasi P1."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setPreviewModalOpen(true)}
            >
              <Eye className="size-3.5" /> Pratinjau Lembar TTD
            </Button>
            <Button size="sm" className="gap-1.5 text-xs" onClick={handleSaveConfig}>
              <Save className="size-3.5" /> Simpan Pengaturan
            </Button>
          </div>
        }
      />

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("penandatangan")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
            activeTab === "penandatangan"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileSignature className="size-4" />
          Penandatangan & Format Nomor
        </button>
        <button
          onClick={() => setActiveTab("template")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
            activeTab === "template"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileSpreadsheet className="size-4" />
          Berkas Master & Template Resmi ({dokumenTemplate.length})
        </button>
      </div>

      {activeTab === "penandatangan" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-none space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Shield className="size-5 text-primary" />
              <div>
                <h3 className="font-bold text-sm">Penandatangan 1: Kepala UPT Remunerasi</h3>
                <p className="text-xs text-muted-foreground">Pihak pemverifikasi dan penyusun amprah P1.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Nama Lengkap & Gelar *</Label>
                <Input
                  value={config.kepalaUpt.nama}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      kepalaUpt: { ...prev.kepalaUpt, nama: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">NIP *</Label>
                  <Input
                    value={config.kepalaUpt.nip}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        kepalaUpt: { ...prev.kepalaUpt, nip: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pangkat / Golongan</Label>
                  <Input
                    value={config.kepalaUpt.pangkatGolongan}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        kepalaUpt: { ...prev.kepalaUpt, pangkatGolongan: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Jabatan Naskah Dinas *</Label>
                  <Input
                    value={config.kepalaUpt.jabatan}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        kepalaUpt: { ...prev.kepalaUpt, jabatan: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Berlaku Mulai</Label>
                  <Input
                    type="date"
                    value={config.kepalaUpt.berlakuMulai}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        kepalaUpt: { ...prev.kepalaUpt, berlakuMulai: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-none space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Building className="size-5 text-primary" />
              <div>
                <h3 className="font-bold text-sm">Penandatangan 2: Penanggung Jawab Remunerasi</h3>
                <p className="text-xs text-muted-foreground">Wakil Rektor Bidang Keuangan dan Umum.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Nama Lengkap & Gelar *</Label>
                <Input
                  value={config.penanggungJawab.nama}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      penanggungJawab: { ...prev.penanggungJawab, nama: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">NIP *</Label>
                  <Input
                    value={config.penanggungJawab.nip}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        penanggungJawab: { ...prev.penanggungJawab, nip: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pangkat / Golongan</Label>
                  <Input
                    value={config.penanggungJawab.pangkatGolongan}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        penanggungJawab: { ...prev.penanggungJawab, pangkatGolongan: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Jabatan Naskah Dinas *</Label>
                  <Input
                    value={config.penanggungJawab.jabatan}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        penanggungJawab: { ...prev.penanggungJawab, jabatan: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Berlaku Mulai</Label>
                  <Input
                    type="date"
                    value={config.penanggungJawab.berlakuMulai}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        penanggungJawab: { ...prev.penanggungJawab, berlakuMulai: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-none lg:col-span-2 space-y-4">
            <h3 className="font-bold text-sm border-b pb-2">Pola Penomoran Dokumen Otomatis</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">Pola Nomor Amprah Pembayaran Unit</Label>
                <Input
                  value={config.formatNomorAmprah}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, formatNomorAmprah: e.target.value }))
                  }
                  className="font-mono text-xs"
                />
                <div className="rounded-lg border bg-primary/5 p-3 text-xs">
                  <span className="text-muted-foreground">Pratinjau Nomor Amprah:</span>
                  <p className="mt-1 font-mono font-bold text-primary">{previewNomorAmprah}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Pola Nomor Rekapitulasi Universitas</Label>
                <Input
                  value={config.formatNomorRekap}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, formatNomorRekap: e.target.value }))
                  }
                  className="font-mono text-xs"
                />
                <div className="rounded-lg border bg-primary/5 p-3 text-xs">
                  <span className="text-muted-foreground">Pratinjau Nomor Rekap:</span>
                  <p className="mt-1 font-mono font-bold text-primary">{previewNomorRekap}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "template" && (
        <div className="space-y-4">
          <DataTable columns={columnsTemplate} data={dokumenTemplate} />
        </div>
      )}

      <PrintPreview
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        title="Pratinjau Format Pengesahan Amprah P1"
      >
        <div className="space-y-6 text-xs text-foreground">
          <div className="text-center space-y-1 border-b pb-4">
            <p className="font-bold text-sm uppercase">KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</p>
            <p className="font-bold text-base uppercase">UNIVERSITAS ANDALAS</p>
            <p className="text-[11px] text-muted-foreground">
              Kampus Limau Manis, Padang 25163 • Laman: www.unand.ac.id
            </p>
            <p className="font-mono font-bold text-xs pt-2">LEMBAR PENGESAHAN AMPRAH PEMBAYARAN P1</p>
            <p className="font-mono text-[11px] text-muted-foreground">Nomor: {previewNomorAmprah}</p>
          </div>

          <p className="leading-relaxed">
            Telah diperiksa dan diverifikasi secara berjenjang oleh Unit Kerja dan Unit Pelaksana Teknis
            (UPT) Remunerasi Universitas Andalas untuk periode pembayaran <strong>Oktober 2026</strong>.
          </p>

          <div className="pt-8 grid grid-cols-2 gap-12 text-center">
            <div className="space-y-16">
              <p>
                Mengetahui,<br />
                <strong>{config.penanggungJawab.jabatan}</strong>
              </p>
              <div>
                <p className="font-bold underline">{config.penanggungJawab.nama}</p>
                <p className="font-mono">NIP. {config.penanggungJawab.nip}</p>
                <p className="text-muted-foreground">{config.penanggungJawab.pangkatGolongan}</p>
              </div>
            </div>

            <div className="space-y-16">
              <p>
                {config.kotaTandaTangan}, 31 Oktober 2026<br />
                <strong>{config.kepalaUpt.jabatan}</strong>
              </p>
              <div>
                <p className="font-bold underline">{config.kepalaUpt.nama}</p>
                <p className="font-mono">NIP. {config.kepalaUpt.nip}</p>
                <p className="text-muted-foreground">{config.kepalaUpt.pangkatGolongan}</p>
              </div>
            </div>
          </div>
        </div>
      </PrintPreview>
    </div>
  )
}
