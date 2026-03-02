import { useMemo } from 'react';
import type { ExtractedBankStatementData } from '@/types/documents';

interface FieldInformation {
  key: string;
  label: string;
  value: string;
  confidence?: number;
}

export function useFieldBankInformation(
  extractedData: ExtractedBankStatementData,
  t: (key: string) => string,
  originalData?: any
): FieldInformation[] {
  return useMemo(() => {
    // Get confidence from original data if available
    const getConfidence = (fieldPath: string): number | undefined => {
      if (!originalData?.account) return undefined;
      const parts = fieldPath.split('.');
      let current: any = originalData.account;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }
      return current?.confidence;
    };

    return [
      {
        key: 'accountName',
        label: t('documentDetail.extractedData.fields.accountName'),
        value: extractedData.accountName || t('documentDetail.extractedData.noData'),
        confidence: getConfidence('account_holder_name'),
      },
      {
        key: 'accountHolderAddress',
        label: t('documentDetail.extractedData.fields.accountHolderAddress'),
        value: extractedData.accountHolderAddress || t('documentDetail.extractedData.noData'),
        confidence: getConfidence('account_holder_address'),
      },
      {
        key: 'accountCurrency',
        label: t('documentDetail.extractedData.fields.accountCurrency'),
        value: extractedData.accountCurrency || t('documentDetail.extractedData.noData'),
        confidence: getConfidence('currency'),
      },
      {
        key: 'endingBalance',
        label: t('documentDetail.extractedData.fields.endingBalance'),
        value: extractedData.endingBalance || t('documentDetail.extractedData.noData'),
        confidence: getConfidence('closing_balance'),
      },
      {
        key: 'accountNumber',
        label: t('documentDetail.extractedData.fields.accountNumber'),
        value: extractedData.accountNumber || t('documentDetail.extractedData.noData'),
        confidence: getConfidence('account_number'),
      },
      {
        key: 'bankName',
        label: t('documentDetail.extractedData.fields.bankName'),
        value: extractedData.bankName || t('documentDetail.extractedData.noData'),
        confidence: getConfidence('bank_name'),
      },
      {
        key: 'beginningBalance',
        label: t('documentDetail.extractedData.fields.beginningBalance'),
        value: extractedData.beginningBalance || t('documentDetail.extractedData.noData'),
        confidence: getConfidence('opening_balance'),
      },
    ];
  }, [extractedData, t, originalData]);
}
