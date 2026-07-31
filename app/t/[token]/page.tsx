"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MemberForm from "@/components/MemberForm";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Sheet from "@/components/ui/sheet";
import { api, type TeamView } from "@/lib/api";
import { cx } from "@/lib/cx";
import { setStored, useStored } from "@/lib/storage";

export default function TeamPage() {
  const { token } = useParams<{ token: string }>();
  const [team, setTeam] = useState<TeamView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

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

  // Spelled out rather than calling load(): the first fetch needs to drop its
  // result if the page unmounts mid-flight, which the polling path never does.
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
    // The first entry from this device is "me"; anything after that is entered
    // on someone else's behalf and must not move the "· 나" marker.
    if (myNickname === null) setStored(storageKey, nickname);
    setFormOpen(false);
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

  if (error && !team) return <p className="pt-10 text-center text-vermilion">{error}</p>;
  if (!team) return <p className="pt-10 text-center text-ink-soft">불러오는 중…</p>;

  const collecting = team.status === "collecting";
  const processing = team.status === "processing";
  // Mirrors MIN_MEMBERS on the api — three core roles need three people.
  const ready = team.memberCount >= 3;
  const shortUrl = shareUrl.replace(/^https?:\/\//, "");

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-tag uppercase text-vermilion">우리 팀</p>
        <h1 className="font-serif text-2xl font-bold leading-tight">{team.name ?? "이름 없는 팀"}</h1>
        <p className="text-sm text-ink-soft">{team.memberCount}명 참여 중</p>
      </header>

      {/* The destination sits at the top: the roster below is the thing you scroll. */}
      <div className="space-y-2">
        {team.status === "done" && team.shareSlug ? (
          <Link
            href={`/r/${team.shareSlug}`}
            className="focus-seal flex min-h-[3.25rem] w-full items-center justify-center rounded-control bg-vermilion text-base font-semibold text-paper transition-colors duration-150 hover:bg-vermilion/85 motion-reduce:transition-none"
          >
            🔮 리포트 보러 가기 →
          </Link>
        ) : processing ? (
          <Card className="p-4 text-center">
            <p className="font-serif text-sm font-bold">명식을 짓는 중…</p>
            <p className="mt-1 text-xs text-ink-soft">완료되면 이 화면이 알아서 바뀌어요</p>
            <div className="ohaeng-rule mt-3 animate-pulse motion-reduce:animate-none" aria-hidden>
              <i /><i /><i /><i /><i />
            </div>
          </Card>
        ) : (
          <Button size="lg" full onClick={analyze} loading={analyzing} disabled={!ready}>
            {!ready ? `${3 - team.memberCount}명 더 모이면 시작해요`
              : team.status === "failed" ? "⟳ 다시 시도하기"
              : `✨ ${team.memberCount}명으로 리포트 생성`}
          </Button>
        )}

        {/* One row, tap anywhere to copy — the link is plumbing, not content. */}
        <button
          type="button"
          onClick={copyLink}
          aria-label="초대 링크 복사"
          className="focus-seal flex min-h-touch w-full cursor-pointer items-center gap-2 rounded-control border border-ink/20 bg-card px-3 text-left transition-colors duration-150 hover:border-ink/40 motion-reduce:transition-none"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden
            fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M8.5 11.5a3 3 0 004.2 0l2.6-2.6a3 3 0 10-4.2-4.2l-.9.9" />
            <path d="M11.5 8.5a3 3 0 00-4.2 0l-2.6 2.6a3 3 0 104.2 4.2l.9-.9" />
          </svg>
          <code className="min-w-0 flex-1 truncate text-xs text-ink-soft">{shortUrl}</code>
          <span className="shrink-0 text-xs font-semibold text-ink">{copied ? "복사됨" : "복사"}</span>
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-vermilion">{error}</p>}

      {/* The roster is the body of the page. */}
      {team.members.length === 0 ? (
        <Card className="p-6 text-center text-sm text-ink-soft">
          아직 아무도 없어요.<br />먼저 내 정보를 넣어보세요.
        </Card>
      ) : (
        <ul className="space-y-2">
          {team.members.map((m) => {
            const mine = m.nickname === myNickname;
            return (
              <li
                key={m.nickname}
                className={cx("washi rounded-card px-4 py-3", mine && "washi-marked")}
              >
                <p className="font-serif text-base font-bold">
                  {m.nickname}
                  {mine && <span className="ml-1.5 text-xs font-normal text-vermilion">· 나</span>}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {m.birthDate} · {m.mbti}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {collecting && (
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
