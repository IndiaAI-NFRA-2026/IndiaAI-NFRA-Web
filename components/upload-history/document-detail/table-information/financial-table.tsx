'use client';

import { useState, useMemo } from 'react';
import { FinancialTableSection } from './financial-table-section';
import type { FinancialTableProps, FinancialTableRow } from '@/types/documents';
import { fieldTableBalanceSheet, fieldTableIncome, fieldTableCashFlow } from '@/lib/utils/constants';
import { transformFieldToRow } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/useLanguage';

export function FinancialTable({ extractedData, isEditing, onUpdateField }: Readonly<FinancialTableProps>) {
  const { t } = useLanguage();
  const [isExpandedBalanceSheet, setIsExpandedBalanceSheet] = useState(true);
  const [isExpandedIncomeStatement, setIsExpandedIncomeStatement] = useState(true);
  const [isExpandedCashFlowStatement, setIsExpandedCashFlowStatement] = useState(true);

  const [isExpanded, setIsExpanded] = useState(true);

  const onToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const balanceSheetData = useMemo<FinancialTableRow[]>(() => {
    return fieldTableBalanceSheet && extractedData ? fieldTableBalanceSheet.map((field) => transformFieldToRow(field, extractedData)) : [];
  }, [extractedData]);

  const incomeStatementData = useMemo<FinancialTableRow[]>(() => {
    return fieldTableIncome && extractedData ? fieldTableIncome.map((field) => transformFieldToRow(field, extractedData)) : [];
  }, [extractedData]);

  const cashFlowStatementData = useMemo<FinancialTableRow[]>(() => {
    return fieldTableCashFlow && extractedData ? fieldTableCashFlow.map((field) => transformFieldToRow(field, extractedData)) : [];
  }, [extractedData]);

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded border border-(--color-filters-border) bg-white">
        <button
          onClick={onToggleExpand}
          className="flex w-full cursor-pointer flex-row items-center justify-between border-b border-(--color-filters-border) bg-white px-4 py-2"
        >
          <h2 className="text-normal leading-3.5 font-bold text-(--color-table-header-text-color)">
            {t('documentDetail.extractedData.table')}
          </h2>
          <img src="/assets/icons/expanded-icon.svg" alt="expand" className={`h-1.5 w-3.5 ${isExpanded ? '' : 'rotate-180'}`} />
        </button>
        {isExpanded && (
          <div className="flex max-h-[600px] flex-col gap-4 overflow-y-auto p-4">
            <FinancialTableSection
              title={t('financialStatement.extractedData.balanceSheet')}
              data={balanceSheetData}
              isEditing={isEditing}
              onUpdateField={onUpdateField}
              isExpanded={isExpandedBalanceSheet}
              onToggleExpand={() => setIsExpandedBalanceSheet(!isExpandedBalanceSheet)}
            />

            <FinancialTableSection
              title={t('financialStatement.extractedData.incomeStatement')}
              data={incomeStatementData}
              isEditing={isEditing}
              onUpdateField={onUpdateField}
              isExpanded={isExpandedIncomeStatement}
              onToggleExpand={() => setIsExpandedIncomeStatement(!isExpandedIncomeStatement)}
            />

            <FinancialTableSection
              title={t('financialStatement.extractedData.cashFlowStatement')}
              data={cashFlowStatementData}
              isEditing={isEditing}
              onUpdateField={onUpdateField}
              isExpanded={isExpandedCashFlowStatement}
              onToggleExpand={() => setIsExpandedCashFlowStatement(!isExpandedCashFlowStatement)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
