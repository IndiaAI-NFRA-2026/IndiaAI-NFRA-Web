import { DocumentStatus } from '@/enums';
import { DocumentType } from '@/enums/document-type';

export interface DocumentUpload {
  id: number | string;
  file_name: string;
  type: DocumentType;
  status: DocumentStatus;
  period: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  is_uploader?: boolean;
}
