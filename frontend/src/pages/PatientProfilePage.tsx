import { useParams } from "react-router-dom";
import { CalendarClock, Mail, MapPin, Phone } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calcAge, initials } from "@/lib/utils";
import { usePatient } from "@/features/patients/hooks";
import { OdontogramView } from "@/features/odontogram/OdontogramView";
import { ClinicalHistoryForm } from "@/features/clinical-history/ClinicalHistoryForm";
import { PatientTreatments } from "@/features/treatments/PatientTreatments";
import { RadiographGallery } from "@/features/radiographs/RadiographGallery";

export function PatientProfilePage() {
  const { id } = useParams();
  const patientId = Number(id);
  const { data: patient, isLoading } = usePatient(patientId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando paciente…</p>;
  }
  if (!patient) {
    return <p className="text-sm text-muted-foreground">Paciente no encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-5 p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-semibold text-primary">
            {initials(`${patient.first_name} ${patient.last_name}`)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              DNI {patient.dni} · {calcAge(patient.birth_date)} años
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-slate-500">
              {patient.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {patient.phone}
                </span>
              )}
              {patient.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {patient.email}
                </span>
              )}
              {patient.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {patient.address}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" /> Sin próxima cita
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="odontograma">
        <TabsList>
          <TabsTrigger value="odontograma">Odontograma</TabsTrigger>
          <TabsTrigger value="historia">Historia clínica</TabsTrigger>
          <TabsTrigger value="tratamientos">Tratamientos</TabsTrigger>
          <TabsTrigger value="radiografias">Radiografías</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="odontograma" className="mt-5">
          <OdontogramView patientId={patientId} />
        </TabsContent>
        <TabsContent value="historia" className="mt-5">
          <ClinicalHistoryForm patientId={patientId} />
        </TabsContent>
        <TabsContent value="tratamientos" className="mt-5">
          <PatientTreatments
            patientId={patientId}
            patientName={`${patient.first_name} ${patient.last_name}`}
          />
        </TabsContent>
        <TabsContent value="radiografias" className="mt-5">
          <RadiographGallery patientId={patientId} />
        </TabsContent>
        <TabsContent value="pagos" className="mt-5">
          <Placeholder text="Historial de pagos." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="p-12 text-center text-sm text-muted-foreground">
        {text}
      </CardContent>
    </Card>
  );
}
