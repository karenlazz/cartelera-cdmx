import { addDays, formatISO } from "date-fns";
import { getPublicSupabase, getServiceSupabase } from "@/lib/supabase";
import { seedMuseums } from "@/lib/seed";
import { calculateStatus } from "@/lib/status";
import type { Exhibition, ExhibitionFilters, ModerationStatus, Museum, Source, Subscriber, SubscriberPreferences, UpdateLog } from "@/lib/types";

const exhibitionSelect = `
  *,
  museums (*)
`;

export async function listMuseums(): Promise<Museum[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return seedMuseums;

  const { data, error } = await supabase.from("museums").select("*").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPublicExhibitions(filters: ExhibitionFilters = {}): Promise<Exhibition[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("exhibitions")
    .select(exhibitionSelect)
    .eq("moderation_status", "approved")
    .or(`end_date.is.null,end_date.gte.${formatISO(new Date(), { representation: "date" })}`)
    .order("start_date", { ascending: true, nullsFirst: false });

  query = applyExhibitionFilters(query, filters);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return normalizeExhibitions(data ?? []).filter((item) => {
    if (filters.status && filters.status !== "all") return item.status === filters.status;
    return true;
  });
}

export async function listNewExhibitions(): Promise<Exhibition[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const since = formatISO(addDays(new Date(), -14), { representation: "date" });
  const { data, error } = await supabase
    .from("exhibitions")
    .select(exhibitionSelect)
    .eq("moderation_status", "approved")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return normalizeExhibitions(data ?? []);
}

export async function listClosingSoonExhibitions(): Promise<Exhibition[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const today = formatISO(new Date(), { representation: "date" });
  const soon = formatISO(addDays(new Date(), 14), { representation: "date" });
  const { data, error } = await supabase
    .from("exhibitions")
    .select(exhibitionSelect)
    .eq("moderation_status", "approved")
    .gte("end_date", today)
    .lte("end_date", soon)
    .order("end_date", { ascending: true });

  if (error) throw new Error(error.message);
  return normalizeExhibitions(data ?? []);
}

export async function listAdminExhibitions(moderation: ModerationStatus | "all" = "detected"): Promise<Exhibition[]> {
  const supabase = getServiceSupabase();
  if (!supabase) return [];

  let query = supabase.from("exhibitions").select(exhibitionSelect).order("updated_at", { ascending: false });
  if (moderation !== "all") query = query.eq("moderation_status", moderation);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return normalizeExhibitions(data ?? []);
}

export async function listSources(): Promise<Source[]> {
  const supabase = getServiceSupabase() ?? getPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.from("sources").select("*").order("priority", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listUpdateLogs(limit = 25): Promise<UpdateLog[]> {
  const supabase = getServiceSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("update_logs")
    .select("*, sources(name, url)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listSubscribers(): Promise<Subscriber[]> {
  const supabase = getServiceSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertSubscriber(email: string, preferences: SubscriberPreferences) {
  const supabase = getServiceSupabase();
  if (!supabase) throw new Error("Supabase service role is not configured.");

  const { data, error } = await supabase
    .from("subscribers")
    .upsert(
      {
        email,
        preferences,
        active: true,
        updated_at: new Date().toISOString()
      },
      { onConflict: "email" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateExhibition(id: string, values: Partial<Exhibition>) {
  const supabase = getServiceSupabase();
  if (!supabase) throw new Error("Supabase service role is not configured.");

  const { data, error } = await supabase.from("exhibitions").update(values).eq("id", id).select(exhibitionSelect).single();
  if (error) throw new Error(error.message);
  return data as Exhibition;
}

export async function createExhibition(values: Partial<Exhibition> & { title: string }) {
  const supabase = getServiceSupabase();
  if (!supabase) throw new Error("Supabase service role is not configured.");

  const { data, error } = await supabase.from("exhibitions").insert(values).select(exhibitionSelect).single();
  if (error) throw new Error(error.message);
  return data as Exhibition;
}

export async function deleteExhibition(id: string) {
  const supabase = getServiceSupabase();
  if (!supabase) throw new Error("Supabase service role is not configured.");

  const { error } = await supabase.from("exhibitions").update({ moderation_status: "deleted" }).eq("id", id);
  if (error) throw new Error(error.message);
}

function applyExhibitionFilters(query: any, filters: ExhibitionFilters) {
  if (filters.q) query = query.ilike("title", `%${filters.q}%`);
  if (filters.museum && filters.museum !== "all") query = query.eq("museum_id", filters.museum);
  if (filters.type && filters.type !== "all") query = query.contains("tags", [filters.type]);
  if (filters.from) query = query.gte("end_date", filters.from);
  if (filters.to) query = query.lte("start_date", filters.to);
  return query;
}

function normalizeExhibitions(exhibitions: Exhibition[]): Exhibition[] {
  return exhibitions.map((exhibition) => ({
    ...exhibition,
    status: calculateStatus(exhibition)
  }));
}
