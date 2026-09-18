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
import { Patient } from "@/lib/types";
import { CareEncounter } from "@/lib/carenote-types";

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
  const [patient, setPatient] = React.useState<(Patient & Record<string, any>) | null>(null);
  const [encounters, setEncounters] = React.useState<CareEncounter[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    api
      .get<{ data: Patient & Record<string, any> }>(`/patients/${id}`)
      .then((r) => setPatient(r.data.data))
      .catch(() => toast.error("No se pudo cargar el paciente."))
      .finally(() => setLoading(false));

    api
      .get<{ data: CareEncounter[] }>("/care-encounters", { params: { patient_id: id, per_page: 50 } })
      .then((r) => setEncounters(r.data.data))
      .catch(() => undefined);
  }, [id]);

  React.useEffect(() => load(), [load]);

  if (loading) return <p className="p-6 text-sm text-muted-foreground">Cargando datos del paciente...</p>;
  if (!patient) return null;

  const fullName = patient.first_name ? `${patient.first_name} ${patient.last_name || ""}` : patient.name;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
          <p className="text-sm text-slate-500">
            Documento: {patient.document_type || "CC"} {patient.document_number || "N/A"}
            {" · "}
            EPS / Aseguradora: <strong>{patient.health_coverage_provider || "Particular"}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/atenciones/nueva">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
              + Iniciar Atención Domiciliaria
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => router.push("/app/pacientes")}>
            Volver al listado
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
            <Fact label="Tipo Documento" value={patient.document_type || "CC"} />
            <Fact label="Número Documento" value={patient.document_number} />
            <Fact label="Teléfono de Contacto" value={patient.phone} />
            <Fact label="Dirección" value={[patient.address, patient.city].filter(Boolean).join(", ")} />
            <Fact label="EPS / Aseguradora" value={patient.health_coverage_provider} />
            <Fact label="Fecha Nacimiento" value={patient.birth_date ? formatDate(patient.birth_date) : null} />
            <Fact label="Contacto Emergencia" value={patient.emergency_contact_name} />
            <Fact label="Tel. Emergencia" value={patient.emergency_contact_phone} />
            <Fact label="Estado" value={<Badge>{patient.status === "active" ? "Activo" : "Inactivo"}</Badge>} />
          </CardContent>
        </Card>

        {patient.medical_history_summary && (
          <Card>
            <CardContent className="p-5 space-y-2">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Resumen de Antecedentes</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{patient.medical_history_summary}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Historial de Atenciones Domiciliarias del Paciente */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Historial de Atenciones Domiciliarias</h3>
            <Link href="/app/atenciones/nueva" className="text-xs text-blue-600 hover:underline font-semibold">
              + Nueva atención
            </Link>
          </div>

          {encounters.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Sin atenciones asistenciales registradas para este paciente.</p>
          ) : (
            <div className="divide-y border rounded-md">
              {encounters.map((enc) => (
                <div key={enc.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {enc.encounter_code}
                      </span>
                      <span className="text-xs font-semibold capitalize text-slate-700">
                        {enc.encounter_type.replace("_", " ")}
                      </span>
                      <Badge className="border border-slate-200 text-xs">
                        {enc.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Iniciada: {new Date(enc.started_at).toLocaleString("es-CO")} • Profesional: {enc.professional?.name || "Asignado"}
                    </p>
                  </div>
                  <Link href={`/app/atenciones/${enc.id}`}>
                    <Button variant="outline" size="sm">Ver Atención</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
