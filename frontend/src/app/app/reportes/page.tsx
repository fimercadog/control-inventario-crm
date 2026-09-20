"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Boxes,
  Briefcase,
  DollarSign,
  FileText,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

type StageRow = { stage: string; total: number; amount: number };

type ReportData = {
  generated_at: string;
  pipeline: { total_deals: number; open_value: number; won_month: number; lost_month: number; by_stage: StageRow[] };
  clients: Record<string, number>;
  sales: Record<string, number>;
  purchases?: Record<string, number>;
  finance?: Record<string, number>;
  inventory: Record<string, number>;
  top_products_by_stock: { name: string; sku: string; stock_on_hand: number }[];
};

const KEY_META: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  orders_month: { label: "Ventas & Procedimientos (Mes)", icon: ShoppingCart, tone: REPORT_TONES.indigo },
  revenue_month: { label: "Ingresos por Servicios (Mes)", icon: TrendingUp, tone: REPORT_TONES.emerald },
  invoices_month: { label: "Facturas Emitidas (Mes)", icon: FileText, tone: REPORT_TONES.sky },
  invoiced_month: { label: "Monto Total Facturado (Mes)", icon: DollarSign, tone: REPORT_TONES.green },
  draft_orders: { label: "Ventas / Pedidos en Borrador", icon: Receipt, tone: REPORT_TONES.slate },
  receipts_month: { label: "Recepciones de Compra (Mes)", icon: Truck, tone: REPORT_TONES.amber },
  purchase_orders_pending: { label: "Órdenes de Compra Pendientes", icon: Package, tone: REPORT_TONES.orange },
  accounts_receivable: { label: "Cuentas por Cobrar (Cartera)", icon: Receipt, tone: REPORT_TONES.amber },
  overdue_receivables: { label: "Cartera Vencida", icon: Receipt, tone: REPORT_TONES.rose },
  accounts_payable: { label: "Cuentas por Pagar (Proveedores)", icon: FileText, tone: REPORT_TONES.slate },
  cash_balance: { label: "Saldo Total en Cajas", icon: DollarSign, tone: REPORT_TONES.emerald },
  total_products: { label: "Insumos & Productos Totales", icon: Boxes, tone: REPORT_TONES.violet },
  low_stock: { label: "Insumos con Stock Bajo", icon: Warehouse, tone: REPORT_TONES.amber },
  pending_purchase_orders: { label: "Órdenes Pendientes", icon: Package, tone: REPORT_TONES.sky },
  total: { label: "Pacientes Totales", icon: Users, tone: REPORT_TONES.cyan },
  active: { label: "Pacientes Activos", icon: Users, tone: REPORT_TONES.emerald },
};

const STAGE_LABEL: Record<string, string> = {
  prospecting: "Prospección",
  qualification: "Calificación",
  proposal: "Propuesta",
  negotiation: "Negociación",
  won: "Ganado",
  lost: "Perdido",
};

const MONEY_KEYS = [
  "open_value",
  "revenue_month",
  "invoiced_month",
  "accounts_receivable",
  "overdue_receivables",
  "accounts_payable",
  "cash_balance",
];

export default function ReportsPage() {
  const [report, setReport] = React.useState<ReportData | null>(null);

  React.useEffect(() => {
    api.get<ReportData>("/reports").then((res) => setReport(res.data)).catch(() => {});
  }, []);

  if (!report) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3 p-8 text-center">
        <ReportKpiCard label="Cargando Indicadores" value={0} icon={BarChart3} tone={REPORT_TONES.indigo} />
        <p className="text-xs text-muted-foreground">Generando analítica ejecutiva ERP...</p>
      </div>
    );
  }

  const stageChartData = report.pipeline?.by_stage?.map((s) => ({
    name: STAGE_LABEL[s.stage] ?? s.stage,
    cantidad: s.total,
    monto: s.amount,
  })) || [];

  const topProductsChart = report.top_products_by_stock.slice(0, 5).map((p) => ({
    name: p.name,
    value: p.stock_on_hand,
  }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col justify-between gap-2 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
              Analítica Clínica & ERP
            </span>
            <span className="text-xs text-muted-foreground">
              Actualizado {new Date(report.generated_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Reportes ERP Integrales</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visión ejecutiva de ventas, insumos, cartera, CxP, caja e historia clínica.
          </p>
        </div>
      </motion.div>

      {/* Ventas & Comercial */}
      <motion.section variants={itemVariants} className="space-y-4">
        <ReportSectionHeader title="Ventas & Servicios Estéticos" description="Rendimiento de facturación, tratamientos y volumen de ingresos." icon={ShoppingCart} tone={REPORT_TONES.indigo} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(report.sales).map(([k, v]) => {
            const meta = KEY_META[k] ?? { label: k, icon: FileText, tone: REPORT_TONES.indigo };
            const isMoney = MONEY_KEYS.includes(k);
            return <ReportKpiCard key={k} label={meta.label} value={v} isMoney={isMoney} icon={meta.icon} tone={meta.tone} emphasis={k === "revenue_month" || k === "invoiced_month"} />;
          })}
        </div>
      </motion.section>

      {/* Visualización de Pipeline / Etapas de Negocio */}
      {stageChartData.length > 0 ? (
        <motion.section variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
          <ReportChartFrame title="Pipeline Comercial de Tratamientos" description="Distribución de valoraciones y propuestas comerciales." icon={Briefcase} tone={REPORT_TONES.sky}>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "0.75rem" }}
                    formatter={(val: any) => [val, "Oportunidades"]}
                  />
                  <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                    {stageChartData.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? REPORT_TONES.indigo : REPORT_TONES.sky} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportChartFrame>

          <ReportDistributionCard
            title="Insumos Estéticos Con Mayor Stock"
            description="Top 5 insumos con mayor inventario físico disponible."
            icon={Boxes}
            tone={REPORT_TONES.violet}
            rows={topProductsChart}
          />
        </motion.section>
      ) : null}

      {/* Compras & Proveedores */}
      {report.purchases ? (
        <motion.section variants={itemVariants} className="space-y-4">
          <ReportSectionHeader title="Compras & Insumos Médicos" description="Recepción de toxinas, viales y aparatología." icon={Truck} tone={REPORT_TONES.amber} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(report.purchases).map(([k, v]) => {
              const meta = KEY_META[k] ?? { label: k, icon: Package, tone: REPORT_TONES.amber };
              const isMoney = MONEY_KEYS.includes(k);
              return <ReportKpiCard key={k} label={meta.label} value={v} isMoney={isMoney} icon={meta.icon} tone={meta.tone} />;
            })}
          </div>
        </motion.section>
      ) : null}

      {/* Finanzas & Cartera */}
      {report.finance ? (
        <motion.section variants={itemVariants} className="space-y-4">
          <ReportSectionHeader title="Finanzas: Cartera, CxP & Caja" description="Saldos en caja, bonos de tratamiento y cobranza." icon={TrendingUp} tone={REPORT_TONES.emerald} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(report.finance).map(([k, v]) => {
              const meta = KEY_META[k] ?? { label: k, icon: Receipt, tone: REPORT_TONES.green };
              const isMoney = MONEY_KEYS.includes(k);
              return <ReportKpiCard key={k} label={meta.label} value={v} isMoney={isMoney} icon={meta.icon} tone={meta.tone} emphasis={k === "cash_balance" || k === "accounts_receivable"} />;
            })}
          </div>
        </motion.section>
      ) : null}

      {/* Inventario */}
      <motion.section variants={itemVariants} className="space-y-4">
        <ReportSectionHeader title="Control de Insumos & Cabinas" description="Inventarios de aparatología y consumibles estéticos." icon={Warehouse} tone={REPORT_TONES.violet} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(report.inventory).map(([k, v]) => {
            const meta = KEY_META[k] ?? { label: k, icon: Boxes, tone: REPORT_TONES.violet };
            const isMoney = MONEY_KEYS.includes(k);
            return <ReportKpiCard key={k} label={meta.label} value={v} isMoney={isMoney} icon={meta.icon} tone={meta.tone} />;
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}
