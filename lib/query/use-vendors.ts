'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { tab } from '@/enums/document-type';
import type { VendorFilters, VendorsResponse } from '@/types/vendors';

// Query Keys
export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...vendorKeys.lists(), filters] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

// API Functions
async function fetchVendors(filters: VendorFilters): Promise<VendorsResponse> {
  const params = new URLSearchParams();
  params.append('page', filters.page.toString());
  params.append('page_size', filters.pageSize.toString());
  if (filters.vendorName) params.append('vendor_name', filters.vendorName);
  if (filters.type) params.append('type', filters.type);
  if (filters.search) params.append('search', filters.search.trim().toLowerCase());
  if (filters.hasDecisionReview) params.append('hasDecisionReview', 'true');
  if (filters.include_fraud_transactions) params.append('include_fraud_transactions', 'true');
  return apiFetch<VendorsResponse>(`/documents/combined-analysis?${params.toString()}`, {
    method: 'GET',
  });
}

// Custom Hooks
/**
 * Hook to fetch vendors list with pagination
 */
export function useVendors(options?: {
  enabled?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
  type?: tab;
  hasDecisionReview?: boolean;
  include_fraud_transactions?: boolean;
  vendorName?: string;
}) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;
  const search = options?.search ?? '';
  const type = options?.type ?? tab.UPLOADED;
  const hasDecisionReview = options?.hasDecisionReview ?? false;
  const include_fraud_transactions = options?.include_fraud_transactions ?? false;
  const vendorName = options?.vendorName ?? '';
  return useQuery({
    queryKey: vendorKeys.list({
      page,
      pageSize,
      search,
      type,
      hasDecisionReview,
      include_fraud_transactions,
      vendorName,
    }),
    queryFn: () => fetchVendors({ page, pageSize, search, type, hasDecisionReview, include_fraud_transactions, vendorName }),
    enabled: options?.enabled ?? true,
    refetchOnMount: true,
  });
}

// API Functions
async function fetchUploadVendors(filters: VendorFilters): Promise<VendorsResponse> {
  const params = new URLSearchParams();
  params.append('page', filters.page.toString());
  params.append('page_size', filters.pageSize.toString());
  if (filters.search) params.append('search', filters.search.trim().toLowerCase());
  return apiFetch<VendorsResponse>(`/upload-document?${params.toString()}`, {
    method: 'GET',
  });
}

// Custom Hooks
/**
 * Hook to fetch vendors list with pagination
 */
export function useUploadVendors(options?: { enabled?: boolean; page?: number; pageSize?: number; search?: string }) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;
  const search = options?.search ?? '';
  return useQuery({
    queryKey: vendorKeys.list({
      page,
      pageSize,
      search,
    }),
    queryFn: () => fetchUploadVendors({ page, pageSize, search }),
    enabled: options?.enabled ?? true,
    refetchOnMount: true,
  });
}
