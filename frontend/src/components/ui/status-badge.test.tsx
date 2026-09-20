import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component - Clínica Estética", () => {
  it("maps core status keys to correct categories", () => {
    expect(getStatusBadgeConfig("draft")).toEqual({ label: "Borrador", category: "secondary" });
    expect(getStatusBadgeConfig("sent")).toEqual({ label: "Enviada", category: "info" });
    expect(getStatusBadgeConfig("pending")).toEqual({ label: "Pendiente", category: "warning" });
    expect(getStatusBadgeConfig("accepted")).toEqual({ label: "Aceptada", category: "success" });
    expect(getStatusBadgeConfig("rejected")).toEqual({ label: "Rechazada", category: "destructive" });
    expect(getStatusBadgeConfig("ai")).toEqual({ label: "IA", category: "purple" });
  });

  it("maps aesthetic vertical specific status keys correctly", () => {
    expect(getStatusBadgeConfig("assessment_pending")).toEqual({ label: "Valoración pendiente", category: "warning" });
    expect(getStatusBadgeConfig("in_treatment")).toEqual({ label: "Tratamiento activo", category: "info" });
    expect(getStatusBadgeConfig("session_completed")).toEqual({ label: "Sesión completada", category: "success" });
    expect(getStatusBadgeConfig("consent_pending")).toEqual({ label: "Consentimiento pendiente", category: "warning" });
  });

  it("infers category from text fallback and handles dark mode classes", () => {
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
