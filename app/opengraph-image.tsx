import { ImageResponse } from "next/og";

export const alt = "TFTdle — Daily TFT Champion Guessing Game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#101722", color: "#f2ead8", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", fontSize: 108, fontWeight: 800, letterSpacing: -6 }}>TFT<span style={{ color: "#e8b94f" }}>dle</span></div>
      <div style={{ display: "flex", marginTop: 24, color: "#92a3b8", fontSize: 34 }}>One champion. Every set. Every day.</div>
      <div style={{ display: "flex", marginTop: 54, color: "#52c9d6", fontSize: 22, letterSpacing: 7, textTransform: "uppercase" }}>Daily TFT champion guessing game</div>
    </div>,
    size,
  );
}
