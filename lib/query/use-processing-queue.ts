'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { fetchUploadStatus } from './use-documents';
import { vendorDocumentKeys } from './use-vendor-documents';
import { vendorKeys } from './use-vendors';
import type { Document, DocumentResponse } from '@/types/documents';
import { DocumentStatus } from '@/enums';

export interface ProcessingQueueResponse {
  documents: Document[];
  total: number;
}

export interface ProcessingQueueDocumentResponse extends DocumentResponse {
  error_message?: string | null;
}

export interface ProcessingQueueApiResponse {
  documents: ProcessingQueueDocumentResponse[];
  total: number;
}

// Query Keys
export const processingQueueKeys = {
  all: ['processing-queue'] as const,
  list: () => [...processingQueueKeys.all, 'list'] as const,
};

/**
 * Transform API response to Document format
 */
function transformDocument(doc: ProcessingQueueDocumentResponse): Document {
  return {
    id: doc.id,
    fileName: doc.file_name,
    type: doc.type || '-',
    status: doc.status as Document['status'],
    uploadDate: doc.created_at,
    createdAt: doc.created_at,
    errorMessage: doc.error_message || undefined,
  };
}

// API Functions
async function fetchProcessingQueue(): Promise<ProcessingQueueResponse> {
  const response = await apiFetch<ProcessingQueueApiResponse>(`/upload-document/in-progress/`, {
    method: 'GET',
  });

  // Transform API response to Document format
  return {
    ...response,
    documents: response.documents.map(transformDocument),
  };
}

// Custom Hooks
/**
 * Hook to fetch global processing queue (all vendors)
 */
export function useProcessingQueue(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: processingQueueKeys.list(),
    queryFn: fetchProcessingQueue,
    enabled: options?.enabled ?? true,
    refetchIntervalInBackground: false,
  });

  // Polling for pending/processing items
  useQuery({
    queryKey: [...processingQueueKeys.list(), 'polling'],
    queryFn: async () => {
      const queueData = query.data;
      if (!queueData || queueData.documents.length === 0) {
        return null;
      }

      // Get pending and processing document IDs
      const pendingProcessingIds = queueData.documents
        .filter((doc) => doc.status === DocumentStatus.PROCESSING)
        .map((doc) => String(doc.id));

      if (pendingProcessingIds.length === 0) {
        return null;
      }

      // Fetch status for pending/processing items
      const statusResponse = await fetchUploadStatus(pendingProcessingIds);

      // Process reviewed items
      const reviewedItems = statusResponse.documents.filter((doc) => doc.status === DocumentStatus.REVIEW);

      // Process failed items - update their status in queue
      const processingItems = statusResponse.documents.filter((doc) => doc.status === DocumentStatus.PROCESSING);

      // Process failed items - update their status in queue
      const failedItems = statusResponse.documents.filter((doc) => doc.status === DocumentStatus.FAILED);

      // Update documents in queue with new statuses
      let updatedDocuments = [...queueData.documents];
      let hasChanges = false;

      // Update processing items status (pending -> processing)
      if (processingItems.length > 0) {
        updatedDocuments = updatedDocuments.map((doc) => {
          const processingItem = processingItems.find((processing) => processing.id === String(doc.id));
          if (processingItem && doc.status !== DocumentStatus.PROCESSING) {
            hasChanges = true;
            return {
              ...doc,
              status: DocumentStatus.PROCESSING,
            };
          }
          return doc;
        });
      }

      // Update failed items status
      if (failedItems.length > 0) {
        updatedDocuments = updatedDocuments.map((doc) => {
          const failedItem = failedItems.find((failed) => failed.id === String(doc.id));
          if (failedItem && doc.status !== DocumentStatus.FAILED) {
            hasChanges = true;
            return {
              ...doc,
              status: DocumentStatus.FAILED,
            };
          }
          return doc;
        });
      }

      // Remove completed items from processing queue
      if (reviewedItems.length > 0) {
        updatedDocuments = updatedDocuments.filter((doc) => !reviewedItems.some((reviewed) => reviewed.id === String(doc.id)));
      }

      // Update processing queue cache if there are any changes
      if (hasChanges || reviewedItems.length > 0) {
        queryClient.setQueryData(processingQueueKeys.list(), {
          ...queueData,
          documents: updatedDocuments,
          total: updatedDocuments.length,
        });
      }

      const allCompleted = updatedDocuments.every(
        (doc) => doc.status !== DocumentStatus.PENDING && doc.status !== DocumentStatus.PROCESSING
      );
      if (allCompleted) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.all });
        queryClient.invalidateQueries({ queryKey: vendorDocumentKeys.all });
      }

      // Add completed items to vendor tables if they match and vendor is already loaded
      if (reviewedItems.length > 0) {
        // Get all vendors from cache to match file_name
        // Get vendors from all possible query keys in cache
        queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      }

      return statusResponse;
    },
    enabled:
      (options?.enabled ?? true) &&
      query.isSuccess &&
      query.data?.documents.some((doc) => doc.status === DocumentStatus.PENDING || doc.status === DocumentStatus.PROCESSING),
    refetchInterval: (query) => {
      // Poll every 3 seconds if there are pending/processing items
      const queueData = query.state.data;
      if (queueData && queueData.documents.length > 0) {
        return 3000;
      }
      return false;
    },
  });

  return query;
}
