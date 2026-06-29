export type UserRole = "admin" | "dentist" | "assistant" | "receptionist";
export type Sex = "male" | "female" | "other";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  specialty?: string | null;
  license_number?: string | null;
  signature_url?: string | null;
  is_active: boolean;
}

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  dni: string;
  sex: Sex;
  birth_date: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  occupation?: string | null;
  insurance?: string | null;
  responsible_person?: string | null;
  photo_url?: string | null;
  observations?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientListItem {
  id: number;
  first_name: string;
  last_name: string;
  dni: string;
  phone?: string | null;
  photo_url?: string | null;
}

export interface PaginatedPatients {
  items: PatientListItem[];
  total: number;
  page: number;
  size: number;
}

export type ToothSurface =
  | "vestibular"
  | "lingual"
  | "mesial"
  | "distal"
  | "oclusal"
  | "root"
  | "crown"
  | "whole";

export type ToothCondition =
  | "healthy"
  | "caries"
  | "resin"
  | "endodontics"
  | "crown"
  | "implant"
  | "extraction"
  | "absent"
  | "prosthesis"
  | "sealant"
  | "fracture"
  | "mobility";

export interface OdontogramEntry {
  id: number;
  tooth_fdi: string;
  surface: ToothSurface;
  condition: ToothCondition;
  color?: string | null;
  diagnosis?: string | null;
  treatment_description?: string | null;
  treatment_date?: string | null;
  observations?: string | null;
  dentist_id?: number | null;
  updated_at: string;
}

export interface Odontogram {
  id: number;
  patient_id: number;
  entries: OdontogramEntry[];
}

export interface OdontogramHistoryItem {
  id: number;
  tooth_fdi: string;
  surface: ToothSurface;
  previous_condition?: ToothCondition | null;
  new_condition: ToothCondition;
  change_description?: string | null;
  changed_by_id?: number | null;
  changed_at: string;
}

export interface EntryUpsert {
  tooth_fdi: string;
  surface: ToothSurface;
  condition: ToothCondition;
  color?: string | null;
  diagnosis?: string | null;
  treatment_description?: string | null;
  treatment_date?: string | null;
  observations?: string | null;
}
