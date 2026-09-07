"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { ContingencyConflictError, getAdapter } from "@/lib/contingency/adapters";
import * as queueStore from "@/lib/contingency/queue";
import { ContingencyStatus, QueuedTx } from "@/lib/contingency/types";

type EnqueueOpts = { op?: "create" | "update"; recordId?: number; baseSnapshot?: Record<string, unknown> };

type ContingencyValue = {
  status: ContingencyStatus | null;
  loading: boolean;
  isActive: boolean;
  enabledModules: string[];
  /** `resource` puede venir como "/products" o "products". */
  moduleEnabled: (resource: string) => boolean;
  queue: QueuedTx[];
  pendingCount: number;
  refreshStatus: () => Promise<void>;
  enqueue: (moduleKey: string, payload: Record<string, unknown>, opts?: EnqueueOpts) => Promise<void>;
  syncOne: (id: string) => Promise<void>;
  resolveConflict: (id: string, resolvedPayload: Record<string, unknown>) => Promise<void>;
  discardOne: (id: string, reason: string) => Promise<void>;
  activate: (modules: string[]) => Promise<void>;
  deactivate: () => Promise<void>;
};

const ContingencyContext = React.createContext<ContingencyValue | null>(null);

const POLL_MS = 30_000;
const UNRESOLVED: QueuedTx["status"][] = ["pending", "failed", "conflict"];

function normalizeKey(resource: string) {
  return resource.replace(/^\//, "");
}

export function ContingencyProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<ContingencyStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [queue, setQueue] = React.useState<QueuedTx[]>([]);

  const reloadQueue = React.useCallback(async () => {
    try {
      setQueue(await queueStore.getAll());
    } catch {
      // IndexedDB no disponible (modo privado, etc.): la cola queda vacia.
    }
  }, []);

  const refreshStatus = React.useCallback(async () => {
    try {
      const { data } = await api.get<ContingencyStatus>("/contingency/status");
      setStatus(data);
    } catch {
      // Sin conexion o 401: no tocamos el ultimo estado conocido.
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void (async () => {
      await reloadQueue();
      await refreshStatus();
    })();
    const timer = window.setInterval(refreshStatus, POLL_MS);
    const onFocus = () => refreshStatus();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [reloadQueue, refreshStatus]);

  const isActive = status?.active ?? false;
  const enabledModules = React.useMemo(
    () => (isActive ? status?.session?.enabled_modules ?? [] : []),
    [isActive, status],
  );

  const moduleEnabled = React.useCallback(
    (resource: string) => enabledModules.includes(normalizeKey(resource)),
    [enabledModules],
  );

  const pendingCount = queue.filter((tx) => UNRESOLVED.includes(tx.status)).length;

  const enqueue = React.useCallback(
    async (moduleKey: string, payload: Record<string, unknown>, opts: EnqueueOpts = {}) => {
      const adapter = getAdapter(moduleKey);
      if (!adapter) throw new Error(`Modulo sin adaptador de contingencia: ${moduleKey}`);
      const op = opts.op ?? "create";
      const tx: QueuedTx = {
        id: crypto.randomUUID(),
        module: moduleKey,
        op,
        recordId: opts.recordId,
        baseSnapshot: opts.baseSnapshot,
        payload,
        summary: adapter.summarize({ op, payload }),
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      await queueStore.put(tx);
      await reloadQueue();
    },
    [reloadQueue],
  );

  const syncOne = React.useCallback(
    async (id: string) => {
      const tx = (await queueStore.getAll()).find((item) => item.id === id);
      if (!tx) return;
      const adapter = getAdapter(tx.module);
      if (!adapter) throw new Error(`Modulo sin adaptador: ${tx.module}`);
      try {
        await adapter.sync(tx);
        await queueStore.remove(id);
      } catch (error) {
        if (error instanceof ContingencyConflictError) {
          await queueStore.put({
            ...tx,
            status: "conflict",
            error: "Conflicto: el registro cambio en el servidor.",
            conflict: { fields: error.fields, server: error.server },
          });
        } else {
          await queueStore.put({
            ...tx,
            status: "failed",
            error: error instanceof Error ? error.message : "Error al sincronizar.",
          });
        }
        throw error;
      } finally {
        await reloadQueue();
      }
    },
    [reloadQueue],
  );

  const resolveConflict = React.useCallback(
    async (id: string, resolvedPayload: Record<string, unknown>) => {
      const tx = (await queueStore.getAll()).find((item) => item.id === id);
      if (!tx) return;
      const adapter = getAdapter(tx.module);
      if (!adapter) throw new Error(`Modulo sin adaptador: ${tx.module}`);
      // force: el usuario ya reviso las diferencias campo por campo.
      await adapter.sync({ ...tx, payload: resolvedPayload }, { force: true });
      await queueStore.remove(id);
      await reloadQueue();
    },
    [reloadQueue],
  );

  const discardOne = React.useCallback(
    async (id: string, reason: string) => {
      const trimmed = reason.trim();
      if (!trimmed) throw new Error("El descarte requiere un motivo.");
      const tx = (await queueStore.getAll()).find((item) => item.id === id);
      if (tx) {
        console.warn("[contingencia] transaccion descartada", { id, module: tx.module, reason: trimmed, summary: tx.summary });
      }
      await queueStore.remove(id);
      await reloadQueue();
    },
    [reloadQueue],
  );

  const activate = React.useCallback(
    async (modules: string[]) => {
      await api.post("/contingency/activate", { enabled_modules: modules });
      await refreshStatus();
    },
    [refreshStatus],
  );

  const deactivate = React.useCallback(async () => {
    if (pendingCount > 0) {
      throw new Error("Hay transacciones sin resolver. Sincronizalas, resuelvelas o descartalas antes de desactivar.");
    }
    await api.post("/contingency/deactivate");
    await refreshStatus();
  }, [pendingCount, refreshStatus]);

  const value: ContingencyValue = {
    status,
    loading,
    isActive,
    enabledModules,
    moduleEnabled,
    queue,
    pendingCount,
    refreshStatus,
    enqueue,
    syncOne,
    resolveConflict,
    discardOne,
    activate,
    deactivate,
  };

  return <ContingencyContext.Provider value={value}>{children}</ContingencyContext.Provider>;
}

export function useContingency(): ContingencyValue {
  const ctx = React.useContext(ContingencyContext);
  if (!ctx) throw new Error("useContingency debe usarse dentro de ContingencyProvider");
  return ctx;
}
