import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Check,
} from "lucide-react"
import { PageHeader, Button, Toast } from "./components"
import type { NotifikasiItem } from "@/types/upt"
import { uptRemunerasiService } from "@/services/uptRemunerasiService"
import { Badge } from "@/components/ui/badge"

const KATEGORI_LABEL: Record<string, string> = {
  pengajuan: "Pengajuan P1",
  usulan_jabatan: "Usulan Jabatan",
  pengaduan: "Pengaduan Eskalasi",
  slip: "Slip P1",
  parameter: "Jadwal & Parameter",
}

export default function NotifikasiSistemPage() {
  const navigate = useNavigate()
  const [list, setList] = useState<NotifikasiItem[]>([])
  const [filterMode, setFilterMode] = useState<"semua" | "belum_dibaca">("semua")

  useEffect(() => {
    const fetchNotifikasi = async () => {
      try {
        const res = await uptRemunerasiService.getNotifikasi()
        if (res?.data && Array.isArray(res.data)) {
          setList(res.data)
        }
      } catch (err) {
        console.error("Gagal memuat notifikasi:", err)
      }
    }
    fetchNotifikasi()
  }, [])

  const unreadCount = useMemo(() => list.filter((n) => !n.dibaca).length, [list])

  const filteredList = useMemo(() => {
    if (filterMode === "belum_dibaca") {
      return list.filter((n) => !n.dibaca)
    }
    return list
  }, [list, filterMode])

  const tandaiDibaca = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, dibaca: true } : item))
    )
    Toast.success("Notifikasi ditandai sudah dibaca")
  }

  const tandaiSemuaDibaca = () => {
    setList((prev) => prev.map((item) => ({ ...item, dibaca: true })))
    Toast.success("Semua notifikasi telah ditandai dibaca")
  }

  const handleOpenNotifikasi = (item: NotifikasiItem) => {
    if (!item.dibaca) {
      setList((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, dibaca: true } : n))
      )
    }
    navigate(item.tautan)
  }

  const icons = {
    info: <Info className="size-5 text-sky-600" />,
    sukses: <CheckCircle2 className="size-5 text-emerald-600" />,
    peringatan: <AlertTriangle className="size-5 text-amber-600" />,
    error: <AlertCircle className="size-5 text-rose-600" />,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifikasi Sistem"
        subtitle="Pemberitahuan aktivitas penting terkait pengajuan terverifikasi, penetapan jabatan, eskalasi pengaduan, slip, dan batas waktu."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={unreadCount === 0}
            onClick={tandaiSemuaDibaca}
          >
            <CheckCheck className="size-4" /> Tandai Semua Dibaca
          </Button>
        }
      />

      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant={filterMode === "semua" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setFilterMode("semua")}
          >
            Semua ({list.length})
          </Button>
          <Button
            variant={filterMode === "belum_dibaca" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => setFilterMode("belum_dibaca")}
          >
            Belum Dibaca
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className={`px-1.5 py-0 text-[10px] ${
                  filterMode === "belum_dibaca"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-2 size-8 opacity-40" />
            <p>Tidak ada notifikasi yang belum dibaca.</p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenNotifikasi(item)}
              className={`group flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all hover:shadow-sm ${
                item.dibaca
                  ? "bg-card text-muted-foreground hover:bg-muted/30"
                  : "border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10"
              }`}
            >
              <div className="mt-0.5 rounded-lg border bg-card p-2 shadow-xs">
                {icons[item.jenis] ?? <Bell className="size-5 text-primary" />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-foreground">{item.judul}</h4>
                    {!item.dibaca && (
                      <span className="size-2 rounded-full bg-primary" title="Belum dibaca" />
                    )}
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {KATEGORI_LABEL[item.kategori]}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.waktu}</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{item.deskripsi}</p>

                <div className="flex items-center justify-between pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                    Buka halaman terkait <ArrowRight className="size-3" />
                  </span>

                  {!item.dibaca && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                      onClick={(e) => tandaiDibaca(item.id, e)}
                    >
                      <Check className="size-3.5" /> Tandai dibaca
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
