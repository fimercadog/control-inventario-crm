import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { Opportunity } from "@/types/opportunity";
import type { OpportunityFormOutput } from "@/features/opportunities/opportunity-form-schema";

export async function createOpportunity(values: OpportunityFormOutput): Promise<Opportunity> {
  const response = await api.post<ApiSuccessResponse<Opportunity>>("/opportunities", values);
  return response.data.data;
}

export async function updateOpportunity(id: number, values: OpportunityFormOutput): Promise<Opportunity> {
  const response = await api.put<ApiSuccessResponse<Opportunity>>(`/opportunities/${id}`, values);
  return response.data.data;
}

export async function deleteOpportunity(id: number): Promise<void> {
  await api.delete(`/opportunities/${id}`);
}

export async function fetchOpportunity(id: number): Promise<Opportunity> {
  const response = await api.get<ApiSuccessResponse<Opportunity>>(`/opportunities/${id}`);
  return response.data.data;
}
