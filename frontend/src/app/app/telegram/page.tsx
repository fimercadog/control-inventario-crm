"use client";

import React, { useState, useEffect } from "react";
import { Send, Key, CheckCircle, RefreshCw, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { api } from "@/lib/api";
import { TelegramLinkStatus } from "@/lib/carenote-types";

export default function TelegramLinkPage() {
  const [status, setStatus] = useState<TelegramLinkStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await api.get<TelegramLinkStatus>("/telegram-link/status");
      setStatus(res.data);
    } catch (err) {
      console.error("Error al obtener estado de Telegram:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleGeneratePin = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.get<{ verification_pin: string; instructions: string }>("/telegram-link/pin");
      setPin(res.data.verification_pin);
      setInstructions(res.data.instructions);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al generar el PIN de vinculación.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Send className="w-7 h-7 text-blue-600" />
          Vinculación con Telegram Bot
        </h1>
        <p className="text-sm text-slate-500">
          Asocie su cuenta asistencial de CareNote para enviar notas de voz e interactuar con el bot
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Estado de Conexión */}
      <Card className="p-6 border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Estado de Vinculación</h2>
          {loading ? (
            <span className="text-xs text-slate-400">Verificando...</span>
          ) : status?.is_linked ? (
            <StatusBadge status="active" label="Vinculado y Activo" />
          ) : (
            <StatusBadge status="pending" label="Pendiente de Vinculación" />
          )}
        </div>

        {status?.is_linked && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-900 space-y-1">
            <p><strong>Usuario Telegram:</strong> @{status.telegram_username || "Registrado"}</p>
            <p><strong>Fecha de vinculación:</strong> {status.linked_at ? new Date(status.linked_at).toLocaleString("es-CO") : "Confirmado"}</p>
          </div>
        )}

        {/* Generador de PIN */}
        <div className="border-t pt-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" /> Generar PIN de Verificación
          </h3>
          <p className="text-xs text-slate-600">
            Haga clic a continuación para obtener un código de 6 dígitos. Luego envíe este código al bot de Telegram CareNote para autorizar su dispositivo.
          </p>

          <Button
            onClick={handleGeneratePin}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            {pin ? "Generar Nuevo PIN" : "Generar Código PIN"}
          </Button>

          {pin && (
            <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Su Código PIN de Verificación:</p>
              <div className="text-3xl font-mono font-extrabold text-blue-900 tracking-widest bg-white p-3 border rounded text-center">
                {pin}
              </div>
              <p className="text-xs text-blue-800">{instructions || "Envíe este número por mensaje al bot de Telegram."}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Instrucciones de Uso */}
      <Card className="p-6 border shadow-sm space-y-3 bg-slate-50/60">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-600" /> ¿Cómo funciona la interacción con Telegram?
        </h3>
        <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed">
          <li>Abra la aplicación <strong>Telegram</strong> en su teléfono móvil o computador.</li>
          <li>Busque el bot oficial de <strong>CareNote</strong>.</li>
          <li>Escriba el código PIN de 6 dígitos generado arriba para autorizar su usuario.</li>
          <li>Una vez vinculado, podrá grabar notas de voz directamente desde Telegram durante o después de su atención asistencial.</li>
        </ol>
      </Card>
    </div>
  );
}
