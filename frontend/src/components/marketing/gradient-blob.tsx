import { cn } from "@/lib/utils";

/**
 * Organic coral->pink->violet (or warm) gradient shape — the Divi "App
 * Developer" signature. Sits behind widget clusters and device mockups.
 */
export function GradientBlob({
  className,
  warm = false,
  float = false,
}: {
  className?: string;
  warm?: boolean;
  float?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute -z-10", float && "animate-marketing-float", className)}
      style={{
        background: warm ? "var(--blob-warm)" : "var(--blob)",
        borderRadius: "42% 58% 63% 37% / 41% 44% 56% 59%",
      }}
    />
  );
}
