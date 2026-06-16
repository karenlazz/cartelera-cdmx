import { statusLabel } from "@/lib/status";
import type { ExhibitionStatus } from "@/lib/types";

const styles: Record<ExhibitionStatus, string> = {
  upcoming: "border-violet/25 bg-violet/10 text-violet",
  current: "border-jade/25 bg-jade/10 text-jade",
  closing_soon: "border-clay/25 bg-clay/10 text-clay",
  closed: "border-ink/20 bg-ink/10 text-ink/65",
  new: "border-maize/40 bg-maize/20 text-ink"
};

export function StatusBadge({ status }: { status: ExhibitionStatus }) {
  return <span className={`inline-flex items-center border px-2 py-1 text-xs font-bold ${styles[status]}`}>{statusLabel(status)}</span>;
}
