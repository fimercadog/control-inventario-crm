import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

export type DocSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  items: string[];
};

/** Índice lateral (solo en lg) con anclas a cada sección. */
export function DocSidebar({ sections }: { sections: DocSection[] }) {
  return (
    <aside className="hidden lg:block">
      <nav className="sticky top-28 space-y-1">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {s.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}

/** Lista de tarjetas de documentación. El padre controla el espaciado vertical. */
export function DocSectionList({ sections }: { sections: DocSection[] }) {
  return (
    <>
      {sections.map((section, index) => {
        const Icon = section.icon;
        return (
          <Reveal key={section.id} delay={index * 0.04}>
            <article id={section.id} className="scroll-mt-28 rounded-2xl border border-border bg-card p-7">
              <div className="flex items-center gap-4">
                <span className="grid size-11 place-items-center rounded-xl border border-border text-primary">
                  <Icon className="size-5" />
                </span>
                <h2 className="text-xl font-bold">{section.title}</h2>
              </div>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        );
      })}
    </>
  );
}
