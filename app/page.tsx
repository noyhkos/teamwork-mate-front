"use client";

import { useState } from "react";
import { api, type TeamCreated } from "@/lib/api";

export default function Home() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<TeamCreated | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setCreated(await api<TeamCreated>("/teams", { method: "POST", body: JSON.stringify({ name }) }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/t/${created.inviteToken}`;
    const adminUrl = `${origin}/a/${created.adminToken}`;
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl font-bold">팀이 만들어졌어요 🎉</h1>
        <LinkCard title="👥 팀원 초대 링크" desc="팀원들에게 공유하세요. 각자 들어와서 자기 정보를 입력해요." url={inviteUrl} />
        <LinkCard title="🔑 관리자 링크 (나만 보관!)" desc="분석 실행·멤버 관리는 이 링크로만 가능해요. 잃어버리면 복구할 수 없어요."
          url={adminUrl} warn />
        <a href={`/a/${created.adminToken}`}
          className="block rounded-lg btn-ink py-3 text-center text-sm font-semibold">
          관리자 화면으로 이동 →
        </a>
      </div>
    );
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
    </div>
  );
}

function LinkCard({ title, desc, url, warn }: { title: string; desc: string; url: string; warn?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`rounded-2xl border p-5 ${warn ? "border-vermilion/50 bg-vermilion/5" : "border-slate-800 bg-card"}`}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-xs text-ink-soft">{desc}</p>
      <div className="mt-3 flex gap-2">
        <code className="flex-1 truncate rounded-lg bg-paper-soft px-3 py-2 text-xs text-ink">{url}</code>
        <button type="button"
          onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="shrink-0 rounded-lg btn-ink px-3 py-2 text-xs">
          {copied ? "복사됨!" : "복사"}
        </button>
      </div>
    </div>
  );
}
