export interface Institution {
  id: string;
  name: string;
  short_name: string;
  code: string;
  logo?: string | null;
  primary_email?: string | null;
  primary_phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  tax?: string | null;
  default_language: string;
  default_currency: string;
  default_timezone?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface InstitutionUpdate {
  name?: string | null;
  short_name?: string | null;
  code?: string | null;
  logo?: string | null;
  primary_email?: string | null;
  primary_phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  tax?: string | null;
  default_language?: string | null;
  default_currency?: string | null;
  default_timezone?: string | null;
  description?: string | null;
}
