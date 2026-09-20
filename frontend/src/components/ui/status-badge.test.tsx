import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component - ERP Core", () => {
  it("maps core status keys to correct categories and definitions", () => {
    expect(getStatusBadgeConfig("draft").category).toBe("secondary");
    expect(getStatusBadgeConfig("sent").category).toBe("info");
    expect(getStatusBadgeConfig("pending").category).toBe("warning");
    expect(getStatusBadgeConfig("accepted").category).toBe("success");
    expect(getStatusBadgeConfig("rejected").category).toBe("destructive");
    expect(getStatusBadgeConfig("ai").category).toBe("purple");
  });

  it("ensures distinct visual styles for distinct status keys within info category", () => {
    const configNew = getStatusBadgeConfig("new");
    const configContacted = getStatusBadgeConfig("contacted");
    expect(configNew.className).toContain("sky");
    expect(configContacted.className).toContain("indigo");
    expect(configNew.className).not.toBe(configContacted.className);
  });

  it("ensures distinct visual styles for paid vs pending vs overdue", () => {
    const configPaid = getStatusBadgeConfig("paid");
    const configPending = getStatusBadgeConfig("pending");
    const configOverdue = getStatusBadgeConfig("overdue");
    expect(configPaid.className).toContain("green");
    expect(configPending.className).toContain("amber");
    expect(configOverdue.className).toContain("red-200");
  });

  it("maps travel agency status keys correctly", () => {
    expect(getStatusBadgeConfig("quoted").category).toBe("warning");
    expect(getStatusBadgeConfig("reserved").category).toBe("info");
    expect(getStatusBadgeConfig("traveling").category).toBe("purple");
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
