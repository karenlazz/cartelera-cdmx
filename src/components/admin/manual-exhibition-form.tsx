"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import type { Museum } from "@/lib/types";

export function ManualExhibitionForm({ museums, token }: { museums: Museum[]; token: string }) {
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const response = await fetch("/api/admin/exhibitions", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": token },
      body: JSON.stringify({
        title: payload.title,
        museum_id: payload.museum_id || null,
        start_date: payload.start_date || null,
        end_date: payload.end_date || null,
        schedule: payload.schedule || null,
        price: payload.price || null,
        source_url: payload.source_url || null,
        source_name: payload.source_name || "Carga manual",
        description: payload.description || null,
        moderation_status: "approved",
        tags: ["manual"]
      })
    });

    setMessage(response.ok ? "Exposición creada y aprobada." : "No se pudo crear la exposición.");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 border border-ink/10 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">Carga manual</p>
        <h2 className="font-[var(--font-source-serif)] text-2xl font-semibold text-ink">Agregar exposición</h2>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Field name="title" label="Nombre" required />
        <label className="grid gap-1 text-sm">
          <span className="font-bold text-ink/70">Museo</span>
          <select name="museum_id" className="h-11 border border-ink/10 bg-paper px-3 outline-none focus:border-jade">
            <option value="">Información no disponible</option>
            {museums.map((museum) => (
              <option key={museum.id} value={museum.id}>
                {museum.name}
              </option>
            ))}
          </select>
        </label>
        <Field name="start_date" label="Inicio" type="date" />
        <Field name="end_date" label="Cierre" type="date" />
        <Field name="schedule" label="Horarios" />
        <Field name="price" label="Costo" />
        <Field name="source_name" label="Fuente" />
        <Field name="source_url" label="URL fuente" />
      </div>
      <label className="grid gap-1 text-sm">
        <span className="font-bold text-ink/70">Descripción</span>
        <textarea name="description" rows={3} className="border border-ink/10 bg-paper p-3 outline-none focus:border-jade" />
      </label>
      <button className="focus-ring inline-flex h-11 w-fit items-center gap-2 bg-jade px-4 text-sm font-bold text-white hover:bg-ink">
        <Plus className="h-4 w-4" />
        Crear
      </button>
      {message ? <p className="text-sm text-jade">{message}</p> : null}
    </form>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-bold text-ink/70">{label}</span>
      <input required={required} name={name} type={type} className="h-11 border border-ink/10 bg-paper px-3 outline-none focus:border-jade" />
    </label>
  );
}
