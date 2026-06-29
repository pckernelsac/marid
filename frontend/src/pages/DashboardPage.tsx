import { motion } from "framer-motion";
import {
  Activity,
  CalendarCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

/**
 * NOTE: the figures below are illustrative until the `/reports` endpoints
 * are wired. The layout is production-ready and consumes a typed shape.
 */
const STATS = [
  {
    label: "Pacientes atendidos hoy",
    value: "12",
    icon: Users,
    accent: "text-sky-600 bg-sky-50",
  },
  {
    label: "Citas pendientes",
    value: "8",
    icon: CalendarCheck,
    accent: "text-violet-600 bg-violet-50",
  },
  {
    label: "Ingresos del día",
    value: formatCurrency(2480),
    icon: TrendingUp,
    accent: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "Tratamientos realizados",
    value: "19",
    icon: Activity,
    accent: "text-amber-600 bg-amber-50",
  },
];

const REVENUE = [
  { day: "Lun", value: 1800 },
  { day: "Mar", value: 2200 },
  { day: "Mié", value: 1950 },
  { day: "Jue", value: 2600 },
  { day: "Vie", value: 2480 },
  { day: "Sáb", value: 3100 },
];

const RECENT = [
  { name: "María Gómez", action: "Resina en pieza 26", time: "Hace 12 min" },
  { name: "Carlos Ruiz", action: "Control de endodoncia", time: "Hace 40 min" },
  { name: "Ana Torres", action: "Profilaxis completa", time: "Hace 1 h" },
  { name: "Jorge Díaz", action: "Extracción pieza 38", time: "Hace 2 h" },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen de la actividad de Madrid Dental Studio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-xl p-3 ${s.accent}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight">
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
          <CardHeader>
            <CardTitle>Ingresos de la semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={REVENUE} margin={{ left: -16, right: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="#94a3b8"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="#94a3b8"
                />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {RECENT.map((r) => (
              <div key={r.name} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.action}
                  </p>
                </div>
                <span className="ml-auto whitespace-nowrap text-xs text-slate-400">
                  {r.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
