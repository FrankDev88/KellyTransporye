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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PlusIcon, SearchIcon, Loader2, MapIcon, PencilIcon, Trash2Icon, RouteIcon } from "lucide-react"
import { useRoutesStore } from "@/logic/application/store/useRoutesStore"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createRouteTemplateSchema, type CreateRouteTemplateData } from "@/logic/domain/schemas/routeSchema"
import { useCreateTemplateMutation } from "@/logic/application/queries/mutations/useCreateTemplateMutation"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ——————————————————————————————————————
// Create Template Form (inline)
// ——————————————————————————————————————
function RouteTemplateForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: createTemplate, isPending } = useCreateTemplateMutation()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateRouteTemplateData>({
    resolver: zodResolver(createRouteTemplateSchema),
    defaultValues: { name: "", type: "HOME_TO_SCHOOL", childrenIds: [] },
  })

  const [childIdsText, setChildIdsText] = React.useState("")
  const selectedType = watch("type")

  const onSubmit = (data: CreateRouteTemplateData) => {
    createTemplate(data, {
      onSuccess: (result) => {
        if (result.isSuccess) {
          reset()
          setChildIdsText("")
          onSuccess()
        }
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="py-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Nombre de la Ruta</FieldLabel>
          <Input id="name" placeholder="Ej. Ruta 05 - Sector Norte" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="type">Tipo de Ruta</FieldLabel>
          <Select
            value={selectedType}
            onValueChange={(val) => setValue("type", val as "HOME_TO_SCHOOL" | "SCHOOL_TO_HOME")}
          >
            <SelectTrigger id="type" className="w-full h-9">
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="HOME_TO_SCHOOL">🏠 → 🏫 Casa a Escuela</SelectItem>
                <SelectItem value="SCHOOL_TO_HOME">🏫 → 🏠 Escuela a Casa</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError errors={[errors.type]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="estimatedDuration">Duración Estimada (opcional)</FieldLabel>
          <Input id="estimatedDuration" placeholder="Ej. 45 minutes" {...register("estimatedDuration")} />
          <FieldError errors={[errors.estimatedDuration]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="childrenIds">
            IDs de Niños (UUID, uno por línea)
          </FieldLabel>
          <textarea
            id="childrenIds"
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            placeholder={"cccc1111-...\ncccc2222-..."}
            value={childIdsText}
            onChange={(e) => {
              setChildIdsText(e.target.value)
              const ids = e.target.value.split("\n").map(s => s.trim()).filter(Boolean)
              setValue("childrenIds", ids)
            }}
          />
          <FieldError errors={[errors.childrenIds]} />
        </Field>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear Plantilla
        </Button>
      </FieldGroup>
    </form>
  )
}

// ——————————————————————————————————————
// Mock data (mientras se conecta al backend)
// ——————————————————————————————————————
const mockTemplates = [
  { id: "t1", name: "Ruta 01 - Sector Norte", type: "HOME_TO_SCHOOL", stops: 5, estimatedDuration: "40 minutes" },
  { id: "t2", name: "Ruta 02 - Centro", type: "SCHOOL_TO_HOME", stops: 3, estimatedDuration: "25 minutes" },
]

// ——————————————————————————————————————
// RoutesPage
// ——————————————————————————————————————
import * as React from "react"

export default function RoutesPage() {
  const { isCreateTemplateOpen, setIsCreateTemplateOpen, searchQuery, setSearchQuery } = useRoutesStore()

  const filtered = mockTemplates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTypeBadge = (type: string) =>
    type === "HOME_TO_SCHOOL"
      ? <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/5">🏠→🏫 Casa a Escuela</Badge>
      : <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/5">🏫→🏠 Escuela a Casa</Badge>

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
                <BreadcrumbPage>Plantillas de Ruta</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="min-h-screen flex-1 rounded-xl bg-background border shadow-sm md:min-h-min p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <RouteIcon className="h-6 w-6" />
                  Plantillas de Ruta
                </h2>
                <p className="text-muted-foreground">Administra los planes maestros de las rutas de transporte.</p>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
                  <DialogTrigger
                    render={
                      <Button size="sm">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Nueva Plantilla
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle>Crear Plantilla de Ruta</DialogTitle>
                      <DialogDescription>
                        Define el nombre, tipo y los niños asignados a esta ruta maestra.
                      </DialogDescription>
                    </DialogHeader>
                    <RouteTemplateForm onSuccess={() => setIsCreateTemplateOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="relative w-full sm:w-auto flex-1">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar plantillas..."
                  className="w-full sm:w-64 pl-9 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Nombre</TableHead>
                    <TableHead className="font-bold">Tipo</TableHead>
                    <TableHead className="font-bold text-center">Paradas</TableHead>
                    <TableHead className="font-bold">Duración Est.</TableHead>
                    <TableHead className="text-right w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{getTypeBadge(t.type)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{t.stops} paradas</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{t.estimatedDuration || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 bg-green-100 border-green-200 text-green-600 hover:bg-green-200 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400">
                            <MapIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 bg-blue-100 border-blue-200 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 bg-red-100 border-red-200 text-red-600 hover:bg-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No se encontraron plantillas de ruta.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
