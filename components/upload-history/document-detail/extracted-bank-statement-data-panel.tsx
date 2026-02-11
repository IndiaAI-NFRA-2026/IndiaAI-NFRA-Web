'use client';

import type { ExtractedBankStatementData, MonthlySummary } from '@/types/documents';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { getBankStatementColumns } from '@/components/upload-history/document-detail/bank-statement-document-columns';
import { ExtractedBankStatementInformation } from '@/components/upload-history/document-detail/extracted-bank-statement-information';
import { useFieldBankInformation } from '@/components/upload-history/document-detail/field-bank-information';
import { BankTransactionsTable } from '@/components/upload-history/document-detail/bank-transactions-table';
interface ExtractedBankStatementDataPanelProps {
  extractedData: ExtractedBankStatementData;
  isEditing?: boolean;
  onUpdateField: (field: keyof ExtractedBankStatementData, value: string) => void;
  onUpdateTransaction: (index: number, field: string, value: string) => void;
  originalData?: any;
}

export function ExtractedBankStatementDataPanel({
  extractedData,
  isEditing = true,
  onUpdateField,
  onUpdateTransaction,
  originalData,
}: Readonly<ExtractedBankStatementDataPanelProps>) {
  const { t } = useLanguage();
  const [isExpandedDocumentInformation, setIsExpandedDocumentInformation] = useState(true);

  const originalExtractedDataRef = useRef<ExtractedBankStatementData | null>(null);

  const hasRealData = useMemo(() => {
    return (
      (extractedData.accountName && extractedData.accountName.trim() !== '') ||
      (extractedData.accountNumber && extractedData.accountNumber.trim() !== '') ||
      (extractedData.bankName && extractedData.bankName.trim() !== '') ||
      (extractedData.accountHolderAddress && extractedData.accountHolderAddress.trim() !== '') ||
      (extractedData.transactions && extractedData.transactions.length > 0)
    );
  }, [extractedData]);

  useEffect(() => {
    if (!originalExtractedDataRef.current && hasRealData) {
      originalExtractedDataRef.current = { ...extractedData };
    }
  }, [extractedData, hasRealData]);

  const getBalanceStatus = (fieldKey: string): 'extracted' | 'missing' | null => {
    if (
      !extractedData.monthlySummaries ||
      (extractedData.monthlySummaries && (extractedData?.monthlySummaries as MonthlySummary[])?.length === 0)
    ) {
      return null;
    }

    if (fieldKey === 'beginningBalance') {
      const openingBalance = extractedData.monthlySummaries[0]?.opening_balance;
      return openingBalance && 'value' in openingBalance && openingBalance.value ? 'extracted' : 'missing';
    }

    if (fieldKey === 'endingBalance') {
      const closingBalance = extractedData.monthlySummaries.at(-1)?.closing_balance;
      return closingBalance && 'value' in closingBalance && closingBalance.value ? 'extracted' : 'missing';
    }

    return null;
  };

  const checkObjectValue = (originalValue: unknown): 'extracted' | 'missing' | null => {
    if (typeof originalValue !== 'object' || originalValue === null || !('value' in originalValue)) {
      return null;
    }

    const value = (originalValue as any).value;
    return value && String(value).trim() !== '' ? 'extracted' : 'missing';
  };

  const checkStringValue = (originalValue: unknown): 'extracted' | 'missing' => {
    if (originalValue && typeof originalValue === 'object' && originalValue !== null) {
      // For objects, check if it has meaningful content
      try {
        const stringified = JSON.stringify(originalValue);
        if (stringified !== '{}' && stringified !== '[]' && stringified.trim() !== '') {
          return 'extracted';
        }
      } catch {
        // If stringify fails, treat as missing
        return 'missing';
      }
    } else if (originalValue && typeof originalValue !== 'object' && originalValue !== null) {
      // For primitive types (string, number, boolean, etc.), check if stringified value is non-empty
      let stringValue: string;
      if (typeof originalValue === 'string') {
        stringValue = originalValue;
      } else if (typeof originalValue === 'number' || typeof originalValue === 'boolean' || typeof originalValue === 'bigint') {
        stringValue = String(originalValue);
      } else {
        // For other primitives (symbol, undefined), skip as they shouldn't be stringified
        return 'missing';
      }
      if (stringValue.trim() !== '') {
        return 'extracted';
      }
    }
    return 'missing';
  };

  const getFieldStatus = (fieldKey: string) => {
    const originalData = originalExtractedDataRef.current || extractedData;
    const originalValue = originalData[fieldKey as keyof ExtractedBankStatementData] as string | undefined;

    if (fieldKey === 'beginningBalance' || fieldKey === 'endingBalance') {
      const balanceStatus = getBalanceStatus(fieldKey);
      if (balanceStatus !== null) {
        return balanceStatus;
      }
    }

    const objectValueStatus = checkObjectValue(originalValue);
    if (objectValueStatus !== null) {
      return objectValueStatus;
    }

    return checkStringValue(originalValue);
  };

  const transactionColumns = useMemo(
    () =>
      getBankStatementColumns({
        t,
        isEditing,
        onUpdateTransaction,
      }),
    [isEditing, onUpdateTransaction, t]
  );

  const fields = useFieldBankInformation(extractedData, t, originalData);

  return (
    <div className="flex flex-1 flex-col md:w-1/2">
      <ExtractedBankStatementInformation
        isEditing={isEditing}
        onUpdateField={onUpdateField}
        isExpandedDocumentInformation={isExpandedDocumentInformation}
        setIsExpandedDocumentInformation={setIsExpandedDocumentInformation}
        fields={fields}
        getFieldStatus={getFieldStatus}
      />
      {/* Transactions Table */}
      <div className="mt-4">
        <BankTransactionsTable transactionColumns={transactionColumns} extractedData={extractedData} />
      </div>
    </div>
  );
}
