'use client';

import * as React from 'react';
import { Dialog, DialogPortal, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/useLanguage';
import type { BatchUploadResponse } from '@/types/documents';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadErrorModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  errorResponse: BatchUploadResponse | null;
  isZipPasswordOpen?: boolean;
}

export function UploadErrorModal({ isOpen, setIsOpen, errorResponse, isZipPasswordOpen = false }: Readonly<UploadErrorModalProps>) {
  const { t } = useLanguage();

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!errorResponse) return null;

  const shouldShowOverlay = !isZipPasswordOpen;

  const renderModalContent = (Wrapper: React.ElementType, wrapperProps?: any) => (
    <Wrapper {...wrapperProps}>
      <button onClick={handleClose} className="absolute top-4 right-5 cursor-pointer rounded-full p-1.5 transition">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </button>

      <DialogHeader className="border-b border-(--color-filters-border) px-6 py-4 text-left">
        <DialogTitle className="text-base leading-6 font-medium text-(--color-upload-modal-text-color)">
          {t('uploadedHistory.uploadError.title') || 'Upload Error'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 px-6 py-4">
        {errorResponse.message && (
          <p className="text-sm leading-5.5 font-normal text-(--color-table-text-color)">{errorResponse.message}</p>
        )}

        {errorResponse.errors && errorResponse.errors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-(--color-table-header-text-color)">
              {t('uploadedHistory.uploadError.errors') || 'Errors:'}
            </p>
            <ul className="list-none space-y-2">
              {errorResponse.errors.map((error, index) => (
                <li
                  key={`error-${error.substring(0, 20)}-${index}`}
                  className="relative max-h-[150px] overflow-y-auto rounded-md bg-red-50 p-3 pl-4 text-sm text-red-800"
                >
                  <p className="break-all">{error}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {errorResponse.documents && errorResponse.documents.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-(--color-table-header-text-color)">
              {t('uploadedHistory.uploadError.files') || 'Files:'}
            </p>
            <ul className="max-h-[150px] list-none space-y-1 overflow-y-auto">
              {errorResponse.documents.map((doc, index) => (
                <li key={`doc-${doc.file_name}-${index}`} className="text-sm break-all text-(--color-table-text-color)">
                  {doc.file_name}
                  {doc.is_duplicate && (
                    <span className="ml-2 text-xs text-red-600">({t('uploadedHistory.uploadError.duplicate') || 'Duplicate'})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(errorResponse.successful_uploads !== undefined || errorResponse.failed_uploads !== undefined) && (
          <div className="rounded-md bg-gray-50 p-3 text-sm text-(--color-table-text-color)">
            <p>
              {errorResponse.successful_uploads !== undefined &&
                `${t('uploadedHistory.uploadError.successful') || 'Successful'}: ${errorResponse.successful_uploads}`}
              {errorResponse.failed_uploads !== undefined &&
                ` | ${t('uploadedHistory.uploadError.failed') || 'Failed'}: ${errorResponse.failed_uploads}`}
            </p>
          </div>
        )}
      </div>

      <DialogFooter className="flex justify-end gap-3 border-t border-(--color-filters-border) px-4 py-2.5 sm:justify-end">
        <Button
          onClick={handleClose}
          className="hover:bg-button-background/90 min-w-48 cursor-pointer bg-(--color-button-background) text-sm leading-5.5 font-normal text-(--color-button-foreground) disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('uploadedHistory.uploadError.close') || 'Close'}
        </Button>
      </DialogFooter>
    </Wrapper>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      {shouldShowOverlay ? (
        <DialogContent className="rounded bg-(--color-upload-modal-background) p-0 sm:max-w-md lg:min-w-[572px]">
          {renderModalContent(React.Fragment)}
        </DialogContent>
      ) : (
        <DialogPortal>
          <DialogPrimitive.Content
            className={cn(
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded border bg-(--color-upload-modal-background) p-0 shadow-lg duration-50 sm:max-w-md lg:min-w-[572px]'
            )}
          >
            {renderModalContent(React.Fragment)}
          </DialogPrimitive.Content>
        </DialogPortal>
      )}
    </Dialog>
  );
}
