"use client";

import { FormEvent, useState } from "react";
import { Check, EyeOff, Loader2, Save, Trash2 } from "lucide-react";
import type { Exhibition, Museum } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function ExhibitionTable({ exhibitions, museums, token }: { exhibitions: Exhibition[]; museums: Museum[]; token: string }) {
  const [rows, setRows] = useState(exhibitions);
  const [busy, setBusy] = useState<string | null>(null);

  async function action(id: string, moderation_status: "approved" | "hidden" | "deleted") {
    setBusy(id);
    const response = await fetch(`/api/admin/exhibitions/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ moderation_status })
    });

    if (response.ok) {
      const updated = await response.json();
      setRows((current) => current.map((row) => (row.id === id ? updated.exhibition : row)));
    }
    setBusy(null);
  }

  async function save(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setBusy(id);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const response = await fetch(`/api/admin/exhibitions/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-token": token },
      body: JSON.stringify({
        title: payload.title,
        museum_id: payload.museum_id || null,
        start_date: payload.start_date || null,
        end_date: payload.end_date || null,
        schedule: payload.schedule || null,
        price: payload.price || null,
        source_url: payload.source_url || null,
        source_name: payload.source_name || null,
        description: payload.description || null
      })
    });

    if (response.ok) {
      const updated = await response.json();
      setRows((current) => current.map((row) => (row.id === id ? updated.exhibition : row)));
    }
    setBusy(null);
  }

  if (rows.length === 0) {
    return <div className="border border-dashed border-ink/20 bg-white/60 p-6 text-sm text-ink/65">No hay exposiciones en esta vista.</div>;
  }

  return (
    <div className="grid gap-4">
      {rows.map((exhibition) => (
        <form key={exhibition.id} onSubmit={(event) => save(event, exhibition.id)} className="grid gap-4 border border-ink/10 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">{exhibition.moderation_status}</p>
              <h2 className="font-[var(--font-source-serif)] text-2xl font-semibold text-ink">{exhibition.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <IconButton label="Aprobar" onClick={() => action(exhibition.id, "approved")} disabled={busy === exhibition.id} icon={<Check className="h-4 w-4" />} />
              <IconButton label="Ocultar" onClick={() => action(exhibition.id, "hidden")} disabled={busy === exhibition.id} icon={<EyeOff className="h-4 w-4" />} />
              <IconButton label="Eliminar" onClick={() => action(exhibition.id, "deleted")} disabled={busy === exhibition.id} icon={<Trash2 className="h-4 w-4" />} danger />
              <button
                type="submit"
                disabled={busy === exhibition.id}
                className="focus-ring inline-flex h-10 items-center gap-2 bg-ink px-3 text-sm font-bold text-white hover:bg-jade disabled:opacity-60"
              >
                {busy === exhibition.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar
              </button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Field name="title" label="Nombre" defaultValue={exhibition.title} />
            <label className="grid gap-1 text-sm">
              <span className="font-bold text-ink/70">Museo</span>
              <select name="museum_id" defaultValue={exhibition.museum_id ?? ""} className="h-11 border border-ink/10 bg-paper px-3 outline-none focus:border-jade">
                <option value="">Información no disponible</option>
                {museums.map((museum) => (
                  <option key={museum.id} value={museum.id}>
                    {museum.name}
                  </option>
                ))}
              </select>
            </label>
            <Field name="start_date" label="Inicio" type="date" defaultValue={exhibition.start_date ?? ""} />
            <Field name="end_date" label="Cierre" type="date" defaultValue={exhibition.end_date ?? ""} />
            <Field name="schedule" label="Horarios" defaultValue={exhibition.schedule ?? ""} />
            <Field name="price" label="Costo" defaultValue={exhibition.price ?? ""} />
            <Field name="source_name" label="Fuente" defaultValue={exhibition.source_name ?? ""} />
            <Field name="source_url" label="URL fuente" defaultValue={exhibition.source_url ?? ""} />
          </div>
          <label className="grid gap-1 text-sm">
            <span className="font-bold text-ink/70">Descripción</span>
            <textarea name="description" defaultValue={exhibition.description ?? ""} rows={3} className="border border-ink/10 bg-paper p-3 outline-none focus:border-jade" />
          </label>
          <p className="text-xs text-ink/45">Última actualización: {formatDate(exhibition.updated_at)}</p>
        </form>
      ))}
    </div>
  );
}

function Field({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue: string; type?: string }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-bold text-ink/70">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} className="h-11 border border-ink/10 bg-paper px-3 outline-none focus:border-jade" />
    </label>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  icon,
  danger
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`focus-ring inline-flex h-10 w-10 items-center justify-center border disabled:opacity-60 ${
        danger ? "border-clay/20 bg-clay/10 text-clay hover:bg-clay hover:text-white" : "border-ink/10 bg-paper text-ink hover:bg-fog"
      }`}
    >
      {icon}
    </button>
  );
}
