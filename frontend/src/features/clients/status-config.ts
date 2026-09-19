import type { StatusConfig } from "@/components/shared/status-badge";
import { CLIENT_STATUS_LABELS, type ClientStatusValue } from "@/types/client";

export const CLIENT_STATUS_CONFIG: Record<ClientStatusValue, StatusConfig> = {
  activo: { label: CLIENT_STATUS_LABELS.activo, tone: "success" },
  inactivo: { label: CLIENT_STATUS_LABELS.inactivo, tone: "secondary" },
};
