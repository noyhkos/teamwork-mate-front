import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "팀사주 초대";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const API = process.env.API_BASE_URL ?? "http://localhost:8080";
const OHAENG = ["#3f6d54", "#c3402b", "#c08a2d", "#8e8a7e", "#33506b"];

/**
 * The invite link is the one people actually paste into KakaoTalk, so its
 * preview names the team and says how many are already in — a bare title told
 * the reader nothing about what they were being asked to join.
 *
 * The token is already in the URL being shared, so putting it in the image
 * request leaks nothing further.
 */
export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const maruburi = await readFile(join(process.cwd(), "fonts/MaruBuri-Bold.ttf"));

  const team = await fetch(`${API}/api/teams/${token}`, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

  const name: string = team?.name ?? "팀사주";
  const count: number = team?.memberCount ?? 0;
  const done = team?.status === "done";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f6f0e1",
          color: "#26221c",
        }}
      >
        <div style={{ display: "flex", height: 14 }}>
          {OHAENG.map((c) => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", fontSize: 28, color: "#c3402b", letterSpacing: 8 }}>
            사주 × MBTI 팀궁합
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: -2,
              textAlign: "center",
            }}
          >
            {name}
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#6d6558" }}>
            {done ? `${count}명의 리포트가 나왔어요` : `${count}명 참여 중`}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              padding: "16px 40px",
              borderRadius: 999,
              background: "#26221c",
              color: "#f6f0e1",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {done ? "리포트 보러 가기" : "나도 참여하기"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: 40,
            fontSize: 24,
            color: "#b4aa96",
          }}
        >
          teamsaju.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "MaruBuri", data: maruburi, style: "normal", weight: 700 }],
    },
  );
}
