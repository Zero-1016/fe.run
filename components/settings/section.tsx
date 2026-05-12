import type { ReactNode } from "react";

type SectionProps = {
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function SettingsSection({ label, title, description, children }: SectionProps) {
  return (
    <section className="grid gap-3 md:grid-cols-[200px_1fr] md:gap-8">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary md:text-[11px]">
          {label}
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight md:text-base">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-secondary">{description}</p>
        )}
      </header>
      <div>{children}</div>
    </section>
  );
}
