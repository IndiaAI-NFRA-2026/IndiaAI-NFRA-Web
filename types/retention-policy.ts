export interface RetentionSetting {
  institutional_id: string;
  uploaded_documents_retention_days: number | null;
  derived_data_retention_days: number | null;
  audit_logs_retention_days: number | null;
  enable_automatic_deletion: boolean;
}

export interface RetentionDocument {
  id: string | number;
  file_name: string;
  document_type: string;
  vendor_name?: string;
  uploaded_by: string;
  uploaded_by_id: string;
  date_upload: string;
  auto_deletion_schedule: string;
  days_remaining: number;
  source?: string;
  created_at?: string;
  created_by?: string;
}

export interface RetentionUser {
  id: string;
  username: string;
  full_name: string;
}

export interface RetentionDocumentsResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  documents: RetentionDocument[];
  users?: RetentionUser[];
  uploaded_documents_retention_days: number;
  derived_data_retention_days: number;
}

export interface RetentionDocumentsFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  documentType?: string;
  uploadedById?: string; // User ID for filtering
  daysRemaining?: string;
}
