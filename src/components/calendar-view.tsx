"use client";

import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { Exhibition } from "@/lib/types";
import { ExhibitionModal } from "@/components/exhibition-modal";

export function CalendarView({ exhibitions }: { exhibitions: Exhibition[] }) {
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState<Exhibition | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-ink/10 bg-white p-4">
        <h2 className="font-[var(--font-source-serif)] text-3xl font-semibold text-ink">
          {format(month, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth((value) => subMonths(value, 1))}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center border border-ink/10 bg-paper hover:bg-fog"
            aria-label="Mes anterior"
          >
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setMonth(new Date())}
            className="focus-ring h-10 border border-ink/10 bg-paper px-4 text-sm font-bold hover:bg-fog"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setMonth((value) => addMonths(value, 1))}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center border border-ink/10 bg-paper hover:bg-fog"
            aria-label="Mes siguiente"
          >
            <ChevronRight aria-hidden className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-l border-t border-ink/10 bg-white text-xs font-bold uppercase tracking-[0.14em] text-ink/45">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
          <div key={day} className="border-b border-r border-ink/10 p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 border-l border-t border-ink/10 bg-white sm:grid-cols-7">
        {days.map((day) => {
          const events = eventsForDay(day, exhibitions);
          return (
            <div
              key={day.toISOString()}
              className={`min-h-36 border-b border-r border-ink/10 p-2 ${isSameMonth(day, month) ? "bg-white" : "bg-paper/70 text-ink/40"}`}
            >
              <div className={`mb-2 inline-flex h-7 w-7 items-center justify-center text-sm font-bold ${isSameDay(day, new Date()) ? "bg-clay text-white" : ""}`}>
                {format(day, "d")}
              </div>
              <div className="grid gap-1">
                {events.slice(0, 3).map((event) => (
                  <button
                    key={`${event.id}-${day.toISOString()}`}
                    type="button"
                    onClick={() => setSelected(event)}
                    className="focus-ring w-full truncate bg-jade px-2 py-1 text-left text-xs font-bold text-white hover:bg-ink"
                    title={event.title}
                  >
                    {event.title}
                  </button>
                ))}
                {events.length > 3 ? <span className="text-xs font-bold text-ink/45">+{events.length - 3} más</span> : null}
              </div>
            </div>
          );
        })}
      </div>
      <ExhibitionModal exhibition={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function eventsForDay(day: Date, exhibitions: Exhibition[]) {
  return exhibitions.filter((exhibition) => {
    const start = exhibition.start_date ? parseISO(exhibition.start_date) : null;
    const end = exhibition.end_date ? parseISO(exhibition.end_date) : start;
    if (!start || !end) return false;
    return day >= start && day <= end;
  });
}
