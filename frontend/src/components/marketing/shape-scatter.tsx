import { cn } from "@/lib/utils";

/**
 * Decorative geometric confetti — a coral ring, a violet triangle, a yellow
 * square, dots and a plus sign — scattered around the hero. The Divi "App
 * Developer" signature. Purely ornamental; hidden from assistive tech and
 * thinned out on phones so it never crowds the copy.
 */
export function ShapeScatter({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <span className="absolute left-[5%] top-[20%] size-16 rounded-full border-[6px] border-primary/25 max-sm:hidden" />
      <span className="absolute right-[9%] top-[14%] size-2.5 rounded-full bg-[#7b5cff]" />
      <span className="absolute left-[44%] top-[9%] size-4 rotate-12 rounded-[4px] bg-[#ffb020]/80 max-sm:hidden" />
      <span className="absolute bottom-[14%] right-[24%] size-2 rounded-full bg-primary/50 max-sm:hidden" />
      <svg
        className="absolute bottom-[18%] left-[11%] size-6 text-primary/40 max-sm:hidden"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      <svg
        className="absolute bottom-[24%] right-[7%] size-8 text-[#7b5cff]/30"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 3l9 16H3z" />
      </svg>
    </div>
  );
}
