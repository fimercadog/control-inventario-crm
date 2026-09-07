import { cn } from "@/lib/utils";

/**
 * A product screenshot inside a lightweight browser-chrome frame.
 * Screenshots live in /public/product and are captured from the running app.
 */
export function ScreenshotFrame({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn("group/frame overflow-hidden rounded-xl border border-border bg-card shadow-elevation-2", className)}>
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-3 py-2">
        <span className="size-2.5 rounded-full bg-destructive/40" />
        <span className="size-2.5 rounded-full bg-warning/40" />
        <span className="size-2.5 rounded-full bg-success/40" />
      </div>
      <div className="overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-auto w-full transition-transform duration-700 ease-out group-hover/frame:scale-[1.04] motion-reduce:transition-none"
        />
      </div>
    </div>
  );
}
