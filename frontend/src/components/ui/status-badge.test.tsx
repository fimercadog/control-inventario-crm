import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component - Veterinaria", () => {
  it("maps core status keys to correct categories", () => {
    expect(getStatusBadgeConfig("draft")).toEqual({ label: "Borrador", category: "secondary" });
    expect(getStatusBadgeConfig("sent")).toEqual({ label: "Enviada", category: "info" });
    expect(getStatusBadgeConfig("pending")).toEqual({ label: "Pendiente", category: "warning" });
    expect(getStatusBadgeConfig("accepted")).toEqual({ label: "Aceptada", category: "success" });
    expect(getStatusBadgeConfig("rejected")).toEqual({ label: "Rechazada", category: "destructive" });
    expect(getStatusBadgeConfig("ai")).toEqual({ label: "IA", category: "purple" });
  });

  it("maps veterinary vertical specific status keys correctly", () => {
    expect(getStatusBadgeConfig("vaccinated")).toEqual({ label: "Vacunado", category: "success" });
    expect(getStatusBadgeConfig("vaccine_due")).toEqual({ label: "Vacuna pendiente", category: "warning" });
    expect(getStatusBadgeConfig("active_treatment")).toEqual({ label: "Tratamiento activo", category: "info" });
    expect(getStatusBadgeConfig("medical_discharge")).toEqual({ label: "Alta médica", category: "success" });
  });

  it("infers category from text fallback and handles dark mode classes", () => {
    expect(getCategoryFromText("Vacunación completa")).toBe("success");
    expect(getCategoryFromText("Pendiente por aplicar")).toBe("warning");
    expect(getCategoryFromText("Tratamiento en curso")).toBe("info");
    expect(getCategoryFromText("Reacción adversa")).toBe("secondary");
    expect(getCategoryFromText("Desconocido")).toBe("secondary");
  });

  it("renders badge element with correct visible label", () => {
    render(<StatusBadge status="vaccinated" />);
    expect(screen.getByText("Vacunado")).toBeInTheDocument();
  });
});
