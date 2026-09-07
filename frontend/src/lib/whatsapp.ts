// wa.me abre WhatsApp Web en escritorio y la app en movil.
// ponytail: el numero se usa tal cual (solo se limpian no-digitos). Si no trae
// indicativo de pais, WhatsApp lo interpreta con el del dispositivo. Guardar el
// numero en formato internacional (57...) evita ambiguedad.
export function waLink(phone?: string | null, text?: string): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 7) return null;
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}
