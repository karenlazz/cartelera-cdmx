import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles, Timer } from "lucide-react";
import { ExhibitionCard } from "@/components/exhibition-card";
import { FilterBar } from "@/components/filter-bar";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { listMuseums, listPublicExhibitions } from "@/lib/data";
import type { ExhibitionFilters } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const museums = await listMuseums();
  const filters: ExhibitionFilters = {
    q: stringParam(searchParams.q),
    museum: stringParam(searchParams.museum),
    borough: stringParam(searchParams.borough),
    status: stringParam(searchParams.status) as ExhibitionFilters["status"],
    from: stringParam(searchParams.from)
  };
  const exhibitions = (await listPublicExhibitions(filters)).filter((item) =>
    filters.borough ? item.museums?.borough === filters.borough : true
  );
  const boroughs = Array.from(new Set(museums.map((museum) => museum.borough).filter(Boolean))) as string[];

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-clay">Museos y espacios expositivos de CDMX</p>
          <h1 className="font-[var(--font-source-serif)] text-5xl font-semibold leading-[0.96] text-ink sm:text-7xl">
            Cartelera Temporal CDMX
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/72">
            Una plataforma para reunir exposiciones temporales verificables, con calendario, detecciones recientes, cierres próximos y validación humana antes de publicar.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <QuickLink href="/calendario" label="Calendario" icon={<CalendarDays className="h-4 w-4" />} />
            <QuickLink href="/nuevas" label="Nuevas" icon={<Sparkles className="h-4 w-4" />} />
            <QuickLink href="/por-concluir" label="Por concluir" icon={<Timer className="h-4 w-4" />} />
          </div>
        </div>
        <div className="grid content-end gap-3 border-l-4 border-clay bg-white p-6 shadow-editorial">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-ink/45">MVP operativo</p>
          <p className="font-[var(--font-source-serif)] text-3xl leading-tight text-ink">
            RSS, scraping prudente, carga manual y revisión editorial en un solo flujo.
          </p>
          <p className="text-sm leading-6 text-ink/65">
            Las fuentes oficiales tienen prioridad; cuando una página no entrega datos completos, la detección queda pendiente para corrección desde admin.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <FilterBar museums={museums} boroughs={boroughs} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <SectionHeading
          eyebrow="Exposiciones actuales"
          title="Destacadas"
          description="La lista se llena con exposiciones aprobadas desde Supabase. Sin credenciales o sin datos aprobados, la app mantiene el flujo listo sin inventar contenido."
        />
        {exhibitions.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {exhibitions.slice(0, 9).map((exhibition) => (
              <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aún no hay exposiciones aprobadas"
            body="Agrega fuentes, ejecuta el job de actualización o carga exposiciones manuales desde el panel admin. Los museos semilla ya están listos."
          />
        )}
      </section>
    </main>
  );
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="focus-ring inline-flex h-11 items-center gap-2 bg-ink px-4 text-sm font-bold text-white hover:bg-jade">
      {icon}
      {label}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
