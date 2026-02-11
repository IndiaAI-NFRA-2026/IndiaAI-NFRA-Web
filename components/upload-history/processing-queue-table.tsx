'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { getUploadedHistoryColumns } from './upload-history-columns';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useProcessingQueue } from '@/lib/query/use-processing-queue';
import { Spinner } from '@/components/ui/spinner';
import type { Document } from '@/types/documents';
import { DeleteDocumentDialog } from './delete-document-dialog';
import { RetryDocumentDialog } from './retry-document-dialog';
import { DocumentType } from '@/enums/document-type';

export function ProcessingQueueTable() {
  const { t } = useLanguage();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRetryDialogOpen, setIsRetryDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const { data: queueData, isLoading } = useProcessingQueue({
    enabled: true, // Always fetch processing queue
  });

  const handleRetry = (document: Document) => {
    setSelectedDocument(document);
    setIsRetryDialogOpen(true);
  };

  const handleDelete = (document: Document) => {
    setSelectedDocument(document);
    setIsDeleteDialogOpen(true);
  };

  const processingDocuments = queueData?.documents ?? [];
  const columns = getUploadedHistoryColumns(t, {
    isProcessingTable: true,
    onRetry: handleRetry,
    onDelete: handleDelete,
  });

  // Don't show if no processing documents
  if (!isLoading && processingDocuments.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-(--color-table-header-text-color)">{t('uploadedHistory.processingQueue.title')}</h3>
        <p className="mt-1 text-sm text-(--color-upload-content-color)">{t('uploadedHistory.processingQueue.description')}</p>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Spinner className="size-8 animate-spin text-(--color-sidebar-ring)" />
        </div>
      ) : (
        <div className="max-h-[500px] overflow-y-auto">
          <DataTable columns={columns} data={processingDocuments} pageSize={processingDocuments.length} />
        </div>
      )}

      <DeleteDocumentDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        document={selectedDocument}
        type={DocumentType.UPLOADED}
        onSuccess={() => {
          setSelectedDocument(null);
        }}
      />

      <RetryDocumentDialog
        isOpen={isRetryDialogOpen}
        setIsOpen={setIsRetryDialogOpen}
        document={selectedDocument}
        onSuccess={() => {
          setSelectedDocument(null);
        }}
      />
    </div>
  );
}
