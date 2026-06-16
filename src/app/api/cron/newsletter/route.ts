import { NextResponse } from "next/server";
import { sendWeeklyNewsletter } from "@/lib/newsletter";
import { requireCronSecret } from "@/lib/validation";

export const maxDuration = 60;

export async function GET(request: Request) {
  if (!requireCronSecret(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const result = await sendWeeklyNewsletter();
  return NextResponse.json(result);
}
