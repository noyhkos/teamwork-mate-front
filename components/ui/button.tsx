"use client";

import { cx } from "@/lib/cx";

type Variant = "primary" | "seal" | "outline" | "quiet";
type Size = "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink/85",
  seal: "bg-vermilion text-paper hover:bg-vermilion/85",
  outline: "border border-ink/25 bg-card text-ink hover:bg-paper-soft",
  quiet: "text-ink-soft underline underline-offset-4 hover:text-ink",
};

// Height, not padding, carries the 44px floor — copy length must not be able
// to shrink a tap target below it.
const SIZE: Record<Size, string> = {
  md: "min-h-touch px-4 text-sm",
  lg: "min-h-[3.25rem] px-5 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  full = false,
  className,
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "focus-seal inline-flex cursor-pointer items-center justify-center gap-2 rounded-control",
        "font-semibold transition-colors duration-150 motion-reduce:transition-none",
        "disabled:cursor-not-allowed disabled:opacity-40",
        VARIANT[variant],
        SIZE[size],
        full && "w-full",
        className,
      )}
    >
      {loading && (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
        />
      )}
      {children}
    </button>
  );
}
