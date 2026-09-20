import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, getStatusBadgeConfig, getCategoryFromText } from "./status-badge";

describe("StatusBadge Component - ERP Core & CRM Visual Contrast", () => {
  it("maps core status keys to correct categories", () => {
    expect(getStatusBadgeConfig("draft").category).toBe("secondary");
    expect(getStatusBadgeConfig("sent").category).toBe("info");
    expect(getStatusBadgeConfig("pending").category).toBe("warning");
    expect(getStatusBadgeConfig("accepted").category).toBe("success");
    expect(getStatusBadgeConfig("rejected").category).toBe("destructive");
    expect(getStatusBadgeConfig("ai").category).toBe("purple");
  });

  it("CRITICAL: new (Sky Blue) vs contacted (Indigo) are visually distinct", () => {
    const configNew = getStatusBadgeConfig("new");
    const configContacted = getStatusBadgeConfig("contacted");
    const configConnected = getStatusBadgeConfig("connected");

    expect(configNew.className).toContain("bg-sky-50");
    expect(configNew.className).toContain("border-sky-400");

    expect(configContacted.className).toContain("bg-indigo-100");
    expect(configContacted.className).toContain("border-indigo-500");

    expect(configConnected.className).toContain("bg-indigo-100");

    expect(configNew.className).not.toBe(configContacted.className);
  });

  it("CRITICAL: active (Soft Emerald) vs paid (Solid Green) are visually distinct", () => {
    const configActive = getStatusBadgeConfig("active");
    const configPaid = getStatusBadgeConfig("paid");

    expect(configActive.className).toContain("bg-emerald-50");
    expect(configPaid.className).toContain("bg-green-200");
    expect(configPaid.className).toContain("border-green-600");

    expect(configActive.className).not.toBe(configPaid.className);
  });

  it("CRITICAL: pending (Amber) vs partial (Yellow 200) are visually distinct", () => {
    const configPending = getStatusBadgeConfig("pending");
    const configPartial = getStatusBadgeConfig("partial");

    expect(configPending.className).toContain("bg-amber-100");
    expect(configPartial.className).toContain("bg-yellow-200");

    expect(configPending.className).not.toBe(configPartial.className);
  });

  it("CRITICAL: accepted (Teal) vs completed (Lime 100) are visually distinct", () => {
    const configAccepted = getStatusBadgeConfig("accepted");
    const configCompleted = getStatusBadgeConfig("completed");

    expect(configAccepted.className).toContain("bg-teal-100");
    expect(configCompleted.className).toContain("bg-lime-100");

    expect(configAccepted.className).not.toBe(configCompleted.className);
  });

  it("CRITICAL: cancelled (Rose) vs deleted (Red 200 Heavy) are visually distinct", () => {
    const configCancelled = getStatusBadgeConfig("cancelled");
    const configDeleted = getStatusBadgeConfig("deleted");

    expect(configCancelled.className).toContain("bg-rose-100");
    expect(configDeleted.className).toContain("bg-red-200");

    expect(configCancelled.className).not.toBe(configDeleted.className);
  });

  it("infers category and dynamic classes from text fallback correctly", () => {
    const textNuevo = getStatusBadgeConfig(undefined, "Nuevo");
    const textContactado = getStatusBadgeConfig(undefined, "Contactado");

    expect(textNuevo.className).toContain("bg-sky-50");
    expect(textContactado.className).toContain("bg-indigo-100");

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
