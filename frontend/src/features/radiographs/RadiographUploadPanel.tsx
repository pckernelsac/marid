import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidePanel } from "@/components/ui/side-panel";
import { ApiError } from "@/lib/api";
import { useUploadRadiograph } from "./hooks";

const ACCEPT = ".png,.jpg,.jpeg,.webp,.pdf";

export function RadiographUploadPanel({
  open,
  onClose,
  patientId,
}: {
  open: boolean;
  onClose: () => void;
  patientId: number;
}) {
  const upload = useUploadRadiograph(patientId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [takenOn, setTakenOn] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const reset = () => {
    setFile(null);
    setTitle("");
    setTakenOn(new Date().toISOString().slice(0, 10));
    setNotes("");
  };

  const pick = (f: File | null) => {
    setFile(f);
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const submit = async () => {
    if (!file) {
      toast.error("Selecciona un archivo");
      return;
    }
    try {
      await upload.mutateAsync({
        file,
        title: title || file.name,
        taken_on: takenOn || undefined,
        notes: notes || undefined,
      });
      toast.success("Radiografía subida");
      reset();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo subir");
    }
  };

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Subir radiografía"
      description="PNG, JPG, JPEG, WEBP o PDF"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={upload.isPending}>
            {upload.isPending ? "Subiendo…" : "Subir"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pick(e.dataTransfer.files?.[0] ?? null);
          }}
          className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-8 text-center transition hover:border-primary/40 hover:bg-slate-50"
        >
          <UploadCloud className="h-8 w-8 text-slate-400" />
          {file ? (
            <span className="text-sm font-medium text-slate-700">
              {file.name}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Haz clic o arrastra un archivo aquí
            </span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />

        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Panorámica"
          />
        </div>
        <div className="space-y-2">
          <Label>Fecha del estudio</Label>
          <Input
            type="date"
            value={takenOn}
            onChange={(e) => setTakenOn(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Notas</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </SidePanel>
  );
}
