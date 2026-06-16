import { CalendarView } from "@/components/calendar-view";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { listPublicExhibitions } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const exhibitions = await listPublicExhibitions();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Vista calendario"
        title="Calendario de exposiciones"
        description="Cada exposición aprobada aparece entre su fecha de inicio y cierre. Al seleccionarla se abre la ficha con fuente, horarios, costo y última actualización."
      />
      {exhibitions.length > 0 ? (
        <CalendarView exhibitions={exhibitions} />
      ) : (
        <EmptyState
          title="Calendario sin eventos publicados"
          body="Cuando apruebes exposiciones detectadas o cargadas manualmente, aparecerán aquí como eventos de calendario."
        />
      )}
    </main>
  );
}
