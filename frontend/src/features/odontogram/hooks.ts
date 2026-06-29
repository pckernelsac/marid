import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type {
  EntryUpsert,
  Odontogram,
  OdontogramEntry,
  OdontogramHistoryItem,
} from "@/types";

export function useOdontogram(patientId: number) {
  return useQuery({
    queryKey: ["odontogram", patientId],
    queryFn: () => apiFetch<Odontogram>(`/patients/${patientId}/odontogram`),
    enabled: Number.isFinite(patientId),
  });
}

export function useToothHistory(patientId: number, fdi: string | null) {
  return useQuery({
    queryKey: ["odontogram", patientId, "history", fdi],
    queryFn: () =>
      apiFetch<OdontogramHistoryItem[]>(
        `/patients/${patientId}/odontogram/history/${fdi}`,
      ),
    enabled: Boolean(fdi),
  });
}

export function useUpsertEntry(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EntryUpsert) =>
      apiFetch<OdontogramEntry>(`/patients/${patientId}/odontogram/entries`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["odontogram", patientId] });
    },
  });
}
