import type { Metadata } from "next";

const API = process.env.API_BASE_URL ?? "http://localhost:8080";

/**
 * The team page itself polls, so it is a client component and cannot export
 * metadata. This layout exists only to name the team in the link preview —
 * the image already did, but the title is the bigger of the two in KakaoTalk.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const team = await fetch(`${API}/api/teams/${token}`, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

  if (!team) return { title: "팀사주" };

  const done = team.status === "done";
  return {
    title: `${team.name} · 팀사주`,
    description: done
      ? `${team.name}의 팀궁합 리포트가 나왔어요.`
      : `${team.name}에 ${team.memberCount}명이 모였어요. 생일과 MBTI만 넣으면 우리 팀 궁합이 나와요.`,
  };
}

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
