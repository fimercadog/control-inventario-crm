import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

/** Boton de fila: abre WhatsApp Web con un mensaje prellenado. */
export function WhatsAppAction({ phone, name }: { phone?: string | null; name?: string | null }) {
  const href = waLink(phone, name ? `Hola ${name}, ` : undefined);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Escribir por WhatsApp"
      className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-[#0e8f5c] transition-colors hover:bg-[#0e8f5c]/10"
    >
      <MessageCircle className="h-4 w-4" /> WhatsApp
    </a>
  );
}
