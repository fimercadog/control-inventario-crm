/**
 * V1 states, reduced from the full spec's 7 (PENDING / READY_TO_SYNC /
 * SYNCING / SYNCED / CONFLICT / FAILED / DISCARDED). With a single module
 * and one-at-a-time manual sync there's no real window where "queued" and
 * "ready to sync" differ, so those two collapse into PENDING; SYNCING is
 * in-memory UI state, not persisted (a page refresh mid-sync should show it
 * as PENDING again, not stuck "syncing" forever).
 */
export type ContingencyTransactionStatus = "PENDING" | "SYNCED" | "CONFLICT" | "FAILED" | "DISCARDED";

export interface ContingencyTransaction {
  /** Also the idempotency key sent to the server on sync. */
  uuid: string;
  module: string;
  action: string;
  payload: Record<string, unknown>;
  /** Denormalized for the management screen without re-decoding payload. */
  summary: string;
  status: ContingencyTransactionStatus;
  createdAt: string;
  syncedAt: string | null;
  attempts: number;
  lastError: string | null;
  discardReason: string | null;
}

export interface ContingencyModuleDefinition {
  key: string;
  label: string;
  description: string;
}

export interface ContingencySessionInfo {
  id: number;
  enabled_modules: string[];
  activated_at: string;
  activated_by: string;
}

export interface ContingencyStatus {
  active: boolean;
  session: ContingencySessionInfo | null;
}
