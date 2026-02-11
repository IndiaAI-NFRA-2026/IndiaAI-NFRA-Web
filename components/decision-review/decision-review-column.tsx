'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { formatDate } from '@/lib/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface DecisionReviewDocument {
  id: number | string;
  fileName: string;
  aiDecision: 'Strong' | 'Medium' | 'Weak';
  humanDecision: 'Strong' | 'Medium' | 'Weak';
  overriddenBy?: string;
  overriddenAt?: string;
}

interface ColumnOptions {
  onView?: (document: DecisionReviewDocument) => void;
  page?: number;
  pageSize?: number;
}

function DecisionBadge({ decision }: Readonly<{ decision: string }>) {
  let className = '';
  let label = decision;

  switch (decision) {
    case 'Strong':
      className =
        'border-(--color-decision-recommended-border-color) bg-(--color-decision-recommended-background-color) text-(--color-decision-recommended-text-color)';
      break;
    case 'Medium':
      className =
        'border-(--color-decision-recommended-with-conditions-border-color) bg-(--color-decision-recommended-with-conditions-background-color) text-(--color-decision-recommended-with-conditions-text-color)';
      break;
    case 'Weak':
      className =
        'border-(--color-decision-not-recommended-border-color) bg-(--color-decision-not-recommended-background-color) text-(--color-decision-not-recommended-text-color)';
      break;
    default:
      className =
        'border-(--color-decision-not-recommended-border-color) bg-(--color-decision-not-recommended-background-color) text-(--color-decision-not-recommended-text-color)';
  }

  return (
    <Badge variant="outline" className={cn('rounded px-2 py-0.5 text-xs font-normal', className)}>
      {label}
    </Badge>
  );
}

export function getDecisionReviewColumns(t: (key: string) => string, options: ColumnOptions = {}): ColumnDef<DecisionReviewDocument>[] {
  const { onView, page = 1, pageSize = 10 } = options;

  return [
    {
      id: 'index',
      header: '#',
      size: 60,
      cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
    },
    {
      accessorKey: 'fileName',
      header: t('decisionReview.table.fileName'),
      size: 300,
      cell: ({ row }) => {
        const fileName = row.original.fileName ?? '-';
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[400px] truncate">{fileName}</div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="max-w-[400px] wrap-break-word">{fileName}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: 'aiDecision',
      header: t('decisionReview.table.aiDecision'),
      size: 150,
      cell: ({ row }) => (
        <div className="min-w-[126px]">
          <DecisionBadge decision={row.original.aiDecision} />
        </div>
      ),
    },
    {
      accessorKey: 'humanDecision',
      header: t('decisionReview.table.humanDecision'),
      size: 150,
      cell: ({ row }) => <DecisionBadge decision={row.original.humanDecision} />,
    },
    {
      accessorKey: 'overriddenBy',
      header: t('decisionReview.table.overriddenBy'),
      size: 150,
      cell: ({ row }) => row.original.overriddenBy || '-',
    },
    {
      accessorKey: 'overriddenAt',
      header: t('decisionReview.table.overriddenAt'),
      size: 150,
      cell: ({ row }) => (row.original.overriddenAt ? formatDate(row.original.overriddenAt) : '-'),
    },
    {
      id: 'actions',
      header: t('decisionReview.table.action'),
      size: 60,
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          {onView && (
            <button onClick={() => onView(row.original)} className="cursor-pointer hover:opacity-70" title={t('decisionReview.table.view')}>
              <img src="/assets/icons/eye-icon.svg" alt="view" className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];
}
