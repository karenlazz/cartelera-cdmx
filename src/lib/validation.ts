import { z } from "zod";

export const subscriberSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  topics: z.array(z.enum(["all", "new", "closing_soon"])).default(["all"]),
  boroughs: z.array(z.string()).default([]),
  favoriteMuseums: z.array(z.string()).default([])
});

export const adminExhibitionSchema = z.object({
  title: z.string().trim().min(1),
  museum_id: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  schedule: z.string().nullable().optional(),
  price: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  source_name: z.string().nullable().optional(),
  moderation_status: z.enum(["detected", "approved", "hidden", "deleted"]).optional(),
  tags: z.array(z.string()).optional()
});

export function requireAdminToken(request: Request) {
  const configured = process.env.ADMIN_TOKEN;
  if (!configured) return true;

  const header = request.headers.get("x-admin-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === configured;
}

export function requireCronSecret(request: Request) {
  const configured = process.env.CRON_SECRET;
  if (!configured) return true;

  const header = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const query = new URL(request.url).searchParams.get("secret");
  return header === configured || query === configured;
}
