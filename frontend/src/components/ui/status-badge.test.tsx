import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component - ERP Core", () => {
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

  it("maps ERP financial and inventory status keys correctly", () => {
    expect(getStatusBadgeConfig("paid")).toEqual(expect.objectContaining({ label: "Pagada", category: "success" }));
    expect(getStatusBadgeConfig("partially_paid")).toEqual(expect.objectContaining({ label: "Parcialmente pagada", category: "warning" }));
    expect(getStatusBadgeConfig("overdue")).toEqual(expect.objectContaining({ label: "Vencida", category: "destructive" }));
    expect(getStatusBadgeConfig("low_stock")).toEqual(expect.objectContaining({ label: "Bajo stock", category: "warning" }));
    expect(getStatusBadgeConfig("out_of_stock")).toEqual(expect.objectContaining({ label: "Agotado", category: "destructive" }));
  });

  it("infers category from text fallback correctly", () => {
    expect(getCategoryFromText("Factura pagada")).toBe("success");
    expect(getCategoryFromText("Pago parcial")).toBe("warning");
    expect(getCategoryFromText("Documento borrador")).toBe("secondary");
    expect(getCategoryFromText("Cotización enviada")).toBe("info");
    expect(getCategoryFromText("Comprobante anulado")).toBe("destructive");
  });

  it("renders badge element with correct visible label", () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText("Pagada")).toBeInTheDocument();
  });
});
