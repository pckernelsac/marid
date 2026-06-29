import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export interface ClinicalHistory {
  id: number;
  patient_id: number;
  allergies: boolean;
  allergies_detail?: string | null;
  diabetes: boolean;
  hypertension: boolean;
  anemia: boolean;
  hiv: boolean;
  pregnancy: boolean;
  hepatitis: boolean;
  bleeding_disorders: boolean;
  current_medication?: string | null;
  medical_antecedents?: string | null;
  observations?: string | null;
  created_at: string;
  updated_at: string;
}

export type ClinicalHistoryPayload = Omit<
  ClinicalHistory,
  "id" | "patient_id" | "created_at" | "updated_at"
>;

export function useClinicalHistory(patientId: number) {
  return useQuery({
    queryKey: ["clinical-history", patientId],
    queryFn: () =>
      apiFetch<ClinicalHistory>(`/patients/${patientId}/clinical-history`),
    enabled: Number.isFinite(patientId),
  });
}

export function useSaveClinicalHistory(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClinicalHistoryPayload) =>
      apiFetch<ClinicalHistory>(`/patients/${patientId}/clinical-history`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: (data) => {
      qc.setQueryData(["clinical-history", patientId], data);
    },
  });
}
