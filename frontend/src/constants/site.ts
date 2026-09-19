/**
 * Central place for public-site branding/contact info. Every component that
 * needs a phone number, WhatsApp link or address reads from here — never
 * hardcode contact details directly in a component.
 */
export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Inmobiliaria Prime",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "573001234567",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+57 300 123 4567",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contacto@inmobiliariaprime.test",
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "Calle demo, Bogotá, Colombia",
} as const;

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
