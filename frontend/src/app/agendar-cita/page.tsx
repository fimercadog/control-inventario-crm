"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { PageHero } from "@/components/marketing/page-hero";
import { api } from "@/lib/api";

const inputClass =
  "h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition-colors focus:border-primary";

type Service = { id: number; name: string; description: string | null; estimated_duration_minutes: number | null };
type Option = { id: number; name: string };

const TODAY = new Date().toISOString().slice(0, 10);
const MAX_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export default function AgendarCitaPage() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [species, setSpecies] = React.useState<Option[]>([]);
  const [breeds, setBreeds] = React.useState<Option[]>([]);
  const [slots, setSlots] = React.useState<string[]>([]);

  const [serviceId, setServiceId] = React.useState("");
  const [date, setDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [speciesId, setSpeciesId] = React.useState("");

  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [confirmed, setConfirmed] = React.useState<{ starts_at: string; service: string } | null>(null);

  React.useEffect(() => {
    api.get("/public/appointments/services").then((res) => setServices(res.data.data ?? []));
    api.get("/public/appointments/species").then((res) => setSpecies(res.data ?? []));
  }, []);

  React.useEffect(() => {
    if (!speciesId) return;
    api.get(`/public/appointments/species/${speciesId}/breeds`).then((res) => setBreeds(res.data ?? []));
  }, [speciesId]);

  React.useEffect(() => {
    if (!serviceId || !date) return;
    api
      .get("/public/appointments/availability", { params: { service_id: serviceId, date } })
      .then((res) => setSlots(res.data.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }, [serviceId, date]);

  function selectService(value: string) {
    setServiceId(value);
    setDate("");
    setStartTime("");
    setSlots([]);
  }

  function selectDate(value: string) {
    setDate(value);
    setStartTime("");
    setSlots([]);
    setLoadingSlots(true);
  }

  function selectSpecies(value: string) {
    setSpeciesId(value);
    setBreeds([]);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const fd = new FormData(event.currentTarget);
    const payload = {
      service_id: Number(serviceId),
      date,
      start_time: startTime,
      species_id: Number(speciesId),
      breed_id: fd.get("breed_id") ? Number(fd.get("breed_id")) : null,
      pet_name: String(fd.get("pet_name") ?? "").trim(),
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim() || null,
      company_website: String(fd.get("company_website") ?? ""),
      consent: fd.get("consent") === "on",
    };

    try {
      const res = await api.post("/public/appointments/book", payload);
      setConfirmed(res.data.appointment);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(
        status === 429
          ? "Recibimos varias solicitudes seguidas. Esperá un momento e intentá de nuevo."
          : status === 409
            ? "Ese horario se acaba de ocupar. Elegí otro."
            : status === 422
              ? "Revisá los datos: todos los campos marcados con * son obligatorios."
              : "No se pudo agendar. Intentá de nuevo o llamá a la clínica.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Agendá tu cita"
        title="Elegí día y hora para tu consulta médica"
        lead="Disponibilidad real de la clínica: elegí el horario que te sirva y tu cita queda confirmada al instante."
      />

      <section className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
        {confirmed ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-elevation-2">
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
              <CheckCircle2 className="size-4" />
              Tu cita quedó confirmada para{" "}
              {new Date(confirmed.starts_at).toLocaleString("es-CO", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              — {confirmed.service}.
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-elevation-2">
            <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

            <label className="block text-sm">
              <span>Servicio *</span>
              <select
                className={`mt-1 ${inputClass}`}
                value={serviceId}
                onChange={(e) => selectService(e.target.value)}
                required
              >
                <option value="">Elegí un servicio</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            {serviceId && (
              <label className="mt-4 block text-sm">
                <span>Fecha *</span>
                <input
                  type="date"
                  min={TODAY}
                  max={MAX_DATE}
                  value={date}
                  onChange={(e) => selectDate(e.target.value)}
                  required
                  className={`mt-1 ${inputClass}`}
                />
              </label>
            )}

            {serviceId && date && (
              <div className="mt-4">
                <span className="text-sm">Horario disponible *</span>
                {loadingSlots ? (
                  <p className="mt-2 text-sm text-muted-foreground">Buscando horarios…</p>
                ) : slots.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No hay horarios disponibles ese día. Probá otra fecha.</p>
                ) : (
                  <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setStartTime(slot)}
                        className={`rounded-lg border px-2 py-2 text-sm ${
                          startTime === slot
                            ? "border-primary bg-primary/10 font-medium text-primary"
                            : "border-input hover:border-primary/50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {startTime && (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span>Categoría de atención *</span>
                    <select
                      className={`mt-1 ${inputClass}`}
                      value={speciesId}
                      onChange={(e) => selectSpecies(e.target.value)}
                      required
                    >
                      <option value="">Elegí categoría de atención</option>
                      {species.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span>Especialidad / Subtipo</span>
                    <select name="breed_id" className={`mt-1 ${inputClass}`} disabled={breeds.length === 0}>
                      <option value="">{breeds.length === 0 ? "—" : "Elegí especialidad (opcional)"}</option>
                      {breeds.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span>Nombre del paciente *</span>
                    <input name="pet_name" required className={`mt-1 ${inputClass}`} />
                  </label>
                  <label className="block text-sm">
                    <span>Tu nombre *</span>
                    <input name="name" required className={`mt-1 ${inputClass}`} />
                  </label>
                  <label className="block text-sm">
                    <span>Correo *</span>
                    <input name="email" type="email" required className={`mt-1 ${inputClass}`} />
                  </label>
                  <label className="block text-sm">
                    <span>Teléfono</span>
                    <input name="phone" className={`mt-1 ${inputClass}`} />
                  </label>
                </div>

                <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                  <input type="checkbox" name="consent" required className="mt-0.5 size-4 shrink-0 accent-primary" />
                  <span>Autorizo el tratamiento de mis datos personales para ser contactado, conforme a la Ley 1581 de 2012.</span>
                </label>

                {error && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="size-4" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {submitting ? "Agendando…" : "Confirmar cita"}
                </button>
              </>
            )}
          </form>
        )}
      </section>
    </MarketingLayout>
  );
}
