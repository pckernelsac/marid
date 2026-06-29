import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export type BudgetStatus = "draft" | "sent" | "approved" | "rejected";

export interface BudgetItem {
  id?: number;
  description: string;
  tooth_fdi?: string | null;
  quantity: number;
  unit_price: number;
  line_total?: number;
}

export interface Budget {
  id: number;
  patient_id: number;
  patient_name?: string | null;
  code: string;
  issue_date: string;
  subtotal: number;
  discount: number;
  total: number;
  status: BudgetStatus;
  notes?: string | null;
  items: Required<BudgetItem>[];
  created_at: string;
}

export interface BudgetListItem {
  id: number;
  code: string;
  patient_id: number;
  patient_name?: string | null;
  issue_date: string;
  total: number;
  status: BudgetStatus;
}

export interface PaginatedBudgets {
  items: BudgetListItem[];
  total: number;
  page: number;
  size: number;
}

export interface BudgetCreatePayload {
  patient_id: number;
  issue_date: string;
  discount: number;
  notes?: string | null;
  items: Omit<BudgetItem, "id" | "line_total">[];
}

export interface ClinicSettings {
  id: number;
  name: string;
  ruc?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logo_url?: string | null;
  opening_hours?: string | null;
}

export const BUDGET_STATUS_META: Record<
  BudgetStatus,
  { label: string; className: string }
> = {
  draft: { label: "Borrador", className: "bg-slate-100 text-slate-600" },
  sent: { label: "Enviado", className: "bg-sky-50 text-sky-700" },
  approved: { label: "Aprobado", className: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rechazado", className: "bg-rose-50 text-rose-700" },
};

export function useBudgets(params: {
  patientId?: number;
  status?: BudgetStatus | "";
  page?: number;
}) {
  const { patientId, status, page = 1 } = params;
  return useQuery({
    queryKey: ["budgets", patientId ?? null, status ?? "", page],
    queryFn: () => {
      const qs = new URLSearchParams({ page: String(page), size: "50" });
      if (patientId) qs.set("patient_id", String(patientId));
      if (status) qs.set("status", status);
      return apiFetch<PaginatedBudgets>(`/budgets?${qs.toString()}`);
    },
  });
}

export function useBudget(id: number | null) {
  return useQuery({
    queryKey: ["budget", id],
    queryFn: () => apiFetch<Budget>(`/budgets/${id}`),
    enabled: id != null,
  });
}

export function useClinic() {
  return useQuery({
    queryKey: ["clinic"],
    queryFn: () => apiFetch<ClinicSettings>("/clinic"),
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetCreatePayload) =>
      apiFetch<Budget>("/budgets", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<BudgetCreatePayload> & { status?: BudgetStatus };
    }) => apiFetch<Budget>(`/budgets/${id}`, { method: "PATCH", body: data }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["budget", vars.id] });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/budgets/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}
