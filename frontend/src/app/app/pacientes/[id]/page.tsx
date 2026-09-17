"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ClinicalApplication, Consultation, Patient, Procedure } from "@/lib/types";

const SEX_LABEL: Record<string, string> = {
  male: "Masculino",
  female: "Femenino",
  other: "Otro",
  unknown: "Sin dato",
};

function ageFrom(birth?: string | null): string | null {
  if (!birth) return null;
  const b = new Date(birth);
  const months = (Date.now() - b.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (months < 12) return `${Math.max(0, Math.round(months))} meses`;
  return `${Math.floor(months / 12)} años`;
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [consultations, setConsultations] = React.useState<Consultation[]>([]);
  const [procedures, setProcedures] = React.useState<Procedure[]>([]);
  const [applications, setApplications] = React.useState<ClinicalApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);

  const load = React.useCallback(() => {
    api
      .get<{ data: Patient }>(`/patients/${id}`)
      .then((r) => setPatient(r.data.data))
      .catch(() => toast.error("No se pudo cargar el paciente."))
      .finally(() => setLoading(false));
    api
      .get<{ data: Consultation[] }>("/consultations", { params: { patient_id: id, per_page: 50 } })
      .then((r) => setConsultations(r.data.data))
      .catch(() => undefined);
    api
      .get<{ data: Procedure[] }>("/procedures", { params: { patient_id: id, per_page: 50 } })
      .then((r) => setProcedures(r.data.data))
      .catch(() => undefined);
    api
      .get<{ data: ClinicalApplication[] }>("/clinical-applications", { params: { patient_id: id, per_page: 50 } })
      .then((r) => setApplications(r.data.data))
      .catch(() => undefined);
  }, [id]);

  React.useEffect(() => load(), [load]);

  async function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append("photo", file);
    try {
      await api.post(`/patients/${id}/photo`, body, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Foto actualizada");
      load();
    } catch (err) {
      const res = (err as { response?: { data?: { errors?: { photo?: string[] }; message?: string } } }).response;
      toast.error(res?.data?.errors?.photo?.[0] ?? res?.data?.message ?? "No se pudo subir la foto.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Cargando paciente...</p>;
  if (!patient) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{patient.name}</h1>
          <p className="text-sm text-muted-foreground">
            {patient.document_number ? `Doc: ${patient.document_type || "CC"} ${patient.document_number}` : "Sin documento"}
            {patient.eps ? ` · EPS: ${patient.eps}` : ""}
            {patient.client_id ? (
              <>
                {" · "}Titular / Responsable:{" "}
                <Link href={`/app/clientes/${patient.client_id}`} className="text-primary hover:underline">
                  {patient.client ?? "—"}
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/app/pacientes")}>
          Volver
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="grid aspect-square place-items-center overflow-hidden rounded-lg border border-border bg-muted">
              {patient.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={patient.photo_url} alt={patient.name} className="size-full object-cover" />
              ) : (
                <span className="text-sm text-muted-foreground">Sin foto</span>
              )}
            </div>
            <label className="block text-sm">
              <span className="text-muted-foreground">{uploading ? "Subiendo..." : "Cambiar foto (JPG/PNG/WEBP, 2 MB)"}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={uploading}
                onChange={uploadPhoto}
                className="mt-1 w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-1.5"
              />
            </label>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
            <Fact label="Documento" value={patient.document_number ? `${patient.document_type || "CC"} ${patient.document_number}` : null} />
            <Fact label="Sexo / Género" value={SEX_LABEL[patient.sex] ?? patient.sex} />
            <Fact label="Fecha Nacimiento" value={patient.birth_date ? formatDate(patient.birth_date) : null} />
            <Fact label="Edad" value={ageFrom(patient.birth_date)} />
            <Fact label="EPS / Entidad" value={patient.eps} />
            <Fact label="Grupo Sanguíneo (RH)" value={patient.blood_type} />
            <Fact label="Teléfono" value={patient.phone} />
            <Fact label="Correo" value={patient.email} />
            <Fact label="Dirección" value={patient.address} />
            <Fact label="Contacto Emergencia" value={patient.emergency_contact_name ? `${patient.emergency_contact_name} (${patient.emergency_contact_phone || "—"})` : null} />
            <Fact
              label="Estado"
              value={<Badge>{patient.status === "active" ? "Activo" : "Inactivo"}</Badge>}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-medium">Historia Clínica (Consultas SOAP)</h3>
            <Link href="/app/consultas" className="text-xs text-primary hover:underline">
              Nueva consulta
            </Link>
          </div>
          {consultations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin consultas registradas.</p>
          ) : (
            <ol className="space-y-3">
              {consultations.map((c) => (
                <li key={c.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      <Link href={`/app/consultas/${c.id}`} className="text-primary hover:underline">
                        {c.reason}
                      </Link>
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(c.date)}
                      {c.practitioner || c.vet ? ` · Dr(a). ${c.practitioner || c.vet}` : ""}
                    </span>
                  </div>
                  {c.assessment ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.assessment}</p> : null}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-medium">Procedimientos Ambulatorios</h3>
              <Link href="/app/procedimientos" className="text-xs text-primary hover:underline">
                Registrar procedimiento
              </Link>
            </div>
            {procedures.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin procedimientos registrados.</p>
            ) : (
              <ul className="space-y-2">
                {procedures.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 border-b border-border pb-2 text-sm last:border-0 last:pb-0">
                    <span className="min-w-0 truncate">
                      {p.type}
                      {p.service ? <span className="text-muted-foreground"> · {p.service}</span> : null}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(p.performed_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-medium">Aplicaciones Clínicas / Inmunización</h3>
            </div>
            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin aplicaciones registradas.</p>
            ) : (
              <ul className="space-y-2">
                {applications.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 border-b border-border pb-2 text-sm last:border-0 last:pb-0">
                    <span className="min-w-0 truncate">
                      {a.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(a.applied_at)}
                      {a.next_due_at ? ` → ${formatDate(a.next_due_at)}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
