'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { formatCurrency, formatDate } from '@/lib/utils/helpers';
import { FlagBadge, StatusIndicator } from './fraud-status-badges';
import { BankTransaction } from '@/types/analysis';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface FraudTransaction extends BankTransaction {
  flag?: string;
  status?: 'false_positive' | 'fraud' | '';
  fraud_transaction_id?: string;
  reason?: string;
  confirm_by?: string;
  id?: string;
  updated_by_name?: string;
}

interface ColumnOptions {
  onView?: (transaction: FraudTransaction) => void;
  page?: number;
  pageSize?: number;
}

export function getFraudTransactionColumns(t: (key: string) => string, options: ColumnOptions = {}): ColumnDef<FraudTransaction>[] {
  const { onView } = options;

  return [
    {
      accessorKey: 'txn_id',
      header: t('fraudAnomaly.detail.txnId') || 'TXN ID',
      cell: ({ row }) => {
        const value = row.original.txn_id?.value;
        return <span className="text-sm text-(--color-sidebar-foreground)">{value || '-'}</span>;
      },
    },
    {
      accessorKey: 'date',
      header: t('fraudAnomaly.detail.date') || 'Date',
      cell: ({ row }) => {
        const value = row.original.date?.value;
        let dateValue: string | null = null;
        if (typeof value === 'string') {
          dateValue = value;
        } else if (value) {
          dateValue = String(value);
        }
        return <span className="text-sm text-(--color-sidebar-foreground)">{dateValue ? formatDate(dateValue) : '-'}</span>;
      },
    },
    {
      accessorKey: 'description',
      header: t('fraudAnomaly.detail.description') || 'Description',
      cell: ({ row }) => {
        const value = row.original.description?.value;
        return <span className="text-sm text-(--color-sidebar-foreground)">{value || '-'}</span>;
      },
    },
    {
      accessorKey: 'debit',
      header: t('fraudAnomaly.detail.debit') || 'Debit',
      cell: ({ row }) => {
        const value = row.original.debit?.value;
        return <span className="text-sm text-(--color-sidebar-foreground)">{value || ''}</span>;
      },
    },
    {
      accessorKey: 'credit',
      header: t('fraudAnomaly.detail.credit') || 'Credit',
      cell: ({ row }) => {
        const value = row.original.credit?.value;
        return <span className="text-sm text-(--color-sidebar-foreground)">{value || ''}</span>;
      },
    },
    {
      accessorKey: 'flag',
      header: t('fraudAnomaly.detail.flag') || 'Flag',
      cell: ({ row }) => {
        const transaction = row.original;
        return <FlagBadge flag={transaction.flag} />;
      },
    },
    {
      accessorKey: 'status',
      header: t('fraudAnomaly.detail.status') || 'Status',
      cell: ({ row }) => {
        const transaction = row.original;
        return <StatusIndicator status={transaction.status} />;
      },
    },
    {
      id: 'actions',
      header: t('fraudAnomaly.detail.action') || 'Action',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          {onView && (
            <button
              onClick={() => onView(row.original)}
              className="cursor-pointer hover:opacity-70"
              title={t('fraudAnomaly.detail.view') || 'View details'}
            >
              <img src="/assets/icons/eye-icon.svg" alt="view" className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];
}

export function getFraudAnomalyTransactionColumns(t: (key: string) => string, options: ColumnOptions = {}): ColumnDef<any>[] {
  const { onView } = options;

  return [
    {
      accessorKey: 'txn_id',
      header: t('fraudAnomaly.detail.txnId') || 'TXN ID',
      cell: ({ row }) => {
        const value = row.original.txn_id;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[200px] truncate">{value}</div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="max-w-[200px] break-words">{value}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: 'date',
      header: t('fraudAnomaly.detail.date') || 'Date',
      cell: ({ row }) => {
        const value = row.original.date;
        let dateValue: string | null = null;
        if (typeof value === 'string') {
          dateValue = value;
        } else if (value) {
          dateValue = String(value);
        }
        return <span className="text-sm text-(--color-sidebar-foreground)">{dateValue ? formatDate(dateValue) : ''}</span>;
      },
    },
    {
      accessorKey: 'description',
      header: t('fraudAnomaly.detail.description') || 'Description',
      cell: ({ row }) => {
        const value = row.original.description;
        return <span className="text-sm text-(--color-sidebar-foreground)">{value}</span>;
      },
    },
    {
      accessorKey: 'debit',
      header: t('fraudAnomaly.detail.debit') || 'Debit',
      cell: ({ row }) => {
        const value = row.original.debit ? formatCurrency(row.original.debit) : '';
        return <span className="text-sm text-(--color-sidebar-foreground)">{value}</span>;
      },
    },
    {
      accessorKey: 'credit',
      header: t('fraudAnomaly.detail.credit') || 'Credit',
      cell: ({ row }) => {
        const value = row.original.credit ? formatCurrency(row.original.credit) : '';
        return <span className="text-sm text-(--color-sidebar-foreground)">{value}</span>;
      },
    },
    {
      accessorKey: 'flag',
      header: t('fraudAnomaly.detail.flag') || 'Flag',
      cell: ({ row }) => {
        const transaction = row.original;
        return <FlagBadge flag={transaction.flag} />;
      },
    },
    {
      accessorKey: 'status',
      header: t('fraudAnomaly.detail.status') || 'Status',
      cell: ({ row }) => {
        const transaction = row.original;
        return <StatusIndicator status={transaction.status} />;
      },
    },
    {
      id: 'actions',
      header: t('fraudAnomaly.detail.action') || 'Action',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          {onView && (
            <button
              onClick={() => onView(row.original)}
              className="cursor-pointer hover:opacity-70"
              title={t('fraudAnomaly.detail.view') || 'View details'}
            >
              <img src="/assets/icons/eye-icon.svg" alt="view" className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];
}
