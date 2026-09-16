import { describe, it, expect } from "vitest";

describe("ERP Totals & Calculations", () => {
  it("calculates line items with price, discount, and tax", () => {
    const items = [
      { quantity: 3, unit_price: 15000, discount: 5000, tax: 7600 },
      { quantity: 2, unit_price: 30000, discount: 0, tax: 11400 },
    ];

    let subtotal = 0;
    let discount = 0;
    let tax = 0;

    const calculated = items.map((it) => {
      const lineSubtotal = it.quantity * it.unit_price;
      const lineTotal = lineSubtotal - it.discount + it.tax;
      subtotal += lineSubtotal;
      discount += it.discount;
      tax += it.tax;
      return { ...it, lineSubtotal, lineTotal };
    });

    const total = subtotal - discount + tax;

    expect(subtotal).toBe(105000);
    expect(discount).toBe(5000);
    expect(tax).toBe(19000);
    expect(total).toBe(119000);
    expect(calculated[0].lineTotal).toBe(47600);
    expect(calculated[1].lineTotal).toBe(71400);
  });

  it("calculates account receivable / payable balance accurately after partial payments", () => {
    const originalAmount = 1000000;
    const payments = [300000, 700000];

    let paidAmount = 0;
    let balance = originalAmount;
    let status: "pending" | "partial" | "paid" = "pending";

    // First payment
    paidAmount += payments[0];
    balance = originalAmount - paidAmount;
    status = balance <= 0 ? "paid" : "partial";

    expect(paidAmount).toBe(300000);
    expect(balance).toBe(700000);
    expect(status).toBe("partial");

    // Second payment
    paidAmount += payments[1];
    balance = originalAmount - paidAmount;
    status = balance <= 0 ? "paid" : "partial";

    expect(paidAmount).toBe(1000000);
    expect(balance).toBe(0);
    expect(status).toBe("paid");
  });

  it("computes cash session difference on closing", () => {
    const openingAmount = 100000;
    const movements = [
      { type: "in", amount: 50000 },
      { type: "in", amount: 30000 },
      { type: "out", amount: -20000 },
    ];

    const movementSum = movements.reduce((acc, m) => acc + m.amount, 0);
    const expectedAmount = openingAmount + movementSum;
    const actualClosingAmount = 160000;
    const difference = actualClosingAmount - expectedAmount;

    expect(expectedAmount).toBe(160000);
    expect(difference).toBe(0);
  });
});
