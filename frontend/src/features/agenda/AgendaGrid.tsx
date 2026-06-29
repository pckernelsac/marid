import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import {
  blockGeometry,
  DAY_START_HOUR,
  HOUR_HEIGHT,
  HOURS,
  sameDay,
  slotToDate,
  SLOT_MINUTES,
} from "./calendar";
import { typeColor, type Appointment } from "./hooks";

interface Props {
  days: Date[];
  appointments: Appointment[];
  onSlotClick: (date: Date) => void;
  onAppointmentClick: (appt: Appointment) => void;
  onReschedule: (appt: Appointment, newStart: Date) => void;
}

const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;

export function AgendaGrid({
  days,
  appointments,
  onSlotClick,
  onAppointmentClick,
  onReschedule,
}: Props) {
  const [dragId, setDragId] = useState<number | null>(null);
  const gridHeight = HOURS.length * HOUR_HEIGHT;

  const apptsForDay = (day: Date) =>
    appointments.filter((a) => sameDay(new Date(a.starts_at), day));

  const handleDrop = (day: Date, hour: number, slot: number) => {
    if (dragId == null) return;
    const appt = appointments.find((a) => a.id === dragId);
    if (!appt) return;
    onReschedule(appt, slotToDate(day, hour, slot * SLOT_MINUTES));
    setDragId(null);
  };

  return (
    <div className="flex overflow-x-auto">
      {/* Hour gutter */}
      <div className="w-14 shrink-0 pt-10">
        {HOURS.map((h) => (
          <div
            key={h}
            className="relative text-right"
            style={{ height: HOUR_HEIGHT }}
          >
            <span className="absolute -top-2 right-2 text-xs text-slate-400 tabular-nums">
              {String(h).padStart(2, "0")}:00
            </span>
          </div>
        ))}
      </div>

      {/* Day columns */}
      <div className="flex flex-1">
        {days.map((day) => {
          const isToday = sameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className="min-w-[120px] flex-1 border-l border-slate-100"
            >
              <div
                className={cn(
                  "flex h-10 flex-col items-center justify-center border-b border-slate-100",
                  isToday && "bg-primary/5",
                )}
              >
                <span className="text-[11px] uppercase text-slate-400">
                  {format(day, "EEE", { locale: es })}
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    isToday && "text-primary",
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="relative" style={{ height: gridHeight }}>
                {/* hour lines + drop slots */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="border-b border-slate-100"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    {Array.from({ length: SLOTS_PER_HOUR }).map((_, s) => (
                      <div
                        key={s}
                        className="cursor-pointer transition hover:bg-sky-50/60"
                        style={{ height: HOUR_HEIGHT / SLOTS_PER_HOUR }}
                        onClick={() =>
                          onSlotClick(slotToDate(day, h, s * SLOT_MINUTES))
                        }
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(day, h, s)}
                      />
                    ))}
                  </div>
                ))}

                {/* appointment blocks */}
                {apptsForDay(day).map((a) => {
                  const start = new Date(a.starts_at);
                  const end = new Date(a.ends_at);
                  const { top, height } = blockGeometry(start, end);
                  const color = typeColor(a.appointment_type, a.color);
                  const dim =
                    a.status === "cancelled" || a.status === "no_show";
                  return (
                    <button
                      key={a.id}
                      draggable
                      onDragStart={() => setDragId(a.id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(a);
                      }}
                      className={cn(
                        "absolute left-1 right-1 overflow-hidden rounded-lg border-l-4 px-2 py-1 text-left text-xs shadow-sm transition hover:shadow-md",
                        dim && "opacity-50 line-through",
                      )}
                      style={{
                        top,
                        height: Math.max(height - 2, 18),
                        borderLeftColor: color,
                        background: `${color}14`,
                      }}
                      title={`${a.title} · ${format(start, "HH:mm")}–${format(end, "HH:mm")}`}
                    >
                      <p
                        className="truncate font-semibold"
                        style={{ color }}
                      >
                        {format(start, "HH:mm")} {a.patient_name ?? a.title}
                      </p>
                      {height > 34 && (
                        <p className="truncate text-slate-500">{a.title}</p>
                      )}
                    </button>
                  );
                })}

                {/* current-time indicator */}
                {isToday && <NowLine />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NowLine() {
  const now = new Date();
  const minutes = (now.getHours() - DAY_START_HOUR) * 60 + now.getMinutes();
  if (minutes < 0 || minutes > HOURS.length * 60) return null;
  const top = (minutes / 60) * HOUR_HEIGHT;
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
      style={{ top }}
    >
      <span className="h-2 w-2 rounded-full bg-rose-500" />
      <span className="h-px flex-1 bg-rose-500" />
    </div>
  );
}
