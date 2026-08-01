"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";

export type PairEdge = { a: string; b: string; total: number };

/**
 * Compatibility grades, mapped onto obangsaek rather than a traffic light —
 * the five elements already give five steps, so the chart stays inside the
 * palette instead of importing a second colour language.
 */
const GRADES = [
  { min: 80, label: "천생연분", stroke: "var(--water)", text: "text-water" },
  { min: 66, label: "좋은 궁합", stroke: "var(--wood)", text: "text-wood" },
  { min: 52, label: "무난함", stroke: "var(--metal)", text: "text-metal" },
  { min: 40, label: "삐걱임", stroke: "var(--earth)", text: "text-earth" },
  { min: -Infinity, label: "조율 필요", stroke: "var(--fire)", text: "text-fire" },
] as const;

const gradeOf = (total: number) => GRADES.find((g) => total >= g.min)!;

const SIZE = 320;
const C = SIZE / 2;
const R = 112; // vertex ring; leaves room for the labels outside it

/** Vertices start at the top and go clockwise, so member order reads naturally. */
function vertexAt(i: number, n: number) {
  const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
  return { x: C + R * Math.cos(angle), y: C + R * Math.sin(angle) };
}

export default function RelationPolygon({
  members,
  pairs,
}: {
  members: string[];
  pairs: PairEdge[];
}) {
  const [focus, setFocus] = useState<string | null>(null);

  const pos = new Map(members.map((m, i) => [m, vertexAt(i, members.length)]));
  // Above this the midpoint badges collide, so the edges carry colour alone.
  const showScores = members.length <= 7;

  return (
    <div className="space-y-3">
      <ul className="space-y-1 text-xs leading-relaxed text-ink-soft">
        <li>― 꼭짓점은 팀원, 선은 두 사람 사이의 궁합이에요.</li>
        <li>― 선 색이 궁합 등급이고, {showScores ? "가운데 숫자가 점수예요." : "인원이 많아 점수는 생략했어요."}</li>
        <li>― 이름을 누르면 그 사람의 연결만 남아요.</li>
      </ul>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" role="img"
        aria-label={`팀원 ${members.length}명의 1:1 궁합 관계도`}>
        {pairs.map((p, i) => {
          const from = pos.get(p.a);
          const to = pos.get(p.b);
          if (!from || !to) return null;
          const dimmed = focus !== null && focus !== p.a && focus !== p.b;
          const g = gradeOf(p.total);
          // Not the midpoint: in an even polygon every long diagonal passes
          // through the centre, so those badges would land on the same pixel.
          // Nudging each one along its own edge separates them.
          const t = 0.5 + ((i % 3) - 1) * 0.13;
          const mid = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
          return (
            <g key={`${p.a}-${p.b}`} opacity={dimmed ? 0.12 : 1}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={g.stroke} strokeWidth={focus && !dimmed ? 3 : 1.75} strokeLinecap="round" />
              {showScores && (
                <>
                  <circle cx={mid.x} cy={mid.y} r={11} fill={g.stroke} />
                  <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central"
                    fontSize="10" fontWeight="700" fill="var(--paper)">
                    {p.total}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {members.map((m) => {
          const v = pos.get(m)!;
          const active = focus === m;
          return (
            <g key={m} onClick={() => setFocus(active ? null : m)} className="cursor-pointer">
              <circle cx={v.x} cy={v.y} r={19}
                fill="var(--card)" stroke={active ? "var(--vermilion)" : "var(--ink)"}
                strokeWidth={active ? 3 : 1.5} />
              <text x={v.x} y={v.y} textAnchor="middle" dominantBaseline="central"
                fontSize="14" fontWeight="700" fill="var(--ink)">
                {m.slice(0, 1)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Names sit below rather than around the ring: at 320px, labels on the
          circumference collide the moment a nickname is longer than two characters. */}
      <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {members.map((m) => (
          <li key={m}>
            <button
              type="button"
              onClick={() => setFocus(focus === m ? null : m)}
              className={cx(
                "focus-seal min-h-touch min-w-touch cursor-pointer rounded-control px-2 text-xs transition-colors duration-150 motion-reduce:transition-none",
                focus === m ? "font-bold text-vermilion" : "text-ink-soft hover:text-ink",
              )}
            >
              {m}
            </button>
          </li>
        ))}
      </ul>

      <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
        {GRADES.map((g) => (
          <li key={g.label} className="flex items-center gap-1">
            <i aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: g.stroke }} />
            <span className="text-ink-soft">{g.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Each member's mean edge — the polygon already holds every number this needs. */
export function memberAverages(members: string[], pairs: PairEdge[]) {
  return members
    .map((m) => {
      const mine = pairs.filter((p) => p.a === m || p.b === m);
      const avg = mine.length ? mine.reduce((s, p) => s + p.total, 0) / mine.length : 0;
      return { nickname: m, avg };
    })
    .sort((x, y) => y.avg - x.avg);
}
