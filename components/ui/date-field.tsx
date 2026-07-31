"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { controlClass } from "./field";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const YEAR_SPAN = 100; // birth dates, so the range runs backwards from today

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

/** Digits in, `yyyy-mm-dd` out. Lets someone type 20000127 straight through. */
function formatTyped(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
}

function parseIso(v: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  if (m < 0 || m > 11 || d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

/**
 * Date entry built for birthdays, which is why it does not use `<input
 * type="date">`: the native control renders in the browser's locale (mm/dd/yyyy
 * here), is unusably narrow at 320px, and buries a 1999 birthday behind dozens
 * of taps. This one always shows yyyy-mm-dd, accepts raw digits, and jumps
 * years and months with two selects.
 */
export default function DateField({
  label,
  value,
  onChange,
  required,
  error,
}: {
  label: string;
  value: string; // yyyy-mm-dd, or "" while incomplete
  onChange: (next: string) => void;
  required?: boolean;
  error?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // Only steal focus once the user has actually started arrowing around.
  const arrowing = useRef(false);

  const today = useMemo(() => new Date(), []);
  const parsed = parseIso(value);
  const [view, setView] = useState(() => ({
    y: parsed?.y ?? today.getFullYear() - 25,
    m: parsed?.m ?? 0,
  }));
  // Roving tab stop inside the grid; also the arrow-key cursor.
  const [cursor, setCursor] = useState(parsed?.d ?? 1);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open || !arrowing.current) return;
    gridRef.current?.querySelector<HTMLElement>(`[data-day="${cursor}"]`)?.focus();
  }, [cursor, open]);

  useEffect(() => {
    if (!open) arrowing.current = false;
  }, [open]);

  function openCalendar() {
    const p = parseIso(value);
    if (p) {
      setView({ y: p.y, m: p.m });
      setCursor(p.d);
    }
    setOpen(true);
  }

  function pick(day: number) {
    onChange(iso(view.y, view.m, day));
    setOpen(false);
  }

  function moveCursor(delta: number) {
    const total = daysInMonth(view.y, view.m);
    const next = cursor + delta;
    if (next < 1) {
      const m = view.m === 0 ? 11 : view.m - 1;
      const y = view.m === 0 ? view.y - 1 : view.y;
      setView({ y, m });
      setCursor(daysInMonth(y, m) + next);
    } else if (next > total) {
      const m = view.m === 11 ? 0 : view.m + 1;
      const y = view.m === 11 ? view.y + 1 : view.y;
      setView({ y, m });
      setCursor(next - total);
    } else {
      setCursor(next);
    }
  }

  const years = useMemo(() => {
    const end = today.getFullYear();
    return Array.from({ length: YEAR_SPAN + 1 }, (_, i) => end - i);
  }, [today]);

  const lead = new Date(view.y, view.m, 1).getDay();
  const total = daysInMonth(view.y, view.m);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-ink-soft">
        {label}
      </label>

      <div ref={wrapRef} className="relative">
        <div className="flex gap-2">
          <input
            id={id}
            value={value}
            required={required}
            inputMode="numeric"
            autoComplete="bday"
            placeholder="yyyy-mm-dd"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => onChange(formatTyped(e.target.value))}
            className={cx(controlClass, "min-w-0 flex-1")}
          />
          <button
            type="button"
            onClick={() => (open ? setOpen(false) : openCalendar())}
            aria-label="달력에서 고르기"
            aria-expanded={open}
            className="focus-seal flex h-touch w-touch shrink-0 cursor-pointer items-center justify-center rounded-control border border-ink/25 bg-card text-ink-soft hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4.5" width="14" height="12.5" rx="1.5" />
              <path d="M3 8.5h14M7 2.5v3M13 2.5v3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {open && (
          <div
            role="dialog"
            aria-label="날짜 선택"
            className="washi absolute left-0 right-0 top-full z-30 mt-2 rounded-card p-3"
          >
            <div className="flex gap-2">
              <select
                value={view.y}
                aria-label="연도"
                onChange={(e) => setView((v) => ({ ...v, y: Number(e.target.value) }))}
                className={cx(controlClass, "h-11 min-h-0 min-w-0 flex-1 px-2")}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
              <select
                value={view.m}
                aria-label="월"
                onChange={(e) => setView((v) => ({ ...v, m: Number(e.target.value) }))}
                className={cx(controlClass, "h-11 min-h-0 w-[5.25rem] shrink-0 px-2")}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>{i + 1}월</option>
                ))}
              </select>
            </div>

            <div role="grid" className="mt-3">
              <div role="row" className="grid grid-cols-7 gap-0.5">
                {WEEKDAYS.map((w, i) => (
                  <div
                    key={w}
                    role="columnheader"
                    className={cx(
                      "py-1 text-center text-[0.6875rem]",
                      i === 0 ? "text-vermilion/70" : "text-ink-faint",
                    )}
                  >
                    {w}
                  </div>
                ))}
              </div>
              <div ref={gridRef} className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: lead }, (_, i) => <div key={`lead${i}`} />)}
                {Array.from({ length: total }, (_, i) => {
                  const day = i + 1;
                  const selected = parsed?.y === view.y && parsed?.m === view.m && parsed?.d === day;
                  const isToday =
                    today.getFullYear() === view.y && today.getMonth() === view.m && today.getDate() === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      role="gridcell"
                      aria-selected={selected}
                      aria-label={`${view.y}년 ${view.m + 1}월 ${day}일`}
                      tabIndex={day === cursor ? 0 : -1}
                      data-day={day}
                      onClick={() => pick(day)}
                      onKeyDown={(e) => {
                        const moves: Record<string, number> = {
                          ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7,
                        };
                        if (e.key in moves) {
                          e.preventDefault();
                          arrowing.current = true;
                          moveCursor(moves[e.key]);
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setOpen(false);
                        }
                      }}
                      className={cx(
                        "focus-seal aspect-square cursor-pointer rounded-control text-sm transition-colors duration-150 motion-reduce:transition-none",
                        selected
                          ? "bg-vermilion font-semibold text-paper"
                          : "hover:bg-paper-soft",
                        !selected && isToday && "ring-1 ring-inset ring-ink/30",
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-vermilion">
          {error}
        </p>
      )}
    </div>
  );
}
