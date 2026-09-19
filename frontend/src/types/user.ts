export const USER_ROLES = ["admin", "agente", "asistente"] as const;
export type UserRoleValue = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRoleValue, string> = {
  admin: "Administrador",
  agente: "Agente",
  asistente: "Asistente",
};

export interface CrmUser {
  id: number;
  name: string;
  email: string;
  role: UserRoleValue;
  created_at: string;
}

export interface UserCreateValues {
  name: string;
  email: string;
  password: string;
  role: UserRoleValue;
}

export interface UserUpdateValues {
  name: string;
  email: string;
  password?: string;
  role: UserRoleValue;
}
