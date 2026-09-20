"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardList,
  DollarSign,
  FileText,
  Stethoscope,
  Syringe,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  containerVariants,
  itemVariants,
  REPORT_TONES,
  ReportChartFrame,
  ReportDistributionCard,
  ReportKpiCard,
  ReportSectionHeader,
} from "@/components/ui/report-card";
import { api } from "@/lib/api";
import { APPOINTMENT_STATUS_LABEL } from "@/lib/appointments";
import { isoDateLocal } from "@/lib/utils";

type ClinicalReport = {
  range: { from: string; to: string };
  patients_attended: number;
  consultations: number;
  vaccinations_applied: number;
  dewormings_applied: number;
  appointments_by_status: Record<string, number>;
  appointments_by_practitioner: Record<string, number>;
  revenue_by_service: Record<string, number>;
};

export default function ClinicalReportsPage() {
  const monthStart = isoDateLocal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const today = isoDateLocal(new Date());
  const [from, setFrom] = React.useState(monthStart);
  const [to, setTo] = React.useState(today);
  const [data, setData] = React.useState<ClinicalReport | null>(null);

  const fetchReport = React.useCallback(() => {
    api
      .get<ClinicalReport>(`/reports/clinical?from=${from}&to=${to}`)
      .then((r) => setData(r.data))
      .catch(() => toast.error("Error al cargar informe clínico"));
  }, [from, to]);

  React.useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (!data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3 p-8 text-center">
        <ReportKpiCard label="Cargando Reportes Clínicos" value={0} icon={BarChart3} tone={REPORT_TONES.emerald} />
        <p className="text-xs text-muted-foreground">Generando analítica de citas y tratamientos estéticos...</p>
      </div>
    );
  }

  const statusRows = Object.entries(data.appointments_by_status).map(([k, v]) => ({
    name: APPOINTMENT_STATUS_LABEL[k] ?? k,
    value: v,
  }));

  const practitionerRows = Object.entries(data.appointments_by_practitioner).map(([k, v]) => ({
    name: k,
    value: v,
  }));

  const serviceRows = Object.entries(data.revenue_by_service).map(([k, v]) => ({
    name: k,
    value: v,
  }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col justify-between gap-2 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Analítica Clínica Estética & Cabinas
            </span>
            <span className="text-xs text-muted-foreground">
              Rango: {data.range.from} a {data.range.to}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Reportes Clínicos & Tratamientos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atención de pacientes en cabina, sesiones aplicadas e ingresos por procedimiento estético.
          </p>
        </div>
      </motion.div>

      {/* KPI Cards Clínicos */}
      <motion.section variants={itemVariants} className="space-y-4">
        <ReportSectionHeader title="Resumen de Atención en Cabina" description="Métricas de atención al paciente y tratamientos realizados." icon={Activity} tone={REPORT_TONES.emerald} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReportKpiCard label="Pacientes Atendidos" value={data.patients_attended} icon={UserCheck} tone={REPORT_TONES.emerald} emphasis />
          <ReportKpiCard label="Valoraciones & Consultas" value={data.consultations} icon={Stethoscope} tone={REPORT_TONES.sky} />
          <ReportKpiCard label="Sesiones Aplicadas" value={data.vaccinations_applied} icon={Syringe} tone={REPORT_TONES.indigo} />
          <ReportKpiCard label="Procedimientos Menores" value={data.dewormings_applied} icon={ClipboardList} tone={REPORT_TONES.violet} />
        </div>
      </motion.section>

      {/* Desglose en Tarjetas Modernas */}
      <motion.section variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
        <ReportDistributionCard title="Citas Estéticas por Estado" description="Distribución por estado de agendamiento." icon={CalendarDays} tone={REPORT_TONES.indigo} rows={statusRows} />
        <ReportDistributionCard title="Atención por Médico / Especialista" description="Volumen de sesiones por profesional." icon={Users} tone={REPORT_TONES.violet} rows={practitionerRows} />
        <ReportDistributionCard title="Ingresos por Tratamiento Estético" description="Monto facturado por procedimiento." icon={DollarSign} tone={REPORT_TONES.emerald} rows={serviceRows} isMoney />
      </motion.section>
    </motion.div>
  );
}
