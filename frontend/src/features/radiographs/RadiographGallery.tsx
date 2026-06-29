import { useMemo, useState } from "react";
import { Download, FileText, ImageOff, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadiographUploadPanel } from "./RadiographUploadPanel";
import { RadiographLightbox } from "./RadiographLightbox";
import {
  isImage,
  useDeleteRadiograph,
  useRadiographs,
  type Radiograph,
} from "./hooks";

export function RadiographGallery({ patientId }: { patientId: number }) {
  const { data, isLoading } = useRadiographs(patientId);
  const del = useDeleteRadiograph(patientId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [preview, setPreview] = useState<Radiograph | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, Radiograph[]>();
    for (const r of data ?? []) {
      const key = r.taken_on ?? "Sin fecha";
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [data]);

  const handleDelete = async (r: Radiograph) => {
    if (!confirm(`¿Eliminar "${r.title}"?`)) return;
    try {
      await del.mutateAsync(r.id);
      toast.success("Radiografía eliminada");
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="h-4 w-4" /> Subir radiografía
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Cargando…
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <ImageOff className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-muted-foreground">
              No hay radiografías. Sube la primera.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map(([dateKey, items]) => (
            <div key={dateKey} className="space-y-3">
              <h3 className="text-sm font-medium text-slate-500">
                {dateKey === "Sin fecha"
                  ? "Sin fecha"
                  : format(new Date(dateKey), "dd 'de' MMMM yyyy", {
                      locale: es,
                    })}
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((r) => (
                  <RadiographCard
                    key={r.id}
                    radiograph={r}
                    onOpen={() => {
                      if (isImage(r.file_type)) setPreview(r);
                      else window.open(r.file_url, "_blank");
                    }}
                    onDelete={() => handleDelete(r)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <RadiographUploadPanel
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        patientId={patientId}
      />
      <RadiographLightbox
        radiograph={preview}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}

function RadiographCard({
  radiograph,
  onOpen,
  onDelete,
}: {
  radiograph: Radiograph;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const image = isImage(radiograph.file_type);
  return (
    <Card className="group overflow-hidden">
      <button
        onClick={onOpen}
        className="relative block h-36 w-full overflow-hidden bg-slate-100"
      >
        {image ? (
          <img
            src={radiograph.file_url}
            alt={radiograph.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
            <FileText className="h-8 w-8" />
            <span className="text-xs uppercase">{radiograph.file_type}</span>
          </div>
        )}
      </button>
      <div className="flex items-center gap-2 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{radiograph.title}</p>
          {radiograph.notes && (
            <p className="truncate text-xs text-muted-foreground">
              {radiograph.notes}
            </p>
          )}
        </div>
        <a
          href={radiograph.file_url}
          download
          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Descargar"
        >
          <Download className="h-4 w-4" />
        </a>
        <button
          onClick={onDelete}
          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-destructive"
          aria-label="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
