import type { Metadata } from "next";
import ShareBar from "@/components/ShareBar";

const API = process.env.API_BASE_URL ?? "http://localhost:8080";

interface Report {
  teamName: string | null;
  archetype: string;
  archetypeDesc: string | null;
  intro: string | null;
  harmonyScore: number;
  roles: { nickname: string; role: string; roleKo: string; score: number; unique: boolean | null; reason: string }[];
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
    <div className="space-y-9">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.35em] text-ink-soft">{report.teamName ?? "우리 팀"} · 팀 명식</p>
        <h1 className="font-serif text-4xl font-bold leading-snug">{report.archetype}</h1>
        {(report.intro ?? report.archetypeDesc) && (
          <p className="text-sm text-ink-soft">{report.intro ?? report.archetypeDesc}</p>
        )}
      </header>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/reports/${slug}/card.png`} alt="공유 카드"
        className="washi w-full rounded-sm" />

      <section className="washi rounded-sm p-6">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-base font-bold">팀 하모니</h2>
          <p className="font-serif text-5xl font-bold">
            {report.harmonyScore}<span className="ml-1 text-base font-normal text-ink-soft">/ 100</span>
          </p>
        </div>
        <div className="mt-4 h-[3px] w-full bg-ink/10">
          <div className="h-full bg-vermilion" style={{ width: `${report.harmonyScore}%` }} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-base font-bold">역할 추천</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {report.roles.map((r) => (
            <div key={r.nickname + r.role} className="washi rounded-sm p-4 text-center">
              <div className="font-serif text-xl font-bold">{r.nickname}</div>
              <div className="mt-1 inline-block border border-vermilion px-2 py-0.5 text-xs text-vermilion">
                {r.roleKo}{r.unique === false ? " ·중복" : ""}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">{r.reason}</p>
            </div>
          ))}
        </div>
      </section>

      {report.bestPair && (
        <PairCard tone="best" title={`붉은 실 ─ ${report.bestPair.a} × ${report.bestPair.b}`}
          score={report.bestPair.total} factors={report.bestPair.factors} reason={report.bestPair.reason} />
      )}
      {report.worstPair && (
        <PairCard tone="worst" title={`서걱이는 조합 ─ ${report.worstPair.a} × ${report.worstPair.b}`}
          score={report.worstPair.total} factors={report.worstPair.factors} reason={report.worstPair.reason} />
      )}

      <section className="space-y-3">
        <h2 className="font-serif text-base font-bold">팀 성향 밸런스</h2>
        <div className="washi space-y-2.5 rounded-sm p-6">
          {Object.entries(report.traitAvgs).map(([k, v]) => (
            <div key={k} className="flex items-center gap-3 text-xs">
              <span className="w-12 shrink-0 text-ink-soft">{TRAIT_KO[k] ?? k}</span>
              <div className="h-[3px] flex-1 bg-ink/10">
                <div className="h-full bg-ink" style={{ width: `${Math.min(100, v)}%` }} />
              </div>
              <span className="w-8 text-right font-serif text-sm">{Math.round(v)}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(report.elementTotals).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5 border border-ink/20 bg-card px-3 py-1">
              <i className={`inline-block h-2.5 w-2.5 rounded-full ${ELEMENT_CLASS[k] ?? "bg-ink"}`} />
              {k} {v}
            </span>
          ))}
        </div>
      </section>

      {report.riskNote && (
        <section className="border-l-4 border-vermilion bg-vermilion/5 p-5 text-sm">
          <span className="font-serif font-bold text-vermilion">주의보 </span>{report.riskNote}
        </section>
      )}

      {report.samjaeMembers.length > 0 && (
        <p className="text-xs text-ink-soft">
          🌊 올해 삼재: <span className="text-ink">{report.samjaeMembers.join(", ")}</span> — 올해는 무리하지 말고 서로 챙겨주기!
        </p>
      )}

      <ShareBar title={`${report.teamName ?? "우리 팀"} — ${report.archetype}`} />

      {/* The report is where most visitors first meet the service. */}
      <a href="/" className="block rounded-sm border border-ink/20 bg-card p-5 text-center hover:border-ink/40">
        <span className="font-serif text-sm font-bold">우리 팀도 뽑아볼까?</span>
        <span className="mt-1 block text-xs text-ink-soft">생일과 MBTI만 있으면 2분이면 돼요 →</span>
      </a>
    </div>
  );
}

function PairCard({ tone, title, score, factors, reason }: {
  tone: "best" | "worst"; title: string; score: number; factors: string[]; reason: string | null;
}) {
  const accent = tone === "best" ? "text-vermilion border-vermilion/40" : "text-water border-water/40";
  return (
    <section className={`washi rounded-sm border-l-4 p-6 ${accent.split(" ")[1]}`}>
      <div className="flex items-baseline justify-between">
        <h2 className={`font-serif text-base font-bold ${accent.split(" ")[0]}`}>{title}</h2>
        <span className="font-serif text-2xl font-bold">{score}<span className="text-xs font-normal text-ink-soft">점</span></span>
      </div>
      {reason && <p className="mt-3 text-sm leading-relaxed">{reason}</p>}
      <ul className="mt-3 space-y-1 text-xs text-ink-soft">
        {factors.map((f) => <li key={f}>― {f}</li>)}
      </ul>
    </section>
  );
}
