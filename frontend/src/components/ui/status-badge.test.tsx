import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component - CareNote", () => {
  it("maps core status keys to correct categories", () => {
    expect(getStatusBadgeConfig("draft")).toEqual(expect.objectContaining({ label: "Borrador", category: "secondary" }));
    expect(getStatusBadgeConfig("sent")).toEqual(expect.objectContaining({ label: "Enviada", category: "info" }));
    expect(getStatusBadgeConfig("pending")).toEqual(expect.objectContaining({ label: "Pendiente", category: "warning" }));
    expect(getStatusBadgeConfig("accepted")).toEqual(expect.objectContaining({ label: "Aceptada", category: "success" }));
    expect(getStatusBadgeConfig("rejected")).toEqual(expect.objectContaining({ label: "Rechazada", category: "destructive" }));
    expect(getStatusBadgeConfig("ai")).toEqual(expect.objectContaining({ label: "IA", category: "purple" }));
  });

  it("CRITICAL: new vs contacted have distinct solid classNames with text-zinc-950", () => {
    const configNew = getStatusBadgeConfig("new");
    const configContacted = getStatusBadgeConfig("contacted");

    expect(configNew.className).toContain("bg-sky-200");
    expect(configNew.className).toContain("text-zinc-950");
    expect(configContacted.className).toContain("bg-indigo-200");
    expect(configContacted.className).toContain("text-zinc-950");
    expect(configNew.className).not.toBe(configContacted.className);
  });

  it("maps CareNote AI vertical specific status keys correctly", () => {
    expect(getStatusBadgeConfig("session_open")).toEqual(expect.objectContaining({ label: "Sesión abierta", category: "info" }));
    expect(getStatusBadgeConfig("transcribing")).toEqual(expect.objectContaining({ label: "Transcribiendo", category: "purple" }));
    expect(getStatusBadgeConfig("ready")).toEqual(expect.objectContaining({ label: "Nota lista", category: "success" }));
    expect(getStatusBadgeConfig("transcription_failed")).toEqual(expect.objectContaining({ label: "Transcripción fallida", category: "destructive" }));
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
