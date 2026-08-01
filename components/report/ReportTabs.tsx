"use client";

import { useState } from "react";
import Card, { SectionTitle } from "@/components/ui/card";
import Chip from "@/components/ui/chip";
import { cx } from "@/lib/cx";
import RelationPolygon, { memberAverages } from "./RelationPolygon";
import { deriveTeamTraits } from "./teamTraits";
import { ELEMENT_CLASS, type PairView, type Report } from "./types";

const TABS = ["요약", "관계", "역할"] as const;
type Tab = (typeof TABS)[number];

export default function ReportTabs({ report }: { report: Report }) {
  const [tab, setTab] = useState<Tab>("요약");

  // Roster order comes from the role ladder, which is already sorted top-down.
  const members = report.roles.map((r) => r.nickname);
  const averages = memberAverages(members, report.pairs);
  const { strengths, cautions, traits } = deriveTeamTraits(report);

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="리포트 구획" className="flex gap-1 rounded-control bg-paper-soft p-1">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cx(
              "focus-seal min-h-touch flex-1 cursor-pointer rounded-card text-sm transition-colors duration-150 motion-reduce:transition-none",
              tab === t ? "bg-ink font-semibold text-paper" : "text-ink-soft hover:bg-card",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "요약" && (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-serif text-base font-bold">팀 하모니</h2>
              <p className="font-serif text-4xl font-bold leading-none">
                {report.harmonyScore}
                <span className="ml-1 text-sm font-normal text-ink-soft">/ 100</span>
              </p>
            </div>
            <div className="mt-4 h-[3px] w-full bg-ink/10">
              <div className="h-full bg-vermilion" style={{ width: `${report.harmonyScore}%` }} />
            </div>
          </Card>

          {strengths.length > 0 && (
            <section className="space-y-2">
              <SectionTitle eyebrow="strengths">이런 게 좋아요</SectionTitle>
              <ul className="space-y-2">
                {strengths.map((s) => (
                  <li key={s} className="washi rounded-card border-l-4 border-l-wood px-4 py-3 text-sm leading-relaxed">
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {cautions.length > 0 && (
            <section className="space-y-2">
              <SectionTitle eyebrow="cautions">이런 건 조심해요</SectionTitle>
              <ul className="space-y-2">
                {cautions.map((c) => (
                  <li key={c} className="washi rounded-card border-l-4 border-l-vermilion px-4 py-3 text-sm leading-relaxed">
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-3">
            <SectionTitle eyebrow="balance">팀 성향 밸런스</SectionTitle>
            <Card className="space-y-2.5">
              {traits.map((t) => (
                <div key={t.key} className="flex items-center gap-3 text-xs">
                  <span className="w-12 shrink-0 text-ink-soft">{t.ko}</span>
                  <div className="h-[3px] flex-1 bg-ink/10">
                    <div className="h-full bg-ink" style={{ width: `${Math.min(100, t.value)}%` }} />
                  </div>
                  <span className="w-7 shrink-0 text-right font-serif text-sm">{t.value}</span>
                </div>
              ))}
            </Card>
            <ul className="flex flex-wrap gap-2">
              {Object.entries(report.elementTotals).map(([k, v]) => (
                <li key={k}>
                  <Chip dot={ELEMENT_CLASS[k] ?? "bg-ink"}>{k} {v}</Chip>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === "관계" && (
        <div className="space-y-5">
          <Card className="p-4">
            <RelationPolygon members={members} pairs={report.pairs} />
          </Card>

          {averages.length > 1 && (
            <div className="grid grid-cols-2 gap-2">
              <Card className="border-l-4 border-l-water p-4">
                <p className="text-tag uppercase text-water">중심축</p>
                <p className="mt-1 font-serif text-lg font-bold">{averages[0].nickname}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  평균 {Math.round(averages[0].avg)}점 — 팀에서 가장 두루 잘 맞아요
                </p>
              </Card>
              <Card className="border-l-4 border-l-earth p-4">
                <p className="text-tag uppercase text-earth">조율 포인트</p>
                <p className="mt-1 font-serif text-lg font-bold">
                  {averages[averages.length - 1].nickname}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  평균 {Math.round(averages[averages.length - 1].avg)}점 — 대화를 맞추면 크게 달라져요
                </p>
              </Card>
            </div>
          )}

          {/* The pair cards live here rather than in 요약: everything on this
              tab is about who sits next to whom. */}
          {report.bestPair && <PairCard tone="best" label="붉은 실" pair={report.bestPair} />}
          {report.worstPair && <PairCard tone="worst" label="서걱이는 조합" pair={report.worstPair} />}
        </div>
      )}

      {tab === "역할" && (
        <ol className="space-y-2">
          {report.roles.map((r, i) => (
            <li key={r.nickname + r.role}>
              <Card className="flex gap-3 p-4">
                <span aria-hidden className="w-5 shrink-0 pt-0.5 font-serif text-sm text-ink-faint">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-serif text-lg font-bold">{r.nickname}</span>
                    <span className={r.role === "member"
                      ? "border border-ink/25 px-1.5 py-0.5 text-xs text-ink-soft"
                      : "border border-vermilion px-1.5 py-0.5 text-xs text-vermilion"}>
                      {r.roleKo}
                    </span>
                    <span className="ml-auto shrink-0 font-serif text-sm text-ink-soft">
                      {Math.round(r.score)}점
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-soft">{r.reason}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function PairCard({ tone, label, pair }: { tone: "best" | "worst"; label: string; pair: PairView }) {
  const best = tone === "best";
  return (
    <section className={cx("washi rounded-card border-l-4 p-5", best ? "border-l-vermilion" : "border-l-water")}>
      <div className="space-y-1">
        <p className={cx("text-tag uppercase", best ? "text-vermilion" : "text-water")}>{label}</p>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-base font-bold">{pair.a} × {pair.b}</h2>
          <span className="shrink-0 font-serif text-2xl font-bold">
            {pair.total}<span className="text-xs font-normal text-ink-soft">점</span>
          </span>
        </div>
      </div>
      {pair.reason && <p className="mt-3 text-sm leading-relaxed">{pair.reason}</p>}
      <ul className="mt-3 space-y-1 text-xs text-ink-soft">
        {pair.factors.map((f) => <li key={f}>― {f}</li>)}
      </ul>
    </section>
  );
}
