import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

const TONE_CLASSNAMES: Record<StatusTone, string> = {
  default: "",
  secondary: "",
  destructive: "",
  outline: "",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
};

export interface StatusConfig {
  label: string;
  tone: StatusTone;
}

interface StatusBadgeProps<K extends string> {
  status: K;
  config: Record<K, StatusConfig>;
}

export function StatusBadge<K extends string>({ status, config }: StatusBadgeProps<K>) {
  const { label, tone } = config[status];
  const variant = tone === "success" || tone === "warning" ? "default" : tone;

  return <Badge variant={variant} className={cn(TONE_CLASSNAMES[tone])}>{label}</Badge>;
}
