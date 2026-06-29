import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SidePanel } from "@/components/ui/side-panel";
import type {
  EntryUpsert,
  OdontogramEntry,
  ToothCondition,
  ToothSurface,
} from "@/types";
import { CONDITION_META, CONDITION_ORDER, SURFACE_LABELS } from "./constants";
import { useToothHistory } from "./hooks";

interface Props {
  patientId: number;
  fdi: string | null;
  surface: ToothSurface;
  current: OdontogramEntry | undefined;
  saving: boolean;
  onClose: () => void;
  onSave: (data: EntryUpsert) => void;
}

export function ToothEditorPanel({
  patientId,
  fdi,
  surface,
  current,
  saving,
  onClose,
  onSave,
}: Props) {
  const [condition, setCondition] = useState<ToothCondition>("healthy");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [date, setDate] = useState("");
  const [observations, setObservations] = useState("");

  const history = useToothHistory(patientId, fdi);

  useEffect(() => {
    setCondition(current?.condition ?? "healthy");
    setDiagnosis(current?.diagnosis ?? "");
    setTreatment(current?.treatment_description ?? "");
    setDate(current?.treatment_date ?? "");
    setObservations(current?.observations ?? "");
  }, [current, fdi, surface]);

  const submit = () => {
    if (!fdi) return;
    onSave({
      tooth_fdi: fdi,
      surface,
      condition,
      color: CONDITION_META[condition].color,
      diagnosis: diagnosis || null,
      treatment_description: treatment || null,
      treatment_date: date || null,
      observations: observations || null,
    });
  };

  return (
    <SidePanel
      open={Boolean(fdi)}
      onClose={onClose}
      title={fdi ? `Pieza ${fdi}` : ""}
      description={SURFACE_LABELS[surface]}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Estado / Diagnóstico</Label>
          <div className="grid grid-cols-2 gap-2">
            {CONDITION_ORDER.map((c) => {
              const meta = CONDITION_META[c];
              const active = condition === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-slate-300"
                    style={{ background: meta.color }}
                  />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diagnosis">Diagnóstico clínico</Label>
          <Input
            id="diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Ej. Caries oclusal profunda"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="treatment">Tratamiento</Label>
          <Textarea
            id="treatment"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            placeholder="Procedimiento indicado…"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date ?? ""}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Superficie</Label>
            <Select value={surface} disabled>
              <option value={surface}>{SURFACE_LABELS[surface]}</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="obs">Observaciones</Label>
          <Textarea
            id="obs"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <History className="h-4 w-4" /> Historial de cambios
          </div>
          {history.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : history.data && history.data.length > 0 ? (
            <ul className="space-y-2">
              {history.data.map((h) => (
                <li
                  key={h.id}
                  className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">
                      {h.previous_condition
                        ? CONDITION_META[h.previous_condition].label
                        : "—"}{" "}
                      → {CONDITION_META[h.new_condition].label}
                    </span>
                    <span>
                      {format(new Date(h.changed_at), "dd MMM yyyy HH:mm", {
                        locale: es,
                      })}
                    </span>
                  </div>
                  {h.change_description && (
                    <p className="mt-0.5 text-slate-500">{h.change_description}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Sin cambios registrados.</p>
          )}
        </div>
      </div>
    </SidePanel>
  );
}
