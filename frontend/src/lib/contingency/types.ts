export type ContingencyModule = {
  key: string;
  label: string;
  description: string;
  resource?: string;
};

export type ContingencyStatus = {
  active: boolean;
  modules: ContingencyModule[];
  session: {
    id: number;
    enabled_modules: string[];
    activated_at: string;
    activated_by: { id: number; name: string } | null;
  } | null;
};

export type QueuedTxStatus = "pending" | "synced" | "failed" | "conflict";

/** Campos que difieren entre el snapshot base y lo que hay hoy en el servidor. */
export type ConflictFields = Record<string, { server: unknown; base: unknown }>;

export type QueuedTx = {
  /** client_uuid: clave de idempotencia, se envia al API en el sync. */
  id: string;
  module: string;
  /** create: alta nueva. update: edicion de un registro existente. */
  op: "create" | "update";
  /** id del registro editado (solo op === "update"). */
  recordId?: number;
  /** Como se veia el registro al empezar la contingencia (solo op === "update"). */
  baseSnapshot?: Record<string, unknown>;
  payload: Record<string, unknown>;
  summary: string;
  status: QueuedTxStatus;
  error?: string;
  discardReason?: string;
  /** Detalle del conflicto detectado por el servidor (status === "conflict"). */
  conflict?: { fields: ConflictFields; server: Record<string, unknown> };
  createdAt: string;
};
