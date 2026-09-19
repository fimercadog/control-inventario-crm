import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { Property, PropertyFormValues, PropertyOption } from "@/types/property";

export async function createProperty(values: PropertyFormValues): Promise<Property> {
  const response = await api.post<ApiSuccessResponse<Property>>("/properties", values);
  return response.data.data;
}

export async function updateProperty(id: number, values: PropertyFormValues): Promise<Property> {
  const response = await api.put<ApiSuccessResponse<Property>>(`/properties/${id}`, values);
  return response.data.data;
}

export async function deleteProperty(id: number): Promise<void> {
  await api.delete(`/properties/${id}`);
}

export async function fetchProperty(id: number): Promise<Property> {
  const response = await api.get<ApiSuccessResponse<Property>>(`/properties/${id}`);
  return response.data.data;
}

export async function fetchPropertyOptions(): Promise<PropertyOption[]> {
  const response = await api.get<ApiSuccessResponse<PropertyOption[]>>("/properties/options");
  return response.data.data;
}
