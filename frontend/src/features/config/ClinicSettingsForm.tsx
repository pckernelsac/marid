import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useClinic,
  useUpdateClinic,
  type ClinicPayload,
} from "./hooks";

const EMPTY: ClinicPayload = {
  name: "Madrid Dental Studio",
  ruc: "",
  address: "",
  phone: "",
  email: "",
  logo_url: "",
  signature_url: "",
  opening_hours: "",
};

export function ClinicSettingsForm() {
  const { data, isLoading } = useClinic();
  const update = useUpdateClinic();
  const [form, setForm] = useState<ClinicPayload>(EMPTY);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name ?? "",
        ruc: data.ruc ?? "",
        address: data.address ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        logo_url: data.logo_url ?? "",
        signature_url: data.signature_url ?? "",
        opening_hours: data.opening_hours ?? "",
      });
    }
  }, [data]);

  const set = <K extends keyof ClinicPayload>(k: K, v: ClinicPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    try {
      await update.mutateAsync(form);
      toast.success("Datos de la clínica guardados");
    } catch {
      toast.error("No se pudo guardar");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          Cargando…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Datos de la clínica</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" full>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="RUC">
            <Input
              value={form.ruc ?? ""}
              onChange={(e) => set("ruc", e.target.value)}
            />
          </Field>
          <Field label="Teléfono">
            <Input
              value={form.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Correo">
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Dirección">
            <Input
              value={form.address ?? ""}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>
          <Field label="URL del logo">
            <Input
              value={form.logo_url ?? ""}
              onChange={(e) => set("logo_url", e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <Field label="URL de la firma">
            <Input
              value={form.signature_url ?? ""}
              onChange={(e) => set("signature_url", e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <Field label="Horarios de atención" full>
            <Textarea
              value={form.opening_hours ?? ""}
              onChange={(e) => set("opening_hours", e.target.value)}
              placeholder="Lun–Vie 9:00–19:00 · Sáb 9:00–13:00"
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={update.isPending}>
          <Save className="h-4 w-4" />
          {update.isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-2 ${full ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
