import { format, isSameMonth } from "date-fns";

import { cn } from "@/lib/utils";
import { monthMatrix, sameDay } from "./calendar";
import { typeColor, type Appointment } from "./hooks";

interface Props {
  anchor: Date;
  appointments: Appointment[];
  onDayClick: (day: Date) => void;
  onAppointmentClick: (appt: Appointment) => void;
}

const WEEK_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function MonthView({
  anchor,
  appointments,
  onDayClick,
  onAppointmentClick,
}: Props) {
  const days = monthMatrix(anchor);

  const apptsForDay = (day: Date) =>
    appointments
      .filter((a) => sameDay(new Date(a.starts_at), day))
      .sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      );

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-slate-100">
        {WEEK_LABELS.map((w) => (
          <div
            key={w}
            className="py-2 text-center text-xs font-medium uppercase text-slate-400"
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const inMonth = isSameMonth(day, anchor);
          const isToday = sameDay(day, new Date());
          const list = apptsForDay(day);
          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[112px] cursor-pointer border-b border-r border-slate-100 p-1.5 transition hover:bg-slate-50/60",
                !inMonth && "bg-slate-50/40 text-slate-300",
              )}
            >
              <div className="mb-1 flex justify-end">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums",
                    isToday && "bg-primary font-semibold text-white",
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="space-y-1">
                {list.slice(0, 3).map((a) => {
                  const color = typeColor(a.appointment_type, a.color);
                  return (
                    <button
                      key={a.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(a);
                      }}
                      className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] hover:bg-white"
                      style={{ background: `${color}14` }}
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: color }}
                      />
                      <span className="truncate" style={{ color }}>
                        {format(new Date(a.starts_at), "HH:mm")}{" "}
                        {a.patient_name ?? a.title}
                      </span>
                    </button>
                  );
                })}
                {list.length > 3 && (
                  <p className="px-1 text-[11px] text-slate-400">
                    +{list.length - 3} más
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
