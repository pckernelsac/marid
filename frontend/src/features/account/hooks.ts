import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export type TreatmentStatus = "pending" | "in_progress" | "finished";
export type PaymentMethod =
  | "cash"
  | "card"
  | "transfer"
  | "yape"
  | "plin"
  | "other";

export interface AccountTreatment {
  id: number;
  procedure: string;
  tooth_fdi: string | null;
  status: TreatmentStatus;
  treatment_date: string | null;
  cost: number;
  paid: number;
  pending: number;
}

export interface AccountPayment {
  id: number;
  movement_date: string;
  concept: string;
  amount: number;
  payment_method: PaymentMethod;
  treatment_id: number | null;
}

export interface PatientAccount {
  total_charged: number;
  total_paid: number;
  balance: number;
  treatments: AccountTreatment[];
  payments: AccountPayment[];
}

export function usePatientAccount(patientId: number) {
  return useQuery({
    queryKey: ["patient-account", patientId],
    queryFn: () => apiFetch<PatientAccount>(`/patients/${patientId}/account`),
    enabled: Number.isFinite(patientId) && patientId > 0,
  });
}
