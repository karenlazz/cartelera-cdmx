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
    const museumName = String(source.config?.museum_name ?? "");
    const candidates = [
      ...extractSiteSpecificExhibitions(html, source.name, source.url, museumName),
      ...extractJsonLdEvents(html, source.name, source.url, museumName)
    ];

    if (candidates.length > 0) {
      return {
        status: "partial",
        message: `Se detectaron ${candidates.length} posibles exposiciones desde la fuente. Requieren revisión humana.`,
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

function extractSiteSpecificExhibitions(html: string, sourceName: string, sourceUrl: string, museumName: string): DetectedExhibition[] {
  const hostname = safeHostname(sourceUrl);
  const anchors = extractAnchors(html, sourceUrl);

  if (hostname.includes("muac.unam.mx")) {
    return anchors.flatMap((anchor) => parseMuacAnchor(anchor.text, anchor.href, sourceName, museumName));
  }

  if (hostname.includes("fundacionjumex.org")) {
    return anchors.flatMap((anchor) => parseJumexAnchor(anchor.text, anchor.href, sourceName, museumName));
  }

  if (hostname.includes("munal.mx")) {
    return anchors.flatMap((anchor) => parseMunalAnchor(anchor.text, anchor.href, sourceName, museumName));
  }

  return [];
}

function parseMuacAnchor(text: string, href: string, sourceName: string, museumName: string): DetectedExhibition[] {
  const match = text.match(/^(?:(?:salas?|sala)\s+[0-9,\sy]+)?\s*(.*?)\s+(\d{2}\.\d{2}\.\d{4})\s+(\d{2}\.\d{2}\.\d{4})$/i);
  if (!match) return [];

  const title = cleanupTitle(match[1]);
  if (!title) return [];

  const candidate = {
    title,
    museum_name: museumName || "Museo Universitario Arte Contemporáneo",
    start_date: parseDotDate(match[2]),
    end_date: parseDotDate(match[3]),
    source_url: href,
    source_name: sourceName,
    tags: ["oficial", "scraping"],
    raw_payload: { text }
  };

  return isClosed(candidate.end_date) ? [] : [candidate];
}

function parseJumexAnchor(text: string, href: string, sourceName: string, museumName: string): DetectedExhibition[] {
  const match = text.match(/^(.*?)\s+(\d{2})\.([A-ZÁÉÍÓÚ]{3})\.\s*-\s*(\d{2})\.([A-ZÁÉÍÓÚ]{3})\.(\d{4})$/i);
  if (!match) return [];

  const title = cleanupTitle(match[1]);
  if (!title || title.toLowerCase().startsWith("mini domingo") || title.toLowerCase().startsWith("concierto")) return [];

  const year = match[6];
  const candidate = {
    title,
    museum_name: museumName || "Museo Jumex",
    start_date: parseMonthDate(match[2], match[3], year),
    end_date: parseMonthDate(match[4], match[5], year),
    source_url: href,
    source_name: sourceName,
    tags: ["oficial", "scraping"],
    raw_payload: { text }
  };

  return isClosed(candidate.end_date) ? [] : [candidate];
}

function parseMunalAnchor(text: string, href: string, sourceName: string, museumName: string): DetectedExhibition[] {
  const match = text.match(/^(.*?)\s+(\d{2})\s*·\s*(\d{2})\s*·\s*(\d{4})\s*[—-]\s*(\d{2})\s*·\s*(\d{2})\s*·\s*(\d{4})$/i);
  if (!match) return [];

  const title = cleanupTitle(match[1]);
  if (!title || title.toLowerCase().includes("recorrido permanente")) return [];

  const candidate = {
    title,
    museum_name: museumName || "Museo Nacional de Arte",
    start_date: `${match[4]}-${match[3]}-${match[2]}`,
    end_date: `${match[7]}-${match[6]}-${match[5]}`,
    source_url: href,
    source_name: sourceName,
    tags: ["oficial", "scraping"],
    raw_payload: { text }
  };

  return isClosed(candidate.end_date) ? [] : [candidate];
}

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

function extractAnchors(html: string, baseUrl: string) {
  const anchors = Array.from(html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi));
  return anchors
    .map((match) => ({
      href: absolutizeUrl(match[1], baseUrl),
      text: stripHtml(decodeEntities(match[2]))
    }))
    .filter((anchor) => anchor.text.length > 0);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&ntilde;/g, "ñ");
}

function cleanupTitle(value: string) {
  return value
    .replace(/^Exposición actual\s+/i, "")
    .replace(/\s+HASTA EL:.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDotDate(value: string) {
  const [day, month, year] = value.split(".");
  return `${year}-${month}-${day}`;
}

function parseMonthDate(day: string, month: string, year: string) {
  const months: Record<string, string> = {
    ENE: "01",
    FEB: "02",
    MAR: "03",
    ABR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AGO: "08",
    SEP: "09",
    OCT: "10",
    NOV: "11",
    DIC: "12"
  };

  const normalizedMonth = months[month.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()];
  if (!normalizedMonth) return null;
  return `${year}-${normalizedMonth}-${day}`;
}

function isClosed(endDate: string | null) {
  if (!endDate) return false;
  return new Date(`${endDate}T00:00:00`) < new Date(new Date().toDateString());
}

function absolutizeUrl(url: string, baseUrl: string) {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

function safeHostname(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
}
