import { createExhibition, listSources } from "@/lib/data";
import { getServiceSupabase } from "@/lib/supabase";
import { htmlAdapter } from "@/lib/ingest/adapters/html";
import { manualAdapter } from "@/lib/ingest/adapters/manual";
import { rssAdapter } from "@/lib/ingest/adapters/rss";
import { isDuplicate } from "@/lib/ingest/dedupe";
import type { DetectedExhibition, SourceAdapter } from "@/lib/ingest/types";
import type { Museum, Source } from "@/lib/types";

const adapters: SourceAdapter[] = [manualAdapter, rssAdapter, htmlAdapter];

export async function updateAllSources() {
  const sources = (await listSources()).filter((source) => source.active);
  const results = [];

  for (const source of sources) {
    if (!isDue(source)) {
      await writeLog(source.id, "skipped", `Frecuencia ${source.update_frequency}: aún no requiere actualización.`, 0);
      results.push({ source: source.name, status: "skipped", inserted: 0 });
      continue;
    }

    results.push(await updateOneSource(source));
  }

  return results;
}

export async function updateOneSource(source: Source) {
  const adapter = adapters.find((candidate) => candidate.canHandle(source));
  const supabase = getServiceSupabase();

  if (!adapter) {
    await writeLog(source.id, "skipped", "No existe adapter para este tipo de fuente.", 0);
    return { source: source.name, status: "skipped", inserted: 0 };
  }

  try {
    const result = await adapter.fetch(source);
    const inserted = await persistDetectedExhibitions(result.exhibitions);

    if (supabase) {
      await supabase.from("sources").update({ last_checked_at: new Date().toISOString() }).eq("id", source.id);
    }

    await writeLog(source.id, result.status, result.message, result.exhibitions.length);
    return { source: source.name, status: result.status, inserted };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    await writeLog(source.id, "error", message, 0);
    return { source: source.name, status: "error", inserted: 0, message };
  }
}

async function persistDetectedExhibitions(candidates: DetectedExhibition[]) {
  if (candidates.length === 0) return 0;

  const supabase = getServiceSupabase();
  if (!supabase) return 0;

  const [{ data: museums }, { data: existing }] = await Promise.all([
    supabase.from("museums").select("*"),
    supabase.from("exhibitions").select("*, museums(*)").neq("moderation_status", "deleted")
  ]);
  let inserted = 0;

  for (const candidate of candidates) {
    if (isDuplicate(candidate, existing ?? [])) continue;

    const museum = findMuseum(candidate.museum_name, museums ?? []);
    await createExhibition({
      title: candidate.title,
      museum_id: museum?.id ?? null,
      description: candidate.description ?? null,
      start_date: candidate.start_date ?? null,
      end_date: candidate.end_date ?? null,
      schedule: candidate.schedule ?? null,
      price: candidate.price ?? null,
      image_url: candidate.image_url ?? null,
      source_url: candidate.source_url,
      source_name: candidate.source_name,
      moderation_status: shouldAutoApprove(candidate) ? "approved" : "detected",
      tags: candidate.tags ?? [],
      raw_payload: candidate.raw_payload ?? {},
      last_checked_at: new Date().toISOString()
    });
    inserted += 1;
  }

  return inserted;
}

async function writeLog(sourceId: string, status: "success" | "partial" | "error" | "skipped", message: string, found: number) {
  const supabase = getServiceSupabase();
  if (!supabase) return;

  await supabase.from("update_logs").insert({
    source_id: sourceId,
    status,
    message,
    exhibitions_found: found
  });
}

function findMuseum(name: string | null | undefined, museums: Museum[]) {
  if (!name) return null;
  const normalized = name.toLowerCase();
  return museums.find((museum) => museum.name.toLowerCase() === normalized) ?? null;
}

function isDue(source: Source) {
  if (!source.last_checked_at) return true;
  const intervalMs = parseFrequency(source.update_frequency);
  if (!intervalMs) return true;
  return Date.now() - new Date(source.last_checked_at).getTime() >= intervalMs;
}

function parseFrequency(value: string) {
  const match = value.trim().match(/^(\d+)\s*([hm])$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  return unit === "h" ? amount * 60 * 60 * 1000 : amount * 60 * 1000;
}

function shouldAutoApprove(candidate: DetectedExhibition) {
  return Boolean(candidate.start_date && candidate.end_date && candidate.tags?.includes("oficial"));
}
