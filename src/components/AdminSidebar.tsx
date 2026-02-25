import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, CalendarCheck, FileText, Link2, LogOut, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const adminItems = [
  { title: "Painel", url: "/admin", icon: LayoutDashboard },
  { title: "Pacientes", url: "/admin/patients", icon: Users },
  { title: "Agendamentos", url: "/admin/appointments", icon: CalendarCheck },
  { title: "Relatórios", url: "/admin/reports", icon: FileText },
  { title: "Códigos de Convite", url: "/admin/invites", icon: Link2 },
];

export function AdminSidebar() {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Admin";

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-serif text-xs font-bold">D</span>
          </div>
          <div>
            <span className="font-serif text-lg font-semibold text-sidebar-foreground">DermAI</span>
            <span className="text-xs text-muted-foreground ml-2">Admin</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-3 py-2">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" asChild>
            <Link to="/dashboard"><ArrowLeft className="w-4 h-4 mr-2" />Voltar ao Dashboard</Link>
          </Button>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end activeClassName="bg-sidebar-accent text-primary font-medium">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-sidebar-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
