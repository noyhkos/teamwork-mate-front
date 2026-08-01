import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "팀사주 · 사주×MBTI 팀궁합 분석";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const OHAENG = ["#3f6d54", "#c3402b", "#c08a2d", "#8e8a7e", "#33506b"];

/**
 * The card every link falls back to. Satori ships no Korean glyphs, so the
 * headline font travels with the request — without it the whole thing renders
 * as empty boxes.
 */
export default async function Image() {
  const maruburi = await readFile(join(process.cwd(), "fonts/MaruBuri-Bold.ttf"));

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
            gap: 18,
          }}
        >
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>
            사주 × MBTI
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: -2 }}>
            팀궁합 분석
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 32, color: "#6d6558" }}>
            링크 하나로, 우리 팀의 역할과 케미를 한 번에
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: 44,
            fontSize: 26,
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
