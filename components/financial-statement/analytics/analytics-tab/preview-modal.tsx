import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocumentDetailResponse, FinancialStatementExtractionData } from '@/types/documents';
import { DocumentPreviewPanel } from '@/components/upload-history/document-detail/document-preview-panel';
import { ExtractedFinancialStatementDataPanel } from '@/components/upload-history/document-detail/extracted-financial-statement-data-panel';
import { Button } from '@/components/button';
import { X } from 'lucide-react';

export function PreviewModal({
  isOpen,
  onClose,
  extractedData,
  extractedFinancialStatementData,
  updateFinancialStatementField,
}: Readonly<{
  isOpen: boolean;
  onClose: () => void;
  extractedData: DocumentDetailResponse;
  extractedFinancialStatementData: FinancialStatementExtractionData;
  updateFinancialStatementField: (field: keyof any, value: string) => void;
}>) {
  const fileUrl = extractedData?.s3_url || '';
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-[calc(100%-24px)] w-[calc(100%-24px)] flex-col overflow-hidden bg-(--color-background-color) p-0">
        <DialogHeader className="border-b border-(--color-filters-border) px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-(--color-table-header-text-color)">
              <p className="text-lg font-bold text-black">{extractedData?.vendor_name}</p>
              <span className="text-sm font-normal text-(--color-table-text-color)">Verified Data</span>
            </DialogTitle>
            <Button onClick={onClose} type="text" icon={<X className="size-6" />} />
          </div>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-6">
          <div className="flex flex-col gap-4 px-4 md:flex-row">
            <DocumentPreviewPanel fileUrl={fileUrl} />
            <ExtractedFinancialStatementDataPanel
              extractedData={extractedFinancialStatementData}
              isEditing={false}
              onUpdateField={updateFinancialStatementField}
              originalData={extractedData?.data}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
