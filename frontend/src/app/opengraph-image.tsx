import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(160deg, #ecfdf3 0%, #d7f0e0 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "#15803d",
            color: "#ffffff",
            fontSize: 52,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          V
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 900, color: "#0f1012" }}>
          VetPanel
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 32, color: "#3f5347", maxWidth: 820 }}>
          Software de gestión para clínicas veterinarias: pacientes, historia clínica, agenda, vacunas e inventario.
        </div>
      </div>
    ),
    size,
  );
}
