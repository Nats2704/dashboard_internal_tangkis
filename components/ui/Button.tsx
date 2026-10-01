import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "link" | "danger";
type Size = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent font-semibold hover:bg-accent-strong disabled:bg-accent/40 disabled:text-on-accent/70 border border-transparent shadow-[0_0_0_1px_rgb(53_196_173/0.2),0_4px_14px_-4px_rgb(53_196_173/0.45)]",
  secondary:
    "bg-white/[0.04] text-ink border border-line-strong hover:bg-white/[0.08] hover:border-subtle/60 disabled:text-subtle disabled:hover:bg-white/[0.04]",
  ghost: "text-ink-2 hover:bg-hover hover:text-ink border border-transparent",
  link: "text-accent hover:text-accent-strong hover:underline underline-offset-4 border border-transparent px-0!",
  danger: "bg-danger text-white hover:brightness-110 border border-transparent",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-2.5 text-[12.5px] gap-1.5",
  md: "h-9 px-3.5 text-[13px] gap-2",
};

export const buttonClasses = (variant: Variant = "secondary", size: Size = "md") =>
  cn(
    "inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0",
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
