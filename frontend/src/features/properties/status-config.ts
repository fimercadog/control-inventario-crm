import type { StatusConfig } from "@/components/shared/status-badge";
import { PROPERTY_STATUS_LABELS, type PropertyStatusValue } from "@/types/property";

export const PROPERTY_STATUS_CONFIG: Record<PropertyStatusValue, StatusConfig> = {
  borrador: { label: PROPERTY_STATUS_LABELS.borrador, tone: "outline" },
  disponible: { label: PROPERTY_STATUS_LABELS.disponible, tone: "success" },
  reservado: { label: PROPERTY_STATUS_LABELS.reservado, tone: "warning" },
  vendido: { label: PROPERTY_STATUS_LABELS.vendido, tone: "secondary" },
  arrendado: { label: PROPERTY_STATUS_LABELS.arrendado, tone: "secondary" },
  inactivo: { label: PROPERTY_STATUS_LABELS.inactivo, tone: "destructive" },
};
