'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useSearchStore } from '@/lib/stores/search-store';
import { Heading } from '@/components/heading';
import { Filter, SELECT_TYPE } from '@/components/filter';
import { useAuditLogs, useAuditLogsFilters, useExportAuditLogs } from '@/lib/query/use-audit-logs';
import { DownloadIcon } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import Table from '@/components/table';
import { DescriptionCell } from '@/components/audit-logs/audit-logs-columns';
import { formatDate } from '@/lib/utils/helpers';

function AuditLogsPageContent() {
  const { t } = useLanguage();
  const {
    search,
    date,
    userFilter = '',
    actionTypeFilter = '',
    page,
    setSearch,
    setDate,
    setUserFilter,
    setActionTypeFilter,
    setPage,
  } = useSearchStore();

  const [pageSize, setPageSize] = useState(10);
  const exportMutation = useExportAuditLogs({
    search: search || undefined,
    date: date || undefined,
    userId: userFilter === 'all' ? undefined : userFilter,
    actionType: actionTypeFilter === 'all' ? undefined : actionTypeFilter,
  });

  // Fetch filters from API
  const { data: filter } = useAuditLogsFilters();

  // Fetch audit logs from API
  const { data: auditLogsData, isLoading } = useAuditLogs({
    page,
    pageSize,
    search: search || undefined,
    date: date || undefined,
    userId: userFilter === 'all' ? undefined : userFilter,
    actionType: actionTypeFilter === 'all' ? undefined : actionTypeFilter,
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
        id: 'timestamp',
        header: t('auditLogs.table.timestamp'),
        accessorKey: 'timestamp',
        cell: (row: any) => <div className="text-nowrap">{formatDate(row.timestamp)}</div>,
      },
      {
        id: 'user',
        header: t('auditLogs.table.user'),
        accessorKey: 'full_name',
        cell: (row: any) => <div className="line-clamp-2 max-md:text-sm md:min-w-[150px]">{row.full_name}</div>,
      },
      {
        id: 'role',
        header: t('auditLogs.table.role'),
        accessorKey: 'role',
        cell: (row: any) => <div className="text-nowrap">{row.role}</div>,
      },
      {
        id: 'action_type',
        header: t('auditLogs.table.actionType'),
        accessorKey: 'action_type',
        cell: (row: any) => <div className="text-nowrap">{row.action_type}</div>,
      },
      {
        id: 'description',
        header: t('auditLogs.table.description'),
        accessorKey: 'description',
        cell: (row: any) => <DescriptionCell description={row.description} actionType={row.action_type} t={t} />,
      },
      {
        id: 'ip_address',
        header: t('auditLogs.table.ipDevice'),
        accessorKey: 'ip_address',
        cell: (row: any) => (
          <div className="text-nowrap">
            {row.ip_address} / {row.user_agent}
          </div>
        ),
      },
    ];
  }, [t]);

  const handleExport = () => {
    exportMutation.mutateAsync(undefined, {
      onSuccess: () => {
        toast.success(t('auditLogs.exportSuccess'));
      },
      onError: (error) => {
        const errorMessage = error instanceof Error ? error.message : t('auditLogs.exportFailed');
        toast.error(errorMessage);
      },
    });
  };

  const dataMap = useMemo(() => {
    return [...(auditLogsData?.logs ?? [])].map((x, index) => ({
      ...x,
      index: index + 1,
    }));
  }, [auditLogsData]);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden rounded bg-(--color-background-color) shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
      <div className="mb-4">
        <Heading
          title={t('sidebar.auditLogs')}
          subTitle={t('auditLogs.subTitle')}
          actions={[
            {
              title: exportMutation.isPending ? t('auditLogs.exporting') : t('auditLogs.export'),
              onClick: handleExport,
              isLoading: exportMutation.isPending,
              icon: <DownloadIcon className="size-4" />,
            },
          ]}
        />
      </div>

      <div className="px-2 md:px-6">
        <Filter
          search={{
            name: 'search',
            placeholder: t('dataTable.search'),
            value: search,
          }}
          selects={[
            {
              type: SELECT_TYPE.DATE,
              name: 'date',
              placeholder: t('auditLogs.filters.date'),
              value: date || '',
              isClearable: true,
            },
            {
              type: SELECT_TYPE.SELECT,
              name: 'userFilter',
              placeholder: t('auditLogs.filters.user'),
              options: (filter?.users ?? []).map((user) => ({
                label: user.full_name,
                value: user.id,
              })),
              value: userFilter,
            },
            {
              type: SELECT_TYPE.SELECT,
              name: 'actionTypeFilter',
              placeholder: t('auditLogs.filters.actionType'),
              options: filter?.action_types,
              value: actionTypeFilter,
            },
          ]}
          onFilterChange={(data) => {
            if (data.name === 'search') {
              setSearch(data.value);
            } else if (data.name === 'date') {
              setDate(data.value);
            } else if (data.name === 'userFilter') {
              setUserFilter(data.value);
            } else if (data.name === 'actionTypeFilter') {
              setActionTypeFilter(data.value);
            }
          }}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-2 md:px-6">
        <Table
          loading={isLoading}
          columns={columns}
          stickyHeader={true}
          data={dataMap}
          noDataMessage={t('dataTable.noResults')}
          pagination={{
            page,
            pageSize,
            pageCount: auditLogsData?.total_pages ?? 0,
            totalItems: auditLogsData?.total ?? 0,
            onPageChange: setPage,
            setPageSize: setPageSize,
          }}
        />
      </div>
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <AppLayout>
      <AuditLogsPageContent />
    </AppLayout>
  );
}
