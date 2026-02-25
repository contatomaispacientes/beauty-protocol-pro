import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Building2, Settings, BarChart3, LogOut, User, Shield } from "lucide-react";

const superAdminItems = [
  { title: "Visão Geral", url: "/super-admin", icon: LayoutDashboard },
  { title: "Usuários", url: "/super-admin/users", icon: Users },
  { title: "Tenants (Clínicas)", url: "/super-admin/tenants", icon: Building2 },
  { title: "Estatísticas", url: "/super-admin/stats", icon: BarChart3 },
  { title: "Funcionalidades", url: "/super-admin/features", icon: Settings },
  { title: "Plataforma", url: "/super-admin/platform", icon: Shield },
];

export function SuperAdminSidebar() {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Super Admin";

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
            <span className="text-destructive-foreground font-serif text-xs font-bold">SA</span>
          </div>
          <div>
            <span className="font-serif text-lg font-semibold text-sidebar-foreground">DermAI</span>
            <span className="text-xs text-destructive ml-2 font-medium">Super Admin</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {superAdminItems.map((item) => (
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
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <User className="w-4 h-4 text-destructive" />
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
