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
import { UserPlusIcon, Loader2, SearchIcon, MailIcon, PhoneIcon, ShieldCheckIcon, FilterIcon, PencilIcon, Trash2Icon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useUsersStore } from "@/logic/application/store/useUsersStore"
import { useFilteredUsers } from "@/logic/application/use-cases/useFilteredUsers"
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
  const { users: filteredUsers, isLoading } = useFilteredUsers();
  const { 
    searchQuery, 
    setSearchQuery, 
    isCreateDialogOpen, 
    setIsCreateDialogOpen 
  } = useUsersStore();

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
            
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
   
          <div className="min-h-[100vh] flex-1 rounded-xl bg-background border shadow-sm md:min-h-min p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Usuarios Registrados</h2>
                <p className="text-muted-foreground">Administra las cuentas y permisos de acceso del sistema.</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger
                render={
                  <Button size="sm">
                    <UserPlusIcon className="mr-2 h-4 w-4" />
                    Nuevo Usuario
                  </Button>
                }
              />
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
              <div className="flex w-full sm:w-auto items-center gap-2">
                <div className="relative w-full sm:w-auto flex-1">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar usuarios..."
                    className="w-full sm:w-64 pl-9 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="outline" size="icon" className="shrink-0 bg-yellow-100 border-yellow-200 text-yellow-600 hover:bg-yellow-200 hover:text-yellow-700 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-400 dark:hover:bg-yellow-500/20">
                        <FilterIcon className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel>Filtrar por Rol</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked={true}>
                      Admin
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={false}>
                      Conductor
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={false}>
                      Padre
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      <TableHead className="font-bold text-center ">Estado</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((user) => (
                      <TableRow key={user.props.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{user.props.fullName || "Sin nombre"}</TableCell>
                        <TableCell className="text-muted-foreground">{user.props.email}</TableCell>
                        <TableCell>{getRoleBadge(user.props.role)}</TableCell>
                        <TableCell className="text-center">
                           <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5">Activo</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 bg-blue-100 border-blue-200 text-blue-600 hover:bg-blue-200 hover:text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/20">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 bg-red-100 border-red-200 text-red-600 hover:bg-red-200 hover:text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/20">
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          {searchQuery ? "No se encontraron usuarios que coincidan con la búsqueda." : "No hay usuarios registrados actualmente."}
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
