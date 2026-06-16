"use client";

import { FormEvent, useState } from "react";
import { Check, Loader2, Mail } from "lucide-react";
import type { Museum } from "@/lib/types";

export function SubscribeForm({ museums, boroughs }: { museums: Museum[]; boroughs: string[] }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") ?? ""),
      topics: form.getAll("topics").map(String),
      boroughs: form.getAll("boroughs").map(String),
      favoriteMuseums: form.getAll("favoriteMuseums").map(String)
    };

    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    const body = await response.json();
    setStatus(response.ok ? "success" : "error");
    setMessage(body.message ?? (response.ok ? "Registro guardado." : "No se pudo guardar el registro."));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 border border-ink/10 bg-white p-5 shadow-sm">
      <label className="grid gap-2">
        <span className="text-sm font-bold text-ink">Correo electrónico</span>
        <span className="flex h-12 items-center gap-2 border border-ink/10 bg-paper px-3">
          <Mail aria-hidden className="h-4 w-4 text-ink/45" />
          <input name="email" type="email" required placeholder="tu@correo.com" className="w-full bg-transparent text-sm outline-none" />
        </span>
      </label>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-bold text-ink">Preferencias</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          <Checkbox name="topics" value="all" label="Todos los museos" defaultChecked />
          <Checkbox name="topics" value="new" label="Solo nuevas" />
          <Checkbox name="topics" value="closing_soon" label="Por concluir" />
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-bold text-ink">Alcaldías específicas</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {boroughs.map((borough) => (
            <Checkbox key={borough} name="boroughs" value={borough} label={borough} />
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-bold text-ink">Museos favoritos</legend>
        <div className="grid max-h-64 gap-2 overflow-auto pr-1 sm:grid-cols-2">
          {museums.map((museum) => (
            <Checkbox key={museum.id} name="favoriteMuseums" value={museum.id} label={museum.name} />
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={status === "loading"}
        className="focus-ring inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-sm font-bold text-white transition hover:bg-jade disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Check aria-hidden className="h-4 w-4" />}
        Guardar suscripción
      </button>

      {message ? <p className={`text-sm ${status === "error" ? "text-clay" : "text-jade"}`}>{message}</p> : null}
    </form>
  );
}

function Checkbox({
  name,
  value,
  label,
  defaultChecked
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-11 items-center gap-2 border border-ink/10 bg-paper px-3 text-sm text-ink/75">
      <input name={name} value={value} type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4 accent-jade" />
      <span>{label}</span>
    </label>
  );
}
