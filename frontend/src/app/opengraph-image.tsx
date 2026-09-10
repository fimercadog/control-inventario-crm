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
          background: "linear-gradient(160deg, #f4f2ff 0%, #e7deff 100%)",
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
            background: "#d92d43",
            color: "#ffffff",
            fontSize: 52,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          D
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 900, color: "#221d4a" }}>
          CRM + Inventario
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 32, color: "#5a5580", maxWidth: 820 }}>
          CRM y control de inventario para PYMES: el pedido de venta descuenta stock al confirmarse.
        </div>
      </div>
    ),
    size,
  );
}
