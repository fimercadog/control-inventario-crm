export const TASK_STATUSES = ["pendiente", "en_progreso", "completada", "cancelada"] as const;
export type TaskStatusValue = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatusValue, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
  cancelada: "Cancelada",
};

export interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatusValue;
  agent: { id: number; name: string } | null;
  agent_id: number | null;
  subject_type: string | null;
  subject_id: number | null;
  created_at: string;
  updated_at: string;
}
