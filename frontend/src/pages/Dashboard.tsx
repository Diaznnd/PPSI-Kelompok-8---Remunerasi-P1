import { useAuth } from "@/context/AuthContext"
import { labelPeran } from "@/lib/peran"

export default function Dashboard() {
  const { akun } = useAuth()
  return (
    <div>
      <h2 className="text-2xl font-semibold">
        Dashboard {akun && labelPeran[akun.peran]}
      </h2>
      <p className="text-muted-foreground">Halaman ini akan diganti sesuai fitur peran.</p>
    </div>
  )
}