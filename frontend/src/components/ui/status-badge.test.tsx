import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component", () => {
  it("maps technical status keys to correct canonical labels and categories", () => {
    expect(getStatusBadgeConfig("draft")).toEqual(expect.objectContaining({ label: "Borrador", category: "secondary" }));
    expect(getStatusBadgeConfig("accepted")).toEqual(expect.objectContaining({ label: "Aceptada", category: "success" }));
    expect(getStatusBadgeConfig("sent")).toEqual(expect.objectContaining({ label: "Enviada", category: "info" }));
    expect(getStatusBadgeConfig("pending")).toEqual(expect.objectContaining({ label: "Pendiente", category: "warning" }));
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

  it("maps vertical-specific status keys correctly", () => {
    expect(getStatusBadgeConfig("triage")).toEqual(expect.objectContaining({ label: "Triage", category: "warning" }));
    expect(getStatusBadgeConfig("in_consultation")).toEqual(expect.objectContaining({ label: "En atención", category: "info" }));
    expect(getStatusBadgeConfig("assessment_pending")).toEqual(expect.objectContaining({ label: "Valoración pendiente", category: "warning" }));
    expect(getStatusBadgeConfig("vaccinated")).toEqual(expect.objectContaining({ label: "Vacunado", category: "success" }));
    expect(getStatusBadgeConfig("hired")).toEqual(expect.objectContaining({ label: "Contratado", category: "success" }));
    expect(getStatusBadgeConfig("sold")).toEqual(expect.objectContaining({ label: "Vendido", category: "purple" }));
    expect(getStatusBadgeConfig("transcribing")).toEqual(expect.objectContaining({ label: "Transcribiendo", category: "purple" }));
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
    expect(screen.getByText("Aceptada")).toBeDefined();
  });
});
