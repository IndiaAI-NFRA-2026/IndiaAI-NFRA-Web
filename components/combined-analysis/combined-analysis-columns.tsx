'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate } from '@/lib/utils/helpers';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export interface CombinedAnalysisDocument {
  id: number | string;
  fileName: string;
  type: string;
  period: string;
  uploadedBy: string;
  dateUpload: string;
  is_uploader?: boolean;
}

export interface CombinedAnalysisResult {
  id: number | string;
  fileName: string;
  overallResult: 'Strong' | 'Medium' | 'Weak' | null | undefined;
  fyPeriod: string;
  createdBy: string;
  createdDate: string;
}

interface ColumnOptions {
  onView?: (document: CombinedAnalysisDocument | CombinedAnalysisResult) => void;
  onDelete?: (document: CombinedAnalysisDocument | CombinedAnalysisResult) => void;
  page?: number;
  pageSize?: number;
  isComplianceOfficer?: boolean;
}

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// FileName cell component
const FileNameCell = ({ fileName }: Readonly<{ fileName: string }>) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="max-w-[400px] truncate">{fileName}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="max-w-[300px] break-words">{fileName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Status badge component for Overall Result
export function OverallResultBadge({ result }: Readonly<{ result: string | null | undefined }>) {
  // Return null if result is empty/null/undefined
  if (!result || result.trim() === '') {
    return null;
  }

  // Lowercase before checking
  const normalizedResult = result.toLowerCase().trim();

  const getBadgeStyle = (): string => {
    switch (normalizedResult) {
      case 'strong':
        return 'border-(--color-decision-strong-border-color) bg-(--color-decision-strong-background-color) text-(--color-decision-strong-text-color)';
      case 'medium':
      case 'moderate': // Support both medium and moderate
        return 'border-(--color-decision-medium-border-color) bg-(--color-decision-medium-background-color) text-(--color-decision-medium-text-color)';
      case 'weak':
        return 'border-(--color-decision-weak-border-color) bg-(--color-decision-weak-background-color) text-(--color-decision-weak-text-color)';
      default:
        return 'border-gray-300 bg-gray-100 text-gray-800';
    }
  };

  // Normalize display text: capitalize first letter
  const getDisplayText = (): string => {
    switch (normalizedResult) {
      case 'strong':
        return 'Strong';
      case 'medium':
      case 'moderate':
        return 'Medium';
      case 'weak':
        return 'Weak';
      default:
        return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
    }
  };

  return (
    <Badge variant="outline" className={cn('rounded px-2.5 py-0.5 text-xs font-medium', getBadgeStyle())}>
      {getDisplayText()}
    </Badge>
  );
}

export function getCombinedAnalysisDocumentColumns(
  t: (key: string) => string,
  options: ColumnOptions = {}
): ColumnDef<CombinedAnalysisDocument>[] {
  const { onView, onDelete, page = 1, pageSize = 10 } = options;

  return [
    {
      id: 'index',
      header: '#',
      cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
    },
    {
      accessorKey: 'fileName',
      header: t('uploadedHistory.table.fileName') || 'File name',
      cell: ({ row }) => {
        const fileName = row.original.fileName ?? '-';
        return <FileNameCell fileName={fileName} />;
      },
    },
    {
      accessorKey: 'type',
      header: t('uploadedHistory.table.documentType') || 'Type',
      cell: ({ row }) => {
        const type = row.original.type || '-';
        const camelCaseType = type.toLowerCase().replaceAll(/_([a-z])/g, (_, c) => c.toUpperCase());
        return type ? t(`documentDetail.documentType.${camelCaseType}`) || type : '-';
      },
    },
    {
      accessorKey: 'period',
      header: t('uploadedHistory.table.fyPeriod') || 'FY/Period',
      cell: ({ row }) => {
        const period = row.original?.period;
        if (!period) return '-';

        try {
          const parsedDate = dayjs(period, 'DD-MM-YYYY', true);
          if (parsedDate.isValid()) {
            return parsedDate.format('YYYY');
          }
          const fallbackDate = dayjs(period);
          if (fallbackDate.isValid()) {
            return fallbackDate.format('YYYY');
          }
          return period;
        } catch {
          return period || '-';
        }
      },
    },
    {
      accessorKey: 'uploadedBy',
      header: t('uploadedHistory.table.uploadedBy') || 'Uploaded by',
      cell: ({ row }) => row.original.uploadedBy || '-',
    },
    {
      accessorKey: 'dateUpload',
      header: t('uploadedHistory.table.dateUpload') || 'Date Upload',
      cell: ({ row }) => (row.original.dateUpload ? dayjs(row.original.dateUpload).format('YYYY-MM-DD') : '-'),
    },
    {
      id: 'actions',
      header: t('uploadedHistory.table.action') || 'Action',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          {onView && (
            <button
              onClick={() => onView(row.original)}
              className="cursor-pointer hover:opacity-70"
              title={t('uploadedHistory.menu.view') || 'View'}
            >
              <img src="/assets/icons/eye-icon.svg" alt="view" className="h-4 w-4" />
            </button>
          )}
          {onDelete && row.original.is_uploader && (
            <button
              onClick={() => onDelete(row.original)}
              className="cursor-pointer hover:opacity-70"
              title={t('uploadedHistory.menu.delete') || 'Delete'}
            >
              <img src="/assets/icons/trash-icon.svg" alt="delete" className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];
}

export function getCombinedAnalysisResultColumns(
  t: (key: string) => string,
  options: ColumnOptions = {}
): ColumnDef<CombinedAnalysisResult>[] {
  const { onView, onDelete, page = 1, pageSize = 10, isComplianceOfficer } = options;

  return [
    {
      id: 'index',
      header: '#',
      cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
    },
    {
      accessorKey: 'fileName',
      header: t('uploadedHistory.table.fileName') || 'File name',
      cell: ({ row }) => {
        const fileName = row.original.fileName ?? '-';
        return <FileNameCell fileName={fileName} />;
      },
    },
    {
      accessorKey: 'overallResult',
      header: t('combinedAnalysis.overallResult') || 'Overall Result',
      cell: ({ row }) => {
        const overallResult = row.original.overallResult;
        // Return null or empty if result is null/undefined/empty
        if (!overallResult) {
          return null;
        }
        return <OverallResultBadge result={overallResult} />;
      },
    },
    {
      accessorKey: 'fyPeriod',
      header: t('uploadedHistory.table.fyPeriod') || 'FY/Period',
      cell: ({ row }) => row.original.fyPeriod || '-',
    },
    {
      accessorKey: 'createdBy',
      header: t('combinedAnalysis.createdBy') || 'Created By',
      cell: ({ row }) => row.original.createdBy || '-',
    },
    {
      accessorKey: 'createdDate',
      header: t('combinedAnalysis.createdDate') || 'Created Date',
      cell: ({ row }) => formatDate(row.original.createdDate),
    },
    {
      id: 'actions',
      header: t('uploadedHistory.table.action') || 'Action',
      cell: ({ row }) => {
        const overallResult = row.original.overallResult;
        const isViewDisabled = overallResult === null || overallResult === undefined; // Disable view button if overallResult is null/undefined/empty

        return (
          <div className="flex items-center gap-4">
            {onView && (
              <button
                onClick={() => !isViewDisabled && onView(row.original)}
                disabled={isViewDisabled}
                className={isViewDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-70'}
                title={
                  isViewDisabled
                    ? t('uploadedHistory.menu.viewDisabled') || 'View (not available)'
                    : t('uploadedHistory.menu.view') || 'View'
                }
              >
                <img src="/assets/icons/eye-icon.svg" alt="view" className="h-4 w-4" />
              </button>
            )}
            {onDelete && !isComplianceOfficer && (
              <button
                onClick={() => onDelete(row.original)}
                className="cursor-pointer hover:opacity-70"
                title={t('uploadedHistory.menu.delete') || 'Delete'}
              >
                <img src="/assets/icons/trash-icon.svg" alt="delete" className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];
}
