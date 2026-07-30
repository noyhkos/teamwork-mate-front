"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MemberForm from "@/components/MemberForm";
import { api, type InviteView } from "@/lib/api";

export default function InvitePage() {
  const { invite } = useParams<{ invite: string }>();
  const [team, setTeam] = useState<InviteView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTeam(await api<InviteView>(`/teams/invite/${invite}`));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [invite]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="pt-10 text-center text-fire">{error}</p>;
  if (!team) return <p className="pt-10 text-center text-ink-soft">불러오는 중…</p>;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs text-vermilion">팀 참여</p>
        <h1 className="font-serif text-2xl font-bold">{team.name ?? "이름 없는 팀"}</h1>
        <p className="mt-1 text-sm text-ink-soft">현재 {team.memberCount}명 입력 완료</p>
      </header>

      {team.members.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {team.members.map((n) => (
            <span key={n} className="rounded-full bg-paper-soft border border-ink/15 px-3 py-1 text-xs text-ink">{n}</span>
          ))}
        </div>
      )}

      {team.status === "done" && team.shareSlug ? (
        <a href={`/r/${team.shareSlug}`}
          className="block rounded-lg py-3 text-center text-sm font-semibold text-paper bg-vermilion hover:opacity-90">
          🔮 분석 완료! 리포트 보러 가기 →
        </a>
      ) : team.status === "collecting" ? (
        <>
          <h2 className="text-sm font-semibold text-ink">내 정보 입력하기</h2>
          <MemberForm endpoint={`/teams/invite/${invite}/members`} onAdded={load} />
        </>
      ) : (
        <p className="washi rounded-sm p-4 text-center text-sm text-ink-soft">
          {team.status === "processing" ? "분석이 진행 중이에요…" : `현재 상태: ${team.status}`}
        </p>
      )}
    </div>
  );
}
