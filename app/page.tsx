"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
      router.replace(`/t/${created.token}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8 pt-8">
      <div className="space-y-3 text-center">
        <h1 className="font-serif text-3xl font-bold leading-tight">
          우리 팀, 사주×MBTI로<br />재미로 뜯어보기
        </h1>
        <p className="text-sm text-ink-soft">
          리더는 누구? 총무 체질은? 최고의 케미와 위험한 조합까지 —<br />
          만세력 기반으로 계산하고, 근거까지 보여드려요.
        </p>
      </div>
      <form onSubmit={create} className="space-y-4 washi rounded-sm p-6">
        <div>
          <label className="mb-1 block text-xs text-ink-soft">팀 이름 (선택)</label>
          <input
            className="w-full rounded-lg border border-ink/30 bg-card px-3 py-2.5 text-sm focus:border-vermilion focus:outline-none"
            value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 돌잔치 기획팀" />
        </div>
        {error && <p className="text-sm text-fire">{error}</p>}
        <button disabled={busy}
          className="w-full rounded-lg btn-ink py-3 text-sm font-semibold disabled:opacity-50">
          {busy ? "만드는 중…" : "팀 만들기"}
        </button>
      </form>

      {last && (
        <Link href={`/t/${last.token}`}
          className="block rounded-sm border border-ink/20 bg-card p-4 text-center text-sm hover:border-vermilion">
          <span className="text-ink-soft">최근에 만든 팀 </span>
          <span className="font-semibold">{last.name ?? "이름 없는 팀"}</span>
          <span className="text-ink-soft"> 이어서 하기 →</span>
        </Link>
      )}
    </div>
  );
}
