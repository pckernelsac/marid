import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export interface Radiograph {
  id: number;
  patient_id: number;
  title: string;
  file_url: string;
  file_type: string;
  taken_on?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface UploadArgs {
  file: File;
  title: string;
  taken_on?: string;
  notes?: string;
}

export const IMAGE_TYPES = ["png", "jpg", "jpeg", "webp"];

export function isImage(fileType: string): boolean {
  return IMAGE_TYPES.includes(fileType.toLowerCase());
}

export function useRadiographs(patientId: number) {
  return useQuery({
    queryKey: ["radiographs", patientId],
    queryFn: () =>
      apiFetch<Radiograph[]>(`/patients/${patientId}/radiographs`),
    enabled: Number.isFinite(patientId),
  });
}

export function useUploadRadiograph(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: UploadArgs) => {
      const form = new FormData();
      form.append("file", args.file);
      form.append("title", args.title);
      if (args.taken_on) form.append("taken_on", args.taken_on);
      if (args.notes) form.append("notes", args.notes);
      return apiFetch<Radiograph>(`/patients/${patientId}/radiographs`, {
        method: "POST",
        isForm: true,
        body: form,
      });
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["radiographs", patientId] }),
  });
}

export function useDeleteRadiograph(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/radiographs/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["radiographs", patientId] }),
  });
}
