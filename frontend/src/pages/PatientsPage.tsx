import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Search, Trash2, UserRound } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SidePanel } from "@/components/ui/side-panel";
import { calcAge, initials } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import {
  useCreatePatient,
  useDeletePatient,
  usePatient,
  usePatients,
  useUpdatePatient,
  type PatientFormData,
} from "@/features/patients/hooks";
import type { PatientListItem } from "@/types";

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

/** Convierte cadenas vacías en null para los campos opcionales. */
function clean(form: PatientFormData): PatientFormData {
  const optional: (keyof PatientFormData)[] = [
    "phone",
    "email",
    "address",
    "occupation",
    "insurance",
    "responsible_person",
    "observations",
  ];
  const out = { ...form };
  for (const key of optional) {
    if (out[key] === "") out[key] = null as never;
  }
  return out;
}

export function PatientsPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PatientFormData>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<PatientListItem | null>(null);

  const { data, isLoading } = usePatients(query);
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const del = useDeletePatient();

  // Al editar, traemos el detalle completo y poblamos el formulario.
  const detail = usePatient(editId ?? NaN);
  useEffect(() => {
    if (editId && detail.data) {
      const p = detail.data;
      setForm({
        first_name: p.first_name,
        last_name: p.last_name,
        dni: p.dni,
        sex: p.sex,
        birth_date: p.birth_date,
        phone: p.phone ?? "",
        email: p.email ?? "",
        address: p.address ?? "",
        occupation: p.occupation ?? "",
        insurance: p.insurance ?? "",
        responsible_person: p.responsible_person ?? "",
        observations: p.observations ?? "",
      });
    }
  }, [editId, detail.data]);

  const set = <K extends keyof PatientFormData>(
    key: K,
    value: PatientFormData[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (p: PatientListItem) => {
    setEditId(p.id);
    setForm(EMPTY);
    setOpen(true);
  };

  const closePanel = () => {
    setOpen(false);
    setEditId(null);
    setForm(EMPTY);
  };

  const isEditing = editId !== null;
  const loadingDetail = isEditing && detail.isLoading;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = clean(form);
      if (isEditing) {
        await update.mutateAsync({ id: editId, data: payload });
        toast.success("Paciente actualizado");
      } else {
        await create.mutateAsync(payload);
        toast.success("Paciente registrado");
      }
      closePanel();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al guardar");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await del.mutateAsync(deleteTarget.id);
      toast.success("Paciente eliminado");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al eliminar");
    }
  };

  const items = data?.items ?? [];
  const saving = create.isPending || update.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pacientes</h1>
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} pacientes registrados
          </p>
        </div>
        <Button onClick={openCreate}>
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

      {isLoading ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Cargando…
        </Card>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-12 text-center">
          <UserRound className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-muted-foreground">
            No se encontraron pacientes.
          </p>
        </Card>
      ) : (
        <>
          {/* Tabla (desktop) */}
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Paciente</th>
                  <th className="px-5 py-3 font-medium">DNI</th>
                  <th className="px-5 py-3 font-medium">Celular</th>
                  <th className="px-5 py-3 font-medium">Edad</th>
                  <th className="px-5 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((p) => (
                  <tr key={p.id} className="group transition hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link
                        to={`/pacientes/${p.public_id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(`${p.first_name} ${p.last_name}`)}
                        </div>
                        <span className="font-medium group-hover:text-primary">
                          {p.first_name} {p.last_name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{p.dni}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {p.phone || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {calcAge(p.birth_date)} años
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/pacientes/${p.public_id}`} title="Ver perfil">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Editar"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                          title="Eliminar"
                          onClick={() => setDeleteTarget(p)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Tarjetas (móvil) */}
          <div className="space-y-3 md:hidden">
            {items.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/pacientes/${p.public_id}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initials(`${p.first_name} ${p.last_name}`)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {p.first_name} {p.last_name}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        DNI {p.dni} · {calcAge(p.birth_date)} años
                      </p>
                    </div>
                  </Link>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Editar"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                      title="Eliminar"
                      onClick={() => setDeleteTarget(p)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <SidePanel
        open={open}
        onClose={closePanel}
        title={isEditing ? "Editar paciente" : "Nuevo paciente"}
        description={
          isEditing
            ? "Actualiza los datos del paciente"
            : "Registra los datos del paciente"
        }
        width="max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closePanel}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={saving || loadingDetail}>
              {saving
                ? "Guardando…"
                : isEditing
                  ? "Guardar cambios"
                  : "Registrar"}
            </Button>
          </div>
        }
      >
        {loadingDetail ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Cargando datos…
          </p>
        ) : (
          <form
            onSubmit={submit}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
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
        )}
      </SidePanel>

      <ConfirmDialog
        open={deleteTarget !== null}
        destructive
        title="Eliminar paciente"
        description={
          deleteTarget
            ? `¿Seguro que deseas eliminar a ${deleteTarget.first_name} ${deleteTarget.last_name}? Se borrarán también su odontograma, tratamientos, citas e historia clínica. Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        loading={del.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
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
