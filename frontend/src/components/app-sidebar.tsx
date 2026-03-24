import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  ListIcon,
  UsersIcon,
  FileChartColumnIcon,
  Settings2Icon,
  GraduationCapIcon,
  BusIcon,
  QrCodeIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Administrador",
    email: "admin@transporte.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      items: [],
    },
    {
      title: "Operación de Rutas",
      url: "#",
      icon: <ListIcon />,
      isActive: true,
      items: [
        { title: "Plantillas de Ruta", url: "/routes" },
        { title: "Viajes (Ejecución)", url: "/trips" },
        { title: "Vista Conductor", url: "/driver/demo" },
        { title: "Vehículos", url: "/vehicles" },
      ],
    },
    {
      title: "Gestión Escolar",
      url: "#",
      icon: <GraduationCapIcon />,
      items: [
        { title: "Estudiantes", url: "/children" },
      ],
    },
    {
      title: "Gafetes QR",
      url: "#",
      icon: <QrCodeIcon />,
      items: [
        { title: "Generador de QR", url: "/qr/generator" },
        { title: "Escáner QR", url: "/qr/scanner" },
      ],
    },
    {
      title: "Administración",
      url: "#",
      icon: <UsersIcon />,
      items: [
        { title: "Usuarios", url: "/users" },
      ],
    },
    {
      title: "Reportes",
      url: "/reports",
      icon: <FileChartColumnIcon />,
      items: [],
    },
    {
      title: "Configuración",
      url: "/settings",
      icon: <Settings2Icon />,
      items: [],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              render={<a href="/dashboard" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <BusIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">SistemaTransporte</span>
                <span className="truncate text-xs text-muted-foreground">Panel Administrativo</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
