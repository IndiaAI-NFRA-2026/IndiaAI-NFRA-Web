import { URL_RETENTION_SETTING, URL_RETENTION_DOCUMENTS } from '@/constants/endpoints';
import api from '../api';
import { RetentionSetting, RetentionDocumentsResponse, RetentionDocumentsFilters } from '@/types/retention-policy';
import { apiFetch } from '@/lib/api';

export async function getRetentionSetting() {
  return api.get(URL_RETENTION_SETTING, {
    method: 'GET',
  });
}

export async function updateRetentionSetting(data: RetentionSetting) {
  return api.put(URL_RETENTION_SETTING, data);
}

export async function getRetentionDocuments(filters: RetentionDocumentsFilters): Promise<RetentionDocumentsResponse> {
  const params = new URLSearchParams();
  params.append('page', (filters.page || 1).toString());
  params.append('page_size', (filters.pageSize || 10).toString());

  if (filters.search) params.append('search', filters.search.trim());
  if (filters.documentType && filters.documentType !== 'all') {
    params.append('document_type', filters.documentType);
  }
  if (filters.uploadedById && filters.uploadedById !== 'all') {
    params.append('uploaded_by', filters.uploadedById);
  }
  if (filters.daysRemaining && filters.daysRemaining !== 'all') {
    params.append('days_remaining', filters.daysRemaining);
  }

  return apiFetch<RetentionDocumentsResponse>(`${URL_RETENTION_DOCUMENTS}?${params.toString()}`, {
    method: 'GET',
  });
}
