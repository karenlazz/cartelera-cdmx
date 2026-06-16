import type { Subscriber } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function SubscriberPanel({ subscribers }: { subscribers: Subscriber[] }) {
  return (
    <section className="grid gap-3">
      <h2 className="font-[var(--font-source-serif)] text-2xl font-semibold text-ink">Suscriptores</h2>
      {subscribers.length === 0 ? <p className="border border-dashed border-ink/20 bg-white/60 p-4 text-sm text-ink/65">Aún no hay suscriptores.</p> : null}
      <div className="grid gap-2">
        {subscribers.map((subscriber) => (
          <article key={subscriber.id} className="flex flex-wrap items-center justify-between gap-3 border border-ink/10 bg-white p-3 text-sm">
            <div>
              <h3 className="font-bold text-ink">{subscriber.email}</h3>
              <p className="text-xs uppercase tracking-[0.14em] text-ink/45">
                {subscriber.active ? "Activo" : "Inactivo"} · {formatDate(subscriber.created_at)}
              </p>
            </div>
            <code className="max-w-full overflow-auto bg-paper px-2 py-1 text-xs text-ink/65">
              {JSON.stringify(subscriber.preferences)}
            </code>
          </article>
        ))}
      </div>
    </section>
  );
}
