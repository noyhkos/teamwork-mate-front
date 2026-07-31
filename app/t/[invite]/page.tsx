"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MemberForm from "@/components/MemberForm";
import { api, type InviteView } from "@/lib/api";

export default function InvitePage() {
  const { invite } = useParams<{ invite: string }>();
  const [team, setTeam] = useState<InviteView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myNickname, setMyNickname] = useState<string | null>(null);

  const storageKey = `twm:submitted:${invite}`;

  const load = useCallback(async () => {
    try {
      setTeam(await api<InviteView>(`/teams/invite/${invite}`));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [invite]);

  useEffect(() => {
    load();
    // There are no accounts, so "did I already enter?" only exists on this device.
    setMyNickname(localStorage.getItem(storageKey));
  }, [load, storageKey]);

  // The analysis runs on a worker; without polling this page would sit on
  // "분석 중" until the visitor thinks to refresh.
  useEffect(() => {
    if (team?.status !== "processing") return;
    const timer = setInterval(load, 2000);
    return () => clearInterval(timer);
  }, [team?.status, load]);

  function onAdded(nickname: string) {
    localStorage.setItem(storageKey, nickname);
    setMyNickname(nickname);
    load();
  }

  if (error) return <p className="pt-10 text-center text-fire">{error}</p>;
  if (!team) return <p className="pt-10 text-center text-ink-soft">불러오는 중…</p>;

  const alreadyIn = myNickname !== null && team.members.includes(myNickname);

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
            <span key={n}
              className={`rounded-full border px-3 py-1 text-xs ${
                n === myNickname
                  ? "border-vermilion bg-vermilion/10 text-vermilion"
                  : "border-ink/15 bg-paper-soft text-ink"
              }`}>
              {n}{n === myNickname ? " · 나" : ""}
            </span>
          ))}
        </div>
      )}

      {team.status === "done" && team.shareSlug ? (
        <a href={`/r/${team.shareSlug}`}
          className="block rounded-sm py-3 text-center text-sm font-semibold text-paper bg-vermilion hover:opacity-90">
          🔮 분석 완료! 리포트 보러 가기 →
        </a>
      ) : team.status === "processing" ? (
        <div className="washi rounded-sm p-5 text-center">
          <p className="font-serif text-sm font-bold">명식을 짓는 중…</p>
          <p className="mt-1 text-xs text-ink-soft">완료되면 이 화면이 알아서 바뀌어요</p>
          <div className="ohaeng-rule mt-4 animate-pulse" aria-hidden><i /><i /><i /><i /><i /></div>
        </div>
      ) : team.status === "collecting" ? (
        alreadyIn ? (
          <div className="washi rounded-sm p-5 text-center">
            <p className="font-serif text-sm font-bold">입력 완료 🎉</p>
            <p className="mt-1 text-xs text-ink-soft">
              나머지 팀원을 기다리는 중이에요. 관리자가 분석을 실행하면 여기서 리포트를 볼 수 있어요.
            </p>
            <button onClick={() => { localStorage.removeItem(storageKey); setMyNickname(null); }}
              className="mt-3 text-xs text-ink-soft underline">
              다른 사람 정보도 입력하기
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-ink">내 정보 입력하기</h2>
            <MemberForm endpoint={`/teams/invite/${invite}/members`} onAdded={onAdded} />
          </>
        )
      ) : (
        <p className="washi rounded-sm p-4 text-center text-sm text-ink-soft">
          현재 상태: {team.status}
        </p>
      )}
    </div>
  );
}
