import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserCreateForm } from "@/components/user-create-form"
import { UserPlusIcon, Loader2, MailIcon, PhoneIcon, ShieldCheckIcon } from "lucide-react"
import { useState } from "react"
import { useUsersQuery } from "@/logic/application/queries/useUsersQuery"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function UsersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: users, isLoading } = useUsersQuery();
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN": return <Badge variant="default">Admin</Badge>;
      case "DRIVER": return <Badge variant="secondary">Conductor</Badge>;
      case "PARENT": return <Badge variant="outline">Padre</Badge>;
      default: return <Badge variant="ghost">{role}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Gestión de Usuarios</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlusIcon className="mr-2 h-4 w-4" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Ingresa los datos para registrar un nuevo usuario en el sistema.
                  </DialogDescription>
                </DialogHeader>
                <UserCreateForm onSuccess={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
   
          <div className="min-h-[100vh] flex-1 rounded-xl bg-background border shadow-sm md:min-h-min p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Usuarios Registrados</h2>
                <p className="text-muted-foreground">Administra las cuentas y permisos de acceso del sistema.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">Nombre Completo</TableHead>
                      <TableHead className="font-bold">Email</TableHead>
                      <TableHead className="font-bold">Rol</TableHead>
                      <TableHead className="font-bold">Teléfono</TableHead>
                      <TableHead className="font-bold text-right">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.props.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{user.props.fullName || user.props.fullName || "Sin nombre"}</TableCell>
                        <TableCell className="text-muted-foreground">{user.props.email}</TableCell>
                        <TableCell>{getRoleBadge(user.props.role)}</TableCell>
                        <TableCell className="text-muted-foreground">{user.props.phoneNumber || "-"}</TableCell>
                        <TableCell className="text-right">
                           <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5">Activo</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No hay usuarios registrados actualmente.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
