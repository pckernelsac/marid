import { LogOut, Menu, Search, Stethoscope } from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";
import { initials } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

export function Topbar() {
  const { user, logout } = useAuth();
  const { setMobileOpen } = useSidebar();
  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-100 bg-white/70 px-6 backdrop-blur">
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#003d9c] text-white shadow-sm transition hover:bg-[#00347f] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Brand (mobile only — desktop shows it in the sidebar) */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003d9c] text-white shadow-sm">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight text-[#003d9c]">
            Madrid Dental
          </p>
          <p className="text-xs font-medium text-[#003d9c]/60">Studio</p>
        </div>
      </div>

      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Buscar paciente, tratamiento…"
          className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 pl-9 pr-3 text-sm outline-none transition focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/10"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium">{user?.full_name}</p>
          <p className="text-xs capitalize text-muted-foreground">{user?.role}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003d9c]/10 text-sm font-semibold text-[#003d9c]">
          {user ? initials(user.full_name) : "?"}
        </div>
        <button
          onClick={logout}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
