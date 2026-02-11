'use client';

import { useQuery } from '@tanstack/react-query';
import { getRetentionDocuments } from '@/api/retention-setting';
import type { RetentionDocumentsFilters } from '@/types/retention-policy';

// Query Keys
export const retentionDocumentKeys = {
  all: ['retention-documents'] as const,
  lists: () => [...retentionDocumentKeys.all, 'list'] as const,
  list: (filters: RetentionDocumentsFilters) => [...retentionDocumentKeys.lists(), filters] as const,
};

/**
 * Hook to fetch retention documents with filters
 */
export function useRetentionDocuments(filters?: RetentionDocumentsFilters) {
  return useQuery({
    queryKey: retentionDocumentKeys.list(filters || {}),
    queryFn: () => getRetentionDocuments(filters || {}),
    enabled: true,
  });
}
