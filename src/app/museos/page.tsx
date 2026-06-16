import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { fallback } from "@/lib/format";
import { listMuseums } from "@/lib/data";

export default async function MuseumsPage() {
  const museums = await listMuseums();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Recintos semilla"
        title="Museos"
        description="Base inicial de recintos relevantes de CDMX. Puedes agregar más desde Supabase o extender el panel admin."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {museums.map((museum) => (
          <article key={museum.id} className="grid gap-4 border border-ink/10 bg-white p-5 shadow-sm">
            <h2 className="font-[var(--font-source-serif)] text-2xl font-semibold leading-tight text-ink">{museum.name}</h2>
            <p className="flex gap-2 text-sm leading-6 text-ink/68">
              <MapPin aria-hidden className="mt-1 h-4 w-4 shrink-0 text-jade" />
              {fallback(museum.address)} · {fallback(museum.borough)}
            </p>
            {museum.website_url ? (
              <Link href={museum.website_url} target="_blank" className="focus-ring inline-flex w-fit items-center gap-2 text-sm font-bold text-jade hover:text-ink">
                Sitio oficial
                <ExternalLink aria-hidden className="h-4 w-4" />
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </main>
  );
}
