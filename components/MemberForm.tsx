"use client";

import { useState } from "react";
import { api, type MemberInput } from "@/lib/api";
import Button from "@/components/ui/button";
import DateField from "@/components/ui/date-field";
import Field, { CheckboxRow, Select, TextInput } from "@/components/ui/field";
import Segmented from "@/components/ui/segmented";

const MBTIS = [
  "ISTJ", "ISFJ", "INFJ", "INTJ", "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP", "ESTJ", "ESFJ", "ENFJ", "ENTJ",
];

const EMPTY: MemberInput = {
  nickname: "",
  birthDate: "",
  birthTime: "",
  gender: "M",
  mbti: "INTP",
  calendar: "solar",
  leapMonth: false,
};

/**
 * Single column by design: the old two-column grid left every control ~111px
 * wide at 320px, which is where the date and time inputs broke.
 */
export default function MemberForm({
  endpoint,
  onAdded,
}: {
  endpoint: string; // /teams/{token}/members
  onAdded: () => void;
}) {
  const [form, setForm] = useState<MemberInput>(EMPTY);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const set = <K extends keyof MemberInput>(key: K, v: MemberInput[K]) =>
    setForm((f) => ({ ...f, [key]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate)) {
      setDateError("yyyy-mm-dd 형식으로 입력해 주세요.");
      return;
    }
    setDateError(null);
    setBusy(true);
    setError(null);
    try {
      await api(endpoint, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          nickname: form.nickname.trim(),
          birthTime: timeUnknown || !form.birthTime ? null : form.birthTime,
        }),
      });
      setForm(EMPTY);
      setTimeUnknown(false);
      onAdded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="닉네임">
        {(aria) => (
          <TextInput
            {...aria}
            required
            value={form.nickname}
            onChange={(e) => set("nickname", e.target.value)}
            placeholder="예: 석현"
          />
        )}
      </Field>

      <Field label="MBTI">
        {(aria) => (
          <Select {...aria} value={form.mbti} onChange={(e) => set("mbti", e.target.value)}>
            {MBTIS.map((m) => <option key={m}>{m}</option>)}
          </Select>
        )}
      </Field>

      <DateField
        label={`생년월일 (${form.calendar === "lunar" ? "음력" : "양력"})`}
        value={form.birthDate}
        onChange={(v) => set("birthDate", v)}
        error={dateError ?? undefined}
        required
      />

      <Segmented
        label="달력"
        value={form.calendar}
        onChange={(v) => set("calendar", v)}
        options={[{ value: "solar", label: "양력" }, { value: "lunar", label: "음력" }]}
      />
      {form.calendar === "lunar" && (
        <CheckboxRow checked={!!form.leapMonth} onChange={(v) => set("leapMonth", v)}>
          윤달이에요
        </CheckboxRow>
      )}

      <Segmented
        label="성별"
        value={form.gender}
        onChange={(v) => set("gender", v)}
        options={[{ value: "M", label: "남" }, { value: "F", label: "여" }]}
      />

      <Field label="태어난 시간" hint="모르면 아래를 체크하세요. 시주를 빼고 정직하게 계산해요.">
        {(aria) => (
          <TextInput
            {...aria}
            type="time"
            disabled={timeUnknown}
            value={form.birthTime ?? ""}
            onChange={(e) => set("birthTime", e.target.value)}
          />
        )}
      </Field>
      <CheckboxRow checked={timeUnknown} onChange={setTimeUnknown}>
        태어난 시간 몰라요
      </CheckboxRow>

      {error && <p role="alert" className="text-sm text-vermilion">{error}</p>}

      <Button type="submit" size="lg" full loading={busy}>
        {busy ? "추가하는 중…" : "멤버 추가"}
      </Button>
    </form>
  );
}
