import { useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TreatmentFormPanel } from "./TreatmentFormPanel";
import { PaymentPanel } from "./PaymentPanel";
import { TreatmentsTable } from "./TreatmentsTable";
import { useDeleteTreatment, useTreatments, type Treatment } from "./hooks";

export function PatientTreatments({
  patientId,
  patientName,
}: {
  patientId: number;
  patientName: string;
}) {
  const { data, isLoading } = useTreatments({ patientId });
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Nuevo tratamiento
        </Button>
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
        fixedPatient={editing ? undefined : { id: patientId, name: patientName }}
        treatment={editing}
      />
      <PaymentPanel treatment={paying} onClose={() => setPaying(null)} />
    </div>
  );
}
