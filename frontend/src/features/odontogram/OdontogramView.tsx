import { useCallback, useMemo, useState } from "react";
import { Redo2, Undo2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  EntryUpsert,
  OdontogramEntry,
  ToothSurface,
} from "@/types";
import { OdontogramChart } from "./OdontogramChart";
import { ToothEditorPanel } from "./ToothEditorPanel";
import { Legend } from "./Legend";
import { CONDITION_META } from "./constants";
import { useOdontogram, useUpsertEntry } from "./hooks";

interface UndoAction {
  before: EntryUpsert;
  after: EntryUpsert;
}

function entryToUpsert(
  fdi: string,
  surface: ToothSurface,
  entry: OdontogramEntry | undefined,
): EntryUpsert {
  return {
    tooth_fdi: fdi,
    surface,
    condition: entry?.condition ?? "healthy",
    color: entry?.color ?? CONDITION_META.healthy.color,
    diagnosis: entry?.diagnosis ?? null,
    treatment_description: entry?.treatment_description ?? null,
    treatment_date: entry?.treatment_date ?? null,
    observations: entry?.observations ?? null,
  };
}

export function OdontogramView({ patientId }: { patientId: number }) {
  const { data, isLoading } = useOdontogram(patientId);
  const upsert = useUpsertEntry(patientId);

  const [selected, setSelected] = useState<{
    fdi: string;
    surface: ToothSurface;
  } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);

  const entriesByTooth = useMemo(() => {
    const map = new Map<string, OdontogramEntry[]>();
    for (const entry of data?.entries ?? []) {
      const list = map.get(entry.tooth_fdi) ?? [];
      list.push(entry);
      map.set(entry.tooth_fdi, list);
    }
    return map;
  }, [data]);

  const currentEntry = selected
    ? entriesByTooth
        .get(selected.fdi)
        ?.find((e) => e.surface === selected.surface)
    : undefined;

  const apply = useCallback(
    async (next: EntryUpsert, track: boolean) => {
      const before = entryToUpsert(
        next.tooth_fdi,
        next.surface,
        entriesByTooth
          .get(next.tooth_fdi)
          ?.find((e) => e.surface === next.surface),
      );
      try {
        await upsert.mutateAsync(next);
        if (track) {
          setUndoStack((s) => [...s, { before, after: next }]);
          setRedoStack([]);
        }
        toast.success(`Pieza ${next.tooth_fdi} actualizada`);
      } catch {
        toast.error("No se pudo guardar el cambio");
      }
    },
    [entriesByTooth, upsert],
  );

  const handleSave = (next: EntryUpsert) => {
    void apply(next, true);
    setSelected(null);
  };

  const undo = async () => {
    const action = undoStack[undoStack.length - 1];
    if (!action) return;
    setUndoStack((s) => s.slice(0, -1));
    setRedoStack((s) => [...s, action]);
    await apply(action.before, false);
  };

  const redo = async () => {
    const action = redoStack[redoStack.length - 1];
    if (!action) return;
    setRedoStack((s) => s.slice(0, -1));
    setUndoStack((s) => [...s, action]);
    await apply(action.after, false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Odontograma</h2>
          <p className="text-sm text-muted-foreground">
            Haz clic en una superficie para registrar diagnóstico y tratamiento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={undoStack.length === 0}
          >
            <Undo2 className="h-4 w-4" /> Deshacer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={redoStack.length === 0}
          >
            <Redo2 className="h-4 w-4" /> Rehacer
          </Button>
        </div>
      </div>

      <Card className="overflow-x-auto p-3 sm:p-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Cargando odontograma…
          </div>
        ) : (
          <div className="min-w-[920px]">
            <OdontogramChart
              entriesByTooth={entriesByTooth}
              selectedTooth={selected?.fdi ?? null}
              hoveredTooth={hovered}
              onSurfaceClick={(fdi, surface) => setSelected({ fdi, surface })}
              onHover={setHovered}
            />
          </div>
        )}
      </Card>

      <Card className="p-5">
        <p className="mb-3 text-sm font-medium text-slate-700">Leyenda de estados</p>
        <Legend />
      </Card>

      <ToothEditorPanel
        patientId={patientId}
        fdi={selected?.fdi ?? null}
        surface={selected?.surface ?? "whole"}
        current={currentEntry}
        saving={upsert.isPending}
        onClose={() => setSelected(null)}
        onSave={handleSave}
      />
    </div>
  );
}
