import type { Source } from "@/lib/types";

export type DetectedExhibition = {
  title: string;
  museum_name?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  schedule?: string | null;
  price?: string | null;
  image_url?: string | null;
  source_url: string;
  source_name: string;
  tags?: string[];
  raw_payload?: Record<string, unknown>;
};

export type AdapterResult = {
  status: "success" | "partial" | "error" | "skipped";
  message: string;
  exhibitions: DetectedExhibition[];
};

export type SourceAdapter = {
  canHandle(source: Source): boolean;
  fetch(source: Source): Promise<AdapterResult>;
};
