import type { Source, UpdateLog } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function SourceLogPanels({ sources, logs }: { sources: Source[]; logs: UpdateLog[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="grid gap-3">
        <h2 className="font-[var(--font-source-serif)] text-2xl font-semibold text-ink">Fuentes activas</h2>
        {sources.map((source) => (
          <article key={source.id} className="border border-ink/10 bg-white p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-ink">{source.name}</h3>
              <span className={source.active ? "text-jade" : "text-clay"}>{source.active ? "Activa" : "Inactiva"}</span>
            </div>
            <p className="mt-2 break-all text-ink/65">{source.url}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-ink/45">
              {source.source_type} · cada {source.update_frequency} · prioridad {source.priority} · última consulta {formatDate(source.last_checked_at)}
            </p>
          </article>
        ))}
      </section>
      <section className="grid gap-3">
        <h2 className="font-[var(--font-source-serif)] text-2xl font-semibold text-ink">Logs de actualización</h2>
        {logs.length === 0 ? <p className="border border-dashed border-ink/20 bg-white/60 p-4 text-sm text-ink/65">Aún no hay logs.</p> : null}
        {logs.map((log) => (
          <article key={log.id} className="border border-ink/10 bg-white p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-ink">{log.sources?.name ?? "Fuente no disponible"}</h3>
              <span className="font-bold uppercase tracking-[0.14em] text-ink/45">{log.status}</span>
            </div>
            <p className="mt-2 text-ink/65">{log.message ?? "Sin mensaje"}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-ink/45">
              {log.exhibitions_found} hallazgos · {formatDate(log.created_at)}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
