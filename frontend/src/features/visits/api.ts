import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { Visit } from "@/types/visit";
import type { VisitFormOutput } from "@/features/visits/visit-form-schema";

export async function createVisit(values: VisitFormOutput): Promise<Visit> {
  const response = await api.post<ApiSuccessResponse<Visit>>("/visits", values);
  return response.data.data;
}

export async function updateVisit(id: number, values: VisitFormOutput): Promise<Visit> {
  const response = await api.put<ApiSuccessResponse<Visit>>(`/visits/${id}`, values);
  return response.data.data;
}

export async function deleteVisit(id: number): Promise<void> {
  await api.delete(`/visits/${id}`);
}

export async function fetchVisit(id: number): Promise<Visit> {
  const response = await api.get<ApiSuccessResponse<Visit>>(`/visits/${id}`);
  return response.data.data;
}
