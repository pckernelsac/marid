import { CreditCard, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  TREATMENT_STATUS_META,
  type Treatment,
} from "./hooks";

interface Props {
  treatments: Treatment[];
  showPatient?: boolean;
  onEdit: (t: Treatment) => void;
  onPay: (t: Treatment) => void;
  onDelete: (t: Treatment) => void;
}

export function TreatmentsTable({
  treatments,
  showPatient,
  onEdit,
  onPay,
  onDelete,
}: Props) {
  if (treatments.length === 0) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        No hay tratamientos registrados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
            {showPatient && <th className="px-4 py-3 font-medium">Paciente</th>}
            <th className="px-4 py-3 font-medium">Pieza</th>
            <th className="px-4 py-3 font-medium">Diagnóstico / Procedimiento</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 text-right font-medium">Costo</th>
            <th className="px-4 py-3 text-right font-medium">Pagado</th>
            <th className="px-4 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {treatments.map((t) => {
            const meta = TREATMENT_STATUS_META[t.status];
            const fullyPaid = t.paid_amount >= t.cost && t.cost > 0;
            return (
              <tr key={t.id} className="transition hover:bg-slate-50/60">
                {showPatient && (
                  <td className="px-4 py-3 font-medium">{t.patient_name}</td>
                )}
                <td className="px-4 py-3">
                  {t.tooth_fdi ? (
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium tabular-nums">
                      {t.tooth_fdi}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{t.procedure}</p>
                  <p className="text-xs text-muted-foreground">{t.diagnosis}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={meta.className}>{meta.label}</Badge>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatCurrency(t.cost)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className={fullyPaid ? "text-emerald-600" : ""}>
                    {formatCurrency(t.paid_amount)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Cobrar"
                      onClick={() => onPay(t)}
                      disabled={fullyPaid}
                    >
                      <CreditCard className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar"
                      onClick={() => onEdit(t)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Eliminar"
                      onClick={() => onDelete(t)}
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
  );
}
