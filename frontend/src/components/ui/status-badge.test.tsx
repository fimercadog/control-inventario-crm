import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component - Inmobiliario", () => {
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

  it("maps real estate vertical specific status keys correctly", () => {
    expect(getStatusBadgeConfig("available")).toEqual(expect.objectContaining({ label: "Disponible", category: "success" }));
    expect(getStatusBadgeConfig("reserved")).toEqual(expect.objectContaining({ label: "Reservado", category: "warning" }));
    expect(getStatusBadgeConfig("rented")).toEqual(expect.objectContaining({ label: "Arrendado", category: "info" }));
    expect(getStatusBadgeConfig("sold")).toEqual(expect.objectContaining({ label: "Vendido", category: "purple" }));
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
