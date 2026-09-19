import type { UserRoleValue } from "@/types/user";

export interface Agent {
  id: number;
  name: string;
  email: string;
  role: UserRoleValue;
  properties_count: number;
  open_opportunities_count: number;
  pending_tasks_count: number;
}
