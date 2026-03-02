'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { X } from 'lucide-react';
import { useDeleteDocument } from '@/lib/query/use-documents';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import type { Document } from '@/types/documents';
import { DocumentType } from '@/enums/document-type';

interface DeleteDocumentDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  document: Document | null;
  type?: DocumentType;
  onSuccess?: () => void;
}

export function DeleteDocumentDialog({ isOpen, setIsOpen, type, document, onSuccess }: Readonly<DeleteDocumentDialogProps>) {
  const { t } = useLanguage();
  const deleteDocumentMutation = useDeleteDocument();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (!document) return;

    deleteDocumentMutation.mutate(
      {
        id: String(document.id),
        type: type || DocumentType.UPLOADED,
      },
      {
        onSuccess: () => {
          toast.success(t('uploadedHistory.deleteDocument.success'));
          handleClose();
          onSuccess?.();
        },
        onError: (error) => {
          const errorMessage = error instanceof Error ? error.message : t('uploadedHistory.deleteDocument.error');
          toast.error(errorMessage);
        },
      }
    );
  };

  if (!document) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="bg-upload-modal-background rounded p-0 sm:max-w-md">
        <button
          onClick={handleClose}
          className="absolute top-4 right-5 cursor-pointer rounded-full p-1.5 transition"
          disabled={deleteDocumentMutation.isPending}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="border-b border-(--color-filters-border) px-6 py-4 text-left">
          <DialogTitle className="text-base leading-6 font-medium">{t('uploadedHistory.deleteDocument.title')}</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          <p className="text-sm wrap-break-word break-all text-gray-700">
            {t('uploadedHistory.deleteDocument.confirmation', {
              fileName: document.fileName || 'this document',
            })}
          </p>
        </div>

        <DialogFooter className="flex justify-end gap-3 border-t border-(--color-filters-border) px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={deleteDocumentMutation.isPending}
            className="hover:bg-muted min-w-24"
          >
            {t('button.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteDocumentMutation.isPending}
            className="min-w-24 text-white"
          >
            {deleteDocumentMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4 animate-spin" />
                {t('uploadedHistory.deleteDocument.deleting')}
              </span>
            ) : (
              t('button.delete')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
