import { NextResponse } from "next/server";
import { upsertSubscriber } from "@/lib/data";
import { subscriberSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = subscriberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    await upsertSubscriber(parsed.data.email, {
      topics: parsed.data.topics,
      boroughs: parsed.data.boroughs,
      favoriteMuseums: parsed.data.favoriteMuseums
    });

    return NextResponse.json({ message: "Suscripción guardada. Te enviaremos actualizaciones semanales." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la suscripción.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
