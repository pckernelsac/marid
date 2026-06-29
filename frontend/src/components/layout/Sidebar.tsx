import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  FileImage,
  LayoutDashboard,
  Receipt,
  Settings,
  Stethoscope,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/pacientes", label: "Pacientes", icon: Users },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/odontograma", label: "Odontograma", icon: Activity },
  { to: "/historia", label: "Historia Clínica", icon: ClipboardList },
  { to: "/radiografias", label: "Radiografías", icon: FileImage },
  { to: "/tratamientos", label: "Tratamientos", icon: Stethoscope },
  { to: "/presupuestos", label: "Presupuestos", icon: Receipt },
  { to: "/caja", label: "Caja", icon: Wallet },
  { to: "/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/configuracion", label: "Configuración", icon: Settings },
];

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", collapsed ? "justify-center" : "px-2")}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-sm ring-1 ring-white/25">
        <Stethoscope className="h-5 w-5" />
      </div>
      {!collapsed && (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold tracking-tight text-white">
            Madrid Dental
          </p>
          <p className="text-xs text-white/70">Studio</p>
        </div>
      )}
    </div>
  );
}

function NavItems({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="mt-8 flex flex-1 flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-all",
              collapsed ? "justify-center px-0" : "gap-3 px-3",
              isActive
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sky-300" />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive ? "text-white" : "text-white/90 group-hover:text-white",
                )}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

/** Desktop sidebar with collapse. */
export function Sidebar() {
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "no-print relative z-10 hidden shrink-0 flex-col bg-[#003d9c] py-6 text-white shadow-xl transition-[width] duration-300 ease-in-out lg:flex",
        collapsed ? "w-[78px] px-2" : "w-64 px-4",
      )}
    >
      <Brand collapsed={collapsed} />

      <button
        onClick={toggle}
        title={collapsed ? "Expandir menú" : "Colapsar menú"}
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        className="absolute -right-3 top-9 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-[#003d9c] shadow-md transition hover:bg-slate-50"
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            collapsed && "rotate-180",
          )}
        />
      </button>

      <NavItems collapsed={collapsed} />

      {!collapsed && (
        <p className="px-3 text-[11px] text-white/50">v0.1 · Interno</p>
      )}
    </aside>
  );
}

/** Mobile sliding drawer. */
export function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <AnimatePresence>
      {mobileOpen && (
        <div className="lg:hidden">
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
          <motion.aside
            className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-[#003d9c] px-4 py-6 text-white shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between">
              <Brand collapsed={false} />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavItems collapsed={false} onNavigate={() => setMobileOpen(false)} />
            <p className="px-3 text-[11px] text-white/50">v0.1 · Interno</p>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
