import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "link";
type Size = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-strong disabled:bg-accent/50 border border-transparent",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-sunken hover:border-subtle disabled:text-subtle",
  ghost: "text-ink-2 hover:bg-black/[0.04] border border-transparent",
  link: "text-accent hover:text-accent-strong hover:underline underline-offset-4 border border-transparent px-0!",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-2.5 text-[13px] gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
};

export const buttonClasses = (variant: Variant = "secondary", size: Size = "md") =>
  cn(
    "inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed",
    VARIANTS[variant],
    SIZES[size]
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", className, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClasses(variant, size), className)}
      {...props}
    />
  );
});
