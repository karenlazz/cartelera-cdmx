import { XMLParser } from "fast-xml-parser";
import { canFetchUrl } from "@/lib/ingest/robots";
import type { DetectedExhibition, SourceAdapter } from "@/lib/ingest/types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true
});

export const rssAdapter: SourceAdapter = {
  canHandle(source) {
    return source.source_type === "rss";
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
      return { status: "error", message: `RSS respondió HTTP ${response.status}.`, exhibitions: [] };
    }

    const xml = await response.text();
    const parsed = parser.parse(xml);
    const channel = parsed.rss?.channel ?? parsed.feed;
    const rawItems = channel?.item ?? channel?.entry ?? [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];

    const exhibitions: DetectedExhibition[] = items
      .filter(Boolean)
      .map((item: Record<string, any>) => {
        const link = normalizeLink(item.link) || source.url;
        return {
          title: String(item.title ?? "").trim(),
          museum_name: String(source.config?.museum_name ?? "") || null,
          description: stripHtml(String(item.description ?? item.summary ?? item.content ?? "")) || null,
          start_date: null,
          end_date: null,
          source_url: link,
          source_name: source.name,
          tags: ["rss"],
          raw_payload: item
        };
      })
      .filter((item) => item.title.length > 0);

    return {
      status: "success",
      message: `RSS procesado: ${exhibitions.length} entradas detectadas para revisión humana.`,
      exhibitions
    };
  }
};

function normalizeLink(value: unknown) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "href" in value) return String((value as { href: string }).href);
  return null;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
