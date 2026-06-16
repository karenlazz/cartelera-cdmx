import { Inbox } from "lucide-react";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-dashed border-ink/20 bg-white/60 p-8 text-center">
      <Inbox aria-hidden className="mx-auto mb-3 h-8 w-8 text-ink/45" />
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink/65">{body}</p>
    </div>
  );
}
