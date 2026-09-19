import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PremiumBadge({ className }: { className?: string }) {
  return (
    <Badge className={cn("gap-1 bg-primary text-primary-foreground", className)}>
      <Lock />
      Premium
    </Badge>
  );
}
