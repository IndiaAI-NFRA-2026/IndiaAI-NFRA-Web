'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';
import { Heading } from '@/components/heading';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DocumentType } from '@/enums/document-type';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { VendorDocumentsApiResponse } from '@/types/documents';
import Table from '@/components/table';
import { Filter, SELECT_TYPE } from '@/components/filter';
import Tag from '@/components/tag';
import { DocumentStatus } from '@/enums';
import { formatDate, getTagSeverity } from '@/lib/utils/helpers';
import { useOptionsMultiLanguages } from '@/components/hook/use-options';
import { Button } from '@/components/button';
import { ArrowRightIcon, EyeIcon, PlusCircleIcon, TrashIcon } from 'lucide-react';
import { ROUTERS } from '@/constants/routers';
import Card from '@/components/card';
import { toast } from 'sonner';
import { Modal } from '@/components/modal';
import { ConsolidatedAnalysisApiResponse } from '@/types/analysis';
import { ConsolidatedAnalysisDocument } from '@/types/financial-statement';
import { useMe } from '@/lib/query/use-auth';
import { USER_ROLE } from '@/enums/auth';

interface AnalysisComponentProps {
  type: DocumentType;
  noDataMessage?: string;
}

const FinancialAndBankAnalysisComponent = ({ type, noDataMessage }: AnalysisComponentProps) => {
  const { t } = useLanguage();
  const params = useParams();
  const vendorName = decodeURIComponent(params.vendor as string);
  const { documentStatusOptions } = useOptionsMultiLanguages();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [consolidatedPage, setConsolidatedPage] = useState(1);
  const [consolidatedPageSize, setConsolidatedPageSize] = useState(10);
  const [isModalConfirmConsolidatedAnalysis, setIsModalConfirmConsolidatedAnalysis] = useState(false);
  const [isConfirmDeleteFinancialStatementAnalysis, setIsConfirmDeleteFinancialStatementAnalysis] = useState(false);
  const [selectedFinancialStatementAnalysis, setSelectedFinancialStatementAnalysis] = useState<ConsolidatedAnalysisDocument | null>(null);
  const [selectedConsolidatedAnalysis, setSelectedConsolidatedAnalysis] = useState<ConsolidatedAnalysisDocument | null>(null);
  const [isConfirmDeleteConsolidatedAnalysis, setIsConfirmDeleteConsolidatedAnalysis] = useState(false);
  const [fy, setFy] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const { data: user } = useMe();
  const columns = useMemo(() => {
    return [
      {
        id: 'index',
        header: '#',
        accessorKey: 'index',
        cell: (row: any) => row.index,
      },
      {
        id: 'period',
        header: t('uploadedHistory.table.fyPeriod'),
        accessorKey: 'period',
        cell: (row: any) => <div className="line-clamp-2 min-w-[150px] max-md:text-sm">{row.period}</div>,
      },
      {
        id: 'uploadedBy',
        header: t('uploadedHistory.table.uploadedBy'),
        accessorKey: 'created_by',
        cell: (row: any) => <div className="line-clamp-2 min-w-[150px] max-md:text-sm">{row.created_by}</div>,
      },
      {
        id: 'dateUpload',
        header: t('uploadedHistory.table.dateUpload'),
        accessorKey: 'created_at',
        cell: (row: any) => <div className="text-nowrap">{formatDate(row.created_at)}</div>,
      },
      {
        id: 'status',
        header: t('title.status'),
        accessorKey: 'status',
        cell: (row: any) => (
          <Tag
            label={documentStatusOptions.find((option) => option.value === row.status)?.label || ''}
            severity={getTagSeverity(row.status as DocumentStatus)}
            icon={
              row.status === DocumentStatus.REVIEW ? (
                <div
                  className="ml-1 cursor-pointer rounded-[4px] bg-(--primary-color) p-[2px] hover:opacity-80"
                  onClick={() => {
                    router.push(ROUTERS.REVIEW_EXTRACTION_VENDOR_ID(vendorName, row.id));
                  }}
                >
                  <ArrowRightIcon className="size-4 text-white" />
                </div>
              ) : null
            }
            iconPosition="right"
          />
        ),
      },
      {
        id: 'action',
        header: t('uploadedHistory.table.action'),
        accessorKey: 'action',
        cell: (row: any) => (
          <div className="flex items-center">
            <Button
              type="text"
              size="sm"
              icon={<EyeIcon className="size-4" />}
              onClick={() => {
                router.push(
                  type === DocumentType.BANK_STATEMENT
                    ? ROUTERS.BANK_STATEMENT_ANALYSIS_VENDOR_ID(vendorName, row.id)
                    : ROUTERS.FINANCIAL_ANALYSIS_VENDOR_ID(vendorName, row.id)
                );
              }}
            />
            {user?.role === USER_ROLE.CREDIT_OFFICER_ANALYST && (
              <Button
                type="text"
                size="sm"
                icon={<TrashIcon className="size-4" />}
                onClick={() => {
                  setSelectedFinancialStatementAnalysis(row);
                  setIsConfirmDeleteFinancialStatementAnalysis(true);
                }}
              />
            )}
          </div>
        ),
      },
    ];
  }, [t, documentStatusOptions, vendorName, router, type, user]);

  const consolidatedAnalysisColumns = useMemo(() => {
    return [
      {
        id: 'index',
        header: '#',
        accessorKey: 'index',
        cell: (row: any) => row.index,
      },
      {
        id: 'fy_period',
        header: t('uploadedHistory.table.fyPeriod'),
        accessorKey: 'fy_period',
        cell: (row: any) => row.fy_period,
      },
      {
        id: 'created_by',
        header: t('analysis.headerCreatedBy'),
        accessorKey: 'created_by_name',
        cell: (row: any) => row.created_by_name,
      },
      {
        id: 'created_date',
        header: t('analysis.headerCreatedDate'),
        accessorKey: 'created_at',
        cell: (row: any) => formatDate(row.created_at),
      },
      {
        id: 'action',
        header: t('uploadedHistory.table.action'),
        accessorKey: 'action',
        cell: (row: any) => (
          <div className="flex items-center">
            <Button
              type="text"
              size="sm"
              icon={<EyeIcon className="size-4" />}
              onClick={() => {
                router.push(ROUTERS.CONSOLIDATED_ANALYSIS_VENDOR_ID(vendorName, row.id));
              }}
            />
            {user?.id === row.created_by && (
              <Button
                type="text"
                size="sm"
                icon={<TrashIcon className="size-4" />}
                onClick={() => {
                  setSelectedConsolidatedAnalysis(row);
                  setIsConfirmDeleteConsolidatedAnalysis(true);
                }}
              />
            )}
          </div>
        ),
      },
    ];
  }, [t, router, vendorName, user]);

  const {
    data: documentsData,
    refetch: refetchDocuments,
    isLoading: isDocumentsLoading,
  } = useQuery({
    queryKey: ['documents', 'by-vendor', vendorName, { page, pageSize, document_type: type, fy, date }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('vendor_name', vendorName);
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      params.append('document_type', type);
      if (fy) params.append('fy_period', fy);
      if (date) params.append('date_from', date + 'T00:00:00');
      if (date) params.append('date_to', date + 'T23:59:59');

      const response = await apiFetch<VendorDocumentsApiResponse>(`/documents/by-vendor?${params.toString()}`, {
        method: 'GET',
      });

      return response;
    },
    enabled: !!vendorName,
    placeholderData: keepPreviousData,
  });

  const {
    data: consolidatedAnalysisData,
    refetch: refetchConsolidatedAnalysis,
    isLoading: isConsolidatedLoading,
  } = useQuery({
    queryKey: ['/analyze', vendorName, { page: consolidatedPage, pageSize: consolidatedPageSize }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('vendor_name', vendorName);
      params.append('page', consolidatedPage.toString());
      params.append('page_size', consolidatedPageSize.toString());

      const response = await apiFetch<ConsolidatedAnalysisApiResponse>(`/analyze?${params.toString()}`, {
        method: 'GET',
      });

      return response;
    },
    enabled: !!vendorName,
    placeholderData: keepPreviousData,
  });

  const { data: filterData } = useQuery({
    queryKey: ['documents', 'by-vendor', vendorName, 'filter', type],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('vendor_name', vendorName);
      params.append('document_type', type);
      const response = await apiFetch<{ periods: string[] }>(`/documents/by-vendor/filter?${params.toString()}`, {
        method: 'GET',
      });
      return response ?? { periods: [] };
    },
    enabled: !!vendorName,
  });

  const periods = filterData?.periods ?? [];

  const handleConsolidatedAnalysis = async () => {
    setIsModalConfirmConsolidatedAnalysis(false);
    if (documentsData?.total_documents === 0) {
      toast.error('No documents available for consolidated analysis');
      return;
    }

    if (documentsData && documentsData.total_documents < 2) {
      toast.error('Please select at least 2 documents');
      return;
    }

    try {
      // Get array of document IDs
      const documentIds = documentsData?.documents.map((doc) => String(doc.id)) || [];

      const dataPayload = {
        vendor_name: vendorName,
        document_ids: documentIds,
        is_combined_all: documentsData && documentsData.total_documents >= 2,
      };

      await apiFetch<{ message: string; success: boolean }>('/analyze', {
        method: 'POST',
        body: JSON.stringify(dataPayload),
      });

      toast.success('Consolidated analysis created successfully');
      await refetchConsolidatedAnalysis();
    } catch {
      toast.error('Failed to create consolidated analysis');
    }
  };

  const handleDeleteFinancialStatementAnalysis = async () => {
    setIsConfirmDeleteFinancialStatementAnalysis(false);
    if (!selectedFinancialStatementAnalysis) return;
    try {
      await apiFetch<{ message: string; success: boolean }>(`/documents/${selectedFinancialStatementAnalysis.id}`, {
        method: 'DELETE',
      });
      toast.success('Financial statement analysis deleted successfully');
      await refetchDocuments();
      await refetchConsolidatedAnalysis();
      setSelectedFinancialStatementAnalysis(null);
    } catch {
      toast.error('Failed to delete financial statement analysis');
    }
  };

  const handleDeleteConsolidatedAnalysis = async () => {
    setIsConfirmDeleteConsolidatedAnalysis(false);
    if (!selectedConsolidatedAnalysis) return;
    try {
      await apiFetch<{ message: string; success: boolean }>(`/analyze/${selectedConsolidatedAnalysis.id}`, {
        method: 'DELETE',
      });
      toast.success('Consolidated analysis deleted successfully');
      await refetchDocuments();
      await refetchConsolidatedAnalysis();
      setSelectedConsolidatedAnalysis(null);
    } catch {
      toast.error('Failed to delete consolidated analysis');
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Filter
        actions={
          type === DocumentType.FINANCIAL_STATEMENT
            ? [
                {
                  title: t('analysis.consolidatedAnalysis'),
                  icon: <PlusCircleIcon className="size-4" />,
                  iconPosition: 'left',
                  disabled: (documentsData?.documents?.length ?? 0) < 2,
                  tooltip: t('analysis.combinedAnalysisRequiresAtLeastTwoDocuments'),
                  tooltipSide: 'top',
                  onClick: () => setIsModalConfirmConsolidatedAnalysis(true),
                },
              ]
            : []
        }
        onFilterChange={(data) => {
          if (data.name === 'fy') setFy(data.value);
          if (data.name === 'date') setDate(data.value);
          setPage(1);
        }}
        selects={[
          {
            type: SELECT_TYPE.SELECT,
            name: 'fy',
            placeholder: t('uploadedHistory.table.fyPeriod'),
            value: fy,
            options: periods.map((period) => ({ label: period, value: period })),
            className: 'w-[200px]',
            isClearable: true,
          },
          {
            type: SELECT_TYPE.DATE,
            name: 'date',
            placeholder: t('title.date'),
            value: date,
            className: 'w-[200px]',
            isClearable: true,
          },
        ]}
        className="flex justify-between"
      />
      <Table
        columns={columns}
        data={(documentsData?.documents || []).map((document, index) => ({ ...document, index: index + 1 }))}
        noDataMessage={noDataMessage}
        loading={isDocumentsLoading}
        pagination={{
          page: page,
          pageCount: documentsData?.total_pages ?? 0,
          totalItems: documentsData?.total ?? 0,
          pageSize: pageSize,
          setPageSize: setPageSize,
          onPageChange: setPage,
        }}
      />

      {type === DocumentType.FINANCIAL_STATEMENT && !!consolidatedAnalysisData?.items?.length && (
        <Card
          header={<Heading className="p-4 py-2" titleClassName="text-[14px] font-normal" title={t('analysis.consolidatedAnalysis')} />}
          contentStyle="px-4 flex-1 min-h-0 flex flex-col max-md:px-3"
        >
          <div className="relative my-4 flex-1 scroll-pt-0 overflow-x-auto overflow-y-auto max-md:my-2">
            <Table
              columns={consolidatedAnalysisColumns}
              data={(consolidatedAnalysisData?.items || []).map((document, index) => ({
                ...document,
                index: index + 1,
              }))}
              noDataMessage={t('analysis.consolidatedAnalysisNoData')}
              loading={isConsolidatedLoading}
              pagination={{
                page: consolidatedPage,
                pageCount: consolidatedAnalysisData?.total_pages ?? 0,
                totalItems: consolidatedAnalysisData?.total ?? 0,
                pageSize: consolidatedPageSize,
                setPageSize: setConsolidatedPageSize,
                onPageChange: setConsolidatedPage,
              }}
            />
          </div>
        </Card>
      )}

      <Modal
        contentClassName="max-w-[500px]"
        isOpen={isModalConfirmConsolidatedAnalysis}
        onClose={() => setIsModalConfirmConsolidatedAnalysis(false)}
        onConfirm={handleConsolidatedAnalysis}
        showCloseButton={false}
        title={t('analysis.confirmCreateConsolidated')}
        description={t('analysis.confirmCreateConsolidatedDesc')}
        confirmButtonText={t('analysis.create')}
      />

      <Modal
        contentClassName="max-w-[500px]"
        isOpen={isConfirmDeleteFinancialStatementAnalysis}
        onClose={() => setIsConfirmDeleteFinancialStatementAnalysis(false)}
        onConfirm={handleDeleteFinancialStatementAnalysis}
        showCloseButton={false}
        title={t('analysis.confirmDeleteFinancialAnalysis')}
        description={t('analysis.confirmDeleteFinancialAnalysisDesc')}
        confirmButtonText={t('button.delete')}
        confirmButtonType="danger"
      />

      <Modal
        contentClassName="max-w-[500px]"
        isOpen={isConfirmDeleteConsolidatedAnalysis}
        onClose={() => setIsConfirmDeleteConsolidatedAnalysis(false)}
        onConfirm={handleDeleteConsolidatedAnalysis}
        showCloseButton={false}
        title={t('analysis.confirmDeleteConsolidatedAnalysis')}
        description={t('analysis.confirmDeleteConsolidatedAnalysisDesc')}
        confirmButtonText={t('button.delete')}
        confirmButtonType="danger"
      />
    </div>
  );
};

export default FinancialAndBankAnalysisComponent;
