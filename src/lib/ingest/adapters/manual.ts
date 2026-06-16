import type { SourceAdapter } from "@/lib/ingest/types";

export const manualAdapter: SourceAdapter = {
  canHandle(source) {
    return source.source_type === "manual";
  },
  async fetch() {
    return {
      status: "skipped",
      message: "Fuente manual: se gestiona desde el panel de administración.",
      exhibitions: []
    };
  }
};
