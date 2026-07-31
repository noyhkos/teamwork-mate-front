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
  token: string;
}

export interface TeamMemberView {
  nickname: string;
  birthDate: string; // yyyy-mm-dd
  mbti: string;
}

/** The one team view — everyone holding the link sees exactly this. */
export interface TeamView {
  name: string | null;
  status: "collecting" | "ready" | "processing" | "done" | "failed";
  memberCount: number;
  members: TeamMemberView[];
  shareSlug: string | null;
}

/** Last team created on this device, so the landing page can offer to resume. */
export const LAST_TEAM_KEY = "twm:lastTeam";

export interface MemberInput {
  nickname: string;
  birthDate: string;
  birthTime?: string | null;
  gender: "M" | "F";
  mbti: string;
  calendar: "solar" | "lunar";
  leapMonth?: boolean;
}
