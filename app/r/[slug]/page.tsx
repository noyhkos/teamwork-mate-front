import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import ReportTabs from "@/components/report/ReportTabs";
import type { Report } from "@/components/report/types";
import ShareBar from "@/components/ShareBar";

const API = process.env.API_BASE_URL ?? "http://localhost:8080";

// generateMetadata and the page body both need the report. `no-store` opts out
// of the data cache, so without this the same render pass fetches it twice.
const getReport = cache(async (slug: string): Promise<Report | null> => {
  const res = await fetch(`${API}/api/reports/${slug}`, { cache: "no-store" });
  return res.ok ? res.json() : null;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReport(slug);
  // The page calls notFound() for a missing report, and Next discards this
  // metadata when it does — the root layout's defaults are what ship. Returning
  // early only keeps us from dereferencing null, but it is also what stops a
  // card.png that would itself 404 from being advertised as the preview image.
  if (!report) return {};

  const title = `${report.teamName} — ${report.archetype}`;
  return {
    title,
    openGraph: { title, images: [`/api/reports/${slug}/card.png`] },
  };
}

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getReport(slug);
  // 200 with a sentence read as a real page to crawlers and to anyone who
  // mistyped the slug. A wrong link should say so with a status code.
  if (!report) notFound();

  return (
    <div className="space-y-6">
      {/* The archetype and the share card stay above the tabs: they are what
          the whole report is about, and what a visitor arriving from a shared
          link should see before choosing where to look. */}
      <header className="space-y-2">
        <p className="text-tag uppercase text-ink-soft">{report.teamName} · 팀 명식</p>
        <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">{report.archetype}</h1>
        {(report.intro ?? report.archetypeDesc) && (
          <p className="text-sm leading-relaxed text-ink-soft">{report.intro ?? report.archetypeDesc}</p>
        )}
      </header>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/reports/${slug}/card.png`} alt="공유 카드" width={1200} height={630}
        className="washi w-full rounded-card" />

      <ReportTabs report={report} />

      <ShareBar title={`${report.teamName} — ${report.archetype}`} />

      {/* The report is where most visitors first meet the service. */}
      <Link href="/"
        className="focus-seal block rounded-card border border-ink/20 bg-card p-5 text-center hover:border-ink/40">
        <span className="font-serif text-sm font-bold">우리 팀도 뽑아볼까?</span>
        <span className="mt-1 block text-xs text-ink-soft">생일과 MBTI만 있으면 2분이면 돼요 →</span>
      </Link>
    </div>
  );
}
