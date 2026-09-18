"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, History, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, PaginatedResponse } from "@/lib/api";
import { PrivacyAcceptance } from "@/lib/carenote-types";

export default function PrivacidadConsentimientoPage() {
  const [acceptances, setAcceptances] = useState<PrivacyAcceptance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAcceptances = async () => {
    try {
      const res = await api.get<PaginatedResponse<PrivacyAcceptance>>("/privacy-acceptances");
      setAcceptances(res.data.data);
    } catch (err) {
      console.error("Error al cargar consentimientos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptances();
  }, []);

  const handleAcceptPolicy = async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.post<{ data: PrivacyAcceptance }>("/privacy-acceptances", {
        policy_version: "v1.0-carenote-2026",
      });

      setSuccessMsg("Consentimiento de política de privacidad registrado exitosamente.");
      fetchAcceptances();
    } catch (err: any) {
      setError(err.response?.data?.message || "No se pudo registrar la aceptación.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
          Tratamiento de Datos y Consentimiento Informado
        </h1>
        <p className="text-sm text-slate-500">
          Registro de auditoría y política de privacidad de datos clínicos de enfermería
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tarjeta de Política Vigente */}
      <Card className="p-6 border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Política de Privacidad Vigente</h2>
          <Badge className="bg-emerald-600 text-white font-semibold">Versión v1.0-carenote-2026</Badge>
        </div>

        <div className="p-4 bg-slate-50 border rounded-md text-xs text-slate-700 space-y-2 leading-relaxed max-h-48 overflow-y-auto font-mono">
          <p><strong>REGLAMENTO DE TRATAMIENTO DE DATOS ASISTENCIALES:</strong></p>
          <p>1. Los datos clínicos y notas de voz recolectadas se procesan bajo estrictas medidas de confidencialidad y secreto profesional.</p>
          <p>2. Los audios se conservan en almacenamiento privado cifrado y el acceso web se concede exclusivamente mediante firmas de tiempo limitado.</p>
          <p>3. El profesional de enfermería valida y confirma la veracidad de la nota clínica antes de su cierre e inmovilización definitiva.</p>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleAcceptPolicy}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? "Registrando..." : "Aceptar y Confirmar Política Vigente"}
          </Button>
        </div>
      </Card>

      {/* Historial de Aceptaciones Registradas */}
      <Card className="p-6 border shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-600" /> Historial de Consentimientos Registrados
        </h3>

        {loading ? (
          <p className="text-sm text-slate-500">Cargando registros de auditoría...</p>
        ) : acceptances.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No hay aceptaciones de privacidad registradas aún.</p>
        ) : (
          <div className="divide-y border rounded-md">
            {acceptances.map((acc) => (
              <div key={acc.id} className="p-3 flex items-center justify-between text-sm hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-800">Versión: {acc.policy_version}</p>
                  <p className="text-xs text-slate-500">
                    Usuario: {acc.user?.name || "Telegram / Anónimo"}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>{new Date(acc.accepted_at).toLocaleString("es-CO")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
