import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { useLanguage } from '@/lib/i18n/useLanguage';
import type { ExtractionFinancialStatementData } from '@/types/documents';
import { ScoreBadge } from '@/components/upload-history/document-detail/score-badge';

const MAX_INPUT_LENGTH = 20;

// Helper function to convert "31-Mar-2023" to "2023-03-31" for date input
const convertToDateInputFormat = (dateStr: string): string => {
  if (!dateStr || dateStr === '') return '';

  // Check if already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Try to parse "31-Mar-2023" format
  const months: Record<string, string> = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
  };

  // Match patterns like "31-Mar-2023" or "31 Mar 2023"
  const match = /^(\d{1,2})[- ]([A-Za-z]{3})[- ](\d{4})$/.exec(dateStr);
  if (match) {
    const [, day, month, year] = match;
    const monthNum = months[month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()];
    if (monthNum) {
      return `${year}-${monthNum}-${day.padStart(2, '0')}`;
    }
  }

  // Try to parse as Date object
  try {
    const date = new Date(dateStr);
    if (!Number.isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Ignore parse errors
  }

  return '';
};

// Helper function to convert "2023-03-31" to "31-Mar-2023"
const convertToDisplayFormat = (dateStr: string): string => {
  if (!dateStr || dateStr === '') return '';

  // Check if already in "31-Mar-2023" format
  if (/^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  // Try to parse YYYY-MM-DD format
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (match) {
    const [, year, month, day] = match;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = Number.parseInt(month, 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${Number.parseInt(day, 10)}-${months[monthIndex]}-${year}`;
    }
  }

  // Try to parse as Date object
  try {
    const date = new Date(dateStr);
    if (!Number.isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day}-${months[month]}-${year}`;
    }
  } catch {
    // Ignore parse errors
  }

  return dateStr;
};

interface ExtractedFinancialStatementInformationProps {
  isEditing: boolean;
  onUpdateField: (field: keyof ExtractionFinancialStatementData, value: string) => void;
  isExpandedDocumentInformation: boolean;
  setIsExpandedDocumentInformation: (isExpanded: boolean) => void;
  fields: Array<{
    key: string;
    label: string;
    value: string;
    confidence?: number;
  }>;
  getFieldStatus: (value: string) => 'extracted' | 'missing';
}

export function ExtractedFinancialStatementInformation({
  isEditing,
  onUpdateField,
  isExpandedDocumentInformation,
  setIsExpandedDocumentInformation,
  fields,
  getFieldStatus,
}: Readonly<ExtractedFinancialStatementInformationProps>) {
  const { t } = useLanguage();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const sanitizeTextInput = useCallback((value: string): string => {
    if (!value) return '';

    // Check length limit
    if (value.length > MAX_INPUT_LENGTH) {
      return value.substring(0, MAX_INPUT_LENGTH);
    }

    return value;
  }, []);

  const handleTextChange = useCallback(
    (fieldKey: string, value: string) => {
      const originalLength = value.length;
      const sanitized = sanitizeTextInput(value);
      const sanitizedLength = sanitized.length;

      // Only show error when user tries to input more after reaching exactly 20 characters
      if (sanitizedLength === MAX_INPUT_LENGTH && originalLength > sanitizedLength) {
        setValidationErrors((prev) => ({
          ...prev,
          [fieldKey]: t('documentDetail.extractedData.maxLengthError') || `Input is limited to ${MAX_INPUT_LENGTH} characters`,
        }));
      } else if (sanitizedLength < MAX_INPUT_LENGTH) {
        // Clear error if under limit
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldKey];
          return newErrors;
        });
      }

      onUpdateField(fieldKey as keyof ExtractionFinancialStatementData, sanitized);
    },
    [sanitizeTextInput, onUpdateField, t]
  );

  return (
    <div className="rounded border border-(--color-filters-border) bg-white">
      <button
        onClick={() => setIsExpandedDocumentInformation(!isExpandedDocumentInformation)}
        className="flex w-full cursor-pointer flex-row items-center justify-between bg-white px-4 py-2"
      >
        <h2 className="text-[14px] leading-5 font-bold text-(--color-table-header-text-color)">
          {t('documentDetail.extractedData.documentInformation')}
        </h2>
        <img
          src="/assets/icons/expanded-icon.svg"
          alt="expand"
          className={`h-1.5 w-3.5 ${isExpandedDocumentInformation ? '' : 'rotate-180'}`}
        />
      </button>
      {isExpandedDocumentInformation && (
        <div className="flex-1 overflow-y-auto border-t border-(--color-filters-border) px-6 py-4">
          {/* Document Information Fields */}
          <div className="space-y-4">
            {fields.map((field) => {
              const status = getFieldStatus(field.value);
              const hasError = !!validationErrors[field.key];
              return (
                <div key={field.key} className="flex min-h-8 flex-row">
                  <div className="flex min-h-8 w-full flex-row justify-between">
                    <div className="flex flex-row items-center gap-2">
                      {status === 'extracted' ? (
                        <img src="/assets/icons/check-icon.svg" alt="check" className="h-4 w-4" />
                      ) : (
                        <img src="/assets/icons/view-icon.svg" alt="check" className="h-4 w-4" />
                      )}

                      <label className="block text-sm font-medium text-(--color-muted-foreground)">{field.label}</label>
                    </div>
                    <div className="flex w-2/3 items-center justify-end gap-2">
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          (() => {
                            const isFinancialYear = field.key === 'financial_year';
                            const inputValue = field.value === t('documentDetail.extractedData.noData') ? '' : field.value;

                            return isFinancialYear ? (
                              <DatePicker
                                value={inputValue ? convertToDateInputFormat(inputValue) : ''}
                                onDateChange={(dateInputValue) => {
                                  const displayFormat = convertToDisplayFormat(dateInputValue);
                                  onUpdateField(field.key as keyof ExtractionFinancialStatementData, displayFormat || dateInputValue);
                                }}
                                placeholder={t('documentDetail.extractedData.enterValue')}
                                className="w-full py-1.5"
                              />
                            ) : (
                              <div className="flex flex-col" key={`text-input-${field.key}`}>
                                <Input
                                  key={`text-${field.key}`}
                                  value={inputValue}
                                  onChange={(e) => handleTextChange(field.key, e.target.value)}
                                  placeholder={t('documentDetail.extractedData.enterValue')}
                                  className={`w-full py-1.5 ${hasError ? 'border-red-500' : ''}`}
                                />
                                {hasError && <p className="mt-1 text-xs text-red-500">{validationErrors[field.key]}</p>}
                              </div>
                            );
                          })()
                        ) : (
                          <p className="text-right text-sm text-(--color-muted-foreground)">
                            {field.value || t('documentDetail.extractedData.noData')}
                          </p>
                        )}
                      </div>
                      {field.confidence !== undefined && <ScoreBadge score={field.confidence} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
