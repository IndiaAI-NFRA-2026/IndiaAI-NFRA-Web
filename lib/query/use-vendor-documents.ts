'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiFetchBlob } from '@/lib/api';
import { useSearchStore } from '../stores/search-store';
import type { Document, PaginatedDocumentsResponse, DocumentResponse, VendorDocumentsApiResponse } from '@/types/documents';
import type {
  ConsolidatedAnalysisApiResponse,
  AnalyzeDetailApiResponse,
  CombinedAnalysisApiResponse,
  CombinedAnalysisDetailApiResponse,
  CombinedAnalysisDetail,
} from '@/types/analysis';
import { DocumentStatus } from '@/enums';

export type { DocumentResponse, VendorDocumentsApiResponse, VendorDocumentFilters } from '@/types/documents';

/**
 * Transform API response to Document format
 */
function transformDocument(doc: DocumentResponse): Document {
  return {
    id: doc.id,
    fileName: doc.file_name,
    type: doc.type || '-',
    status: doc.status as DocumentStatus,
    uploadDate: doc.updated_at || '',
    period: doc.period || undefined,
    createdAt: doc.created_at,
    createdBy: doc.created_by,
    is_uploader: doc.is_uploader || false,
    fraud_detection: doc.fraud_detection ?? 0,
  };
}

// Query Keys
export const vendorDocumentKeys = {
  all: ['vendor-documents'] as const,
  lists: () => [...vendorDocumentKeys.all, 'list'] as const,
  list: (vendorName: string, filters: Record<string, unknown>) => [...vendorDocumentKeys.lists(), vendorName, filters] as const,
};

// API Functions
async function fetchVendorDocuments(
  vendorName: string,
  options?: {
    tab?: string;
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    type?: string;
    uploadDate?: string;
    period?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    include_fraud_transactions?: boolean;
  }
): Promise<PaginatedDocumentsResponse> {
  const params = new URLSearchParams();
  params.append('vendor_name', vendorName);
  if (options?.tab) params.append('tab', options.tab);
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 100;

  params.append('page', page.toString());
  params.append('page_size', pageSize.toString());

  if (options?.search) params.append('search', options.search.trim().toLowerCase());
  if (options?.status) params.append('status', options.status);
  if (options?.type) params.append('document_type', options.type);
  if (options?.uploadDate) {
    params.append('date_from', `${options.uploadDate}T00:00:00`);
    params.append('date_to', `${options.uploadDate}T23:59:59`);
  }
  if (options?.period) params.append('fy_period', options.period);
  if (options?.sortBy) params.append('sortBy', options.sortBy);
  if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
  if (options?.include_fraud_transactions) params.append('include_fraud_transactions', options.include_fraud_transactions.toString());

  const response = await apiFetch<VendorDocumentsApiResponse>(`/documents/by-vendor/?${params.toString()}`, {
    method: 'GET',
  });

  // Transform API response to Document format
  return {
    ...response,
    total_documents: response.total_documents,
    documents: response.documents.map(transformDocument),
  };
}

// Custom Hooks
/**
 * Hook to fetch documents for a specific vendor by vendor_name
 */
export function useVendorDocuments(
  vendorName: string | null,
  options?: {
    enabled?: boolean;
    tab?: string;
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    type?: string;
    uploadDate?: string;
    period?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    include_fraud_transactions?: boolean;
  }
) {
  // Get filters from store, but allow override via options
  const storeFilters = useSearchStore();
  const {
    page = storeFilters.page,
    tab = storeFilters.tab,
    pageSize = storeFilters.pageSize,
    search = storeFilters.search,
    status = storeFilters.status,
    type = storeFilters.type,
    uploadDate = storeFilters.uploadDate,
    period,
    sortBy = storeFilters.sortBy,
    sortOrder = storeFilters.sortOrder,
    include_fraud_transactions = false,
  } = options || {};

  return useQuery({
    queryKey: vendorDocumentKeys.list(vendorName || '', {
      page,
      pageSize,
      search,
      status,
      type,
      uploadDate,
      period,
      sortBy,
      sortOrder,
      tab,
      include_fraud_transactions,
    }),
    queryFn: () =>
      fetchVendorDocuments(vendorName!, {
        page,
        pageSize,
        search,
        status,
        type,
        uploadDate,
        period,
        sortBy,
        sortOrder,
        tab,
        include_fraud_transactions,
      }),
    enabled: !!vendorName && (options?.enabled ?? true),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

// Query Keys for Consolidated Analysis
export const consolidatedAnalysisKeys = {
  all: ['consolidated-analysis'] as const,
  lists: () => [...consolidatedAnalysisKeys.all, 'list'] as const,
  list: (vendorName: string, filters: Record<string, unknown>) => [...consolidatedAnalysisKeys.lists(), vendorName, filters] as const,
};

// Query Keys for Combined Analysis
export const combinedAnalysisKeys = {
  all: ['combined-analysis'] as const,
  lists: () => [...combinedAnalysisKeys.all, 'list'] as const,
  list: (vendorName: string, filters: Record<string, unknown>) => [...combinedAnalysisKeys.lists(), vendorName, filters] as const,
};

// Query Keys for Combined Analysis FY Periods
export const combinedAnalysisFyPeriodsKeys = {
  all: ['combined-analysis-fy-periods'] as const,
  list: (vendorName?: string | null) => [...combinedAnalysisFyPeriodsKeys.all, 'list', vendorName] as const,
};

// API Functions for Consolidated Analysis
async function fetchConsolidatedAnalysis(
  vendorName: string,
  options?: {
    page?: number;
    pageSize?: number;
    search?: string;
    createdAt?: string;
    fy?: string;
  }
): Promise<PaginatedDocumentsResponse> {
  const params = new URLSearchParams();

  const page = options?.page || 1;
  const pageSize = options?.pageSize || 10;

  params.append('page', page.toString());
  params.append('page_size', pageSize.toString());

  if (options?.search?.trim()) params.append('search', options.search.trim());
  if (vendorName) params.append('vendor_name', vendorName);
  if (options?.createdAt) {
    params.append('date_from', `${options.createdAt}T00:00:00`);
    params.append('date_to', `${options.createdAt}T23:59:59`);
  }
  if (options?.fy && options.fy !== 'all') {
    params.append('fy_period', options.fy);
  }

  const response = await apiFetch<ConsolidatedAnalysisApiResponse>(`/analyze?${params.toString()}`, {
    method: 'GET',
  });

  // Transform API response to Document format
  return {
    total: response.total,
    page: response.page,
    page_size: response.page_size,
    total_pages: Math.ceil(response.total / response.page_size),
    total_documents: response.total_documents,
    documents: response.items.map((doc: any) => ({
      id: doc.id,
      fileName: doc.name,
      fyPeriod: doc.fy_period,
      currency: doc.currency,
      type: doc.type,
      status: doc.status,
      uploadDate: doc.upload_date,
      analyzeError: doc.analyze_error,
      createdBy: doc.created_by,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    })),
  };
}

/**
 * Hook to fetch consolidated analysis documents from /analyze endpoint
 */
export function useConsolidatedAnalysis(
  vendorName: string | null,
  options?: {
    enabled?: boolean;
    page?: number;
    pageSize?: number;
    search?: string;
    createdAt?: string;
    fy?: string;
  }
) {
  return useQuery({
    queryKey: consolidatedAnalysisKeys.list(vendorName || '', {
      page: options?.page,
      pageSize: options?.pageSize,
      search: options?.search,
      createdAt: options?.createdAt,
      fy: options?.fy,
    }),
    queryFn: () =>
      fetchConsolidatedAnalysis(vendorName!, {
        page: options?.page,
        pageSize: options?.pageSize,
        search: options?.search,
        createdAt: options?.createdAt,
        fy: options?.fy,
      }),
    enabled: !!vendorName && (options?.enabled ?? true),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      // Poll every 3 seconds if there are items without fyPeriod
      const data = query.state.data;
      if (data?.documents?.length) {
        const hasItemsWithoutFyPeriod = data.documents.some(
          (doc: any) => !doc.fyPeriod || (typeof doc.fyPeriod === 'string' && doc.fyPeriod.trim() === '')
        );
        return hasItemsWithoutFyPeriod ? 3000 : false;
      }
      return false;
    },
    refetchIntervalInBackground: false,
  });
}

/**
 * API function to create consolidated analysis
 */
async function createConsolidatedAnalysis(dataPayload: {
  vendor_name: string;
  document_ids: string[];
}): Promise<{ message: string; success: boolean }> {
  return apiFetch<{ message: string; success: boolean }>('/analyze', {
    method: 'POST',
    body: JSON.stringify(dataPayload),
  });
}

/**
 * Hook to create consolidated analysis
 */
export function useCreateConsolidatedAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConsolidatedAnalysis,
    onSuccess: () => {
      // Invalidate consolidated analysis queries to refetch data
      queryClient.invalidateQueries({
        queryKey: consolidatedAnalysisKeys.all,
      });
    },
  });
}

/**
 * API function to delete consolidated analysis
 */
async function deleteConsolidatedAnalysis(analyzeId: string): Promise<{ message: string; success: boolean }> {
  return apiFetch<{ message: string; success: boolean }>(`/analyze/${analyzeId}`, {
    method: 'DELETE',
  });
}

/**
 * Hook to delete consolidated analysis
 */
export function useDeleteConsolidatedAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConsolidatedAnalysis,
    onSuccess: () => {
      // Invalidate consolidated analysis queries to refetch data
      queryClient.invalidateQueries({
        queryKey: consolidatedAnalysisKeys.all,
      });

      // Invalidate analyze FY periods to reload filter options
      queryClient.invalidateQueries({
        queryKey: analyzeFyPeriodsKeys.all,
        refetchType: 'active',
      });
    },
  });
}

// API Response type for vendor filter endpoint
export interface VendorFilterApiResponse {
  periods: string[];
}

// API Response type for analyze fy-periods endpoint
export interface AnalyzeFyPeriodsApiResponse {
  periods: string[];
}

// Query Keys for Vendor Filter
export const vendorFilterKeys = {
  all: ['vendor-filter'] as const,
  list: (vendorName: string) => [...vendorFilterKeys.all, 'list', vendorName] as const,
};

// Query Keys for Analyze FY Periods
export const analyzeFyPeriodsKeys = {
  all: ['analyze-fy-periods'] as const,
  list: (vendorName?: string | null) => [...analyzeFyPeriodsKeys.all, 'list', vendorName] as const,
};

/**
 * API function to fetch vendor filter options (periods)
 */
async function fetchVendorFilter(vendorName: string): Promise<VendorFilterApiResponse> {
  const params = new URLSearchParams();
  params.append('vendor_name', vendorName);

  return apiFetch<VendorFilterApiResponse>(`/documents/by-vendor/filter?${params.toString()}`, {
    method: 'GET',
  });
}

/**
 * Hook to fetch vendor filter options (periods for FY dropdown)
 */
export function useVendorFilter(vendorName: string | null) {
  return useQuery({
    queryKey: vendorFilterKeys.list(vendorName || ''),
    queryFn: () => fetchVendorFilter(vendorName!),
    enabled: !!vendorName,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * API function to fetch analyze FY periods
 */
async function fetchAnalyzeFyPeriods(vendorName: string): Promise<AnalyzeFyPeriodsApiResponse> {
  const params = new URLSearchParams();
  params.append('vendor_name', vendorName);
  return apiFetch<AnalyzeFyPeriodsApiResponse>(`/analyze/fy-periods?${params.toString()}`, {
    method: 'GET',
  });
}

/**
 * Hook to fetch analyze FY periods for consolidated analysis filter
 */
export function useAnalyzeFyPeriods(vendorName: string | null) {
  return useQuery({
    queryKey: analyzeFyPeriodsKeys.list(vendorName),
    queryFn: () => fetchAnalyzeFyPeriods(vendorName!),
    enabled: !!vendorName,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

// Query Keys for Analyze Detail
export const analyzeDetailKeys = {
  all: ['analyze-detail'] as const,
  detail: (analyzeId: string) => [...analyzeDetailKeys.all, 'detail', analyzeId] as const,
};

/**
 * API function to fetch analyze detail
 */
async function fetchAnalyzeDetail(analyzeId: string): Promise<AnalyzeDetailApiResponse> {
  return apiFetch<AnalyzeDetailApiResponse>(`/analyze/${analyzeId}`, {
    method: 'GET',
  });
}

/**
 * Hook to fetch analyze detail
 */
export function useAnalyzeDetail(analyzeId: string | null) {
  return useQuery({
    queryKey: analyzeDetailKeys.detail(analyzeId || ''),
    queryFn: () => fetchAnalyzeDetail(analyzeId!),
    enabled: !!analyzeId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.analyze_error || !data.results || data.results === null)) {
        return 3000;
      }
      return false;
    },
  });
}

/**
 * API function to update analyze detail results
 */
async function updateAnalyzeDetailResults(
  analyzeId: string,
  results: AnalyzeDetailApiResponse['results']
): Promise<AnalyzeDetailApiResponse> {
  return apiFetch<AnalyzeDetailApiResponse>(`/analyze/${analyzeId}`, {
    method: 'PATCH',
    body: JSON.stringify(results),
  });
}

/**
 * Hook to update analyze detail results
 */
export function useUpdateAnalyzeDetailResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ analyzeId, results }: { analyzeId: string; results: AnalyzeDetailApiResponse['results'] }) =>
      updateAnalyzeDetailResults(analyzeId, results),
    onSuccess: (_, variables) => {
      // Invalidate the analyze detail query to refresh the data
      queryClient.invalidateQueries({
        queryKey: analyzeDetailKeys.detail(variables.analyzeId),
      });

      // Invalidate consolidated analysis list to refresh /analyze?...
      // This ensures the consolidated analysis list shows updated data after results update
      queryClient.invalidateQueries({
        queryKey: consolidatedAnalysisKeys.all,
        refetchType: 'active',
      });
    },
  });
}

/**
 * Function to export analyze report as a file
 * Uses apiFetchBlob to reuse authentication and error handling logic
 */
async function exportAnalyzeReport(analyzeId: string): Promise<void> {
  const url = `/analyze/${analyzeId}/export-report`;

  const response = await apiFetchBlob(url, {
    method: 'GET',
  });

  const blob = await response.blob();

  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `analyze-${analyzeId}-report.pdf`;
  if (contentDisposition) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const filenameMatch = filenameRegex.exec(contentDisposition);
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
 * Hook to export analyze report
 * Uses useMutation for consistency with other mutations in the codebase
 */
export function useExportAnalyzeReport() {
  return useMutation({
    mutationFn: (analyzeId: string) => exportAnalyzeReport(analyzeId),
  });
}

// API Functions for Combined Analysis
async function fetchCombinedAnalysis(
  vendorName: string,
  options?: {
    page?: number;
    pageSize?: number;
    search?: string;
    createdAt?: string;
    fy?: string;
  }
): Promise<PaginatedDocumentsResponse> {
  const params = new URLSearchParams();

  const page = options?.page || 1;
  const pageSize = options?.pageSize || 10;

  params.append('page', page.toString());
  params.append('page_size', pageSize.toString());
  params.append('vendor_name', vendorName);

  if (options?.search?.trim()) params.append('search', options.search.trim());
  if (options?.createdAt) {
    params.append('date_from', `${options.createdAt}T00:00:00`);
    params.append('date_to', `${options.createdAt}T23:59:59`);
  }
  if (options?.fy && options.fy !== 'all') {
    params.append('fy_period', options.fy);
  }

  const response = await apiFetch<CombinedAnalysisApiResponse>(`/combined-analysis?${params.toString()}`, {
    method: 'GET',
  });

  // Transform API response to Document format
  return {
    total: response.total,
    page: response.page,
    page_size: response.page_size,
    total_pages: response.total_pages,
    total_documents: response.total,
    documents: response.items.map((doc: any) => ({
      id: doc.id,
      fileName: doc.name,
      fyPeriod: doc.fy_period,
      createdBy: doc.created_by,
      type: doc.type,
      status: doc.status,
      uploadDate: doc.upload_date,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      overall_result: doc.overall_result,
    })),
  };
}

/**
 * Hook to fetch combined analysis documents from /documents/combined-analysis endpoint
 */
export function useCombinedAnalysis(
  vendorName: string | null,
  options?: {
    enabled?: boolean;
    page?: number;
    pageSize?: number;
    search?: string;
    createdAt?: string;
    fy?: string;
  }
) {
  return useQuery({
    queryKey: combinedAnalysisKeys.list(vendorName || '', {
      page: options?.page,
      pageSize: options?.pageSize,
      search: options?.search,
      createdAt: options?.createdAt,
      fy: options?.fy,
    }),
    queryFn: () =>
      fetchCombinedAnalysis(vendorName!, {
        page: options?.page,
        pageSize: options?.pageSize,
        search: options?.search,
        createdAt: options?.createdAt,
        fy: options?.fy,
      }),
    enabled: !!vendorName && (options?.enabled ?? true),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      // Poll every 3 seconds if there are items without overallResult
      const data = query.state.data;
      if (data?.documents?.length) {
        const hasItemsWithoutOverallResult = data.documents.some(
          (doc: any) => !doc.overall_result || (typeof doc.overall_result === 'string' && doc.overall_result.trim() === '')
        );
        return hasItemsWithoutOverallResult ? 3000 : false;
      }
      return false;
    },
    refetchIntervalInBackground: false,
  });
}

/**
 * API function to fetch combined analysis FY periods
 */
async function fetchCombinedAnalysisFyPeriods(vendorName: string): Promise<AnalyzeFyPeriodsApiResponse> {
  const params = new URLSearchParams();
  params.append('search', vendorName);
  return apiFetch<AnalyzeFyPeriodsApiResponse>(`/combined-analysis/fy-periods?${params.toString()}`, {
    method: 'GET',
  });
}

/**
 * Hook to fetch combined analysis FY periods for filter
 */
export function useCombinedAnalysisFyPeriods(vendorName: string | null) {
  return useQuery({
    queryKey: combinedAnalysisFyPeriodsKeys.list(vendorName),
    queryFn: () => fetchCombinedAnalysisFyPeriods(vendorName!),
    enabled: !!vendorName,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * API function to create combined analysis
 */
async function createCombinedAnalysis(dataPayload: {
  vendor_name: string;
  document_ids: string[];
  is_combined_all?: boolean;
}): Promise<{ message: string; success: boolean }> {
  return apiFetch<{ message: string; success: boolean }>('/documents/combined-analysis', {
    method: 'POST',
    body: JSON.stringify(dataPayload),
  });
}

/**
 * Hook to create combined analysis
 */
export function useCreateCombinedAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCombinedAnalysis,
    onSuccess: () => {
      // Invalidate combined analysis queries to refetch data
      queryClient.invalidateQueries({
        queryKey: combinedAnalysisKeys.all,
        refetchType: 'active',
      });

      // Also invalidate combined analysis FY periods to refresh filter options
      queryClient.invalidateQueries({
        queryKey: combinedAnalysisFyPeriodsKeys.all,
        refetchType: 'active',
      });
    },
  });
}

/**
 * API function to fetch combined analysis detail by ID
 */
async function fetchCombinedAnalysisDetail(combinedAnalyzeId: string): Promise<CombinedAnalysisDetailApiResponse> {
  return apiFetch<CombinedAnalysisDetailApiResponse>(`/combined-analysis/${combinedAnalyzeId}`, {
    method: 'GET',
  });
}

/**
 * Query Keys for Combined Analysis Detail
 */
export const combinedAnalysisDetailKeys = {
  all: ['combined-analysis-detail'] as const,
  detail: (id: string) => [...combinedAnalysisDetailKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch combined analysis detail by ID
 */
export function useCombinedAnalysisDetail(combinedAnalyzeId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: combinedAnalysisDetailKeys.detail(combinedAnalyzeId || ''),
    queryFn: () => fetchCombinedAnalysisDetail(combinedAnalyzeId!),
    enabled: !!combinedAnalyzeId && (options?.enabled ?? true),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * API function to delete combined analysis
 */
async function deleteCombinedAnalysis(combinedAnalyzeId: string): Promise<void> {
  return apiFetch<void>(`/combined-analysis/${combinedAnalyzeId}`, {
    method: 'DELETE',
  });
}

/**
 * Hook to delete combined analysis
 */
export function useDeleteCombinedAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCombinedAnalysis,
    onSuccess: () => {
      // Invalidate combined analysis queries to refetch data
      queryClient.invalidateQueries({
        queryKey: combinedAnalysisKeys.all,
        refetchType: 'active',
      });

      // Also invalidate combined analysis detail queries
      queryClient.invalidateQueries({
        queryKey: combinedAnalysisDetailKeys.all,
        refetchType: 'active',
      });

      // Also invalidate combined analysis FY periods to refresh filter options
      queryClient.invalidateQueries({
        queryKey: combinedAnalysisFyPeriodsKeys.all,
        refetchType: 'active',
      });
    },
  });
}

/**
 * API function to update combined analysis analysis
 */
async function updateCombinedAnalysisAnalysis(
  combinedAnalyzeId: string,
  analysis: CombinedAnalysisDetail
): Promise<CombinedAnalysisDetailApiResponse> {
  return apiFetch<CombinedAnalysisDetailApiResponse>(`/combined-analysis/${combinedAnalyzeId}`, {
    method: 'PUT',
    body: JSON.stringify(analysis),
  });
}

/**
 * Hook to update combined analysis analysis
 */
export function useUpdateCombinedAnalysisAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ combinedAnalyzeId, analysis }: { combinedAnalyzeId: string; analysis: CombinedAnalysisDetail }) =>
      updateCombinedAnalysisAnalysis(combinedAnalyzeId, analysis),
    onSuccess: (_, variables) => {
      // Invalidate the combined analysis detail query to refresh the data
      queryClient.invalidateQueries({
        queryKey: combinedAnalysisDetailKeys.detail(variables.combinedAnalyzeId),
      });

      // Also invalidate combined analysis list to refresh
      queryClient.invalidateQueries({
        queryKey: combinedAnalysisKeys.all,
        refetchType: 'active',
      });
    },
  });
}

/**
 * Function to export combined analysis report as a file
 * Uses apiFetchBlob to reuse authentication and error handling logic
 */
async function exportCombinedAnalysisReport(combinedAnalyzeName: string, combinedAnalyzeId: string): Promise<void> {
  const url = `/combined-analysis/${combinedAnalyzeId}/export-report`;

  const response = await apiFetchBlob(url, {
    method: 'GET',
  });

  const blob = await response.blob();

  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `${combinedAnalyzeName}.pdf`;
  if (contentDisposition) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const filenameMatch = filenameRegex.exec(contentDisposition);
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
 * Hook to export combined analysis report
 * Uses useMutation for consistency with other mutations in the codebase
 */
export function useExportCombinedAnalysisReport() {
  return useMutation({
    mutationFn: ({ combinedAnalyzeName, combinedAnalyzeId }: { combinedAnalyzeName: string; combinedAnalyzeId: string }) =>
      exportCombinedAnalysisReport(combinedAnalyzeName, combinedAnalyzeId),
  });
}
