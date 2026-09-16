"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

type StageRow = { stage: string; total: number; amount: number };
type Distribution = { name: string; value: number };

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

const labels: Record<string, string> = {
  total_deals: "Planes y oportunidades",
  open_value: "Valor abierto del pipeline",
  won_month: "Ganados este mes",
  lost_month: "Perdidos este mes",
  total: "Clientes totales",
  active: "Clientes activos",
  orders_month: "Pedidos confirmados (mes)",
  revenue_month: "Ingresos pedidos (mes)",
  invoices_month: "Facturas emitidas (mes)",
  invoiced_month: "Monto facturado (mes)",
  draft_orders: "Pedidos en borrador",
  receipts_month: "Recepciones de compra (mes)",
  purchase_orders_pending: "Órdenes de compra pendientes",
  accounts_receivable: "Cuentas por cobrar (cartera)",
  overdue_receivables: "Cartera vencida",
  accounts_payable: "Cuentas por pagar",
  cash_balance: "Saldo en caja",
  total_products: "Productos totales",
  low_stock: "Con stock bajo",
  pending_purchase_orders: "Órdenes de compra pendientes",
};

const STAGE_LABEL: Record<string, string> = {
  prospecting: "Prospeccion",
  qualification: "Calificacion",
  proposal: "Propuesta",
  negotiation: "Negociacion",
  won: "Ganado",
  lost: "Perdido",
};

function StatGrid({ data }: { data: Record<string, number> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(data).map(([key, value]) => {
        const isMoney = ["open_value", "revenue_month", "invoiced_month", "accounts_receivable", "overdue_receivables", "accounts_payable", "cash_balance"].includes(key);
        return (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{labels[key] ?? key}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {isMoney ? `$${value.toLocaleString("es-CO")}` : value.toLocaleString("es-CO")}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function DistributionTable({ title, rows }: { title: string; rows: Distribution[] }) {
  const total = rows.reduce((sum, r) => sum + r.value, 0) || 1;
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin datos.</p>
        ) : (
          rows.map((row) => (
            <div key={row.name}>
              <div className="flex justify-between text-sm">
                <span>{row.name}</span>
                <span className="text-muted-foreground">{row.value}</span>
              </div>
              <div className="mt-1 h-1.5 rounded bg-muted">
                <div className="h-full rounded bg-primary" style={{ width: `${(row.value / total) * 100}%` }} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [report, setReport] = React.useState<ReportData | null>(null);

  React.useEffect(() => {
    api.get<ReportData>("/reports").then((res) => setReport(res.data)).catch(() => {});
  }, []);

  if (!report) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Reportes</h1>
        <p className="text-sm text-muted-foreground">Cargando indicadores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Reportes ERP</h1>
        <p className="text-sm text-muted-foreground">
          Indicadores integrales de la operación: Ventas, Compras, Cartera, CxP, Inventario y Caja. Generado {new Date(report.generated_at).toLocaleString("es-CO")}.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Ventas</h2>
        <StatGrid data={report.sales} />
      </section>

      {report.purchases ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Compras</h2>
          <StatGrid data={report.purchases} />
        </section>
      ) : null}

      {report.finance ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Finanzas: Cuentas por cobrar, Cuentas por pagar y Caja</h2>
          <StatGrid data={report.finance} />
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Inventario</h2>
        <StatGrid data={report.inventory} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Clientes</h2>
        <StatGrid data={report.clients} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Pipeline comercial</h2>
        <StatGrid
          data={{
            total_deals: report.pipeline.total_deals,
            open_value: report.pipeline.open_value,
            won_month: report.pipeline.won_month,
            lost_month: report.pipeline.lost_month,
          }}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <DistributionTable
          title="Planes y oportunidades por etapa"
          rows={report.pipeline.by_stage.map((s) => ({ name: STAGE_LABEL[s.stage] ?? s.stage, value: s.total }))}
        />
        <DistributionTable
          title="Top productos por existencia"
          rows={report.top_products_by_stock.map((p) => ({ name: p.name, value: p.stock_on_hand }))}
        />
      </section>
    </div>
  );
}
