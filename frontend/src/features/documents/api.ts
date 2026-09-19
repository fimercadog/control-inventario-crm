import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { CrmDocument, DocumentSubjectType } from "@/types/document";

export async function fetchDocuments(subjectType: DocumentSubjectType, subjectId: number): Promise<CrmDocument[]> {
  const response = await api.get<ApiSuccessResponse<CrmDocument[]>>("/documents", {
    params: { subject_type: subjectType, subject_id: subjectId },
  });
  return response.data.data;
}

export async function uploadDocument(
  subjectType: DocumentSubjectType,
  subjectId: number,
  file: File,
): Promise<CrmDocument> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("subject_type", subjectType);
  formData.append("subject_id", String(subjectId));

  const response = await api.post<ApiSuccessResponse<CrmDocument>>("/documents", formData);
  return response.data.data;
}

export async function deleteDocument(id: number): Promise<void> {
  await api.delete(`/documents/${id}`);
}

export async function downloadDocument(id: number, filename: string): Promise<void> {
  const response = await api.get<Blob>(`/documents/${id}/download`, { responseType: "blob" });

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
