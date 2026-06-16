export type ExhibitionStatus = "upcoming" | "current" | "closing_soon" | "closed" | "new";
export type ModerationStatus = "detected" | "approved" | "hidden" | "deleted";
export type SourceType =
  | "official_site"
  | "rss"
  | "cultural_listing"
  | "media_blog"
  | "institutional"
  | "manual";

export type Museum = {
  id: string;
  name: string;
  address: string | null;
  borough: string | null;
  website_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
};

export type Exhibition = {
  id: string;
  title: string;
  museum_id: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  schedule: string | null;
  price: string | null;
  image_url: string | null;
  source_url: string | null;
  source_name: string | null;
  status: ExhibitionStatus;
  moderation_status: ModerationStatus;
  tags: string[];
  raw_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_checked_at: string | null;
  museums?: Museum | null;
};

export type Source = {
  id: string;
  name: string;
  url: string;
  source_type: SourceType;
  priority: number;
  update_frequency: string;
  active: boolean;
  config: Record<string, unknown>;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriberPreferences = {
  topics?: ("all" | "new" | "closing_soon")[];
  boroughs?: string[];
  favoriteMuseums?: string[];
};

export type Subscriber = {
  id: string;
  email: string;
  preferences: SubscriberPreferences;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type UpdateLog = {
  id: string;
  source_id: string | null;
  status: "success" | "partial" | "error" | "skipped";
  message: string | null;
  exhibitions_found: number;
  created_at: string;
  sources?: Pick<Source, "name" | "url"> | null;
};

export type ExhibitionFilters = {
  q?: string;
  museum?: string;
  borough?: string;
  status?: ExhibitionStatus | "all";
  type?: string;
  from?: string;
  to?: string;
  moderation?: ModerationStatus | "all";
};
