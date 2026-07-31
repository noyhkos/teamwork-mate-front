export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(parseError(body) ?? "잠시 후 다시 시도해 주세요.");
  }
  // 204 carries no body; parsing it would throw on an empty string.
  return res.status === 204 ? (undefined as T) : res.json();
}

function parseError(body: string): string | null {
  try {
    const j = JSON.parse(body);
    // `detail` is the api's own Korean reason (RFC 7807). Deliberately no
    // fallback to `error`, which is always English HTTP jargon — "Conflict"
    // told the reader nothing and looked like a crash.
    return j.detail ?? j.message ?? null;
  } catch {
    return null;
  }
}

export interface TeamCreated {
  teamId: string;
  token: string;
}

export interface TeamMemberView {
  id: string;
  nickname: string;
  birthDate: string; // yyyy-mm-dd
  mbti: string;
}

/** The one team view — everyone holding the link sees exactly this. */
export interface TeamView {
  name: string;
  status: "collecting" | "ready" | "processing" | "done" | "failed";
  memberCount: number;
  members: TeamMemberView[];
  shareSlug: string | null;
  /** Someone joined after the report was built, so it is out of date. */
  staleReport: boolean;
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
