import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Printer, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { BudgetFormPanel } from "@/features/budgets/BudgetFormPanel";
import {
  BUDGET_STATUS_META,
  useBudgets,
  useDeleteBudget,
  useUpdateBudget,
  type BudgetListItem,
  type BudgetStatus,
} from "@/features/budgets/hooks";

export function BudgetsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<BudgetStatus | "">("");
  const { data, isLoading } = useBudgets({ status });
  const update = useUpdateBudget();
  const del = useDeleteBudget();
  const [open, setOpen] = useState(false);

  const changeStatus = async (b: BudgetListItem, newStatus: BudgetStatus) => {
    try {
      await update.mutateAsync({ id: b.id, data: { status: newStatus } });
      toast.success("Estado actualizado");
    } catch {
      toast.error("No se pudo actualizar");
    }
  };

  const remove = async (b: BudgetListItem) => {
    if (!confirm(`¿Eliminar el presupuesto ${b.code}?`)) return;
    try {
      await del.mutateAsync(b.id);
      toast.success("Presupuesto eliminado");
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Presupuestos</h1>
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} presupuestos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as BudgetStatus | "")}
            className="w-44"
          >
            <option value="">Todos</option>
            <option value="draft">Borrador</option>
            <option value="sent">Enviado</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
          </Select>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Cargando…
            </div>
          ) : data && data.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3 font-medium">Código</th>
                    <th className="px-4 py-3 font-medium">Paciente</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.items.map((b) => {
                    const meta = BUDGET_STATUS_META[b.status];
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-medium text-primary">
                          {b.code}
                        </td>
                        <td className="px-4 py-3">{b.patient_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(b.issue_date), "dd MMM yyyy", {
                            locale: es,
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={b.status}
                            onChange={(e) =>
                              changeStatus(b, e.target.value as BudgetStatus)
                            }
                            className="h-8 w-32 text-xs"
                          >
                            <option value="draft">Borrador</option>
                            <option value="sent">Enviado</option>
                            <option value="approved">Aprobado</option>
                            <option value="rejected">Rechazado</option>
                          </Select>
                          <span className="sr-only">{meta.label}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {formatCurrency(b.total)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Ver / Imprimir"
                              onClick={() =>
                                navigate(`/presupuestos/${b.id}/imprimir`)
                              }
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Eliminar"
                              onClick={() => remove(b)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <FileText className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-muted-foreground">
                No hay presupuestos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <BudgetFormPanel open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
