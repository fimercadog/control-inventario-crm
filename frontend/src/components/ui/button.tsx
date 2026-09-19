import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  asChild?: boolean;
};

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-primary text-primary-foreground hover:opacity-90",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "outline" && "border border-border bg-card hover:bg-muted",
        variant === "ghost" && "hover:bg-muted",
        variant === "destructive" && "bg-destructive text-white hover:opacity-90",
        size === "default" && "h-10 px-4",
        size === "sm" && "h-8 px-3 text-xs",
        size === "lg" && "h-12 px-6 text-base",
        size === "icon" && "h-9 w-9",
        size === "icon-sm" && "h-8 w-8",
        className,
      )}
      {...props}
    />
  );
}
