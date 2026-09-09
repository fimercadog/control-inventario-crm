"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { api } from "@/lib/api";

const inputClass =
  "mt-1 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function SolicitarCitaPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(event.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim() || null,
      pet_name: String(fd.get("pet_name") ?? "").trim() || null,
      reason: String(fd.get("reason") ?? "").trim() || null,
      preferred_date: String(fd.get("preferred_date") ?? "").trim() || null,
      message: String(fd.get("message") ?? "").trim() || null,
      company_website: String(fd.get("company_website") ?? ""),
      consent: fd.get("consent") === "on",
    };

    try {
      await api.post("/public/appointments", payload);
      setDone(true);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(
        status === 429
          ? "Recibimos varias solicitudes seguidas. Esperá un momento e intentá de nuevo."
          : status === 422
            ? "Revisá los campos: nombre, un correo válido y la autorización de datos son obligatorios."
            : "No se pudo enviar. Intentá de nuevo o llamá a la clínica.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Solicitá tu cita"
        title="Pedí un turno para tu mascota"
        lead="Dejanos tus datos y la clínica confirmará disponibilidad y te contactará para agendar."
      />

      <section className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
        {done ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-elevation-2">
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
              <CheckCircle2 className="size-4" />
              Recibimos tu solicitud. La clínica confirmará disponibilidad y te contactará.
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-elevation-2">
            <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span>Tu nombre *</span>
                <input name="name" required className={inputClass} />
              </label>
              <label className="block text-sm">
                <span>Correo *</span>
                <input name="email" type="email" required className={inputClass} />
              </label>
              <label className="block text-sm">
                <span>Teléfono</span>
                <input name="phone" className={inputClass} />
              </label>
              <label className="block text-sm">
                <span>Nombre de la mascota</span>
                <input name="pet_name" className={inputClass} />
              </label>
              <label className="block text-sm">
                <span>Motivo</span>
                <input name="reason" placeholder="Consulta, vacuna, control…" className={inputClass} />
              </label>
              <label className="block text-sm">
                <span>Fecha / franja preferida</span>
                <input name="preferred_date" placeholder="Ej. martes por la tarde" className={inputClass} />
              </label>
            </div>

            <label className="mt-4 block text-sm">
              <span>¿Algo más que debamos saber?</span>
              <textarea name="message" rows={3} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
            </label>

            <label className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" name="consent" className="mt-0.5" />
              <span>Autorizo el tratamiento de mis datos personales conforme a la política de privacidad (Ley 1581 de 2012).</span>
            </label>

            {error ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="size-4" /> {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Solicitar cita"}
            </button>
          </form>
        )}
      </section>
    </MarketingLayout>
  );
}
