import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import type { ColumnDef } from '@tanstack/react-table';
import type { ExtractedBankStatementData } from '@/types/documents';
import { ScoreBadge } from '@/components/upload-history/document-detail/score-badge';
import { sanitizeNumericInput, sanitizeNumericInputNoComma } from '@/lib/utils/helpers';
import dayjs from 'dayjs';

const MAX_INPUT_LENGTH = 20;

interface NumericInputCellProps {
  value: string;
  onChange: (value: string) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  sanitizeFn: (value: string) => string;
  t: (key: string) => string;
}

const NumericInputCell = ({ value, onChange, onPaste, placeholder, className, sanitizeFn, t }: NumericInputCellProps) => {
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const originalLength = inputValue.length;
    const sanitized = sanitizeFn(inputValue);
    const sanitizedLength = sanitized.length;

    if (originalLength > MAX_INPUT_LENGTH || (sanitizedLength === MAX_INPUT_LENGTH && originalLength > sanitizedLength)) {
      setLocalError(t('documentDetail.extractedData.maxLengthError'));
    } else {
      setLocalError(undefined);
    }
    onChange(sanitized);
  };

  const hasError = !!localError;

  return (
    <div className="flex flex-col">
      <Input
        type="text"
        value={value || ''}
        onChange={handleChange}
        onPaste={onPaste}
        placeholder={placeholder}
        className={`${className || ''} ${hasError ? 'border-red-500' : ''}`}
      />
      {hasError && localError && <p className="mt-1 text-xs text-red-500">{localError}</p>}
    </div>
  );
};

interface TextInputCellProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  t: (key: string) => string;
}

const TextInputCell = ({ value, onChange, placeholder, className, t }: TextInputCellProps) => {
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.length > MAX_INPUT_LENGTH) {
      setLocalError(t('documentDetail.extractedData.maxLengthError'));
      onChange(inputValue.substring(0, MAX_INPUT_LENGTH));
    } else {
      setLocalError(undefined);
      onChange(inputValue);
    }
  };

  const hasError = !!localError;

  return (
    <div className="flex flex-col">
      <Input
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${className || ''} ${hasError ? 'border-red-500' : ''}`}
        maxLength={MAX_INPUT_LENGTH}
      />
      {hasError && localError && <p className="mt-1 text-xs text-red-500">{localError}</p>}
    </div>
  );
};

interface BankStatementColumnsParams {
  t: (key: string) => string;
  isEditing: boolean;
  onUpdateTransaction: (index: number, field: string, value: string) => void;
}

export function getBankStatementColumns({
  t,
  isEditing,
  onUpdateTransaction,
}: BankStatementColumnsParams): ColumnDef<ExtractedBankStatementData['transactions'][0], unknown>[] {
  const noDataText = '';

  const handleNumericPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number,
    field: string,
    sanitizeFn: (value: string) => string
  ) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const input = e.currentTarget;
    const selectionStart = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;
    const currentValue = input.value;
    const newValue = currentValue.slice(0, selectionStart) + pastedText + currentValue.slice(selectionEnd);
    const sanitized = sanitizeFn(newValue);
    onUpdateTransaction(index, field, sanitized);
    setTimeout(() => {
      const newCursorPos = Math.min(selectionStart + pastedText.length, sanitized.length);
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatted = (number: number | string) => new Intl.NumberFormat('en-US').format(Number(number));

  return [
    {
      accessorKey: 'date',
      header: t('documentDetail.extractedData.tableColumns.date'),
      cell: ({ row }) => {
        const index = row.index;
        const transaction = row.original;
        const value = transaction.date?.value || null;

        return isEditing ? (
          <DatePicker
            key={`date-${index}`}
            value={value || ''}
            onDateChange={(dateValue) => {
              onUpdateTransaction(index, 'date', dateValue);
              onUpdateTransaction(index, 'month', dayjs(dateValue, 'YYYY-MM-DD').format('YYYY-MM'));
            }}
            placeholder={t('documentDetail.extractedData.enterValue')}
            className="w-full text-sm"
          />
        ) : (
          <span className="text-sm text-gray-900">{value || noDataText}</span>
        );
      },
    },
    {
      accessorKey: 'description',
      header: t('documentDetail.extractedData.tableColumns.description'),
      cell: ({ row }) => {
        const index = row.index;
        const transaction = row.original;
        const value = transaction.description?.value || null;

        return isEditing ? (
          <TextInputCell
            key={`description-${index}`}
            value={value || ''}
            onChange={(newValue) => onUpdateTransaction(index, 'description', newValue)}
            placeholder={t('documentDetail.extractedData.enterValue')}
            className="w-full min-w-[150px] text-sm"
            t={t}
          />
        ) : (
          <span className="text-sm text-gray-900">{value || noDataText}</span>
        );
      },
    },
    {
      accessorKey: 'debit',
      header: t('documentDetail.extractedData.tableColumns.debit'),
      cell: ({ row }) => {
        const index = row.index;
        const transaction = row.original;
        const rawValue = (transaction.debit as { raw?: string })?.raw || '';
        const value = rawValue ? rawValue.replaceAll(',', '') : '';

        return isEditing ? (
          <NumericInputCell
            key={`debit-${index}`}
            value={value || ''}
            onChange={(newValue) => onUpdateTransaction(index, 'debit', newValue)}
            onPaste={(e) => handleNumericPaste(e, index, 'debit', sanitizeNumericInput)}
            placeholder={t('documentDetail.extractedData.enterValue')}
            className="w-full min-w-[110px] text-sm"
            sanitizeFn={sanitizeNumericInput}
            t={t}
          />
        ) : (
          <span className="text-sm text-gray-900">{value ? formatted(transaction.debit?.value || 0) : noDataText}</span>
        );
      },
    },
    {
      accessorKey: 'credit',
      header: t('documentDetail.extractedData.tableColumns.credit'),
      cell: ({ row }) => {
        const index = row.index;
        const transaction = row.original;
        const rawValue = (transaction.credit as { raw?: string })?.raw || '';
        const value = rawValue ? rawValue.replaceAll(',', '') : '';

        return isEditing ? (
          <NumericInputCell
            key={`credit-${index}`}
            value={value || ''}
            onChange={(newValue) => onUpdateTransaction(index, 'credit', newValue)}
            onPaste={(e) => handleNumericPaste(e, index, 'credit', sanitizeNumericInputNoComma)}
            placeholder={t('documentDetail.extractedData.enterValue')}
            className="w-full min-w-[110px] text-sm"
            sanitizeFn={sanitizeNumericInputNoComma}
            t={t}
          />
        ) : (
          <span className="text-sm text-gray-900">{value ? formatted(transaction.credit?.value || 0) : noDataText}</span>
        );
      },
    },
    {
      accessorKey: 'balance',
      header: t('documentDetail.extractedData.tableColumns.balance'),
      cell: ({ row }) => {
        const index = row.index;
        const transaction = row.original;
        const rawValue = (transaction.running_balance as { raw?: string })?.raw || '';
        const value = rawValue ? rawValue.replaceAll(',', '') : '';

        return isEditing ? (
          <NumericInputCell
            key={`running_balance-${index}`}
            value={value || ''}
            onChange={(newValue) => onUpdateTransaction(index, 'running_balance', newValue)}
            onPaste={(e) => handleNumericPaste(e, index, 'running_balance', sanitizeNumericInputNoComma)}
            placeholder={t('documentDetail.extractedData.enterValue')}
            className="w-full min-w-[120px] text-sm"
            sanitizeFn={sanitizeNumericInputNoComma}
            t={t}
          />
        ) : (
          <span className="text-sm text-gray-900">{value ? formatted(transaction.running_balance?.value || 0) : noDataText}</span>
        );
      },
    },
    {
      accessorKey: 'score',
      header: t('documentDetail.extractedData.tableColumns.score'),
      cell: ({ row }) => {
        const transaction = row.original;
        const confidences = [
          transaction.date?.confidence,
          transaction.description?.confidence,
          transaction.debit?.confidence,
          transaction.credit?.confidence,
          transaction.running_balance?.confidence,
        ].filter((c): c is number => c !== undefined && c !== null);
        const maxConfidence = confidences.length > 0 ? Math.max(...confidences) : undefined;
        return (
          <div className="flex items-center justify-center">
            <ScoreBadge score={maxConfidence} />
          </div>
        );
      },
    },
  ];
}
