'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiFetchBlob } from '@/lib/api';
import { useSearchStore } from '../stores/search-store';
import { vendorKeys } from './use-vendors';
import { vendorDocumentKeys, vendorFilterKeys } from './use-vendor-documents';
import { DocumentType } from '@/enums/document-type';
import type {
  Document,
  DocumentFilters,
  CreateDocumentDto,
  PaginatedDocumentsResponse,
  BatchUploadResponse,
  UploadStatusResponse,
  DocumentDetailResponse,
} from '@/types/documents';
import type { ExtractionAnalysis } from '@/types/analysis';
import type { FraudDetailResponse } from '@/types/fraud-detection';

export type {
  Document,
  DocumentFilters,
  CreateDocumentDto,
  PaginatedDocumentsResponse,
  BatchUploadResponse,
  UploadStatusResponse,
  DocumentDetailResponse,
} from '@/types/documents';

// Query Keys - manage query keys in one place
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
};

// API Functions
async function fetchDocuments(filters: DocumentFilters): Promise<PaginatedDocumentsResponse> {
  const params = new URLSearchParams();
  params.append('page', filters.page.toString());
  params.append('page_size', filters.pageSize.toString());
  if (filters.search) params.append('search', filters.search.trim().toLowerCase());
  if (filters.status) params.append('status', filters.status);
  if (filters.type) params.append('type', filters.type);
  if (filters.uploadDate) params.append('uploadDate', filters.uploadDate);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  return apiFetch<PaginatedDocumentsResponse>(`/documents/?${params.toString()}`, {
    method: 'GET',
  });
}

async function fetchUploadDocumentById(id: string): Promise<DocumentDetailResponse> {
  return apiFetch<DocumentDetailResponse>(`/upload-document/${id}`);
}

async function fetchDocumentById(id: string): Promise<Document> {
  return apiFetch<Document>(`/documents/${id}`);
}

async function fetchDocumentDetailById(
  id: string,
  tab?: string,
  include_analysis?: boolean,
  include_fraud_transactions?: boolean
): Promise<DocumentDetailResponse> {
  const params = new URLSearchParams();
  if (tab) {
    params.append('tab', tab);
  }
  if (include_analysis) {
    params.append('include_analysis', 'true');
  }
  if (include_fraud_transactions) {
    params.append('include_fraud_transactions', 'true');
  }
  const queryString = params.toString();
  const url = queryString ? `/documents/${id}?${queryString}` : `/documents/${id}`;
  return apiFetch<DocumentDetailResponse>(url, {
    method: 'GET',
  });
}

async function createDocument(data: CreateDocumentDto): Promise<Document> {
  return apiFetch<Document>('/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function updateDocument(id: string, data: Partial<Document>): Promise<Document> {
  return apiFetch<Document>(`/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

async function deleteDocument(id: string, type?: string): Promise<void> {
  const params = new URLSearchParams();
  if (type) {
    params.append('type', type);
  }
  const queryString = params.toString();
  const url = queryString ? `/documents/${id}?${queryString}` : `/documents/${id}`;
  return apiFetch<void>(url, {
    method: 'DELETE',
  });
}

export interface RetryDocumentResponse {
  message: string;
  document_id: string;
  status: string;
}

async function retryDocument(id: string): Promise<RetryDocumentResponse> {
  return apiFetch<RetryDocumentResponse>(`/upload-document/${id}/retry`, {
    method: 'POST',
  });
}

async function overwriteDocument(
  id: string,
  data: Partial<DocumentDetailResponse>,
  type?: 'approve' | 'update'
): Promise<{ analysis_id: string; approved_document_id: string }> {
  const endpoint = type === 'approve' ? `/upload-document/${id}/approve` : `/documents/${id}/update`;
  return apiFetch<{ analysis_id: string; approved_document_id: string }>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export interface ZipFileInfo {
  file: File;
  hasPassword: boolean;
  password: string;
}

async function batchUploadDocuments(files: File[], zipFileInfos?: ZipFileInfo[]): Promise<BatchUploadResponse> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  if (zipFileInfos && zipFileInfos.length > 0) {
    const zipPasswords: Record<string, string> = {};
    for (const zipInfo of zipFileInfos) {
      // Only add files that have password set
      if (zipInfo.hasPassword && zipInfo.password?.trim()) {
        zipPasswords[zipInfo.file.name] = zipInfo.password;
      }
    }

    if (Object.keys(zipPasswords).length > 0) {
      formData.append('zip_passwords', JSON.stringify(zipPasswords));
    }
  }

  return apiFetch<BatchUploadResponse>('/upload-document', {
    method: 'POST',
    body: formData,
  });
}

export async function fetchUploadStatus(documentIds: string[]): Promise<UploadStatusResponse> {
  if (documentIds.length === 0) {
    return {
      total_documents: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      progress_percentage: 0,
      documents: [],
    };
  }
  const params = new URLSearchParams();
  params.append('document_ids', documentIds.join(', '));
  return apiFetch<UploadStatusResponse>(`/upload-document/upload-status?${params.toString()}`, {
    method: 'GET',
  });
}

// Custom Hooks

/**
 * Hook to fetch documents list
 * @param options - Options for query (enabled, staleTime, etc.)
 */
export function useDocuments(options?: { enabled?: boolean }) {
  const { search, status, type, uploadDate, page, pageSize, sortBy, sortOrder } = useSearchStore();
  return useQuery({
    queryKey: documentKeys.list({
      search,
      status,
      type,
      uploadDate,
      page,
      pageSize,
      sortBy,
      sortOrder,
    }),
    queryFn: () =>
      fetchDocuments({
        search,
        status,
        type,
        uploadDate,
        page,
        pageSize,
        sortBy,
        sortOrder,
      }),
    enabled: options?.enabled,
    // staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
  });
}

/**
 * Hook to fetch a document by ID
 */
export function useDocument(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => fetchDocumentById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Hook to fetch document detail with full information including extraction
 */
export function useUploadDocumentDetail(
  id: string,
  options?: {
    enabled?: boolean;
    include_analysis?: boolean;
    include_fraud_transactions?: boolean;
    refetchInterval?: number | false | ((query: { state: { data: DocumentDetailResponse | undefined } }) => number | false);
  }
) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => fetchUploadDocumentById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Hook to fetch document detail with full information including extraction
 */
export function useDocumentDetail(
  id: string,
  tab: DocumentType,
  options?: {
    enabled?: boolean;
    include_analysis?: boolean;
    include_fraud_transactions?: boolean;
    refetchInterval?: number | false | ((query: { state: { data: DocumentDetailResponse | undefined } }) => number | false);
  }
) {
  const include_analysis = options?.include_analysis;
  const include_fraud_transactions = options?.include_fraud_transactions;
  return useQuery({
    queryKey: [
      ...documentKeys.detail(id),
      'detail',
      tab,
      ...(include_analysis ? ['include_analysis'] : []),
      ...(include_fraud_transactions ? ['include_fraud_transactions'] : []),
    ],
    queryFn: () => fetchDocumentDetailById(id, String(tab), include_analysis, include_fraud_transactions),
    enabled: !!id && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: false,
  });
}

/**
 * Hook to create a new document
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      // Invalidate and refetch documents list after successful creation
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });

      // Or update cache directly (optimistic update)
      // queryClient.setQueryData(documentKeys.lists(), (old: Document[] = []) => [
      //   ...old,
      //   newDocument,
      // ]);
    },
    // Error handling is done at the component level with toast
  });
}

/**
 * Hook to update a document
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Document> }) => updateDocument(id, data),
    onSuccess: (updatedDocument, variables) => {
      // Update cache for specific document
      queryClient.setQueryData(documentKeys.detail(variables.id), updatedDocument);

      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

/**
 * Hook to delete a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, type }: { id: string; type?: string }) => deleteDocument(id, type),
    onSuccess: (_, variables) => {
      const deletedId = variables.id;
      // Remove document from cache
      queryClient.removeQueries({ queryKey: documentKeys.detail(deletedId) });

      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });

      // Invalidate processing queue to refetch
      queryClient.invalidateQueries({ queryKey: ['processing-queue'] });

      // Invalidate vendor documents to refetch
      queryClient.invalidateQueries({ queryKey: ['vendor-documents'] });

      // Invalidate vendor filter to refetch periods
      queryClient.invalidateQueries({ queryKey: vendorFilterKeys.all });

      // Invalidate vendors to refetch (in case total counts change)
      // Use vendorKeys.all to invalidate all vendor queries
      queryClient.invalidateQueries({
        queryKey: vendorKeys.all,
        refetchType: 'active',
      });

      // Force refetch upload-document list first page (page=1&page_size=10)
      queryClient.refetchQueries({
        queryKey: vendorKeys.list({ page: 1, pageSize: 10, search: '' }),
        type: 'all',
      });
    },
  });
}

/**
 * Hook to batch upload documents
 */
export function useBatchUploadDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ files, zipFileInfos }: { files: File[]; zipFileInfos?: ZipFileInfo[] }) => batchUploadDocuments(files, zipFileInfos),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['processing-queue'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

/**
 * Hook to retry a failed document
 */
export function useRetryDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryDocument,
    onSuccess: (response) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['processing-queue'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(response.document_id),
      });
    },
  });
}

/**
 * Hook to overwrite document extraction data
 */
export function useApproveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, type }: { id: string; data: Partial<DocumentDetailResponse>; type?: 'approve' | 'update' }) =>
      overwriteDocument(id, data, type),
    onSuccess: (updatedDocument, variables) => {
      // Update cache for specific document
      queryClient.setQueryData(documentKeys.detail(variables.id), updatedDocument);
      queryClient.setQueryData([...documentKeys.detail(variables.id), 'detail'], updatedDocument);

      // Invalidate all related queries to refresh data
      // Invalidate document lists (including type=COMBINED)
      queryClient.invalidateQueries({
        queryKey: documentKeys.lists(),
        refetchType: 'all',
      });

      // Invalidate vendor documents to refresh upload-history/vendor page
      queryClient.invalidateQueries({
        queryKey: vendorDocumentKeys.all,
        refetchType: 'active',
      });

      // Invalidate vendors to refresh financial-statement page
      queryClient.invalidateQueries({
        queryKey: vendorKeys.all,
        refetchType: 'active',
      });

      // Invalidate document detail to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(variables.id),
        refetchType: 'active',
      });
    },
  });
}

/**
 * API function to update document analysis
 */
async function updateDocumentAnalysis(id: string, data: ExtractionAnalysis): Promise<DocumentDetailResponse> {
  return apiFetch<DocumentDetailResponse>(`/documents/${id}/analysis`, {
    method: 'PUT',
    body: JSON.stringify({ analysis: data }),
  });
}

/**
 * Hook to update document analysis
 */
export function useUpdateDocumentAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExtractionAnalysis }) => updateDocumentAnalysis(id, data),
    onSuccess: (updatedDocument, variables) => {
      queryClient.setQueryData(documentKeys.detail(variables.id), updatedDocument);
      queryClient.setQueryData([...documentKeys.detail(variables.id), 'detail'], updatedDocument);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(variables.id),
        refetchType: 'active',
      });

      // Invalidate all decision-review queries to refresh decision review list and detail
      // This will reload:
      // - /decision-review/list/{vendorName}?page=1&page_size=10
      // - /decision-review/{decisionReviewId}
      queryClient.invalidateQueries({
        queryKey: ['decision-review'],
        refetchType: 'active',
      });

      // Invalidate vendor list to refresh /documents?type=FINANCIAL_STATEMENT&hasDecisionReview=true
      // This ensures the decision review page shows updated data after analysis update
      queryClient.invalidateQueries({
        queryKey: vendorKeys.all,
        refetchType: 'active',
      });

      // Invalidate vendor documents to refresh /documents/by-vendor?...
      // This ensures the vendor documents list shows updated data after analysis update
      queryClient.invalidateQueries({
        queryKey: vendorDocumentKeys.all,
        refetchType: 'active',
      });
    },
  });
}

/**
 * API function to update bank analysis
 */
async function updateBankAnalysis(id: string, analysis: ExtractionAnalysis): Promise<DocumentDetailResponse> {
  return apiFetch<DocumentDetailResponse>(`/documents/${id}/bank-analysis`, {
    method: 'PUT',
    body: JSON.stringify({ analysis }),
  });
}

/**
 * Hook to update bank analysis
 */
export function useUpdateBankAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, analysis }: { id: string; analysis: ExtractionAnalysis }) => updateBankAnalysis(id, analysis),
    onSuccess: (updatedDocument, variables) => {
      queryClient.setQueryData(documentKeys.detail(variables.id), updatedDocument);
      queryClient.setQueryData([...documentKeys.detail(variables.id), 'detail'], updatedDocument);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(variables.id),
        refetchType: 'active',
      });
    },
  });
}

/**
 * API function to retry document analysis
 */
async function retryDocumentAnalysis(id: string): Promise<{ message: string; document_id: string }> {
  return apiFetch<{ message: string; document_id: string }>(`/documents/${id}/retry-analysis`, {
    method: 'POST',
  });
}

/**
 * Hook to retry document analysis
 */
export function useRetryDocumentAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryDocumentAnalysis,
    onSuccess: (response, documentId) => {
      // Invalidate document detail queries to refresh data
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(documentId),
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: [...documentKeys.detail(documentId), 'detail'],
        refetchType: 'active',
      });
    },
  });
}

// Fraud Transaction API Functions
interface UpdateFraudTransactionRequest {
  reason: string;
  status: 'false_positive' | 'fraud';
}

async function updateFraudTransaction(
  fraudTransactionId: string,
  data: UpdateFraudTransactionRequest
): Promise<{ success: boolean; message?: string }> {
  return apiFetch<{ success: boolean; message?: string }>(`/fraud_transactions/${fraudTransactionId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Query Keys for Fraud Detection Detail
export const fraudDetectionDetailKeys = {
  all: ['fraud-detection-detail'] as const,
  detail: (documentId: string) => [...fraudDetectionDetailKeys.all, 'detail', documentId] as const,
};

/**
 * API function to fetch fraud detection detail by document ID
 */
async function fetchFraudDetectionDetail(documentId: string): Promise<FraudDetailResponse> {
  return apiFetch<FraudDetailResponse>(`/fraud-detection/${documentId}`, {
    method: 'GET',
  });
}

/**
 * Hook to fetch fraud detection detail by document ID
 */
export function useFraudDetectionDetail(documentId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: fraudDetectionDetailKeys.detail(documentId || ''),
    queryFn: () => fetchFraudDetectionDetail(documentId!),
    enabled: !!documentId && (options?.enabled ?? true),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to update fraud transaction status
 */
export function useUpdateFraudTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fraudTransactionId, data }: { fraudTransactionId: string; data: UpdateFraudTransactionRequest }) =>
      updateFraudTransaction(fraudTransactionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.details(),
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey.includes('include_fraud_transactions');
        },
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: fraudDetectionDetailKeys.all,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['fraud-detection'],
        refetchType: 'active',
      });
    },
  });
}

/**
 * Function to export document report as a file
 * Uses apiFetchBlob to reuse authentication and error handling logic
 */
async function exportDocumentReport(documentId: string, fileName?: string): Promise<void> {
  const url = `/documents/${documentId}/export-report`;

  const response = await apiFetchBlob(url, {
    method: 'GET',
  });

  const blob = await response.blob();

  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `document-${documentId}-report.pdf`;

  // Priority: 1. fileName parameter, 2. Content-Disposition header, 3. default
  if (fileName) {
    // Use provided fileName, ensure it has .pdf extension
    filename = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  } else if (contentDisposition) {
    const filenameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      filename = filenameMatch[1].replaceAll("'", '').replaceAll('"', '');
      if (filename.startsWith("UTF-8''")) {
        filename = decodeURIComponent(filename.replaceAll("UTF-8''", ''));
      }
    }
  }

  const win = globalThis.window ?? null;

  const doc = globalThis.document ?? null;

  if (win === null || doc === null) {
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

/**
 * Hook to export document report
 * Uses useMutation for consistency with other mutations in the codebase
 */
export function useExportDocumentReport() {
  return useMutation({
    mutationFn: ({ documentId, fileName }: { documentId: string; fileName?: string }) => exportDocumentReport(documentId, fileName),
  });
}

/**
 * API function to check analysis status
 */
async function checkAnalysisStatus(analysisId: string): Promise<boolean> {
  return apiFetch<boolean>(`/analyze/${analysisId}/status`, {
    method: 'GET',
  });
}

/**
 * Hook to check analysis status with polling
 */
export function useAnalysisStatus(
  analysisId: string | null | undefined,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false | ((query: { state: { data: boolean | undefined } }) => number | false);
  }
) {
  return useQuery({
    queryKey: ['analyze', 'analysis-status', analysisId],
    queryFn: () => checkAnalysisStatus(analysisId!),
    enabled: !!analysisId && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: false,
  });
}
