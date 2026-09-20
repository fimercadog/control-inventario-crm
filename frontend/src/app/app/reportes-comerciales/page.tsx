"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Briefcase,
  CheckCircle2,
  DollarSign,
  FileText,
  PieChart,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
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

type FunnelRow = { stage: string; count: number; conversion_from_prev: number | null };
type OwnerRow = { owner: string; open_deals: number; won_deals: number; won_value: number; revenue_month: number };
type ProductRow = { name: string; units: number; revenue: number };

type CommercialReport = {
  generated_at: string;
  funnel: FunnelRow[];
  win_rate: number | null;
  by_owner: OwnerRow[];
  quotes: { draft: number; sent: number; accepted: number; rejected: number; acceptance_rate: number | null };
  sales_by_product: ProductRow[];
};

const STAGE_LABEL: Record<string, string> = {
  prospecting: "Prospección",
  qualification: "Calificación",
  proposal: "Propuesta",
  negotiation: "Negociación",
  won: "Ganado",
};

const money = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;

export default function CommercialReportsPage() {
  const [data, setData] = React.useState<CommercialReport | null>(null);

  React.useEffect(() => {
    api.get<CommercialReport>("/reports/commercial").then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3 p-8 text-center">
        <ReportKpiCard label="Cargando Analítica Comercial" value={0} icon={BarChart3} tone={REPORT_TONES.indigo} />
        <p className="text-xs text-muted-foreground">Generando métricas del embudo comercial...</p>
      </div>
    );
  }

  const top = data.funnel[0]?.count || 1;
  const productRows = data.sales_by_product.map((p) => ({
    name: `${p.name} (${p.units} u)`,
    value: p.revenue,
  }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col justify-between gap-2 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Analítica Comercial & Embudo
            </span>
            <span className="text-xs text-muted-foreground">
              Generado {new Date(data.generated_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Reportes Comerciales & CRM</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tasa de conversión de embudo, desempeño de asesores y volumen de ventas por paquete/servicio.
          </p>
        </div>
      </motion.div>

      {/* KPI Cards de Cotizaciones & Win Rate */}
      <motion.section variants={itemVariants} className="space-y-4">
        <ReportSectionHeader title="Rendimiento de Cotizaciones & Cierre" description="Efectividad en la conversión de propuestas a ventas." icon={FileText} tone={REPORT_TONES.indigo} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReportKpiCard label="Tasa de Cierre (Win Rate)" value={data.win_rate ?? 0} suffix="%" icon={TrendingUp} tone={REPORT_TONES.emerald} emphasis />
          <ReportKpiCard label="Cotizaciones Enviadas" value={data.quotes.sent} icon={FileText} tone={REPORT_TONES.sky} />
          <ReportKpiCard label="Cotizaciones Aceptadas" value={data.quotes.accepted} icon={CheckCircle2} tone={REPORT_TONES.green} />
          <ReportKpiCard label="Tasa de Aceptación" value={data.quotes.acceptance_rate ?? 0} suffix="%" icon={BarChart3} tone={REPORT_TONES.violet} />
        </div>
      </motion.section>

      {/* Embudo Comercial & Productos Destacados */}
      <motion.section variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        <ReportChartFrame
          title="Embudo Comercial (Conversión por Etapa)"
          description={`Tasa global de cierre acumulada: ${data.win_rate ?? "—"}%`}
          icon={Briefcase}
          tone={REPORT_TONES.indigo}
        >
          <div className="space-y-3.5 pt-2">
            {data.funnel.map((f) => {
              const pct = Math.max(8, Math.round((f.count / top) * 100));
              return (
                <div key={f.stage} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground">{STAGE_LABEL[f.stage] ?? f.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{f.count} op.</span>
                      {f.conversion_from_prev !== null ? (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{f.conversion_from_prev}% conv.</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-muted/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ReportChartFrame>

        <ReportDistributionCard
          title="Ventas por Servicio / Paquete Turístico"
          description="Ventas acumuladas en unidades e ingresos por producto."
          icon={ShoppingCart}
          tone={REPORT_TONES.emerald}
          rows={productRows}
          isMoney
        />
      </motion.section>

      {/* Desempeño por Vendedor / Asesor */}
      <motion.section variants={itemVariants} className="space-y-4">
        <ReportSectionHeader title="Desempeño Comercial por Asesor" description="Seguimiento de cuotas, valor ganado e ingresos del mes por asesor de viajes." icon={UserCheck} tone={REPORT_TONES.violet} />
        <ReportChartFrame title="Ranking de Vendedores & Cierre" icon={Users} tone={REPORT_TONES.violet}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Asesor Commercial</th>
                  <th className="py-3 px-3">Abiertos</th>
                  <th className="py-3 px-3">Ganados</th>
                  <th className="py-3 px-3">Valor Ganado</th>
                  <th className="py-3 px-3">Ingresos (Mes)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data.by_owner.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">Sin ventas registradas por asesor todavía.</td>
                  </tr>
                ) : (
                  data.by_owner.map((o, i) => (
                    <tr key={o.owner} className="transition-colors hover:bg-muted/40">
                      <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{i + 1}</td>
                      <td className="py-3 px-3 font-bold text-foreground">{o.owner}</td>
                      <td className="py-3 px-3 font-medium">{o.open_deals}</td>
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">{o.won_deals}</td>
                      <td className="py-3 px-3 font-semibold">{money(o.won_value)}</td>
                      <td className="py-3 px-3 font-bold text-primary">{money(o.revenue_month)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ReportChartFrame>
      </motion.section>
    </motion.div>
  );
}
