"use client";

import { api } from "@/lib/api";
import { ConflictFields, QueuedTx } from "@/lib/contingency/types";

export type Payload = Record<string, unknown>;

/** Error de sincronizacion cuando el servidor cambio respecto al snapshot base. */
export class ContingencyConflictError extends Error {
  constructor(
    public fields: ConflictFields,
    public server: Record<string, unknown>,
  ) {
    super("El registro cambio en el servidor durante la contingencia.");
    this.name = "ContingencyConflictError";
  }
}

// Un adaptador por modulo elegible. `sync` reproduce la transaccion contra el
// endpoint real del API (misma validacion y logica que un alta/edicion online),
// mas el client_uuid que la hace idempotente y, en ediciones, el base_snapshot
// para detectar conflictos. Nunca una ruta de escritura paralela.
export type ContingencyAdapter = {
  key: string;
  resource: string;
  summarize: (tx: Pick<QueuedTx, "op" | "payload">) => string;
  sync: (tx: QueuedTx, opts?: { force?: boolean }) => Promise<void>;
};

function makeAdapter(key: string, resource: string, label: (p: Payload) => string): ContingencyAdapter {
  return {
    key,
    resource,
    summarize: (tx) => `${tx.op === "update" ? "Editar" : "Crear"} ${key === "deals" ? "oportunidad" : "producto"}: ${label(tx.payload)}`,
    async sync(tx, opts) {
      if (tx.op === "create") {
        await api.post(resource, { ...tx.payload, client_uuid: tx.id });
        return;
      }
      try {
        await api.put(`${resource}/${tx.recordId}`, {
          ...tx.payload,
          client_uuid: tx.id,
          base_snapshot: tx.baseSnapshot,
          ...(opts?.force ? { force: true } : {}),
        });
      } catch (err: unknown) {
        const res = (err as { response?: { status?: number; data?: { conflict?: boolean; fields?: ConflictFields; server?: { data?: Record<string, unknown> } } } }).response;
        if (res?.status === 409 && res.data?.conflict) {
          throw new ContingencyConflictError(res.data.fields ?? {}, res.data.server?.data ?? {});
        }
        throw err;
      }
    },
  };
}

const adapters: Record<string, ContingencyAdapter> = {
  products: makeAdapter("products", "/products", (p) => String(p.name ?? p.sku ?? "sin nombre")),
  deals: makeAdapter("deals", "/deals", (p) => String(p.title ?? "sin titulo")),
};

export function getAdapter(moduleKey: string): ContingencyAdapter | undefined {
  return adapters[moduleKey];
}
