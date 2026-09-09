"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Consultation, Prescription, PrescriptionItem } from "@/lib/types";

const EMPTY_ITEM: PrescriptionItem = { medication_name: "", dosage: "", frequency: "", duration: "" };

function NewPrescription({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [consultations, setConsultations] = React.useState<Consultation[]>([]);
  const [consultationId, setConsultationId] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState<PrescriptionItem[]>([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    api
      .get<{ data: Consultation[] }>("/consultations", { params: { per_page: 100 } })
      .then((r) => setConsultations(r.data.data))
      .catch(() => undefined);
  }, [open]);

  function setItem(i: number, key: keyof PrescriptionItem, value: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  }

  async function submit() {
    if (!consultationId || items.every((i) => !i.medication_name.trim())) {
      toast.error("Elegí una consulta y al menos un medicamento.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/prescriptions", {
        consultation_id: Number(consultationId),
        notes: notes || undefined,
        items: items.filter((i) => i.medication_name.trim()),
      });
      toast.success("Receta creada");
      setOpen(false);
      setConsultationId("");
      setNotes("");
      setItems([{ ...EMPTY_ITEM }]);
      onDone();
    } catch {
      toast.error("No se pudo crear la receta.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nueva receta</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva receta</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">Consulta</span>
              <select
                value={consultationId}
                onChange={(e) => setConsultationId(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
              >
                <option value="">Elegí una consulta…</option>
                {consultations.map((c) => (
                  <option key={c.id} value={c.id}>
                    {formatDate(c.date)} · {c.patient ?? "—"} · {c.reason}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Input placeholder="Medicamento" value={it.medication_name} onChange={(e) => setItem(i, "medication_name", e.target.value)} />
                  <Input placeholder="Dosis" value={it.dosage ?? ""} onChange={(e) => setItem(i, "dosage", e.target.value)} />
                  <Input placeholder="Frecuencia" value={it.frequency ?? ""} onChange={(e) => setItem(i, "frequency", e.target.value)} />
                  <Input placeholder="Duración" value={it.duration ?? ""} onChange={(e) => setItem(i, "duration", e.target.value)} />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setItems((p) => [...p, { ...EMPTY_ITEM }])}>
                Agregar medicamento
              </Button>
            </div>

            <label className="block text-sm">
              <span className="text-muted-foreground">Indicaciones</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
              />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Guardando..." : "Crear receta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function PrescriptionsPage() {
  const [items, setItems] = React.useState<Prescription[] | null>(null);

  const load = React.useCallback(() => {
    api
      .get<{ data: Prescription[] }>("/prescriptions", { params: { per_page: 50 } })
      .then((r) => setItems(r.data.data))
      .catch(() => toast.error("No se pudieron cargar las recetas."));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function download(id: number) {
    try {
      const res = await api.get(`/prescriptions/${id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receta-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("No se pudo descargar el PDF.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Recetas</h1>
          <p className="text-sm text-muted-foreground">Prescripciones emitidas desde las consultas.</p>
        </div>
        <NewPrescription onDone={load} />
      </div>

      {items === null ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Sin recetas.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm">
                <span className="text-xs text-muted-foreground">{p.created_at ? formatDate(p.created_at) : ""}</span>
                <span className="font-medium">{p.patient ?? "—"}</span>
                <span className="text-muted-foreground">
                  {(p.items ?? []).map((i) => i.medication_name).join(", ")}
                </span>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => download(p.id)}>
                  Descargar PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
