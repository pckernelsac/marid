import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SidePanel } from "@/components/ui/side-panel";
import { formatCurrency } from "@/lib/utils";
import {
  PAYMENT_METHOD_LABELS,
  useCreateMovement,
  type PaymentMethod,
} from "@/features/cashbox/hooks";
import type { Treatment } from "./hooks";

interface Props {
  treatment: Treatment | null;
  onClose: () => void;
}

export function PaymentPanel({ treatment, onClose }: Props) {
  const create = useCreateMovement();
  const pending = treatment
    ? Math.max(treatment.cost - treatment.paid_amount, 0)
    : 0;

  const [amount, setAmount] = useState("0");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (treatment) {
      setAmount(String(pending || treatment.cost));
      setMethod("cash");
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [treatment, pending]);

  const submit = async () => {
    if (!treatment) return;
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    try {
      await create.mutateAsync({
        movement_type: "income",
        concept: `Pago: ${treatment.procedure}`,
        amount: value,
        payment_method: method,
        movement_date: date,
        patient_id: treatment.patient_id,
        treatment_id: treatment.id,
      });
      toast.success("Pago registrado en caja");
      onClose();
    } catch {
      toast.error("No se pudo registrar el pago");
    }
  };

  return (
    <SidePanel
      open={Boolean(treatment)}
      onClose={onClose}
      title="Registrar pago"
      description={treatment?.procedure}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? "Registrando…" : "Cobrar"}
          </Button>
        </div>
      }
    >
      {treatment && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Costo" value={formatCurrency(treatment.cost)} />
            <Stat
              label="Pagado"
              value={formatCurrency(treatment.paid_amount)}
              accent="text-emerald-600"
            />
            <Stat
              label="Saldo"
              value={formatCurrency(pending)}
              accent="text-amber-600"
            />
          </div>

          <div className="space-y-2">
            <Label>Monto a cobrar (S/)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <Select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            >
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      )}
    </SidePanel>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className={`text-sm font-semibold ${accent ?? ""}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
