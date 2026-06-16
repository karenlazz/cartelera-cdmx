"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { fallback, formatDate } from "@/lib/format";
import type { Exhibition } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";

export function ExhibitionModal({ exhibition, onClose }: { exhibition: Exhibition | null; onClose: () => void }) {
  if (!exhibition) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4" role="dialog" aria-modal="true">
      <article className="max-h-[90vh] w-full max-w-3xl overflow-auto bg-paper shadow-editorial">
        <div className="relative aspect-[16/7] bg-fog">
          {exhibition.image_url ? (
            <Image src={exhibition.image_url} alt="" fill sizes="100vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-bold uppercase tracking-[0.18em] text-ink/35">
              Imagen no disponible
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="focus-ring absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center bg-white text-ink shadow-sm"
            aria-label="Cerrar ficha"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-6 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={exhibition.status} />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">
              Actualizado {formatDate(exhibition.last_checked_at ?? exhibition.updated_at)}
            </span>
          </div>
          <div>
            <h2 className="font-[var(--font-source-serif)] text-4xl font-semibold leading-tight text-ink">{exhibition.title}</h2>
            <p className="mt-3 text-base leading-7 text-ink/70">{fallback(exhibition.description)}</p>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Detail label="Museo o recinto" value={exhibition.museums?.name} />
            <Detail label="Alcaldía" value={exhibition.museums?.borough} />
            <Detail label="Dirección" value={exhibition.museums?.address} />
            <Detail label="Fecha de inicio" value={formatDate(exhibition.start_date)} />
            <Detail label="Fecha de cierre" value={formatDate(exhibition.end_date)} />
            <Detail label="Horarios" value={exhibition.schedule} />
            <Detail label="Costo" value={exhibition.price} />
            <Detail label="Fuente" value={exhibition.source_name} />
          </dl>
          {exhibition.source_url ? (
            <Link
              href={exhibition.source_url}
              target="_blank"
              className="focus-ring inline-flex w-fit items-center gap-2 bg-jade px-4 py-3 text-sm font-bold text-white hover:bg-ink"
            >
              Abrir fuente oficial
              <ExternalLink aria-hidden className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </article>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="border border-ink/10 bg-white p-3">
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">{label}</dt>
      <dd className="mt-1 text-ink/78">{fallback(value)}</dd>
    </div>
  );
}
