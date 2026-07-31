"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import { TextInput } from "@/components/ui/field";
import { api, LAST_TEAM_KEY, type TeamCreated } from "@/lib/api";
import { setStored, useStored } from "@/lib/storage";

type LastTeam = { token: string; name: string };

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // No accounts: the only trace of a team you made lives on this device.
  const lastRaw = useStored(LAST_TEAM_KEY);
  const last: LastTeam | null = lastRaw ? JSON.parse(lastRaw) : null;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("팀 이름을 입력해 주세요.");
      return;
    }
    setNameError(null);
    setBusy(true);
    setError(null);
    try {
      const created = await api<TeamCreated>("/teams", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });
      setStored(LAST_TEAM_KEY, JSON.stringify({ token: created.token, name: trimmed }));
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
      <h1 className="text-center font-serif font-bold leading-tight">
        <span className="block text-3xl">사주 × MBTI</span>
        <span className="block text-2xl">팀궁합 분석</span>
      </h1>

      <form onSubmit={create} noValidate className="space-y-4">
        {/* No visible label — the placeholder carries it, so the field keeps an
            sr-only label rather than none at all. */}
        <div className="space-y-1.5">
          <label htmlFor="team-name" className="sr-only">팀 이름</label>
          <div className="flex gap-2">
            <TextInput
              id="team-name"
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              placeholder="팀 이름"
              aria-invalid={nameError ? true : undefined}
              aria-describedby={nameError ? "team-name-error" : undefined}
              className="min-w-0 flex-1"
            />
            <Button type="submit" className="shrink-0" loading={busy} disabled={!name.trim()}>
              생성
            </Button>
          </div>
          {nameError && (
            <p id="team-name-error" role="alert" className="text-xs text-vermilion">{nameError}</p>
          )}
        </div>
        {error && <p role="alert" className="text-sm text-vermilion">{error}</p>}
      </form>

      {last && (
        <div className="space-y-1.5">
          {/* Not "만든 팀": the team page saves on arrival, so someone who came
              in on an invite link sees this too, and they did not make it. */}
          <p className="text-xs text-ink-soft">최근 팀</p>
          <Link
            href={`/t/${last.token}`}
            className="focus-seal flex min-h-touch items-center justify-between gap-2 rounded-control border border-ink/20 bg-card px-3 transition-colors duration-150 hover:border-ink/40 motion-reduce:transition-none"
          >
            <span className="min-w-0 truncate text-sm font-medium">{last.name}</span>
            <span aria-hidden className="shrink-0 text-sm text-ink-soft">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
