import { useQuery } from "@tanstack/react-query";

import { apiFetch, tokenStore } from "@/lib/api";

export interface NamedCount {
  label: string;
  count: number;
}
export interface NamedAmount {
  label: string;
  amount: number;
}
export interface DayPoint {
  day: string;
  income: number;
  expense: number;
}

export interface ReportSummary {
  date_from: string;
  date_to: string;
  total_patients: number;
  new_patients: number;
  treatments_total: number;
  treatments_by_status: NamedCount[];
  top_procedures: NamedCount[];
  appointments_total: number;
  appointments_by_status: NamedCount[];
  total_income: number;
  total_expense: number;
  balance: number;
  income_by_method: NamedAmount[];
  revenue_series: DayPoint[];
}

export function useReportSummary(from: string, to: string) {
  return useQuery({
    queryKey: ["report-summary", from, to],
    queryFn: () =>
      apiFetch<ReportSummary>(`/reports/summary?from=${from}&to=${to}`),
  });
}

export async function downloadExcel(from: string, to: string): Promise<void> {
  const res = await fetch(
    `/api/v1/reports/export.xlsx?from=${from}&to=${to}`,
    { headers: { Authorization: `Bearer ${tokenStore.access}` } },
  );
  if (!res.ok) throw new Error("export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte_${from}_${to}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
