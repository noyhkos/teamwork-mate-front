"use client";

import { useId } from "react";
import { cx } from "@/lib/cx";

/**
 * Two- or three-way choice. Replaces a `<select>` for short option sets: one
 * tap instead of open-scroll-tap, and every option stays visible on a phone.
 */
export default function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <span id={id} className="block text-xs font-medium text-ink-soft">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className="flex gap-1 rounded-control border border-ink/25 bg-white/70 p-1"
      >
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={o.label}
              onClick={() => onChange(o.value)}
              className={cx(
                // rounded-card is the nested radius here: outer 8px minus the 4px inset.
                "focus-seal min-h-touch flex-1 cursor-pointer rounded-card px-3 text-sm transition-colors duration-150 motion-reduce:transition-none",
                active ? "bg-ink font-semibold text-paper" : "text-ink-soft hover:bg-paper-soft",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
