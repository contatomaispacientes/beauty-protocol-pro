import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FlaskConical, Package, CalendarDays, MessageCircle } from "lucide-react";

const items = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { to: "/products", icon: FlaskConical, label: "Analisar" },
  { to: "/cabinet", icon: Package, label: "Armário" },
  { to: "/calendar", icon: CalendarDays, label: "Calendário" },
  { to: "/chat", icon: MessageCircle, label: "Chat Luz" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação principal"
    >
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = pathname === it.to || pathname.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <NavLink
                to={it.to}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.6} />
                <span className="font-medium">{it.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
