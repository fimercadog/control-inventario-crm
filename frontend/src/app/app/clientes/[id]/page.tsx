"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { WhatsAppAction } from "@/components/crud/whatsapp-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ActivityRow, Client, Deal, ClientNote, Order, Patient, Quote } from "@/lib/types";

type History = {
  client: Client;
  patients: Patient[];
  deals: Deal[];
  activities: ActivityRow[];
  orders: Order[];
  quotes: Quote[];
  notes: ClientNote[];
};

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-medium">{title}</h3>
          <Badge>{count}</Badge>
        </div>
        {count === 0 ? <p className="text-sm text-muted-foreground">Sin registros.</p> : <div className="space-y-2">{children}</div>}
      </CardContent>
    </Card>
  );
}

function Row({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 text-sm last:border-0 last:pb-0">
      <span className="min-w-0 truncate">{left}</span>
      {right ? <span className="shrink-0 text-xs text-muted-foreground">{right}</span> : null}
    </div>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = React.useState<History | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api
      .get<History>(`/clients/${id}/history`)
      .then((r) => setData(r.data))
      .catch(() => toast.error("No se pudo cargar el historial."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-sm text-muted-foreground">Cargando historial...</p>;
  if (!data) return null;

  const c = data.client;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{c.name}</h1>
          <p className="text-sm text-muted-foreground">
            {c.company_name ?? "Sin empresa"}
            {c.segment ? ` · ${c.segment}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <WhatsAppAction phone={c.phone} name={c.name} />
          <Button variant="ghost" size="sm" onClick={() => router.push("/app/clientes")}>
            Volver
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Mascotas" count={data.patients.length}>
          {data.patients.map((p) => (
            <Row
              key={p.id}
              left={
                <Link href={`/app/pacientes/${p.id}`} className="text-primary hover:underline">
                  {p.name}
                </Link>
              }
              right={[p.species, p.breed].filter(Boolean).join(" · ")}
            />
          ))}
        </Section>

        <Section title="Deals" count={data.deals.length}>
          {data.deals.map((d) => (
            <Row key={d.id} left={d.title} right={`${d.stage} · $${Number(d.amount).toLocaleString("es-CO")}`} />
          ))}
        </Section>

        <Section title="Cotizaciones" count={data.quotes.length}>
          {data.quotes.map((q) => (
            <Row
              key={q.id}
              left={<Link href={`/app/cotizaciones/${q.id}`} className="text-primary hover:underline">{q.title}</Link>}
              right={`${q.status} · $${Number(q.total).toLocaleString("es-CO")}`}
            />
          ))}
        </Section>

        <Section title="Pedidos" count={data.orders.length}>
          {data.orders.map((o) => (
            <Row
              key={o.id}
              left={<Link href={`/app/pedidos/${o.id}`} className="text-primary hover:underline">Pedido #{o.id}</Link>}
              right={`${o.status} · $${Number(o.total).toLocaleString("es-CO")}`}
            />
          ))}
        </Section>

        <Section title="Actividades" count={data.activities.length}>
          {data.activities.map((a) => (
            <Row key={a.id} left={a.subject} right={a.due_date ? formatDate(a.due_date) : a.type} />
          ))}
        </Section>

        <Section title="Notas" count={data.notes.length}>
          {data.notes.map((n) => (
            <Row key={n.id} left={n.body} right={`${n.author ?? ""} · ${formatDate(n.created_at)}`} />
          ))}
        </Section>
      </div>
    </div>
  );
}
