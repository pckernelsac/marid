import { Receipt, TrendingUp, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

import {
  type AccountPayment,
  type AccountTreatment,
  type PaymentMethod,
  type TreatmentStatus,
  usePatientAccount,
} from "./hooks";

const STATUS_LABELS: Record<TreatmentStatus, string> = {
  pending: "Pendiente",
  in_progress: "En proceso",
  finished: "Finalizado",
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  yape: "Yape",
  plin: "Plin",
  other: "Otro",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function pendingBadge(t: AccountTreatment) {
  if (t.pending <= 0) {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Pagado
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
      {formatCurrency(t.pending)}
    </span>
  );
}

export function PatientAccount({ patientId }: { patientId: number }) {
  const { data, isLoading, isError } = usePatientAccount(patientId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          Cargando estado de cuenta…
        </CardContent>
      </Card>
    );
  }
  if (isError || !data) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-rose-600">
          No se pudo cargar el estado de cuenta.
        </CardContent>
      </Card>
    );
  }

  const owes = data.balance > 0;

  return (
    <div className="space-y-5">
      {/* Resumen */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total tratado"
          value={formatCurrency(data.total_charged)}
          icon={Receipt}
          accent="text-slate-600 bg-slate-100"
        />
        <SummaryCard
          label="Total pagado"
          value={formatCurrency(data.total_paid)}
          icon={TrendingUp}
          accent="text-emerald-600 bg-emerald-50"
        />
        <SummaryCard
          label={owes ? "Saldo pendiente" : "Saldo a favor"}
          value={formatCurrency(Math.abs(data.balance))}
          icon={Wallet}
          accent={
            owes ? "text-rose-600 bg-rose-50" : "text-sky-600 bg-sky-50"
          }
        />
      </div>

      {/* Tratamientos */}
      <Card>
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold">Tratamientos</h3>
        </div>
        {data.treatments.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Sin tratamientos registrados.
          </p>
        ) : (
          <>
            {/* Tabla (desktop) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-medium">Procedimiento</th>
                    <th className="px-5 py-3 font-medium">Fecha</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                    <th className="px-5 py-3 text-right font-medium">Costo</th>
                    <th className="px-5 py-3 text-right font-medium">Pagado</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Pendiente
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.treatments.map((t) => (
                    <tr key={t.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <p className="font-medium">{t.procedure}</p>
                        {t.tooth_fdi && (
                          <p className="text-xs text-muted-foreground">
                            Pieza {t.tooth_fdi}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {formatDate(t.treatment_date)}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {STATUS_LABELS[t.status]}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-600">
                        {formatCurrency(t.cost)}
                      </td>
                      <td className="px-5 py-3 text-right text-emerald-600">
                        {formatCurrency(t.paid)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {pendingBadge(t)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas (móvil) */}
            <div className="space-y-3 p-4 md:hidden">
              {data.treatments.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-slate-100 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{t.procedure}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(t.treatment_date)} ·{" "}
                        {STATUS_LABELS[t.status]}
                      </p>
                    </div>
                    {pendingBadge(t)}
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>Costo {formatCurrency(t.cost)}</span>
                    <span className="text-emerald-600">
                      Pagado {formatCurrency(t.paid)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Pagos */}
      <Card>
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold">Historial de pagos</h3>
        </div>
        {data.payments.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Aún no se han registrado pagos.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.payments.map((p) => (
              <PaymentRow key={p.id} payment={p} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function PaymentRow({ payment }: { payment: AccountPayment }) {
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Wallet className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{payment.concept}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(payment.movement_date)} ·{" "}
          {METHOD_LABELS[payment.payment_method]}
        </p>
      </div>
      <span className="whitespace-nowrap text-sm font-semibold text-emerald-600">
        +{formatCurrency(payment.amount)}
      </span>
    </li>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-xl p-3 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
