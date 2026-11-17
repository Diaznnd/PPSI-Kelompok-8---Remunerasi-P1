import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/rbac"
import { useRBAC } from "@/hooks/useRBAC"
import { useAuth } from "@/context/AuthContext"
import { groupAbilitiesByResource } from "@/lib/rbac"
import { labelPeran } from "@/lib/peran"
import { Check, X, Shield, FileText, Users, DollarSign, Settings } from "lucide-react"

/**
 * Halaman contoh implementasi RBAC
 * Menunjukkan berbagai cara menggunakan RBAC di aplikasi
 */
export default function ExampleRBACPage() {
  const { akun } = useAuth()
  const { can, canAny, abilities, peran } = useRBAC()

  if (!akun || !peran) return null

  const groupedAbilities = groupAbilitiesByResource(peran)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">RBAC Testing & Demo</h1>
        <p className="text-muted-foreground">Contoh implementasi Role-Based Access Control</p>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Informasi Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Username:</span>
            <span>{akun.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Role:</span>
            <Badge variant="default">{labelPeran[peran]}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Total Abilities:</span>
            <Badge variant="secondary">{abilities.length}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Abilities List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Permissions</CardTitle>
          <CardDescription>Abilities yang dimiliki role Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(groupedAbilities).map(([resource, actions]) => (
              <div key={resource} className="border rounded-lg p-4">
                <h3 className="font-semibold capitalize mb-2 flex items-center gap-2">
                  {getResourceIcon(resource)}
                  {resource}
                </h3>
                <div className="space-y-1">
                  {actions.map((action) => (
                    <div key={action} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">
                        {resource}:{action}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Checks Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Demo: Permission Checks</CardTitle>
          <CardDescription>Berbagai cara cek permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Single Ability Check */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">1. Single Ability Check</h4>
            <div className="space-y-2">
              <PermissionCheck ability="pengajuan:create" />
              <PermissionCheck ability="pengajuan:verify" />
              <PermissionCheck ability="pengajuan:approve" />
              <PermissionCheck ability="laporan:generate" />
              <PermissionCheck ability="pengaturan:manage" />
            </div>
          </div>

          {/* Multiple Ability Check (OR) */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">2. Multiple Abilities (OR Logic)</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Cek apakah user punya SALAH SATU dari abilities berikut
            </p>
            <div className="flex items-center gap-2">
              {canAny(["pengajuan:approve", "pengajuan:approve-unit", "pengajuan:approve-final"]) ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Bisa Approve
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Tidak Bisa Approve
                </Badge>
              )}
            </div>
          </div>

          {/* Conditional Rendering */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">3. Conditional Rendering dengan {"<Can>"}</h4>
            <div className="flex flex-wrap gap-2">
              <Can ability="pengajuan:create">
                <Button size="sm">Buat Pengajuan</Button>
              </Can>

              <Can ability="pengajuan:verify">
                <Button size="sm" variant="outline">
                  Verifikasi
                </Button>
              </Can>

              <Can anyOf={["pengajuan:approve", "pengajuan:approve-unit"]}>
                <Button size="sm" variant="default">
                  Approve
                </Button>
              </Can>

              <Can ability="pengajuan:reject">
                <Button size="sm" variant="destructive">
                  Reject
                </Button>
              </Can>

              <Can ability="laporan:generate">
                <Button size="sm" variant="secondary">
                  Generate Laporan
                </Button>
              </Can>

              <Can ability="pengaturan:manage">
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Pengaturan
                </Button>
              </Can>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Button hanya muncul jika Anda punya permission yang sesuai
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Use Cases Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Contoh Use Cases</CardTitle>
          <CardDescription>Implementasi RBAC di berbagai skenario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pengajuan Workflow */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">📝 Workflow Pengajuan</h4>
            <div className="space-y-2 text-sm">
              <WorkflowStep
                step="1"
                label="Pegawai buat pengajuan"
                ability="pengajuan:create"
                canDo={can("pengajuan:create")}
              />
              <WorkflowStep
                step="2"
                label="Kepegawaian/Verifikator verifikasi"
                ability="pengajuan:verify"
                canDo={can("pengajuan:verify")}
              />
              <WorkflowStep
                step="3"
                label="PJ Unit approve (level unit)"
                ability="pengajuan:approve-unit"
                canDo={can("pengajuan:approve-unit")}
              />
              <WorkflowStep
                step="4"
                label="Bendahara approve pembayaran"
                ability="pengajuan:approve"
                canDo={can("pengajuan:approve")}
              />
              <WorkflowStep
                step="5"
                label="UPT Remunerasi final approve"
                ability="pengajuan:approve-final"
                canDo={can("pengajuan:approve-final")}
              />
            </div>
          </div>

          {/* Data Access */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">👁️ Level Akses Data</h4>
            <div className="space-y-2 text-sm">
              <AccessLevel
                label="Lihat data sendiri"
                abilities={["pengajuan:read-own"]}
                canDo={can("pengajuan:read-own")}
              />
              <AccessLevel
                label="Lihat data unit"
                abilities={["pengajuan:read-unit", "pegawai:read-unit"]}
                canDo={canAny(["pengajuan:read-unit", "pegawai:read-unit"])}
              />
              <AccessLevel
                label="Lihat semua data"
                abilities={["pengajuan:read-all", "pegawai:read-all"]}
                canDo={canAny(["pengajuan:read-all", "pegawai:read-all"])}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper Components
function PermissionCheck({ ability }: { ability: string }) {
  const { can } = useRBAC()
  const hasPermission = can(ability)

  return (
    <div className="flex items-center justify-between text-sm">
      <code className="text-xs bg-muted px-2 py-1 rounded">{ability}</code>
      {hasPermission ? (
        <Badge variant="default" className="flex items-center gap-1">
          <Check className="w-3 h-3" />
          Granted
        </Badge>
      ) : (
        <Badge variant="secondary" className="flex items-center gap-1">
          <X className="w-3 h-3" />
          Denied
        </Badge>
      )}
    </div>
  )
}

function WorkflowStep({
  step,
  label,
  ability,
  canDo,
}: {
  step: string
  label: string
  ability: string
  canDo: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
        {step}
      </div>
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        <code className="text-xs text-muted-foreground">{ability}</code>
      </div>
      {canDo ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  )
}

function AccessLevel({
  label,
  abilities,
  canDo,
}: {
  label: string
  abilities: string[]
  canDo: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{abilities.join(" atau ")}</div>
      </div>
      {canDo ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  )
}

function getResourceIcon(resource: string) {
  switch (resource) {
    case "pengajuan":
      return <FileText className="w-4 h-4" />
    case "pegawai":
      return <Users className="w-4 h-4" />
    case "pembayaran":
      return <DollarSign className="w-4 h-4" />
    case "pengaturan":
      return <Settings className="w-4 h-4" />
    default:
      return <Shield className="w-4 h-4" />
  }
}
