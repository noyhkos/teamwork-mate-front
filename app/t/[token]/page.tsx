"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MemberForm from "@/components/MemberForm";
import Button from "@/components/ui/button";
import Card, { SectionTitle } from "@/components/ui/card";
import Chip from "@/components/ui/chip";
import Sheet from "@/components/ui/sheet";
import { api, type TeamView } from "@/lib/api";
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

  return (
    <div className="space-y-6">
      {/* 1 · 팀 이름 */}
      <header className="space-y-1">
        <p className="text-tag uppercase text-vermilion">우리 팀</p>
        <h1 className="font-serif text-2xl font-bold leading-tight">{team.name ?? "이름 없는 팀"}</h1>
        <p className="text-sm text-ink-soft">{team.memberCount}명 입력 완료</p>
      </header>

      {/* 2 · 공유 링크 */}
      <Card className="space-y-2">
        <p className="text-xs text-ink-soft">이 링크를 팀원에게 보내세요. 각자 들어와서 자기 정보를 입력해요.</p>
        <div className="flex gap-2">
          <code className="min-w-0 flex-1 truncate rounded-control bg-paper-soft px-3 py-2.5 text-xs text-ink">
            {shareUrl}
          </code>
          <Button variant="outline" onClick={copyLink} aria-label="공유 링크 복사">
            {copied ? "복사됨" : "복사"}
          </Button>
        </div>
      </Card>

      {/* 3 · 팀 멤버 목록 */}
      <section className="space-y-3">
        <SectionTitle eyebrow="members">팀 멤버</SectionTitle>
        {team.members.length === 0 ? (
          <p className="text-sm text-ink-soft">아직 아무도 없어요. 먼저 내 정보를 넣어보세요.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {team.members.map((n) => (
              <li key={n}>
                <Chip tone={n === myNickname ? "seal" : "plain"}>
                  {n}
                  {n === myNickname && <span className="text-[0.6875rem]">· 나</span>}
                </Chip>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && <p role="alert" className="text-sm text-vermilion">{error}</p>}

      {/* 4·5·6 · 추가하기 / 리포트 생성 / 리포트 보기 */}
      <div className="space-y-2.5">
        {collecting && (
          <Button variant="outline" size="lg" full onClick={() => setFormOpen(true)}>
            + 멤버 추가하기
          </Button>
        )}

        {processing ? (
          <Card className="text-center">
            <p className="font-serif text-sm font-bold">명식을 짓는 중…</p>
            <p className="mt-1 text-xs text-ink-soft">
              사주 계산 · 궁합 · 역할 배정 · 문구 생성. 완료되면 이 화면이 알아서 바뀌어요.
            </p>
            <div className="ohaeng-rule mt-4 animate-pulse motion-reduce:animate-none" aria-hidden>
              <i /><i /><i /><i /><i />
            </div>
          </Card>
        ) : (
          <Button
            variant={team.status === "done" ? "outline" : "primary"}
            size="lg"
            full
            onClick={analyze}
            loading={analyzing}
            disabled={!ready}
          >
            {!ready ? `멤버 3명부터 분석할 수 있어요 (지금 ${team.memberCount}명)`
              : team.status === "done" ? "⟳ 다시 분석하기"
              : team.status === "failed" ? "⟳ 다시 시도하기"
              : `✨ ${team.memberCount}명으로 리포트 생성`}
          </Button>
        )}

        {team.status === "done" && team.shareSlug && (
          <Link
            href={`/r/${team.shareSlug}`}
            className="focus-seal flex min-h-[3.25rem] w-full items-center justify-center rounded-control bg-vermilion text-base font-semibold text-paper transition-colors duration-150 hover:bg-vermilion/85 motion-reduce:transition-none"
          >
            🔮 리포트 보러 가기 →
          </Link>
        )}
      </div>

      <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="멤버 추가">
        <MemberForm endpoint={`/teams/${token}/members`} onAdded={onAdded} />
      </Sheet>
    </div>
  );
}
