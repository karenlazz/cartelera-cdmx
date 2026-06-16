import { EmptyState } from "@/components/empty-state";
import { ExhibitionCard } from "@/components/exhibition-card";
import { SectionHeading } from "@/components/section-heading";
import { listNewExhibitions } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewPage() {
  const exhibitions = await listNewExhibitions();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Últimos 14 días"
        title="Nuevas exposiciones"
        description="Exposiciones agregadas recientemente, ordenadas de la más reciente a la más antigua."
      />
      {exhibitions.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {exhibitions.map((exhibition) => (
            <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
          ))}
        </div>
      ) : (
        <EmptyState title="Sin exposiciones nuevas" body="No hay exposiciones aprobadas agregadas durante los últimos 14 días." />
      )}
    </main>
  );
}
