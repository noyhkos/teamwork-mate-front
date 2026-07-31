"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MemberForm from "@/components/MemberForm";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Sheet from "@/components/ui/sheet";
import { api, LAST_TEAM_KEY, type TeamView } from "@/lib/api";
import { copyText } from "@/lib/clipboard";
import { setStored } from "@/lib/storage";

export default function TeamPage() {
  const { token } = useParams<{ token: string }>();
  const [team, setTeam] = useState<TeamView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/t/${token}` : "";

  const load = useCallback(async () => {
    try {
      setTeam(await api<TeamView>(`/teams/${token}`));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [token]);

  // Spelled out rather than calling load(): the first fetch needs to drop its
  // result if the page unmounts mid-flight, which the polling path never does.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const view = await api<TeamView>(`/teams/${token}`);
        if (cancelled) return;
        setTeam(view);
        // Remember the team on arrival, not just on creation — otherwise the
        // home button strands anyone who got here from someone else's link.
        setStored(LAST_TEAM_KEY, JSON.stringify({ token, name: view.name }));
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

  function onAdded() {
    setFormOpen(false);
    void load();
  }

  async function removeMember(memberId: string) {
    setRemovingId(memberId);
    setError(null);
    try {
      await api(`/teams/${token}/members/${memberId}`, { method: "DELETE" });
      setConfirmingId(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRemovingId(null);
    }
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
    if (!(await copyText(shareUrl))) {
      setError("링크를 복사하지 못했어요. 주소창에서 직접 복사해 주세요.");
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (error && !team) return <p className="pt-10 text-center text-vermilion">{error}</p>;
  if (!team) return <p className="pt-10 text-center text-ink-soft">불러오는 중…</p>;

  const processing = team.status === "processing";
  // Mirrors MIN_MEMBERS on the api — three core roles need three people.
  const ready = team.memberCount >= 3;
  const shortUrl = shareUrl.replace(/^https?:\/\//, "");

  return (
    <div className="space-y-5">
      {/* px-touch on both sides keeps the title optically centred on the page
          while reserving the corner the home button sits in. */}
      <header className="relative px-touch text-center">
        <Link
          href="/"
          aria-label="홈으로"
          className="focus-seal absolute left-0 top-0 flex h-touch w-touch items-center justify-center rounded-control text-ink-faint transition-colors duration-150 hover:text-ink motion-reduce:transition-none"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden
            fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.5 4.5L7 10l5.5 5.5" />
          </svg>
        </Link>
        <h1 className="font-serif text-2xl font-bold leading-tight">{team.name}</h1>
        <p className="mt-1 text-sm text-ink-soft">{team.memberCount}명 참여 중</p>
      </header>

      {/* The destination sits at the top: the roster below is the thing you scroll. */}
      <div className="space-y-2">
        {team.status === "done" && team.shareSlug ? (
          // The same seal as 분석 시작, now stamped. When the roster has moved
          // on without the report, a smaller one joins it on the left — the
          // api decides that, since the change comes from other people's
          // devices rather than this one.
          <div className="flex items-center justify-center gap-4 py-2">
            {team.staleReport && (
              <button
                type="button"
                onClick={analyze}
                disabled={analyzing}
                aria-busy={analyzing || undefined}
                className="focus-seal flex h-[5.5rem] w-[5.5rem] shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full border border-ink/25 bg-card text-ink transition-colors duration-150 hover:bg-paper-soft disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
              >
                {analyzing ? (
                  <span aria-hidden className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />
                ) : (
                  <>
                    <span aria-hidden className="text-base leading-none">⟳</span>
                    <span className="text-xs font-semibold">다시 분석</span>
                  </>
                )}
              </button>
            )}
            <Link
              href={`/r/${team.shareSlug}`}
              className="focus-seal flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full bg-vermilion text-paper transition-colors duration-150 hover:bg-vermilion/85 motion-reduce:transition-none"
            >
              <span aria-hidden className="text-lg leading-none">🔮</span>
              <span className="text-sm font-semibold">분석 확인</span>
            </Link>
          </div>
        ) : processing ? (
          <Card className="p-4 text-center">
            <p className="font-serif text-sm font-bold">명식을 짓는 중…</p>
            <p className="mt-1 text-xs text-ink-soft">완료되면 이 화면이 알아서 바뀌어요</p>
            <div className="ohaeng-rule mt-3 animate-pulse motion-reduce:animate-none" aria-hidden>
              <i /><i /><i /><i /><i />
            </div>
          </Card>
        ) : (
          // A round seal, not a bar. Pressing it is the one committing act on
          // this screen, and a 도장 is what that gesture looks like here. The
          // circle also holds the "not yet" state without changing shape — it
          // shows how far off the team is instead of restating the rule.
          <div className="flex justify-center py-2">
            <button
              type="button"
              onClick={analyze}
              disabled={!ready || analyzing}
              aria-busy={analyzing || undefined}
              aria-label={ready ? "분석 시작" : `3명부터 분석할 수 있어요. 지금 ${team.memberCount}명`}
              className="focus-seal flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full bg-ink text-paper transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-ink/25 motion-reduce:transition-none enabled:hover:bg-ink/85"
            >
              {analyzing ? (
                <span aria-hidden className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />
              ) : !ready ? (
                <>
                  <span className="font-serif text-2xl font-bold leading-none">{team.memberCount}/3</span>
                  <span className="text-xs">모이는 중</span>
                </>
              ) : (
                <>
                  <span aria-hidden className="text-lg leading-none">✨</span>
                  <span className="text-sm font-semibold">
                    {team.status === "failed" ? "다시 시도" : "분석 시작"}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* One row, tap anywhere to copy — the link is plumbing, not content. */}
        <p className="pt-1 text-xs text-ink-soft">팀원 초대하기</p>
        <button
          type="button"
          onClick={copyLink}
          aria-label="초대 링크 복사"
          className="focus-seal flex min-h-touch w-full cursor-pointer items-center gap-2 rounded-control border border-ink/20 bg-card px-3 text-left transition-colors duration-150 hover:border-ink/40 motion-reduce:transition-none"
        >
          <code className="min-w-0 flex-1 truncate text-xs text-ink-faint">{shortUrl}</code>
          <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-vermilion" aria-hidden
            fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            {copied
              ? <path d="M4.5 10.5l3.5 3.5 7.5-7.5" />
              : <><rect x="7" y="7" width="9" height="9" rx="1.5" /><path d="M13 4.5H5.5A1.5 1.5 0 004 6v7.5" /></>}
          </svg>
          {/* The icon swap is silent to a screen reader; this announces it. */}
          <span role="status" className="sr-only">{copied ? "링크가 복사됐어요" : ""}</span>
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-vermilion">{error}</p>}

      {/* The roster is the body of the page. */}
      <div className="space-y-1.5">
        <p className="text-xs text-ink-soft">팀원 목록</p>
        {team.members.length === 0 ? (
          <Card className="p-6 text-center text-sm text-ink-soft">
            아직 아무도 없어요.<br />먼저 내 정보를 넣어보세요.
          </Card>
        ) : (
          <ul className="space-y-2">
            {team.members.map((m) => (
              <li key={m.id} className="washi flex items-center gap-2 rounded-card py-2 pl-4 pr-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-base font-bold">{m.nickname}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {m.birthDate} · {m.mbti}
                  </p>
                </div>
                {confirmingId === m.id ? (
                  // Two taps, no dialog: someone else's details are easy to
                  // delete by accident on a phone, and a modal for one row is
                  // heavier than the action deserves.
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="focus-seal min-h-touch cursor-pointer rounded-control px-2 text-xs text-ink-soft"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMember(m.id)}
                      disabled={removingId === m.id}
                      className="focus-seal min-h-touch cursor-pointer rounded-control px-2 text-xs font-semibold text-vermilion disabled:opacity-40"
                    >
                      {removingId === m.id ? "삭제 중" : "삭제"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(m.id)}
                    aria-label={`${m.nickname} 삭제`}
                    className="focus-seal flex h-touch w-touch shrink-0 cursor-pointer items-center justify-center rounded-control text-ink-faint transition-colors duration-150 hover:text-vermilion motion-reduce:transition-none"
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden
                      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 6h12M8 6V4.5h4V6M6 6l.7 9.5h6.6L14 6" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!processing && (
        <Button variant="outline" size="lg" full onClick={() => setFormOpen(true)}>
          + 멤버 추가하기
        </Button>
      )}

      <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="멤버 추가">
        <MemberForm endpoint={`/teams/${token}/members`} onAdded={onAdded} />
      </Sheet>
    </div>
  );
}
