import type { DetectedExhibition } from "@/lib/ingest/types";
import type { Exhibition } from "@/lib/types";

export function normalizeKey(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function buildDedupeKey(value: Pick<DetectedExhibition, "title" | "museum_name" | "start_date" | "end_date" | "source_url">) {
  return [value.title, value.museum_name, value.start_date, value.end_date, value.source_url].map(normalizeKey).join("|");
}

export function isDuplicate(candidate: DetectedExhibition, existing: Exhibition[]) {
  const candidateKey = buildDedupeKey(candidate);
  return existing.some((item) => {
    const existingKey = buildDedupeKey({
      title: item.title,
      museum_name: item.museums?.name,
      start_date: item.start_date,
      end_date: item.end_date,
      source_url: item.source_url ?? ""
    });

    return existingKey === candidateKey;
  });
}
