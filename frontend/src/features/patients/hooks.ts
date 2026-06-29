import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { PaginatedPatients, Patient } from "@/types";

export interface PatientFormData {
  first_name: string;
  last_name: string;
  dni: string;
  sex: "male" | "female" | "other";
  birth_date: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  occupation?: string | null;
  insurance?: string | null;
  responsible_person?: string | null;
  observations?: string | null;
}

export function usePatients(query: string, page = 1, size = 20) {
  return useQuery({
    queryKey: ["patients", query, page, size],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
      });
      if (query) params.set("q", query);
      return apiFetch<PaginatedPatients>(`/patients?${params.toString()}`);
    },
  });
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => apiFetch<Patient>(`/patients/${id}`),
    enabled: Number.isFinite(id),
  });
}

export function usePatientByCode(publicId: string | undefined) {
  return useQuery({
    queryKey: ["patient-by-code", publicId],
    queryFn: () => apiFetch<Patient>(`/patients/by-code/${publicId}`),
    enabled: Boolean(publicId),
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PatientFormData) =>
      apiFetch<Patient>("/patients", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patients"] }),
  });
}
