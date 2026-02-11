'use client';

import dynamic from 'next/dynamic';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { ExcelPreview } from './excel-preview';

const PdfPreview = dynamic(() => import('./pdf-preview').then((mod) => ({ default: mod.PdfPreview })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <p className="text-sm text-gray-600">Loading PDF viewer...</p>
    </div>
  ),
});

interface DocumentPreviewPanelProps {
  fileUrl: string;
}

type FileType = 'pdf' | 'xlsx' | 'xls' | 'csv' | 'unknown';

function getFileType(fileUrl: string): FileType {
  const url = fileUrl.toLowerCase();
  if (url.endsWith('.pdf')) return 'pdf';
  if (url.endsWith('.xlsx')) return 'xlsx';
  if (url.endsWith('.xls')) return 'xls';
  if (url.endsWith('.csv')) return 'csv';
  return 'unknown';
}

export function DocumentPreviewPanel({ fileUrl }: Readonly<DocumentPreviewPanelProps>) {
  const { t } = useLanguage();
  const fileType = getFileType(fileUrl);

  const renderPreview = () => {
    switch (fileType) {
      case 'pdf':
        return <PdfPreview fileUrl={fileUrl} />;

      case 'xlsx':
      case 'xls':
      case 'csv':
        return <ExcelPreview fileUrl={fileUrl} fileType={fileType} />;

      default:
        return (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-sm text-gray-600">{t('documentDetail.preview.unsupportedFileType')}</p>
          </div>
        );
    }
  };

  return (
    <div className="flex w-full flex-col rounded border border-(--color-filters-border) bg-white md:w-1/2 md:min-w-1/2">
      <div className="border-b border-(--color-filters-border) bg-white px-4 py-2">
        <h2 className="text-[14px] leading-5 font-bold text-(--color-table-header-text-color)">{t('documentDetail.preview.title')}</h2>
      </div>
      <div className="flex-1 p-1">{renderPreview()}</div>
    </div>
  );
}
