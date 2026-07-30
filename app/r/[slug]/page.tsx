import type { Metadata } from "next";

const API = process.env.API_BASE_URL ?? "http://localhost:8080";

interface Report {
  teamName: string | null;
  archetype: string;
  archetypeDesc: string | null;
  harmonyScore: number;
  roles: { nickname: string; role: string; roleKo: string; score: number; unique: boolean | null }[];
  bestPair: { a: string; b: string; total: number; factors: string[] } | null;
  worstPair: { a: string; b: string; total: number; factors: string[] } | null;
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

const ROLE_EMOJI: Record<string, string> = {
  leader: "👑", vice: "🥈", treasurer: "💰", mood: "🎉", idea: "💡", mediator: "🕊️", brake: "🛑",
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
    return <p className="pt-10 text-center text-slate-500">리포트가 아직 없거나 만료됐어요.</p>;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs text-indigo-400">{report.teamName ?? "우리 팀"}</p>
        <h1 className="text-3xl font-bold">{report.archetype}</h1>
        {report.archetypeDesc && <p className="text-sm text-slate-400">{report.archetypeDesc}</p>}
      </header>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/reports/${slug}/card.png`} alt="공유 카드"
        className="w-full rounded-2xl border border-slate-800" />

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-end justify-between">
          <h2 className="text-sm font-semibold text-slate-300">팀 하모니</h2>
          <span className="text-4xl font-bold text-emerald-400">{report.harmonyScore}<span className="text-base text-slate-500">/100</span></span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${report.harmonyScore}%` }} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300">역할 추천</h2>
        <div className="grid grid-cols-2 gap-3">
          {report.roles.map((r) => (
            <div key={r.nickname + r.role} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-2xl">{ROLE_EMOJI[r.role] ?? "🎯"}</div>
              <div className="mt-1 font-semibold">{r.nickname}</div>
              <div className="text-xs text-indigo-300">{r.roleKo}{r.unique === false ? " (중복)" : ""}</div>
            </div>
          ))}
        </div>
      </section>

      {report.bestPair && (
        <PairCard tone="best" title={`🔥 베스트 케미 — ${report.bestPair.a} × ${report.bestPair.b} (${report.bestPair.total}점)`}
          factors={report.bestPair.factors} />
      )}
      {report.worstPair && (
        <PairCard tone="worst" title={`⚡ 조심 조합 — ${report.worstPair.a} × ${report.worstPair.b} (${report.worstPair.total}점)`}
          factors={report.worstPair.factors} />
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300">팀 성향 밸런스</h2>
        <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          {Object.entries(report.traitAvgs).map(([k, v]) => (
            <div key={k} className="flex items-center gap-3 text-xs">
              <span className="w-12 shrink-0 text-slate-400">{TRAIT_KO[k] ?? k}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, v)}%` }} />
              </div>
              <span className="w-8 text-right text-slate-500">{Math.round(v)}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(report.elementTotals).map(([k, v]) => (
            <span key={k} className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">{k} {v}</span>
          ))}
        </div>
      </section>

      {report.riskNote && (
        <section className="rounded-2xl border border-amber-800/50 bg-amber-950/20 p-5 text-sm text-amber-200">
          ⚠️ {report.riskNote}
        </section>
      )}

      {report.samjaeMembers.length > 0 && (
        <p className="text-xs text-slate-500">
          🌊 올해 삼재: {report.samjaeMembers.join(", ")} — 올해는 무리하지 말고 서로 챙겨주기!
        </p>
      )}
    </div>
  );
}

function PairCard({ tone, title, factors }: { tone: "best" | "worst"; title: string; factors: string[] }) {
  const border = tone === "best" ? "border-emerald-800/50 bg-emerald-950/20" : "border-rose-800/50 bg-rose-950/20";
  return (
    <section className={`rounded-2xl border p-5 ${border}`}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-2 space-y-1 text-xs text-slate-400">
        {factors.map((f) => <li key={f}>· {f}</li>)}
      </ul>
    </section>
  );
}
