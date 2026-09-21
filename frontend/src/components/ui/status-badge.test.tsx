import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component - Clínica Estética CRM Visual Contrast", () => {
  it("maps core status keys to correct categories", () => {
    expect(getStatusBadgeConfig("draft").category).toBe("secondary");
    expect(getStatusBadgeConfig("sent").category).toBe("info");
    expect(getStatusBadgeConfig("pending").category).toBe("warning");
    expect(getStatusBadgeConfig("accepted").category).toBe("success");
    expect(getStatusBadgeConfig("rejected").category).toBe("destructive");
    expect(getStatusBadgeConfig("ai").category).toBe("purple");
  });

  it("CRITICAL: new vs contacted (and nuevo vs contactado) have distinct classNames with solid backgrounds and dark text", () => {
    const configNew = getStatusBadgeConfig("new");
    const configContacted = getStatusBadgeConfig("contacted");

    expect(configNew.className).toContain("bg-sky-200");
    expect(configNew.className).toContain("text-zinc-950");

    expect(configContacted.className).toContain("bg-indigo-200");
    expect(configContacted.className).toContain("text-zinc-950");

    expect(configNew.className).not.toBe(configContacted.className);

    const configNuevo = getStatusBadgeConfig("nuevo");
    const configContactado = getStatusBadgeConfig("contactado");
    expect(configNuevo.className).not.toBe(configContactado.className);
  });

  it("CRITICAL: active (Solid Emerald) vs paid (Solid Green) are visually distinct", () => {
    const configActive = getStatusBadgeConfig("active");
    const configPaid = getStatusBadgeConfig("paid");

    expect(configActive.className).toContain("bg-emerald-200");
    expect(configActive.className).toContain("text-zinc-950");

    expect(configPaid.className).toContain("bg-green-300");
    expect(configPaid.className).toContain("text-zinc-950");

    expect(configPaid.className).not.toBe(configActive.className);
  });

  it("maps aesthetic vertical specific status keys correctly", () => {
    expect(getStatusBadgeConfig("assessment_pending").category).toBe("warning");
    expect(getStatusBadgeConfig("in_treatment").category).toBe("info");
    expect(getStatusBadgeConfig("session_completed").category).toBe("success");
    expect(getStatusBadgeConfig("consent_pending").category).toBe("warning");
  });

  it("infers category from text fallback correctly", () => {
    expect(getCategoryFromText("Enviada por correo")).toBe("info");
    expect(getCategoryFromText("Pagada")).toBe("success");
    expect(getCategoryFromText("Pendiente")).toBe("warning");
    expect(getCategoryFromText("Rechazada")).toBe("destructive");
    expect(getCategoryFromText("IA Automatizado")).toBe("purple");
    expect(getCategoryFromText("Desconocido")).toBe("secondary");
  });

  it("renders badge element with correct visible label", () => {
    render(<StatusBadge status="session_completed" />);
    expect(screen.getByText("Sesión completada")).toBeInTheDocument();
  });
});
