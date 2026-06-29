import { useState } from "react";
import { Check, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { usePatients } from "@/features/patients/hooks";
import { cn } from "@/lib/utils";

interface Props {
  value: number | null;
  onChange: (id: number, name: string) => void;
}

export function PatientSelect({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const { data } = usePatients(query);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar paciente…"
          className="pl-9"
        />
      </div>
      <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-100">
        {data && data.items.length > 0 ? (
          data.items.map((p) => {
            const name = `${p.first_name} ${p.last_name}`;
            const active = value === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange(p.id, name)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-slate-50",
                  active && "bg-primary/5 text-primary",
                )}
              >
                <span>
                  {name}{" "}
                  <span className="text-xs text-muted-foreground">
                    · {p.dni}
                  </span>
                </span>
                {active && <Check className="h-4 w-4" />}
              </button>
            );
          })
        ) : (
          <p className="p-3 text-sm text-muted-foreground">Sin resultados.</p>
        )}
      </div>
    </div>
  );
}
