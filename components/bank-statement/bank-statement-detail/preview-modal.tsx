import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocumentDetailResponse } from '@/types/documents';
import { X } from 'lucide-react';
import { DocumentPreviewPanel } from '@/components/upload-history/document-detail/document-preview-panel';
import { ExtractedBankStatementDataPanel } from '@/components/upload-history/document-detail/extracted-bank-statement-data-panel';
import type { ExtractedBankStatementData } from '@/types/documents';
import { Button } from '@/components/button';

export function PreviewModal({
  isOpen,
  onClose,
  documentDetail,
  extractedBankStatementData,
  onUpdateField,
  onUpdateTransaction,
}: Readonly<{
  isOpen: boolean;
  onClose: () => void;
  documentDetail: DocumentDetailResponse;
  extractedBankStatementData: ExtractedBankStatementData;
  onUpdateField: (field: keyof ExtractedBankStatementData, value: string) => void;
  onUpdateTransaction: (index: number, field: string, value: string) => void;
}>) {
  const fileUrl = documentDetail?.s3_url || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-[calc(100%-24px)] w-[calc(100%-24px)] flex-col overflow-hidden bg-(--color-background-color) p-0">
        <DialogHeader className="border-b border-(--color-filters-border) px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-(--color-table-header-text-color)">
              <p className="text-lg font-bold text-black">{documentDetail?.vendor_name}</p>
              <span className="text-sm font-normal text-(--color-table-text-color)">Verified Data</span>
            </DialogTitle>
            <Button type="text" icon={<X className="size-6" />} onClick={onClose} />
          </div>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col gap-4 p-6 md:flex-row">
            <DocumentPreviewPanel fileUrl={fileUrl} />
            <ExtractedBankStatementDataPanel
              extractedData={extractedBankStatementData}
              isEditing={false}
              onUpdateField={onUpdateField}
              onUpdateTransaction={onUpdateTransaction}
              originalData={documentDetail?.data}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
