"use client";

import { useState } from "react";
import { api, type MemberInput } from "@/lib/api";

const MBTIS = [
  "ISTJ", "ISFJ", "INFJ", "INTJ", "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP", "ESTJ", "ESFJ", "ENFJ", "ENTJ",
];

export default function MemberForm({
  endpoint,
  onAdded,
}: {
  endpoint: string; // /teams/{token}/members
  onAdded: (nickname: string) => void;
}) {
  const [form, setForm] = useState<MemberInput>({
    nickname: "",
    birthDate: "",
    birthTime: "",
    gender: "M",
    mbti: "INTP",
    calendar: "solar",
    leapMonth: false,
  });
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(endpoint, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          birthTime: timeUnknown || !form.birthTime ? null : form.birthTime,
        }),
      });
      const submitted = form.nickname.trim();
      setForm({ ...form, nickname: "", birthDate: "", birthTime: "" });
      onAdded(submitted);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-sm bg-white/60 border border-ink/30 px-3 py-2 text-sm focus:border-vermilion focus:outline-none";
  const label = "block text-xs text-ink-soft mb-1";

  return (
    <form onSubmit={submit} className="space-y-4 washi rounded-sm p-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>닉네임</label>
          <input className={input} required value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="예: 석현" />
        </div>
        <div>
          <label className={label}>MBTI</label>
          <select className={input} value={form.mbti}
            onChange={(e) => setForm({ ...form, mbti: e.target.value })}>
            {MBTIS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>생년월일 ({form.calendar === "lunar" ? "음력" : "양력"})</label>
          <input className={input} type="date" required value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
        </div>
        <div>
          <label className={label}>태어난 시간</label>
          <input className={input} type="time" disabled={timeUnknown} value={form.birthTime ?? ""}
            onChange={(e) => setForm({ ...form, birthTime: e.target.value })} />
          <label className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
            <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} />
            시간 몰라요 (시주 제외하고 정직하게 계산)
          </label>
        </div>
        <div>
          <label className={label}>성별</label>
          <select className={input} value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value as "M" | "F" })}>
            <option value="M">남</option>
            <option value="F">여</option>
          </select>
        </div>
        <div>
          <label className={label}>달력</label>
          <select className={input} value={form.calendar}
            onChange={(e) => setForm({ ...form, calendar: e.target.value as "solar" | "lunar" })}>
            <option value="solar">양력</option>
            <option value="lunar">음력</option>
          </select>
          {form.calendar === "lunar" && (
            <label className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
              <input type="checkbox" checked={form.leapMonth}
                onChange={(e) => setForm({ ...form, leapMonth: e.target.checked })} />
              윤달이에요
            </label>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-fire">{error}</p>}
      <button disabled={busy}
        className="w-full rounded-lg btn-ink py-2.5 text-sm font-semibold disabled:opacity-50">
        {busy ? "추가 중…" : "멤버 추가"}
      </button>
    </form>
  );
}
