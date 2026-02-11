'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import type { CellContext, ColumnDef } from '@tanstack/react-table';
import type { FinancialTableRow, FinancialTableSectionProps } from '@/types/documents';
import { formatNumber } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { ScoreBadge } from '@/components/upload-history/document-detail/score-badge';
import { sanitizeNumericInputNoComma } from '@/lib/utils/helpers';

const MAX_INPUT_LENGTH = 20;

const CategoryCell = ({ category }: Readonly<{ category: string }>) => <div className="text-sm text-gray-900">{category}</div>;

interface AmountCellProps {
  rowData: FinancialTableRow;
  isEditing: boolean;
  handleNumericChange: (fieldKey: string, value: string) => void;
  handlePaste: (e: React.ClipboardEvent<HTMLInputElement>, fieldKey: string) => void;
  getError: (fieldKey: string) => string | undefined;
}

const AmountCell = ({ rowData, isEditing, handleNumericChange, handlePaste, getError }: Readonly<AmountCellProps>) => {
  const fieldKeyStr = rowData.fieldKey ? String(rowData.fieldKey) : '';
  const [localError, setLocalError] = React.useState<string | undefined>(() => getError(fieldKeyStr));
  const hasError = !!localError;

  let content: React.ReactNode;
  if (isEditing && rowData.fieldKey) {
    content = (
      <div className="flex flex-col">
        <Input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={rowData.amount || ''}
          onChange={(e) => {
            handleNumericChange(fieldKeyStr, e.target.value);
            setTimeout(() => setLocalError(getError(fieldKeyStr)), 0);
          }}
          onPaste={(e) => handlePaste(e, fieldKeyStr)}
          className={`w-full text-left ${hasError ? 'border-red-500' : ''}`}
        />
        {hasError && localError && <p className="mt-1 text-xs text-red-500">{localError}</p>}
      </div>
    );
  } else if (rowData.amount || rowData.amount === '0') {
    content = formatNumber(rowData.amount);
  } else {
    content = '';
  }

  return <div className="text-left text-sm text-gray-900">{content}</div>;
};

const ScoreCell = ({ score }: Readonly<{ score?: number }>) => (
  <div className="flex items-center justify-center">
    <ScoreBadge score={score} />
  </div>
);

const ScoreHeader = ({ t }: { t: (key: string) => string }) => (
  <div className="w-full text-center">{t('documentDetail.extractedData.tableColumns.score')}</div>
);

export function FinancialTableSection({
  title,
  data,
  isEditing = false,
  onUpdateField = () => {},
  isExpanded,
  onToggleExpand,
}: Readonly<FinancialTableSectionProps>) {
  const { t } = useLanguage();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const sanitizeNumericInput = useCallback((value: string): string => {
    return sanitizeNumericInputNoComma(value, MAX_INPUT_LENGTH);
  }, []);

  const handleNumericChange = useCallback(
    (fieldKey: string, value: string) => {
      const originalLength = value.length;
      const sanitized = sanitizeNumericInput(value);
      const sanitizedLength = sanitized.length;

      if (originalLength > MAX_INPUT_LENGTH || (sanitizedLength === MAX_INPUT_LENGTH && originalLength > sanitizedLength)) {
        setValidationErrors((prev) => ({
          ...prev,
          [fieldKey]: t('documentDetail.extractedData.maxLengthError'),
        }));
      } else {
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next[fieldKey];
          return next;
        });
      }
      onUpdateField(fieldKey, sanitized);
    },
    [sanitizeNumericInput, onUpdateField, t]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>, fieldKey: string) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      const input = e.currentTarget;
      const selectionStart = input.selectionStart || 0;
      const selectionEnd = input.selectionEnd || 0;
      const currentValue = input.value;
      const newValue = currentValue.slice(0, selectionStart) + pastedText + currentValue.slice(selectionEnd);
      handleNumericChange(fieldKey, newValue);
      setTimeout(() => {
        const sanitized = sanitizeNumericInput(newValue);
        const newCursorPos = Math.min(selectionStart + pastedText.length, sanitized.length);
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [handleNumericChange, sanitizeNumericInput]
  );

  const validationErrorsRef = React.useRef(validationErrors);
  React.useEffect(() => {
    validationErrorsRef.current = validationErrors;
  }, [validationErrors]);

  const getError = useCallback((fieldKey: string) => validationErrorsRef.current[fieldKey], []);

  const renderAmountCell = useCallback(
    ({ row: { original } }: CellContext<FinancialTableRow, unknown>) => (
      <AmountCell
        rowData={original}
        isEditing={isEditing}
        handleNumericChange={handleNumericChange}
        handlePaste={handlePaste}
        getError={getError}
      />
    ),
    [isEditing, handleNumericChange, handlePaste, getError]
  );

  const columns: ColumnDef<FinancialTableRow>[] = useMemo(
    () => [
      {
        accessorKey: 'category',
        header: t('financialStatement.extractedData.category'),
        size: 40,
        cell: ({ row }) => <CategoryCell category={row.original.category} />,
      },
      {
        accessorKey: 'amount',
        header: t('financialStatement.extractedData.amount'),
        size: 40,
        cell: renderAmountCell,
      },
      {
        accessorKey: 'score',
        header: () => <ScoreHeader t={t} />,
        size: 20,
        cell: ({ row }) => <ScoreCell score={row.original.confidence} />,
      },
    ],
    [t, renderAmountCell]
  );

  return (
    <div className="bg-white">
      <button onClick={onToggleExpand} className="flex w-full cursor-pointer flex-row items-center gap-2 bg-white">
        <h2 className="text-normal leading-3.5 font-bold text-(--color-table-header-text-color)">{title}</h2>
        <img src="/assets/icons/expanded-icon.svg" alt="expand" className={`h-1.5 w-3.5 ${isExpanded ? '' : 'rotate-180'}`} />
      </button>
      {isExpanded && (
        <div className="mt-4">
          <div className="rounded-md [&_table]:w-full [&_table]:table-fixed [&_td:first-child]:w-[45%] [&_td:nth-child(2)]:w-[45%] [&_td:nth-child(3)]:w-[10%] [&_th:first-child]:w-[45%] [&_th:nth-child(2)]:w-[45%] [&_th:nth-child(3)]:w-[10%]">
            <DataTable columns={columns} data={data} pageSize={data.length || 10} />
          </div>
        </div>
      )}
    </div>
  );
}
