import { NextResponse } from "next/server";
import { deleteExhibition, updateExhibition } from "@/lib/data";
import { adminExhibitionSchema, requireAdminToken } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!requireAdminToken(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminExhibitionSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const exhibition = await updateExhibition(params.id, parsed.data);
    return NextResponse.json({ exhibition });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar la exposición.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!requireAdminToken(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    await deleteExhibition(params.id);
    return NextResponse.json({ message: "Exposición eliminada." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar la exposición.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
