import { SectionHeading } from "@/components/section-heading";
import { SubscribeForm } from "@/components/subscribe-form";
import { listMuseums } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SubscribePage() {
  const museums = await listMuseums();
  const boroughs = Array.from(new Set(museums.map((museum) => museum.borough).filter(Boolean))) as string[];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Newsletter semanal"
        title="Suscribirme"
        description="Recibe nuevas exposiciones, cierres próximos y una selección de exposiciones actuales cada lunes."
      />
      <SubscribeForm museums={museums} boroughs={boroughs} />
    </main>
  );
}
