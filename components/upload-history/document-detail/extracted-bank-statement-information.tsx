import React, { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n/useLanguage';
import type { ExtractedBankStatementData } from '@/types/documents';
import { ScoreBadge } from '@/components/upload-history/document-detail/score-badge';
import { sanitizeNumericInput } from '@/lib/utils/helpers';

interface ExtractedBankStatementInformationProps {
  isEditing: boolean;
  onUpdateField: (field: keyof ExtractedBankStatementData, value: string) => void;
  isExpandedDocumentInformation: boolean;
  setIsExpandedDocumentInformation: (isExpanded: boolean) => void;
  fields: Array<{
    key: string;
    label: string;
    value: string;
    confidence?: number;
  }>;
  getFieldStatus: (fieldKey: string) => 'extracted' | 'missing';
}

const MAX_INPUT_LENGTH = 20;

export function ExtractedBankStatementInformation({
  isEditing,
  onUpdateField,
  isExpandedDocumentInformation,
  setIsExpandedDocumentInformation,
  fields,
  getFieldStatus,
}: Readonly<ExtractedBankStatementInformationProps>) {
  const { t } = useLanguage();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Helper function to sanitize numeric input for balance fields (allows positive, negative, decimals, and comma as thousand separator)
  const sanitizeBalanceInput = useCallback((value: string): string => {
    return sanitizeNumericInput(value, MAX_INPUT_LENGTH);
  }, []);

  // Helper function to sanitize numeric input for account number (only digits, no decimals, no minus)
  const sanitizeAccountNumberInput = useCallback((value: string): string => {
    if (!value) return '';
    // Only allow digits
    let cleaned = value.replaceAll(/\D/g, '');
    if (cleaned.length > MAX_INPUT_LENGTH) {
      cleaned = cleaned.substring(0, MAX_INPUT_LENGTH);
    }

    return cleaned;
  }, []);

  const sanitizeTextInput = useCallback((value: string): string => {
    if (!value) return '';

    // Check length limit
    if (value.length > MAX_INPUT_LENGTH) {
      return value.substring(0, MAX_INPUT_LENGTH);
    }

    return value;
  }, []);

  // Handler for numeric fields
  const handleNumericChange = useCallback(
    (fieldKey: string, value: string, isAccountNumber: boolean = false) => {
      const originalLength = value.length;
      const sanitized = isAccountNumber ? sanitizeAccountNumberInput(value) : sanitizeBalanceInput(value);
      const sanitizedLength = sanitized.length;

      // Only show error when user tries to input more after reaching exactly 20 characters
      // Check if sanitized is at max length AND original value was longer (user tried to add more)
      if (sanitizedLength === MAX_INPUT_LENGTH && originalLength > sanitizedLength) {
        setValidationErrors((prev) => ({
          ...prev,
          [fieldKey]:
            t('documentDetail.extractedData.maxLengthError') ||
            `Input is limited to ${MAX_INPUT_LENGTH} characters including decimal places`,
        }));
      } else if (sanitizedLength < MAX_INPUT_LENGTH) {
        // Clear error if under limit
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldKey];
          return newErrors;
        });
      }
      // If sanitizedLength === MAX_INPUT_LENGTH and value.length === sanitizedLength, keep current error state

      onUpdateField(fieldKey as keyof ExtractedBankStatementData, sanitized);
    },
    [sanitizeBalanceInput, sanitizeAccountNumberInput, onUpdateField, t]
  );

  // Handler for text fields
  const handleTextChange = useCallback(
    (fieldKey: string, value: string) => {
      const sanitized = sanitizeTextInput(value);

      // Check if input was truncated due to length limit
      if (value.length > MAX_INPUT_LENGTH) {
        setValidationErrors((prev) => ({
          ...prev,
          [fieldKey]: t('documentDetail.extractedData.maxLengthError') || `Input is limited to ${MAX_INPUT_LENGTH} characters`,
        }));
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldKey];
          return newErrors;
        });
      }

      onUpdateField(fieldKey as keyof ExtractedBankStatementData, sanitized);
    },
    [sanitizeTextInput, onUpdateField, t]
  );

  // Handler to sanitize pasted content
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>, fieldKey: string, isAccountNumber: boolean = false) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      const input = e.currentTarget;
      const selectionStart = input.selectionStart || 0;
      const selectionEnd = input.selectionEnd || 0;
      const currentValue = input.value;

      const newValue = currentValue.slice(0, selectionStart) + pastedText + currentValue.slice(selectionEnd);

      handleNumericChange(fieldKey, newValue, isAccountNumber);
    },
    [handleNumericChange]
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
              const status = getFieldStatus(field.key);
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
                            const isNumericField =
                              field.key === 'endingBalance' || field.key === 'beginningBalance' || field.key === 'accountNumber';
                            const isAccountNumber = field.key === 'accountNumber';
                            const inputValue = field.value === t('documentDetail.extractedData.noData') ? '' : field.value;

                            return isNumericField ? (
                              <div className="flex flex-col" key={`numeric-input-${field.key}`}>
                                <Input
                                  key={`numeric-${field.key}`}
                                  type="text"
                                  inputMode={isAccountNumber ? 'numeric' : 'decimal'}
                                  value={inputValue}
                                  onChange={(e) => handleNumericChange(field.key, e.target.value, isAccountNumber)}
                                  onPaste={(e) => handlePaste(e, field.key, isAccountNumber)}
                                  placeholder={t('documentDetail.extractedData.enterValue')}
                                  className={`w-full py-1.5 ${hasError ? 'border-red-500' : ''}`}
                                />
                                {hasError && <p className="mt-1 text-xs text-red-500">{validationErrors[field.key]}</p>}
                              </div>
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
