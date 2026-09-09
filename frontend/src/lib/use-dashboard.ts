"use client";

import * as React from "react";
import { api } from "@/lib/api";

export type Delta = { current: number; previous: number; pct: number | null };

export type DashboardData = {
  generated_at: string;
  clinical?: {
    appointments_today: number;
    active_patients: number;
    vaccinations_due: number;
    consultations_month: number;
  };
  metrics: Record<string, number>;
  deltas: Record<"revenue" | "deals_won", Delta>;
  deals_by_stage: { stage: string; total: number; amount: number }[];
  top_products: { id: number; name: string; sku: string; stock_on_hand: number }[];
  trends: {
    revenue_monthly: { month: string; revenue: number }[];
    deals_monthly: { month: string; won: number; lost: number }[];
  };
  low_stock_alerts: { id: number; name: string; sku: string; reorder_level: number }[];
  recent_activity: { id: number; action: string; module?: string; user?: string | null; created_at: string }[];
};

export function useDashboard() {
  const [data, setData] = React.useState<DashboardData>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = React.useState<Date>();
  const [nonce, setNonce] = React.useState(0);

  React.useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => setLoading(true));
    api
      .get<DashboardData>("/dashboard", { signal: controller.signal })
      .then((response) => {
        // Un backend desactualizado responde 200 sin `trends`: no rompas toda la
        // pagina, cae en el estado de error con reintentar.
        if (!response.data?.trends?.revenue_monthly) {
          throw new Error("shape");
        }
        setData(response.data);
        setError(null);
        setFetchedAt(new Date());
      })
      .catch((err) => {
        if (err?.name !== "CanceledError") setError("No se pudo cargar el dashboard.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [nonce]);

  return { data, loading, error, fetchedAt, refresh: () => setNonce((n) => n + 1) };
}
