import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { Client, ClientOption } from "@/types/client";
import type { ClientFormOutput } from "@/features/clients/client-form-schema";

export async function createClient(values: ClientFormOutput): Promise<Client> {
  const response = await api.post<ApiSuccessResponse<Client>>("/clients", values);
  return response.data.data;
}

export async function updateClient(id: number, values: ClientFormOutput): Promise<Client> {
  const response = await api.put<ApiSuccessResponse<Client>>(`/clients/${id}`, values);
  return response.data.data;
}

export async function deleteClient(id: number): Promise<void> {
  await api.delete(`/clients/${id}`);
}

export async function fetchClient(id: number): Promise<Client> {
  const response = await api.get<ApiSuccessResponse<Client>>(`/clients/${id}`);
  return response.data.data;
}

export async function fetchClientOptions(): Promise<ClientOption[]> {
  const response = await api.get<ApiSuccessResponse<ClientOption[]>>("/clients/options");
  return response.data.data;
}
