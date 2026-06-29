import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClinicSettingsForm } from "@/features/config/ClinicSettingsForm";
import { StaffManager } from "@/features/config/StaffManager";

export function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Datos de la clínica y gestión de odontólogos.
        </p>
      </div>

      <Tabs defaultValue="clinica">
        <TabsList>
          <TabsTrigger value="clinica">Clínica</TabsTrigger>
          <TabsTrigger value="odontologos">Odontólogos</TabsTrigger>
        </TabsList>
        <TabsContent value="clinica" className="mt-5">
          <ClinicSettingsForm />
        </TabsContent>
        <TabsContent value="odontologos" className="mt-5">
          <StaffManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
