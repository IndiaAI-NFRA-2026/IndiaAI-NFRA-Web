'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { CheckIcon, X, XIcon } from 'lucide-react';
import { Button } from '../button';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  type?: 'confirm' | 'alert';
  description?: string;
  renderDescription?: () => React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  showCloseButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonType?: 'default' | 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  cancelButtonType?: 'default' | 'secondary' | 'outline' | 'text';
  confirmDisabled?: boolean;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  confirmButtonIcon?: React.ReactNode;
  cancelButtonIcon?: React.ReactNode;
  isLoading?: boolean;
}

export function Modal({
  isOpen,
  title,
  type = 'confirm',
  description,
  renderDescription,
  onClose,
  onConfirm,
  showCloseButton = true,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonType = 'primary',
  cancelButtonType = 'outline',
  confirmDisabled = false,
  contentClassName,
  headerClassName,
  footerClassName,
  confirmButtonIcon,
  cancelButtonIcon,
  isLoading = false,
}: Readonly<ModalProps>) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className={cn('bg-upload-modal-background max-w-[calc(100%-15px)] rounded p-0 max-xl:w-[742px] xl:w-[802px]', contentClassName)}
      >
        {showCloseButton && (
          <button onClick={onClose} className="absolute top-4 right-5 cursor-pointer rounded-full p-1.5 transition">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        )}

        {title ? (
          <DialogHeader className={cn('border-b border-(--color-filters-border) px-6 py-4 text-left', headerClassName)}>
            <DialogTitle className="text-base leading-6 font-medium">{title}</DialogTitle>
          </DialogHeader>
        ) : (
          <VisuallyHidden>
            <DialogTitle>Dialog</DialogTitle>
          </VisuallyHidden>
        )}

        {description && (
          <div className="px-6">
            <p className="text-sm text-gray-700">{description}</p>
          </div>
        )}
        {renderDescription && renderDescription()}

        <DialogFooter
          className={cn('flex flex-row! justify-end gap-1 border-t border-(--color-filters-border) px-6 py-4', footerClassName)}
        >
          <Button
            title={cancelButtonText}
            type={cancelButtonType}
            onClick={onClose}
            icon={cancelButtonIcon ?? <XIcon className="size-4" />}
          />
          {type === 'confirm' && (
            <Button
              title={confirmButtonText}
              type={confirmButtonType}
              onClick={onConfirm}
              icon={confirmButtonIcon ?? <CheckIcon className="size-4" />}
              isLoading={isLoading}
              disabled={confirmDisabled}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
