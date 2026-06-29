import { Outlet } from "react-router-dom";

import { DentalBackground } from "@/components/DentalBackground";
import { MobileSidebar, Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SidebarProvider } from "./sidebar-context";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50">
        <DentalBackground
          id="app-dental-pattern"
          color="#3b82f6"
          opacity={0.07}
          className="no-print fixed"
        />
        <Sidebar />
        <MobileSidebar />
        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-[1400px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
