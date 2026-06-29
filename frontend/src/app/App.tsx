import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PatientsPage } from "@/pages/PatientsPage";
import { PatientProfilePage } from "@/pages/PatientProfilePage";
import { OdontogramPage } from "@/pages/OdontogramPage";
import { ClinicalHistoryPage } from "@/pages/ClinicalHistoryPage";
import { TreatmentsPage } from "@/pages/TreatmentsPage";
import { CajaPage } from "@/pages/CajaPage";
import { AgendaPage } from "@/pages/AgendaPage";
import { BudgetsPage } from "@/pages/BudgetsPage";
import { BudgetPrintPage } from "@/pages/BudgetPrintPage";
import { ConfiguracionPage } from "@/pages/ConfiguracionPage";
import { RadiographsPage } from "@/pages/RadiographsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { ProtectedRoute } from "./ProtectedRoute";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="presupuestos/:id/imprimir" element={<BudgetPrintPage />} />
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="pacientes" element={<PatientsPage />} />
            <Route path="pacientes/:code" element={<PatientProfilePage />} />
            <Route path="odontograma" element={<OdontogramPage />} />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="historia" element={<ClinicalHistoryPage />} />
            <Route path="radiografias" element={<RadiographsPage />} />
            <Route path="tratamientos" element={<TreatmentsPage />} />
            <Route path="presupuestos" element={<BudgetsPage />} />
            <Route path="caja" element={<CajaPage />} />
            <Route path="reportes" element={<ReportsPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
