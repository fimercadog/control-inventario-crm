export const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatArea(value: number | null): string | null {
  return value !== null ? `${value} m²` : null;
}
