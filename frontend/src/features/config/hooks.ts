import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { User, UserRole } from "@/types";

export interface ClinicSettings {
  id: number;
  name: string;
  ruc?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logo_url?: string | null;
  signature_url?: string | null;
  opening_hours?: string | null;
}

export type ClinicPayload = Omit<ClinicSettings, "id">;

export interface UserPayload {
  email: string;
  full_name: string;
  role: UserRole;
  specialty?: string | null;
  license_number?: string | null;
  is_active: boolean;
  password?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  dentist: "Odontólogo",
  assistant: "Asistente",
  receptionist: "Recepción",
};

export function useClinic() {
  return useQuery({
    queryKey: ["clinic"],
    queryFn: () => apiFetch<ClinicSettings>("/clinic"),
  });
}

export function useUpdateClinic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClinicPayload) =>
      apiFetch<ClinicSettings>("/clinic", { method: "PUT", body: data }),
    onSuccess: (data) => qc.setQueryData(["clinic"], data),
  });
}

export function useStaff() {
  return useQuery({
    queryKey: ["users", "manage"],
    queryFn: () => apiFetch<User[]>("/users?active_only=false"),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserPayload) =>
      apiFetch<User>("/users", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserPayload> }) =>
      apiFetch<User>(`/users/${id}`, { method: "PATCH", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
