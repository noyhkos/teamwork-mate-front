export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(parseError(body) ?? `요청 실패 (${res.status})`);
  }
  return res.json();
}

function parseError(body: string): string | null {
  try {
    const j = JSON.parse(body);
    return j.message ?? j.error ?? null;
  } catch {
    return null;
  }
}

export interface TeamCreated {
  teamId: string;
  inviteToken: string;
  adminToken: string;
}

export interface InviteView {
  name: string | null;
  status: "collecting" | "ready" | "processing" | "done" | "failed";
  memberCount: number;
  members: string[];
  shareSlug: string | null;
}

export interface AdminView extends Omit<InviteView, "memberCount" | "members"> {
  inviteToken: string;
  members: {
    id: string;
    nickname: string;
    birthDate: string;
    birthTime: string | null;
    gender: string;
    mbti: string;
    enteredBy: string;
  }[];
}

export interface MemberInput {
  nickname: string;
  birthDate: string;
  birthTime?: string | null;
  gender: "M" | "F";
  mbti: string;
  calendar: "solar" | "lunar";
  leapMonth?: boolean;
}
