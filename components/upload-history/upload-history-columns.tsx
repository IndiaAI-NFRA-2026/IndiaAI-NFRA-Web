'use client';

import { Status } from '@/components/ui/status';
import { formatDate } from '@/lib/utils/helpers';
import type { Document } from '@/types/documents';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ColumnOptions {
  isProcessingTable?: boolean;
  onRetry?: (document: Document) => void;
  onDelete?: (document: Document) => void;
}

/**
 * Format error message for better display in tooltip
 * Parses JSON if present and formats it nicely
 */
function formatErrorMessage(errorMessage: string): React.ReactNode {
  if (!errorMessage) return null;

  // Try to extract and parse JSON from error message
  const jsonStartIndex = errorMessage.indexOf('{');

  if (jsonStartIndex === -1) {
    // No JSON found, return original message
    return (
      <div className="text-left">
        <div className="text-sm wrap-break-word whitespace-pre-wrap">{errorMessage}</div>
      </div>
    );
  }

  try {
    const jsonPart = errorMessage.substring(jsonStartIndex);
    const parsed = JSON.parse(jsonPart);

    // Only show the error message from JSON if available
    if (parsed.error) {
      return (
        <div className="text-left">
          <div className="text-sm wrap-break-word whitespace-pre-wrap">{parsed.error}</div>
        </div>
      );
    }
  } catch (error) {
    // If JSON parsing fails, return original message
    console.error('Error parsing error message JSON:', error);
    return (
      <div className="text-left">
        <div className="text-sm wrap-break-word whitespace-pre-wrap">{errorMessage}</div>
      </div>
    );
  }

  // Fallback: return original message
  return (
    <div className="text-left">
      <div className="text-sm wrap-break-word whitespace-pre-wrap">{errorMessage}</div>
    </div>
  );
}

export function getUploadedHistoryColumns(t: (key: string) => string, options: ColumnOptions = {}) {
  const { isProcessingTable = false, onRetry, onDelete } = options;

  const columns: any[] = [
    {
      id: 'index',
      header: '#',
      cell: ({ row }: any) => row.index + 1,
    },

    {
      accessorKey: 'fileName',
      header: t('uploadedHistory.table.fileName'),
      cell: ({ row }: { row: { original: Document } }) => (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[400px] truncate">{row.original.fileName ?? '-'}</div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="max-w-[400px] wrap-break-word">{row.original.fileName ?? '-'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },

    {
      accessorKey: 'status',
      header: t('uploadedHistory.table.status'),
      cell: ({ row }: { row: { original: Document } }) => {
        const document = row.original;
        const statusComponent = <Status status={document.status.toLowerCase()} />;

        // Show tooltip with error message if available
        if (document.errorMessage) {
          return (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger className="cursor-pointer">{statusComponent}</TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[400px]">
                  <div className="max-h-[300px] overflow-y-auto">{formatErrorMessage(document.errorMessage)}</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return statusComponent;
      },
    },
  ];

  if (!isProcessingTable) {
    columns.push({
      accessorKey: 'type',
      header: t('uploadedHistory.table.documentType'),
    });
  }

  columns.push(
    {
      accessorKey: 'uploadDate',
      header: t('uploadedHistory.table.dateUpload'),
      cell: ({ row }: { row: { original: Document } }) => formatDate(row.original.uploadDate),
    },
    {
      id: 'actions',
      header: t('uploadedHistory.table.action'),
      cell: ({ row }: { row: { original: Document } }) => (
        <div className="flex items-center gap-4">
          {(row.original.status === 'approved' || row.original.status === 'review') && (
            <button className="cursor-pointer">
              <img src="/assets/icons/eye-icon.svg" alt="view" className="h-4 w-4" />
            </button>
          )}
          {row.original.status === 'failed' && onRetry && (
            <button onClick={() => onRetry(row.original)} className="cursor-pointer hover:opacity-70" title={t('common.retry')}>
              <img src="/assets/icons/reload-icon.svg" alt="reload" className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(row.original)}
              className="cursor-pointer hover:opacity-70"
              title={t('uploadedHistory.menu.delete')}
            >
              <img src="/assets/icons/trash-icon.svg" alt="delete" className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    }
  );

  return columns;
}
