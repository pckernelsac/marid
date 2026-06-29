import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SidePanel } from "@/components/ui/side-panel";
import { PatientSelect } from "@/components/PatientSelect";
import {
  PAYMENT_METHOD_LABELS,
  useCreateMovement,
  type MovementType,
  type PaymentMethod,
} from "./hooks";

export function CashMovementPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const create = useCreateMovement();
  const [type, setType] = useState<MovementType>("income");
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [patient, setPatient] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const reset = () => {
    setType("income");
    setConcept("");
    setAmount("");
    setMethod("cash");
    setDate(new Date().toISOString().slice(0, 10));
    setPatient(null);
    setNotes("");
  };

  const submit = async () => {
    if (!concept || !Number(amount)) {
      toast.error("Concepto y monto son obligatorios");
      return;
    }
    try {
      await create.mutateAsync({
        movement_type: type,
        concept,
        amount: Number(amount),
        payment_method: method,
        movement_date: date,
        patient_id: patient,
        notes: notes || null,
      });
      toast.success("Movimiento registrado");
      reset();
      onClose();
    } catch {
      toast.error("No se pudo registrar");
    }
  };

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Nuevo movimiento"
      description="Registra un ingreso o egreso de caja"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? "Guardando…" : "Registrar"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("income")}
            className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
              type === "income"
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-500"
            }`}
          >
            Ingreso
          </button>
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
              type === "expense"
                ? "border-rose-400 bg-rose-50 text-rose-700"
                : "border-slate-200 text-slate-500"
            }`}
          >
            Egreso
          </button>
        </div>

        <div className="space-y-2">
          <Label>Concepto</Label>
          <Input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Ej. Pago de tratamiento, compra de insumos…"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Monto (S/)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Método</Label>
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
        </div>

        <div className="space-y-2">
          <Label>Fecha</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {type === "income" && (
          <div className="space-y-2">
            <Label>Paciente (opcional)</Label>
            <PatientSelect value={patient} onChange={(id) => setPatient(id)} />
          </div>
        )}

        <div className="space-y-2">
          <Label>Notas</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </SidePanel>
  );
}
