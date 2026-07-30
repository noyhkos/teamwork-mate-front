"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MemberForm from "@/components/MemberForm";
import { api, type AdminView } from "@/lib/api";

export default function AdminPage() {
  const { admin } = useParams<{ admin: string }>();
  const [team, setTeam] = useState<AdminView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const load = useCallback(async () => {
    try {
      setTeam(await api<AdminView>(`/teams/admin/${admin}`));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [admin]);

  useEffect(() => {
    load();
  }, [load]);

  async function analyze() {
    setAnalyzing(true);
    setError(null);
    try {
      await api(`/teams/admin/${admin}/analyze`, { method: "POST" });
      await load();
    } catch (err) {
      setError((err as Error).message);
      await load();
    } finally {
      setAnalyzing(false);
    }
  }

  if (error && !team) return <p className="pt-10 text-center text-rose-400">{error}</p>;
  if (!team) return <p className="pt-10 text-center text-slate-500">불러오는 중…</p>;

  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/t/${team.inviteToken}` : "";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs text-amber-400">관리자</p>
        <h1 className="text-2xl font-bold">{team.name ?? "이름 없는 팀"}</h1>
        <p className="mt-1 text-sm text-slate-400">상태: {team.status} · {team.members.length}명</p>
      </header>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <p className="text-xs text-slate-400">팀원 초대 링크</p>
        <div className="mt-2 flex gap-2">
          <code className="flex-1 truncate rounded-lg bg-slate-950 px-3 py-2 text-xs">{inviteUrl}</code>
          <button onClick={() => navigator.clipboard.writeText(inviteUrl)}
            className="rounded-lg bg-slate-700 px-3 text-xs hover:bg-slate-600">복사</button>
        </div>
      </div>

      {team.members.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr><th className="pb-2">닉네임</th><th>생일</th><th>시간</th><th>MBTI</th><th>입력</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {team.members.map((m) => (
              <tr key={m.id}>
                <td className="py-2 font-medium">{m.nickname}</td>
                <td className="text-slate-400">{m.birthDate}</td>
                <td className="text-slate-400">{m.birthTime ?? "모름"}</td>
                <td className="text-slate-400">{m.mbti}</td>
                <td className="text-xs text-slate-500">{m.enteredBy === "self" ? "본인" : "대리"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {team.status === "collecting" && (
        <details className="rounded-xl border border-slate-800 open:bg-slate-900/30">
          <summary className="cursor-pointer p-4 text-sm font-semibold text-slate-300">➕ 대리 입력 (내가 아는 사람 추가)</summary>
          <div className="p-4 pt-0">
            <MemberForm endpoint={`/teams/admin/${admin}/members`} onAdded={load} />
          </div>
        </details>
      )}

      {error && <p className="text-sm text-rose-400">{error}</p>}

      {team.status === "done" && team.shareSlug ? (
        <a href={`/r/${team.shareSlug}`}
          className="block rounded-lg bg-emerald-600 py-3 text-center text-sm font-semibold hover:bg-emerald-500">
          🔮 리포트 보기 →
        </a>
      ) : (
        <button onClick={analyze} disabled={analyzing || team.members.length < 2}
          className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-40">
          {analyzing ? "분석 중… (사주 계산 + 궁합 + 역할 배정)" : team.members.length < 2 ? "멤버가 2명 이상 필요해요" : "✨ 분석 실행"}
        </button>
      )}
    </div>
  );
}
