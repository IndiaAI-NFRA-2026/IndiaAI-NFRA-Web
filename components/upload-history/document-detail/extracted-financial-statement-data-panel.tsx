'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { ExtractedFinancialStatementInformation } from '@/components/upload-history/document-detail/extracted-financial-statement-information';
import { useFieldFinancialInformation } from '@/components/upload-history/document-detail/field-financial-information';
import { FinancialTable } from '@/components/upload-history/document-detail/table-information/financial-table';
interface ExtractedFinancialStatementDataPanelProps {
  extractedData: any;
  isEditing: boolean;
  onUpdateField: (field: keyof any, value: string) => void;
  originalData?: any;
}

export function ExtractedFinancialStatementDataPanel({
  extractedData,
  isEditing,
  onUpdateField,
  originalData,
}: Readonly<ExtractedFinancialStatementDataPanelProps>) {
  const { t } = useLanguage();
  const [isExpandedDocumentInformation, setIsExpandedDocumentInformation] = useState(true);
  const getFieldStatus = (value: string) => {
    if (!value || value === t('documentDetail.extractedData.noData')) return 'missing';
    return 'extracted';
  };

  const fields = useFieldFinancialInformation(extractedData, t, originalData);

  return (
    <div className="flex w-full flex-col md:w-1/2">
      <ExtractedFinancialStatementInformation
        isEditing={isEditing}
        onUpdateField={onUpdateField}
        isExpandedDocumentInformation={isExpandedDocumentInformation}
        setIsExpandedDocumentInformation={setIsExpandedDocumentInformation}
        fields={fields}
        getFieldStatus={getFieldStatus}
      />
      {/* Financial Tables */}
      <FinancialTable extractedData={extractedData} isEditing={isEditing} onUpdateField={onUpdateField} />
    </div>
  );
}
