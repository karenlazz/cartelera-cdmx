import { canFetchUrl } from "@/lib/ingest/robots";
import type { DetectedExhibition, SourceAdapter } from "@/lib/ingest/types";

export const htmlAdapter: SourceAdapter = {
  canHandle(source) {
    return ["official_site", "cultural_listing", "media_blog", "institutional"].includes(source.source_type);
  },
  async fetch(source) {
    if (!(await canFetchUrl(source.url))) {
      return { status: "skipped", message: "robots.txt no permite consultar esta fuente.", exhibitions: [] };
    }

    const response = await fetch(source.url, {
      headers: { "user-agent": "CDMXExhibitionsBot/0.1 (+contacto pendiente)" },
      next: { revalidate: 60 * 60 }
    });

    if (!response.ok) {
      return { status: "error", message: `Fuente respondió HTTP ${response.status}.`, exhibitions: [] };
    }

    const html = await response.text();
    const candidates = extractJsonLdEvents(html, source.name, source.url, String(source.config?.museum_name ?? ""));

    if (candidates.length > 0) {
      return {
        status: "partial",
        message: `Se detectaron ${candidates.length} posibles eventos desde JSON-LD. Requieren revisión humana.`,
        exhibitions: candidates
      };
    }

    return {
      status: "success",
      message:
        "Fuente consultada correctamente. No se detectaron datos estructurados; requiere adapter específico o carga manual.",
      exhibitions: []
    };
  }
};

function extractJsonLdEvents(html: string, sourceName: string, sourceUrl: string, museumName: string): DetectedExhibition[] {
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  const events: DetectedExhibition[] = [];

  for (const script of scripts) {
    const jsonText = script.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "").trim();
    try {
      const parsed = JSON.parse(jsonText);
      const nodes = flattenJsonLd(parsed);
      for (const node of nodes) {
        const type = Array.isArray(node["@type"]) ? node["@type"].join(" ") : node["@type"];
        if (!String(type ?? "").toLowerCase().includes("event") || !node.name) continue;

        events.push({
          title: String(node.name),
          museum_name: museumName || null,
          description: node.description ? String(node.description) : null,
          start_date: normalizeDate(node.startDate),
          end_date: normalizeDate(node.endDate),
          image_url: Array.isArray(node.image) ? node.image[0] : node.image ?? null,
          source_url: node.url ? String(node.url) : sourceUrl,
          source_name: sourceName,
          tags: ["json-ld"],
          raw_payload: node
        });
      }
    } catch {
      continue;
    }
  }

  return events;
}

function flattenJsonLd(value: any): Record<string, any>[] {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  if (value?.["@graph"]) return flattenJsonLd(value["@graph"]);
  if (value && typeof value === "object") return [value];
  return [];
}

function normalizeDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}
