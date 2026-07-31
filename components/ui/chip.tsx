import { cx } from "@/lib/cx";

/**
 * Pill for member names and element counts. Chips are read-only labels — when
 * one needs to be tappable, use Button instead so it keeps the 44px floor.
 */
export default function Chip({
  tone = "plain",
  dot,
  className,
  children,
}: {
  tone?: "plain" | "seal";
  dot?: string; // background class for the leading dot (element colours)
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
        tone === "seal"
          ? "border-vermilion bg-vermilion/10 text-vermilion"
          : "border-ink/15 bg-paper-soft text-ink",
        className,
      )}
    >
      {dot && <i aria-hidden className={cx("inline-block h-2 w-2 rounded-full", dot)} />}
      {children}
    </span>
  );
}
