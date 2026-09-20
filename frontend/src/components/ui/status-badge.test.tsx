import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component", () => {
  it("maps technical status keys to correct canonical labels and categories", () => {
    expect(getStatusBadgeConfig("draft")).toEqual({ label: "Borrador", category: "secondary" });
    expect(getStatusBadgeConfig("accepted")).toEqual({ label: "Aceptada", category: "success" });
    expect(getStatusBadgeConfig("sent")).toEqual({ label: "Enviada", category: "info" });
    expect(getStatusBadgeConfig("pending")).toEqual({ label: "Pendiente", category: "warning" });
    expect(getStatusBadgeConfig("rejected")).toEqual({ label: "Rechazada", category: "destructive" });
    expect(getStatusBadgeConfig("ai")).toEqual({ label: "IA", category: "purple" });
  });

  it("maps vertical-specific status keys correctly", () => {
    expect(getStatusBadgeConfig("triage")).toEqual({ label: "Triage", category: "warning" });
    expect(getStatusBadgeConfig("in_consultation")).toEqual({ label: "En atención", category: "info" });
    expect(getStatusBadgeConfig("assessment_pending")).toEqual({ label: "Valoración pendiente", category: "warning" });
    expect(getStatusBadgeConfig("vaccinated")).toEqual({ label: "Vacunado", category: "success" });
    expect(getStatusBadgeConfig("hired")).toEqual({ label: "Contratado", category: "success" });
    expect(getStatusBadgeConfig("sold")).toEqual({ label: "Vendido", category: "purple" });
    expect(getStatusBadgeConfig("transcribing")).toEqual({ label: "Transcribiendo", category: "purple" });
  });

  it("infers category from text when status key is absent or unknown", () => {
    expect(getCategoryFromText("Enviada por correo")).toBe("info");
    expect(getCategoryFromText("Factura Pagada")).toBe("success");
    expect(getCategoryFromText("Pago Pendiente")).toBe("warning");
    expect(getCategoryFromText("Transacción Fallida")).toBe("destructive");
    expect(getCategoryFromText("Generado por IA")).toBe("purple");
    expect(getCategoryFromText("Algo Desconocido")).toBe("secondary");
  });

  it("renders badge element with visible label", () => {
    render(<StatusBadge status="accepted" />);
    expect(screen.getByText("Aceptada")).toBeInTheDocument();
  });
});
