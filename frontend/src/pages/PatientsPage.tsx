import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, UserRound } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SidePanel } from "@/components/ui/side-panel";
import { initials } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import {
  useCreatePatient,
  usePatients,
  type PatientFormData,
} from "@/features/patients/hooks";

const EMPTY: PatientFormData = {
  first_name: "",
  last_name: "",
  dni: "",
  sex: "male",
  birth_date: "",
  phone: "",
  email: "",
  address: "",
  occupation: "",
  insurance: "",
  responsible_person: "",
  observations: "",
};

export function PatientsPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PatientFormData>(EMPTY);
  const { data, isLoading } = usePatients(query);
  const create = useCreatePatient();

  const set = <K extends keyof PatientFormData>(
    key: K,
    value: PatientFormData[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync(form);
      toast.success("Paciente registrado");
      setOpen(false);
      setForm(EMPTY);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al registrar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pacientes</h1>
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} pacientes registrados
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Nuevo paciente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, DNI o teléfono…"
          className="pl-9"
        />
      </div>

      <Card className="divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Cargando…
          </div>
        ) : data && data.items.length > 0 ? (
          data.items.map((p) => (
            <Link
              key={p.id}
              to={`/pacientes/${p.id}`}
              className="flex items-center gap-4 p-4 transition hover:bg-slate-50"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials(`${p.first_name} ${p.last_name}`)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {p.first_name} {p.last_name}
                </p>
                <p className="text-sm text-muted-foreground">DNI {p.dni}</p>
              </div>
              <span className="text-sm text-slate-400">{p.phone}</span>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <UserRound className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-muted-foreground">
              No se encontraron pacientes.
            </p>
          </div>
        )}
      </Card>

      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo paciente"
        description="Registra los datos del paciente"
        width="max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={create.isPending}>
              {create.isPending ? "Guardando…" : "Registrar"}
            </Button>
          </div>
        }
      >
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <Field label="Nombre">
            <Input
              value={form.first_name}
              onChange={(e) => set("first_name", e.target.value)}
              required
            />
          </Field>
          <Field label="Apellido">
            <Input
              value={form.last_name}
              onChange={(e) => set("last_name", e.target.value)}
              required
            />
          </Field>
          <Field label="DNI">
            <Input
              value={form.dni}
              onChange={(e) => set("dni", e.target.value)}
              required
            />
          </Field>
          <Field label="Sexo">
            <Select
              value={form.sex}
              onChange={(e) =>
                set("sex", e.target.value as PatientFormData["sex"])
              }
            >
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </Select>
          </Field>
          <Field label="Fecha de nacimiento">
            <Input
              type="date"
              value={form.birth_date}
              onChange={(e) => set("birth_date", e.target.value)}
              required
            />
          </Field>
          <Field label="Celular">
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
          <Field label="Ocupación">
            <Input
              value={form.occupation ?? ""}
              onChange={(e) => set("occupation", e.target.value)}
            />
          </Field>
          <Field label="Dirección" full>
            <Input
              value={form.address ?? ""}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>
          <Field label="Seguro">
            <Input
              value={form.insurance ?? ""}
              onChange={(e) => set("insurance", e.target.value)}
            />
          </Field>
          <Field label="Persona responsable">
            <Input
              value={form.responsible_person ?? ""}
              onChange={(e) => set("responsible_person", e.target.value)}
            />
          </Field>
        </form>
      </SidePanel>
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
    <div className={`space-y-2 ${full ? "col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
