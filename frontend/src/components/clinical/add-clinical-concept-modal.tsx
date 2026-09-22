"use client";

import * as React from "react";
import {
  ClipboardList,
  Pill,
  Package,
  Stethoscope,
  Scissors,
  FileText,
  Info,
  Pencil,
  Database,
  Plus,
  X,
  CheckCircle2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ConceptCategory = "concepto" | "medicamento" | "insumo" | "procedimiento" | "servicio";

export type ClinicalItemPayload = {
  category: ConceptCategory;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  generatesBilling: boolean;
  affectsInventory: boolean;
};

interface AddClinicalConceptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddConcept?: (item: ClinicalItemPayload) => void;
}

const CATEGORY_CONFIG: Record<
  ConceptCategory,
  {
    label: string;
    badgeText: string;
    icon: React.ElementType;
    badgeStyle: string;
    iconBg: string;
    defaultTitle: string;
    defaultDesc: string;
    defaultPrice: number;
    generatesBilling: boolean;
    affectsInventory: boolean;
    helpTitle: string;
    helpBullets: string[];
    titleLabel: string;
    titleHelp: string;
    descLabel: string;
    descHelp: string;
  }
> = {
  concepto: {
    label: "Concepto",
    badgeText: "Concepto Clínico",
    icon: FileText,
    badgeStyle: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-100 text-blue-600 border-blue-200",
    defaultTitle: "Control de herida",
    defaultDesc: "Revisión de herida, limpieza, aplicación de antiséptico y evaluación de evolución.",
    defaultPrice: 0,
    generatesBilling: false,
    affectsInventory: false,
    helpTitle: "¿Cuándo usar este tipo?",
    helpBullets: [
      "Observaciones generales de la consulta",
      "Notas clínicas no asociadas a un medicamento, insumo o procedimiento",
      "Resultados de exámenes, controles, recomendaciones, etc.",
    ],
    titleLabel: "Título del concepto *",
    titleHelp: "Nombre breve del concepto.",
    descLabel: "Descripción / Notas *",
    descHelp: "Incluye detalles relevantes para la historia clínica.",
  },
  medicamento: {
    label: "Medicamentos",
    badgeText: "Medicamento",
    icon: Pill,
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
    defaultTitle: "Amoxicilina 500mg (Cápsulas)",
    defaultDesc: "Tomar 1 cápsula cada 8 horas por 7 días vía oral después de los alimentos.",
    defaultPrice: 15000,
    generatesBilling: true,
    affectsInventory: true,
    helpTitle: "¿Cuándo usar Medicamentos?",
    helpBullets: [
      "Prescripción y administración de fármacos en la atención",
      "Posología, dosis, frecuencia y vía de administración",
      "Medicamentos entregados por farmacia o aplicados en consultorio",
    ],
    titleLabel: "Nombre del medicamento *",
    titleHelp: "Fármaco, concentración y presentación.",
    descLabel: "Posología y fórmulas *",
    descHelp: "Dosis, frecuencia, duración e indicaciones de uso.",
  },
  insumo: {
    label: "Insumos",
    badgeText: "Insumo Médico",
    icon: Package,
    badgeStyle: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-100 text-amber-700 border-amber-200",
    defaultTitle: "Gasas Estériles (Paquete x 5)",
    defaultDesc: "Paquete de gasas estériles empleadas en la curación asistencial.",
    defaultPrice: 8500,
    generatesBilling: true,
    affectsInventory: true,
    helpTitle: "¿Cuándo usar Insumos?",
    helpBullets: [
      "Material de curación, jeringas, catéteres o guantes descartables",
      "Elementos asistenciales consumidos durante el procedimiento",
      "Control estricto de existencias en bodega",
    ],
    titleLabel: "Nombre del insumo *",
    titleHelp: "Nombre comercial o técnico del material médico.",
    descLabel: "Detalle de utilización *",
    descHelp: "Uso específico o área asistencial donde se empleó.",
  },
  procedimiento: {
    label: "Procedimientos",
    badgeText: "Procedimiento",
    icon: Stethoscope,
    badgeStyle: "bg-purple-50 text-purple-700 border-purple-200",
    iconBg: "bg-purple-100 text-purple-700 border-purple-200",
    defaultTitle: "Curación ambulatoria de herida compleja",
    defaultDesc: "Aseo quirúrgico superficial, retiro de detritos y curación plana estéril.",
    defaultPrice: 45000,
    generatesBilling: true,
    affectsInventory: false,
    helpTitle: "¿Cuándo usar Procedimientos?",
    helpBullets: [
      "Intervenciones asistenciales ambulatorias o curaciones",
      "Maniobras médicas realizadas en consultorio o sala de procedimientos",
      "Generación de cobro asistencial por servicio prestado",
    ],
    titleLabel: "Nombre del procedimiento *",
    titleHelp: "Procedimiento médico o enfermería realizado.",
    descLabel: "Detalle del procedimiento *",
    descHelp: "Técnica, hallazgos o instrumental utilizado.",
  },
  servicio: {
    label: "Servicios",
    badgeText: "Servicio Asistencial",
    icon: Scissors,
    badgeStyle: "bg-teal-50 text-teal-700 border-teal-200",
    iconBg: "bg-teal-100 text-teal-700 border-teal-200",
    defaultTitle: "Valoración Médica Especializada",
    defaultDesc: "Consulta por especialista y evaluación completa de antecedentes.",
    defaultPrice: 90000,
    generatesBilling: true,
    affectsInventory: false,
    helpTitle: "¿Cuándo usar Servicios?",
    helpBullets: [
      "Consultas especializadas, telemedicina o atención domiciliaria",
      "Servicios asistenciales de apoyo o laboratorio clínico",
      "Honorarios profesionales e interconsultas",
    ],
    titleLabel: "Nombre del servicio *",
    titleHelp: "Servicio asistencial o consultoría prestada.",
    descLabel: "Detalle del servicio *",
    descHelp: "Alcance del servicio u observaciones para la cuenta.",
  },
};

export function AddClinicalConceptModal({
  open,
  onOpenChange,
  onAddConcept,
}: AddClinicalConceptModalProps) {
  const [activeTab, setActiveTab] = React.useState<ConceptCategory>("concepto");
  const config = CATEGORY_CONFIG[activeTab];

  const [title, setTitle] = React.useState(config.defaultTitle);
  const [description, setDescription] = React.useState(config.defaultDesc);
  const [quantity, setQuantity] = React.useState(1);
  const [unitPrice, setUnitPrice] = React.useState(config.defaultPrice);

  const handleTabChange = (newTab: ConceptCategory) => {
    setActiveTab(newTab);
    const newConfig = CATEGORY_CONFIG[newTab];
    setTitle(newConfig.defaultTitle);
    setDescription(newConfig.defaultDesc);
    setUnitPrice(newConfig.defaultPrice);
    setQuantity(1);
  };

  const total = quantity * unitPrice;
  const generatesBilling = config.generatesBilling && total > 0;
  const affectsInventory = config.affectsInventory;

  const CategoryIcon = config.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAddConcept?.({
      category: activeTab,
      title: title.trim() || config.defaultTitle,
      description: description.trim() || config.defaultDesc,
      quantity,
      unitPrice,
      total,
      generatesBilling,
      affectsInventory,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[94vw] p-0 border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden rounded-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/80 p-5 sm:p-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
                Agregar Concepto Clínico
              </DialogTitle>
              <p className="mt-0.5 text-xs text-slate-500">
                Selecciona el tipo de concepto y completa la información para añadirlo a la consulta.
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs Bar */}
        <div className="border-b border-slate-100 bg-slate-50/40 px-5 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar">
            {(Object.keys(CATEGORY_CONFIG) as ConceptCategory[]).map((tabKey) => {
              const tabConfig = CATEGORY_CONFIG[tabKey];
              const TabIcon = tabConfig.icon;
              const isActive = activeTab === tabKey;

              return (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => handleTabChange(tabKey)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 shrink-0 border",
                    isActive
                      ? "bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <TabIcon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500")} />
                  <span>{tabConfig.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main Body (2 Columns) */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column: Form Fields */}
            <div className="space-y-4 lg:col-span-7">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Información del Concepto</h3>
                <p className="text-xs text-slate-500">
                  Registra los detalles del {config.label.toLowerCase()} para la atención del paciente.
                </p>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">{config.titleLabel}</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={config.defaultTitle}
                  required
                  className="h-11 rounded-xl border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary/20"
                />
                <p className="text-[11px] text-slate-500">{config.titleHelp}</p>
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">{config.descLabel}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={config.defaultDesc}
                  rows={3}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-[11px] text-slate-500">{config.descHelp}</p>
              </div>

              {/* Quantity & Unit Price Row (For non-pure concept or editable) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Cantidad</label>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-10 rounded-xl border-slate-200 bg-white text-sm text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Precio Unitario ($)</label>
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="h-10 rounded-xl border-slate-200 bg-white text-sm text-slate-900"
                  />
                </div>
              </div>

              {/* Help Guidance Callout Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="font-semibold text-slate-900">{config.helpTitle}</p>
                    <ul className="list-disc space-y-1 pl-4 text-slate-600">
                      {config.helpBullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Item Preview & Alerts */}
            <div className="space-y-4 lg:col-span-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Vista previa del ítem</h3>
                <p className="text-xs text-slate-500">Así se verá en la consulta:</p>
              </div>

              {/* Live Preview Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border", config.iconBg)}>
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-slate-900 truncate">{title || "Sin título"}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {description || "Sin descripción..."}
                      </p>
                    </div>
                  </div>
                  <span className={cn("shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", config.badgeStyle)}>
                    {config.badgeText}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-500">Cantidad</p>
                    <p className="mt-0.5 text-base font-bold text-slate-900">{quantity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-500">Precio</p>
                    <p className="mt-0.5 text-base font-bold text-slate-900">${unitPrice.toLocaleString("es-CO")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-500">Subtotal</p>
                    <p className="mt-0.5 text-base font-bold text-emerald-600">${total.toLocaleString("es-CO")}</p>
                  </div>
                </div>
              </div>

              {/* Status Alert Cards */}
              <div className="space-y-2.5">
                {/* Billing Status Card */}
                <div className={cn(
                  "rounded-xl border p-3.5 flex items-start gap-3 transition-colors",
                  generatesBilling
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                )}>
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border", generatesBilling ? "border-emerald-300 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600")}>
                    <Pencil className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold">
                      {generatesBilling ? "Este ítem genera cargo en factura." : "Este ítem no genera cargo en factura."}
                    </p>
                    <p className={cn("mt-0.5 text-[11px]", generatesBilling ? "text-emerald-700" : "text-slate-500")}>
                      {generatesBilling
                        ? "Se liquidará en la cuenta / factura de atención."
                        : "Es solo un registro clínico en la historia del paciente."}
                    </p>
                  </div>
                </div>

                {/* Inventory Status Card */}
                <div className={cn(
                  "rounded-xl border p-3.5 flex items-start gap-3 transition-colors",
                  affectsInventory
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                )}>
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border", affectsInventory ? "border-amber-300 bg-amber-100 text-amber-700" : "border-slate-200 bg-slate-100 text-slate-600")}>
                    <Database className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold">
                      {affectsInventory ? "Este ítem descuenta inventario." : "Este ítem no afecta inventario."}
                    </p>
                    <p className={cn("mt-0.5 text-[11px]", affectsInventory ? "text-amber-700" : "text-slate-500")}>
                      {affectsInventory
                        ? `Descontará ${quantity} unidad(es) de la bodega farmacéutica.`
                        : "No descuenta existencias en bodega."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-10 gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              Agregar a la Consulta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
