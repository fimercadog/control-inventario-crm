import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { Owner, OwnerFormValues, OwnerOption } from "@/types/owner";

export async function createOwner(values: OwnerFormValues): Promise<Owner> {
  const response = await api.post<ApiSuccessResponse<Owner>>("/owners", values);
  return response.data.data;
}

export async function updateOwner(id: number, values: OwnerFormValues): Promise<Owner> {
  const response = await api.put<ApiSuccessResponse<Owner>>(`/owners/${id}`, values);
  return response.data.data;
}

export async function deleteOwner(id: number): Promise<void> {
  await api.delete(`/owners/${id}`);
}

export async function fetchOwner(id: number): Promise<Owner> {
  const response = await api.get<ApiSuccessResponse<Owner>>(`/owners/${id}`);
  return response.data.data;
}

export async function fetchOwnerOptions(): Promise<OwnerOption[]> {
  const response = await api.get<ApiSuccessResponse<OwnerOption[]>>("/owners/options");
  return response.data.data;
}
