'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';
import { Button } from '@/components/button';
import { Heading } from '@/components/heading';
import { UploadArea } from '@/components/upload-area';
import Table from '@/components/table';
import Card from '@/components/card';
import { useMemo, useState } from 'react';
import Select from '@/components/typing/select';
import { useOptionsMultiLanguages } from '@/components/hook/use-options';
import { DocumentStatus } from '@/enums';
import Tag from '@/components/tag';
import { getTagSeverity } from '@/lib/utils/helpers';
import { Loader2, RotateCw, TrashIcon, UploadIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTERS } from '@/constants/routers';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PaginationResponse } from '@/types/panigation';
import { apiFetch } from '@/lib/api';
import type { BatchUploadResponse, DocumentDetailResponse, DocumentResponse } from '@/types/documents';
import { toast } from 'sonner';
import { UploadErrorModal } from '@/components/upload-history/upload-error-modal';
import { formatDate } from '@/lib/utils/helpers';
import { Modal } from '@/components/modal';
import { fetchUploadStatus } from '@/lib/query/use-documents';
import { AppLayout } from '@/components/layout/app-layout';

async function fetchUploadDocuments(): Promise<PaginationResponse<DocumentResponse>> {
  const response = await apiFetch<{
    documents: DocumentResponse[];
    total: number;
    page?: number;
    page_size?: number;
    total_pages?: number;
  }>('/upload-document', {
    method: 'GET',
  });

  return {
    data: response.documents,
    total: response.total,
    page: response.page || 1,
    page_size: response.page_size || response.documents.length,
    total_pages: response.total_pages || 1,
  };
}

const UploadDocumentContent = () => {
  const { t } = useLanguage();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentDetailResponse | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorResponse, setErrorResponse] = useState<BatchUploadResponse | null>(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);
  const { documentTypeOptions, documentStatusOptions } = useOptionsMultiLanguages();
  const [processingDocuments, setProcessingDocuments] = useState<number>(0);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: uploadDocumentsData } = useQuery({
    queryKey: ['upload-document', 'list'],
    queryFn: fetchUploadDocuments,
    enabled: true,
  });

  // Polling for documents with PROCESSING status
  useQuery({
    queryKey: ['upload-document', 'list', 'polling'],
    queryFn: async () => {
      // Get current data from query cache
      const currentData = queryClient.getQueryData<PaginationResponse<DocumentResponse>>(['upload-document', 'list']);
      if (!currentData || currentData.data.length === 0) {
        return null;
      }

      // Get processing document IDs
      const processingIds = currentData.data.filter((doc) => doc.status === DocumentStatus.PROCESSING).map((doc) => String(doc.id));

      if (processingIds.length === 0) {
        return null;
      }

      // Fetch status for processing items
      const statusResponse = await fetchUploadStatus(processingIds);

      // Update query cache with new statuses
      queryClient.setQueryData<PaginationResponse<DocumentResponse>>(['upload-document', 'list'], (oldData) => {
        if (!oldData) return oldData;

        let hasChanges = false;
        const updatedData = oldData.data.map((item) => {
          const statusDoc = statusResponse.documents.find((doc) => doc.id === String(item.id));
          if (statusDoc && statusDoc.status !== item.status) {
            hasChanges = true;
            return {
              ...item,
              status: statusDoc.status as DocumentStatus,
            };
          }
          return item;
        });

        if (hasChanges) {
          return {
            ...oldData,
            data: updatedData,
          };
        }
        return oldData;
      });

      return statusResponse;
    },
    enabled: uploadDocumentsData?.data?.some((doc) => doc.status === DocumentStatus.PROCESSING) ?? false,
    refetchInterval: () => {
      // Check if there are processing items in the current cache
      const currentData = queryClient.getQueryData<PaginationResponse<DocumentResponse>>(['upload-document', 'list']);
      const hasProcessing = currentData?.data?.some((doc) => doc.status === DocumentStatus.PROCESSING) ?? false;

      // Poll every 3 seconds if there are processing items
      return hasProcessing ? 3000 : false;
    },
    refetchIntervalInBackground: false,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setProcessingDocuments(e.target.files.length);

    const formData = new FormData();
    for (const file of e.target.files) {
      formData.append('files', file);
    }

    try {
      setIsUploading(true);
      const response = await apiFetch<BatchUploadResponse>('/upload-document', {
        method: 'POST',
        body: formData,
      });

      const hasErrors = (response.errors?.length ?? 0) > 0 || (response.failed_uploads ?? 0) > 0;
      const successCount = response.successful_uploads ?? 0;

      if (hasErrors) {
        setErrorResponse(response);
        setIsErrorModalOpen(true);
      } else if (successCount > 0) {
        toast.success(t('uploadedHistory.uploading.success', { count: successCount }));
      }

      if (successCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['upload-document', 'list'] });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('uploadedHistory.uploading.error');
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmExtract = async () => {
    if (!selectedDocument || !uploadDocumentsData) return;

    const currentDocument = uploadDocumentsData.data.find((doc) => doc.id === selectedDocument.id);
    const documentType =
      (currentDocument as any)?.document_type ||
      (selectedDocument as any)?.document_type ||
      currentDocument?.type ||
      selectedDocument.document_type;

    await apiFetch('/upload-document/extract', {
      method: 'POST',
      body: JSON.stringify({
        document_id: selectedDocument.id,
        document_type: documentType,
      }),
    });

    queryClient.setQueryData<PaginationResponse<DocumentResponse>>(['upload-document', 'list'], (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        data: oldData.data.map((item: DocumentResponse) => {
          if (item.id === selectedDocument.id) {
            return { ...item, status: DocumentStatus.PROCESSING };
          }
          return item;
        }),
      };
    });

    setIsConfirmModalOpen(false);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    await apiFetch(`/upload-document/${selectedDocument.id}`, {
      method: 'DELETE',
    });
    queryClient.invalidateQueries({ queryKey: ['upload-document', 'list'] });
    setIsOpenDeleteModal(false);
  };

  const handleRetryUploadDocument = async () => {
    if (!selectedDocument) return;
    await apiFetch(`/upload-document/${selectedDocument.id}/retry`, {
      method: 'POST',
    });
    queryClient.invalidateQueries({ queryKey: ['upload-document', 'list'] });
    setIsRetryModalOpen(false);
  };

  const columns = useMemo(() => {
    return [
      {
        id: 'index',
        header: '#',
        accessorKey: 'index',
        cell: (row: any) => row.index,
      },
      {
        id: 'fileName',
        header: t('uploadedHistory.table.fileName'),
        accessorKey: 'file_name',
        cell: (row: any) => (
          <div className="line-clamp-2 max-w-[400px] min-w-[150px] truncate text-wrap wrap-break-word max-md:text-sm">{row.file_name}</div>
        ),
      },
      {
        id: 'dateUpload',
        header: t('uploadedHistory.table.dateUpload'),
        accessorKey: 'created_at',
        cell: (row: any) => <div className="text-nowrap">{formatDate(row.created_at)}</div>,
      },
      {
        id: 'type',
        header: t('uploadedHistory.table.detectedDocumentType'),
        accessorKey: 'document_type',
        cell: (row: any) => {
          const currentData = queryClient.getQueryData<PaginationResponse<DocumentResponse>>(['upload-document', 'list']);
          const currentDocument = currentData?.data.find((doc) => doc.id === row.id) || row;
          const documentType = (currentDocument as any)?.document_type || currentDocument?.type;
          const selectedOption = documentTypeOptions.find((option) => option.value === documentType);

          if (row.status !== DocumentStatus.PENDING) {
            return <Tag label={selectedOption?.label || ''} severity="info" />;
          }

          return (
            <Select
              disabled={row.status !== DocumentStatus.PENDING}
              value={selectedOption || documentTypeOptions[0]}
              options={documentTypeOptions}
              menuPortalTarget={typeof window !== 'undefined' ? window.document.body : null}
              menuPosition="fixed"
              isClearable={false}
              onChange={(selectedOption: any) => {
                if (!selectedOption) return;
                const value = selectedOption.value;
                queryClient.setQueryData<PaginationResponse<DocumentResponse>>(['upload-document', 'list'], (oldData) => {
                  if (!oldData) return oldData;
                  const newData = {
                    ...oldData,
                    data: oldData.data.map((item) => {
                      if (item.id === row.id) {
                        return { ...item, document_type: value };
                      }
                      return item;
                    }),
                  };
                  return newData;
                });
              }}
            />
          );
        },
      },
      {
        id: 'status',
        header: t('uploadedHistory.table.status'),
        accessorKey: 'status',
        cell: (row: any) => {
          const currentData = queryClient.getQueryData<PaginationResponse<DocumentResponse>>(['upload-document', 'list']);
          const currentDocument = currentData?.data.find((doc) => doc.id === row.id) || row;
          const status = currentDocument.status;
          const selectedOption = documentStatusOptions.find((option) => option.value === status);
          return <Tag label={selectedOption?.label || ''} severity={getTagSeverity(status) || 'info'} />;
        },
      },
      {
        id: 'action',
        header: t('uploadedHistory.table.action'),
        accessorKey: 'action',
        cell: (row: any) => {
          return (
            <div className="flex items-center">
              {row.status === DocumentStatus.PENDING && (
                <Button
                  title={t('reviewExtraction.confirmExtract')}
                  onClick={() => {
                    setSelectedDocument(row);
                    setIsConfirmModalOpen(true);
                  }}
                  size="sm"
                  type="primary"
                />
              )}
              {row.status === DocumentStatus.FAILED && (
                <Button
                  onClick={() => {
                    setSelectedDocument(row);
                    setIsRetryModalOpen(true);
                  }}
                  size="sm"
                  type="text"
                  icon={<RotateCw className="size-4" />}
                />
              )}
              <Button
                onClick={() => {
                  setSelectedDocument(row);
                  setIsOpenDeleteModal(true);
                }}
                size="sm"
                type="text"
                icon={<TrashIcon className="size-4" />}
              />
            </div>
          );
        },
      },
    ];
  }, [t, documentTypeOptions, documentStatusOptions, queryClient]);

  return (
    <div className="flex flex-1 flex-col overflow-y-hidden rounded bg-(--color-background-color) shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
      <Heading title={t('reviewExtraction.uploadDocument')} subTitle={t('reviewExtraction.uploadSubTitle')} />

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-6 pt-6 pb-1 max-md:px-2 max-md:pt-4">
        {isUploading && processingDocuments > 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-[4px] border border-(--color-border) p-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[14px] font-normal text-(--color-text-primary)">
                Your documents ({processingDocuments} files) are being uploaded.
              </span>
              <span className="text-[12px] font-normal text-(--color-text-primary)">Please wait...</span>
            </div>
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : (
          <UploadArea handleFileChange={handleFileChange} />
        )}
        <Card
          header={<Heading className="p-4 py-2" titleClassName="text-[14px] font-normal" title={t('reviewExtraction.uploadedFiles')} />}
          contentStyle="px-4 flex-1 min-h-0 flex flex-col max-md:px-3"
        >
          <div className="relative my-4 flex-1 scroll-pt-0 overflow-x-auto overflow-y-auto max-md:my-2">
            <Table
              columns={columns}
              stickyHeader={true}
              data={uploadDocumentsData?.data.map((item, index) => ({ ...item, index: index + 1 })) || []}
              noDataMessage={t('reviewExtraction.uploadedFilesNoData')}
            />
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-3 p-6 max-md:p-2">
        <Button title={t('button.cancel')} size="lg" type="outline" onClick={() => router.push(ROUTERS.REVIEW_EXTRACTION)} />
        <Button
          disabled={!uploadDocumentsData?.data?.some((item: any) => item.status === DocumentStatus.REVIEW)}
          title={t('reviewExtraction.goToReview')}
          size="lg"
          onClick={() => router.push(ROUTERS.REVIEW_EXTRACTION)}
        />
      </div>

      <Modal
        contentClassName="max-w-[500px]"
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmExtract}
        title={t('reviewExtraction.confirmExtract')}
        description={t('reviewExtraction.confirmExtractDescription')}
        confirmButtonText={t('reviewExtraction.confirmExtract')}
        cancelButtonText={t('button.cancel')}
      />

      <Modal
        contentClassName="max-w-[500px]"
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        onConfirm={handleDeleteDocument}
        title={t('reviewExtraction.deleteDocument')}
        description={t('reviewExtraction.deleteDocumentDescription')}
        confirmButtonText={t('button.delete')}
        cancelButtonText={t('button.cancel')}
        confirmButtonType="danger"
      />

      <Modal
        isOpen={isRetryModalOpen}
        contentClassName="max-w-[500px]"
        onClose={() => setIsRetryModalOpen(false)}
        onConfirm={handleRetryUploadDocument}
        title={t('reviewExtraction.retryUploadDocument')}
        description={t('reviewExtraction.retryUploadDocumentDescription')}
        confirmButtonText={t('reviewExtraction.retryUploadDocument')}
        cancelButtonText={t('button.cancel')}
      />
      <UploadErrorModal isOpen={isErrorModalOpen} setIsOpen={setIsErrorModalOpen} errorResponse={errorResponse} />
    </div>
  );
};

export default function UploadDocumentPage() {
  return (
    <AppLayout>
      <UploadDocumentContent />
    </AppLayout>
  );
}
