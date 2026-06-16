import { NextResponse } from "next/server";
import { updateAllSources } from "@/lib/ingest";
import { requireCronSecret } from "@/lib/validation";

export const maxDuration = 60;

export async function GET(request: Request) {
  if (!requireCronSecret(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const results = await updateAllSources();
  return NextResponse.json({ results });
}
