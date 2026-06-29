import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export interface DayPoint {
  day: string;
  income: number;
  expense: number;
}

export interface NamedAmount {
  label: string;
  amount: number;
}

export interface RecentActivity {
  patient_id: number;
  patient_public_id: string;
  patient_name: string;
  procedure: string;
  tooth_fdi: string | null;
  status: string;
  created_at: string;
}

export interface TodayAppointment {
  id: number;
  patient_id: number;
  patient_name: string;
  title: string;
  starts_at: string;
  ends_at: string;
  status: string;
  color: string | null;
}

export interface DashboardSummary {
  patients_today: number;
  appointments_pending: number;
  income_today: number;
  treatments_today: number;
  income_month: number;
  expense_month: number;
  balance_month: number;
  new_patients_month: number;
  total_patients: number;
  revenue_week: DayPoint[];
  income_by_method_month: NamedAmount[];
  recent_activity: RecentActivity[];
  today_appointments: TodayAppointment[];
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiFetch<DashboardSummary>("/dashboard/summary"),
    refetchInterval: 60_000,
  });
}
