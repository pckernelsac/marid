import { useMemo, useState } from "react";
import { addDays, addMonths, format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AgendaGrid } from "@/features/agenda/AgendaGrid";
import { MonthView } from "@/features/agenda/MonthView";
import {
  AppointmentPanel,
  type PanelInitial,
} from "@/features/agenda/AppointmentPanel";
import {
  rangeFor,
  toLocalISO,
  weekDays,
  type CalendarView,
} from "@/features/agenda/calendar";
import {
  useAppointments,
  useUpdateAppointment,
  type Appointment,
} from "@/features/agenda/hooks";

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

export function AgendaPage() {
  const [view, setView] = useState<CalendarView>("week");
  const [anchor, setAnchor] = useState(new Date());
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [initial, setInitial] = useState<PanelInitial | undefined>();

  const update = useUpdateAppointment();

  const [from, to] = useMemo(() => rangeFor(view, anchor), [view, anchor]);
  const { data: appointments } = useAppointments(
    toLocalISO(from),
    toLocalISO(to),
  );

  const navigate = (dir: number) => {
    if (view === "day") setAnchor((d) => addDays(d, dir));
    else if (view === "week") setAnchor((d) => addDays(d, dir * 7));
    else setAnchor((d) => addMonths(d, dir));
  };

  const openNew = (date: Date) => {
    const end = new Date(date);
    end.setMinutes(end.getMinutes() + 30);
    setEditing(null);
    setInitial({ start: date, end });
    setPanelOpen(true);
  };

  const openEdit = (appt: Appointment) => {
    setEditing(appt);
    setInitial(undefined);
    setPanelOpen(true);
  };

  const reschedule = async (appt: Appointment, newStart: Date) => {
    const duration =
      new Date(appt.ends_at).getTime() - new Date(appt.starts_at).getTime();
    const newEnd = new Date(newStart.getTime() + duration);
    try {
      await update.mutateAsync({
        id: appt.id,
        data: { starts_at: toLocalISO(newStart), ends_at: toLocalISO(newEnd) },
      });
      toast.success("Cita reprogramada");
    } catch {
      toast.error("No se pudo reprogramar");
    }
  };

  const title = useMemo(() => {
    if (view === "month") return format(anchor, "MMMM yyyy", { locale: es });
    if (view === "day")
      return format(anchor, "EEEE d 'de' MMMM", { locale: es });
    const days = weekDays(anchor);
    return `${format(days[0], "d MMM", { locale: es })} – ${format(days[6], "d MMM", { locale: es })}`;
  }, [view, anchor]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
          <p className="text-sm capitalize text-muted-foreground">{title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {VIEWS.map((v) => (
              <button
                key={v.value}
                onClick={() => setView(v.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  view === v.value
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnchor(new Date())}
            >
              Hoy
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => openNew(defaultSlot(anchor))}>
            <Plus className="h-4 w-4" /> Cita
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {view === "month" ? (
          <MonthView
            anchor={anchor}
            appointments={appointments ?? []}
            onDayClick={(day) => {
              setAnchor(day);
              setView("day");
            }}
            onAppointmentClick={openEdit}
          />
        ) : (
          <AgendaGrid
            days={view === "day" ? [anchor] : weekDays(anchor)}
            appointments={appointments ?? []}
            onSlotClick={openNew}
            onAppointmentClick={openEdit}
            onReschedule={reschedule}
          />
        )}
      </Card>

      <AppointmentPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        initial={initial}
        appointment={editing}
      />
    </div>
  );
}

function defaultSlot(anchor: Date): Date {
  const d = new Date(anchor);
  d.setHours(9, 0, 0, 0);
  return d;
}
