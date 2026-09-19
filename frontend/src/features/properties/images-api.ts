import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { PropertyImage } from "@/types/property";

export async function uploadPropertyImage(propertyId: number, file: File): Promise<PropertyImage> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ApiSuccessResponse<PropertyImage>>(`/properties/${propertyId}/images`, formData);
  return response.data.data;
}

export async function setPropertyImageCover(propertyId: number, imageId: number): Promise<PropertyImage> {
  const response = await api.patch<ApiSuccessResponse<PropertyImage>>(
    `/properties/${propertyId}/images/${imageId}`,
    { is_cover: true },
  );
  return response.data.data;
}

export async function deletePropertyImage(propertyId: number, imageId: number): Promise<void> {
  await api.delete(`/properties/${propertyId}/images/${imageId}`);
}
