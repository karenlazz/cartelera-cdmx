import { NextResponse } from "next/server";
import { createExhibition } from "@/lib/data";
import { adminExhibitionSchema, requireAdminToken } from "@/lib/validation";

export async function POST(request: Request) {
  if (!requireAdminToken(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminExhibitionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const exhibition = await createExhibition(parsed.data);
    return NextResponse.json({ exhibition }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear la exposición.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
