import { cx } from "@/lib/cx";

/** The hanji sheet. Every block of content on every surface sits on one. */
export default function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cx("washi rounded-card p-5", className)}>
      {children}
    </div>
  );
}

/** Section heading + optional eyebrow, so every surface labels blocks alike. */
export function SectionTitle({ eyebrow, children }: { eyebrow?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      {eyebrow && <p className="text-tag uppercase text-ink-faint">{eyebrow}</p>}
      <h2 className="font-serif text-base font-bold">{children}</h2>
    </div>
  );
}
