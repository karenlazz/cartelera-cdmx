import Link from "next/link";
import { CalendarDays, Mail, Search, ShieldCheck, Sparkles, Timer, University } from "lucide-react";

const links = [
  { href: "/", label: "Inicio", icon: Search },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/nuevas", label: "Nuevas", icon: Sparkles },
  { href: "/por-concluir", label: "Por concluir", icon: Timer },
  { href: "/museos", label: "Museos", icon: University },
  { href: "/suscribirme", label: "Suscribirme", icon: Mail },
  { href: "/admin", label: "Admin", icon: ShieldCheck }
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-3 sm:px-6">
        <Link href="/" className="min-w-fit font-[var(--font-source-serif)] text-xl font-semibold tracking-normal text-ink">
          Cartelera Temporal
        </Link>
        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="focus-ring inline-flex h-10 min-w-fit items-center gap-2 px-3 text-sm font-medium text-ink/72 transition hover:bg-ink/5 hover:text-ink"
            >
              <Icon aria-hidden className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
