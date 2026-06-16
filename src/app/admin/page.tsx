import { AdminGate } from "@/components/admin/admin-gate";
import { ExhibitionTable } from "@/components/admin/exhibition-table";
import { ManualExhibitionForm } from "@/components/admin/manual-exhibition-form";
import { SourceLogPanels } from "@/components/admin/source-log-panels";
import { SubscriberPanel } from "@/components/admin/subscriber-panel";
import { SectionHeading } from "@/components/section-heading";
import { listAdminExhibitions, listMuseums, listSources, listSubscribers, listUpdateLogs } from "@/lib/data";

export default async function AdminPage({
  searchParams
}: {
  searchParams: { token?: string; moderation?: "detected" | "approved" | "hidden" | "deleted" | "all" };
}) {
  const configuredToken = process.env.ADMIN_TOKEN;
  const token = searchParams.token ?? "";
  const isAllowed = !configuredToken || token === configuredToken;

  if (!isAllowed) return <AdminGate />;

  const moderation = searchParams.moderation ?? "detected";
  const [exhibitions, museums, sources, logs, subscribers] = await Promise.all([
    listAdminExhibitions(moderation),
    listMuseums(),
    listSources(),
    listUpdateLogs(),
    listSubscribers()
  ]);

  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Validación humana"
        title="Panel de administración"
        description="Revisa detecciones automáticas, corrige campos incompletos, aprueba publicaciones y consulta fuentes o logs de actualización."
      />

      <nav className="flex flex-wrap gap-2">
        {["detected", "approved", "hidden", "deleted", "all"].map((item) => (
          <a
            key={item}
            href={`/admin?token=${encodeURIComponent(token)}&moderation=${item}`}
            className={`focus-ring border px-3 py-2 text-sm font-bold ${
              moderation === item ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink hover:bg-fog"
            }`}
          >
            {item}
          </a>
        ))}
      </nav>

      <ManualExhibitionForm museums={museums} token={token} />

      <section className="grid gap-4">
        <h2 className="font-[var(--font-source-serif)] text-3xl font-semibold text-ink">Exposiciones detectadas</h2>
        <ExhibitionTable exhibitions={exhibitions} museums={museums} token={token} />
      </section>

      <SourceLogPanels sources={sources} logs={logs} />
      <SubscriberPanel subscribers={subscribers} />
    </main>
  );
}
