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
import { ChildCreateForm } from "@/components/child-create-form"
import { UserPlusIcon, Loader2, SearchIcon, FilterIcon, PencilIcon, Trash2Icon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useChildrenStore } from "@/logic/application/store/useChildrenStore"
import { useFilteredChildren } from "@/logic/application/use-cases/useFilteredChildren"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ChildrenPage() {
  const { children: filteredChildren, isLoading } = useFilteredChildren();
  const { 
    searchQuery, 
    setSearchQuery, 
    isCreateDialogOpen, 
    setIsCreateDialogOpen 
  } = useChildrenStore();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": 
        return <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/5">Pendiente</Badge>;
      case "ON_BOARD": 
        return <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/5">A Bordo</Badge>;
      case "COMPLETED": 
        return <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5">Completado</Badge>;
      case "ABSENCE_CONFIRMED": 
        return <Badge variant="outline" className="text-gray-500 border-gray-500/20 bg-gray-500/5">Ausencia</Badge>;
      case "MISSING_ALERT": 
        return <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/5">Alerta</Badge>;
      default: 
        return <Badge variant="ghost">{status}</Badge>;
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
                <BreadcrumbPage>Gestión de Estudiantes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
   
          <div className="min-h-screen flex-1 rounded-xl bg-background border shadow-sm md:min-h-min p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Estudiantes Registrados</h2>
                <p className="text-muted-foreground">Administra los niños, rutas y detalles de la geocerca.</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger
                render={
                  <Button size="sm">
                    <UserPlusIcon className="mr-2 h-4 w-4" />
                    Nuevo Estudiante
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Estudiante</DialogTitle>
                  <DialogDescription>
                    Ingresa los datos del menor para asignarle su tarjeta QR y validaciones de seguridad.
                  </DialogDescription>
                </DialogHeader>
                <ChildCreateForm onSuccess={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
              <div className="flex w-full sm:w-auto items-center gap-2">
                <div className="relative w-full sm:w-auto flex-1">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar estudiantes..."
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
                    <DropdownMenuLabel>Filtrar por Estado</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked={false}>A Bordo</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={false}>Completado</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={false}>Ausencia</DropdownMenuCheckboxItem>
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
                      <TableHead className="font-bold">Alumno</TableHead>
                      <TableHead className="font-bold">ID Padre</TableHead>
                      <TableHead className="font-bold">Dirección</TableHead>
                      <TableHead className="font-bold text-center w-[120px]">Estado</TableHead>
                      <TableHead className="text-right w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredChildren?.map((child) => (
                      <TableRow key={child.props.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{child.props.firstName} {child.props.lastName}</TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-[150px]" title={child.props.parentId}>{child.props.parentId}</TableCell>
                        <TableCell className="text-muted-foreground">{child.props.homeAddress}</TableCell>
                        <TableCell className="text-center">
                           {getStatusBadge(child.props.status)}
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
                    {filteredChildren?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          {searchQuery ? "No se encontraron estudiantes que coincidan con la búsqueda." : "No hay estudiantes registrados actualmente."}
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
