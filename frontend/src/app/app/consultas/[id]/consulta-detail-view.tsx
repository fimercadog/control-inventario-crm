"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, FileText, Pill, Package, Stethoscope, Scissors, Pencil, Database, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Consultation } from "@/lib/types";
import {
  AddClinicalConceptModal,
  ClinicalItemPayload,
} from "@/components/clinical/add-clinical-concept-modal";

const CATEGORY_BADGE: Record<string, { label: string; style: string; icon: React.ElementType }> = {
  concepto: { label: "Concepto Clínico", style: "bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20", icon: FileText },
  medicamento: { label: "Medicamento", style: "bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20", icon: Pill },
  insumo: { label: "Insumo Médico", style: "bg-amber-600/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20", icon: Package },
  procedimiento: { label: "Procedimiento", style: "bg-violet-600/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border-violet-500/20", icon: Stethoscope },
  servicio: { label: "Servicio Asistencial", style: "bg-teal-600/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 border-teal-500/20", icon: Scissors },
};

function Soap({ letter, title, text }: { letter: string; title: string; text?: string | null }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          {letter} — {title}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm">{text?.trim() || <span className="text-muted-foreground">Sin registro.</span>}</p>
      </CardContent>
    </Card>
  );
}

export function ConsultaDetailView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [c, setC] = React.useState<Consultation | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [items, setItems] = React.useState<ClinicalItemPayload[]>([
    {
      category: "concepto",
      title: "Control de herida asistencial",
      description: "Revisión de herida, asepsia, aplicación de antiséptico y evaluación de cicatrización.",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      generatesBilling: false,
      affectsInventory: false,
    },
  ]);

  React.useEffect(() => {
    api
      .get<{ data: Consultation }>(`/consultations/${id}`)
      .then((r) => setC(r.data.data))
      .catch(() => toast.error("No se pudo cargar la consulta."));
  }, [id]);

  const handleAddConcept = (newItem: ClinicalItemPayload) => {
    setItems((prev) => [newItem, ...prev]);
    toast.success(`Concepto "${newItem.title}" añadido a la consulta.`);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.success("Ítem eliminado de la consulta.");
  };

  if (!c) return <p className="text-sm text-muted-foreground">Cargando consulta...</p>;

  const practitionerName = c.practitioner || c.vet;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Atención Médica · {formatDate(c.date)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Motivo: <span className="font-semibold text-foreground">{c.reason}</span>
            {" · "}
            Paciente:{" "}
            <Link href={`/app/pacientes/${c.patient_id}`} className="font-semibold text-primary hover:underline">
              {c.patient ?? "—"}
            </Link>
            {practitionerName ? ` · Médico: Dr(a). ${practitionerName}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 rounded-xl bg-emerald-500 font-bold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-950/20"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Agregar Concepto Clínico
          </Button>

          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Volver
          </Button>
        </div>
      </div>

      {/* Vitals Summary */}
      {(c.weight != null || c.temperature != null) && (
        <Card>
          <CardContent className="flex gap-8 p-5 text-sm">
            {c.weight != null && (
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold">Peso registrado</p>
                <p className="mt-0.5 font-bold text-base">{c.weight} kg</p>
              </div>
            )}
            {c.temperature != null && (
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold">Temperatura corporal</p>
                <p className="mt-0.5 font-bold text-base">{c.temperature} °C</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Added Clinical Concepts Section */}
      <Card className="border-emerald-500/20 bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-500" />
              Conceptos, Medicamentos & Procedimientos de la Consulta
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ítems registrados en la atención clínica del paciente ({items.length}).
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="gap-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar ítem
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay conceptos ni ítems agregados aún. Hacé clic en "+ Agregar Concepto Clínico" para incluir fármacos, insumos o notas.
            </p>
          ) : (
            <div className="grid gap-3">
              {items.map((item, index) => {
                const b = CATEGORY_BADGE[item.category] || CATEGORY_BADGE.concepto;
                const ItemIcon = b.icon;

                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-slate-900/40 p-4 transition hover:bg-slate-900/70"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        <ItemIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-sm text-foreground">{item.title}</p>
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${b.style}`}>
                            {b.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Cant.</span>
                          <span className="font-bold">{item.quantity}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Precio</span>
                          <span className="font-bold">${item.unitPrice.toLocaleString("es-CO")}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Subtotal</span>
                          <span className="font-bold text-emerald-500">${item.total.toLocaleString("es-CO")}</span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="h-8 w-8 text-muted-foreground hover:text-rose-500"
                        title="Eliminar ítem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SOAP Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        <Soap letter="S" title="Subjetivo (Anamnesis / Sintomatología)" text={c.subjective} />
        <Soap letter="O" title="Objetivo (Examen Físico / Hallazgos)" text={c.objective} />
        <Soap letter="A" title="Análisis (Diagnóstico / Impresión Clínica)" text={c.assessment} />
        <Soap letter="P" title="Plan (Conducta Médica / Tratamiento)" text={c.plan} />
      </div>

      {/* Interactive Modal */}
      <AddClinicalConceptModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAddConcept={handleAddConcept}
      />
    </div>
  );
}
