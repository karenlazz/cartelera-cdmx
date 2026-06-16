import type { Metadata } from "next";
import "@/app/globals.css";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Cartelera Temporal CDMX",
  description: "Calendario vivo de exposiciones temporales en museos y espacios culturales de la Ciudad de México."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
