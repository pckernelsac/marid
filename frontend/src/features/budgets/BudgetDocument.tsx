import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Stethoscope } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { BUDGET_STATUS_META, type Budget, type ClinicSettings } from "./hooks";

interface Props {
  budget: Budget;
  clinic?: ClinicSettings;
}

export function BudgetDocument({ budget, clinic }: Props) {
  const status = BUDGET_STATUS_META[budget.status];
  return (
    <div className="mx-auto w-full max-w-[820px] bg-white p-10 text-slate-800 print:p-0 print:shadow-none">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {clinic?.name ?? "Madrid Dental Studio"}
            </h1>
            <p className="text-xs text-slate-500">
              {clinic?.address ?? "—"}
              {clinic?.phone ? ` · ${clinic.phone}` : ""}
            </p>
            {clinic?.ruc && (
              <p className="text-xs text-slate-500">RUC: {clinic.ruc}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">PRESUPUESTO</p>
          <p className="text-sm font-medium text-primary">{budget.code}</p>
          <p className="text-xs text-slate-500">
            {format(new Date(budget.issue_date), "dd 'de' MMMM yyyy", {
              locale: es,
            })}
          </p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Patient */}
      <div className="py-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">Paciente</p>
        <p className="text-base font-medium">{budget.patient_name}</p>
      </div>

      {/* Items */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-slate-200 text-left text-xs uppercase text-slate-400">
            <th className="py-2">Descripción</th>
            <th className="py-2 text-center">Pza</th>
            <th className="py-2 text-center">Cant.</th>
            <th className="py-2 text-right">P. Unit.</th>
            <th className="py-2 text-right">Importe</th>
          </tr>
        </thead>
        <tbody>
          {budget.items.map((it) => (
            <tr key={it.id} className="border-b border-slate-100">
              <td className="py-2.5">{it.description}</td>
              <td className="py-2.5 text-center text-slate-500">
                {it.tooth_fdi || "—"}
              </td>
              <td className="py-2.5 text-center tabular-nums">{it.quantity}</td>
              <td className="py-2.5 text-right tabular-nums">
                {formatCurrency(it.unit_price)}
              </td>
              <td className="py-2.5 text-right tabular-nums">
                {formatCurrency(it.line_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-5 flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span className="tabular-nums">{formatCurrency(budget.subtotal)}</span>
          </div>
          {budget.discount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Descuento</span>
              <span className="tabular-nums">
                −{formatCurrency(budget.discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(budget.total)}</span>
          </div>
        </div>
      </div>

      {budget.notes && (
        <div className="mt-8 rounded-lg bg-slate-50 p-4 text-sm">
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">
            Notas
          </p>
          <p className="whitespace-pre-line text-slate-600">{budget.notes}</p>
        </div>
      )}

      <div className="mt-16 flex justify-between text-center text-xs text-slate-500">
        <div className="w-48 border-t border-slate-300 pt-1">Paciente</div>
        <div className="w-48 border-t border-slate-300 pt-1">
          {clinic?.name ?? "Madrid Dental Studio"}
        </div>
      </div>
    </div>
  );
}
