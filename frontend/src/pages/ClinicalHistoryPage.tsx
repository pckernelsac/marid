import { useState } from "react";
import { Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initials } from "@/lib/utils";
import { usePatients } from "@/features/patients/hooks";
import { ClinicalHistoryForm } from "@/features/clinical-history/ClinicalHistoryForm";

export function ClinicalHistoryPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ id: number; name: string } | null>(
    null,
  );
  const { data } = usePatients(query);

  if (selected) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-primary hover:underline"
        >
          ← Elegir otro paciente
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Historia clínica
          </h1>
          <p className="text-sm text-muted-foreground">{selected.name}</p>
        </div>
        <ClinicalHistoryForm patientId={selected.id} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Historia Clínica</h1>
        <p className="text-sm text-muted-foreground">
          Selecciona un paciente para ver o editar su historia clínica.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar paciente…"
          className="pl-9"
        />
      </div>

      <Card className="divide-y divide-slate-100">
        {data && data.items.length > 0 ? (
          data.items.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                setSelected({
                  id: p.id,
                  name: `${p.first_name} ${p.last_name}`,
                })
              }
              className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials(`${p.first_name} ${p.last_name}`)}
              </div>
              <div>
                <p className="font-medium">
                  {p.first_name} {p.last_name}
                </p>
                <p className="text-sm text-muted-foreground">DNI {p.dni}</p>
              </div>
            </button>
          ))
        ) : (
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Sin pacientes.
          </CardContent>
        )}
      </Card>
    </div>
  );
}
