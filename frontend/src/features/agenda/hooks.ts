import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { User } from "@/types";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Appointment {
  id: number;
  patient_id: number;
  patient_name?: string | null;
  dentist_id?: number | null;
  dentist_name?: string | null;
  title: string;
  appointment_type?: string | null;
  color?: string | null;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes?: string | null;
}

export interface AppointmentPayload {
  patient_id: number;
  dentist_id?: number | null;
  title: string;
  appointment_type?: string | null;
  color?: string | null;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes?: string | null;
}

export const APPOINTMENT_TYPES: { value: string; label: string; color: string }[] =
  [
    { value: "consulta", label: "Consulta", color: "#3b82f6" },
    { value: "limpieza", label: "Limpieza", color: "#06b6d4" },
    { value: "tratamiento", label: "Tratamiento", color: "#8b5cf6" },
    { value: "control", label: "Control", color: "#22c55e" },
    { value: "urgencia", label: "Urgencia", color: "#ef4444" },
    { value: "ortodoncia", label: "Ortodoncia", color: "#f59e0b" },
  ];

export const STATUS_META: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  scheduled: { label: "Agendada", className: "bg-slate-100 text-slate-600" },
  confirmed: { label: "Confirmada", className: "bg-sky-50 text-sky-700" },
  completed: { label: "Completada", className: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Cancelada", className: "bg-rose-50 text-rose-700" },
  no_show: { label: "No asistió", className: "bg-amber-50 text-amber-700" },
};

export function typeColor(type?: string | null, color?: string | null): string {
  if (color) return color;
  const found = APPOINTMENT_TYPES.find((t) => t.value === type);
  return found?.color ?? "#3b82f6";
}

export function useAppointments(fromISO: string, toISO: string) {
  return useQuery({
    queryKey: ["appointments", fromISO, toISO],
    queryFn: () =>
      apiFetch<Appointment[]>(
        `/appointments?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`,
      ),
  });
}

export function useDentists() {
  return useQuery({
    queryKey: ["users", "active"],
    queryFn: () => apiFetch<User[]>(`/users?active_only=true`),
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AppointmentPayload) =>
      apiFetch<Appointment>("/appointments", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<AppointmentPayload>;
    }) =>
      apiFetch<Appointment>(`/appointments/${id}`, {
        method: "PATCH",
        body: data,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/appointments/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}
