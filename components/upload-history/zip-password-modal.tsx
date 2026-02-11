/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useBatchUploadDocuments, type ZipFileInfo } from '@/lib/query/use-documents';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import type { BatchUploadResponse } from '@/types/documents';

interface ZipPasswordModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  zipFiles: File[];
  allFiles: File[]; // All files including non-zip files
  onConfirm: () => void;
  onCancel: () => void;
  isFirstTimeUpload: boolean;
  onOpenConsentModal?: (files: File[], zipFileInfos: ZipFileInfo[]) => void;
  onError?: (response: BatchUploadResponse) => void;
}

export function ZipPasswordModal({
  isOpen,
  setIsOpen,
  zipFiles,
  allFiles,
  onConfirm,
  onCancel,
  isFirstTimeUpload,
  onOpenConsentModal,
  onError: onErrorCallback,
}: Readonly<ZipPasswordModalProps>) {
  const { t } = useLanguage();
  const [zipFileInfos, setZipFileInfos] = useState<ZipFileInfo[]>([]);
  const prevIsOpenRef = useRef(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const uploadMutation = useBatchUploadDocuments();
  // Initialize zip file infos only when modal first opens (not on every re-render)
  // This prevents resetting checkboxes when polling causes parent re-renders
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    const isNowOpen = isOpen;

    // Only initialize when modal transitions from closed to open
    if (isNowOpen && !wasOpen && zipFiles.length > 0) {
      setZipFileInfos(
        zipFiles.map((file) => ({
          file,
          hasPassword: false,
          password: '',
        }))
      );
      setUploadErrors([]);
    }

    // Reset state when modal closes
    if (!isNowOpen && wasOpen) {
      setZipFileInfos([]);
      setUploadErrors([]);
    }

    // Update ref to track previous isOpen state
    prevIsOpenRef.current = isNowOpen;
  }, [isOpen, zipFiles]);

  // Handle upload errors from mutation error state
  useEffect(() => {
    if (uploadMutation.isError && uploadMutation.error) {
      const errorMessage =
        uploadMutation.error instanceof Error ? uploadMutation.error.message : t('uploadedHistory.uploading.error') || 'Upload failed';
      setUploadErrors([errorMessage]);
    }
  }, [uploadMutation.isError, uploadMutation.error, t]);

  const handleHasPasswordChange = (index: number, hasPassword: boolean) => {
    setZipFileInfos((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        hasPassword,
        password: hasPassword ? updated[index].password : '',
      };
      return updated;
    });
  };

  const handlePasswordChange = (index: number, password: string) => {
    setZipFileInfos((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        password,
      };
      return updated;
    });
  };

  const handleConfirm = () => {
    // Validate that if hasPassword is true, password must be provided
    const invalidZipFile = zipFileInfos.find((info) => info.hasPassword && !info.password.trim());

    if (invalidZipFile) {
      toast.error(t('uploadedHistory.zipPassword.passwordRequired') || `Please enter password for ${invalidZipFile.file.name}`);
      return;
    }

    setUploadErrors([]);

    // If first time upload, open consent modal
    if (isFirstTimeUpload && onOpenConsentModal) {
      onOpenConsentModal(allFiles, zipFileInfos);
      setIsOpen(false);
      return;
    }

    // Otherwise, upload directly
    uploadMutation.mutate(
      {
        files: allFiles,
        zipFileInfos: zipFileInfos.length > 0 ? zipFileInfos : undefined,
      },
      {
        onSuccess: (response) => {
          // Check if there are errors in the response (even with 200 status)
          const hasErrors = response.errors && Array.isArray(response.errors) && response.errors.length > 0;
          const hasFailedUploads = response.failed_uploads && response.failed_uploads > 0;

          // Close ZipPasswordModal first, regardless of success or error
          setIsOpen(false);

          if (hasErrors && response.errors) {
            // Show error modal if callback provided, otherwise show inline errors
            if (onErrorCallback) {
              onErrorCallback(response);
            } else {
              setUploadErrors([...response.errors]);
            }
            return;
          }

          if (hasFailedUploads) {
            // If there are failed uploads but no errors array, use message or default error
            if (onErrorCallback) {
              onErrorCallback(response);
            } else {
              const errorMessage = response.message || t('uploadedHistory.uploading.error') || 'Upload failed';
              setUploadErrors([errorMessage]);
            }
            return;
          }

          // Upload was successful (no errors and no failed uploads)
          const fileCount = response.successful_uploads || response.documents?.length || allFiles.length;
          toast.success(t('uploadedHistory.uploading.success', { count: fileCount }) || `Successfully uploaded ${fileCount} file(s)`);
          onConfirm();
        },
        onError: (error) => {
          // Close modal when upload fails
          setIsOpen(false);
          const errorMessage = error instanceof Error ? error.message : t('uploadedHistory.uploading.error') || 'Upload failed';
          setUploadErrors([errorMessage]);
          // If onError callback is provided, call it with error response
          if (onErrorCallback) {
            onErrorCallback({
              errors: [errorMessage],
              documents: [],
            } as BatchUploadResponse);
          }
        },
      }
    );
  };

  const handleClose = () => {
    // Don't allow closing when uploading
    if (uploadMutation.isPending) {
      return;
    }
    setIsOpen(false);
    onCancel();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !uploadMutation.isPending) {
          handleClose();
        }
      }}
    >
      <DialogContent className="rounded bg-(--color-upload-modal-background) p-0 sm:max-w-md lg:min-w-[572px]">
        <button
          onClick={handleClose}
          disabled={uploadMutation.isPending}
          className="absolute top-4 right-5 cursor-pointer rounded-full p-1.5 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5 text-(--color-upload-modal-text-color)" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="border-b border-(--color-filters-border) px-6 py-4 text-left">
          <DialogTitle className="text-base leading-6 font-medium text-(--color-upload-modal-text-color)">
            {t('uploadedHistory.zipPassword.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[500px] space-y-4 overflow-y-auto px-6 py-4">
          <p className="text-sm leading-5.5 font-normal text-(--color-table-text-color)">{t('uploadedHistory.zipPassword.description')}</p>

          {/* Display upload errors at the top */}
          {uploadErrors && uploadErrors.length > 0 && (
            <div className="rounded-lg border border-red-500 bg-red-50 p-3 dark:bg-red-900/20">
              <p className="mb-2 text-sm font-medium text-red-700 dark:text-red-400">
                {t('uploadedHistory.uploading.error') || 'Upload Error'}
              </p>
              <div className="space-y-1 text-sm text-red-600 dark:text-red-300">
                {uploadErrors.map((error) => (
                  <div key={error}>{error}</div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {zipFileInfos.map((zipInfo, index) => (
              <div key={`${zipInfo.file.name}-${index}`} className="rounded-lg border border-(--color-filters-border) p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-(--color-upload-modal-text-color)">{zipInfo.file.name}</p>
                </div>

                <div className="mb-3 flex items-center space-x-2">
                  <Checkbox
                    id={`has-password-${index}`}
                    checked={zipInfo.hasPassword}
                    onCheckedChange={(checked) => handleHasPasswordChange(index, checked === true)}
                  />
                  <label
                    htmlFor={`has-password-${index}`}
                    className="cursor-pointer text-sm leading-5.5 font-normal text-(--color-table-text-color)"
                  >
                    {t('uploadedHistory.zipPassword.hasPassword')}
                  </label>
                </div>

                {zipInfo.hasPassword && (
                  <div>
                    <label htmlFor={`password-${index}`} className="mb-2 block text-sm font-medium text-(--color-table-text-color)">
                      {t('uploadedHistory.zipPassword.password')}
                    </label>
                    <Input
                      id={`password-${index}`}
                      type="password"
                      value={zipInfo.password}
                      onChange={(e) => handlePasswordChange(index, e.target.value)}
                      placeholder={t('uploadedHistory.zipPassword.passwordPlaceholder')}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 border-t border-(--color-filters-border) px-4 py-2.5 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploadMutation.isPending}
            className="bg-button-foreground hover:bg-button-foreground/90 min-w-28 cursor-pointer border-(--color-filters-border) text-sm leading-5.5 font-normal text-(--color-upload-modal-text-color) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('uploadedHistory.zipPassword.cancel')}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={uploadMutation.isPending}
            className="hover:bg-button-background/90 min-w-48 cursor-pointer bg-(--color-button-background) text-sm leading-5.5 font-normal text-(--color-button-foreground) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4 animate-spin" />
                {t('uploadedHistory.uploading.uploading') || 'Uploading...'}
              </span>
            ) : (
              t('uploadedHistory.zipPassword.confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
