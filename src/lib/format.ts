import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(value: string | null) {
  if (!value) return "Información no disponible";
  return format(parseISO(value), "d MMM yyyy", { locale: es });
}

export function fallback(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "Información no disponible";
  return String(value);
}

export function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return new URL(path, base).toString();
}
