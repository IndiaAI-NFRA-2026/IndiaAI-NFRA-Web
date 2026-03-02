import { useMemo } from 'react';

interface FieldInformation {
  key: string;
  label: string;
  value: string;
  confidence?: number;
}

function toValue(val: unknown, noData: string): string {
  if (val == null) return noData;
  if (typeof val === 'object' && val !== null && 'value' in val) {
    const v = (val as { value?: string }).value;
    return v ?? noData;
  }
  return String(val);
}

export function useFieldFinancialInformation(extractedData: any, t: (key: string) => string, originalData?: any): FieldInformation[] {
  return useMemo(() => {
    const noData = t('documentDetail.extractedData.noData');
    const getConfidence = (fieldKey: string): number | undefined => {
      if (!originalData) return undefined;
      const dataSource = originalData.data || originalData;
      const field = dataSource[fieldKey];
      if (!field) return undefined;
      const confidence = field.confidence_score;
      return confidence ? Number.parseFloat(String(confidence)) : undefined;
    };

    return [
      {
        key: 'vendor_name',
        label: t('documentDetail.extractedData.fields.vendorName'),
        value: toValue(extractedData?.vendor_name, noData),
        confidence: getConfidence('vendor_name'),
      },
      {
        key: 'financial_year',
        label: t('documentDetail.extractedData.fields.documentDate'),
        value: toValue(extractedData?.financial_year, noData),
        confidence: getConfidence('financial_year'),
      },
      {
        key: 'currency',
        label: t('documentDetail.extractedData.fields.currency'),
        value: toValue(extractedData?.currency, noData),
        confidence: getConfidence('currency'),
      },
    ];
  }, [extractedData, t, originalData]);
}
