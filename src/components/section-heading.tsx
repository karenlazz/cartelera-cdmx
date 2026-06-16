export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 max-w-3xl">
      {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-clay">{eyebrow}</p> : null}
      <h1 className="font-[var(--font-source-serif)] text-4xl font-semibold leading-tight text-ink sm:text-5xl">{title}</h1>
      {description ? <p className="mt-3 text-base leading-7 text-ink/70">{description}</p> : null}
    </div>
  );
}
