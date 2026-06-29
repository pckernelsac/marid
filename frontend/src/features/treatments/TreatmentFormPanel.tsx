import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SidePanel } from "@/components/ui/side-panel";
import { PatientSelect } from "@/components/PatientSelect";
import {
  useCreateTreatment,
  useUpdateTreatment,
  type Treatment,
  type TreatmentStatus,
} from "./hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  fixedPatient?: { id: number; name: string };
  treatment?: Treatment | null;
}

export function TreatmentFormPanel({
  open,
  onClose,
  fixedPatient,
  treatment,
}: Props) {
  const create = useCreateTreatment();
  const update = useUpdateTreatment();
  const isEdit = Boolean(treatment);

  const [patient, setPatient] = useState<{ id: number; name: string } | null>(
    fixedPatient ?? null,
  );
  const [tooth, setTooth] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [procedure, setProcedure] = useState("");
  const [cost, setCost] = useState("0");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<TreatmentStatus>("pending");
  const [observations, setObservations] = useState("");

  useEffect(() => {
    if (treatment) {
      setPatient({
        id: treatment.patient_id,
        name: treatment.patient_name ?? "",
      });
      setTooth(treatment.tooth_fdi ?? "");
      setDiagnosis(treatment.diagnosis);
      setProcedure(treatment.procedure);
      setCost(String(treatment.cost));
      setDate(treatment.treatment_date ?? "");
      setStatus(treatment.status);
      setObservations(treatment.observations ?? "");
    } else {
      setPatient(fixedPatient ?? null);
      setTooth("");
      setDiagnosis("");
      setProcedure("");
      setCost("0");
      setDate("");
      setStatus("pending");
      setObservations("");
    }
  }, [treatment, fixedPatient, open]);

  const submit = async () => {
    if (!patient) {
      toast.error("Selecciona un paciente");
      return;
    }
    if (!diagnosis || !procedure) {
      toast.error("Diagnóstico y procedimiento son obligatorios");
      return;
    }
    const payload = {
      patient_id: patient.id,
      tooth_fdi: tooth || null,
      diagnosis,
      procedure,
      cost: Number(cost) || 0,
      treatment_date: date || null,
      status,
      observations: observations || null,
    };
    try {
      if (isEdit && treatment) {
        await update.mutateAsync({ id: treatment.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      toast.success(isEdit ? "Tratamiento actualizado" : "Tratamiento registrado");
      onClose();
    } catch {
      toast.error("No se pudo guardar");
    }
  };

  const saving = create.isPending || update.isPending;

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar tratamiento" : "Nuevo tratamiento"}
      description={fixedPatient?.name ?? patient?.name}
      width="max-w-lg"
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
      <div className="space-y-4">
        {!fixedPatient && !isEdit && (
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
            <Label>Pieza (FDI)</Label>
            <Input
              value={tooth}
              onChange={(e) => setTooth(e.target.value)}
              placeholder="Ej. 26"
            />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as TreatmentStatus)}
            >
              <option value="pending">Pendiente</option>
              <option value="in_progress">En proceso</option>
              <option value="finished">Finalizado</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Diagnóstico</Label>
          <Input
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Ej. Caries oclusal"
          />
        </div>
        <div className="space-y-2">
          <Label>Procedimiento</Label>
          <Input
            value={procedure}
            onChange={(e) => setProcedure(e.target.value)}
            placeholder="Ej. Resina compuesta"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Costo (S/)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
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

        <div className="space-y-2">
          <Label>Observaciones</Label>
          <Textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
        </div>
      </div>
    </SidePanel>
  );
}
