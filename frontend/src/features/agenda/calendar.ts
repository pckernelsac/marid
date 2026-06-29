import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export type CalendarView = "day" | "week" | "month";

/** Clinic working hours shown on the time grid. */
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;
export const SLOT_MINUTES = 30;
export const HOUR_HEIGHT = 56; // px per hour

export const HOURS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, i) => DAY_START_HOUR + i,
);

/** Local naive ISO ("YYYY-MM-DDTHH:mm:ss") to avoid timezone drift. */
export function toLocalISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end: addDays(start, 6) });
}

export function monthMatrix(anchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function rangeFor(view: CalendarView, anchor: Date): [Date, Date] {
  if (view === "day") {
    const s = startOfDay(anchor);
    return [s, addDays(s, 1)];
  }
  if (view === "week") {
    const s = startOfWeek(anchor, { weekStartsOn: 1 });
    return [s, addDays(s, 7)];
  }
  const s = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  const e = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
  return [s, addDays(e, 1)];
}

/** Vertical offset & height in px for an appointment within a day column. */
export function blockGeometry(start: Date, end: Date) {
  const minutesFromTop =
    (start.getHours() - DAY_START_HOUR) * 60 + start.getMinutes();
  const durationMin = Math.max((end.getTime() - start.getTime()) / 60000, 15);
  return {
    top: (minutesFromTop / 60) * HOUR_HEIGHT,
    height: (durationMin / 60) * HOUR_HEIGHT,
  };
}

/** Build a Date for a given day + slot index (used when clicking an empty slot). */
export function slotToDate(day: Date, hour: number, minutes = 0): Date {
  const d = new Date(day);
  d.setHours(hour, minutes, 0, 0);
  return d;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
