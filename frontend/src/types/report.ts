export interface PropertiesByStatusRow {
  status: string;
  count: number;
  total_value: number;
}

export interface ClosingsByPeriodRow {
  period: string;
  won_count: number;
  lost_count: number;
  won_value: number;
}

export interface AgentPerformanceRow {
  agent: string;
  properties_count: number;
  closed_count: number;
  closed_value: number;
  pending_tasks_count: number;
}

export interface PropertiesByAgentStatusRow {
  agent: string;
  borrador: number;
  disponible: number;
  reservado: number;
  vendido: number;
  arrendado: number;
  inactivo: number;
}
