import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
};

const base =
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)] focus-visible:ring-offset-2";

const variants: Record<Variant, string> = {
  solid: "bg-[color:var(--brand)] text-white hover:brightness-110",
  outline:
    "border border-[color:var(--line)] text-[color:var(--ink)] hover:border-[color:var(--brand)]",
  ghost: "text-[color:var(--ink)] hover:bg-black/5",
};

const sizes = {
  sm: "h-9 px-4",
  md: "h-11 px-5",
  lg: "h-12 px-6",
};

export function Button({
  className,
  variant = "solid",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function ButtonLink({
  className,
  variant = "solid",
  size = "md",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
