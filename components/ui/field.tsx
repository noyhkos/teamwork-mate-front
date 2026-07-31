"use client";

import { useId } from "react";
import { cx } from "@/lib/cx";

/**
 * Shared control skin. 44px floor + 16px text (below that iOS zooms on focus).
 * Deliberately carries no width — callers inside a flex row need to set their
 * own, and a baked-in `w-full` fights `flex-1`.
 */
export const controlClass =
  "focus-seal min-h-touch rounded-control border border-ink/25 bg-white/70 px-3 " +
  "text-base text-ink placeholder:text-ink-faint disabled:opacity-50";

type Aria = {
  id: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

/**
 * Label + control + error, with the aria wiring done once here so no caller has
 * to remember it. The control is a render prop because it must receive the
 * generated id and describedby.
 */
export default function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (aria: Aria) => React.ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-ink-soft">
        {label}
      </label>
      {children({
        id,
        ...(error ? { "aria-invalid": true as const } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-vermilion">
          {error}
        </p>
      )}
    </div>
  );
}

/** Native select with the shared skin — keyboard and screen readers for free. */
export function Select({ className, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...rest} className={cx(controlClass, "select-chevron w-full", className)} />;
}

export function TextInput({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cx(controlClass, "w-full", className)} />;
}

/**
 * Checkbox scaled to a real tap target — the 13px native box was unusable on a
 * phone. The whole row is the target, not just the box.
 */
export function CheckboxRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="focus-within:outline-none flex min-h-touch cursor-pointer items-center gap-2.5 text-sm text-ink-soft"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="focus-seal h-5 w-5 shrink-0 cursor-pointer rounded-card border border-ink/30"
      />
      <span>{children}</span>
    </label>
  );
}
