import { EmptyState } from "@/components/empty-state";
import { ExhibitionCard } from "@/components/exhibition-card";
import { SectionHeading } from "@/components/section-heading";
import { listClosingSoonExhibitions } from "@/lib/data";

export default async function ClosingPage() {
  const exhibitions = await listClosingSoonExhibitions();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Próximos 14 días"
        title="Por concluir"
        description="Exposiciones que están cerca de cerrar, ordenadas por la fecha de cierre más próxima."
      />
      {exhibitions.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {exhibitions.map((exhibition) => (
            <ExhibitionCard key={exhibition.id} exhibition={exhibition} closing />
          ))}
        </div>
      ) : (
        <EmptyState title="No hay cierres próximos" body="No se encontraron exposiciones aprobadas que terminen en los próximos 14 días." />
      )}
    </main>
  );
}
