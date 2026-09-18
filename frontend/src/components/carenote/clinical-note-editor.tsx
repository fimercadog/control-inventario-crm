"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  Lock,
  Save,
  CheckCircle2,
  History,
  PlusCircle,
  AlertTriangle,
  FileText,
  Activity,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { ClinicalNote, TemplateType, NoteStatus, NoteAddendum } from "@/lib/carenote-types";

interface ClinicalNoteEditorProps {
  encounterId: number;
  initialNote?: ClinicalNote | null;
  onNoteUpdated?: (note: ClinicalNote) => void;
}

export function ClinicalNoteEditor({ encounterId, initialNote, onNoteUpdated }: ClinicalNoteEditorProps) {
  const [note, setNote] = useState<ClinicalNote | null>(initialNote || null);
  const [templateType, setTemplateType] = useState<TemplateType>(initialNote?.template_type || "soap");
  const [title, setTitle] = useState(initialNote?.title || "Nota de Atención Asistencial");
  const [summaryText, setSummaryText] = useState(initialNote?.summary_text || "");

  // Campos SOAP
  const [soap, setSoap] = useState({
    subjective: initialNote?.structured_content_json?.subjective || "",
    objective: initialNote?.structured_content_json?.objective || "",
    assessment: initialNote?.structured_content_json?.assessment || "",
    plan: initialNote?.structured_content_json?.plan || "",
  });

  // Campos Signos Vitales
  const [vitals, setVitals] = useState({
    heart_rate: initialNote?.vitals_json?.heart_rate || "",
    blood_pressure: initialNote?.vitals_json?.blood_pressure || "",
    respiratory_rate: initialNote?.vitals_json?.respiratory_rate || "",
    temperature: initialNote?.vitals_json?.temperature || "",
    spo2: initialNote?.vitals_json?.spo2 || "",
    glucose: initialNote?.vitals_json?.glucose || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modales
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<NoteStatus>("CERRADA");

  const [showAddendumModal, setShowAddendumModal] = useState(false);
  const [addendumText, setAddendumText] = useState("");
  const [addendumReason, setAddendumReason] = useState("");
  const [submittingAddendum, setSubmittingAddendum] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const isClosed = note?.note_status === "CERRADA";

  // Guardar borrador o cambios
  const handleSaveDraft = async () => {
    if (isClosed) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        care_encounter_id: encounterId,
        template_type: templateType,
        title,
        summary_text: summaryText,
        structured_content_json: templateType === "soap" ? soap : { summaryText },
        vitals_json: vitals,
      };

      const res = await api.post<{ data: ClinicalNote }>("/clinical-notes", payload);
      const updatedNote = res.data.data;
      setNote(updatedNote);
      setSuccessMsg("Borrador guardado correctamente.");
      if (onNoteUpdated) onNoteUpdated(updatedNote);
    } catch (err: any) {
      setError(err.response?.data?.message || "No se pudo guardar la nota clínica.");
    } finally {
      setSaving(false);
    }
  };

  // Confirmar y cambiar estado a REVISADA o CERRADA
  const handleConfirmStatus = async () => {
    if (!note?.id) return;
    setSaving(true);
    setError(null);

    try {
      const res = await api.post<{ data: ClinicalNote }>(`/clinical-notes/${note.id}/confirm`, {
        status: confirmStatus,
      });
      const updated = res.data.data;
      setNote(updated);
      setShowConfirmModal(false);
      setSuccessMsg(
        confirmStatus === "CERRADA"
          ? "La nota clínica ha sido CERRADA e inmovilizada."
          : "La nota clínica fue marcada como REVISADA."
      );
      if (onNoteUpdated) onNoteUpdated(updated);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al confirmar la nota clínica.");
    } finally {
      setSaving(false);
    }
  };

  // Crear Adenda en nota CERRADA
  const handleCreateAddendum = async () => {
    if (!note?.id || !addendumText.trim() || !addendumReason.trim()) return;
    setSubmittingAddendum(true);
    setError(null);

    try {
      const res = await api.post<{ data: ClinicalNote }>(`/clinical-notes/${note.id}/addendum`, {
        addendum_text: addendumText,
        reason: addendumReason,
      });
      const updated = res.data.data;
      setNote(updated);
      setShowAddendumModal(false);
      setAddendumText("");
      setAddendumReason("");
      setSuccessMsg("Adenda añadida exitosamente a la nota cerrada.");
      if (onNoteUpdated) onNoteUpdated(updated);
    } catch (err: any) {
      setError(err.response?.data?.message || "No se pudo registrar la adenda.");
    } finally {
      setSubmittingAddendum(false);
    }
  };

  const statusBadge = (status?: NoteStatus) => {
    switch (status) {
      case "CERRADA":
        return <Badge className="bg-emerald-600 text-white font-semibold">🔒 CERRADA</Badge>;
      case "REVISADA":
        return <Badge className="bg-blue-600 text-white font-semibold">✓ REVISADA</Badge>;
      default:
        return <Badge className="border border-amber-500 text-amber-700 bg-amber-50 font-semibold">📝 BORRADOR</Badge>;
    }
  };

  return (
    <Card className="p-5 border shadow-sm space-y-5">
      {/* Encabezado del Editor */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <FileCheck2 className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">Documentación Asistencial</h3>
            <p className="text-xs text-slate-500">Gestión de borrador, firmas y trazabilidad</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {statusBadge(note?.note_status)}

          {note && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1.5"
            >
              <History className="w-4 h-4 text-slate-600" />
              Versiones ({note.versions?.length || 1})
            </Button>
          )}

          {isClosed && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowAddendumModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Agregar Adenda
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Selector de Plantilla */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wider block mb-1">
            Plantilla Clinica
          </label>
          <select
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value as TemplateType)}
            disabled={isClosed}
            className="w-full border rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          >
            <option value="soap">SOAP (Subjetivo, Objetivo, Valoración, Plan)</option>
            <option value="nursing_evolution">Evolución de Enfermería</option>
            <option value="procedure">Procedimiento Domiciliario</option>
            <option value="vitals">Control de Signos Vitales</option>
            <option value="free_text">Nota Asistencial Libre</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wider block mb-1">
            Título de la Nota
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isClosed}
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            placeholder="Ej. Control Post-operatorio y Curación"
          />
        </div>
      </div>

      {/* Sección Signos Vitales */}
      <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-500" /> Signos Vitales Registrados
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div>
            <label className="text-xs text-slate-500 block">T. Arterial</label>
            <input
              type="text"
              placeholder="120/80"
              value={vitals.blood_pressure}
              onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })}
              disabled={isClosed}
              className="w-full border rounded p-1.5 text-xs text-center font-mono disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block">F. Cardíaca (bpm)</label>
            <input
              type="text"
              placeholder="72"
              value={vitals.heart_rate}
              onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })}
              disabled={isClosed}
              className="w-full border rounded p-1.5 text-xs text-center font-mono disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block">F. Resp. (rpm)</label>
            <input
              type="text"
              placeholder="18"
              value={vitals.respiratory_rate}
              onChange={(e) => setVitals({ ...vitals, respiratory_rate: e.target.value })}
              disabled={isClosed}
              className="w-full border rounded p-1.5 text-xs text-center font-mono disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block">Temp (°C)</label>
            <input
              type="text"
              placeholder="36.5"
              value={vitals.temperature}
              onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
              disabled={isClosed}
              className="w-full border rounded p-1.5 text-xs text-center font-mono disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block">SpO2 (%)</label>
            <input
              type="text"
              placeholder="98"
              value={vitals.spo2}
              onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
              disabled={isClosed}
              className="w-full border rounded p-1.5 text-xs text-center font-mono disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block">Gluco (mg/dL)</label>
            <input
              type="text"
              placeholder="95"
              value={vitals.glucose}
              onChange={(e) => setVitals({ ...vitals, glucose: e.target.value })}
              disabled={isClosed}
              className="w-full border rounded p-1.5 text-xs text-center font-mono disabled:bg-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Campos dinámicos según plantilla */}
      {templateType === "soap" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Subjetivo (Síntomas y relato del paciente)</label>
            <textarea
              rows={3}
              value={soap.subjective}
              onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
              disabled={isClosed}
              className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              placeholder="Relato del paciente, molestias expressas..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Objetivo (Hallazgos y examen físico)</label>
            <textarea
              rows={3}
              value={soap.objective}
              onChange={(e) => setSoap({ ...soap, objective: e.target.value })}
              disabled={isClosed}
              className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              placeholder="Hallazgos observados, signos clinicos..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Valoración (Evaluación de enfermería)</label>
            <textarea
              rows={3}
              value={soap.assessment}
              onChange={(e) => setSoap({ ...soap, assessment: e.target.value })}
              disabled={isClosed}
              className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              placeholder="Análisis asistencial de la evolución..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Plan / Intervenciones</label>
            <textarea
              rows={3}
              value={soap.plan}
              onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
              disabled={isClosed}
              className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              placeholder="Procedimientos realizados e indicaciones..."
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Resumen / Detalle de la Evolución</label>
          <textarea
            rows={6}
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            disabled={isClosed}
            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            placeholder="Escriba aquí los detalles y procedimientos de la atención asistencial..."
          />
        </div>
      )}

      {/* Botones de Acción */}
      {!isClosed && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
          <Button
            onClick={handleSaveDraft}
            disabled={saving}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar Borrador"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setConfirmStatus("REVISADA");
                setShowConfirmModal(true);
              }}
              disabled={saving}
              variant="outline"
              className="text-blue-700 border-blue-300 hover:bg-blue-50"
            >
              Marcar como Revisada
            </Button>
            <Button
              onClick={() => {
                setConfirmStatus("CERRADA");
                setShowConfirmModal(true);
              }}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar y Cerrar Nota
            </Button>
          </div>
        </div>
      )}

      {/* Visualización de Adendas existentes */}
      {note?.addendums && note.addendums.length > 0 && (
        <div className="mt-6 border-t pt-4 space-y-3">
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-amber-600" /> Adendas Post-Cierre ({note.addendums.length})
          </h4>
          <div className="space-y-2">
            {note.addendums.map((add) => (
              <div key={add.id} className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm space-y-1">
                <div className="flex items-center justify-between text-xs text-amber-900 font-semibold">
                  <span>Motivo: {add.reason}</span>
                  <span>{new Date(add.created_at).toLocaleString("es-CO")}</span>
                </div>
                <p className="text-slate-800 text-sm whitespace-pre-wrap">{add.addendum_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Confirmar Cierre */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Cierre de Nota Clínica</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600">
              ¿Está seguro que desea marcar esta nota clínica como <strong>{confirmStatus}</strong>?
              {confirmStatus === "CERRADA" && (
                <span className="block mt-2 text-amber-700 font-medium bg-amber-50 p-2 border border-amber-200 rounded">
                  ⚠️ Una vez CERRADA, la nota no admitirá modificaciones directas y requerirá adendas para correcciones posteriores.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
              <Button
                onClick={handleConfirmStatus}
                disabled={saving}
                className={confirmStatus === "CERRADA" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
              >
                {saving ? "Procesando..." : `Sí, confirmar ${confirmStatus}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Agregar Adenda */}
      <Dialog open={showAddendumModal} onOpenChange={setShowAddendumModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Adenda Post-Cierre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Motivo de la Adenda *</label>
              <input
                type="text"
                value={addendumReason}
                onChange={(e) => setAddendumReason(e.target.value)}
                placeholder="Ej. Notificación a médico tratante / Corrección de laboratorio"
                className="w-full border rounded p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Contenido de la Adenda *</label>
              <textarea
                rows={4}
                value={addendumText}
                onChange={(e) => setAddendumText(e.target.value)}
                placeholder="Escriba aquí la información complementaria u observación adicional..."
                className="w-full border rounded p-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowAddendumModal(false)}>Cancelar</Button>
              <Button
                onClick={handleCreateAddendum}
                disabled={submittingAddendum || !addendumText.trim() || !addendumReason.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {submittingAddendum ? "Registrando..." : "Guardar Adenda"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Historial de Versiones */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial de Versiones Inmutables</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {note?.versions && note.versions.length > 0 ? (
              note.versions.map((ver) => (
                <div key={ver.id} className="p-3 border rounded-lg bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Versión #{ver.version_number} ({ver.change_type})
                    </span>
                    <span>{new Date(ver.created_at).toLocaleString("es-CO")}</span>
                  </div>
                  <pre className="text-xs bg-white p-2 rounded border overflow-x-auto font-mono text-slate-700">
                    {JSON.stringify(ver.snapshot_json, null, 2)}
                  </pre>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No hay historial previo registrado.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
