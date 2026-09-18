"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Stethoscope,
  User,
  Calendar,
  Phone,
  MapPin,
  Shield,
  FileText,
  Clock,
  CheckCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { CareEncounter, EncounterStatus } from "@/lib/carenote-types";
import { AudioRecorderUploader } from "@/components/carenote/audio-recorder-uploader";
import { ClinicalNoteEditor } from "@/components/carenote/clinical-note-editor";

export default function AtencionOperativaPage() {
  const params = useParams();
  const router = useRouter();
  const encounterId = params?.id as string;

  const [encounter, setEncounter] = useState<CareEncounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEncounter = async () => {
    try {
      const res = await api.get<{ data: CareEncounter }>(`/care-encounters/${encounterId}`);
      setEncounter(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "No se pudo cargar la atención asistencial.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (encounterId) {
      fetchEncounter();
    }
  }, [encounterId]);

  const statusBadge = (status?: EncounterStatus) => {
    switch (status) {
      case "en_proceso":
        return <Badge className="bg-blue-600 text-white font-semibold text-sm px-3 py-1">🔵 En proceso</Badge>;
      case "borrador_pendiente":
        return <Badge className="bg-amber-600 text-white font-semibold text-sm px-3 py-1">📝 Borrador pendiente</Badge>;
      case "revisada":
        return <Badge className="bg-indigo-600 text-white font-semibold text-sm px-3 py-1">✓ Revisada</Badge>;
      case "cerrada":
        return <Badge className="bg-emerald-600 text-white font-semibold text-sm px-3 py-1">🔒 Cerrada</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500">Cargando datos de la atención asistencial...</div>;
  }

  if (error || !encounter) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-4">
        <p className="text-red-600 font-medium">{error || "Atención no encontrada."}</p>
        <Link href="/app/atenciones">
          <Button variant="outline">Volver al listado</Button>
        </Link>
      </div>
    );
  }

  const patient = encounter.patient;
  const patientName = patient?.first_name ? `${patient.first_name} ${patient.last_name}` : patient?.name || "Sin Nombre";

  return (
    <div className="space-y-6">
      {/* Header Operativo */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Link href="/app/atenciones">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {encounter.encounter_code}
              </span>
              {statusBadge(encounter.status)}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Atención Domiciliaria: {patientName}
            </h1>
          </div>
        </div>

        <div className="text-right text-xs text-slate-500">
          <p className="flex items-center gap-1 justify-end font-medium text-slate-700">
            <Clock className="w-4 h-4 text-blue-600" />
            Iniciada: {new Date(encounter.started_at).toLocaleString("es-CO")}
          </p>
          <p>Profesional: <strong>{encounter.professional?.name || "No asignado"}</strong></p>
        </div>
      </div>

      {/* Ficha Resumen del Paciente */}
      <Card className="p-4 border bg-slate-50/70 shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-4 h-4 text-slate-600" /> Información Clínica del Paciente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500">Documento de Identidad</p>
            <p className="font-semibold text-slate-800">{patient?.document_type || "CC"} {patient?.document_number || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Teléfono / Contacto</p>
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-500" /> {patient?.phone || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Dirección Domiciliaria</p>
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" /> {patient?.address || "N/A"} ({patient?.city || "Bogotá"})
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Aseguradora / EPS</p>
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" /> {patient?.health_coverage_provider || "Particular"}
            </p>
          </div>
        </div>
      </Card>

      {/* Grid Operativo: Módulo de Audio & Editor de Nota Clínica */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Módulo de Audio (1 columna en desktop) */}
        <div className="lg:col-span-1 space-y-6">
          <AudioRecorderUploader
            encounterId={encounter.id}
            existingRecordings={encounter.audio_recordings || []}
            onAudioUploaded={() => fetchEncounter()}
          />
        </div>

        {/* Editor de Nota Clínica (2 columnas en desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <ClinicalNoteEditor
            encounterId={encounter.id}
            initialNote={encounter.clinical_note}
            onNoteUpdated={() => fetchEncounter()}
          />
        </div>
      </div>
    </div>
  );
}
