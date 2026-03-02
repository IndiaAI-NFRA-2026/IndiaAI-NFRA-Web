'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { useLanguage } from '@/lib/i18n/useLanguage';

interface BankTransactionsTableProps {
  transactionColumns: unknown[];
  extractedData: { transactions: unknown[] };
}

export function BankTransactionsTable({ transactionColumns, extractedData }: Readonly<BankTransactionsTableProps>) {
  const { t } = useLanguage();
  const [isExpandedTable, setIsExpandedTable] = useState(true);

  return (
    <div className="rounded border border-(--color-filters-border) bg-white">
      <button
        onClick={() => setIsExpandedTable(!isExpandedTable)}
        className="flex w-full cursor-pointer flex-row items-center justify-between bg-white px-4 py-2"
      >
        <h2 className="text-normal leading-3.5 font-bold text-(--color-table-header-text-color)">
          {t('documentDetail.extractedData.table')}
        </h2>
        <img src="/assets/icons/expanded-icon.svg" alt="expand" className={`h-1.5 w-3.5 ${isExpandedTable ? '' : 'rotate-180'}`} />
      </button>
      {isExpandedTable && (
        <div className="border-t border-(--color-filters-border) p-4">
          <div className="max-h-[400px] overflow-y-auto [&>div]:border">
            <DataTable
              columns={transactionColumns as never}
              data={extractedData.transactions as never[]}
              pageSize={extractedData.transactions.length || 10}
            />
          </div>
        </div>
      )}
    </div>
  );
}
