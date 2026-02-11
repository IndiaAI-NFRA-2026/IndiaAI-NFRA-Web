/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { Filter, SELECT_TYPE } from '@/components/filter';
import { Spinner } from '@/components/ui/spinner';
import { Heading } from '@/components/heading';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate, getTagSeverity, snakeToCamel } from '@/lib/utils/helpers';
import { useSearchStore } from '@/lib/stores/search-store';
import { useRetentionDocuments } from '@/lib/query/use-retention-documents';
import { DocumentType } from '@/enums/document-type';
import type { RetentionDocument, RetentionUser } from '@/types/retention-policy';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/layout/app-layout';
import Card from '@/components/card';
import Table from '@/components/table';
import Tag from '@/components/tag';

interface DocumentRetentionFilters {
  search: string;
  type: string;
  uploadedById: string; // Stores user ID
  daysRemaining: string;
}

const getDaysRemainingColor = (days: number): string => {
  if (days <= 30) return 'text-red-600';
  if (days <= 90) return 'text-yellow-600';
  return 'text-foreground';
};

const FileNameCell = ({ fileName }: Readonly<{ fileName: string }>) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="max-w-[200px] truncate">{fileName}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="max-w-[300px] wrap-break-word">{fileName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const DaysRemainingCell = ({ days, t }: Readonly<{ days: number; t: (key: string) => string }>) => {
  const color = getDaysRemainingColor(days);
  return (
    <span className={color}>
      {days} {days < 2 ? t('common.day') : t('common.days')}
    </span>
  );
};

const UploadedByCell = ({ uploadedBy }: Readonly<{ uploadedBy: string | null | undefined }>) => {
  if (!uploadedBy) return <span className="text-sm text-(--color-sidebar-foreground)">-</span>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="max-w-[80px] cursor-default truncate text-sm text-(--color-sidebar-foreground)">{uploadedBy}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="w-full">{uploadedBy}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const VendorNameCell = ({ vendorName }: Readonly<{ vendorName: string | null | undefined }>) => {
  if (!vendorName) return <span className="text-sm text-(--color-sidebar-foreground)">-</span>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="max-w-[300px] cursor-default truncate text-sm text-(--color-sidebar-foreground)">{vendorName}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="w-full">{vendorName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const DocumentRetentionAlert = ({
  className,
  uploadedDays,
  derivedDays,
}: {
  className?: string;
  uploadedDays?: number;
  derivedDays?: number;
}) => {
  const { t } = useLanguage();

  return (
    <div role="alert" className={cn('relative w-full rounded-[4px] border border-[#dddddd] bg-(--alert-info-background) p-4', className)}>
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-(--alert-info-icon)" />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-(--alert-info-foreground)">
            <span className="text-[15px] font-semibold">{t('documentRetention.policy.title')}</span>{' '}
            <span className="text-[13px] text-(--alert-info-foreground)">
              {t('documentRetention.policy.description', {
                uploadedDays: uploadedDays ?? 0,
                derivedDays: derivedDays ?? 0,
              })}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

function DocumentRetentionContent() {
  const { t } = useLanguage();
  const { search, type: storeType, page, setSearch, setType, setPage } = useSearchStore();

  // Local state for page size - independent for this page
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState<DocumentRetentionFilters>({
    search: '',
    type: '',
    uploadedById: '',
    daysRemaining: '',
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.type, filters.uploadedById, filters.daysRemaining, setPage]);

  // Reset filters when component mounts
  useEffect(() => {
    setSearch('');
    setType('');
    setPage(1);
  }, []);

  // Fetch documents using retention documents hook
  const { data: retentionDocumentsData, isLoading } = useRetentionDocuments({
    page,
    pageSize,
    search: filters.search || search || undefined,
    documentType: filters.type ? filters.type : undefined,
    uploadedById: filters.uploadedById ? filters.uploadedById : undefined,
    daysRemaining: filters.daysRemaining ? filters.daysRemaining : undefined,
  });

  const columns = useMemo(() => {
    return [
      {
        id: 'index',
        header: '#',
        accessorKey: 'index',
        cell: (row: any) => row.index,
      },
      {
        id: 'vendor_name',
        header: t('documentRetention.table.vendorName'),
        accessorKey: 'vendor_name',
        cell: (row: any) => <div className="text-nowrap">{row.vendor_name}</div>,
      },
      {
        id: 'file_name',
        header: t('documentRetention.table.fileName'),
        accessorKey: 'file_name',
        cell: (row: any) => <div className="text-nowrap">{row.file_name}</div>,
      },
      {
        id: 'document_type',
        header: t('documentRetention.table.documentType'),
        accessorKey: 'document_type',
        cell: (row: any) => <Tag label={row.document_type} severity={getTagSeverity(row.document_type)} />,
      },
      {
        id: 'uploaded_by',
        header: t('documentRetention.table.uploadedBy'),
        accessorKey: 'uploaded_by',
        cell: (row: any) => <div className="text-nowrap">{row.uploaded_by}</div>,
      },
      {
        id: 'date_upload',
        header: t('documentRetention.table.dateUpload'),
        accessorKey: 'date_upload',
        cell: (row: any) => <div className="text-nowrap">{formatDate(row.date_upload, false)}</div>,
      },
      {
        id: 'auto_deletion_schedule',
        header: t('documentRetention.table.autoDeletionSchedule'),
        accessorKey: 'auto_deletion_schedule',
        cell: (row: any) => <div className="text-nowrap">{formatDate(row.auto_deletion_schedule, false)}</div>,
      },
      {
        id: 'days_remaining',
        header: t('documentRetention.table.daysRemaining'),
        accessorKey: 'days_remaining',
        cell: (row: any) => <DaysRemainingCell days={row.days_remaining} t={t} />,
      },
    ];
  }, [t]);

  const uploadedByOptions = useMemo(() => {
    if (retentionDocumentsData?.users && retentionDocumentsData.users.length > 0) {
      return retentionDocumentsData.users
        .map((user: RetentionUser) => ({
          id: user.id,
          name: user.full_name || user.username,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    const uniqueMap = new Map<string, { id: string; name: string }>();
    for (const doc of retentionDocumentsData?.documents || []) {
      if (doc.uploaded_by_id && doc.uploaded_by) {
        uniqueMap.set(doc.uploaded_by_id, { id: doc.uploaded_by_id, name: doc.uploaded_by });
      }
    }
    return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [retentionDocumentsData?.users, retentionDocumentsData?.documents]);

  const dataMap = useMemo(() => {
    return retentionDocumentsData?.documents?.map((doc, index) => ({
      index: index + 1,
      ...doc,
    }));
  }, [retentionDocumentsData?.documents]);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden rounded bg-(--color-background-color) shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
      <Heading title={t('sidebar.documentRetention')} subTitle={t('documentRetention.subTitle')} />

      <div className="px-2 md:px-6">
        <DocumentRetentionAlert
          uploadedDays={retentionDocumentsData?.uploaded_documents_retention_days}
          derivedDays={retentionDocumentsData?.derived_data_retention_days}
        />
      </div>

      <div className="px-2 md:px-6">
        <Filter
          search={{
            name: 'search',
            placeholder: t('documentRetention.filters.searchPlaceholder'),
            value: filters.search || search,
          }}
          selects={[
            {
              type: SELECT_TYPE.SELECT,
              name: 'type',
              placeholder: t('documentRetention.filters.documentType'),
              options: [
                { label: t('documentRetention.filters.all'), value: 'all' },
                { label: t('documentDetail.documentType.uploaded'), value: DocumentType.UPLOADED },
                {
                  label: t('uploadedHistory.documentType.financialStatement'),
                  value: DocumentType.FINANCIAL_STATEMENT,
                },
                {
                  label: t('uploadedHistory.documentType.bankStatement'),
                  value: DocumentType.BANK_STATEMENT,
                },
                {
                  label: t('documentDetail.documentType.consolidatedAnalyze'),
                  value: DocumentType.CONSOLIDATED_ANALYZE,
                },
                {
                  label: t('documentDetail.documentType.combinedAnalyze'),
                  value: DocumentType.COMBINED_ANALYZE,
                },
              ],
              value: filters.type || storeType,
            },
            {
              type: SELECT_TYPE.SELECT,
              name: 'uploadedBy',
              placeholder: t('documentRetention.filters.uploadedBy'),
              options: [...uploadedByOptions.map((user) => ({ label: user.name, value: user.id }))],
              value: filters.uploadedById,
            },
            {
              type: SELECT_TYPE.SELECT,
              name: 'daysRemaining',
              placeholder: t('documentRetention.filters.daysRemaining'),
              options: [
                { label: t('documentRetention.filters.expiringVerySoon'), value: 'expiring_very_soon' },
                { label: t('documentRetention.filters.expiringSoon'), value: 'expiring_soon' },
                { label: t('documentRetention.filters.safe'), value: 'safe' },
              ],
              value: filters.daysRemaining,
            },
          ]}
          onFilterChange={(data) => {
            if (data.name === 'search') {
              setFilters({ ...filters, search: data.value });
              setSearch(data.value);
            } else if (data.name === 'type') {
              setFilters({ ...filters, type: data.value });
              setType(data.value);
            } else if (data.name === 'uploadedBy') {
              setFilters({ ...filters, uploadedById: data.value });
            } else if (data.name === 'daysRemaining') {
              setFilters({ ...filters, daysRemaining: data.value });
            }
          }}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-2 md:px-6">
        <Table
          columns={columns}
          data={dataMap ?? []}
          stickyHeader={true}
          noDataMessage={t('documentRetention.noDataMessage')}
          pagination={{
            pageSize: pageSize,
            page: page,
            pageCount: retentionDocumentsData?.total_pages || 0,
            totalItems: retentionDocumentsData?.total || 0,
            onPageChange: (page) => setPage(page),
            setPageSize: setPageSize,
          }}
        />
      </div>
    </div>
  );
}

export default function DocumentRetentionPage() {
  return (
    <AppLayout>
      <DocumentRetentionContent />
    </AppLayout>
  );
}
