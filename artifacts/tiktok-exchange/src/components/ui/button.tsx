import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "tiktok";
  size?: "default" | "sm" | "lg" | "icon";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
  tiktok: "bg-background text-foreground border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300 tiktok-shadow tiktok-hover",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-lg shadow-secondary/20",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-transparent hover:bg-white/5",
  ghost: "hover:bg-white/5 text-foreground",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-11 px-4 py-2",
  sm: "h-9 rounded-md px-3 text-sm",
  lg: "h-14 rounded-xl px-8 text-lg",
  icon: "h-11 w-11",
};

const baseClasses =
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95";

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
} = {}): string {
  return cn(baseClasses, variantClasses[variant!], sizeClasses[size!], className);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
