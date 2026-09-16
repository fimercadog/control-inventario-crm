"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import type { Faq } from "@/components/marketing/marketing-data";
import { cn } from "@/lib/utils";

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card">
      {faqs.map((faq, i) => {
        const expanded = open === i;
        return (
          <Reveal key={faq.question} delay={Math.min(i, 6) * 0.07}>
            <div>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : i)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold sm:px-6 sm:py-5 sm:text-base"
              >
                {faq.question}
                <ChevronDown
                  className={cn("size-4.5 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180 text-primary")}
                />
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-7 text-muted-foreground sm:px-6">{faq.answer}</p>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
