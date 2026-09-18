"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Stethoscope, UserCheck, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, PaginatedResponse } from "@/lib/api";
import { CareEncounter } from "@/lib/carenote-types";

interface PatientOption {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  document_number?: string;
  phone?: string;
  address?: string;
  health_coverage_provider?: string;
}

interface AppointmentOption {
  id: number;
  starts_at: string;
  reason?: string;
  patient_id: number;
}

export default function NuevaAtencionPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [appointments, setAppointments] = useState<AppointmentOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>("");
  const [encounterType, setEncounterType] = useState("atencion_domiciliaria");
  const [notesSummary, setNotesSummary] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patRes, appRes] = await Promise.all([
          api.get<PaginatedResponse<PatientOption>>("/patients", { params: { per_page: 100 } }),
          api.get<PaginatedResponse<AppointmentOption>>("/appointments", { params: { per_page: 50 } }),
        ]);

        setPatients(patRes.data.data);
        setAppointments(appRes.data.data);
      } catch (err) {
        console.error("Error al cargar pacientes o citas:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedPatient = patients.find((p) => p.id === Number(selectedPatientId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError("Debe seleccionar un paciente para iniciar la atención.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, any> = {
        patient_id: Number(selectedPatientId),
        encounter_type: encounterType,
        notes_summary: notesSummary,
      };

      if (selectedAppointmentId) {
        payload.appointment_id = Number(selectedAppointmentId);
      }

      const res = await api.post<{ data: CareEncounter }>("/care-encounters", payload);
      const encounter = res.data.data;

      router.push(`/app/atenciones/${encounter.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear la atención asistencial.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/atenciones">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            Iniciar Nueva Atención Asistencial
          </h1>
          <p className="text-sm text-slate-500">Seleccione el paciente e inicie la sesión de atención</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="p-6 border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleccionar Cita Previa (Opcional) */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Vincular a Cita Programada (Opcional)
            </label>
            <select
              value={selectedAppointmentId}
              onChange={(e) => {
                const apptId = e.target.value;
                setSelectedAppointmentId(apptId);
                const appt = appointments.find((a) => a.id === Number(apptId));
                if (appt) {
                  setSelectedPatientId(appt.patient_id.toString());
                }
              }}
              className="w-full border rounded-md p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Atención sin cita previa (Directa) --</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  Cita #{a.id} - {new Date(a.starts_at).toLocaleString("es-CO")} {a.reason ? `(${a.reason})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Seleccionar Paciente */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Paciente *
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full border rounded-md p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Seleccionar Paciente --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name ? `${p.first_name} ${p.last_name}` : p.name} {p.document_number ? `(Doc: ${p.document_number})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Ficha Resumen del Paciente Seleccionado */}
          {selectedPatient && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-1.5 text-sm">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>{selectedPatient.first_name ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : selectedPatient.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                <span>Documento: <strong>{selectedPatient.document_number || "N/A"}</strong></span>
                <span>Teléfono: <strong>{selectedPatient.phone || "N/A"}</strong></span>
                <span>Dirección: <strong>{selectedPatient.address || "N/A"}</strong></span>
                <span>Aseguradora/EPS: <strong>{selectedPatient.health_coverage_provider || "N/A"}</strong></span>
              </div>
            </div>
          )}

          {/* Tipo de Atención */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Tipo de Atención *
            </label>
            <select
              value={encounterType}
              onChange={(e) => setEncounterType(e.target.value)}
              className="w-full border rounded-md p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="atencion_domiciliaria">Atención Domiciliaria Integral</option>
              <option value="terapia">Terapia / Rehabilitación Domiciliaria</option>
              <option value="procedimiento">Procedimiento Específico (Curaciones, Inyectología)</option>
              <option value="asistencia">Asistencia / Acompañamiento Domiciliario</option>
            </select>
          </div>

          {/* Observaciones iniciales */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Observaciones o Motivo Inicial
            </label>
            <textarea
              rows={3}
              value={notesSummary}
              onChange={(e) => setNotesSummary(e.target.value)}
              placeholder="Describa brevemente el motivo o estado inicial de la visita..."
              className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Link href="/app/atenciones">
              <Button variant="outline" type="button">Cancelar</Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting || !selectedPatientId}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {submitting ? "Creando Atención..." : "Iniciar Atención Domiciliaria"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
