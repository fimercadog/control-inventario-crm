import Link from "next/link";
import { SITE_CONFIG } from "@/constants/site";
import { cn } from "@/lib/utils";

type PublicLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  inverted?: boolean;
};

function LogoMark({ className, inverted = false }: Pick<PublicLogoProps, "className" | "inverted">) {
  return (
    <svg
      viewBox="0 0 96 96"
      aria-hidden="true"
      className={cn("size-11 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="96" height="96" rx="26" fill={inverted ? "white" : "#25282D"} />
      <rect x="28" y="22" width="14" height="54" fill={inverted ? "#25282D" : "white"} />
      <rect x="28" y="22" width="40" height="12" fill={inverted ? "#25282D" : "white"} />
      <rect x="56" y="22" width="12" height="30" fill={inverted ? "#25282D" : "white"} />
      <rect x="42" y="34" width="14" height="18" fill="#19C78F" />
    </svg>
  );
}

export function PublicLogo({ className, markClassName, textClassName, inverted = false }: PublicLogoProps) {
  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-3", className)} aria-label={`${SITE_CONFIG.name} inicio`}>
      <LogoMark className={markClassName} inverted={inverted} />
      <span className={cn("flex flex-col leading-none", textClassName)}>
        <span className="font-(family-name:--font-display) text-xl font-semibold tracking-tight">{SITE_CONFIG.name}</span>
        <span className={cn("mt-1 text-[0.58rem] font-extrabold tracking-[0.32em] uppercase", inverted ? "text-white/45" : "text-(--realty-blue)")}>
          Real Estate
        </span>
      </span>
    </Link>
  );
}
