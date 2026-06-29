import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck,
  Clock,
  CreditCard,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncomeMethodChart } from "@/features/dashboard/IncomeMethodChart";
import { RevenueChart } from "@/features/dashboard/RevenueChart";
import { useDashboardSummary } from "@/features/dashboard/hooks";
import { formatCurrency } from "@/lib/utils";

const TREATMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En proceso",
  finished: "Finalizado",
};

const APPT_STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-sky-50 text-sky-700",
  confirmed: "bg-violet-50 text-violet-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
  no_show: "bg-slate-100 text-slate-500",
};

const APPT_STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No asistió",
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return "Ayer";
  if (diffD < 7) return `Hace ${diffD} días`;
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
  });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboardSummary();

  const stats = [
    {
      label: "Pacientes atendidos hoy",
      value: data ? String(data.patients_today) : "—",
      icon: Users,
      accent: "text-sky-600",
      ring: "from-sky-500/10 to-sky-500/0",
    },
    {
      label: "Citas pendientes",
      value: data ? String(data.appointments_pending) : "—",
      icon: CalendarCheck,
      accent: "text-violet-600",
      ring: "from-violet-500/10 to-violet-500/0",
    },
    {
      label: "Ingresos del día",
      value: data ? formatCurrency(data.income_today) : "—",
      icon: TrendingUp,
      accent: "text-emerald-600",
      ring: "from-emerald-500/10 to-emerald-500/0",
    },
    {
      label: "Tratamientos de hoy",
      value: data ? String(data.treatments_today) : "—",
      icon: Activity,
      accent: "text-amber-600",
      ring: "from-amber-500/10 to-amber-500/0",
    },
  ];

  const hasMethodData =
    (data?.income_by_method_month?.length ?? 0) > 0 &&
    (data?.income_month ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumen de la actividad de Madrid Dental Studio.
          </p>
        </div>
        {data && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Ingresos mes: {formatCurrency(data.income_month)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 font-medium text-rose-700">
              <ArrowDownRight className="h-3.5 w-3.5" />
              Egresos mes: {formatCurrency(data.expense_month)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              {data.new_patients_month} pacientes nuevos
            </span>
          </div>
        )}
      </div>

      {isError && (
        <Card>
          <CardContent className="p-5 text-sm text-rose-600">
            No se pudo cargar el resumen del dashboard. Intenta recargar la
            página.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
              <div
                className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.ring}`}
              />
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-xl bg-slate-50 p-3 ${s.accent}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-2xl font-semibold tracking-tight ${
                      isLoading ? "animate-pulse text-slate-300" : ""
                    }`}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Flujo de caja</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Ingresos y egresos · últimos 7 días
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {data && data.revenue_week.some((p) => p.income || p.expense) ? (
              <RevenueChart data={data.revenue_week} />
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                {isLoading
                  ? "Cargando…"
                  : "Sin movimientos registrados esta semana."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Ingresos por método</CardTitle>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            {hasMethodData ? (
              <IncomeMethodChart data={data!.income_by_method_month} />
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                {isLoading
                  ? "Cargando…"
                  : "Sin ingresos registrados este mes."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Agenda de hoy</CardTitle>
            <Link
              to="/agenda"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver agenda
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <p className="text-sm text-muted-foreground">Cargando…</p>
            )}
            {!isLoading && data?.today_appointments.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay citas programadas para hoy.
              </p>
            )}
            <div className="space-y-2">
              {data?.today_appointments.map((a) => (
                <Link
                  key={a.id}
                  to="/agenda"
                  className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-slate-700">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {timeLabel(a.starts_at)}
                  </span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: a.color ?? "#3b82f6" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {a.patient_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.title}
                    </p>
                  </div>
                  <span
                    className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                      APPT_STATUS_STYLES[a.status] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {APPT_STATUS_LABELS[a.status] ?? a.status}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <p className="text-sm text-muted-foreground">Cargando…</p>
            )}
            {!isLoading && data?.recent_activity.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aún no hay tratamientos registrados.
              </p>
            )}
            {data?.recent_activity.map((r, i) => (
              <Link
                key={`${r.patient_id}-${i}`}
                to={`/pacientes/${r.patient_public_id}`}
                className="-mx-2 flex items-start gap-3 rounded-md px-2 py-1 transition hover:bg-slate-50"
              >
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {r.patient_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.procedure}
                    {r.tooth_fdi ? ` · pieza ${r.tooth_fdi}` : ""} ·{" "}
                    {TREATMENT_STATUS_LABELS[r.status] ?? r.status}
                  </p>
                </div>
                <span className="ml-auto whitespace-nowrap text-xs text-slate-400">
                  {relativeTime(r.created_at)}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
