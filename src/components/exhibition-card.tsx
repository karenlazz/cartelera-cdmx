import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { formatDate, fallback } from "@/lib/format";
import { closingLabel } from "@/lib/status";
import type { Exhibition } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";

export function ExhibitionCard({ exhibition, closing = false }: { exhibition: Exhibition; closing?: boolean }) {
  return (
    <article className="group grid overflow-hidden border border-ink/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-editorial">
      <div className="relative aspect-[16/9] bg-fog">
        {exhibition.image_url ? (
          <Image
            src={exhibition.image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#e7e0d5,#ffffff)] px-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-ink/35">
            Imagen no disponible
          </div>
        )}
      </div>
      <div className="grid gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={exhibition.status} />
          {closing ? <span className="border border-clay/25 bg-clay/10 px-2 py-1 text-xs font-bold text-clay">{closingLabel(exhibition.end_date)}</span> : null}
        </div>
        <div>
          <h2 className="font-[var(--font-source-serif)] text-2xl font-semibold leading-tight text-ink">{exhibition.title}</h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/68">{fallback(exhibition.description)}</p>
        </div>
        <dl className="grid gap-2 text-sm text-ink/72">
          <div className="flex gap-2">
            <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-jade" />
            <span>{fallback(exhibition.museums?.name)} · {fallback(exhibition.museums?.borough)}</span>
          </div>
          <div className="flex gap-2">
            <CalendarDays aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-jade" />
            <span>{formatDate(exhibition.start_date)} - {formatDate(exhibition.end_date)}</span>
          </div>
        </dl>
        {exhibition.source_url ? (
          <Link
            href={exhibition.source_url}
            target="_blank"
            className="focus-ring inline-flex w-fit items-center gap-2 text-sm font-bold text-jade hover:text-ink"
          >
            Fuente original
            <ExternalLink aria-hidden className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
