import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export type MovementType = "income" | "expense";
export type PaymentMethod =
  | "cash"
  | "card"
  | "transfer"
  | "yape"
  | "plin"
  | "other";

export interface CashMovement {
  id: number;
  movement_type: MovementType;
  concept: string;
  amount: number;
  payment_method: PaymentMethod;
  movement_date: string;
  patient_id?: number | null;
  patient_name?: string | null;
  treatment_id?: number | null;
  notes?: string | null;
  created_at: string;
}

export interface CashMovementPayload {
  movement_type: MovementType;
  concept: string;
  amount: number;
  payment_method: PaymentMethod;
  movement_date: string;
  patient_id?: number | null;
  treatment_id?: number | null;
  notes?: string | null;
}

export interface CashSummary {
  date_from: string;
  date_to: string;
  total_income: number;
  total_expense: number;
  balance: number;
  income_by_method: { payment_method: PaymentMethod; total: number }[];
  movement_count: number;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  yape: "Yape",
  plin: "Plin",
  other: "Otro",
};

export function useCashMovements(from: string, to: string) {
  return useQuery({
    queryKey: ["cash-movements", from, to],
    queryFn: () =>
      apiFetch<CashMovement[]>(
        `/cash/movements?from=${from}&to=${to}`,
      ),
  });
}

export function useCashSummary(from: string, to: string) {
  return useQuery({
    queryKey: ["cash-summary", from, to],
    queryFn: () => apiFetch<CashSummary>(`/cash/summary?from=${from}&to=${to}`),
  });
}

export function useCreateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CashMovementPayload) =>
      apiFetch<CashMovement>("/cash/movements", { method: "POST", body: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cash-movements"] });
      qc.invalidateQueries({ queryKey: ["cash-summary"] });
      qc.invalidateQueries({ queryKey: ["treatments"] });
    },
  });
}

export function useDeleteMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/cash/movements/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cash-movements"] });
      qc.invalidateQueries({ queryKey: ["cash-summary"] });
    },
  });
}
