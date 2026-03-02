'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useBatchUploadDocuments, type ZipFileInfo } from '@/lib/query/use-documents';
import { toast } from 'sonner';
import type { BatchUploadResponse } from '@/types/documents';

interface ConsentModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onClose: () => void;
  files: File[] | null;
  zipFileInfos?: ZipFileInfo[];
  onAccept?: () => void;
  shouldOpenUploadModal?: boolean;
  onError?: (response: BatchUploadResponse) => void;
}

export function ConsentModal({
  isOpen,
  setIsOpen,
  onClose,
  files,
  zipFileInfos,
  onAccept,
  shouldOpenUploadModal = false,
  onError,
}: Readonly<ConsentModalProps>) {
  const { t } = useLanguage();
  const uploadMutation = useBatchUploadDocuments();

  const handleAccept = async () => {
    // If this is the first time and we need to show upload modal after consent
    if (shouldOpenUploadModal && onAccept) {
      setIsOpen(false);
      onAccept();
      return;
    }

    // Otherwise, if files are provided, upload directly
    if (!files || files.length === 0) {
      if (shouldOpenUploadModal && onAccept) {
        // Just open upload modal without files
        setIsOpen(false);
        onAccept();
        return;
      }
      toast.error(t('uploadedHistory.upload.noFilesSelected') || 'No files selected');
      return;
    }

    uploadMutation.mutate(
      {
        files,
        zipFileInfos: zipFileInfos && zipFileInfos.length > 0 ? zipFileInfos : undefined,
      },
      {
        onSuccess: (response) => {
          // Check if there are errors in the response (even with 200 status)
          if (response.errors && response.errors.length > 0) {
            // Show error modal if callback provided, otherwise show toast
            if (onError) {
              onError(response);
            } else {
              for (const error of response.errors) {
                toast.error(error);
              }
            }
            // Don't close modal if there are errors
            return;
          }

          // Check if there are failed uploads
          if (response.failed_uploads && response.failed_uploads > 0) {
            const errorMessage = response.message || t('uploadedHistory.uploading.error') || 'Upload failed';
            toast.error(errorMessage);
            return;
          }

          // Only close modal if upload was successful
          const fileCount = response.successful_uploads || response.documents?.length || files.length;
          toast.success(t('uploadedHistory.uploading.success', { count: fileCount }) || `Successfully uploaded ${fileCount} file(s)`);
          setIsOpen(false);
          onClose();
        },
        onError: (error) => {
          const errorMessage = error instanceof Error ? error.message : t('uploadedHistory.uploading.error') || 'Upload failed';
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="rounded bg-(--color-upload-modal-background) p-0 sm:max-w-md lg:min-w-[572px]">
        <DialogHeader className="border-b border-(--color-filters-border) px-6 py-4 text-left">
          <DialogTitle className="text-base leading-6 font-medium text-(--color-upload-modal-text-color)">
            {t('uploadedHistory.consent.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1 px-6 text-sm leading-5.5 font-normal text-(--color-table-text-color)">
          <p>{t('uploadedHistory.consent.description')}</p>

          <ul className="list-none space-y-1 pl-5">
            <li className="relative pl-4 before:absolute before:top-2.5 before:left-0 before:h-1 before:w-1 before:rounded-full before:bg-(--color-table-text-color)">
              <p>{t('uploadedHistory.consent.content1')}</p>
            </li>
            <li className="relative pl-4 before:absolute before:top-2.5 before:left-0 before:h-1 before:w-1 before:rounded-full before:bg-(--color-table-text-color)">
              <p>{t('uploadedHistory.consent.content2')}</p>
            </li>
            <li className="relative pl-4 before:absolute before:top-2.5 before:left-0 before:h-1 before:w-1 before:rounded-full before:bg-(--color-table-text-color)">
              <p>{t('uploadedHistory.consent.content3')}</p>
            </li>
          </ul>
        </div>

        <DialogFooter className="flex justify-end gap-3 border-t border-(--color-filters-border) px-4 py-2.5 sm:justify-end">
          <Button
            onClick={handleAccept}
            className="hover:bg-button-background/90 min-w-48 cursor-pointer bg-(--color-button-background) text-sm leading-5.5 font-normal text-(--color-button-foreground) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('uploadedHistory.consent.acceptContinue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
