import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { Activity } from "@/types/activity";

/**
 * One adapter per contingency-eligible module. Each adapter owns the two
 * things that differ per module: how to describe a queued transaction in the
 * management screen, and how to replay it through the REAL API endpoint when
 * synced (never a parallel write path — see sync() below, it's the exact
 * same request an online create would make, plus the idempotency key).
 *
 * Adding a module later = adding one adapter here, matching a module key
 * ContingencyModuleRegistry (backend) already lists as eligible.
 */
export interface ContingencyModuleAdapter {
  key: string;
  action: string;
  summarize(payload: Record<string, unknown>): string;
  sync(payload: Record<string, unknown>, clientUuid: string): Promise<void>;
}

const activitiesAdapter: ContingencyModuleAdapter = {
  key: "activities",
  action: "create",
  summarize(payload) {
    const type = String(payload.type ?? "");
    const notes = String(payload.notes ?? "");
    return `${type} — ${notes.slice(0, 60)}${notes.length > 60 ? "…" : ""}`;
  },
  async sync(payload, clientUuid) {
    await api.post<ApiSuccessResponse<Activity>>("/activities", { ...payload, client_uuid: clientUuid });
  },
};

const MODULE_ADAPTERS: Record<string, ContingencyModuleAdapter> = {
  activities: activitiesAdapter,
};

export function getModuleAdapter(key: string): ContingencyModuleAdapter | undefined {
  return MODULE_ADAPTERS[key];
}
