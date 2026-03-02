'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch, apiFetchBlob } from '@/lib/api';
import type { AuditLogsApiResponse, AuditLogFilters, AuditLogFiltersApiResponse } from '@/types/audit-logs';

// Query Keys
export const auditLogKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...auditLogKeys.lists(), filters] as const,
  filters: () => [...auditLogKeys.all, 'filters'] as const,
};

// API Functions
async function fetchAuditLogs(filters: AuditLogFilters): Promise<AuditLogsApiResponse> {
  const params = new URLSearchParams();
  const dateFrom = `${filters.date}T00:00:00`;
  const dateTo = `${filters.date}T23:59:59`;

  params.append('page', filters.page.toString());
  params.append('page_size', filters.page_size.toString());

  if (filters.search) params.append('search', filters.search);
  if (filters.date) {
    params.append('date_from', dateFrom);
    params.append('date_to', dateTo);
  }
  if (filters.user_id) params.append('user_id', filters.user_id);
  if (filters.action_type) params.append('action_type', filters.action_type);

  return apiFetch<AuditLogsApiResponse>(`/audit-logs/?${params.toString()}`, {
    method: 'GET',
  });
}

// Custom Hooks
/**
 * Hook to fetch audit logs list with pagination and filters
 */
export function useAuditLogs(options?: {
  enabled?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
  date?: string;
  userId?: string;
  actionType?: string;
}) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;
  const search = options?.search ?? '';
  const date = options?.date ?? '';
  const userId = options?.userId && options.userId !== 'all' ? options.userId : undefined;
  const actionType = options?.actionType && options.actionType !== 'all' ? options.actionType : undefined;

  return useQuery({
    queryKey: auditLogKeys.list({
      page,
      pageSize,
      search,
      date,
      userId,
      actionType,
    }),
    queryFn: () =>
      fetchAuditLogs({
        page,
        page_size: pageSize,
        search: search || undefined,
        date: date || undefined,
        user_id: userId,
        action_type: actionType,
      }),
    enabled: options?.enabled ?? true,
  });
}

function extractFilename(contentDisposition: string | null): string {
  const defaultFilename = 'audit-logs-export.xlsx';
  if (!contentDisposition) return defaultFilename;

  const filenameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
  if (!filenameMatch?.[1]) return defaultFilename;

  let filename = filenameMatch[1].replaceAll("'", '').replaceAll('"', '');
  if (filename.startsWith("UTF-8''")) {
    filename = decodeURIComponent(filename.replaceAll("UTF-8''", ''));
  }
  return filename;
}

function downloadBlob(blob: Blob, filename: string): void {
  // eslint-disable-next-line no-undef
  const win = globalThis.window ?? null;
  // eslint-disable-next-line no-undef
  const doc = globalThis.document ?? null;

  if (!win || !doc) {
    throw new Error('Browser environment not available');
  }

  const downloadUrl = win.URL.createObjectURL(blob);
  const link = doc.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  doc.body.appendChild(link);
  link.click();
  link.remove();
  win.URL.revokeObjectURL(downloadUrl);
}

function buildQueryParams(filters: {
  search?: string;
  date_from?: string;
  date_to?: string;
  user_id?: string;
  action_type?: string;
}): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.user_id) params.append('user_id', filters.user_id);
  if (filters.action_type) params.append('action_type', filters.action_type);
  return params;
}

/**
 * Function to export audit logs as a file
 * Uses apiFetchBlob to reuse authentication and error handling logic
 */
async function exportAuditLogs(filters: {
  search?: string;
  date_from?: string;
  date_to?: string;
  user_id?: string;
  action_type?: string;
}): Promise<void> {
  const params = buildQueryParams(filters);
  const queryString = params.toString();
  const url = queryString ? `/audit-logs/export?${queryString}` : '/audit-logs/export';

  const response = await apiFetchBlob(url, {
    method: 'GET',
  });

  const blob = await response.blob();
  const contentDisposition = response.headers.get('Content-Disposition');
  const filename = extractFilename(contentDisposition);
  downloadBlob(blob, filename);
}

/**
 * Hook to export audit logs
 * Uses useMutation for consistency with other mutations in the codebase
 */
export function useExportAuditLogs(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
  date?: string;
  userId?: string;
  actionType?: string;
}) {
  const search = options?.search;
  const date = options?.date;
  const userId = options?.userId;
  const actionType = options?.actionType;

  return useMutation({
    mutationFn: () => {
      const filters: {
        search?: string;
        date_from?: string;
        date_to?: string;
        user_id?: string;
        action_type?: string;
      } = {};

      if (search) {
        filters.search = search;
      }

      if (date) {
        filters.date_from = `${date}T00:00:00`;
        filters.date_to = `${date}T23:59:59`;
      }

      if (userId) {
        filters.user_id = userId;
      }

      if (actionType) {
        filters.action_type = actionType;
      }

      return exportAuditLogs(filters);
    },
  });
}

/**
 * Function to fetch audit logs filters (users and action types)
 */
async function fetchAuditLogsFilters(): Promise<AuditLogFiltersApiResponse> {
  return apiFetch<AuditLogFiltersApiResponse>('/audit-logs/filters', {
    method: 'GET',
  });
}

/**
 * Hook to fetch audit logs filters
 */
export function useAuditLogsFilters() {
  return useQuery({
    queryKey: auditLogKeys.filters(),
    queryFn: fetchAuditLogsFilters,
  });
}
