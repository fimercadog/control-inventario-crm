export type DocumentSubjectType = "client" | "lead" | "opportunity" | "property" | "owner";

export interface CrmDocument {
  id: number;
  name: string;
  mime_type: string;
  size: number;
  uploaded_by: string | null;
  created_at: string;
}
