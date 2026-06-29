import { useEffect, useState } from "react";
import { HeartPulse, Save } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  useClinicalHistory,
  useSaveClinicalHistory,
  type ClinicalHistoryPayload,
} from "./hooks";

const ANTECEDENTS: { key: keyof ClinicalHistoryPayload; label: string }[] = [
  { key: "allergies", label: "Alergias" },
  { key: "diabetes", label: "Diabetes" },
  { key: "hypertension", label: "Hipertensión" },
  { key: "anemia", label: "Anemia" },
  { key: "hiv", label: "VIH" },
  { key: "pregnancy", label: "Embarazo" },
  { key: "hepatitis", label: "Hepatitis" },
  { key: "bleeding_disorders", label: "Hemorragias" },
];

const EMPTY: ClinicalHistoryPayload = {
  allergies: false,
  allergies_detail: "",
  diabetes: false,
  hypertension: false,
  anemia: false,
  hiv: false,
  pregnancy: false,
  hepatitis: false,
  bleeding_disorders: false,
  current_medication: "",
  medical_antecedents: "",
  observations: "",
};

export function ClinicalHistoryForm({ patientId }: { patientId: number }) {
  const { data, isLoading } = useClinicalHistory(patientId);
  const save = useSaveClinicalHistory(patientId);
  const [form, setForm] = useState<ClinicalHistoryPayload>(EMPTY);

  useEffect(() => {
    if (data) {
      setForm({
        allergies: data.allergies,
        allergies_detail: data.allergies_detail ?? "",
        diabetes: data.diabetes,
        hypertension: data.hypertension,
        anemia: data.anemia,
        hiv: data.hiv,
        pregnancy: data.pregnancy,
        hepatitis: data.hepatitis,
        bleeding_disorders: data.bleeding_disorders,
        current_medication: data.current_medication ?? "",
        medical_antecedents: data.medical_antecedents ?? "",
        observations: data.observations ?? "",
      });
    }
  }, [data]);

  const set = <K extends keyof ClinicalHistoryPayload>(
    key: K,
    value: ClinicalHistoryPayload[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    try {
      await save.mutateAsync(form);
      toast.success("Historia clínica guardada");
    } catch {
      toast.error("No se pudo guardar");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          Cargando historia clínica…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-primary" /> Antecedentes médicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {ANTECEDENTS.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3"
              >
                <Label htmlFor={key}>{label}</Label>
                <Switch
                  id={key}
                  checked={Boolean(form[key])}
                  onChange={(v) => set(key, v as never)}
                />
              </div>
            ))}
          </div>

          {form.allergies && (
            <div className="mt-4 space-y-2">
              <Label>Detalle de alergias</Label>
              <Input
                value={form.allergies_detail ?? ""}
                onChange={(e) => set("allergies_detail", e.target.value)}
                placeholder="Ej. Penicilina, látex…"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles clínicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Medicación actual</Label>
            <Textarea
              value={form.current_medication ?? ""}
              onChange={(e) => set("current_medication", e.target.value)}
              placeholder="Medicamentos que toma actualmente…"
            />
          </div>
          <div className="space-y-2">
            <Label>Antecedentes médicos generales</Label>
            <Textarea
              value={form.medical_antecedents ?? ""}
              onChange={(e) => set("medical_antecedents", e.target.value)}
              placeholder="Cirugías, enfermedades crónicas, hospitalizaciones…"
            />
          </div>
          <div className="space-y-2">
            <Label>Observaciones</Label>
            <Textarea
              value={form.observations ?? ""}
              onChange={(e) => set("observations", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={save.isPending}>
          <Save className="h-4 w-4" />
          {save.isPending ? "Guardando…" : "Guardar historia clínica"}
        </Button>
      </div>
    </div>
  );
}
