import { useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TreatmentFormPanel } from "@/features/treatments/TreatmentFormPanel";
import { PaymentPanel } from "@/features/treatments/PaymentPanel";
import { TreatmentsTable } from "@/features/treatments/TreatmentsTable";
import {
  useDeleteTreatment,
  useTreatments,
  type Treatment,
  type TreatmentStatus,
} from "@/features/treatments/hooks";

export function TreatmentsPage() {
  const [status, setStatus] = useState<TreatmentStatus | "">("");
  const { data, isLoading } = useTreatments({ status });
  const del = useDeleteTreatment();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Treatment | null>(null);
  const [paying, setPaying] = useState<Treatment | null>(null);

  const handleDelete = async (t: Treatment) => {
    if (!confirm(`¿Eliminar el tratamiento "${t.procedure}"?`)) return;
    try {
      await del.mutateAsync(t.id);
      toast.success("Tratamiento eliminado");
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tratamientos</h1>
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} tratamientos registrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as TreatmentStatus | "")}
            className="w-44"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En proceso</option>
            <option value="finished">Finalizado</option>
          </Select>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Cargando…
            </div>
          ) : (
            <TreatmentsTable
              treatments={data?.items ?? []}
              showPatient
              onEdit={(t) => {
                setEditing(t);
                setFormOpen(true);
              }}
              onPay={setPaying}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <TreatmentFormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        treatment={editing}
      />
      <PaymentPanel treatment={paying} onClose={() => setPaying(null)} />
    </div>
  );
}
