"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Consultation } from "@/lib/types";

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

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [c, setC] = React.useState<Consultation | null>(null);

  React.useEffect(() => {
    api
      .get<{ data: Consultation }>(`/consultations/${id}`)
      .then((r) => setC(r.data.data))
      .catch(() => toast.error("No se pudo cargar la consulta."));
  }, [id]);

  if (!c) return <p className="text-sm text-muted-foreground">Cargando consulta...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Consulta · {formatDate(c.date)}</h1>
          <p className="text-sm text-muted-foreground">
            {c.reason}
            {" · "}
            Paciente:{" "}
            <Link href={`/app/pacientes/${c.patient_id}`} className="text-primary hover:underline">
              {c.patient ?? "—"}
            </Link>
            {c.vet ? ` · ${c.vet}` : ""}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          Volver
        </Button>
      </div>

      {(c.weight != null || c.temperature != null) && (
        <Card>
          <CardContent className="flex gap-8 p-5 text-sm">
            {c.weight != null && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">Peso</p>
                <p className="mt-0.5 font-medium">{c.weight} kg</p>
              </div>
            )}
            {c.temperature != null && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">Temperatura</p>
                <p className="mt-0.5 font-medium">{c.temperature} °C</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Soap letter="S" title="Subjetivo" text={c.subjective} />
        <Soap letter="O" title="Objetivo" text={c.objective} />
        <Soap letter="A" title="Análisis" text={c.assessment} />
        <Soap letter="P" title="Plan" text={c.plan} />
      </div>

      <p className="text-xs text-muted-foreground">Para editar esta consulta, usá la lista de Historia clínica.</p>
    </div>
  );
}
