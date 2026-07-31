"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MemberForm from "@/components/MemberForm";
import { api, type TeamView } from "@/lib/api";
import { setStored, useStored } from "@/lib/storage";

export default function TeamPage() {
  const { token } = useParams<{ token: string }>();
  const [team, setTeam] = useState<TeamView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [proxyOpen, setProxyOpen] = useState(false);

  const storageKey = `twm:submitted:${token}`;
  // There are no accounts, so "did I already enter?" only exists on this device.
  const myNickname = useStored(storageKey);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/t/${token}` : "";

  const load = useCallback(async () => {
    try {
      setTeam(await api<TeamView>(`/teams/${token}`));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const view = await api<TeamView>(`/teams/${token}`);
        if (!cancelled) setTeam(view);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // The analysis runs on a worker; without polling this page would sit on
  // "분석 중" until the visitor thinks to refresh.
  useEffect(() => {
    if (team?.status !== "processing") return;
    const timer = setInterval(load, 2000);
    return () => clearInterval(timer);
  }, [team?.status, load]);

  function onAdded(nickname: string) {
    // The first entry from this device is "me"; anything after that is a proxy
    // entry and must not move the "· 나" marker.
    if (myNickname === null) setStored(storageKey, nickname);
    setProxyOpen(false);
    void load();
  }

  async function analyze() {
    setAnalyzing(true);
    setError(null);
    try {
      await api(`/teams/${token}/analyze`, { method: "POST" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      await load();
      setAnalyzing(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (error && !team) return <p className="pt-10 text-center text-fire">{error}</p>;
  if (!team) return <p className="pt-10 text-center text-ink-soft">불러오는 중…</p>;

  const alreadyIn = myNickname !== null && team.members.includes(myNickname);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs text-vermilion">우리 팀</p>
        <h1 className="font-serif text-2xl font-bold">{team.name ?? "이름 없는 팀"}</h1>
        <p className="mt-1 text-sm text-ink-soft">현재 {team.memberCount}명 입력 완료</p>
      </header>

      {team.status === "collecting" && (
        <div className="washi rounded-sm p-4">
          <p className="text-xs text-ink-soft">이 링크를 팀원에게 보내세요. 각자 들어와서 자기 정보를 입력해요.</p>
          <div className="mt-2 flex gap-2">
            <code className="flex-1 truncate rounded-lg bg-paper-soft px-3 py-2 text-xs">{shareUrl}</code>
            <button onClick={copyLink} className="shrink-0 rounded-lg btn-ink px-3 py-2 text-xs">
              {copied ? "복사됨!" : "복사"}
            </button>
          </div>
        </div>
      )}

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

      {error && <p className="text-sm text-fire">{error}</p>}

      {team.status === "done" && team.shareSlug ? (
        <Link href={`/r/${team.shareSlug}`}
          className="block rounded-sm py-3 text-center text-sm font-semibold text-paper bg-vermilion hover:opacity-90">
          🔮 분석 완료! 리포트 보러 가기 →
        </Link>
      ) : team.status === "processing" ? (
        <div className="washi rounded-sm p-5 text-center">
          <p className="font-serif text-sm font-bold">명식을 짓는 중…</p>
          <p className="mt-1 text-xs text-ink-soft">
            사주 계산 · 궁합 · 역할 배정 · 문구 생성. 완료되면 이 화면이 알아서 바뀌어요.
          </p>
          <div className="ohaeng-rule mt-4 animate-pulse" aria-hidden><i /><i /><i /><i /><i /></div>
        </div>
      ) : team.status === "collecting" ? (
        <>
          {alreadyIn && !proxyOpen ? (
            <div className="washi rounded-sm p-5 text-center">
              <p className="font-serif text-sm font-bold">입력 완료 🎉</p>
              <p className="mt-1 text-xs text-ink-soft">
                {team.memberCount < 2
                  ? "팀원이 2명 이상 모이면 분석을 실행할 수 있어요."
                  : "팀원을 더 기다리거나, 지금 바로 분석해도 돼요."}
              </p>
              <button onClick={() => setProxyOpen(true)}
                className="mt-3 text-xs text-ink-soft underline">
                안 들어올 사람 대신 입력하기
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold text-ink">
                  {proxyOpen ? "대신 입력하기" : team.memberCount === 0 ? "먼저 내 정보부터 입력하기" : "내 정보 입력하기"}
                </h2>
                {proxyOpen && (
                  <button onClick={() => setProxyOpen(false)} className="text-xs text-ink-soft underline">
                    취소
                  </button>
                )}
              </div>
              <MemberForm endpoint={`/teams/${token}/members`} onAdded={onAdded} />
            </>
          )}

          <button onClick={analyze} disabled={analyzing || team.memberCount < 2}
            className="w-full rounded-lg btn-ink py-3 text-sm font-semibold disabled:opacity-40">
            {analyzing ? "요청 보내는 중…"
              : team.memberCount < 2 ? "멤버가 2명 이상 모이면 분석할 수 있어요"
              : `✨ ${team.memberCount}명으로 분석 실행`}
          </button>
        </>
      ) : (
        <button onClick={analyze} disabled={analyzing}
          className="w-full rounded-lg btn-ink py-3 text-sm font-semibold disabled:opacity-40">
          {analyzing ? "요청 보내는 중…" : "⟳ 다시 분석하기"}
        </button>
      )}
    </div>
  );
}
