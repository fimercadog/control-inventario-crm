"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, GitCompareArrows, RefreshCw, Trash2, WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useContingency } from "@/lib/contingency/context";
import { getStoredUser, hasAnyPermission } from "@/lib/auth";
import { QueuedTx, QueuedTxStatus } from "@/lib/contingency/types";

const statusBadge: Record<QueuedTxStatus, string> = {
  pending: "Pendiente",
  synced: "Sincronizado",
  failed: "Con error",
  conflict: "Conflicto",
};

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return error instanceof Error ? error.message : fallback;
}

type Choice = "server" | "local" | "custom";

function ConflictResolver({ tx, onClose }: { tx: QueuedTx; onClose: () => void }) {
  const { resolveConflict } = useContingency();
  const server = tx.conflict?.server ?? {};
  const fields = Object.keys(tx.conflict?.fields ?? {});
  const [choices, setChoices] = React.useState<Record<string, Choice>>(
    Object.fromEntries(fields.map((f) => [f, "local" as Choice])),
  );
  const [custom, setCustom] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    const resolved: Record<string, unknown> = { ...tx.payload };
    for (const field of fields) {
      if (choices[field] === "server") resolved[field] = server[field];
      else if (choices[field] === "custom") resolved[field] = custom[field] ?? "";
      // "local" -> ya viene de tx.payload
    }
    try {
      await resolveConflict(tx.id, resolved);
      toast.success("Conflicto resuelto y sincronizado.");
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, "No se pudo sincronizar la resolucion."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resolver conflicto · {tx.summary}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          El registro cambio en el servidor mientras estabas en contingencia. Elige que valor conservar en cada campo.
        </p>
        <div className="mt-2 space-y-4">
          {fields.map((field) => (
            <div key={field} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium">{field}</p>
              <div className="mt-2 grid gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={choices[field] === "server"} onChange={() => setChoices((c) => ({ ...c, [field]: "server" }))} />
                  <span>Servidor: <strong>{String(server[field] ?? "—")}</strong></span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={choices[field] === "local"} onChange={() => setChoices((c) => ({ ...c, [field]: "local" }))} />
                  <span>Contingencia: <strong>{String(tx.payload[field] ?? "—")}</strong></span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={choices[field] === "custom"} onChange={() => setChoices((c) => ({ ...c, [field]: "custom" }))} />
                  <span className="flex-1">Otro valor</span>
                  {choices[field] === "custom" ? (
                    <Input
                      className="h-8 max-w-xs"
                      value={custom[field] ?? ""}
                      onChange={(e) => setCustom((v) => ({ ...v, [field]: e.target.value }))}
                    />
                  ) : null}
                </label>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancelar</Button>
          <Button onClick={save} disabled={busy}>Guardar y sincronizar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ContingencyPage() {
  const {
    status, loading, isActive, queue, pendingCount, enabledModules,
    activate, deactivate, syncOne, discardOne,
  } = useContingency();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [resolving, setResolving] = React.useState<QueuedTx | null>(null);

  const canManage = React.useMemo(() => hasAnyPermission(getStoredUser(), ["settings.manage"]), []);
  const modules = status?.modules ?? [];

  function toggle(key: string) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function handleActivate() {
    if (!selected.length) return toast.error("Selecciona al menos un modulo.");
    setBusy(true);
    try {
      await activate(selected);
      toast.success("Contingencia activada.");
      setSelected([]);
    } catch (error) {
      toast.error(errorMessage(error, "No se pudo activar."));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeactivate() {
    setBusy(true);
    try {
      await deactivate();
      toast.success("Operacion normal restablecida.");
    } catch (error) {
      toast.error(errorMessage(error, "No se pudo desactivar."));
    } finally {
      setBusy(false);
    }
  }

  async function handleSync(id: string) {
    try {
      await syncOne(id);
      toast.success("Transaccion sincronizada.");
    } catch (error) {
      toast.error(errorMessage(error, "Fallo la sincronizacion."));
    }
  }

  async function handleDiscard(id: string) {
    const reason = window.prompt("Motivo del descarte (queda como evidencia):");
    if (reason == null) return;
    try {
      await discardOne(id, reason);
      toast.success("Transaccion descartada.");
    } catch (error) {
      toast.error(errorMessage(error, "No se pudo descartar."));
    }
  }

  if (loading && !status) return <p className="text-sm text-muted-foreground">Cargando estado...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-warning/15 text-warning">
          <WifiOff className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contingencia basica</h1>
          <p className="text-sm text-muted-foreground">
            Mantiene Productos y Oportunidades operando en local durante una caida de conexion. Al volver la conexion
            revisas cada transaccion una por una antes de sincronizarla.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-medium">Estado</h2>
            <Badge className={isActive ? "bg-warning/15 text-warning" : undefined}>{isActive ? "Activa" : "Inactiva"}</Badge>
          </div>

          {isActive && status?.session ? (
            <div className="space-y-1 text-sm">
              <p>Modulos habilitados: <strong>{enabledModules.join(", ")}</strong></p>
              <p className="text-muted-foreground">
                Activada por {status.session.activated_by?.name ?? "—"} ·{" "}
                {new Date(status.session.activated_at).toLocaleString("es-CO")}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">La operacion funciona con normalidad contra el API.</p>
          )}

          <div className="mt-4">
            {!canManage ? (
              <p className="text-sm text-muted-foreground">Solo un administrador puede activar o desactivar este modo.</p>
            ) : isActive ? (
              <div className="space-y-2">
                {pendingCount > 0 ? (
                  <p className="flex items-center gap-2 text-sm text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    Hay {pendingCount} transaccion(es) sin resolver. Sincronizalas, resuelvelas o descartalas antes de desactivar.
                  </p>
                ) : null}
                <Button variant="destructive" onClick={handleDeactivate} disabled={busy || pendingCount > 0}>
                  Desactivar y volver a la normalidad
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium">Modulos a habilitar</p>
                <div className="space-y-2">
                  {modules.map((module) => (
                    <label key={module.key} className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
                      <input type="checkbox" className="mt-1" checked={selected.includes(module.key)} onChange={() => toggle(module.key)} />
                      <span>
                        <span className="font-medium">{module.label}</span>
                        <span className="block text-muted-foreground">{module.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <Button onClick={handleActivate} disabled={busy}>Activar contingencia</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-base font-medium">Resolver contingencia · cola local ({queue.length})</h2>
          {queue.length ? (
            <div className="space-y-3">
              {queue.map((tx) => (
                <div key={tx.id} className="flex flex-col gap-2 border-b border-border pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{tx.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.module} · {new Date(tx.createdAt).toLocaleString("es-CO")}
                      {tx.error ? ` · ${tx.error}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={tx.status === "failed" || tx.status === "conflict" ? "bg-destructive/15 text-destructive" : undefined}>
                      {statusBadge[tx.status]}
                    </Badge>
                    {tx.status === "conflict" ? (
                      <Button variant="outline" size="sm" onClick={() => setResolving(tx)}>
                        <GitCompareArrows className="h-4 w-4" /> Resolver
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleSync(tx.id)}>
                        <RefreshCw className="h-4 w-4" /> Sincronizar
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDiscard(tx.id)}>
                      <Trash2 className="h-4 w-4" /> Descartar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay transacciones encoladas.</p>
          )}
        </CardContent>
      </Card>

      {resolving ? <ConflictResolver tx={resolving} onClose={() => setResolving(null)} /> : null}
    </div>
  );
}
