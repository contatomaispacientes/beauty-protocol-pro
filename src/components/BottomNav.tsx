import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, CalendarDays, MessageCircle, ScanLine, type LucideIcon } from "lucide-react";

const sideItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { to: "/cabinet", icon: Package, label: "Armário" },
  { to: "/calendar", icon: CalendarDays, label: "Calendário" },
  { to: "/chat", icon: MessageCircle, label: "Chat Luz" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  const left = sideItems.slice(0, 2);
  const right = sideItems.slice(2);
  const analyzeActive = isActive("/products");

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação principal"
    >
      <div className="relative">
        <ul className="grid grid-cols-5 items-end">
          {left.map((it) => (
            <NavItem key={it.to} {...it} active={isActive(it.to)} />
          ))}

          {/* Espaço reservado para o botão central elevado */}
          <li aria-hidden className="h-14" />

          {right.map((it) => (
            <NavItem key={it.to} {...it} active={isActive(it.to)} />
          ))}
        </ul>

        {/* Botão central destacado */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center pointer-events-none">
          <NavLink
            to="/products"
            aria-label="Analisar produto"
            className={`pointer-events-auto flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-[0_12px_30px_-8px_hsl(var(--primary)/0.55)] ring-4 ring-background transition-transform active:scale-95 ${
              analyzeActive ? "scale-105" : ""
            }`}
          >
            <ScanLine className="w-7 h-7" strokeWidth={2} />
          </NavLink>
          <span
            className={`pointer-events-auto mt-1 text-[10px] font-semibold uppercase tracking-wider ${
              analyzeActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Analisar
          </span>
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <li>
      <NavLink
        to={to}
        className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] transition-colors ${
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.6} />
        <span className="font-medium">{label}</span>
      </NavLink>
    </li>
  );
}
