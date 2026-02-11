import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { X } from 'lucide-react';
import { MAX_FILES, allowedExtensions } from '@/lib/utils/constants';

export function UploadModal({
  isOpen,
  setIsOpen,
  handleDrag,
  handleDrop,
  handleFileChange,
}: Readonly<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}>) {
  const { t } = useLanguage();
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFileType = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return allowedExtensions.some((ext) => fileName.endsWith(ext));
  };

  const validateFiles = (files: FileList | null): boolean => {
    if (!files) return false;

    // Check file count
    if (files.length > MAX_FILES) {
      setErrorMessage(t('uploadedHistory.modal.maxFilesError'));
      return false;
    }

    // Check file types
    for (const file of files) {
      if (!validateFileType(file)) {
        setErrorMessage(t('uploadedHistory.modal.invalidFileTypeError'));
        return false;
      }
    }

    setErrorMessage('');
    return true;
  };

  const handleFileChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateFiles(e.target.files)) {
      handleFileChange(e);
    } else {
      // Reset input to allow selecting again
      e.target.value = '';
    }
  };

  const handleDropWithValidation = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (validateFiles(e.dataTransfer.files)) {
        handleDrop(e);
      } else {
        // Clear the drag data
        e.dataTransfer.clearData();
      }
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="bg gap-4 rounded bg-(--color-upload-modal-background) sm:max-w-md sm:min-w-[742px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <DialogClose className="absolute top-8 right-4 rounded-full p-1 transition">
          <X className="h-6 w-6 cursor-pointer text-(--color-upload-modal-text-color)" />
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-left">
            <p className="mb-0.5 text-base leading-6 font-bold">{t('uploadedHistory.modal.title')}</p>
            <p className="text-sm leading-[22px] font-normal tracking-normal text-(--color-upload-content-color)">
              {t('uploadedHistory.modal.description')}
            </p>
          </DialogTitle>
        </DialogHeader>

        <div>
          <button
            type="button"
            aria-label="File upload drop zone"
            className="relative w-full rounded-lg border-2 border-dashed border-(--color-sidebar-primary) px-12 py-16 transition-colors"
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDrag(e);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDrag(e);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDrag(e);
            }}
            onDrop={handleDropWithValidation}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf, .xlsx,.xls,.csv, .zip,.rar,.7z,.tar,.gz,.tgz,.tar.gz, application/zip,application/x-rar-compressed, application/x-7z-compressed,application/x-tar,application/gzip"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleFileChangeWithValidation}
            />

            <div className="flex flex-col items-center justify-center">
              <div className="mb-4.5 cursor-pointer">
                <img src="/assets/icons/upload-file-icon.svg" alt="upload" className="h-6 w-8" />
              </div>

              <div className="text-center">
                <p className="text-base leading-5 font-normal text-(--color-upload-modal-drop-zone-text)">
                  {t('uploadedHistory.modal.drag')}{' '}
                  <span className="cursor-pointer text-base leading-5 font-normal text-(--color-upload-modal-drop-zone-text-highlight)">
                    {t('uploadedHistory.modal.browse')}
                  </span>
                </p>
              </div>
            </div>
          </button>
          {errorMessage && (
            <div className="mt-4 rounded-md bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
