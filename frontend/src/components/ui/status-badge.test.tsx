import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component - ERP Core", () => {
  it("maps core status keys to correct categories", () => {
    expect(getStatusBadgeConfig("draft")).toEqual({ label: "Borrador", category: "secondary" });
    expect(getStatusBadgeConfig("sent")).toEqual({ label: "Enviada", category: "info" });
    expect(getStatusBadgeConfig("pending")).toEqual({ label: "Pendiente", category: "warning" });
    expect(getStatusBadgeConfig("accepted")).toEqual({ label: "Aceptada", category: "success" });
    expect(getStatusBadgeConfig("rejected")).toEqual({ label: "Rechazada", category: "destructive" });
    expect(getStatusBadgeConfig("ai")).toEqual({ label: "IA", category: "purple" });
  });

  it("maps ERP financial and inventory status keys correctly", () => {
    expect(getStatusBadgeConfig("paid")).toEqual({ label: "Pagada", category: "success" });
    expect(getStatusBadgeConfig("partially_paid")).toEqual({ label: "Parcialmente pagada", category: "warning" });
    expect(getStatusBadgeConfig("overdue")).toEqual({ label: "Vencida", category: "destructive" });
    expect(getStatusBadgeConfig("low_stock")).toEqual({ label: "Bajo stock", category: "warning" });
    expect(getStatusBadgeConfig("out_of_stock")).toEqual({ label: "Agotado", category: "destructive" });
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
