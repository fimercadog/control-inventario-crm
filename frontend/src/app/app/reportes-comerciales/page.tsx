"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  prospecting: "Prospeccion",
  qualification: "Calificacion",
  proposal: "Propuesta",
  negotiation: "Negociacion",
  won: "Ganado",
};

const money = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="mb-4 text-base font-medium">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

export default function CommercialReportsPage() {
  const [data, setData] = React.useState<CommercialReport | null>(null);

  React.useEffect(() => {
    api.get<CommercialReport>("/reports/commercial").then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Reportes comerciales</h1>
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const top = data.funnel[0]?.count || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reportes comerciales</h1>
        <p className="text-sm text-muted-foreground">
          Conversión de presupuestos, equipo y ventas por producto. Generado {new Date(data.generated_at).toLocaleString("es-CO")}.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={`Embudo de ventas · tasa de cierre ${data.win_rate ?? "—"}%`}>
          <div className="space-y-3">
            {data.funnel.map((f) => (
              <div key={f.stage} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-muted-foreground">{STAGE_LABEL[f.stage] ?? f.stage}</span>
                <div className="h-8 flex-1 overflow-hidden rounded-md bg-muted">
                  <div
                    className="flex h-full items-center rounded-md bg-primary pl-3 text-xs font-semibold text-primary-foreground"
                    style={{ width: `${Math.max(10, (f.count / top) * 100)}%` }}
                  >
                    {f.count}
                  </div>
                </div>
                <span className="w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {f.conversion_from_prev !== null ? `${f.conversion_from_prev}%` : ""}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Presupuestos">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Enviadas</p>
              <p className="text-xl font-semibold">{data.quotes.sent}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Aceptadas</p>
              <p className="text-xl font-semibold">{data.quotes.accepted}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Rechazadas</p>
              <p className="text-xl font-semibold">{data.quotes.rejected}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Tasa de aceptacion</p>
              <p className="text-xl font-semibold">{data.quotes.acceptance_rate ?? "—"}%</p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Ventas por vendedor">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="w-10 py-2 pr-3 text-right tabular-nums">#</th>
                <th className="py-2">Vendedor</th>
                <th className="py-2">Abiertos</th>
                <th className="py-2">Ganados</th>
                <th className="py-2">Valor ganado</th>
                <th className="py-2">Ingresos (mes)</th>
              </tr>
            </thead>
            <tbody>
              {data.by_owner.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-muted-foreground">Sin datos por vendedor.</td>
                </tr>
              ) : (
                data.by_owner.map((o, i) => (
                  <tr key={o.owner} className="border-t border-border">
                    <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="py-2 font-medium">{o.owner}</td>
                    <td className="py-2">{o.open_deals}</td>
                    <td className="py-2">{o.won_deals}</td>
                    <td className="py-2">{money(o.won_value)}</td>
                    <td className="py-2">{money(o.revenue_month)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Ventas por producto (pedidos confirmados)">
        {data.sales_by_product.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin ventas confirmadas todavia.</p>
        ) : (
          <div className="space-y-3">
            {data.sales_by_product.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-muted-foreground">
                    {p.units} u · {money(p.revenue)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded bg-muted">
                  <div
                    className="h-full rounded bg-primary"
                    style={{ width: `${(p.revenue / (data.sales_by_product[0]?.revenue || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
