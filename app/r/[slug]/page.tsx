import type { Metadata } from "next";
import Link from "next/link";
import ShareBar from "@/components/ShareBar";
import Card, { SectionTitle } from "@/components/ui/card";
import Chip from "@/components/ui/chip";

const API = process.env.API_BASE_URL ?? "http://localhost:8080";

interface Report {
  teamName: string | null;
  archetype: string;
  archetypeDesc: string | null;
  intro: string | null;
  harmonyScore: number;
  roles: { nickname: string; role: string; roleKo: string; score: number; reason: string }[];
  bestPair: { a: string; b: string; total: number; factors: string[]; reason: string | null } | null;
  worstPair: { a: string; b: string; total: number; factors: string[]; reason: string | null } | null;
  traitAvgs: Record<string, number>;
  elementTotals: Record<string, number>;
  riskNote: string | null;
  samjaeMembers: string[];
  shareSlug: string | null;
}

const TRAIT_KO: Record<string, string> = {
  DRIVE: "추진력", CAUTION: "신중함", SOCIAL: "사교성", DETAIL: "꼼꼼함",
  CREATIVE: "창의성", HARMONY: "조율력", COMMAND: "리더십", STEADY: "안정감",
};

const ELEMENT_CLASS: Record<string, string> = {
  목: "bg-wood", 화: "bg-fire", 토: "bg-earth", 금: "bg-metal", 수: "bg-water",
};

async function getReport(slug: string): Promise<Report | null> {
  const res = await fetch(`${API}/api/reports/${slug}`, { cache: "no-store" });
  return res.ok ? res.json() : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReport(slug);
  const title = report ? `${report.teamName ?? "우리 팀"} — ${report.archetype}` : "팀 리포트";
  return {
    title,
    openGraph: { title, images: [`/api/reports/${slug}/card.png`] },
  };
}

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) {
    return <p className="pt-10 text-center text-ink-soft">리포트가 아직 없거나 만료됐어요.</p>;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-tag uppercase text-ink-soft">{report.teamName ?? "우리 팀"} · 팀 명식</p>
        <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">{report.archetype}</h1>
        {(report.intro ?? report.archetypeDesc) && (
          <p className="text-sm leading-relaxed text-ink-soft">{report.intro ?? report.archetypeDesc}</p>
        )}
      </header>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/reports/${slug}/card.png`} alt="공유 카드" width={1200} height={630}
        className="washi w-full rounded-card" />

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

      {/*
        A ranked list, not a grid. Two columns left ~150px per card at 320px,
        which wrapped Korean every eight characters; the list also keeps the
        ladder order readable no matter how many members a team has.
      */}
      <section className="space-y-3">
        <SectionTitle eyebrow="roles">역할</SectionTitle>
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
      </section>

      {report.bestPair && (
        <PairCard tone="best" a={report.bestPair.a} b={report.bestPair.b} label="붉은 실"
          score={report.bestPair.total} factors={report.bestPair.factors} reason={report.bestPair.reason} />
      )}
      {report.worstPair && (
        <PairCard tone="worst" a={report.worstPair.a} b={report.worstPair.b} label="서걱이는 조합"
          score={report.worstPair.total} factors={report.worstPair.factors} reason={report.worstPair.reason} />
      )}

      <section className="space-y-3">
        <SectionTitle eyebrow="balance">팀 성향 밸런스</SectionTitle>
        <Card className="space-y-2.5">
          {Object.entries(report.traitAvgs).map(([k, v]) => (
            <div key={k} className="flex items-center gap-3 text-xs">
              <span className="w-12 shrink-0 text-ink-soft">{TRAIT_KO[k] ?? k}</span>
              <div className="h-[3px] flex-1 bg-ink/10">
                <div className="h-full bg-ink" style={{ width: `${Math.min(100, v)}%` }} />
              </div>
              <span className="w-7 shrink-0 text-right font-serif text-sm">{Math.round(v)}</span>
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

      {report.riskNote && (
        <section className="border-l-4 border-vermilion bg-vermilion/5 p-4 text-sm leading-relaxed">
          <span className="font-serif font-bold text-vermilion">주의보 </span>
          {report.riskNote}
        </section>
      )}

      {report.samjaeMembers.length > 0 && (
        <p className="text-xs leading-relaxed text-ink-soft">
          🌊 올해 삼재: <span className="text-ink">{report.samjaeMembers.join(", ")}</span> — 올해는 무리하지 말고 서로 챙겨주기!
        </p>
      )}

      <ShareBar title={`${report.teamName ?? "우리 팀"} — ${report.archetype}`} />

      {/* The report is where most visitors first meet the service. */}
      <Link href="/"
        className="focus-seal block rounded-card border border-ink/20 bg-card p-5 text-center hover:border-ink/40">
        <span className="font-serif text-sm font-bold">우리 팀도 뽑아볼까?</span>
        <span className="mt-1 block text-xs text-ink-soft">생일과 MBTI만 있으면 2분이면 돼요 →</span>
      </Link>
    </div>
  );
}

function PairCard({ tone, a, b, label, score, factors, reason }: {
  tone: "best" | "worst"; a: string; b: string; label: string;
  score: number; factors: string[]; reason: string | null;
}) {
  const best = tone === "best";
  return (
    <section className={`washi rounded-card border-l-4 p-5 ${best ? "border-l-vermilion" : "border-l-water"}`}>
      {/* Names wrap onto their own line so a long pair never pushes the score off-screen. */}
      <div className="space-y-1">
        <p className={`text-tag uppercase ${best ? "text-vermilion" : "text-water"}`}>{label}</p>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-base font-bold">{a} × {b}</h2>
          <span className="shrink-0 font-serif text-2xl font-bold">
            {score}<span className="text-xs font-normal text-ink-soft">점</span>
          </span>
        </div>
      </div>
      {reason && <p className="mt-3 text-sm leading-relaxed">{reason}</p>}
      <ul className="mt-3 space-y-1 text-xs text-ink-soft">
        {factors.map((f) => <li key={f}>― {f}</li>)}
      </ul>
    </section>
  );
}
