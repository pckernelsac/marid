import { useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidePanel } from "@/components/ui/side-panel";
import { PatientSelect } from "@/components/PatientSelect";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { PaginatedTreatments } from "@/features/treatments/hooks";
import { useCreateBudget, type BudgetItem } from "./hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  fixedPatient?: { id: number; name: string };
}

type DraftItem = Omit<BudgetItem, "id" | "line_total">;

const emptyItem: DraftItem = {
  description: "",
  tooth_fdi: "",
  quantity: 1,
  unit_price: 0,
};

export function BudgetFormPanel({ open, onClose, fixedPatient }: Props) {
  const create = useCreateBudget();
  const [patient, setPatient] = useState<{ id: number; name: string } | null>(
    fixedPatient ?? null,
  );
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [items, setItems] = useState<DraftItem[]>([{ ...emptyItem }]);
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");

  const subtotal = items.reduce(
    (acc, it) => acc + it.quantity * it.unit_price,
    0,
  );
  const total = Math.max(subtotal - (Number(discount) || 0), 0);

  const setItem = (idx: number, patch: Partial<DraftItem>) =>
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const importTreatments = async () => {
    if (!patient) {
      toast.error("Selecciona un paciente primero");
      return;
    }
    try {
      const data = await apiFetch<PaginatedTreatments>(
        `/treatments?patient_id=${patient.id}&size=100`,
      );
      const imported: DraftItem[] = data.items.map((t) => ({
        description: `${t.procedure} — ${t.diagnosis}`,
        tooth_fdi: t.tooth_fdi ?? "",
        quantity: 1,
        unit_price: t.cost,
      }));
      if (imported.length === 0) {
        toast("Este paciente no tiene tratamientos");
        return;
      }
      setItems((arr) =>
        [...arr.filter((it) => it.description), ...imported],
      );
      toast.success(`${imported.length} tratamiento(s) importado(s)`);
    } catch {
      toast.error("No se pudo importar");
    }
  };

  const reset = () => {
    setPatient(fixedPatient ?? null);
    setIssueDate(new Date().toISOString().slice(0, 10));
    setItems([{ ...emptyItem }]);
    setDiscount("0");
    setNotes("");
  };

  const submit = async () => {
    if (!patient) {
      toast.error("Selecciona un paciente");
      return;
    }
    const validItems = items.filter((it) => it.description.trim());
    if (validItems.length === 0) {
      toast.error("Agrega al menos un ítem");
      return;
    }
    try {
      await create.mutateAsync({
        patient_id: patient.id,
        issue_date: issueDate,
        discount: Number(discount) || 0,
        notes: notes || null,
        items: validItems.map((it) => ({
          description: it.description,
          tooth_fdi: it.tooth_fdi || null,
          quantity: Number(it.quantity) || 1,
          unit_price: Number(it.unit_price) || 0,
        })),
      });
      toast.success("Presupuesto creado");
      reset();
      onClose();
    } catch {
      toast.error("No se pudo crear el presupuesto");
    }
  };

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Nuevo presupuesto"
      description={patient?.name}
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="text-lg font-semibold">{formatCurrency(total)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={create.isPending}>
              {create.isPending ? "Guardando…" : "Crear presupuesto"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {!fixedPatient && (
          <div className="space-y-2">
            <Label>Paciente</Label>
            <PatientSelect
              value={patient?.id ?? null}
              onChange={(id, name) => setPatient({ id, name })}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Fecha de emisión</Label>
            <Input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={importTreatments}
            >
              <Download className="h-4 w-4" /> Importar tratamientos
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Ítems</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setItems((a) => [...a, { ...emptyItem }])}
            >
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 items-center gap-2 rounded-lg border border-slate-100 p-2"
              >
                <Input
                  className="col-span-5 h-9"
                  placeholder="Descripción"
                  value={it.description}
                  onChange={(e) => setItem(idx, { description: e.target.value })}
                />
                <Input
                  className="col-span-1 h-9 px-2 text-center"
                  placeholder="Pza"
                  value={it.tooth_fdi ?? ""}
                  onChange={(e) => setItem(idx, { tooth_fdi: e.target.value })}
                />
                <Input
                  className="col-span-2 h-9"
                  type="number"
                  min="1"
                  value={it.quantity}
                  onChange={(e) =>
                    setItem(idx, { quantity: Number(e.target.value) })
                  }
                />
                <Input
                  className="col-span-3 h-9"
                  type="number"
                  min="0"
                  step="0.01"
                  value={it.unit_price}
                  onChange={(e) =>
                    setItem(idx, { unit_price: Number(e.target.value) })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setItems((a) => a.filter((_, i) => i !== idx))
                  }
                  className="col-span-1 flex justify-center text-slate-400 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl bg-slate-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Descuento (S/)</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="h-9 w-32 text-right"
            />
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notas</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </SidePanel>
  );
}
