"use client";

import { ModuleTablePage } from "@/components/module-table-page";
import { AppColumnDef } from "@/lib/table-types";

type Audit = { id: number; action: string; module?: string; entity: string; entity_id?: number; created_at: string };

const columns: AppColumnDef<Audit>[] = [
  { accessorKey: "action", header: "Accion" },
  { accessorKey: "module", header: "Modulo" },
  { accessorKey: "entity", header: "Entidad" },
  { accessorKey: "entity_id", header: "ID" },
  { accessorKey: "created_at", header: "Fecha" },
];

export default function AuditPage() {
  return (
    <ModuleTablePage
      title="Auditoría de Acciones y Trazabilidad"
      description="Bitácora de seguridad del sistema: registro de quién consultó, creó o modificó acciones, fecha/hora y usuario (distinto e independiente del Historial del Paciente)."
      resource="/audit-logs"
      exportResource="audit-logs"
      columns={columns}
    />
  );
}

