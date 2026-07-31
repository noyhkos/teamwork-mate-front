"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Field, { TextInput } from "@/components/ui/field";
import { api, LAST_TEAM_KEY, type TeamCreated } from "@/lib/api";
import { setStored, useStored } from "@/lib/storage";

type LastTeam = { token: string; name: string | null };

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No accounts: the only trace of a team you made lives on this device.
  const lastRaw = useStored(LAST_TEAM_KEY);
  const last: LastTeam | null = lastRaw ? JSON.parse(lastRaw) : null;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await api<TeamCreated>("/teams", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setStored(LAST_TEAM_KEY, JSON.stringify({ token: created.token, name: name || null }));
      // push, not replace: replacing dropped this page from history, so back
      // from the team page skipped the landing screen entirely and left the
      // site. Coming back here is harmless now — the team is saved, so the
      // page offers to resume it.
      router.push(`/t/${created.token}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8 pt-6">
      <div className="space-y-3 text-center">
        {/* 2xl until sm: at 320px the 3xl line overflowed onto a third row. */}
        <h1 className="font-serif text-2xl font-bold leading-tight sm:text-3xl">
          우리 팀, 사주×MBTI로<br />재미로 뜯어보기
        </h1>
        <p className="text-sm leading-relaxed text-ink-soft">
          리더는 누구? 총무 체질은? 최고의 케미와 위험한 조합까지 —
          만세력 기반으로 계산하고, 근거까지 보여드려요.
        </p>
      </div>

      <Card className="p-5">
        <form onSubmit={create} noValidate className="space-y-4">
          <Field label="팀 이름 (선택)">
            {(aria) => (
              <TextInput
                {...aria}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 돌잔치 기획팀"
              />
            )}
          </Field>
          {error && <p role="alert" className="text-sm text-vermilion">{error}</p>}
          <Button type="submit" size="lg" full loading={busy}>
            {busy ? "만드는 중…" : "팀 만들기"}
          </Button>
        </form>
      </Card>

      {last && (
        <Link
          href={`/t/${last.token}`}
          className="focus-seal block rounded-card border border-ink/20 bg-card px-4 py-3 text-center hover:border-vermilion"
        >
          <span className="block text-xs text-ink-soft">최근에 만든 팀</span>
          <span className="mt-0.5 block text-sm font-semibold">
            {last.name ?? "이름 없는 팀"} 이어서 하기 →
          </span>
        </Link>
      )}
    </div>
  );
}
