import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component - Recursos Humanos", () => {
  it("maps core status keys to correct categories", () => {
    expect(getStatusBadgeConfig("draft")).toEqual({ label: "Borrador", category: "secondary" });
    expect(getStatusBadgeConfig("sent")).toEqual({ label: "Enviada", category: "info" });
    expect(getStatusBadgeConfig("pending")).toEqual({ label: "Pendiente", category: "warning" });
    expect(getStatusBadgeConfig("accepted")).toEqual({ label: "Aceptada", category: "success" });
    expect(getStatusBadgeConfig("rejected")).toEqual({ label: "Rechazada", category: "destructive" });
    expect(getStatusBadgeConfig("ai")).toEqual({ label: "IA", category: "purple" });
  });

  it("maps RRHH vertical specific status keys correctly", () => {
    expect(getStatusBadgeConfig("candidate")).toEqual({ label: "Candidato", category: "secondary" });
    expect(getStatusBadgeConfig("in_selection")).toEqual({ label: "En selección", category: "info" });
    expect(getStatusBadgeConfig("hired")).toEqual({ label: "Contratado", category: "success" });
    expect(getStatusBadgeConfig("candidate_rejected")).toEqual({ label: "Descartado", category: "destructive" });
  });

  it("infers category from text fallback correctly", () => {
    expect(getCategoryFromText("Candidato sin contactar")).toBe("secondary");
    expect(getCategoryFromText("En entrevista")).toBe("secondary");
    expect(getCategoryFromText("Entrevista programada")).toBe("info");
    expect(getCategoryFromText("Prueba técnica pendiente")).toBe("warning");
    expect(getCategoryFromText("Contratado oficialmente")).toBe("success");
    expect(getCategoryFromText("Descartado en filtro")).toBe("destructive");
  });

  it("renders badge element with correct visible label", () => {
    render(<StatusBadge status="hired" />);
    expect(screen.getByText("Contratado")).toBeInTheDocument();
  });
});
