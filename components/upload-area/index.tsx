import * as React from 'react';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { MAX_FILES, allowedExtensions } from '@/lib/utils/constants';

interface UploadAreaProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadArea({ handleFileChange }: UploadAreaProps) {
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
        const syntheticEvent = {
          target: {
            files: e.dataTransfer.files,
            value: '',
          },
        } as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(syntheticEvent);
      } else {
        // Clear the drag data
        e.dataTransfer.clearData();
      }
    }
  };

  return (
    <div>
      <button
        type="button"
        aria-label="File upload drop zone"
        className="relative h-[100px] w-full rounded-[4px] border border-dashed border-(--color-sidebar-primary) transition-colors"
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
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
            <p className="text-[14px] leading-[22px] font-normal text-(--color-upload-modal-drop-zone-text)">
              {t('uploadedHistory.modal.drag')}{' '}
              <span className="cursor-pointer text-[14px] leading-[22px] font-normal text-(--color-upload-modal-drop-zone-text-highlight)">
                {t('uploadedHistory.modal.browse')}
              </span>
            </p>
          </div>
        </div>
      </button>
      {errorMessage && (
        <div className="mt-4 rounded-[4px] bg-red-50 p-2">
          <p className="text-[13px] leading-[22px] text-red-600">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
