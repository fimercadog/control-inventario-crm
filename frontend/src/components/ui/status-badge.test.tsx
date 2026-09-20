import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component - CareNote", () => {
  it("maps core status keys to correct categories", () => {
    expect(getStatusBadgeConfig("draft")).toEqual({ label: "Borrador", category: "secondary" });
    expect(getStatusBadgeConfig("sent")).toEqual({ label: "Enviada", category: "info" });
    expect(getStatusBadgeConfig("pending")).toEqual({ label: "Pendiente", category: "warning" });
    expect(getStatusBadgeConfig("accepted")).toEqual({ label: "Aceptada", category: "success" });
    expect(getStatusBadgeConfig("rejected")).toEqual({ label: "Rechazada", category: "destructive" });
    expect(getStatusBadgeConfig("ai")).toEqual({ label: "IA", category: "purple" });
  });

  it("maps CareNote AI vertical specific status keys correctly", () => {
    expect(getStatusBadgeConfig("session_open")).toEqual({ label: "Sesión abierta", category: "info" });
    expect(getStatusBadgeConfig("transcribing")).toEqual({ label: "Transcribiendo", category: "purple" });
    expect(getStatusBadgeConfig("ready")).toEqual({ label: "Nota lista", category: "success" });
    expect(getStatusBadgeConfig("transcription_failed")).toEqual({ label: "Transcripción fallida", category: "destructive" });
  });

  it("infers category from text fallback correctly", () => {
    expect(getCategoryFromText("Sesión abierta recientemente")).toBe("info");
    expect(getCategoryFromText("Transcribiendo audio")).toBe("purple");
    expect(getCategoryFromText("Nota lista para exportar")).toBe("success");
    expect(getCategoryFromText("Transcripción fallida por ruido")).toBe("destructive");
    expect(getCategoryFromText("Borrador temporal")).toBe("secondary");
  });

  it("renders badge element with correct visible label", () => {
    render(<StatusBadge status="ready" />);
    expect(screen.getByText("Nota lista")).toBeInTheDocument();
  });
});
