import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import BrandingLogo from "@/components/BrandingLogo";
import { useBrandingContext } from "@/contexts/BrandingContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ClipboardList,
  Camera,
  Sparkles,
  FlaskConical,
  MessageCircle,
  User,
  LogOut,
  Shield,
  Building2,
  CalendarDays,
  Package,
} from "lucide-react";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Meu Calendário", url: "/calendar", icon: CalendarDays },
  { title: "Meu Armário", url: "/cabinet", icon: Package },
  { title: "Questionário", url: "/questionnaire", icon: ClipboardList },
  { title: "Análise de Pele", url: "/skin-analysis", icon: Camera },
  { title: "Minha Rotina", url: "/routine", icon: Sparkles },
];

const toolItems = [
  { title: "Análise de Produtos", url: "/products", icon: FlaskConical },
  { title: "Chat Luz", url: "/chat", icon: MessageCircle },
  { title: "Dicas Luz Skin", url: "/blog", icon: Sparkles },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { isSuperAdmin, isAdmin } = useUserRole();
  const { branding } = useBrandingContext();
  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuário";

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <BrandingLogo size="md" />
          <span className="font-serif text-lg font-semibold text-sidebar-foreground">{branding.site_name}</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
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

        {(isAdmin || isSuperAdmin) && (
          <SidebarGroup>
            <SidebarGroupLabel>Gestão</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/admin" end activeClassName="bg-sidebar-accent text-primary font-medium">
                        <Building2 className="h-4 w-4" />
                        <span>Painel Admin</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {isSuperAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/super-admin" end activeClassName="bg-sidebar-accent text-primary font-medium">
                        <Shield className="h-4 w-4" />
                        <span>Super Admin</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
