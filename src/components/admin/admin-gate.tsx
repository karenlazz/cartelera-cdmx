"use client";

import { FormEvent } from "react";
import { Lock } from "lucide-react";

export function AdminGate() {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = new FormData(event.currentTarget).get("token");
    window.location.href = `/admin?token=${encodeURIComponent(String(token ?? ""))}`;
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <form onSubmit={submit} className="grid gap-4 border border-ink/10 bg-white p-6 shadow-sm">
        <Lock aria-hidden className="h-8 w-8 text-jade" />
        <h1 className="font-[var(--font-source-serif)] text-3xl font-semibold text-ink">Panel protegido</h1>
        <p className="text-sm leading-6 text-ink/65">Ingresa el token de administración configurado en `ADMIN_TOKEN`.</p>
        <input
          name="token"
          type="password"
          className="h-12 border border-ink/10 bg-paper px-3 text-sm outline-none focus:border-jade"
          placeholder="ADMIN_TOKEN"
        />
        <button className="focus-ring h-12 bg-ink px-4 text-sm font-bold text-white hover:bg-jade">Entrar</button>
      </form>
    </main>
  );
}
