import { useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CashMovementPanel } from "@/features/cashbox/CashMovementPanel";
import {
  PAYMENT_METHOD_LABELS,
  useCashMovements,
  useCashSummary,
  useDeleteMovement,
} from "@/features/cashbox/hooks";

export function CajaPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [open, setOpen] = useState(false);

  const { data: summary } = useCashSummary(from, to);
  const { data: movements, isLoading } = useCashMovements(from, to);
  const del = useDeleteMovement();

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este movimiento?")) return;
    try {
      await del.mutateAsync(id);
      toast.success("Movimiento eliminado");
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Caja</h1>
          <p className="text-sm text-muted-foreground">
            Ingresos, egresos y arqueo
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Movimiento
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={ArrowUpCircle}
          label="Ingresos"
          value={formatCurrency(summary?.total_income ?? 0)}
          accent="text-emerald-600 bg-emerald-50"
        />
        <SummaryCard
          icon={ArrowDownCircle}
          label="Egresos"
          value={formatCurrency(summary?.total_expense ?? 0)}
          accent="text-rose-600 bg-rose-50"
        />
        <SummaryCard
          icon={Wallet}
          label="Balance"
          value={formatCurrency(summary?.balance ?? 0)}
          accent="text-sky-600 bg-sky-50"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Movimientos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                Cargando…
              </div>
            ) : movements && movements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-3 font-medium">Fecha</th>
                      <th className="px-4 py-3 font-medium">Concepto</th>
                      <th className="px-4 py-3 font-medium">Método</th>
                      <th className="px-4 py-3 text-right font-medium">Monto</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {movements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60">
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {format(new Date(m.movement_date), "dd MMM", {
                            locale: es,
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">
                            {m.concept}
                          </p>
                          {m.patient_name && (
                            <p className="text-xs text-muted-foreground">
                              {m.patient_name}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="bg-slate-100 text-slate-600">
                            {PAYMENT_METHOD_LABELS[m.payment_method]}
                          </Badge>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-medium tabular-nums ${
                            m.movement_type === "income"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {m.movement_type === "income" ? "+" : "−"}
                          {formatCurrency(m.amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(m.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-sm text-muted-foreground">
                Sin movimientos en el rango seleccionado.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Arqueo por método</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary && summary.income_by_method.length > 0 ? (
              summary.income_by_method.map((b) => (
                <div
                  key={b.payment_method}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-600">
                    {PAYMENT_METHOD_LABELS[b.payment_method]}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(b.total)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin ingresos registrados.
              </p>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold">
              <span>Total ingresos</span>
              <span className="tabular-nums text-emerald-600">
                {formatCurrency(summary?.total_income ?? 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <CashMovementPanel open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-xl p-3 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
