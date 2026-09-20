import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component - Inmobiliario", () => {
  it("maps core status keys to correct categories", () => {
    expect(getStatusBadgeConfig("draft")).toEqual({ label: "Borrador", category: "secondary" });
    expect(getStatusBadgeConfig("sent")).toEqual({ label: "Enviada", category: "info" });
    expect(getStatusBadgeConfig("pending")).toEqual({ label: "Pendiente", category: "warning" });
    expect(getStatusBadgeConfig("accepted")).toEqual({ label: "Aceptada", category: "success" });
    expect(getStatusBadgeConfig("rejected")).toEqual({ label: "Rechazada", category: "destructive" });
    expect(getStatusBadgeConfig("ai")).toEqual({ label: "IA", category: "purple" });
  });

  it("maps real estate vertical specific status keys correctly", () => {
    expect(getStatusBadgeConfig("available")).toEqual({ label: "Disponible", category: "success" });
    expect(getStatusBadgeConfig("reserved")).toEqual({ label: "Reservado", category: "warning" });
    expect(getStatusBadgeConfig("rented")).toEqual({ label: "Arrendado", category: "info" });
    expect(getStatusBadgeConfig("sold")).toEqual({ label: "Vendido", category: "purple" });
  });

  it("infers category from text fallback correctly", () => {
    expect(getCategoryFromText("Propiedad disponible")).toBe("success");
    expect(getCategoryFromText("Inmueble reservado")).toBe("warning");
    expect(getCategoryFromText("Arrendado este mes")).toBe("info");
    expect(getCategoryFromText("Totalmente vendido")).toBe("purple");
    expect(getCategoryFromText("Publicación anulada")).toBe("destructive");
  });

  it("renders badge element with correct visible label", () => {
    render(<StatusBadge status="available" />);
    expect(screen.getByText("Disponible")).toBeInTheDocument();
  });
});
