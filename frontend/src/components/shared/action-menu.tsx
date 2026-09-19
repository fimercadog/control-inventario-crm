import { Fragment } from "react";
import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  variant?: "default" | "destructive";
  separatorBefore?: boolean;
}

export function ActionMenu({ items }: { items: ActionMenuItem[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Acciones">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item) => (
          <Fragment key={item.label}>
            {item.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem variant={item.variant} onSelect={item.onSelect}>
              {item.icon && <item.icon />}
              {item.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
