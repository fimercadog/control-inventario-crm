import type { StatusConfig } from "@/components/shared/status-badge";
import { OWNER_STATUS_LABELS, type OwnerStatusValue } from "@/types/owner";

export const OWNER_STATUS_CONFIG: Record<OwnerStatusValue, StatusConfig> = {
  activo: { label: OWNER_STATUS_LABELS.activo, tone: "success" },
  inactivo: { label: OWNER_STATUS_LABELS.inactivo, tone: "secondary" },
};
