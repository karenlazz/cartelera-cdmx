import { listClosingSoonExhibitions, listNewExhibitions, listPublicExhibitions } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { getServiceSupabase } from "@/lib/supabase";
import type { Exhibition, Subscriber } from "@/lib/types";

export async function sendWeeklyNewsletter() {
  const supabase = getServiceSupabase();
  if (!supabase) {
    return { status: "skipped", message: "Supabase no está configurado.", sent: 0 };
  }

  const [{ data: subscribers, error }, newExhibitions, closingSoon, current] = await Promise.all([
    supabase.from("subscribers").select("*").eq("active", true),
    listNewExhibitions(),
    listClosingSoonExhibitions(),
    listPublicExhibitions()
  ]);

  if (error) throw new Error(error.message);

  const activeSubscribers = (subscribers ?? []) as Subscriber[];
  const html = renderNewsletter({
    newExhibitions,
    closingSoon,
    current: current.slice(0, 6)
  });

  if (!process.env.RESEND_API_KEY) {
    return {
      status: "dry_run",
      message: "RESEND_API_KEY no configurada. Newsletter renderizado sin enviar.",
      sent: activeSubscribers.length
    };
  }

  let sent = 0;
  for (const subscriber of activeSubscribers) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.NEWSLETTER_FROM || "Cartelera CDMX <cartelera@example.com>",
        to: subscriber.email,
        subject: "Exposiciones temporales en CDMX esta semana",
        html
      })
    });

    if (response.ok) sent += 1;
  }

  return { status: "success", message: "Newsletter enviado.", sent };
}

function renderNewsletter({
  newExhibitions,
  closingSoon,
  current
}: {
  newExhibitions: Exhibition[];
  closingSoon: Exhibition[];
  current: Exhibition[];
}) {
  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Cartelera CDMX</title>
    </head>
    <body style="margin:0;background:#f7f3eb;color:#1d1d1b;font-family:Arial,sans-serif;">
      <main style="max-width:680px;margin:0 auto;padding:28px 18px;">
        <h1 style="font-size:28px;line-height:1.1;margin:0 0 10px;">Exposiciones temporales en CDMX</h1>
        <p style="font-size:16px;line-height:1.5;margin:0 0 24px;">Nuevas detecciones, cierres próximos y exposiciones actuales para revisar esta semana.</p>
        ${section("Nuevas exposiciones", newExhibitions)}
        ${section("Por concluir", closingSoon)}
        ${section("Destacadas actuales", current)}
        <p style="font-size:13px;color:#666;margin-top:28px;">La información conserva atribución a sus fuentes originales y puede requerir validación humana cuando una fuente publique datos incompletos.</p>
      </main>
    </body>
  </html>`;
}

function section(title: string, exhibitions: Exhibition[]) {
  const items =
    exhibitions.length > 0
      ? exhibitions.map(item).join("")
      : `<p style="font-size:14px;color:#666;margin:0 0 20px;">Sin registros disponibles para esta sección.</p>`;

  return `<section style="margin:26px 0;">
    <h2 style="font-size:20px;margin:0 0 12px;">${title}</h2>
    ${items}
  </section>`;
}

function item(exhibition: Exhibition) {
  const museum = exhibition.museums?.name ?? "Museo no disponible";
  const source = exhibition.source_url
    ? `<a href="${exhibition.source_url}" style="color:#21665b;">Fuente original</a>`
    : "Fuente no disponible";

  return `<article style="background:#fff;border:1px solid #e7e0d5;border-radius:8px;padding:16px;margin-bottom:12px;">
    <h3 style="font-size:17px;margin:0 0 6px;">${escapeHtml(exhibition.title)}</h3>
    <p style="font-size:14px;line-height:1.5;margin:0 0 8px;">${escapeHtml(museum)} · ${formatDate(exhibition.start_date)} - ${formatDate(exhibition.end_date)}</p>
    <p style="font-size:13px;margin:0;">${source}</p>
  </article>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
