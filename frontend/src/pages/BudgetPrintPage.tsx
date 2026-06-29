import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BudgetDocument } from "@/features/budgets/BudgetDocument";
import { useBudget, useClinic } from "@/features/budgets/hooks";

export function BudgetPrintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: budget, isLoading } = useBudget(Number(id));
  const { data: clinic } = useClinic();

  if (isLoading || !budget) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Cargando presupuesto…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex w-full max-w-[820px] items-center justify-between px-4">
        <Button variant="outline" onClick={() => navigate("/presupuestos")}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Imprimir / Descargar PDF
        </Button>
      </div>
      <div className="mx-auto max-w-[820px] px-4 print:px-0">
        <div className="rounded-2xl bg-white shadow-soft print:rounded-none print:shadow-none">
          <BudgetDocument budget={budget} clinic={clinic} />
        </div>
      </div>
    </div>
  );
}
