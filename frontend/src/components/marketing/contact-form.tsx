"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

const inputClass =
  "h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

export function ContactForm({ demo = false }: { demo?: boolean }) {
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
      company_name: String(fd.get("company_name") ?? "").trim() || null,
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim() || null,
      employee_count: String(fd.get("employee_count") ?? "").trim() || null,
      priority_module: String(fd.get("priority_module") ?? "").trim() || null,
      message: String(fd.get("message") ?? "").trim() || null,
      source: demo ? "demo" : "contact",
      consent: fd.get("consent") === "on",
    };

    try {
      await api.post("/leads", payload);
      setDone(true);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(
        status === 429
          ? "Recibimos varios envios seguidos. Espera un momento e intenta de nuevo."
          : status === 422
            ? "Revisa los campos: el nombre, un correo valido y la autorizacion de datos son obligatorios."
            : "No se pudo enviar. Intenta de nuevo o escribenos por WhatsApp.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-elevation-2">
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="size-4" />
          Recibimos tu solicitud. Te contactaremos pronto.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-elevation-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" placeholder="Nombre" aria-label="Nombre" required className={inputClass} />
        <input name="company_name" placeholder="Empresa" aria-label="Empresa" className={inputClass} />
        <input name="email" type="email" placeholder="Email" aria-label="Email" required className={inputClass} />
        <input name="phone" placeholder="WhatsApp" aria-label="WhatsApp" className={inputClass} />
        <input
          name="employee_count"
          placeholder="Numero de usuarios / bodegas"
          aria-label="Numero de usuarios o bodegas"
          className={inputClass}
        />
        <input
          name="priority_module"
          placeholder="Modulo prioritario (CRM, inventario...)"
          aria-label="Modulo prioritario"
          className={inputClass}
        />
      </div>
      <textarea
        name="message"
        className="mt-4 min-h-32 w-full rounded-lg border border-input bg-card px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        placeholder="Cuentanos que procesos son mas manuales hoy"
        aria-label="Mensaje"
      />
      <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 shrink-0 accent-primary" />
        <span>
          Autorizo el tratamiento de mis datos personales para ser contactado con fines comerciales, conforme a la
          Ley 1581 de 2012 y a la{" "}
          <Link href="/privacidad" className="font-medium text-primary underline">
            Politica de Tratamiento de Datos
          </Link>
          .
        </span>
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
        {loading ? "Enviando..." : demo ? "Solicitar demostracion" : "Enviar mensaje"}
      </button>
    </form>
  );
}
