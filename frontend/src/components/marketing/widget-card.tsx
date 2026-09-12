import { cn } from "@/lib/utils";

/**
 * The dark rounded "UI widget" cards from the Divi "SaaS Product" hero —
 * a bar chart, a contact chip, a headline stat with a sparkline, and a gauge.
 * Rendered as an overlapping 2x2 collage floating over a grainy green blob.
 */

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")";

const BLOB_RADIUS = "46% 54% 52% 48% / 60% 56% 44% 40%";

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] bg-ink p-4 text-ink-foreground shadow-[0_30px_60px_-18px_rgb(15_16_18/0.45)] ring-1 ring-white/5 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function BarChart() {
  const bars: [string, number, boolean][] = [
    ["Mar", 50, false],
    ["Abr", 74, false],
    ["May", 44, false],
    ["Jun", 92, true],
    ["Jul", 63, false],
    ["Ago", 40, false],
  ];
  return (
    <div className="flex h-28 items-end gap-2">
      {bars.map(([m, h, hot]) => (
        <div key={m} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-2 rounded-full"
            style={{
              height: `${h}%`,
              background: hot ? "linear-gradient(180deg,#4ade80,#a3e635)" : "linear-gradient(180deg,#fb923c,#f59e0b)",
            }}
          />
          <span className={cn("text-[9px]", hot ? "font-bold text-white" : "text-white/40")}>{m}</span>
        </div>
      ))}
    </div>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 120 32" className="h-8 w-full" fill="none" aria-hidden>
      <path
        d="M2 22 L18 13 L34 19 L50 7 L66 17 L82 6 L104 15 L118 9"
        stroke="url(#spark)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="spark" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="1" stopColor="#4ade80" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Gauge({ value }: { value: number }) {
  const arc = Math.PI * 44;
  return (
    <svg viewBox="0 0 100 58" className="w-28" aria-hidden>
      <path d="M6 52 A44 44 0 0 1 94 52" fill="none" stroke="#2b2b2e" strokeWidth="9" strokeLinecap="round" />
      <path
        d="M6 52 A44 44 0 0 1 94 52"
        fill="none"
        stroke="#4ade80"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * arc} ${arc}`}
      />
      <text x="50" y="48" textAnchor="middle" className="fill-white text-[19px] font-black">
        {value}%
      </text>
    </svg>
  );
}

/** Overlapping 2x2 collage of widget cards, floating over a grainy green blob. */
export function WidgetCluster({ className }: { className?: string }) {
  return (
    <div className={cn("relative isolate mx-auto min-h-96 w-full max-w-lg sm:min-h-104", className)}>
      <div
        aria-hidden
        className="animate-marketing-float absolute right-[-16%] top-1/2 -z-10 h-[125%] w-[118%] -translate-y-1/2 max-sm:right-[-4%] max-sm:h-[108%] max-sm:w-[104%] max-sm:opacity-70"
        style={{ background: "var(--blob)", borderRadius: BLOB_RADIUS }}
      />
      <div
        aria-hidden
        className="absolute right-[-16%] top-1/2 -z-10 h-[125%] w-[118%] -translate-y-1/2 mix-blend-soft-light max-sm:right-[-4%] max-sm:h-[108%] max-sm:w-[104%]"
        style={{
          backgroundImage: GRAIN,
          borderRadius: BLOB_RADIUS,
          maskImage: "radial-gradient(circle at 55% 50%, #000 42%, transparent 80%)",
        }}
      />

      <div className="grid grid-cols-2 gap-3 py-6 sm:gap-4">
        <Card className="mt-2 -rotate-2">
          <BarChart />
        </Card>
        <Card className="-mt-2 rotate-2">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="relative grid size-14 place-items-center rounded-full bg-primary text-lg font-black text-primary-foreground ring-2 ring-white/20">
              LG
              <span className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full bg-[#4ade80] ring-2 ring-ink" />
            </span>
            <span className="mt-1 text-sm font-bold text-white">Laura Gomez</span>
            <span className="text-[11px] text-white/45">Responsable comercial</span>
          </div>
        </Card>
        <Card className="-rotate-1">
          <span className="text-3xl font-black text-white">US$ 65k</span>
          <p className="mt-1 text-[11px] text-white/45">Valor en inventario</p>
          <div className="mt-3">
            <Sparkline />
          </div>
        </Card>
        <Card className="mt-3 rotate-1">
          <div className="flex flex-col items-center">
            <Gauge value={90} />
            <p className="mt-1 text-[11px] text-white/45">Pipeline ganado</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
