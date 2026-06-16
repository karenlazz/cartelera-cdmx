import { differenceInCalendarDays, isAfter, isBefore, parseISO } from "date-fns";
import type { Exhibition, ExhibitionStatus } from "@/lib/types";

export function calculateStatus(exhibition: Pick<Exhibition, "created_at" | "start_date" | "end_date">): ExhibitionStatus {
  const today = startOfLocalDay(new Date());
  const createdAt = parseISO(exhibition.created_at);
  const startDate = exhibition.start_date ? startOfLocalDay(parseISO(exhibition.start_date)) : null;
  const endDate = exhibition.end_date ? startOfLocalDay(parseISO(exhibition.end_date)) : null;

  if (endDate && isBefore(endDate, today)) return "closed";
  if (differenceInCalendarDays(today, createdAt) <= 14) return "new";
  if (endDate && differenceInCalendarDays(endDate, today) <= 14 && !isBefore(endDate, today)) return "closing_soon";
  if (startDate && isAfter(startDate, today)) return "upcoming";
  return "current";
}

export function statusLabel(status: ExhibitionStatus) {
  const labels: Record<ExhibitionStatus, string> = {
    upcoming: "Próximamente",
    current: "Abierta",
    closing_soon: "Por concluir",
    closed: "Concluida",
    new: "Nueva"
  };

  return labels[status];
}

export function closingLabel(endDate: string | null) {
  if (!endDate) return "Fecha no disponible";

  const days = differenceInCalendarDays(startOfLocalDay(parseISO(endDate)), startOfLocalDay(new Date()));
  if (days < 0) return "Ya concluyó";
  if (days === 0) return "Cierra hoy";
  if (days === 1) return "Cierra mañana";
  if (days <= 7) return "Cierra esta semana";
  return `Cierra en ${days} días`;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
