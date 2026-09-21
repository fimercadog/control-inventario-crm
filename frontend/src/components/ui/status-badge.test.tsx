import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component - Recursos Humanos", () => {
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

  it("maps RRHH vertical specific status keys correctly", () => {
    expect(getStatusBadgeConfig("candidate")).toEqual(expect.objectContaining({ label: "Candidato", category: "secondary" }));
    expect(getStatusBadgeConfig("in_selection")).toEqual(expect.objectContaining({ label: "En selección", category: "info" }));
    expect(getStatusBadgeConfig("hired")).toEqual(expect.objectContaining({ label: "Contratado", category: "success" }));
    expect(getStatusBadgeConfig("candidate_rejected")).toEqual(expect.objectContaining({ label: "Descartado", category: "destructive" }));
  });

  it("infers category from text fallback correctly", () => {
    expect(getCategoryFromText("Candidato sin contactar")).toBe("secondary");
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
