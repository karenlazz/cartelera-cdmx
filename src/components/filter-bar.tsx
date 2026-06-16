"use client";

import { Filter, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Museum } from "@/lib/types";

export function FilterBar({ museums, boroughs }: { museums: Museum[]; boroughs: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(name);
    else params.set(name, value);
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="grid gap-3 border border-ink/10 bg-white p-4 shadow-sm lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
      <label className="flex h-12 items-center gap-2 border border-ink/10 bg-paper px-3">
        <Search aria-hidden className="h-4 w-4 text-ink/45" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
          placeholder="Buscar exposición"
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(event) => update("q", event.target.value)}
        />
      </label>
      <Select label="Museo" value={searchParams.get("museum") ?? "all"} onChange={(value) => update("museum", value)}>
        <option value="all">Todos los museos</option>
        {museums.map((museum) => (
          <option key={museum.id} value={museum.id}>
            {museum.name}
          </option>
        ))}
      </Select>
      <Select label="Alcaldía" value={searchParams.get("borough") ?? "all"} onChange={(value) => update("borough", value)}>
        <option value="all">Todas las alcaldías</option>
        {boroughs.map((borough) => (
          <option key={borough} value={borough}>
            {borough}
          </option>
        ))}
      </Select>
      <Select label="Estado" value={searchParams.get("status") ?? "all"} onChange={(value) => update("status", value)}>
        <option value="all">Todos los estados</option>
        <option value="new">Nueva</option>
        <option value="current">Abierta</option>
        <option value="closing_soon">Por concluir</option>
        <option value="upcoming">Próximamente</option>
      </Select>
      <label className="flex h-12 items-center gap-2 border border-ink/10 bg-paper px-3 text-sm text-ink/65">
        <Filter aria-hidden className="h-4 w-4" />
        <input
          type="date"
          className="w-full bg-transparent text-sm outline-none"
          defaultValue={searchParams.get("from") ?? ""}
          onChange={(event) => update("from", event.target.value)}
        />
      </label>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="grid h-12 items-center border border-ink/10 bg-paper px-3">
      <span className="sr-only">{label}</span>
      <select className="w-full bg-transparent text-sm outline-none" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}
