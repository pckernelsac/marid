import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SidePanel } from "@/components/ui/side-panel";
import { PatientSelect } from "@/components/PatientSelect";
import {
  APPOINTMENT_TYPES,
  useCreateAppointment,
  useDeleteAppointment,
  useDentists,
  useUpdateAppointment,
  type Appointment,
  type AppointmentStatus,
} from "./hooks";
import { toLocalISO } from "./calendar";

export interface PanelInitial {
  start: Date;
  end: Date;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: PanelInitial;
  appointment?: Appointment | null;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function dateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function timeStr(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AppointmentPanel({
  open,
  onClose,
  initial,
  appointment,
}: Props) {
  const create = useCreateAppointment();
  const update = useUpdateAppointment();
  const del = useDeleteAppointment();
  const { data: dentists } = useDentists();
  const isEdit = Boolean(appointment);

  const [patient, setPatient] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [title, setTitle] = useState("");
  const [type, setType] = useState("consulta");
  const [dentistId, setDentistId] = useState<string>("");
  const [day, setDay] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("09:30");
  const [status, setStatus] = useState<AppointmentStatus>("scheduled");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (appointment) {
      const s = new Date(appointment.starts_at);
      const e = new Date(appointment.ends_at);
      setPatient({
        id: appointment.patient_id,
        name: appointment.patient_name ?? "",
      });
      setTitle(appointment.title);
      setType(appointment.appointment_type ?? "consulta");
      setDentistId(appointment.dentist_id ? String(appointment.dentist_id) : "");
      setDay(dateStr(s));
      setStart(timeStr(s));
      setEnd(timeStr(e));
      setStatus(appointment.status);
      setNotes(appointment.notes ?? "");
    } else if (initial) {
      setPatient(null);
      setTitle("");
      setType("consulta");
      setDentistId("");
      setDay(dateStr(initial.start));
      setStart(timeStr(initial.start));
      setEnd(timeStr(initial.end));
      setStatus("scheduled");
      setNotes("");
    }
  }, [appointment, initial, open]);

  const buildISO = (timeValue: string) => {
    const [h, m] = timeValue.split(":").map(Number);
    const d = new Date(`${day}T00:00:00`);
    d.setHours(h, m, 0, 0);
    return toLocalISO(d);
  };

  const submit = async () => {
    if (!patient) {
      toast.error("Selecciona un paciente");
      return;
    }
    if (start >= end) {
      toast.error("La hora de fin debe ser posterior al inicio");
      return;
    }
    const typeMeta = APPOINTMENT_TYPES.find((t) => t.value === type);
    const payload = {
      patient_id: patient.id,
      dentist_id: dentistId ? Number(dentistId) : null,
      title: title || patient.name,
      appointment_type: type,
      color: typeMeta?.color ?? null,
      starts_at: buildISO(start),
      ends_at: buildISO(end),
      status,
      notes: notes || null,
    };
    try {
      if (isEdit && appointment) {
        await update.mutateAsync({ id: appointment.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      toast.success(isEdit ? "Cita actualizada" : "Cita agendada");
      onClose();
    } catch {
      toast.error("No se pudo guardar la cita");
    }
  };

  const remove = async () => {
    if (!appointment) return;
    if (!confirm("¿Eliminar esta cita?")) return;
    try {
      await del.mutateAsync(appointment.id);
      toast.success("Cita eliminada");
      onClose();
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  const saving = create.isPending || update.isPending;

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar cita" : "Nueva cita"}
      description={day}
      footer={
        <div className="flex items-center justify-between">
          {isEdit ? (
            <Button variant="ghost" onClick={remove}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {!isEdit && (
          <div className="space-y-2">
            <Label>Paciente</Label>
            <PatientSelect
              value={patient?.id ?? null}
              onChange={(id, name) => {
                setPatient({ id, name });
                if (!title) setTitle(name);
              }}
            />
          </div>
        )}
        {isEdit && (
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Paciente: </span>
            <span className="font-medium">{patient?.name}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Motivo de la cita"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Odontólogo</Label>
            <Select
              value={dentistId}
              onChange={(e) => setDentistId(e.target.value)}
            >
              <option value="">Sin asignar</option>
              {dentists?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Inicio</Label>
            <Input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Fin</Label>
            <Input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
          >
            <option value="scheduled">Agendada</option>
            <option value="confirmed">Confirmada</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
            <option value="no_show">No asistió</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Notas</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </SidePanel>
  );
}
