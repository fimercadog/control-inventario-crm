import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  level?: 1 | 2;
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "left", level = 2, className }: SectionHeadingProps) {
  const Heading = level === 1 ? "h1" : "h2";

  return (
    <div className={cn("flex flex-col gap-4", align === "center" && "items-center text-center", className)}>
      {eyebrow && <span className="realty-eyebrow">{eyebrow}</span>}
      <Heading className={cn("font-sans font-medium tracking-normal text-balance", level === 1 ? "text-5xl sm:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl")}>
        {title}
      </Heading>
      {description && <p className={cn("max-w-2xl text-sm leading-7 text-muted-foreground", align === "center" && "mx-auto")}>{description}</p>}
    </div>
  );
}
