import { useState } from "react";
import {
  Activity,
  CalendarDays,
  Download,
  Printer,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  downloadExcel,
  useReportSummary,
  type NamedCount,
} from "@/features/reports/hooks";

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444"];

function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export function ReportsPage() {
  const [from, setFrom] = useState(startOfMonthISO());
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [exporting, setExporting] = useState(false);
  const { data, isLoading } = useReportSummary(from, to);

  const handleExcel = async () => {
    setExporting(true);
    try {
      await downloadExcel(from, to);
      toast.success("Excel descargado");
    } catch {
      toast.error("No se pudo exportar");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
          <p className="text-sm text-muted-foreground">
            Indicadores del {format(new Date(from), "dd/MM/yyyy")} al{" "}
            {format(new Date(to), "dd/MM/yyyy")}
          </p>
        </div>
        <div className="no-print flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-40"
          />
          <span className="text-slate-400">→</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" onClick={handleExcel} disabled={exporting}>
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      {isLoading || !data ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Cargando indicadores…
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              icon={Users}
              label="Pacientes nuevos"
              value={String(data.new_patients)}
              hint={`${data.total_patients} en total`}
              accent="text-sky-600 bg-sky-50"
            />
            <Kpi
              icon={Activity}
              label="Tratamientos"
              value={String(data.treatments_total)}
              accent="text-violet-600 bg-violet-50"
            />
            <Kpi
              icon={CalendarDays}
              label="Citas"
              value={String(data.appointments_total)}
              accent="text-amber-600 bg-amber-50"
            />
            <Kpi
              icon={TrendingUp}
              label="Balance"
              value={formatCurrency(data.balance)}
              hint={`Ingresos ${formatCurrency(data.total_income)}`}
              accent="text-emerald-600 bg-emerald-50"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ingresos y egresos por día</CardTitle>
            </CardHeader>
            <CardContent>
              {data.revenue_series.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Sin movimientos en el periodo.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={data.revenue_series}
                    margin={{ left: -16, right: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis
                      dataKey="day"
                      tickFormatter={(d) => format(new Date(d), "dd/MM")}
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
                      labelFormatter={(d) => format(new Date(d), "dd/MM/yyyy")}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownCard
              title="Tratamientos por estado"
              rows={data.treatments_by_status}
            />
            <Card>
              <CardHeader>
                <CardTitle>Ingresos por método</CardTitle>
              </CardHeader>
              <CardContent>
                {data.income_by_method.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Sin ingresos.
                  </p>
                ) : (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="50%" height={180}>
                      <PieChart>
                        <Pie
                          data={data.income_by_method}
                          dataKey="amount"
                          nameKey="label"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={2}
                        >
                          {data.income_by_method.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number) => formatCurrency(v)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {data.income_by_method.map((m, i) => (
                        <div
                          key={m.label}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                background: PIE_COLORS[i % PIE_COLORS.length],
                              }}
                            />
                            {m.label}
                          </span>
                          <span className="font-medium tabular-nums">
                            {formatCurrency(m.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <BreakdownCard
              title="Citas por estado"
              rows={data.appointments_by_status}
            />
            <BreakdownCard
              title="Procedimientos más frecuentes"
              rows={data.top_procedures}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-xl p-3 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: NamedCount[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Sin datos.
          </p>
        ) : (
          rows.map((r) => (
            <div key={r.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{r.label}</span>
                <span className="font-medium tabular-nums">{r.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
