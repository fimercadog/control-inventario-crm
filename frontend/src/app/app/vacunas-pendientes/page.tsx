"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ClinicalApplication } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = { vaccine: "Vacuna", deworming: "Desparasitación" };

export default function VaccinationsDuePage() {
  const [items, setItems] = React.useState<ClinicalApplication[] | null>(null);

  React.useEffect(() => {
    api
      .get<{ data: ClinicalApplication[] }>("/clinical-applications/due", { params: { per_page: 100 } })
      .then((r) => setItems(r.data.data))
      .catch(() => toast.error("No se pudo cargar el listado."));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Vacunas por vencer</h1>
        <p className="text-sm text-muted-foreground">Aplicaciones cuya próxima dosis vence en los próximos 30 días (o ya venció).</p>
      </div>

      {items === null ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Nada por vencer en el rango.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((a) => {
            const overdue = a.next_due_at ? new Date(a.next_due_at) < new Date() : false;
            return (
              <Card key={a.id}>
                <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm">
                  <Badge className={overdue ? "bg-destructive/15 text-destructive" : ""}>
                    {a.next_due_at ? formatDate(a.next_due_at) : "—"}
                  </Badge>
                  <span className="font-medium">{a.name}</span>
                  <span className="text-muted-foreground">{TYPE_LABEL[a.type] ?? a.type}</span>
                  <Link href={`/app/pacientes/${a.patient_id}`} className="ml-auto text-primary hover:underline">
                    {a.patient ?? "Paciente"}
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
