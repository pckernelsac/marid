import { useEffect, useState } from "react";
import { Pencil, Plus, UserRound } from "lucide-react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SidePanel } from "@/components/ui/side-panel";
import { initials } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import type { User, UserRole } from "@/types";
import {
  ROLE_LABELS,
  useCreateUser,
  useStaff,
  useUpdateUser,
  type UserPayload,
} from "./hooks";

const EMPTY: UserPayload = {
  email: "",
  full_name: "",
  role: "dentist",
  specialty: "",
  license_number: "",
  is_active: true,
  password: "",
};

export function StaffManager() {
  const { data: staff, isLoading } = useStaff();
  const create = useCreateUser();
  const update = useUpdateUser();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<UserPayload>(EMPTY);

  useEffect(() => {
    if (editing) {
      setForm({
        email: editing.email,
        full_name: editing.full_name,
        role: editing.role,
        specialty: editing.specialty ?? "",
        license_number: editing.license_number ?? "",
        is_active: editing.is_active,
        password: "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [editing, open]);

  const set = <K extends keyof UserPayload>(k: K, v: UserPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (u: User) => {
    setEditing(u);
    setOpen(true);
  };

  const submit = async () => {
    if (!form.full_name || !form.email) {
      toast.error("Nombre y correo son obligatorios");
      return;
    }
    if (!editing && !form.password) {
      toast.error("La contraseña es obligatoria");
      return;
    }
    try {
      if (editing) {
        const payload: Partial<UserPayload> = { ...form };
        if (!payload.password) delete payload.password;
        await update.mutateAsync({ id: editing.id, data: payload });
      } else {
        await create.mutateAsync(form);
      }
      toast.success(editing ? "Usuario actualizado" : "Usuario creado");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo guardar");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Nuevo odontólogo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Cargando…
            </div>
          ) : staff && staff.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {staff.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50/60"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials(u.full_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {u.full_name}
                      {!u.is_active && (
                        <span className="ml-2 text-xs text-rose-500">
                          (inactivo)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {u.email}
                      {u.specialty ? ` · ${u.specialty}` : ""}
                    </p>
                  </div>
                  <Badge className="bg-slate-100 text-slate-600">
                    {ROLE_LABELS[u.role]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(u)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <UserRound className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-muted-foreground">Sin usuarios.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar usuario" : "Nuevo odontólogo"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={submit}
              disabled={create.isPending || update.isPending}
            >
              Guardar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre completo</Label>
            <Input
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Correo</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>
              {editing ? "Nueva contraseña (opcional)" : "Contraseña"}
            </Label>
            <Input
              type="password"
              value={form.password ?? ""}
              onChange={(e) => set("password", e.target.value)}
              placeholder={editing ? "Dejar en blanco para no cambiar" : ""}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={form.role}
                onChange={(e) => set("role", e.target.value as UserRole)}
              >
                <option value="dentist">Odontólogo</option>
                <option value="admin">Administrador</option>
                <option value="assistant">Asistente</option>
                <option value="receptionist">Recepción</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Especialidad</Label>
              <Input
                value={form.specialty ?? ""}
                onChange={(e) => set("specialty", e.target.value)}
                placeholder="Ortodoncia…"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>N° de colegiatura</Label>
            <Input
              value={form.license_number ?? ""}
              onChange={(e) => set("license_number", e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3">
            <Label>Usuario activo</Label>
            <Switch
              checked={form.is_active}
              onChange={(v) => set("is_active", v)}
            />
          </div>
        </div>
      </SidePanel>
    </div>
  );
}
