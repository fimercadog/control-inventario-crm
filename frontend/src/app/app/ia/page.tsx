import { redirect } from "next/navigation";

// El asistente IA es un modulo Premium: en el sidebar aparece bloqueado y no
// navega. Si alguien llega a /app/ia por URL (bookmark, cache viejo), se
// devuelve al dashboard en vez de mostrar una pantalla.
export default function AiPage() {
  redirect("/app/dashboard");
}
