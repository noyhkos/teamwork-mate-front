import { ImageResponse } from "next/og";

// iOS ignores SVG icons and masks whatever it gets into its own squircle, so
// this renders the same five bands as a PNG with no rounding of its own.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const OHAENG = ["#3f6d54", "#c3402b", "#c08a2d", "#8e8a7e", "#33506b"];

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        {OHAENG.map((color) => (
          <div key={color} style={{ flex: 1, background: color }} />
        ))}
      </div>
    ),
    size,
  );
}
