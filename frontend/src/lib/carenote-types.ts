export type EncounterStatus = 'en_proceso' | 'borrador_pendiente' | 'revisada' | 'cerrada';

export type NoteStatus = 'BORRADOR' | 'REVISADA' | 'CERRADA';

export type TemplateType = 'soap' | 'nursing_evolution' | 'procedure' | 'vitals' | 'free_text';

export interface CareEncounter {
  id: number;
  company_id: number;
  patient_id: number;
  professional_id: number;
  appointment_id?: number | null;
  encounter_code: string;
  started_at: string;
  completed_at?: string | null;
  encounter_type: string;
  channel: string;
  status: EncounterStatus;
  notes_summary?: string | null;
  patient?: {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    document_type?: string;
    document_number?: string;
    phone?: string;
    address?: string;
    city?: string;
    health_coverage_provider?: string;
  };
  professional?: {
    id: number;
    name: string;
    email: string;
  };
  clinical_note?: ClinicalNote | null;
  audio_recordings?: AudioRecording[];
  created_at: string;
  updated_at: string;
}

export interface AudioRecording {
  id: number;
  company_id: number;
  care_encounter_id: number;
  telegram_file_id?: string | null;
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  duration_seconds?: number | null;
  sha256_hash?: string | null;
  status: string;
  error_message?: string | null;
  created_at: string;
}

export interface ClinicalNote {
  id: number;
  company_id: number;
  care_encounter_id: number;
  transcript_id?: number | null;
  template_type: TemplateType;
  note_status: NoteStatus;
  title?: string | null;
  summary_text?: string | null;
  structured_content_json?: Record<string, any> | null;
  vitals_json?: {
    heart_rate?: string;
    blood_pressure?: string;
    respiratory_rate?: string;
    temperature?: string;
    spo2?: string;
    glucose?: string;
    [key: string]: any;
  } | null;
  ai_uncertainties_json?: string[] | null;
  confirmed_by_user_id?: number | null;
  confirmed_at?: string | null;
  versions?: NoteVersion[];
  addendums?: NoteAddendum[];
  created_at: string;
  updated_at: string;
}

export interface NoteVersion {
  id: number;
  clinical_note_id: number;
  version_number: number;
  snapshot_json: Record<string, any>;
  changed_by_user_id: number;
  change_type: 'ai_draft' | 'human_edit' | 'confirmation';
  created_at: string;
}

export interface NoteAddendum {
  id: number;
  clinical_note_id: number;
  author_user_id: number;
  addendum_text: string;
  reason: string;
  created_at: string;
}

export interface TelegramLinkStatus {
  is_linked: boolean;
  telegram_username?: string | null;
  linked_at?: string | null;
}

export interface PrivacyAcceptance {
  id: number;
  company_id: number;
  user_id?: number | null;
  telegram_chat_id?: number | null;
  policy_version: string;
  accepted_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
