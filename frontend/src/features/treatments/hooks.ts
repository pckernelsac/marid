import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export type TreatmentStatus = "pending" | "in_progress" | "finished";

export interface Treatment {
  id: number;
  patient_id: number;
  patient_name?: string | null;
  dentist_id?: number | null;
  dentist_name?: string | null;
  tooth_fdi?: string | null;
  diagnosis: string;
  procedure: string;
  cost: number;
  treatment_date?: string | null;
  status: TreatmentStatus;
  observations?: string | null;
  paid_amount: number;
  created_at: string;
}

export interface PaginatedTreatments {
  items: Treatment[];
  total: number;
  page: number;
  size: number;
}

export interface TreatmentPayload {
  patient_id: number;
  tooth_fdi?: string | null;
  diagnosis: string;
  procedure: string;
  cost: number;
  treatment_date?: string | null;
  status: TreatmentStatus;
  observations?: string | null;
}

export const TREATMENT_STATUS_META: Record<
  TreatmentStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pendiente", className: "bg-amber-50 text-amber-700" },
  in_progress: { label: "En proceso", className: "bg-sky-50 text-sky-700" },
  finished: { label: "Finalizado", className: "bg-emerald-50 text-emerald-700" },
};

export function useTreatments(params: {
  patientId?: number;
  status?: TreatmentStatus | "";
  page?: number;
}) {
  const { patientId, status, page = 1 } = params;
  return useQuery({
    queryKey: ["treatments", patientId ?? null, status ?? "", page],
    queryFn: () => {
      const qs = new URLSearchParams({ page: String(page), size: "50" });
      if (patientId) qs.set("patient_id", String(patientId));
      if (status) qs.set("status", status);
      return apiFetch<PaginatedTreatments>(`/treatments?${qs.toString()}`);
    },
  });
}

export function useCreateTreatment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TreatmentPayload) =>
      apiFetch<Treatment>("/treatments", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["treatments"] }),
  });
}

export function useUpdateTreatment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<TreatmentPayload>;
    }) => apiFetch<Treatment>(`/treatments/${id}`, { method: "PATCH", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["treatments"] }),
  });
}

export function useDeleteTreatment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/treatments/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["treatments"] }),
  });
}
