import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          borderRadius: 8,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 2v4a4 4 0 0 1-8 0V2" />
          <path d="M12 6v7a4 4 0 0 0 4 4h1a3 3 0 0 0 3-3v-2" />
          <circle cx="20" cy="12" r="1.5" fill="#38bdf8" />
          <path d="M5 14h4" />
          <path d="M7 12v4" />
        </svg>
      </div>
    ),
    size,
  );
}
